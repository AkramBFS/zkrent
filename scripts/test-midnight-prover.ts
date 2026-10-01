/**
 * Test suite for Midnight Qualification Smart Contract & Prover Integration (Revision 2.0).
 *
 * Run with: node node_modules/tsx/dist/cli.mjs scripts/test-midnight-prover.ts
 */

import { createQualificationWitnesses, DEMO_ISSUER_PK } from '../src/midnight/witnesses';
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
  console.log('  Midnight Smart Contract & Prover Integration Test Suite (v2.0)');
  console.log('══════════════════════════════════════════════════════════════\n');

  // ── 1. Devnet Health Check ───────────────────────────────────────────────
  console.log('─── 1. Devnet Services Inspection ───\n');
  const health = await checkDevnetHealth();
  console.log(`  Proof Server (:6300): ${health.proofServer ? 'ONLINE' : 'OFFLINE (Fallback Active)'}`);
  console.log(`  Midnight Node (:9944): ${health.node ? 'ONLINE' : 'OFFLINE'}`);
  console.log(`  Indexer (:8088):      ${health.indexer ? 'ONLINE' : 'OFFLINE'}`);
  assert(true, 'Health check completed without uncaught errors');

  // ── 2. Witnesses Construction Test ───────────────────────────────────────
  console.log('\n─── 2. Witness Provider & Attestation Test ───\n');
  const dummyPrivateState = { custom: 'state' };
  const mockContext: any = { privateState: dummyPrivateState };

  const witnesses = createQualificationWitnesses({
    annualIncome: 96000,
    creditScore: 760,
    employmentMonths: 36,
    backgroundClean: true,
  });

  const [state1, attestation] = witnesses.getAttestation(mockContext);
  assert(attestation.annualIncome === 96000n, `annualIncome returns BigInt (96000n, got ${attestation.annualIncome}n)`);
  assert(attestation.creditScore === 760n, `creditScore returns BigInt (760n, got ${attestation.creditScore}n)`);
  assert(attestation.employmentMonths === 36n, `employmentMonths returns BigInt (36n, got ${attestation.employmentMonths}n)`);
  assert(attestation.backgroundClean === true, 'backgroundClean returns boolean true');
  assert(attestation.issuerPk.length === 32, 'issuerPk is 32-byte public key');
  assert(attestation.subjectCommitment.length === 32, 'subjectCommitment is 32-byte commitment');
  assert(state1 === dummyPrivateState, 'getAttestation preserves private state');

  const [state2, tenantSecret] = witnesses.getTenantSecret(mockContext);
  assert(tenantSecret.length === 32, 'tenantSecret is 32-byte entropy buffer');
  assert(state2 === dummyPrivateState, 'getTenantSecret preserves private state');

  const [state3, tenantSalt] = witnesses.getTenantSalt(mockContext);
  assert(tenantSalt.length === 32, 'tenantSalt is 32-byte salt buffer');
  assert(state3 === dummyPrivateState, 'getTenantSalt preserves private state');

  // ── 3. Prover Engine: Eligible Tenant (Standard vs Prime Tier) ───────────
  console.log('\n─── 3. Prover Engine: Eligible Tenant (Prime Tier) ───\n');
  const primeResult = await executeMidnightQualificationProof(
    {
      annualIncome: 120000,
      creditScore: 780,
      employmentMonths: 36,
      backgroundClean: true,
      employmentVerified: true,
    },
    {
      monthlyRent: 2400,
      minMonthlyIncome: 6000, // 72,000/yr
      maxRentToIncomeRatioBps: 3300,
      minCreditScore: 650,
      minEmploymentMonths: 12,
      requireCleanBackground: true,
      primeMinIncomeRatioBps: 2500, // 25% rent ratio (~4x rent)
      primeMinCreditScore: 750,
    }
  );

  assert(primeResult.success === true, 'Prover execution returned success');
  assert(primeResult.isEligible === true, 'Tenant evaluated as ELIGIBLE');
  assert(primeResult.tier === 1, `Tenant achieves Prime Tier (tier === 1, got ${primeResult.tier})`);
  assert(primeResult.circuitId === 'proveQualification', 'Targeted circuit is proveQualification');
  assert(primeResult.proofHash.startsWith('zk_p_'), `Proof hash generated: ${primeResult.proofHash}`);
  assert(primeResult.nullifier.startsWith('zk_null_'), `Nullifier generated: ${primeResult.nullifier}`);
  assert(primeResult.criteriaHash.startsWith('0x') || primeResult.criteriaHash.startsWith('ch_'), `Criteria hash bound: ${primeResult.criteriaHash}`);
  assert(primeResult.midnightTxHash.startsWith('0x'), `Midnight tx hash generated: ${primeResult.midnightTxHash}`);
  assert(primeResult.blockHeight > 0, `Block height populated: #${primeResult.blockHeight}`);
  assert(primeResult.requirements.income.satisfied === true, 'Income requirement satisfied');
  assert(primeResult.requirements.credit.satisfied === true, 'Credit requirement satisfied');
  assert(primeResult.requirements.background.satisfied === true, 'Background requirement satisfied');

  // ── 4. Prover Engine: Ineligible Tenant (High Rent-To-Income Ratio) ───────
  console.log('\n─── 4. Prover Engine: Ineligible Tenant (Rent-To-Income Ratio Exceeded) ───\n');
  const highRatioResult = await executeMidnightQualificationProof(
    {
      annualIncome: 45000, // ~3750/mo. Rent 2400 -> ratio is 64% > 33%
      creditScore: 680,
      employmentMonths: 24,
      backgroundClean: true,
      employmentVerified: true,
    },
    {
      monthlyRent: 2400,
      minMonthlyIncome: 3000,
      maxRentToIncomeRatioBps: 3300, // max 33%
      minCreditScore: 650,
      minEmploymentMonths: 12,
      requireCleanBackground: true,
    }
  );

  assert(highRatioResult.isEligible === false, 'Tenant evaluated as INELIGIBLE due to rent ratio');
  assert(highRatioResult.requirements.rentToIncomeRatio.satisfied === false, 'Rent-to-income check reflects failure');
  assert(highRatioResult.requirements.background.satisfied === true, 'Background check passed');

  // ── 5. Prover Engine: Ineligible Tenant (Credit Score Below Minimum) ─────
  console.log('\n─── 5. Prover Engine: Ineligible Tenant (Credit Below Minimum) ───\n');
  const lowCreditResult = await executeMidnightQualificationProof(
    {
      annualIncome: 95000,
      creditScore: 580, // min 650
      employmentMonths: 24,
      backgroundClean: true,
      employmentVerified: true,
    },
    {
      monthlyRent: 2000,
      minMonthlyIncome: 5000,
      maxRentToIncomeRatioBps: 3300,
      minCreditScore: 650,
      minEmploymentMonths: 12,
      requireCleanBackground: true,
    }
  );

  assert(lowCreditResult.isEligible === false, 'Tenant evaluated as INELIGIBLE due to low credit score');
  assert(lowCreditResult.requirements.credit.satisfied === false, 'Credit check reflects failure');

  // ── 6. defaultVerifier Integration Interface ─────────────────────────────
  console.log('\n─── 6. defaultVerifier Interface Test ───\n');
  const verificationResult = await defaultVerifier.verify(
    {
      minIncome: 72000,
      monthlyRent: 2000,
      maxRentToIncomeRatioBps: 3300,
      minCreditScore: 650,
      requireBackground: true,
      requireEmployment: false,
    },
    {
      income: 88000,
      creditScore: 720,
      backgroundVerified: true,
      employmentVerified: true,
    }
  );

  assert(verificationResult.isEligible === true, 'defaultVerifier evaluates eligibility');
  assert(verificationResult.circuitId === 'proveQualification', 'defaultVerifier returns proveQualification circuit');
  assert(verificationResult.zkMetrics.constraints === 272, 'zkMetrics contains measured ZKIR instruction count (272)');
  assert(verificationResult.tier === 0, 'Standard tier (0) correctly assigned');

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
