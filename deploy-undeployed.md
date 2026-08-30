/**
 * Deploy MOAT to local undeployed Docker stack using the well-known genesis seed.
 *
 * LOCAL DEVNET ONLY — never reuse GENESIS_SEED on Preprod/mainnet.
 *
 * Prerequisites:
 *   1. Docker Desktop running + `npm run local:up` (node/indexer/proof-server healthy)
 *   2. Compact artifacts present: `npm run compact` (WSL) then `npm run prepare:contract`
 *   3. `npm run build:api`
 *
 * Usage (repo root):
 *   npm run deploy:local
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';

import * as ledger from '@midnight-ntwrk/ledger-v8';
import { unshieldedToken } from '@midnight-ntwrk/ledger-v8';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { InMemoryTransactionHistoryStorage } from '@midnight-ntwrk/wallet-sdk-abstractions';
import {
  createKeystore,
  PublicKey,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { getNetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

import {
  UNDEPLOYED_ENDPOINTS,
  createMoatProviders,
  deployMoatContract,
  moatContractAddress,
  type WalletAndMidnightProvider,
} from '../src/index.js';

// Wallet sync needs a global WebSocket in Node.
(globalThis as { WebSocket?: typeof WebSocket }).WebSocket = WebSocket;

/**
 * LOCAL DEVNET ONLY.
 * Midnight `dev` preset pre-mints NIGHT to this well-known seed.
 * Anyone on this stack can spend it — never use on Preprod/mainnet.
 */
const GENESIS_SEED =
  process.env.MIDNIGHT_DEPLOY_SEED?.trim() ||
  '0000000000000000000000000000000000000000000000000000000000000001';

function deriveKeys(seedHex: string) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seedHex, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid deploy seed');
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hdWallet.hdWallet.clear();
  return result.keys;
}

async function waitForHttp(url: string, label: string, maxAttempts = 40, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await fetch(url, { method: 'GET', signal: AbortSignal.timeout(3000) });
      console.log(`  ✓ ${label} reachable`);
      return;
    } catch {
      process.stdout.write(`\r  Waiting for ${label}... (${attempt}/${maxAttempts})   `);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error(`${label} not reachable at ${url}. Run: npm run local:up`);
}

async function createWallet(seedHex: string) {
  const keys = deriveKeys(seedHex);
  const networkId = getNetworkId();
  const endpoints = UNDEPLOYED_ENDPOINTS;
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], networkId);

  const wallet = await WalletFacade.init({
    configuration: {
      networkId,
      indexerClientConnection: {
        indexerHttpUrl: endpoints.indexerHttp,
        indexerWsUrl: endpoints.indexerWs,
      },
      provingServerUrl: new URL(endpoints.proofServer),
      relayURL: new URL(endpoints.node.replace(/^http/, 'ws')),
      txHistoryStorage: new InMemoryTransactionHistoryStorage(),
      costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
    },
    shielded: async (config) => ShieldedWallet(config).startWithSecretKeys(shieldedSecretKeys),
    unshielded: async (config) =>
      UnshieldedWallet(config).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: async (config) =>
      DustWallet(config).startWithSecretKey(
        dustSecretKey,
        ledger.LedgerParameters.initialParameters().dust,
      ),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);
  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
}

async function ensureDust(walletCtx: Awaited<ReturnType<typeof createWallet>>): Promise<void> {
  const dustState = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  if (dustState.dust.balance(new Date()) > 0n) {
    console.log('  ✓ DUST already available');
    return;
  }

  const nightUtxos = dustState.unshielded.availableCoins.filter(
    (c: { meta?: { registeredForDustGeneration?: boolean } }) => !c.meta?.registeredForDustGeneration,
  );
  if (nightUtxos.length === 0) {
    throw new Error(
      'Genesis wallet has no unregistered NIGHT UTXOs for DUST. Is the local node on CFG_PRESET=dev?',
    );
  }

  console.log('  Registering NIGHT for DUST generation...');
  const recipe = await walletCtx.wallet.registerNightUtxosForDustGeneration(
    nightUtxos,
    walletCtx.unshieldedKeystore.getPublicKey(),
    (payload) => walletCtx.unshieldedKeystore.signData(payload),
  );
  const signedRecipe = await walletCtx.wallet.signRecipe(recipe, (payload) =>
    walletCtx.unshieldedKeystore.signData(payload),
  );
  await walletCtx.wallet.submitTransaction(await walletCtx.wallet.finalizeRecipe(signedRecipe));

  console.log('  Waiting for DUST...');
  await Rx.firstValueFrom(
    walletCtx.wallet.state().pipe(
      Rx.throttleTime(5000),
      Rx.filter((s) => s.isSynced),
      Rx.filter((s) => s.dust.balance(new Date()) > 0n),
    ),
  );
  console.log('  ✓ DUST ready');
}

function makeWalletProvider(
  walletCtx: Awaited<ReturnType<typeof createWallet>>,
  synced: { shielded: { coinPublicKey: { toHexString(): string }; encryptionPublicKey: { toHexString(): string } } },
): WalletAndMidnightProvider {
  return {
    getCoinPublicKey: () => synced.shielded.coinPublicKey.toHexString(),
    getEncryptionPublicKey: () => synced.shielded.encryptionPublicKey.toHexString(),
    async balanceTx(tx, ttl?) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        {
          shieldedSecretKeys: walletCtx.shieldedSecretKeys,
          dustSecretKey: walletCtx.dustSecretKey,
        },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      const signedRecipe = await walletCtx.wallet.signRecipe(recipe, (payload) =>
        walletCtx.unshieldedKeystore.signData(payload),
      );
      return walletCtx.wallet.finalizeRecipe(signedRecipe);
    },
    submitTx: (tx) => walletCtx.wallet.submitTransaction(tx) as Promise<string>,
  };
}

async function main(): Promise<void> {
  console.log('\n=== Latch MOAT — undeployed deploy ===\n');
  setNetworkId('undeployed');

  await waitForHttp(UNDEPLOYED_ENDPOINTS.proofServer, 'proof-server');
  await waitForHttp(UNDEPLOYED_ENDPOINTS.node.replace(/\/$/, '') + '/health', 'node');

  console.log('\n─── Wallet (genesis seed) ───\n');
  const walletCtx = await createWallet(GENESIS_SEED);
  console.log('  Syncing wallet (may take a minute)...');
  const synced = await walletCtx.wallet.waitForSyncedState();
  const address = walletCtx.unshieldedKeystore.getBech32Address().toString();
  const night = synced.unshielded.balances[unshieldedToken().raw] ?? 0n;
  console.log(`  Address: ${address}`);
  console.log(`  NIGHT:   ${night.toString()}`);
  if (night === 0n) {
    throw new Error('Genesis wallet shows 0 NIGHT — confirm local node is healthy with CFG_PRESET=dev');
  }

  console.log('\n─── DUST ───\n');
  await ensureDust(walletCtx);

  console.log('\n─── Deploy ───\n');
  const providers = createMoatProviders({
    endpoints: UNDEPLOYED_ENDPOINTS,
    walletAndMidnightProvider: makeWalletProvider(walletCtx, synced),
  });

  const MAX_RETRIES = 8;
  let lastError: unknown;
  let deployed;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`  deployMoatContract attempt ${attempt}/${MAX_RETRIES}...`);
      deployed = await deployMoatContract(providers);
      break;
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Not enough Dust') || msg.toLowerCase().includes('dust')) {
        console.log(`  ⏳ DUST not ready yet (${msg}) — retrying in 15s`);
        await new Promise((r) => setTimeout(r, 15_000));
        continue;
      }
      throw err;
    }
  }
  if (!deployed) throw lastError instanceof Error ? lastError : new Error(String(lastError));

  const contractAddress = moatContractAddress(deployed);
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const outPath = resolve(repoRoot, 'deployment.json');
  const payload = {
    contractAddress,
    network: 'undeployed',
    deployedAt: new Date().toISOString(),
    status: 'deployed',
  };
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);

  console.log('\n✅ Deployed');
  console.log(`   MOAT_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   wrote ${outPath}`);
  console.log('\nHandoff: set MOAT_CONTRACT_ADDRESS in your env (do not commit secrets).\n');

  await walletCtx.wallet.stop();
}

main().catch(async (err) => {
  console.error('\n❌ Deploy failed:', err);
  process.exit(1);
});