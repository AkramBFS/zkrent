/**
 * Deploy the ZkRent Qualification contract to the local Midnight devnet.
 *
 * Local network:
 *   Network:     undeployed
 *   Node:        http://127.0.0.1:9944
 *   Node WS:     ws://127.0.0.1:9944
 *   Indexer:     http://127.0.0.1:8088/api/v4/graphql
 *   Indexer WS:  ws://127.0.0.1:8088/api/v4/graphql/ws
 *   Proof server:http://127.0.0.1:6300
 *
 * Wallet:
 *   MIDNIGHT_DEPLOY_SEED
 *
 * The wallet seed is deterministic and persisted in .env.local.
 *
 * Deployment flow:
 *
 *   1. Build wallet
 *   2. Start wallet
 *   3. waitForSyncedState()
 *   4. Verify NIGHT
 *   5. Register NIGHT UTXOs for DUST
 *   6. Wait for DUST
 *   7. Verify proof server
 *   8. Deploy QualificationContract
 *   9. Persist contract address
 *  10. Persist DUST state
 */

import { randomBytes } from 'node:crypto';

import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';

import path from 'node:path';

// @ts-ignore - ws module does not expose the required TS declarations.
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

import type {
  DefaultConfiguration,
  WalletFacade,
} from '@midnight-ntwrk/wallet-sdk-facade';

import {
  WalletFacade as MidnightWalletFacade,
} from '@midnight-ntwrk/wallet-sdk-facade';

import {
  DustWallet,
  type DustWalletAPI,
} from '@midnight-ntwrk/wallet-sdk-dust-wallet';

import {
  ShieldedWallet,
} from '@midnight-ntwrk/wallet-sdk-shielded';

import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
  type UnshieldedKeystore,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';

import {
  type EnvironmentConfiguration,
  WalletSeeds,
} from '@midnight-ntwrk/testkit-js';

import * as Rx from 'rxjs';

import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

import {
  deployContract,
} from '@midnight-ntwrk/midnight-js-contracts';

import {
  indexerPublicDataProvider,
} from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';

import {
  httpClientProofProvider,
} from '@midnight-ntwrk/midnight-js-http-client-proof-provider';

import {
  levelPrivateStateProvider,
} from '@midnight-ntwrk/midnight-js-level-private-state-provider';

import {
  setNetworkId,
} from '@midnight-ntwrk/midnight-js-network-id';

import type {
  MidnightProviders,
} from '@midnight-ntwrk/midnight-js-types';

import {
  NodeZkConfigProvider,
} from '@midnight-ntwrk/midnight-js-node-zk-config-provider';

import {
  Contract,
} from '../contracts/managed/qualification/contract/index.js';

import pino from 'pino';
import dotenv from 'dotenv';


/* -------------------------------------------------------------------------- */
/* Environment                                                                */
/* -------------------------------------------------------------------------- */

dotenv.config({
  path: '.env.local',
});


/*
 * Midnight wallet SDK requires WebSocket on globalThis.
 */
(globalThis as {
  WebSocket?: unknown;
}).WebSocket ??= WebSocket;


/* -------------------------------------------------------------------------- */
/* Logger                                                                     */
/* -------------------------------------------------------------------------- */

const logger = pino({
  level:
    process.env.LOG_LEVEL ??
    'info',

  transport: {
    target: 'pino-pretty',
  },
});


/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const NETWORK = 'undeployed';

const CHECKPOINT_MS =
  60_000;

/*
 * Local devnet should generate DUST quickly.
 *
 * Five minutes is long enough to tolerate:
 *   - indexer lag
 *   - block timing
 *   - DUST registration propagation
 *
 * If this expires, fail loudly instead of hanging forever.
 */
const DUST_WAIT_TIMEOUT_MS =
  5 * 60 * 1_000;


/*
 * Deployment retry configuration.
 *
 * Fresh local devnets can have a race between:
 *
 *   NIGHT registration
 *        ↓
 *   DUST generation
 *        ↓
 *   transaction balancing
 *
 * Retry deployment rather than treating this as a permanent
 * deployment failure.
 */
const MAX_DEPLOY_RETRIES =
  20;

const DEPLOY_RETRY_DELAY_MS =
  5_000;


/*
 * Proof server polling.
 */
const PROOF_SERVER_MAX_ATTEMPTS =
  60;

const PROOF_SERVER_DELAY_MS =
  2_000;


/*
 * Qualification contract constructor argument.
 */
const MIN_INCOME_REQ =
  BigInt(
    process.env.MIDNIGHT_MIN_INCOME_REQ ??
    '50000',
  );


/*
 * Private state identifier for the Qualification contract.
 */
const PRIVATE_STATE_ID =
  'qualification-deploy';


/*
 * The SDK requires a sufficiently long private-state password.
 */
const PRIVATE_STATE_PASSWORD =
  process.env.MIDNIGHT_PRIVATE_STATE_PASSWORD?.trim() ||
  'Local-Devnet-Development-Placeholder-1';


/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type PersistentWallet = {
  wallet: WalletFacade;

  keystore: UnshieldedKeystore;

  zswapSecretKeys: ZswapSecretKeys;

  dustSecretKey: DustSecretKey;

  checkpoint(): Promise<void>;

  startCheckpointing(): () => void;
};


/* -------------------------------------------------------------------------- */
/* Network configuration                                                      */
/* -------------------------------------------------------------------------- */

function getConfig(): EnvironmentConfiguration {
  const node =
    process.env.MIDNIGHT_NODE_URL ??
    'http://127.0.0.1:9944';

  return {
    walletNetworkId:
      NETWORK,

    networkId:
      NETWORK,

    indexer:
      process.env.MIDNIGHT_INDEXER_URL ??
      'http://127.0.0.1:8088/api/v4/graphql',

    indexerWS:
      process.env.MIDNIGHT_INDEXER_WS_URL ??
      'ws://127.0.0.1:8088/api/v4/graphql/ws',

    node,

    nodeWS:
      process.env.MIDNIGHT_NODE_WS_URL ??
      'ws://127.0.0.1:9944',

    /*
     * Local devnet does not use a faucet.
     *
     * Funding is performed by midnight-local-dev.
     */
    faucet:
      '',

    proofServer:
      process.env.MIDNIGHT_PROOF_SERVER_URL ??
      'http://127.0.0.1:6300',
  };
}


/* -------------------------------------------------------------------------- */
/* Seed                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Get or create the deterministic local deployment wallet seed.
 *
 * This is deliberately persisted so that:
 *
 *   run #1 → fund wallet
 *   run #2 → same wallet
 *   run #3 → same wallet
 *
 * The seed must be exactly 32 bytes / 64 hexadecimal characters.
 */
function getSeed(): string {
  const existingSeed =
    process.env.MIDNIGHT_DEPLOY_SEED?.trim();

  if (existingSeed) {
    if (
      !/^[0-9a-fA-F]{64}$/.test(
        existingSeed,
      )
    ) {
      throw new Error(
        [
          'Invalid MIDNIGHT_DEPLOY_SEED.',

          '',

          'MIDNIGHT_DEPLOY_SEED must contain exactly',
          '64 hexadecimal characters (32 bytes).',
        ].join('\n'),
      );
    }

    return existingSeed;
  }

  const generated =
    randomBytes(32).toString('hex');

  const envPath =
    path.resolve(
      process.cwd(),
      '.env.local',
    );

  const prefix =
    existsSync(envPath)
      ? '\n'
      : '';

  writeFileSync(
    envPath,

    `${prefix}` +
    `# Headless Midnight local deploy wallet seed.\n` +
    `MIDNIGHT_DEPLOY_SEED="${generated}"\n`,

    {
      flag: 'a',
      encoding: 'utf8',
    },
  );

  logger.warn(
    `Generated MIDNIGHT_DEPLOY_SEED in ${envPath}.`,
  );

  logger.warn(
    [
      'IMPORTANT: fund this wallet using midnight-local-dev,',
      'then rerun the deployment script.',
    ].join(' '),
  );

  return generated;
}


/* -------------------------------------------------------------------------- */
/* Wallet configuration                                                       */
/* -------------------------------------------------------------------------- */

function walletConfig(
  env: EnvironmentConfiguration,
): DefaultConfiguration {
  return {
    indexerClientConnection: {
      indexerHttpUrl:
        env.indexer,

      indexerWsUrl:
        env.indexerWS,
    },

    provingServerUrl:
      new URL(
        env.proofServer,
      ),

    networkId:
      env.walletNetworkId,

    relayURL:
      new URL(
        env.nodeWS,
      ),

    txHistoryStorage:
      new InMemoryTransactionHistoryStorage(),

    costParameters: {
      additionalFeeOverhead:
        1_000n,

      feeBlocksMargin:
        5,
    },
  } as DefaultConfiguration;
}


/* -------------------------------------------------------------------------- */
/* Chain time                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Read the local chain timestamp.
 *
 * This is used by the DUST wallet so DUST balancing uses chain
 * time rather than potentially-ahead wall-clock time.
 */
async function chainNow(
  env: EnvironmentConfiguration,
): Promise<Date> {
  try {
    const response =
      await fetch(
        env.indexer,
        {
          method: 'POST',

          headers: {
            'content-type':
              'application/json',
          },

          body: JSON.stringify({
            query:
              '{ block { timestamp } }',
          }),

          signal:
            AbortSignal.timeout(
              4_000,
            ),
        },
      );

    const json =
      (await response.json()) as {
        data?: {
          block?: {
            timestamp?: number;
          };
        };
      };

    const timestamp =
      json.data?.block?.timestamp;

    if (
      typeof timestamp ===
      'number' &&
      timestamp > 0
    ) {
      /*
       * Small allowance for block propagation.
       */
      return new Date(
        timestamp + 2_000,
      );
    }
  } catch {
    /*
     * Fall back to host time.
     */
  }

  return new Date();
}


/* -------------------------------------------------------------------------- */
/* DUST checkpoint healing                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Heal a stale DUST checkpoint after an interrupted deployment.
 *
 * A previous pending DUST transaction can leave the local serialized
 * state in a state where no usable UTXOs are immediately visible.
 */
function healStalePendingDust(
  snapshot: string,
): string {
  try {
    const parsed =
      JSON.parse(
        snapshot,
      ) as {
        state?: string;
      };

    if (!parsed.state) {
      return snapshot;
    }

    const state =
      DustLocalState.deserialize(
        Uint8Array.from(
          Buffer.from(
            parsed.state,
            'hex',
          ),
        ),
      );

    if (
      state.utxos.length > 0
    ) {
      return snapshot;
    }

    const healed =
      state.processTtls(
        new Date(
          Date.now() +
          4 * 60 * 60_000,
        ),
      );

    if (
      healed.utxos.length === 0
    ) {
      return snapshot;
    }

    parsed.state =
      Buffer.from(
        healed.serialize(),
      ).toString('hex');

    logger.warn(
      [
        'Released',
        healed.utxos.length,
        'stale pending DUST spend(s) from checkpoint.',
      ].join(' '),
    );

    return JSON.stringify(
      parsed,
    );
  } catch {
    return snapshot;
  }
}


/* -------------------------------------------------------------------------- */
/* DUST chain-time wrapper                                                    */
/* -------------------------------------------------------------------------- */

function withChainTime(
  dust: DustWalletAPI,
  env: EnvironmentConfiguration,
): DustWalletAPI {
  return new Proxy(
    dust as object,
    {
      get(
        target,
        prop,
        receiver,
      ) {
        if (
          prop ===
          'balanceTransactions'
        ) {
          return async (
            secretKey: DustSecretKey,

            transactions:
              Parameters<
                DustWalletAPI[
                'balanceTransactions'
                ]
              >[1],

            ttl: Date,

            currentTime?: Date,
          ) =>
            (
              target as DustWalletAPI
            ).balanceTransactions(
              secretKey,

              transactions,

              ttl,

              currentTime ??
              (await chainNow(
                env,
              )),
            );
        }

        const value =
          Reflect.get(
            target,
            prop,
            receiver,
          );

        return typeof value ===
          'function'
          ? value.bind(target)
          : value;
      },
    },
  ) as DustWalletAPI;
}


/* -------------------------------------------------------------------------- */
/* Persistent wallet                                                          */
/* -------------------------------------------------------------------------- */

async function buildPersistentWallet(
  env: EnvironmentConfiguration,
  seedHex: string,
  stateDir: string,
): Promise<PersistentWallet> {
  mkdirSync(
    stateDir,
    {
      recursive: true,
    },
  );

  const config =
    walletConfig(
      env,
    );

  const seeds =
    WalletSeeds.fromMasterSeed(
      seedHex,
    );

  const keystore =
    createKeystore(
      seeds.unshielded,
      env.walletNetworkId as never,
    );

  const dustStatePath =
    path.join(
      stateDir,

      `dust-${env.walletNetworkId}-${seedHex.slice(
        0,
        8,
      )}.state`,
    );


  /*
   * Shielded wallet.
   */
  const shieldedWallet =
    ShieldedWallet(
      config,
    ).startWithSeed(
      seeds.shielded,
    );


  /*
   * Unshielded wallet.
   */
  const unshieldedWallet =
    UnshieldedWallet({
      ...config,

      txHistoryStorage:
        new InMemoryTransactionHistoryStorage(),
    }).startWithPublicKey(
      PublicKey.fromKeyStore(
        keystore,
      ),
    );


  /*
   * DUST wallet.
   */
  const dustConfig = {
    ...config,

    costParameters: {
      ledgerParams:
        LedgerParameters.initialParameters(),

      additionalFeeOverhead:
        1_000n,

      feeBlocksMargin:
        5,
    },
  };

  const Dust =
    DustWallet(
      dustConfig,
    );

  let dustWallet:
    DustWalletAPI;


  /*
   * Restore DUST checkpoint when available.
   */
  if (
    existsSync(
      dustStatePath,
    )
  ) {
    try {
      const snapshot =
        healStalePendingDust(
          readFileSync(
            dustStatePath,
            'utf8',
          ),
        );

      dustWallet =
        Dust.restore(
          snapshot,
        );

      logger.info(
        [
          'Restored DUST wallet checkpoint:',
          `${(
            snapshot.length / 1e6
          ).toFixed(1)}MB`,
        ].join(' '),
      );
    } catch (error) {
      logger.warn(
        [
          'DUST checkpoint unusable.',
          'Starting cold.',
          error instanceof Error
            ? error.message
            : String(error),
        ].join(' '),
      );

      dustWallet =
        Dust.startWithSeed(
          seeds.dust,

          LedgerParameters
            .initialParameters()
            .dust,
        );
    }
  } else {
    logger.info(
      [
        'No DUST checkpoint found.',
        'Starting DUST scan from genesis.',
      ].join(' '),
    );

    dustWallet =
      Dust.startWithSeed(
        seeds.dust,

        LedgerParameters
          .initialParameters()
          .dust,
      );
  }


  /*
   * Initialize the unified WalletFacade.
   */
  const wallet =
    await MidnightWalletFacade.init({
      configuration:
        config,

      shielded: () =>
        shieldedWallet,

      unshielded: () =>
        unshieldedWallet,

      dust: () =>
        withChainTime(
          dustWallet,
          env,
        ),
    });


  /*
   * Persist only the DUST state.
   *
   * WalletFacade itself provides waitForSyncedState(), which is
   * now used instead of manually subscribing to wallet.state().
   */
  const checkpoint =
    async () => {
      try {
        const snapshot =
          await dustWallet.serializeState();

        const tempPath =
          `${dustStatePath}.tmp`;

        writeFileSync(
          tempPath,
          snapshot,
          'utf8',
        );

        renameSync(
          tempPath,
          dustStatePath,
        );
      } catch (error) {
        logger.warn(
          [
            'DUST checkpoint failed:',
            error instanceof Error
              ? error.message
              : String(error),
          ].join(' '),
        );
      }
    };


  return {
    wallet,

    keystore,

    zswapSecretKeys:
      ZswapSecretKeys.fromSeed(
        seeds.shielded,
      ),

    dustSecretKey:
      DustSecretKey.fromSeed(
        seeds.dust,
      ),

    checkpoint,

    startCheckpointing() {
      const interval =
        setInterval(
          () => {
            void checkpoint();
          },
          CHECKPOINT_MS,
        );

      return () =>
        clearInterval(
          interval,
        );
    },
  };
}


/* -------------------------------------------------------------------------- */
/* Wallet provider                                                            */
/* -------------------------------------------------------------------------- */

function buildWalletProvider(
  pw: PersistentWallet,
): MidnightProvider &
  WalletProvider {
  return {
    getCoinPublicKey():
      CoinPublicKey {
      return pw
        .zswapSecretKeys
        .coinPublicKey;
    },

    getEncryptionPublicKey():
      EncPublicKey {
      return pw
        .zswapSecretKeys
        .encryptionPublicKey;
    },


    /**
     * Balance an unbound transaction.
     *
     * IMPORTANT:
     *
     * With the current wallet SDK path used by the reference
     * implementation, balanceUnboundTransaction() already produces
     * a recipe containing the required signatures.
     *
     * Therefore we finalize directly.
     *
     * DO NOT:
     *
     *   balance → signRecipe → finalize
     *
     * here.
     */
    async balanceTx(
      tx: UnboundTransaction,
      ttl?: Date,
    ): Promise<FinalizedTransaction> {
      const recipe =
        await pw.wallet
          .balanceUnboundTransaction(
            tx as any,

            {
              shieldedSecretKeys:
                pw.zswapSecretKeys,

              dustSecretKey:
                pw.dustSecretKey,
            },

            {
              ttl:
                ttl ??
                new Date(
                  Date.now() +
                  30 * 60_000,
                ),
            },
          );

      return pw.wallet
        .finalizeRecipe(
          recipe,
        );
    },


    submitTx(
      tx: FinalizedTransaction,
    ): Promise<string> {
      return pw.wallet
        .submitTransaction(
          tx,
        );
    },
  };
}


/* -------------------------------------------------------------------------- */
/* Midnight providers                                                         */
/* -------------------------------------------------------------------------- */

function buildProviders(
  walletProvider:
    MidnightProvider &
    WalletProvider,

  zkConfigPath: string,

  config:
    EnvironmentConfiguration,

  accountId: string,
): MidnightProviders<any> {
  setNetworkId(
    config.networkId,
  );

  const zkConfigProvider =
    new NodeZkConfigProvider(
      zkConfigPath,
    );

  return {
    privateStateProvider:
      levelPrivateStateProvider({
        privateStateStoreName:
          PRIVATE_STATE_ID,

        /*
         * Use the actual wallet address as the account ID.
         *
         * This matches the reference deployment architecture
         * and avoids tying private-state storage to a generic
         * deployment identifier.
         */
        accountId,

        privateStoragePasswordProvider:
          () =>
            PRIVATE_STATE_PASSWORD,
      }),

    publicDataProvider:
      indexerPublicDataProvider(
        config.indexer,
        config.indexerWS,
      ),

    zkConfigProvider,

    proofProvider:
      httpClientProofProvider(
        config.proofServer,
        zkConfigProvider,
      ),

    walletProvider,

    midnightProvider:
      walletProvider,
  };
}


/* -------------------------------------------------------------------------- */
/* Environment update                                                         */
/* -------------------------------------------------------------------------- */

function updateEnvFile(
  contractAddress: string,
): void {
  const envPath =
    path.resolve(
      process.cwd(),
      '.env.local',
    );

  const line =
    `MIDNIGHT_CONTRACT_ADDRESS="${contractAddress}"`;


  if (
    !existsSync(
      envPath,
    )
  ) {
    writeFileSync(
      envPath,
      `${line}\n`,
      'utf8',
    );

    logger.info(
      'Created .env.local with contract address.',
    );

    return;
  }


  let content =
    readFileSync(
      envPath,
      'utf8',
    );


  if (
    content.includes(
      'MIDNIGHT_CONTRACT_ADDRESS=',
    )
  ) {
    content =
      content.replace(
        /^MIDNIGHT_CONTRACT_ADDRESS=.*$/m,
        line,
      );
  } else {
    content +=
      `${content.endsWith(
        '\n',
      )
        ? ''
        : '\n'
      }${line}\n`;
  }


  writeFileSync(
    envPath,
    content,
    'utf8',
  );

  logger.info(
    'Updated .env.local with contract address.',
  );
}


/* -------------------------------------------------------------------------- */
/* Proof server                                                               */
/* -------------------------------------------------------------------------- */

async function waitForProofServer(
  maxAttempts =
    PROOF_SERVER_MAX_ATTEMPTS,

  delayMs =
    PROOF_SERVER_DELAY_MS,
): Promise<boolean> {
  const proofServer =
    getConfig().proofServer;

  logger.info(
    `Checking proof server: ${proofServer}`,
  );

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    try {
      /*
       * We only need to establish that the HTTP endpoint responds.
       *
       * Different proof-server versions expose different GET endpoints,
       * so a successful HTTP connection is sufficient here.
       */
      await fetch(
        proofServer,
        {
          method: 'GET',

          signal:
            AbortSignal.timeout(
              3_000,
            ),
        },
      );

      logger.info(
        'Proof server is reachable.',
      );

      return true;
    } catch (error: any) {
      const code =
        error?.cause?.code ??
        error?.code ??
        '';

      const connectionFailure =
        code ===
        'ECONNREFUSED' ||
        code ===
        'UND_ERR_CONNECT_TIMEOUT' ||
        code ===
        'UND_ERR_SOCKET';

      /*
       * A non-connection HTTP error still proves that the
       * server is alive.
       */
      if (
        !connectionFailure
      ) {
        logger.info(
          'Proof server is reachable.',
        );

        return true;
      }
    }


    if (
      attempt <
      maxAttempts
    ) {
      process.stdout.write(
        `\rWaiting for proof server... ` +
        `(${attempt}/${maxAttempts})   `,
      );

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            delayMs,
          ),
      );
    }
  }

  process.stdout.write('\n');

  return false;
}


/* -------------------------------------------------------------------------- */
/* Wallet synchronization                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Synchronize the wallet using the facade's supported synchronization
 * primitive.
 *
 * This is deliberately NOT implemented as:
 *
 *   wallet.state()
 *
 * immediately after wallet.start().
 *
 * That was the point where the previous deployment script was hanging.
 */
async function waitForWalletSync(
  pw: PersistentWallet,
): Promise<any> {
  logger.info(
    'Synchronizing deployment wallet with local devnet...',
  );

  const started =
    Date.now();

  const progressInterval =
    setInterval(
      () => {
        const elapsed =
          Math.round(
            (Date.now() -
              started) /
            1_000,
          );

        logger.info(
          `Wallet still syncing... (${elapsed}s elapsed)`,
        );
      },
      5_000,
    );

  try {
    const state =
      await pw.wallet
        .waitForSyncedState();

    return state;
  } finally {
    clearInterval(
      progressInterval,
    );
  }
}


/* -------------------------------------------------------------------------- */
/* NIGHT / DUST setup                                                         */
/* -------------------------------------------------------------------------- */

async function ensureDeployFunds(
  pw: PersistentWallet,
): Promise<void> {
  const nightRaw =
    unshieldedToken().raw;

  const address =
    pw.keystore
      .getBech32Address()
      .toString();


  /*
   * IMPORTANT:
   *
   * waitForSyncedState() is the synchronization primitive.
   *
   * Do not call wallet.state() here to initiate synchronization.
   */
  let state =
    await waitForWalletSync(
      pw,
    );


  let night =
    state
      .unshielded
      .balances[
    nightRaw
    ] ?? 0n;


  logger.info(
    `Deploy wallet address: ${address}`,
  );

  logger.info(
    `Deploy wallet NIGHT balance: ${night}`,
  );


  /*
   * The local funding tool should have funded this exact wallet.
   */
  if (
    night === 0n
  ) {
    throw new Error(
      [
        'Deploy wallet has no NIGHT.',

        '',

        `Address: ${address}`,

        '',

        'Fund this exact wallet using midnight-local-dev.',

        '',

        'Example:',

        '  cd ../midnight-local-dev',

        '  npm start',

        '',

        'Then choose:',

        '  1) Fund accounts from config file',

        '',

        'The accounts.json mnemonic must derive the same wallet',
        'as MIDNIGHT_DEPLOY_SEED.',
      ].join('\n'),
    );
  }


  /*
   * Find NIGHT UTXOs which have not been registered for DUST.
   */
  const unregisteredUtxos =
    state
      .unshielded
      .availableCoins
      .filter(
        (coin: any) =>
          coin.utxo.type ===
          nightRaw &&
          !coin.meta
            ?.registeredForDustGeneration,
      );


  if (
    unregisteredUtxos.length >
    0
  ) {
    logger.info(
      [
        'Registering',
        unregisteredUtxos.length,
        'NIGHT UTXO(s) for DUST generation...',
      ].join(' '),
    );


    /*
     * IMPORTANT:
     *
     * The registration callback signs the required inputs.
     *
     * Do NOT call signRecipe() afterwards.
     *
     * Reference implementation:
     *
     *   registerNightUtxosForDustGeneration()
     *        ↓
     *   finalizeRecipe()
     *        ↓
     *   submitTransaction()
     */
    const recipe =
      await pw.wallet
        .registerNightUtxosForDustGeneration(
          unregisteredUtxos,

          pw.keystore
            .getPublicKey(),

          (
            payload: Uint8Array,
          ) =>
            pw.keystore
              .signData(
                payload,
              ),
        );


    const finalized =
      await pw.wallet
        .finalizeRecipe(
          recipe,
        );


    const txId =
      await pw.wallet
        .submitTransaction(
          finalized,
        );


    logger.info(
      `DUST registration transaction submitted: ${txId}`,
    );
  } else {
    logger.info(
      'All NIGHT UTXOs are already registered for DUST generation.',
    );
  }


  /*
   * Refresh synced state after registration.
   *
   * This gives the wallet a chance to observe the registration
   * transaction before we evaluate DUST.
   */
  state =
    await waitForWalletSync(
      pw,
    );


  /*
   * If DUST is already available, we're done.
   */
  const initialDust =
    state.dust.balance(
      new Date(),
    );


  if (
    initialDust > 0n
  ) {
    logger.info(
      `DUST already available: ${initialDust}`,
    );

    await pw.checkpoint();

    return;
  }


  /*
   * DUST generation is asynchronous.
   *
   * Use the wallet's synchronized state stream only AFTER
   * the wallet has been started and synchronized through the
   * supported waitForSyncedState() API.
   */
  logger.info(
    'Waiting for DUST tokens...',
  );


  const dustStart =
    Date.now();


  while (
    Date.now() -
    dustStart <
    DUST_WAIT_TIMEOUT_MS
  ) {
    state =
      await pw.wallet
        .waitForSyncedState();


    const dust =
      state.dust.balance(
        new Date(),
      );


    const progress =
      state.dust.state
        .progress;


    const applied =
      progress?.appliedIndex;

    const highest =
      progress?.highestRelevantWalletIndex;


    const caughtUp =
      applied !==
      undefined &&
      highest !==
      undefined &&
      BigInt(applied) >=
      BigInt(highest);


    if (
      caughtUp &&
      dust > 0n
    ) {
      logger.info(
        [
          'DUST ready.',
          `balance=${dust}`,
          `applied=${applied}`,
          `tip=${highest}`,
        ].join(' '),
      );

      await pw.checkpoint();

      return;
    }


    const elapsed =
      Math.round(
        (Date.now() -
          dustStart) /
        1_000,
      );


    logger.info(
      [
        'Waiting for DUST...',
        `balance=${dust}`,
        `applied=${applied}`,
        `tip=${highest}`,
        `elapsed=${elapsed}s`,
      ].join(' '),
    );


    /*
     * Give the local chain/indexer time to advance.
     */
    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          5_000,
        ),
    );
  }


  throw new Error(
    [
      `No DUST became available after ${Math.round(
        DUST_WAIT_TIMEOUT_MS /
        60_000,
      )} minutes.`,

      '',

      `Wallet: ${address}`,

      `NIGHT: ${night}`,

      '',

      'Common causes:',

      '  • midnight-local-dev is not producing blocks',

      '  • the wallet was not actually funded',

      '  • NIGHT UTXOs were not registered',

      '  • the indexer is still catching up',

      '  • the local devnet was recreated and wallet state is stale',

      '',

      'Check:',

      '  docker compose ps',

      '  docker compose logs node',

      '  docker compose logs indexer',
    ].join('\n'),
  );
}


/* -------------------------------------------------------------------------- */
/* Deployment                                                                 */
/* -------------------------------------------------------------------------- */

async function deployQualification(
  providers:
    MidnightProviders<any>,

  compiledContract: any,
): Promise<any> {
  /*
   * Fresh local devnets can briefly expose DUST that cannot yet
   * be spent by the transaction balancer.
   *
   * Retry only transient DUST-related failures.
   */
  for (
    let attempt = 1;
    attempt <=
    MAX_DEPLOY_RETRIES;
    attempt++
  ) {
    try {
      logger.info(
        `Deployment attempt ${attempt}/${MAX_DEPLOY_RETRIES}...`,
      );


      const deployed =
        await deployContract(
          providers,

          {
            compiledContract,

            args: [
              MIN_INCOME_REQ,
            ],

            privateStateId:
              PRIVATE_STATE_ID,

            initialPrivateState:
              {},
          } as never,
        );


      return deployed;
    } catch (error: any) {
      const message =
        error?.message ??
        String(error);

      const cause =
        error?.cause?.message ??
        error?.cause?.toString() ??
        '';


      const fullError =
        `${message} ${cause}`;


      const isDustShortage =
        fullError.includes(
          'Not enough Dust',
        ) ||
        fullError.includes(
          'Insufficient Funds',
        ) ||
        fullError.includes(
          'could not balance dust',
        ) ||
        fullError.includes(
          'insufficient dust',
        );


      if (
        !isDustShortage
      ) {
        logger.error(
          {
            error,
          },
          `Deployment attempt ${attempt} failed.`,
        );

        throw error;
      }


      if (
        attempt === 1
      ) {
        logger.warn(
          'DUST is not spendable yet; retrying deployment after the local chain advances...',
        );
      } else {
        logger.warn(
          [
            'DUST shortage during deployment.',
            `attempt=${attempt}/${MAX_DEPLOY_RETRIES}`,
          ].join(' '),
        );
      }


      if (
        attempt >=
        MAX_DEPLOY_RETRIES
      ) {
        throw new Error(
          [
            'Deployment failed because the wallet could not obtain',
            'enough spendable DUST.',

            '',

            `Last error: ${fullError}`,

            '',

            'The wallet may have DUST by balance projection,',
            'but the required DUST UTXO may not yet be spendable.',
          ].join(' '),
          {
            cause: error,
          },
        );
      }


      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            DEPLOY_RETRY_DELAY_MS,
          ),
      );
    }
  }


  throw new Error(
    'Deployment failed after all retries.',
  );
}


/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  const config =
    getConfig();


  /*
   * Explicitly configure Midnight.js for the local network.
   */
  setNetworkId(
    config.networkId,
  );


  logger.info(
    '========================================',
  );

  logger.info(
    'ZkRent Midnight LOCAL deployment',
  );

  logger.info(
    `Network: ${NETWORK}`,
  );

  logger.info(
    `Node: ${config.node}`,
  );

  logger.info(
    `Node WS: ${config.nodeWS}`,
  );

  logger.info(
    `Indexer: ${config.indexer}`,
  );

  logger.info(
    `Indexer WS: ${config.indexerWS}`,
  );

  logger.info(
    `Proof server: ${config.proofServer}`,
  );

  logger.info(
    '========================================',
  );


  /* ---------------------------------------------------------------------- */
  /* Seed                                                                   */
  /* ---------------------------------------------------------------------- */

  const seed =
    getSeed();


  /* ---------------------------------------------------------------------- */
  /* ZK assets                                                              */
  /* ---------------------------------------------------------------------- */

  const zkConfigPath =
    path.resolve(
      process.cwd(),
      'contracts/managed/qualification',
    );


  const contractPath =
    path.join(
      zkConfigPath,
      'contract',
      'index.js',
    );


  if (
    !existsSync(
      contractPath,
    )
  ) {
    throw new Error(
      [
        'Qualification contract is not compiled.',

        '',

        `Expected: ${contractPath}`,

        '',

        'Run your Compact compile command first.',
      ].join('\n'),
    );
  }


  if (
    !existsSync(
      path.join(
        zkConfigPath,
        'keys',
      ),
    ) ||
    !existsSync(
      path.join(
        zkConfigPath,
        'zkir',
      ),
    )
  ) {
    throw new Error(
      [
        `Missing ZK assets in ${zkConfigPath}.`,

        '',

        'Expected:',

        `  ${zkConfigPath}/keys`,

        `  ${zkConfigPath}/zkir`,

        '',

        'Recompile the Compact qualification contract.',
      ].join('\n'),
    );
  }


  /*
   * Your project already statically imports the generated contract.
   *
   * Keep that generated Contract object rather than dynamically importing
   * another copy.
   */
  const compiledContract =
    CompiledContract
      .make(
        'qualification',
        Contract as never,
      )
      .pipe(
        CompiledContract
          .withVacantWitnesses,

        CompiledContract
          .withCompiledFileAssets(
            zkConfigPath,
          ),
      );


  /* ---------------------------------------------------------------------- */
  /* Wallet                                                                 */
  /* ---------------------------------------------------------------------- */

  const walletStateDir =
    path.resolve(
      process.cwd(),
      '.wallet-state',
    );


  logger.info(
    'Creating deployment wallet...',
  );


  const pw =
    await buildPersistentWallet(
      config,
      seed,
      walletStateDir,
    );


  const address =
    pw.keystore
      .getBech32Address()
      .toString();


  logger.info(
    `Deploy wallet address: ${address}`,
  );


  /* ---------------------------------------------------------------------- */
  /* Start wallet                                                           */
  /* ---------------------------------------------------------------------- */

  logger.info(
    'Starting wallet...',
  );


  await pw.wallet.start(
    pw.zswapSecretKeys,
    pw.dustSecretKey,
  );


  logger.info(
    'Wallet started successfully.',
  );


  /*
   * IMPORTANT:
   *
   * Do NOT stop the shielded wallet here.
   *
   * The reference implementation keeps the wallet lifecycle unified
   * while synchronization and transaction preparation are performed.
   *
   * The previous script stopped shielded immediately after start(),
   * before the new synchronization path was established.
   */


  const stopCheckpointing =
    pw.startCheckpointing();


  try {
    /* ------------------------------------------------------------------ */
    /* Sync + funding                                                     */
    /* ------------------------------------------------------------------ */

    await ensureDeployFunds(
      pw,
    );


    /* ------------------------------------------------------------------ */
    /* Proof server                                                       */
    /* ------------------------------------------------------------------ */

    logger.info(
      'Checking proof server readiness...',
    );


    const proofServerReady =
      await waitForProofServer();


    if (
      !proofServerReady
    ) {
      throw new Error(
        [
          'Proof server did not become reachable.',

          '',

          `Expected: ${config.proofServer}`,

          '',

          'Check:',

          '  docker compose ps',

          '  docker compose logs proof-server',
        ].join('\n'),
      );
    }


    /* ------------------------------------------------------------------ */
    /* Providers                                                          */
    /* ------------------------------------------------------------------ */

    logger.info(
      'Creating Midnight.js providers...',
    );


    const walletProvider =
      buildWalletProvider(
        pw,
      );


    const providers =
      buildProviders(
        walletProvider,

        zkConfigPath,

        config,

        address,
      );


    /* ------------------------------------------------------------------ */
    /* Give DUST one block to become spendable                            */
    /* ------------------------------------------------------------------ */

    logger.info(
      'Allowing freshly generated DUST to become spendable...',
    );


    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          6_000,
        ),
    );


    /* ------------------------------------------------------------------ */
    /* Deploy                                                             */
    /* ------------------------------------------------------------------ */

    logger.info(
      [
        'Deploying QualificationContract...',
        `minIncomeReq=${MIN_INCOME_REQ}`,
      ].join(' '),
    );


    const deployed =
      await deployQualification(
        providers,

        compiledContract as any,
      );


    const contractAddress =
      deployed
        .deployTxData
        .public
        .contractAddress;


    /* ------------------------------------------------------------------ */
    /* Success                                                            */
    /* ------------------------------------------------------------------ */

    logger.info(
      '========================================',
    );

    logger.info(
      'QualificationContract deployed successfully.',
    );

    logger.info(
      `Contract address: ${contractAddress}`,
    );

    logger.info(
      '========================================',
    );


    console.log(
      `MIDNIGHT_CONTRACT_ADDRESS=${contractAddress}`,
    );


    updateEnvFile(
      contractAddress,
    );


    /*
     * Persist DUST state after successful deployment.
     */
    await pw.checkpoint();


    logger.info(
      'Deployment state saved.',
    );
  } finally {
    /* ------------------------------------------------------------------ */
    /* Cleanup                                                            */
    /* ------------------------------------------------------------------ */

    stopCheckpointing();


    await pw
      .checkpoint()
      .catch(
        () => undefined,
      );


    logger.info(
      'Stopping wallet...',
    );


    await pw.wallet
      .stop()
      .catch(
        (error) => {
          logger.warn(
            [
              'Wallet stop failed:',
              error instanceof Error
                ? error.message
                : String(error),
            ].join(' '),
          );
        },
      );
  }
}


/* -------------------------------------------------------------------------- */
/* Entry point                                                                */
/* -------------------------------------------------------------------------- */

main()
  .catch(
    (error) => {
      logger.error(
        {
          error,
        },
        'Deployment failed.',
      );

      process.exitCode = 1;
    },
  );