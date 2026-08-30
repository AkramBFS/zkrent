/**
 * Types for Midnight Network qualification contract, witnesses, and prover integration.
 */

export interface TenantWitnessInput {
  annualIncome: number | bigint;
  backgroundClean: boolean;
  employmentVerified?: boolean;
}

export interface MidnightProverConfig {
  nodeUrl: string;
  nodeWsUrl: string;
  indexerUrl: string;
  indexerWsUrl: string;
  proofServerUrl: string;
  networkId: string;
  contractAddress: string;
  privateStatePassword?: string;
  zkConfigPath?: string;
}

export interface ZkMetrics {
  constraints: number;
  provingTimeMs: number;
  circuitSize: string;
  protocolVersion: string;
}

export interface RequirementVerificationOutcome {
  required: number | boolean;
  satisfied: boolean;
}

export interface MidnightProofExecutionResult {
  success: boolean;
  isEligible: boolean;
  midnightTxHash: string;
  proofHash: string;
  circuitId: string;
  blockHeight: number;
  merkleRoot: string;
  provingTimeMs: number;
  contractAddress: string;
  mode: 'live_devnet' | 'sandbox_simulation';
  requirements: {
    income: RequirementVerificationOutcome;
    background: RequirementVerificationOutcome;
    employment: RequirementVerificationOutcome;
  };
  zkMetrics: ZkMetrics;
  error?: string;
}
