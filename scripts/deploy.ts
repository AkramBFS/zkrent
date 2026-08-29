import {
  type CoinPublicKey,
  DustSecretKey,
  type EncPublicKey,
  type FinalizedTransaction,
  LedgerParameters,
  ZswapSecretKeys,
} from '@midnight-ntwrk/ledger-v8';
import {
  type MidnightProvider,
  type UnboundTransaction,
  type WalletProvider,
} from '@midnight-ntwrk/midnight-js-types';
import { ttlOneHour } from '@midnight-ntwrk/midnight-js-utils';
import { type WalletFacade, type FacadeState } from '@midnight-ntwrk/wallet-sdk-facade';
import {
  type DustWalletOptions,
  type EnvironmentConfiguration,
  FluentWalletBuilder,
} from '@midnight-ntwrk/testkit-js';
import * as Rx from 'rxjs';
import { CompiledContract } from '@midnight-ntwrk/compact-runtime';
import { createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { Contract } from '../contracts/managed/qualification/contract/index.js';
import pino from 'pino';

const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });

const MIN_INCOME_REQ = 50000n;

class MidnightWalletProvider implements MidnightProvider, WalletProvider {
  readonly wallet: WalletFacade;

  private constructor(
    private readonly logger: pino.Logger,
    wallet: WalletFacade,
    private readonly zswapSecretKeys: ZswapSecretKeys,
    private readonly dustSecretKey: DustSecretKey,
  ) {
    this.wallet = wallet;
  }

  getCoinPublicKey(): CoinPublicKey {
    return this.zswapSecretKeys.coinPublicKey;
  }

  getEncryptionPublicKey(): EncPublicKey {
    return this.zswapSecretKeys.encryptionPublicKey;
  }

  async balanceTx(
    tx: UnboundTransaction,
    ttl: Date = ttlOneHour(),
  ): Promise<FinalizedTransaction> {
    const recipe = await this.wallet.balanceUnboundTransaction(
      tx,
      {
        shieldedSecretKeys: this.zswapSecretKeys,
        dustSecretKey: this.dustSecretKey,
      },
      { ttl },
    );
    return await this.wallet.finalizeRecipe(recipe);
  }

  submitTx(tx: FinalizedTransaction): Promise<string> {
    return this.wallet.submitTransaction(tx);
  }

  async start(): Promise<void> {
    this.logger.info('Starting wallet...');
    await this.wallet.start(this.zswapSecretKeys, this.dustSecretKey);
  }

  async stop(): Promise<void> {
    return this.wallet.stop();
  }

  static async build(
    logger: pino.Logger,
    env: EnvironmentConfiguration,
    seed: string,
  ): Promise<MidnightWalletProvider> {
    const dustOptions: DustWalletOptions = {
      ledgerParams: LedgerParameters.initialParameters(),
      additionalFeeOverhead: 1_000n,
      feeBlocksMargin: 5,
    };

    const builder = FluentWalletBuilder.forEnvironment(env).withDustOptions(dustOptions);

    const buildResult = await builder.withSeed(seed).buildWithoutStarting();
    const { wallet, seeds } = buildResult as {
      wallet: WalletFacade;
      seeds: {
        masterSeed: string;
        shielded: Uint8Array;
        dust: Uint8Array;
      };
    };

    logger.info(`Wallet built from seed: ${seeds.masterSeed.slice(0, 8)}...`);

    return new MidnightWalletProvider(
      logger,
      wallet,
      ZswapSecretKeys.fromSeed(seeds.shielded),
      DustSecretKey.fromSeed(seeds.dust),
    );
  }
}

function isProgressStrictlyComplete(progress: unknown): boolean {
  if (!progress || typeof progress !== 'object') return false;
  const candidate = progress as { isStrictlyComplete?: unknown };
  if (typeof candidate.isStrictlyComplete !== 'function') return false;
  return (candidate.isStrictlyComplete as () => boolean)();
}

async function syncWallet(
  logger: pino.Logger,
  wallet: WalletFacade,
  timeout = 300_000,
): Promise<FacadeState> {
  logger.info('Syncing wallet...');
  let emissionCount = 0;
  return Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.tap((state: FacadeState) => {
        emissionCount++;
        const shielded = isProgressStrictlyComplete(state.shielded.state.progress);
        const unshielded = isProgressStrictlyComplete(state.unshielded.progress);
        const dust = isProgressStrictlyComplete(state.dust.state.progress);
        logger.info(
          `Wallet sync [${emissionCount}]: shielded=${shielded}, unshielded=${unshielded}, dust=${dust}`,
        );
      }),
      Rx.filter(
        (state: FacadeState) =>
          isProgressStrictlyComplete(state.shielded.state.progress) &&
          isProgressStrictlyComplete(state.dust.state.progress) &&
          isProgressStrictlyComplete(state.unshielded.progress),
      ),
      Rx.tap(() => logger.info(`Wallet sync complete after ${emissionCount} emissions`)),
      Rx.timeout({
        each: timeout,
        with: () =>
          Rx.throwError(
            () => new Error(`Wallet sync timeout after ${timeout}ms (${emissionCount} emissions)`),
          ),
      }),
      Rx.catchError((err) => {
        logger.error(`Wallet sync error: ${err}`);
        return Rx.throwError(() => err);
      }),
    ),
  );
}

function buildProviders(
  wallet: MidnightWalletProvider,
  zkConfigPath: string,
  config: {
    indexer: string;
    indexerWS: string;
    proofServer: string;
    networkId: string;
  },
): MidnightProviders<any> {
  const { NodeZkConfigProvider } = require('@midnight-ntwrk/midnight-js-node-zk-config-provider');
  
  setNetworkId(config.networkId);

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: `qualification-deploy-${Date.now()}`,
      walletProvider: wallet,
      privateStoragePasswordProvider: () => 'deploy-secure-password-2024',
      accountId: `deploy-${Date.now()}`,
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
    walletProvider: wallet,
    midnightProvider: wallet,
  };
}

async function main() {
  const network = process.env.MIDNIGHT_NETWORK ?? 'preprod';
  
  const config: EnvironmentConfiguration = {
    walletNetworkId: network,
    networkId: network,
    indexer: process.env.MIDNIGHT_INDEXER_URL ?? 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: process.env.MIDNIGHT_INDEXER_WS_URL ?? 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: process.env.MIDNIGHT_NODE_URL ?? 'https://rpc.preprod.midnight.network',
    nodeWS: process.env.MIDNIGHT_NODE_WS_URL ?? 'wss://rpc.preprod.midnight.network',
    faucet: '',
    proofServer: process.env.MIDNIGHT_PROOF_SERVER_URL ?? 'https://api-preprod.1am.xyz',
  };

  const seed = process.env.MIDNIGHT_DEPLOY_SEED ?? 
    '0000000000000000000000000000000000000000000000000000000000000001';

  const zkConfigPath = './contracts/managed/qualification';

  const wallet = await MidnightWalletProvider.build(logger, config, seed);
  await wallet.start();
  await syncWallet(logger, wallet.wallet, 600_000);

  const providers = buildProviders(wallet, zkConfigPath, {
    indexer: config.indexer,
    indexerWS: config.indexerWS,
    proofServer: config.proofServer,
    networkId: config.networkId,
  });

  const compiledContract = CompiledContract.make('QualificationContract', Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  const deployTxData = await createUnprovenDeployTx(
    { zkConfigProvider: providers.zkConfigProvider, walletProvider: providers.walletProvider },
    { compiledContract, args: [MIN_INCOME_REQ], signingKey: sampleSigningKey() },
  );

  const contractAddress = deployTxData.public.contractAddress;
  logger.info(`Contract address (pre-submit): ${contractAddress}`);

  await submitTxAsync(providers, { unprovenTx: deployTxData.private.unprovenTx });

  await providers.privateStateProvider.setContractAddress(contractAddress);
  await providers.privateStateProvider.setSigningKey(contractAddress, deployTxData.private.signingKey);

  logger.info(`✅ Deployed! MIDNIGHT_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`MIDNIGHT_CONTRACT_ADDRESS=${contractAddress}`);

  await wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});