import { existsSync, readFileSync, appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { HDWallet, Roles, generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';
import {
  UnshieldedAddress,
  ShieldedAddress,
  ShieldedCoinPublicKey,
  ShieldedEncryptionPublicKey,
  MidnightBech32m,
} from '@midnight-ntwrk/wallet-sdk-address-format';

const envLocalPath = resolve(process.cwd(), '.env.local');

let seedHex: string | null = null;

if (existsSync(envLocalPath)) {
  const content = readFileSync(envLocalPath, 'utf8');
  const match = content.match(/^MIDNIGHT_DEPLOY_SEED=([0-9a-fA-F]{64})/m);
  if (match) {
    seedHex = match[1];
  }
}

if (!seedHex) {
  const randomSeedBytes = generateRandomSeed();
  seedHex = Buffer.from(randomSeedBytes).toString('hex');
  const lineToAppend = `\n# Throwaway Midnight Preprod Deployer Seed (gitignored)\nMIDNIGHT_DEPLOY_SEED=${seedHex}\n`;
  appendFileSync(envLocalPath, lineToAppend, { encoding: 'utf8' });
  console.log('✓ Generated new throwaway seed and saved to gitignored .env.local');
} else {
  console.log('✓ Loaded existing throwaway seed from gitignored .env.local');
}

const seedBytes = Buffer.from(seedHex, 'hex');
const hdResult = HDWallet.fromSeed(seedBytes);

if (hdResult.type !== 'seedOk') {
  console.error('Failed to initialize HDWallet from seed');
  process.exit(1);
}

const account = hdResult.hdWallet.selectAccount(0);

// Derive Unshielded Key (Role: NightExternal, Index: 0)
const unshieldedDerivation = account.selectRole(Roles.NightExternal).deriveKeyAt(0);
if (unshieldedDerivation.type !== 'keyDerived') {
  console.error('Failed to derive unshielded key');
  process.exit(1);
}

const unshieldedAddr = new UnshieldedAddress(unshieldedDerivation.key);
const unshieldedBech32 = MidnightBech32m.encode('preprod', unshieldedAddr);

// Derive Shielded Keys (Roles: Dust, Zswap for shielded keys)
const dustDerivation = account.selectRole(Roles.Dust).deriveKeyAt(0);
const zswapDerivation = account.selectRole(Roles.Zswap).deriveKeyAt(0);

let shieldedBech32Str = 'Unavailable';
if (dustDerivation.type === 'keyDerived' && zswapDerivation.type === 'keyDerived') {
  const coinPk = new ShieldedCoinPublicKey(dustDerivation.key);
  const encPk = new ShieldedEncryptionPublicKey(zswapDerivation.key);
  const shieldedAddr = new ShieldedAddress(coinPk, encPk);
  shieldedBech32Str = MidnightBech32m.encode('preprod', shieldedAddr).toString();
}

console.log('\n══════════════════════════════════════════════════════════════');
console.log('  Midnight Network Preprod Deployer Wallet');
console.log('══════════════════════════════════════════════════════════════\n');
console.log(`  Network:            preprod`);
console.log(`  Unshielded Address: ${unshieldedBech32.toString()}`);
console.log(`  Shielded Address:   ${shieldedBech32Str}`);
console.log(`  Seed Storage:       Strictly in .env.local (gitignored)`);
console.log('\n──────────────────────────────────────────────────────────────');
console.log('  Funding & DUST Instructions:');
console.log('──────────────────────────────────────────────────────────────');
console.log('  1. Navigate to the official Midnight Preprod Faucet:');
console.log('     https://faucet.preprod.midnight.network');
console.log('');
console.log('  2. Request tNIGHT by pasting the Unshielded Address:');
console.log(`     ${unshieldedBech32.toString()}`);
console.log('');
console.log('  3. In Midnight Network, contract transactions consume DUST for fees.');
console.log('     To generate DUST:');
console.log('     a) Import the seed into the Midnight Lace wallet (Testnet mode), or');
console.log('     b) The deploy harness automatically generates DUST from unshielded tNIGHT');
console.log('        using the local wallet-sdk facade during deployment.');
console.log('══════════════════════════════════════════════════════════════\n');
