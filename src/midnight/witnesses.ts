/**
 * Midnight Qualification Smart Contract Witnesses.
 *
 * Implements the Witnesses<PS> interface defined in the compiled contract bindings.
 * Private witness values execute purely in local memory and are never exposed on-chain.
 */

import type { Witnesses, Ledger } from '../../contracts/managed/qualification/contract/index.js';
import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { TenantWitnessInput } from './types';

/**
 * Creates witness handlers bound to the tenant's private credentials.
 *
 * @param credentials Private credential input (annual income, background status)
 * @returns An object satisfying the contract's Witnesses<PS> interface
 */
export function createQualificationWitnesses<PS = any>(
  credentials: TenantWitnessInput
): Witnesses<PS> {
  return {
    annualIncome(context: WitnessContext<Ledger, PS>): [PS, bigint] {
      const incomeBigInt = BigInt(Math.max(0, Math.round(Number(credentials.annualIncome))));
      return [context.privateState, incomeBigInt];
    },
    backgroundClean(context: WitnessContext<Ledger, PS>): [PS, boolean] {
      return [context.privateState, Boolean(credentials.backgroundClean)];
    },
  };
}
