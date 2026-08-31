import { MidnightWalletProvider, initializeMidnightProviders } from '@midnight-ntwrk/testkit-js';
import { createUnprovenDeployTx } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { sampleSigningKey } from '@midnight-ntwrk/ledger-v8';
import { Contract } from './contracts/managed/qualification/contract/index.js';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

async function main() {
  const logger = { info(){}, warn(){}, error(){}, debug(){} };
  const env = {
    walletNetworkId: 'undeployed',
    networkId: 'undeployed',
    indexer: 'http://127.0.0.1:8088/api/v4/graphql',
    indexerWS: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
    node: 'http://127.0.0.1:9944',
    nodeWS: 'ws://127.0.0.1:9944',
    faucet: '',
    proofServer: 'http://127.0.0.1:6300',
  };

  setNetworkId(env.networkId);
  const wallet = await MidnightWalletProvider.build(logger, env, '0000000000000000000000000000000000000000000000000000000000000001');
  await wallet.start(true);
  const zswap = wallet.zswapSecretKeys;
  console.log('wallet key test', wallet.getCoinPublicKey(), wallet.getEncryptionPublicKey(), !!zswap, !!zswap?.coinPublicKey, !!zswap?.encryptionPublicKey);
  const providers = initializeMidnightProviders(wallet, env, { privateStateStoreName: 'qual-debug', zkConfigPath: './contracts/managed/qualification' });
  console.log('provider coin', providers.walletProvider.getCoinPublicKey());
  const compiled = CompiledContract.make('QualificationContract', Contract).pipe(
    CompiledContract.withWitnesses({ annualIncome: () => [undefined, 50000n], backgroundClean: () => [undefined, true] }),
    CompiledContract.withCompiledFileAssets('./contracts/managed/qualification')
  );

  try {
    const tx = await createUnprovenDeployTx(providers, { compiledContract: compiled, args: [50000n], signingKey: sampleSigningKey() });
    console.log('deploy ok', tx.public.contractAddress);
  } catch (e) {
    console.error('deploy failed', e);
    console.error('cause', e?.cause);
  }

  await wallet.stop();
}

main();
