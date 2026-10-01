/**
 * Midnight Qualification Smart Contract Witnesses.
 *
 * Implements the Witnesses<PS> interface defined in the compiled contract bindings.
 * Private witness values execute purely in local memory and are never exposed on-chain.
 */

import { createHash } from 'node:crypto';
import type { Witnesses, Ledger, Attestation } from '../../contracts/managed/qualification/contract/index.js';
import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { TenantWitnessInput } from './types';

// Demo issuer public key: 32 bytes hash
export const DEMO_ISSUER_PK = new Uint8Array(
  createHash('sha256').update('zkrent:demo-issuer-authority').digest()
);

/**
 * Derives a 32-byte buffer from any string or Uint8Array.
 */
function toBytes32(input: string | Uint8Array | undefined, fallback: string): Uint8Array {
  if (input instanceof Uint8Array && input.length === 32) {
    return input;
  }
  const str = typeof input === 'string' ? input : fallback;
  return new Uint8Array(createHash('sha256').update(str).digest());
}

/**
 * Creates witness handlers bound to the tenant's private credentials and attestation.
 *
 * @param credentials Private credential input (income, credit score, background, secrets)
 * @returns An object satisfying the contract's Witnesses<PS> interface
 */
export function createQualificationWitnesses<PS = any>(
  credentials: TenantWitnessInput
): Witnesses<PS> {
  const annualIncome = BigInt(Math.max(0, Math.round(Number(credentials.annualIncome))));
  const creditScore = BigInt(Math.max(300, Math.round(Number(credentials.creditScore ?? 720))));
  const employmentMonths = BigInt(Math.max(0, Math.round(Number(credentials.employmentMonths ?? 24))));
  const backgroundClean = Boolean(credentials.backgroundClean);

  const tenantSecret = toBytes32(credentials.tenantSecret, 'zkrent-tenant-secret-seed');
  const tenantSalt = toBytes32(credentials.tenantSalt, 'zkrent-tenant-salt-seed');
  const callerSecret = toBytes32(credentials.tenantSecret, 'zkrent-caller-secret-seed');

  // Compute subject commitment matching Compact: persistentHash([pad(32, "zkrent:tenant:"), applicationId, tenantSalt])
  const appBytes = toBytes32(credentials.applicationId, 'zkrent-default-application-id');
  const tagBytes = Buffer.alloc(32);
  tagBytes.write('zkrent:tenant:');
  const subjectCommitment = new Uint8Array(
    createHash('sha256')
      .update(Buffer.concat([tagBytes, Buffer.from(appBytes), Buffer.from(tenantSalt)]))
      .digest()
  );

  const nowSeconds = BigInt(Math.floor(Date.now() / 1000));
  const attestation: Attestation = {
    issuerPk: DEMO_ISSUER_PK,
    subjectCommitment,
    annualIncome,
    creditScore,
    employmentMonths,
    backgroundClean,
    issuedAt: nowSeconds - 86400n, // Issued yesterday
    expiresAt: nowSeconds + (30n * 86400n), // Expires in 30 days
  };

  return {
    getAttestation(context: WitnessContext<Ledger, PS>): [PS, Attestation] {
      return [context.privateState, attestation];
    },
    getTenantSecret(context: WitnessContext<Ledger, PS>): [PS, Uint8Array] {
      return [context.privateState, tenantSecret];
    },
    getTenantSalt(context: WitnessContext<Ledger, PS>): [PS, Uint8Array] {
      return [context.privateState, tenantSalt];
    },
    getCallerSecret(context: WitnessContext<Ledger, PS>): [PS, Uint8Array] {
      return [context.privateState, callerSecret];
    },
  };
}
