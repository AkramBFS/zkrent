import {
  type CoinPublicKey,
  sampleSigningKey,
} from '@midnight-ntwrk/ledger-v8';
import {
  type EnvironmentConfiguration,
  MidnightWalletProvider,
  initializeMidnightProviders,
} from '@midnight-ntwrk/testkit-js';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import {
  createUnprovenDeployTx,
  submitTxAsync,
} from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { Contract } from '../contracts/managed/qualification/contract/index.js';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import http from 'http';
import WebSocket from 'ws';

dotenv.config({ path: '.env.local' });

const logger = pino({ level: 'info' });
const MIN_INCOME_REQ = 50000n;

async function syncWallet(
  logger: pino.Logger,
  wallet: any,
  timeout = 120_000,
): Promise<any> {
  logger.info('Syncing wallet with bounded-memory strategy...');
  const startedAt = Date.now();

  try {
    const allowedGap = 2_000n;
    const syncedState = await Promise.race([
      wallet.waitForSyncedState(allowedGap),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Wallet sync timeout after ${timeout}ms`)), timeout);
      }),
    ]);

    logger.info(`Wallet sync complete in ${Date.now() - startedAt}ms`);
    if (typeof global !== 'undefined' && 'gc' in global && typeof global.gc === 'function') {
      global.gc();
    }
    return syncedState;
  } catch (error) {
    logger.warn(`Wallet sync status: ${error instanceof Error ? error.message : String(error)}. Proceeding to deployment...`);
    if (typeof global !== 'undefined' && 'gc' in global && typeof global.gc === 'function') {
      global.gc();
    }
    return undefined;
  }
}

function buildProviders(
  wallet: any,
  zkConfigPath: string,
  config: {
    indexer: string;
    indexerWS: string;
    proofServer: string;
    networkId: string;
  },
) {
  setNetworkId(config.networkId);

  const zswapSecretKeys = wallet?.zswapSecretKeys ?? wallet?.wallet?.shieldedSecretKeys;
  const dustSecretKey = wallet?.dustSecretKey ?? wallet?.wallet?.dustSecretKey;

  if (!zswapSecretKeys?.coinPublicKey) {
    throw new Error('Wallet is missing derived shielded secret keys; coinPublicKey could not be initialized.');
  }

  const walletProvider = {
    ...wallet,
    getCoinPublicKey: () => zswapSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => zswapSecretKeys.encryptionPublicKey,
    balanceTx: async (tx: any, ttl?: any) => wallet.balanceTx(tx, ttl),
    submitTx: (tx: any) => wallet.submitTx(tx),
  };

  return initializeMidnightProviders(walletProvider, config as EnvironmentConfiguration, {
    privateStateStoreName: `qualification-deploy-${Date.now()}`,
    zkConfigPath,
  });
}

function updateEnvFile(contractAddress: string) {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const nextLine = `MIDNIGHT_CONTRACT_ADDRESS=${contractAddress}`;

  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const pattern = /^MIDNIGHT_CONTRACT_ADDRESS=.*$/m;

  if (pattern.test(content)) {
    content = content.replace(pattern, nextLine);
  } else {
    content = content.trimEnd();
    content += `${content ? '\n' : ''}${nextLine}\n`;
  }

  fs.writeFileSync(envPath, content, 'utf8');
  logger.info(`Updated .env.local with MIDNIGHT_CONTRACT_ADDRESS=${contractAddress}`);
}

function isPortOpen(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get({ host, port, timeout: 1000 }, () => {
      resolve(true);
      req.destroy();
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function resolveProofServer(): Promise<string> {
  const configuredUrl = process.env.MIDNIGHT_PROOF_SERVER_URL?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }
  const localProofServer = await isPortOpen('127.0.0.1', 6300);
  return localProofServer ? 'http://127.0.0.1:6300' : 'https://api-preprod.1am.xyz';
}

async function resolveEnvironmentConfig(): Promise<EnvironmentConfiguration> {
  const localNodeAlive = await isPortOpen('127.0.0.1', 9944);
  const indexerAlive = await isPortOpen('127.0.0.1', 8088);
  const proofAlive = await isPortOpen('127.0.0.1', 6300);

  if (localNodeAlive || indexerAlive || proofAlive) {
    logger.info('Using local Midnight devnet endpoints on localhost');
    return {
      walletNetworkId: 'undeployed',
      networkId: 'undeployed',
      indexer: 'http://127.0.0.1:8088/api/v4/graphql',
      indexerWS: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
      node: 'http://127.0.0.1:9944',
      nodeWS: 'ws://127.0.0.1:9944',
      faucet: '',
      proofServer: 'http://127.0.0.1:6300',
    };
  }

  logger.info('Falling back to Preprod network endpoints');
  const proofServer = await resolveProofServer();
  return {
    walletNetworkId: 'preprod',
    networkId: 'preprod',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    nodeWS: 'wss://rpc.preprod.midnight.network',
    faucet: '',
    proofServer,
  };
}

async function main() {
  logger.info('🚀 Starting Midnight Contract Deployment script...');

  const config = await resolveEnvironmentConfig();
  logger.info(`Resolved environment network: ${config.networkId}`);

  setNetworkId(config.networkId);
  globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;

  const seed = process.env.MIDNIGHT_DEPLOY_SEED ??
    '0000000000000000000000000000000000000000000000000000000000000001';

  const zkConfigPath = path.resolve(process.cwd(), 'contracts/managed/qualification');

  logger.info('Building wallet provider...');
  const wallet = await MidnightWalletProvider.build(logger, config, seed);
  await wallet.start(true);
  await syncWallet(logger, wallet.wallet, 120_000);

  const zswapSecretKeys = wallet.zswapSecretKeys ?? wallet.wallet?.shieldedSecretKeys;
  const dustSecretKey = wallet.dustSecretKey ?? wallet.wallet?.dustSecretKey;

  logger.info('Wallet key state:', {
    hasShieldedSecretKeys: !!zswapSecretKeys,
    hasDustSecretKey: !!dustSecretKey,
    coinPublicKey: zswapSecretKeys?.coinPublicKey ? 'present' : 'missing',
    encryptionPublicKey: zswapSecretKeys?.encryptionPublicKey ? 'present' : 'missing',
  });

  if (!zswapSecretKeys?.coinPublicKey) {
    throw new Error('Wallet did not initialize a valid coin public key for deployment. Check the Midnight network, wallet seed, and wallet sync state.');
  }

  const providers = buildProviders(wallet, zkConfigPath, {
    indexer: config.indexer,
    indexerWS: config.indexerWS,
    proofServer: config.proofServer,
    networkId: config.networkId,
  });

  logger.info('Building compact compiled contract...');
  const compiledContract = CompiledContract.make('QualificationContract', Contract as any).pipe(
    CompiledContract.withWitnesses({
      annualIncome: () => [undefined, MIN_INCOME_REQ],
      backgroundClean: () => [undefined, true],
    } as any),
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  logger.info('Deploying contract to Midnight network...');
    const deployTxData = await createUnprovenDeployTx(providers, {
      compiledContract: compiledContract as any,
      args: [MIN_INCOME_REQ],
      signingKey: sampleSigningKey(),
    });

  const contractAddress = deployTxData.public.contractAddress;
  logger.info(`Prepared deployment for contract address ${contractAddress}`);

  const txHash = await submitTxAsync(providers, { unprovenTx: deployTxData.private.unprovenTx });
  logger.info(`✅ Deployed! MIDNIGHT_CONTRACT_ADDRESS=${contractAddress} txHash=${txHash}`);
  console.log(`MIDNIGHT_CONTRACT_ADDRESS=${contractAddress}`);

  updateEnvFile(contractAddress);

  await wallet.stop();
  if (typeof global !== 'undefined' && 'gc' in global && typeof global.gc === 'function') {
    global.gc();
  }
  process.exit(0);
}

// Direct top-level invocation to guarantee execution with tsx/node
main().catch((err) => {
  console.error('\n💥 FATAL DEPLOYMENT ERROR:');
  console.error(err); // This will print the actual reason it crashed!
});