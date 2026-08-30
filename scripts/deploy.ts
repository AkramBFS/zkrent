/**
 * Deploy the ZkRent Qualification contract to a local Midnight devnet.
 *
 * LOCAL DEVNET ONLY — never reuse the genesis seed on Preprod/mainnet.
 *
 * Prerequisites:
 *   1. Docker Desktop running + devnet stack up (node, indexer, proof-server)
 *   2. Compact contract compiled → contracts/managed/qualification/{contract,keys,zkir}
 *
 * Usage (from WSL, at repo root):
 *   npx tsx scripts/deploy.ts
 */

import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// @ts-ignore — ws module
import { WebSocket } from 'ws';

import {
  type CoinPublicKey,
  DustSecretKey,
  type EncPublicKey,
  type FinalizedTransaction,
  LedgerParameters,
  unshieldedToken,
  ZswapSecretKeys,
} from '@midnight-ntwrk/ledger-v8';

import type {
  MidnightProvider,
  UnboundTransaction,
  WalletProvider,
} from '@midnight-ntwrk/midnight-js-types';

import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';

import {
  WalletFacade as MidnightWalletFacade,
} from '@midnight-ntwrk/wallet-sdk-facade';

import type { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';

import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';

import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
  type UnshieldedKeystore,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';

import { WalletSeeds } from '@midnight-ntwrk/testkit-js';

import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

import { Contract } from '../contracts/managed/qualification/contract/index.js';

import dotenv from 'dotenv';

/* -------------------------------------------------------------------------- */
/* Setup                                                                      */
/* -------------------------------------------------------------------------- */

dotenv.config({ path: '.env.local' });

// Midnight wallet SDK requires globalThis.WebSocket in Node.
(globalThis as { WebSocket?: unknown }).WebSocket ??= WebSocket;

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const NETWORK = 'undeployed';

const ENDPOINTS = {
  node:        process.env.MIDNIGHT_NODE_URL        ?? 'http://127.0.0.1:9944',
  nodeWs:      process.env.MIDNIGHT_NODE_WS_URL     ?? 'ws://127.0.0.1:9944',
  indexer:     process.env.MIDNIGHT_INDEXER_URL      ?? 'http://127.0.0.1:8088/api/v4/graphql',
  indexerWs:   process.env.MIDNIGHT_INDEXER_WS_URL   ?? 'ws://127.0.0.1:8088/api/v4/graphql/ws',
  proofServer: process.env.MIDNIGHT_PROOF_SERVER_URL ?? 'http://127.0.0.1:6300',
};

/** Qualification contract constructor arg — minimum annual income. */
const MIN_INCOME_REQ = BigInt(process.env.MIDNIGHT_MIN_INCOME_REQ ?? '50000');

const PRIVATE_STATE_ID = 'qualification-deploy';
const PRIVATE_STATE_PASSWORD =
  process.env.MIDNIGHT_PRIVATE_STATE_PASSWORD?.trim() ||
  'Local-Devnet-Development-Placeholder-1';

const MAX_DEPLOY_RETRIES = 12;
const DEPLOY_RETRY_DELAY_MS = 5_000;
const DUST_WAIT_TIMEOUT_MS = 5 * 60_000;

const ZK_CONFIG_PATH = resolve(process.cwd(), 'contracts/managed/qualification');

/* -------------------------------------------------------------------------- */
/* Seed                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The local devnet pre-mints NIGHT to the well-known genesis seed.
 * Anyone on this stack can spend it — never use on Preprod/mainnet.
 */
function getSeed(): string {
  const existing = process.env.MIDNIGHT_DEPLOY_SEED?.trim();
  if (existing) {
    if (!/^[0-9a-fA-F]{64}$/.test(existing)) {
      throw new Error('MIDNIGHT_DEPLOY_SEED must be exactly 64 hex chars (32 bytes).');
    }
    return existing;
  }

  // Well-known genesis seed for local devnet (CFG_PRESET=dev).
  const genesis = '0000000000000000000000000000000000000000000000000000000000000001';

  // Persist so reruns use the same wallet.
  const envPath = resolve(process.cwd(), '.env.local');
  const prefix = existsSync(envPath) ? '\n' : '';
  writeFileSync(
    envPath,
    `${prefix}# Midnight local deploy wallet seed\nMIDNIGHT_DEPLOY_SEED="${genesis}"\n`,
    { flag: 'a', encoding: 'utf8' },
  );
  console.log(`  Wrote MIDNIGHT_DEPLOY_SEED to ${envPath}`);
  return genesis;
}

/* -------------------------------------------------------------------------- */
/* Service readiness                                                          */
/* -------------------------------------------------------------------------- */

async function waitForHttp(url: string, label: string, maxAttempts = 40, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await fetch(url, { method: 'GET', signal: AbortSignal.timeout(3_000) });
      console.log(`  ✓ ${label} reachable`);
      return;
    } catch {
      process.stdout.write(`\r  Waiting for ${label}... (${attempt}/${maxAttempts})   `);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error(`${label} not reachable at ${url}. Is docker compose up?`);
}

/* -------------------------------------------------------------------------- */
/* Wallet                                                                     */
/* -------------------------------------------------------------------------- */

type WalletContext = {
  wallet: WalletFacade;
  keystore: UnshieldedKeystore;
  zswapSecretKeys: ZswapSecretKeys;
  dustSecretKey: DustSecretKey;
};

async function createWallet(seedHex: string): Promise<WalletContext> {
  const seeds = WalletSeeds.fromMasterSeed(seedHex);

  const keystore = createKeystore(seeds.unshielded, NETWORK as never);

  const walletConfig = {
    indexerClientConnection: {
      indexerHttpUrl: ENDPOINTS.indexer,
      indexerWsUrl: ENDPOINTS.indexerWs,
    },
    provingServerUrl: new URL(ENDPOINTS.proofServer),
    networkId: NETWORK,
    relayURL: new URL(ENDPOINTS.nodeWs),
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
    costParameters: {
      additionalFeeOverhead: 1_000n,
      feeBlocksMargin: 5,
    },
  };

  const dustConfig = {
    ...walletConfig,
    costParameters: {
      ledgerParams: LedgerParameters.initialParameters(),
      additionalFeeOverhead: 1_000n,
      feeBlocksMargin: 5,
    },
  };

  const wallet = await MidnightWalletFacade.init({
    configuration: walletConfig as any,
    shielded: () => ShieldedWallet(walletConfig as any).startWithSeed(seeds.shielded),
    unshielded: () =>
      UnshieldedWallet({
        ...walletConfig,
        txHistoryStorage: new InMemoryTransactionHistoryStorage(),
      } as any).startWithPublicKey(PublicKey.fromKeyStore(keystore)),
    dust: () =>
      DustWallet(dustConfig as any).startWithSeed(
        seeds.dust,
        LedgerParameters.initialParameters().dust,
      ),
  });

  const zswapSecretKeys = ZswapSecretKeys.fromSeed(seeds.shielded);
  const dustSecretKey = DustSecretKey.fromSeed(seeds.dust);

  return { wallet, keystore, zswapSecretKeys, dustSecretKey };
}

/* -------------------------------------------------------------------------- */
/* Funding — NIGHT + DUST                                                     */
/* -------------------------------------------------------------------------- */

async function ensureFunds(ctx: WalletContext): Promise<void> {
  const nightRaw = unshieldedToken().raw;

  // Sync wallet.
  console.log('  Syncing wallet (may take a minute)...');
  const state = await ctx.wallet.waitForSyncedState();

  const night = state.unshielded.balances[nightRaw] ?? 0n;
  const address = ctx.keystore.getBech32Address().toString();
  console.log(`  Address: ${address}`);
  console.log(`  NIGHT:   ${night}`);

  if (night === 0n) {
    throw new Error(
      'Deploy wallet has 0 NIGHT.\n' +
      'Ensure your devnet is running with CFG_PRESET=dev\n' +
      'and the genesis seed matches MIDNIGHT_DEPLOY_SEED.',
    );
  }

  // Register NIGHT UTXOs for DUST generation.
  const unregistered = state.unshielded.availableCoins.filter(
    (coin: any) => coin.utxo.type === nightRaw && !coin.meta?.registeredForDustGeneration,
  );

  if (unregistered.length > 0) {
    console.log(`  Registering ${unregistered.length} NIGHT UTXO(s) for DUST...`);
    const recipe = await ctx.wallet.registerNightUtxosForDustGeneration(
      unregistered,
      ctx.keystore.getPublicKey(),
      (payload: Uint8Array) => ctx.keystore.signData(payload),
    );
    const finalized = await ctx.wallet.finalizeRecipe(recipe);
    await ctx.wallet.submitTransaction(finalized);
    console.log('  ✓ DUST registration submitted');
  } else {
    console.log('  ✓ NIGHT already registered for DUST');
  }

  // Wait for DUST balance.
  const dustStart = Date.now();
  while (Date.now() - dustStart < DUST_WAIT_TIMEOUT_MS) {
    const s = await ctx.wallet.waitForSyncedState();
    const dust = s.dust.balance(new Date());
    if (dust > 0n) {
      console.log(`  ✓ DUST ready (balance=${dust})`);
      return;
    }
    const elapsed = Math.round((Date.now() - dustStart) / 1000);
    process.stdout.write(`\r  Waiting for DUST... (${elapsed}s)   `);
    await new Promise((r) => setTimeout(r, 5_000));
  }

  throw new Error('DUST did not appear within timeout. Is the devnet healthy?');
}

/* -------------------------------------------------------------------------- */
/* Wallet provider (bridges WalletFacade → midnight-js WalletProvider)        */
/* -------------------------------------------------------------------------- */

function buildWalletProvider(ctx: WalletContext): MidnightProvider & WalletProvider {
  return {
    getCoinPublicKey(): CoinPublicKey {
      return ctx.zswapSecretKeys.coinPublicKey;
    },
    getEncryptionPublicKey(): EncPublicKey {
      return ctx.zswapSecretKeys.encryptionPublicKey;
    },
    async balanceTx(tx: UnboundTransaction, ttl?: Date): Promise<FinalizedTransaction> {
      const recipe = await ctx.wallet.balanceUnboundTransaction(
        tx as any,
        { shieldedSecretKeys: ctx.zswapSecretKeys, dustSecretKey: ctx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60_000) },
      );
      return ctx.wallet.finalizeRecipe(recipe);
    },
    submitTx(tx: FinalizedTransaction): Promise<string> {
      return ctx.wallet.submitTransaction(tx);
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Midnight providers                                                         */
/* -------------------------------------------------------------------------- */

function buildProviders(walletProvider: MidnightProvider & WalletProvider, accountId: string): MidnightProviders<any> {
  const zkConfigProvider = new NodeZkConfigProvider(ZK_CONFIG_PATH);

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: PRIVATE_STATE_ID,
      accountId,
      privateStoragePasswordProvider: () => PRIVATE_STATE_PASSWORD,
    }),
    publicDataProvider: indexerPublicDataProvider(ENDPOINTS.indexer, ENDPOINTS.indexerWs),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(ENDPOINTS.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

/* -------------------------------------------------------------------------- */
/* .env.local updater                                                         */
/* -------------------------------------------------------------------------- */

function updateEnvFile(contractAddress: string): void {
  const envPath = resolve(process.cwd(), '.env.local');
  const line = `MIDNIGHT_CONTRACT_ADDRESS="${contractAddress}"`;

  if (!existsSync(envPath)) {
    writeFileSync(envPath, `${line}\n`, 'utf8');
    return;
  }

  let content = readFileSync(envPath, 'utf8');
  if (content.includes('MIDNIGHT_CONTRACT_ADDRESS=')) {
    content = content.replace(/MIDNIGHT_CONTRACT_ADDRESS=.*/g, line);
  } else {
    content += `\n${line}\n`;
  }
  writeFileSync(envPath, content, 'utf8');
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  console.log('\n=== ZkRent Qualification — local devnet deploy ===\n');

  setNetworkId(NETWORK);

  console.log(`  Network:      ${NETWORK}`);
  console.log(`  Node:         ${ENDPOINTS.node}`);
  console.log(`  Indexer:      ${ENDPOINTS.indexer}`);
  console.log(`  Proof server: ${ENDPOINTS.proofServer}`);
  console.log(`  minIncomeReq: ${MIN_INCOME_REQ}`);
  console.log('');

  // ── Verify artifacts ──────────────────────────────────────────────────────

  const contractPath = resolve(ZK_CONFIG_PATH, 'contract', 'index.js');
  if (!existsSync(contractPath)) {
    throw new Error(`Contract not compiled. Missing: ${contractPath}`);
  }
  if (!existsSync(resolve(ZK_CONFIG_PATH, 'keys')) || !existsSync(resolve(ZK_CONFIG_PATH, 'zkir'))) {
    throw new Error(`Missing ZK assets (keys/zkir) in ${ZK_CONFIG_PATH}`);
  }

  // ── Wait for services ─────────────────────────────────────────────────────

  console.log('─── Services ───\n');
  await waitForHttp(ENDPOINTS.proofServer, 'proof-server');
  await waitForHttp(ENDPOINTS.node.replace(/\/$/, '') + '/health', 'node');
  console.log('');

  // ── Seed ───────────────────────────────────────────────────────────────────

  const seed = getSeed();

  // ── Compiled contract ──────────────────────────────────────────────────────

  const compiledContract = CompiledContract
    .make('qualification', Contract as never)
    .pipe(
      CompiledContract.withVacantWitnesses,
      CompiledContract.withCompiledFileAssets(ZK_CONFIG_PATH),
    );

  // ── Wallet ─────────────────────────────────────────────────────────────────

  console.log('─── Wallet ───\n');
  const ctx = await createWallet(seed);

  console.log('  Starting wallet...');
  await ctx.wallet.start(ctx.zswapSecretKeys, ctx.dustSecretKey);
  console.log('  ✓ Wallet started\n');

  // ── Fund ───────────────────────────────────────────────────────────────────

  console.log('─── Funding ───\n');
  await ensureFunds(ctx);
  console.log('');

  // Small delay for freshly generated DUST to become spendable.
  console.log('  Allowing DUST to settle (6s)...');
  await new Promise((r) => setTimeout(r, 6_000));
  console.log('');

  // ── Providers ──────────────────────────────────────────────────────────────

  const address = ctx.keystore.getBech32Address().toString();
  const walletProvider = buildWalletProvider(ctx);
  const providers = buildProviders(walletProvider, address);

  // ── Deploy ─────────────────────────────────────────────────────────────────

  console.log('─── Deploy ───\n');
  console.log(`  Deploying QualificationContract (minIncomeReq=${MIN_INCOME_REQ})...`);

  let deployed: any;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_DEPLOY_RETRIES; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${MAX_DEPLOY_RETRIES}...`);
      deployed = await deployContract(
        providers,
        {
          compiledContract,
          args: [MIN_INCOME_REQ],
          privateStateId: PRIVATE_STATE_ID,
          initialPrivateState: {},
        } as never,
      );
      break;
    } catch (err: any) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('dust') || msg.includes('Not enough')) {
        console.log(`  ⏳ DUST not ready yet — retrying in ${DEPLOY_RETRY_DELAY_MS / 1000}s...`);
        await new Promise((r) => setTimeout(r, DEPLOY_RETRY_DELAY_MS));
        continue;
      }
      throw err;
    }
  }

  if (!deployed) {
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  const contractAddress = deployed.deployTxData.public.contractAddress;

  // ── Persist ────────────────────────────────────────────────────────────────

  updateEnvFile(contractAddress);

  console.log('\n✅ Deployed successfully!');
  console.log(`   MIDNIGHT_CONTRACT_ADDRESS=${contractAddress}`);
  console.log('   Updated .env.local');
  console.log('');

  // ── Cleanup ────────────────────────────────────────────────────────────────

  try {
    await ctx.wallet.stop();
  } catch {
    // Wallet stop can fail on forced shutdown; non-fatal.
  }
}

main().catch((err) => {
  console.error('\n❌ Deploy failed:', err);
  process.exit(1);
});