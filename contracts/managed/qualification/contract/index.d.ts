import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type ListingCriteria = { landlordPk: Uint8Array;
                                criteriaVersion: bigint;
                                criteriaHash: Uint8Array;
                                monthlyRent: bigint;
                                minMonthlyIncome: bigint;
                                maxRentToIncomeRatioBps: bigint;
                                minCreditScore: bigint;
                                requireCleanBackground: boolean;
                                minEmploymentMonths: bigint;
                                primeMinIncomeRatioBps: bigint;
                                primeMinCreditScore: bigint;
                                active: boolean
                              };

export enum RecordLifecycle { Active = 0, Consumed = 1, Revoked = 2 }

export type ApplicationStatusRecord = { listingId: Uint8Array;
                                        criteriaHash: Uint8Array;
                                        tenantCommitment: Uint8Array;
                                        tier: bigint;
                                        lifecycle: RecordLifecycle;
                                        verifiedAt: bigint;
                                        expiresAt: bigint
                                      };

export type Attestation = { issuerPk: Uint8Array;
                            subjectCommitment: Uint8Array;
                            annualIncome: bigint;
                            creditScore: bigint;
                            employmentMonths: bigint;
                            backgroundClean: boolean;
                            issuedAt: bigint;
                            expiresAt: bigint
                          };

export type Witnesses<PS> = {
  getAttestation(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Attestation];
  getTenantSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  getTenantSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  getCallerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  setPaused(context: __compactRuntime.CircuitContext<PS>, paused_0: boolean): Promise<__compactRuntime.CircuitResults<PS, []>>;
  registerListingCriteria(context: __compactRuntime.CircuitContext<PS>,
                          listingId_0: Uint8Array,
                          monthlyRent_0: bigint,
                          minMonthlyIncome_0: bigint,
                          maxRentToIncomeRatioBps_0: bigint,
                          minCreditScore_0: bigint,
                          requireCleanBackground_0: boolean,
                          minEmploymentMonths_0: bigint,
                          primeMinIncomeRatioBps_0: bigint,
                          primeMinCreditScore_0: bigint,
                          active_0: boolean): Promise<__compactRuntime.CircuitResults<PS, []>>;
  proveQualification(context: __compactRuntime.CircuitContext<PS>,
                     listingId_0: Uint8Array,
                     applicationId_0: Uint8Array,
                     currentTime_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  consumeQualification(context: __compactRuntime.CircuitContext<PS>,
                       applicationId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  revokeQualification(context: __compactRuntime.CircuitContext<PS>,
                      applicationId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type ProvableCircuits<PS> = {
  setPaused(context: __compactRuntime.CircuitContext<PS>, paused_0: boolean): Promise<__compactRuntime.CircuitResults<PS, []>>;
  registerListingCriteria(context: __compactRuntime.CircuitContext<PS>,
                          listingId_0: Uint8Array,
                          monthlyRent_0: bigint,
                          minMonthlyIncome_0: bigint,
                          maxRentToIncomeRatioBps_0: bigint,
                          minCreditScore_0: bigint,
                          requireCleanBackground_0: boolean,
                          minEmploymentMonths_0: bigint,
                          primeMinIncomeRatioBps_0: bigint,
                          primeMinCreditScore_0: bigint,
                          active_0: boolean): Promise<__compactRuntime.CircuitResults<PS, []>>;
  proveQualification(context: __compactRuntime.CircuitContext<PS>,
                     listingId_0: Uint8Array,
                     applicationId_0: Uint8Array,
                     currentTime_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  consumeQualification(context: __compactRuntime.CircuitContext<PS>,
                       applicationId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  revokeQualification(context: __compactRuntime.CircuitContext<PS>,
                      applicationId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  setPaused(context: __compactRuntime.CircuitContext<PS>, paused_0: boolean): Promise<__compactRuntime.CircuitResults<PS, []>>;
  registerListingCriteria(context: __compactRuntime.CircuitContext<PS>,
                          listingId_0: Uint8Array,
                          monthlyRent_0: bigint,
                          minMonthlyIncome_0: bigint,
                          maxRentToIncomeRatioBps_0: bigint,
                          minCreditScore_0: bigint,
                          requireCleanBackground_0: boolean,
                          minEmploymentMonths_0: bigint,
                          primeMinIncomeRatioBps_0: bigint,
                          primeMinCreditScore_0: bigint,
                          active_0: boolean): Promise<__compactRuntime.CircuitResults<PS, []>>;
  proveQualification(context: __compactRuntime.CircuitContext<PS>,
                     listingId_0: Uint8Array,
                     applicationId_0: Uint8Array,
                     currentTime_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  consumeQualification(context: __compactRuntime.CircuitContext<PS>,
                       applicationId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  revokeQualification(context: __compactRuntime.CircuitContext<PS>,
                      applicationId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type Ledger = {
  listings: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): ListingCriteria;
    [Symbol.iterator](): Iterator<[Uint8Array, ListingCriteria]>
  };
  applicationRecords: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): ApplicationStatusRecord;
    [Symbol.iterator](): Iterator<[Uint8Array, ApplicationStatusRecord]>
  };
  nullifierSet: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly contractAdmin: Uint8Array;
  readonly isPaused: boolean;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               admin_0: Uint8Array): Promise<__compactRuntime.ConstructorResult<PS>>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
export declare const expectedVk: Record<string, string>;
