/**
 * Types for Midnight Network qualification contract, witnesses, and prover integration.
 */

export interface TenantWitnessInput {
  annualIncome: number | bigint;
  creditScore?: number | bigint;
  employmentMonths?: number | bigint;
  backgroundClean: boolean;
  employmentVerified?: boolean;
  tenantSecret?: string | Uint8Array;
  tenantSalt?: string | Uint8Array;
  applicationId?: string | Uint8Array;
  issuedAt?: bigint | number;
}

export interface PropertyListingCriteria {
  monthlyRent: number | bigint;
  minMonthlyIncome: number | bigint;
  maxRentToIncomeRatioBps: number | bigint;
  minCreditScore: number | bigint;
  requireCleanBackground: boolean;
  minEmploymentMonths: number | bigint;
  primeMaxRentToIncomeRatioBps?: number | bigint;
  /** @deprecated use primeMaxRentToIncomeRatioBps */
  primeMinIncomeRatioBps?: number | bigint;
  primeMinCreditScore?: number | bigint;
  criteriaHash?: string;
  criteriaVersion?: number;
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
  constraints?: number;
  zkirInstructions?: number;
  provingTimeMs?: number;
  circuitSize: string;
  protocolVersion: string;
  isSimulated?: boolean;
}

export interface RequirementVerificationOutcome {
  required: number | boolean;
  satisfied: boolean;
  value?: number | boolean;
}

export interface MidnightProofExecutionResult {
  success: boolean;
  isEligible: boolean;
  tier: 0 | 1; // 0 = Standard, 1 = Prime
  nullifier: string;
  criteriaHash: string;
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
    rentToIncomeRatio: RequirementVerificationOutcome;
    credit: RequirementVerificationOutcome;
    background: RequirementVerificationOutcome;
    employment: RequirementVerificationOutcome;
  };
  zkMetrics: ZkMetrics;
  error?: string;
}
