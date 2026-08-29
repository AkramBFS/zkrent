import { randomBytes } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { WebSocket } from 'ws';
import {
  type CoinPublicKey,
  DustLocalState,
  DustSecretKey,
  type EncPublicKey,
  type FinalizedTransaction,
  LedgerParameters,
  unshieldedToken,
  ZswapSecretKeys,
} from '@midnight-ntwrk/ledger-v8';
import {
  type MidnightProvider,
  type UnboundTransaction,
  type WalletProvider,
} from '@midnight-ntwrk/midnight-js-types';
import type { DefaultConfiguration, WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { WalletFacade as MidnightWalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet, type DustWalletAPI } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
  type UnshieldedKeystore,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { type EnvironmentConfiguration, WalletSeeds } from '@midnight-ntwrk/testkit-js';
import * as Rx from 'rxjs';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { Contract } from '../contracts/managed/qualification/contract/index.js';
import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

(globalThis as { WebSocket?: unknown }).WebSocket ??= WebSocket;

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info', transport: { target: 'pino-pretty' } });

const CHECKPOINT_MS = 60_000;
const DUST_WAIT_MS = 3 * 60 * 60_000;
const MIN_INCOME_REQ = BigInt(process.env.MIDNIGHT_MIN_INCOME_REQ ?? '50000');
const PRIVATE_STATE_ID = 'qualification-deploy';
const PRIVATE_STATE_PASSWORD =
  process.env.MIDNIGHT_PRIVATE_STATE_PASSWORD ?? 'zkrent-deploy-private-state-password';

type AnyState = {
  unshielded: {
    progress: unknown;
    balances: Record<string, bigint>;
    availableCoins: {
      utxo: { type: string };
      meta: { registeredForDustGeneration: boolean };
    }[];
  };
  dust: {
    balance(at: Date): bigint;
    availableCoins: unknown[];
    state: { progress?: { appliedIndex?: bigint; highestRelevantWalletIndex?: bigint } };
  };
};

type PersistentWallet = {
  wallet: WalletFacade;
  keystore: UnshieldedKeystore;
  zswapSecretKeys: ZswapSecretKeys;
  dustSecretKey: DustSecretKey;
  checkpoint(): Promise<void>;
  startCheckpointing(): () => void;
};

function isProgressStrictlyComplete(progress: unknown): boolean {
  const candidate = progress as { isStrictlyComplete?: () => boolean } | undefined;
  return typeof candidate?.isStrictlyComplete === 'function' && candidate.isStrictlyComplete();
}

function deriveNodeWsUrl(configuredWs: string | undefined, configuredNode: string | undefined): string {
  if (configuredWs) return configuredWs;
  if (configuredNode) return configuredNode.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
  return 'wss://rpc.preprod.midnight.network';
}

function getConfig(): EnvironmentConfiguration {
  const network = process.env.MIDNIGHT_NETWORK ?? 'preprod';
  const node = process.env.MIDNIGHT_NODE_URL ?? 'https://rpc.preprod.midnight.network';

  return {
    walletNetworkId: network,
    networkId: network,
    indexer: process.env.MIDNIGHT_INDEXER_URL ?? 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: process.env.MIDNIGHT_INDEXER_WS_URL ?? 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node,
    nodeWS: deriveNodeWsUrl(process.env.MIDNIGHT_NODE_WS_URL, node),
    faucet: process.env.MIDNIGHT_FAUCET_URL ?? 'https://midnight-tmnight-preprod.nethermind.dev/',
    proofServer: process.env.MIDNIGHT_PROOF_SERVER_URL ?? 'http://127.0.0.1:6300',
  };
}

function getSeed(): string {
  const seed = process.env.MIDNIGHT_DEPLOY_SEED;
  if (seed) {
    if (!/^[0-9a-fA-F]{64}$/.test(seed)) {
      throw new Error('MIDNIGHT_DEPLOY_SEED must be exactly 64 hex characters.');
    }
    return seed;
  }

  const generated = randomBytes(32).toString('hex');
  const envPath = path.resolve(process.cwd(), '.env.local');
  const prefix = existsSync(envPath) ? '\n' : '';
  writeFileSync(
    envPath,
    `${prefix}# Headless Midnight deploy wallet seed. Fund this wallet with preprod tNIGHT.\nMIDNIGHT_DEPLOY_SEED="${generated}"\n`,
    { flag: 'a', encoding: 'utf8' },
  );
  logger.warn(`Generated MIDNIGHT_DEPLOY_SEED in ${envPath}. Fund the printed deploy wallet address, then rerun.`);
  return generated;
}

function walletConfig(env: EnvironmentConfiguration): DefaultConfiguration {
  return {
    indexerClientConnection: { indexerHttpUrl: env.indexer, indexerWsUrl: env.indexerWS },
    provingServerUrl: new URL(env.proofServer),
    networkId: env.walletNetworkId,
    relayURL: new URL(env.nodeWS),
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
    costParameters: {
      additionalFeeOverhead: 1_000n,
      feeBlocksMargin: 5,
    },
  } as DefaultConfiguration;
}

async function chainNow(env: EnvironmentConfiguration): Promise<Date> {
  try {
    const res = await fetch(env.indexer, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ block { timestamp } }' }),
      signal: AbortSignal.timeout(4000),
    });
    const json = (await res.json()) as { data?: { block?: { timestamp?: number } } };
    const timestamp = json.data?.block?.timestamp;
    if (typeof timestamp === 'number' && timestamp > 0) return new Date(timestamp + 2000);
  } catch {
    // Fall back to local time when the indexer timestamp query is unavailable.
  }
  return new Date();
}

function healStalePendingDust(snapshot: string): string {
  try {
    const parsed = JSON.parse(snapshot) as { state?: string };
    if (!parsed.state) return snapshot;

    const state = DustLocalState.deserialize(Uint8Array.from(Buffer.from(parsed.state, 'hex')));
    if (state.utxos.length > 0) return snapshot;

    const healed = state.processTtls(new Date(Date.now() + 4 * 60 * 60_000));
    if (healed.utxos.length === 0) return snapshot;

    parsed.state = Buffer.from(healed.serialize()).toString('hex');
    logger.warn(`Released ${healed.utxos.length} stale pending dust spend(s) from checkpoint.`);
    return JSON.stringify(parsed);
  } catch {
    return snapshot;
  }
}

function withChainTime(dust: DustWalletAPI, env: EnvironmentConfiguration): DustWalletAPI {
  return new Proxy(dust as object, {
    get(target, prop, receiver) {
      if (prop === 'balanceTransactions') {
        return async (
          secretKey: DustSecretKey,
          transactions: Parameters<DustWalletAPI['balanceTransactions']>[1],
          ttl: Date,
          currentTime?: Date,
        ) =>
          (target as DustWalletAPI).balanceTransactions(
            secretKey,
            transactions,
            ttl,
            currentTime ?? (await chainNow(env)),
          );
      }

      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  }) as DustWalletAPI;
}

async function buildPersistentWallet(
  env: EnvironmentConfiguration,
  seedHex: string,
  stateDir: string,
): Promise<PersistentWallet> {
  mkdirSync(stateDir, { recursive: true });

  const config = walletConfig(env);
  const seeds = WalletSeeds.fromMasterSeed(seedHex);
  const keystore = createKeystore(seeds.unshielded, env.walletNetworkId as never);
  const dustStatePath = path.join(stateDir, `dust-${env.walletNetworkId}-${seedHex.slice(0, 8)}.state`);

  const shieldedWallet = ShieldedWallet(config).startWithSeed(seeds.shielded);
  const unshieldedWallet = UnshieldedWallet({
    ...config,
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
  }).startWithPublicKey(PublicKey.fromKeyStore(keystore));

  const dustConfig = {
    ...config,
    costParameters: {
      ledgerParams: LedgerParameters.initialParameters(),
      additionalFeeOverhead: 1_000n,
      feeBlocksMargin: 5,
    },
  };
  const Dust = DustWallet(dustConfig);
  let dustWallet: DustWalletAPI;

  if (existsSync(dustStatePath)) {
    try {
      const snapshot = healStalePendingDust(readFileSync(dustStatePath, 'utf8'));
      dustWallet = Dust.restore(snapshot);
      logger.info(`Restored dust wallet checkpoint (${(snapshot.length / 1e6).toFixed(1)}MB).`);
    } catch (err) {
      logger.warn(`Dust checkpoint unusable, starting cold: ${err instanceof Error ? err.message : String(err)}`);
      dustWallet = Dust.startWithSeed(seeds.dust, LedgerParameters.initialParameters().dust);
    }
  } else {
    logger.info('No dust checkpoint found. Starting dust scan from genesis; checkpoints will be saved.');
    dustWallet = Dust.startWithSeed(seeds.dust, LedgerParameters.initialParameters().dust);
  }

  const wallet = await MidnightWalletFacade.init({
    configuration: config,
    shielded: () => shieldedWallet,
    unshielded: () => unshieldedWallet,
    dust: () => withChainTime(dustWallet, env),
  });

  const checkpoint = async () => {
    try {
      const snapshot = await dustWallet.serializeState();
      writeFileSync(`${dustStatePath}.tmp`, snapshot, 'utf8');
      renameSync(`${dustStatePath}.tmp`, dustStatePath);
    } catch (err) {
      logger.warn(`Dust checkpoint failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return {
    wallet,
    keystore,
    zswapSecretKeys: ZswapSecretKeys.fromSeed(seeds.shielded),
    dustSecretKey: DustSecretKey.fromSeed(seeds.dust),
    checkpoint,
    startCheckpointing() {
      const interval = setInterval(checkpoint, CHECKPOINT_MS);
      return () => clearInterval(interval);
    },
  };
}

function waitForState(
  state$: Rx.Observable<AnyState>,
  description: string,
  predicate: (state: AnyState) => boolean,
  timeoutMs: number,
  describe: (state: AnyState) => string,
): Promise<AnyState> {
  return Rx.firstValueFrom(
    state$.pipe(
      Rx.throttleTime(10_000, undefined, { leading: true, trailing: true }),
      Rx.tap((state) => logger.info(`${description}: ${describe(state)}`)),
      Rx.filter(predicate),
      Rx.take(1),
      Rx.timeout({
        each: timeoutMs,
        with: () => Rx.throwError(() => new Error(`${description} timed out after ${Math.round(timeoutMs / 1000)}s`)),
      }),
    ),
  );
}

function buildWalletProvider(pw: PersistentWallet): MidnightProvider & WalletProvider {
  return {
    getCoinPublicKey(): CoinPublicKey {
      return pw.zswapSecretKeys.coinPublicKey;
    },
    getEncryptionPublicKey(): EncPublicKey {
      return pw.zswapSecretKeys.encryptionPublicKey;
    },
    async balanceTx(tx: UnboundTransaction, ttl?: Date): Promise<FinalizedTransaction> {
      const recipe = await pw.wallet.balanceUnboundTransaction(
        tx,
        {
          shieldedSecretKeys: pw.zswapSecretKeys,
          dustSecretKey: pw.dustSecretKey,
        },
        { ttl: ttl ?? new Date(Date.now() + 14 * 60_000) },
      );
      const signed = await pw.wallet.signRecipe(recipe, (payload: Uint8Array) => pw.keystore.signData(payload));
      return pw.wallet.finalizeRecipe(signed);
    },
    submitTx(tx: FinalizedTransaction): Promise<string> {
      return pw.wallet.submitTransaction(tx);
    },
  };
}

function buildProviders(
  walletProvider: MidnightProvider & WalletProvider,
  zkConfigPath: string,
  config: EnvironmentConfiguration,
): MidnightProviders<any> {
  setNetworkId(config.networkId);

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'qualification-deploy',
      privateStoragePasswordProvider: () => PRIVATE_STATE_PASSWORD,
      accountId: 'qualification-deploy',
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

function updateEnvFile(contractAddress: string): void {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const line = `MIDNIGHT_CONTRACT_ADDRESS="${contractAddress}"`;

  if (!existsSync(envPath)) {
    writeFileSync(envPath, `${line}\n`, 'utf8');
    logger.info(`Created .env.local with MIDNIGHT_CONTRACT_ADDRESS=${contractAddress}`);
    return;
  }

  let content = readFileSync(envPath, 'utf8');
  if (content.includes('MIDNIGHT_CONTRACT_ADDRESS=')) {
    content = content.replace(/^MIDNIGHT_CONTRACT_ADDRESS=.*$/m, line);
  } else {
    content += `${content.endsWith('\n') ? '' : '\n'}${line}\n`;
  }
  writeFileSync(envPath, content, 'utf8');
  logger.info(`Updated .env.local with MIDNIGHT_CONTRACT_ADDRESS=${contractAddress}`);
}

async function ensureDeployFunds(pw: PersistentWallet, config: EnvironmentConfiguration): Promise<void> {
  const state$ = pw.wallet.state() as Rx.Observable<AnyState>;
  const nightRaw = unshieldedToken().raw;
  const address = pw.keystore.getBech32Address().asString();

  const unshielded = await waitForState(
    state$,
    'unshielded sync',
    (state) => isProgressStrictlyComplete(state.unshielded.progress),
    15 * 60_000,
    (state) => `complete=${isProgressStrictlyComplete(state.unshielded.progress)} NIGHT=${state.unshielded.balances[nightRaw] ?? 0n}`,
  );

  const night = unshielded.unshielded.balances[nightRaw] ?? 0n;
  if (night === 0n) {
    throw new Error(`Deploy wallet has no tNIGHT. Fund ${address} from ${config.faucet}, then rerun.`);
  }
  logger.info(`Deploy wallet NIGHT balance: ${night}`);

  const unregistered = unshielded.unshielded.availableCoins.filter(
    (coin) => coin.utxo.type === nightRaw && !coin.meta.registeredForDustGeneration,
  );

  if (unregistered.length > 0) {
    logger.info(`Registering ${unregistered.length} NIGHT UTXO(s) for dust generation...`);
    const recipe = await pw.wallet.registerNightUtxosForDustGeneration(
      unregistered,
      pw.keystore.getPublicKey(),
      (payload: Uint8Array) => pw.keystore.signData(payload),
    );
    const signed = await pw.wallet.signRecipe(recipe, (payload: Uint8Array) => pw.keystore.signData(payload));
    const finalized = await pw.wallet.finalizeRecipe(signed);
    logger.info(`Dust registration tx submitted: ${await pw.wallet.submitTransaction(finalized)}`);
  } else {
    logger.info('All NIGHT UTXOs are already registered for dust generation.');
  }

  await waitForState(
    state$,
    'dust readiness',
    (state) => {
      const progress = state.dust.state.progress;
      const caughtUp =
        progress?.appliedIndex !== undefined &&
        progress.highestRelevantWalletIndex !== undefined &&
        BigInt(progress.appliedIndex) >= BigInt(progress.highestRelevantWalletIndex);

      return caughtUp && state.dust.availableCoins.length > 0 && state.dust.balance(new Date()) > 0n;
    },
    DUST_WAIT_MS,
    (state) => {
      const progress = state.dust.state.progress;
      return `coins=${state.dust.availableCoins.length} balance=${state.dust.balance(new Date())} applied=${progress?.appliedIndex} tip=${progress?.highestRelevantWalletIndex}`;
    },
  );

  await pw.checkpoint();
}

async function main(): Promise<void> {
  const config = getConfig();
  setNetworkId(config.networkId);

  const seed = getSeed();
  const zkConfigPath = path.resolve(process.cwd(), 'contracts/managed/qualification');
  if (!existsSync(path.join(zkConfigPath, 'keys')) || !existsSync(path.join(zkConfigPath, 'zkir'))) {
    throw new Error(`Missing ZK assets in ${zkConfigPath}. Recompile the Compact contract before deploying.`);
  }

  const walletStateDir = path.resolve(process.cwd(), '.wallet-state');
  const pw = await buildPersistentWallet(config, seed, walletStateDir);
  const address = pw.keystore.getBech32Address().asString();
  logger.info(`Deploy wallet unshielded address: ${address}`);

  logger.info('Starting wallet...');
  await pw.wallet.start(pw.zswapSecretKeys, pw.dustSecretKey);
  await pw.wallet.shielded.stop();
  const stopCheckpointing = pw.startCheckpointing();

  try {
    await ensureDeployFunds(pw, config);

    const walletProvider = buildWalletProvider(pw);
    const providers = buildProviders(walletProvider, zkConfigPath, config);

    const compiledContract = CompiledContract.make('QualificationContract', Contract as never).pipe(
      CompiledContract.withVacantWitnesses,
      CompiledContract.withCompiledFileAssets(zkConfigPath),
    );

    logger.info(`Deploying QualificationContract with minIncomeReq=${MIN_INCOME_REQ}...`);
    const deployedContract = await deployContract(providers, {
      compiledContract: compiledContract as never,
      args: [MIN_INCOME_REQ],
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
    } as never);

    const contractAddress = deployedContract.deployTxData.public.contractAddress;
    logger.info(`Deployed QualificationContract: MIDNIGHT_CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`MIDNIGHT_CONTRACT_ADDRESS=${contractAddress}`);

    updateEnvFile(contractAddress);
    await pw.checkpoint();
  } finally {
    stopCheckpointing();
    await pw.checkpoint().catch(() => undefined);
    await pw.wallet.stop().catch(() => undefined);
  }
}

main()
  .catch((err) => {
    logger.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit();
  });
