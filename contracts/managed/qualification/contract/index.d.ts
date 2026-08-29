import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  annualIncome(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  backgroundClean(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, boolean];
}

export type ImpureCircuits<PS> = {
  verifyQualification(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, { incomeOk: boolean,
                                                                                                                   backgroundOk: boolean
                                                                                                                 }>>;
}

export type ProvableCircuits<PS> = {
  verifyQualification(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, { incomeOk: boolean,
                                                                                                                   backgroundOk: boolean
                                                                                                                 }>>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  verifyQualification(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, { incomeOk: boolean,
                                                                                                                   backgroundOk: boolean
                                                                                                                 }>>;
}

export type Ledger = {
  readonly minIncomeReq: bigint;
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
               minIncome_0: bigint): Promise<__compactRuntime.ConstructorResult<PS>>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
export declare const expectedVk: Record<string, string>;
