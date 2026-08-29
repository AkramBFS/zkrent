import { CompiledContract } from '@midnight-ntwrk/compact-runtime';
import { deployContract, submitCallTx, createUnprovenCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { MidnightProviders, WalletProvider, MidnightProvider } from '@midnight-ntwrk/midnight-js-types';

export interface ProofResult {
  proof: Uint8Array;
  publicInputs: Uint8Array;
}

let compiledContract: ReturnType<typeof CompiledContract.make> | null = null;

async function getCompiledContract(zkConfigPath: string) {
  if (!compiledContract) {
    const { Contract } = await import('../../../../contracts/managed/qualification/contract/index.js');
    compiledContract = CompiledContract.make('QualificationContract', Contract).pipe(
      CompiledContract.withVacantWitnesses,
      CompiledContract.withCompiledFileAssets(zkConfigPath),
    );
  }
  return compiledContract;
}

export async function generateQualificationProof(
  providers: MidnightProviders<any>,
  contractAddress: string,
  zkConfigPath: string
): Promise<ProofResult> {
  const contract = await getCompiledContract(zkConfigPath);
  
  const callTxData = await createUnprovenCallTx(providers, {
    compiledContract: contract as any,
    contractAddress,
    circuitId: 'verifyQualification',
    args: [],
  });

  const { unprovenTx } = callTxData.private;
  
  const provenTx = await unprovenTx.prove(
    providers.proofProvider,
    (await import('@midnight-ntwrk/ledger-v8')).CostModel.initialCostModel()
  );

  return {
    proof: provenTx.proof,
    publicInputs: provenTx.publicInputs,
  };
}

export function createQualificationProviders(
  walletProvider: WalletProvider & MidnightProvider,
  config: {
    indexer: string;
    indexerWS: string;
    proofServer: string;
    networkId: string;
  },
  zkConfigPath: string
): MidnightProviders<any> {
  setNetworkId(config.networkId);

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: `qualification-${Date.now()}`,
      walletProvider,
      privateStoragePasswordProvider: () => 'qualification-secure-password-2024',
      accountId: `qualification-${Date.now()}`,
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}