import { executeMidnightQualificationProof } from '@/midnight/zk';
import type { ZkMetrics } from '@/midnight/types';

export interface PropertyQualificationRules {
  minIncome: number;
  requireBackground: boolean;
  requireEmployment: boolean;
  verificationFee?: number;
  monthlyRent?: number;
  maxRentToIncomeRatioBps?: number;
  minCreditScore?: number;
  minEmploymentMonths?: number;
  primeMaxRentToIncomeRatioBps?: number;
  primeMinIncomeRatioBps?: number;
  primeMinCreditScore?: number;
  criteriaHash?: string;
  criteriaVersion?: number;
}

export interface TenantPrivateCredentials {
  income: number;
  creditScore?: number;
  employmentMonths?: number;
  backgroundVerified: boolean;
  employmentVerified: boolean;
  tenantSecret?: string;
  tenantSalt?: string;
  applicationId?: string;
}

export interface VerificationRequirementCheck {
  required: number | boolean;
  satisfied: boolean;
  value?: number | boolean;
}

export interface VerificationResult {
  verified: boolean;
  isEligible: boolean;
  eligible: boolean;
  tier: 0 | 1;
  nullifier: string;
  criteriaHash: string;
  verifiedAt: string;
  midnightTxHash: string;
  circuitId: string;
  zkProofHash: string;
  blockHeight: number;
  merkleRoot: string;
  provingTimeMs: number;
  contractAddress?: string;
  mode?: 'live_devnet' | 'sandbox_simulation';
  requirements: {
    income: { required: number; satisfied: boolean; value?: number };
    rentToIncomeRatio: { required: number; satisfied: boolean };
    credit: { required: number; satisfied: boolean; value?: number };
    background: { required: boolean; satisfied: boolean; value?: boolean };
    employment: { required: number; satisfied: boolean; value?: number };
  };
  zkMetrics: ZkMetrics;
}

export interface IVerifier {
  verify(
    rules: PropertyQualificationRules,
    credentials: TenantPrivateCredentials
  ): Promise<VerificationResult>;
}

export class MidnightZkVerifier implements IVerifier {
  async verify(
    rules: PropertyQualificationRules,
    credentials: TenantPrivateCredentials
  ): Promise<VerificationResult> {
    const result = await executeMidnightQualificationProof(
      {
        annualIncome: credentials.income,
        creditScore: credentials.creditScore ?? 720,
        employmentMonths: credentials.employmentMonths ?? (credentials.employmentVerified ? 24 : 0),
        backgroundClean: credentials.backgroundVerified,
        employmentVerified: credentials.employmentVerified,
        tenantSecret: credentials.tenantSecret,
        tenantSalt: credentials.tenantSalt,
        applicationId: credentials.applicationId,
      },
      {
        monthlyRent: rules.monthlyRent ?? Math.round(rules.minIncome / 36),
        minMonthlyIncome: Math.round(rules.minIncome / 12),
        maxRentToIncomeRatioBps: rules.maxRentToIncomeRatioBps ?? 3300,
        minCreditScore: rules.minCreditScore ?? 650,
        minEmploymentMonths: rules.minEmploymentMonths ?? (rules.requireEmployment ? 12 : 0),
        requireCleanBackground: rules.requireBackground,
        primeMaxRentToIncomeRatioBps: rules.primeMaxRentToIncomeRatioBps ?? rules.primeMinIncomeRatioBps ?? 2500,
        primeMinIncomeRatioBps: rules.primeMinIncomeRatioBps ?? 2500,
        primeMinCreditScore: rules.primeMinCreditScore ?? 750,
        criteriaHash: rules.criteriaHash,
        criteriaVersion: rules.criteriaVersion,
      }
    );

    return {
      verified: result.success,
      isEligible: result.isEligible,
      eligible: result.isEligible,
      tier: result.tier,
      nullifier: result.nullifier,
      criteriaHash: result.criteriaHash,
      verifiedAt: new Date().toISOString(),
      midnightTxHash: result.midnightTxHash,
      circuitId: result.circuitId,
      zkProofHash: result.proofHash,
      blockHeight: result.blockHeight,
      merkleRoot: result.merkleRoot,
      provingTimeMs: result.provingTimeMs,
      contractAddress: result.contractAddress,
      mode: result.mode,
      requirements: {
        income: {
          required: Number(result.requirements.income.required),
          satisfied: result.requirements.income.satisfied,
          value: Number(result.requirements.income.value ?? credentials.income),
        },
        rentToIncomeRatio: {
          required: Number(result.requirements.rentToIncomeRatio.required),
          satisfied: result.requirements.rentToIncomeRatio.satisfied,
        },
        credit: {
          required: Number(result.requirements.credit.required),
          satisfied: result.requirements.credit.satisfied,
          value: Number(result.requirements.credit.value ?? credentials.creditScore ?? 720),
        },
        background: {
          required: Boolean(result.requirements.background.required),
          satisfied: result.requirements.background.satisfied,
          value: Boolean(result.requirements.background.value ?? credentials.backgroundVerified),
        },
        employment: {
          required: Number(result.requirements.employment.required),
          satisfied: result.requirements.employment.satisfied,
          value: Number(result.requirements.employment.value ?? (credentials.employmentVerified ? 24 : 0)),
        },
      },
      zkMetrics: result.zkMetrics,
    };
  }
}

export class SimulatedZkVerifier extends MidnightZkVerifier {}

export const defaultVerifier: IVerifier = new MidnightZkVerifier();
