/**
 * Test suite for Midnight Qualification Smart Contract & Prover Integration.
 *
 * Run with: npx tsx scripts/test-midnight-prover.ts
 */

import { createQualificationWitnesses } from '../src/midnight/witnesses';
import { executeMidnightQualificationProof, checkDevnetHealth } from '../src/midnight/zk';
import { defaultVerifier } from '../src/lib/verification';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✕ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  Midnight Smart Contract & Prover Integration Test Suite');
  console.log('══════════════════════════════════════════════════════════════\n');

  // ── 1. Devnet Health Check ───────────────────────────────────────────────
  console.log('─── 1. Devnet Services Inspection ───\n');
  const health = await checkDevnetHealth();
  console.log(`  Proof Server (:6300): ${health.proofServer ? 'ONLINE' : 'OFFLINE (Fallback Active)'}`);
  console.log(`  Midnight Node (:9944): ${health.node ? 'ONLINE' : 'OFFLINE'}`);
  console.log(`  Indexer (:8088):      ${health.indexer ? 'ONLINE' : 'OFFLINE'}`);
  assert(true, 'Health check completed without uncaught errors');

  // ── 2. Witnesses Construction Test ───────────────────────────────────────
  console.log('\n─── 2. Witness Provider Test ───\n');
  const dummyPrivateState = { custom: 'state' };
  const mockContext: any = { privateState: dummyPrivateState };

  const witnesses = createQualificationWitnesses({
    annualIncome: 88000,
    backgroundClean: true,
  });

  const [state1, incomeVal] = witnesses.annualIncome(mockContext);
  assert(incomeVal === 88000n, `annualIncome returns BigInt (88000n, got ${incomeVal}n)`);
  assert(state1 === dummyPrivateState, 'annualIncome preserves private state');

  const [state2, bgVal] = witnesses.backgroundClean(mockContext);
  assert(bgVal === true, `backgroundClean returns boolean (true, got ${bgVal})`);
  assert(state2 === dummyPrivateState, 'backgroundClean preserves private state');

  // ── 3. Prover Engine: Eligible Tenant Case ────────────────────────────────
  console.log('\n─── 3. Prover Engine: Eligible Tenant (Pass) ───\n');
  const eligibleResult = await executeMidnightQualificationProof(
    {
      annualIncome: 95000,
      backgroundClean: true,
      employmentVerified: true,
    },
    {
      minIncome: 75000,
      requireBackground: true,
      requireEmployment: true,
    }
  );

  assert(eligibleResult.success === true, 'Prover execution returned success');
  assert(eligibleResult.isEligible === true, 'Tenant is evaluated as ELIGIBLE');
  assert(eligibleResult.circuitId === 'verifyQualification', 'Targeted circuit is verifyQualification');
  assert(eligibleResult.proofHash.startsWith('zk_p_'), `Proof hash generated: ${eligibleResult.proofHash}`);
  assert(eligibleResult.midnightTxHash.startsWith('0x'), `Midnight tx hash generated: ${eligibleResult.midnightTxHash}`);
  assert(eligibleResult.blockHeight > 0, `Block height populated: #${eligibleResult.blockHeight}`);
  assert(eligibleResult.requirements.income.satisfied === true, 'Income requirement satisfied');
  assert(eligibleResult.requirements.background.satisfied === true, 'Background requirement satisfied');
  console.log(`  Prover Mode: ${eligibleResult.mode}`);
  console.log(`  Proving Duration: ${eligibleResult.provingTimeMs}ms`);

  // ── 4. Prover Engine: Ineligible Tenant (Income Below Threshold) ──────────
  console.log('\n─── 4. Prover Engine: Ineligible Tenant (Income Below Minimum) ───\n');
  const lowIncomeResult = await executeMidnightQualificationProof(
    {
      annualIncome: 45000,
      backgroundClean: true,
      employmentVerified: true,
    },
    {
      minIncome: 75000,
      requireBackground: true,
      requireEmployment: true,
    }
  );

  assert(lowIncomeResult.isEligible === false, 'Tenant is evaluated as INELIGIBLE (Income below requirement)');
  assert(lowIncomeResult.requirements.income.satisfied === false, 'Income check reflects failure');
  assert(lowIncomeResult.requirements.background.satisfied === true, 'Background check passed');

  // ── 5. Prover Engine: Ineligible Tenant (Failed Background Check) ────────
  console.log('\n─── 5. Prover Engine: Ineligible Tenant (Failed Background) ───\n');
  const failedBgResult = await executeMidnightQualificationProof(
    {
      annualIncome: 120000,
      backgroundClean: false,
      employmentVerified: true,
    },
    {
      minIncome: 75000,
      requireBackground: true,
      requireEmployment: true,
    }
  );

  assert(failedBgResult.isEligible === false, 'Tenant is evaluated as INELIGIBLE (Failed background check)');
  assert(failedBgResult.requirements.background.satisfied === false, 'Background check reflects failure');

  // ── 6. defaultVerifier Integration Interface ─────────────────────────────
  console.log('\n─── 6. defaultVerifier Interface Test ───\n');
  const verificationResult = await defaultVerifier.verify(
    {
      minIncome: 70000,
      requireBackground: true,
      requireEmployment: false,
    },
    {
      income: 85000,
      backgroundVerified: true,
      employmentVerified: true,
    }
  );

  assert(verificationResult.isEligible === true, 'defaultVerifier evaluates eligibility');
  assert(verificationResult.circuitId === 'verifyQualification', 'defaultVerifier returns verifyQualification circuit');
  assert(verificationResult.zkMetrics.constraints === 38420, 'zkMetrics contains constraint count (38,420)');

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log(`\n══════════════════════════════════════════════════════════════`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`══════════════════════════════════════════════════════════════\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('\n❌ Unhandled test error:', err);
  process.exit(1);
});
