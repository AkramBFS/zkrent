import {
  canTransitionApplication,
  assertApplicationTransition,
  canTransitionVerification,
  assertVerificationTransition,
  canTransitionReveal,
  assertRevealTransition,
  canTransitionContractLifecycle,
  assertContractLifecycleTransition,
  InvalidStateTransitionError,
  ApplicationStatus,
  VerificationStatus,
  RevealStatus,
  ContractRecordLifecycle,
} from '../src/lib/lifecycle';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✕ FAIL: ${msg}`);
  }
}

function expectThrows(fn: () => void, msg: string) {
  try {
    fn();
    failed++;
    console.error(`  ✕ FAIL (expected error but succeeded): ${msg}`);
  } catch (err) {
    if (err instanceof InvalidStateTransitionError) {
      passed++;
      console.log(`  ✓ ${msg} (threw InvalidStateTransitionError: ${err.message})`);
    } else {
      failed++;
      console.error(`  ✕ FAIL (unexpected error type): ${err}`);
    }
  }
}

console.log('\n══════════════════════════════════════════════════════════════');
console.log('  Application Lifecycle State Machine Test Suite');
console.log('══════════════════════════════════════════════════════════════\n');

// 1. Application Lifecycle Tests
console.log('─── 1. Application Lifecycle Transitions ───');
assert(canTransitionApplication('PENDING_PAYMENT', 'PAYMENT_CONFIRMED'), 'PENDING_PAYMENT -> PAYMENT_CONFIRMED allowed');
assert(canTransitionApplication('PENDING_PAYMENT', 'WITHDRAWN'), 'PENDING_PAYMENT -> WITHDRAWN allowed');
assert(!canTransitionApplication('PENDING_PAYMENT', 'ZK_VERIFIED'), 'PENDING_PAYMENT -> ZK_VERIFIED rejected (skipping steps)');
expectThrows(
  () => assertApplicationTransition('PENDING_PAYMENT', 'ZK_VERIFIED'),
  'assertApplicationTransition rejects skipping payment & verification'
);

assert(canTransitionApplication('PAYMENT_CONFIRMED', 'VERIFYING'), 'PAYMENT_CONFIRMED -> VERIFYING allowed');
assert(canTransitionApplication('VERIFYING', 'ZK_VERIFIED'), 'VERIFYING -> ZK_VERIFIED allowed');
assert(canTransitionApplication('VERIFYING', 'ZK_REJECTED'), 'VERIFYING -> ZK_REJECTED allowed');
assert(canTransitionApplication('ZK_VERIFIED', 'LEASE_OFFERED'), 'ZK_VERIFIED -> LEASE_OFFERED allowed');
assert(!canTransitionApplication('ZK_REJECTED', 'LEASE_OFFERED'), 'ZK_REJECTED is terminal and cannot transition to LEASE_OFFERED');
expectThrows(
  () => assertApplicationTransition('ZK_REJECTED', 'LEASE_OFFERED'),
  'assertApplicationTransition rejects transition from terminal ZK_REJECTED'
);

// 2. Verification Status Invariants
console.log('\n─── 2. Verification Status Invariants & Simulation Isolation ───');
assert(canTransitionVerification('PENDING', 'VERIFIED'), 'PENDING -> VERIFIED allowed for live mode');
assert(canTransitionVerification('PENDING', 'SIMULATED'), 'PENDING -> SIMULATED allowed for simulation mode');
assert(!canTransitionVerification('SIMULATED', 'VERIFIED'), 'SIMULATED -> VERIFIED rejected (CRITICAL SECURITY INVARIANT)');
expectThrows(
  () => assertVerificationTransition('SIMULATED', 'VERIFIED'),
  'SIMULATED cannot be escalated to on-chain VERIFIED'
);

// 3. Identity Reveal Consent Lifecycle
console.log('\n─── 3. Identity Reveal Consent Lifecycle ───');
assert(canTransitionReveal('NONE', 'REQUESTED'), 'NONE -> REQUESTED allowed');
assert(canTransitionReveal('REQUESTED', 'GRANTED'), 'REQUESTED -> GRANTED allowed (tenant consents)');
assert(canTransitionReveal('REQUESTED', 'DECLINED'), 'REQUESTED -> DECLINED allowed (tenant declines)');
assert(!canTransitionReveal('NONE', 'GRANTED'), 'NONE -> GRANTED rejected (must be requested first)');
expectThrows(
  () => assertRevealTransition('NONE', 'GRANTED'),
  'assertRevealTransition rejects GRANTED without prior REQUESTED'
);

// 4. Contract Lifecycle Invariants
console.log('\n─── 4. Contract Record Lifecycle (On-Chain) ───');
assert(canTransitionContractLifecycle('Active', 'Consumed'), 'Active -> Consumed allowed (lease signed)');
assert(canTransitionContractLifecycle('Active', 'Revoked'), 'Active -> Revoked allowed (tenant revokes)');
assert(!canTransitionContractLifecycle('Consumed', 'Active'), 'Consumed -> Active rejected (spent qualification cannot reactivate)');
expectThrows(
  () => assertContractLifecycleTransition('Consumed', 'Active'),
  'Consumed record is terminal'
);

console.log('\n══════════════════════════════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log('══════════════════════════════════════════════════════════════\n');

if (failed > 0) process.exit(1);
