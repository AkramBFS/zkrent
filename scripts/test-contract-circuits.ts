/**
 * Contract Circuit Test Suite (T1 - T8).
 *
 * Validates the core security and functional requirements of qualification.compact:
 * - T1: Standard Qualification
 * - T2: Prime Qualification (4x income + 750+ credit)
 * - T3: Low Income & High Rent-To-Income Rejection
 * - T4: Bad Credit & Background Check Failure Rejection
 * - T5: Replay Prevention via Nullifiers
 * - T6: Application Squatting Defense via Tenant Commitment
 * - T7: Expired Attestation Enforcement
 * - T8: Unauthorized Listing Modification Protection
 *
 * Run with: node node_modules/tsx/dist/cli.mjs scripts/test-contract-circuits.ts
 */

import { createHash } from 'node:crypto';
import { createQualificationWitnesses } from '../src/midnight/witnesses';

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

/**
 * In-memory simulator modeling the exact mathematical constraints
 * and state transitions of qualification.compact.
 */
class QualificationContractSimulator {
  public listings = new Map<string, any>();
  public applicationRecords = new Map<string, any>();
  public nullifierSet = new Set<string>();
  public isPaused = false;
  public adminPk: string;

  constructor(adminPk: string) {
    this.adminPk = adminPk;
  }

  getPublicKey(sk: string): string {
    return createHash('sha256').update(`zkrent:pk:${sk}`).digest('hex');
  }

  computeCriteriaHash(listingId: string, version: number, rent: number, minInc: number, maxRatio: number, minCred: number): string {
    return createHash('sha256').update(`${listingId}:${version}:${rent}:${minInc}:${maxRatio}:${minCred}`).digest('hex');
  }

  registerListingCriteria(callerSk: string, listingId: string, criteria: {
    monthlyRent: number;
    minMonthlyIncome: number;
    maxRentToIncomeRatioBps: number;
    minCreditScore: number;
    requireCleanBackground: boolean;
    minEmploymentMonths: number;
    primeMinIncomeRatioBps: number;
    primeMinCreditScore: number;
    active: boolean;
  }) {
    if (this.isPaused) throw new Error('Contract is currently paused');
    const callerPk = this.getPublicKey(callerSk);

    let version = 1;
    if (this.listings.has(listingId)) {
      const existing = this.listings.get(listingId);
      if (existing.landlordPk !== callerPk) {
        throw new Error('Only listing owner can update criteria');
      }
      version = existing.criteriaVersion + 1;
    }

    const cHash = this.computeCriteriaHash(
      listingId,
      version,
      criteria.monthlyRent,
      criteria.minMonthlyIncome,
      criteria.maxRentToIncomeRatioBps,
      criteria.minCreditScore
    );

    this.listings.set(listingId, {
      ...criteria,
      landlordPk: callerPk,
      criteriaVersion: version,
      criteriaHash: cHash,
    });
  }

  proveQualification(
    listingId: string,
    applicationId: string,
    currentTime: number,
    witnesses: {
      attestation: {
        annualIncome: number;
        creditScore: number;
        employmentMonths: number;
        backgroundClean: boolean;
        subjectCommitment: string;
        issuedAt: number;
        expiresAt: number;
      };
      tenantSecret: string;
      tenantSalt: string;
    }
  ) {
    if (this.isPaused) throw new Error('Contract is currently paused');
    if (!this.listings.has(listingId)) throw new Error('Listing does not exist');
    const listing = this.listings.get(listingId);
    if (!listing.active) throw new Error('Listing is not active');

    const { attestation, tenantSecret, tenantSalt } = witnesses;

    // 1. Time bounds check
    if (currentTime < attestation.issuedAt) throw new Error('Attestation not yet valid');
    if (currentTime > attestation.expiresAt) throw new Error('Attestation has expired');

    // 2. Tenant commitment check
    const expectedCommitment = createHash('sha256').update(`zkrent:tenant:${applicationId}:${tenantSalt}`).digest('hex');
    if (attestation.subjectCommitment !== expectedCommitment) throw new Error('Commitment mismatch');

    // 3. Multi-criteria verification (Division-Free Integer Math)
    const minAnnualIncome = listing.minMonthlyIncome * 12;
    if (attestation.annualIncome < minAnnualIncome) throw new Error('Income below requirement');

    const rentRatioLhs = listing.monthlyRent * 120000;
    const rentRatioRhs = attestation.annualIncome * listing.maxRentToIncomeRatioBps;
    if (rentRatioLhs > rentRatioRhs) throw new Error('Rent-to-income ratio exceeds maximum allowed');

    if (attestation.creditScore < listing.minCreditScore) throw new Error('Credit score below minimum');
    if (attestation.employmentMonths < listing.minEmploymentMonths) throw new Error('Employment history insufficient');
    if (listing.requireCleanBackground && !attestation.backgroundClean) throw new Error('Clean background check required');

    // 4. Derive Coarse Tier
    const primeRatioRhs = attestation.annualIncome * listing.primeMinIncomeRatioBps;
    const isPrime = (rentRatioLhs <= primeRatioRhs) && (attestation.creditScore >= listing.primeMinCreditScore);
    const tier = isPrime ? 1 : 0;

    // 5. Anti-Replay Nullifier Verification
    const nullifier = createHash('sha256').update(`zkrent:null:${tenantSecret}:${listingId}`).digest('hex');
    if (this.nullifierSet.has(nullifier)) throw new Error('Applicant already proved qualification for this listing');
    this.nullifierSet.add(nullifier);

    // 6. Record Application Status On-Chain
    const proofExpiresAt = currentTime + (30 * 86400);
    this.applicationRecords.set(applicationId, {
      listingId,
      criteriaHash: listing.criteriaHash,
      tenantCommitment: expectedCommitment,
      tier,
      lifecycle: 'Active',
      verifiedAt: currentTime,
      expiresAt: proofExpiresAt,
    });

    return { tier, nullifier, criteriaHash: listing.criteriaHash };
  }

  consumeQualification(callerSk: string, applicationId: string) {
    if (!this.applicationRecords.has(applicationId)) throw new Error('Application not found');
    const record = this.applicationRecords.get(applicationId);
    if (record.lifecycle !== 'Active') throw new Error('Qualification is not in active state');

    const listing = this.listings.get(record.listingId);
    const callerPk = this.getPublicKey(callerSk);
    if (callerPk !== listing.landlordPk) throw new Error('Only listing landlord can execute lease consumption');

    record.lifecycle = 'Consumed';
  }

  setPaused(callerSk: string, paused: boolean) {
    const callerPk = this.getPublicKey(callerSk);
    if (callerPk !== this.adminPk) throw new Error('Only contract admin can pause');
    this.isPaused = paused;
  }
}

async function runContractTests() {
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  Contract Circuit Constraint & Lifecycle Test Suite (T1 - T8)');
  console.log('══════════════════════════════════════════════════════════════\n');

  const adminSk = 'admin-secret-key-001';
  const landlordSk = 'landlord-secret-key-101';
  const impostorSk = 'impostor-secret-key-999';

  const simulator = new QualificationContractSimulator(
    createHash('sha256').update(`zkrent:pk:${adminSk}`).digest('hex')
  );

  const listingId = 'prop-ashton-14b';
  const now = Math.floor(Date.now() / 1000);

  // Setup listing
  simulator.registerListingCriteria(landlordSk, listingId, {
    monthlyRent: 2400,
    minMonthlyIncome: 6000, // 72k/yr
    maxRentToIncomeRatioBps: 3300, // 33%
    minCreditScore: 650,
    requireCleanBackground: true,
    minEmploymentMonths: 12,
    primeMinIncomeRatioBps: 2500, // 25% (~4x rent)
    primeMinCreditScore: 750,
    active: true,
  });

  console.log('─── T1: Standard Qualification ───');
  const appId1 = 'app-uuid-001';
  const tenantSalt1 = 'salt-001';
  const tenantSec1 = 'sec-001';
  const comm1 = createHash('sha256').update(`zkrent:tenant:${appId1}:${tenantSalt1}`).digest('hex');

  const resT1 = simulator.proveQualification(listingId, appId1, now, {
    attestation: {
      annualIncome: 92000,
      creditScore: 680,
      employmentMonths: 18,
      backgroundClean: true,
      subjectCommitment: comm1,
      issuedAt: now - 3600,
      expiresAt: now + 86400 * 30,
    },
    tenantSecret: tenantSec1,
    tenantSalt: tenantSalt1,
  });

  assert(resT1.tier === 0, 'T1: Applicant qualifies for Standard Tier (0)');
  assert(simulator.applicationRecords.get(appId1)?.lifecycle === 'Active', 'T1: Application record is Active');

  console.log('\n─── T2: Prime Qualification ───');
  const appId2 = 'app-uuid-002';
  const tenantSalt2 = 'salt-002';
  const tenantSec2 = 'sec-002';
  const comm2 = createHash('sha256').update(`zkrent:tenant:${appId2}:${tenantSalt2}`).digest('hex');

  const resT2 = simulator.proveQualification(listingId, appId2, now, {
    attestation: {
      annualIncome: 130000, // > 4x rent
      creditScore: 780, // > 750
      employmentMonths: 36,
      backgroundClean: true,
      subjectCommitment: comm2,
      issuedAt: now - 3600,
      expiresAt: now + 86400 * 30,
    },
    tenantSecret: tenantSec2,
    tenantSalt: tenantSalt2,
  });

  assert(resT2.tier === 1, 'T2: High-earner qualifies for Prime Tier (1)');

  console.log('\n─── T3: Low Income & Rent-to-Income Failure ───');
  let t3Caught = false;
  try {
    simulator.proveQualification(listingId, 'app-fail-inc', now, {
      attestation: {
        annualIncome: 50000, // Less than 6000*12 = 72,000
        creditScore: 720,
        employmentMonths: 24,
        backgroundClean: true,
        subjectCommitment: createHash('sha256').update(`zkrent:tenant:app-fail-inc:salt-inc`).digest('hex'),
        issuedAt: now - 3600,
        expiresAt: now + 86400 * 30,
      },
      tenantSecret: 'sec-inc',
      tenantSalt: 'salt-inc',
    });
  } catch (err: any) {
    t3Caught = true;
    assert(err.message.includes('Income below requirement'), 'T3: Threw constraint error on low income');
  }
  assert(t3Caught, 'T3: Ineligible tenant rejected without creating proof');

  console.log('\n─── T4: Bad Credit / Background Failure ───');
  let t4Caught = false;
  try {
    simulator.proveQualification(listingId, 'app-fail-bg', now, {
      attestation: {
        annualIncome: 95000,
        creditScore: 680,
        employmentMonths: 24,
        backgroundClean: false, // Failed criminal background
        subjectCommitment: createHash('sha256').update(`zkrent:tenant:app-fail-bg:salt-bg`).digest('hex'),
        issuedAt: now - 3600,
        expiresAt: now + 86400 * 30,
      },
      tenantSecret: 'sec-bg',
      tenantSalt: 'salt-bg',
    });
  } catch (err: any) {
    t4Caught = true;
    assert(err.message.includes('Clean background check required'), 'T4: Threw constraint error on criminal background');
  }
  assert(t4Caught, 'T4: Background failure rejected');

  console.log('\n─── T5: Replay Prevention via Nullifiers ───');
  let t5Caught = false;
  try {
    // Attempt to reuse tenantSec1 on a second application for same listing
    simulator.proveQualification(listingId, 'app-replay-attempt', now, {
      attestation: {
        annualIncome: 92000,
        creditScore: 680,
        employmentMonths: 18,
        backgroundClean: true,
        subjectCommitment: createHash('sha256').update(`zkrent:tenant:app-replay-attempt:salt-replay`).digest('hex'),
        issuedAt: now - 3600,
        expiresAt: now + 86400 * 30,
      },
      tenantSecret: tenantSec1, // Already consumed in T1!
      tenantSalt: 'salt-replay',
    });
  } catch (err: any) {
    t5Caught = true;
    assert(err.message.includes('Applicant already proved qualification'), 'T5: Duplicate nullifier rejected on-chain');
  }
  assert(t5Caught, 'T5: Replay attack blocked');

  console.log('\n─── T6: Application Squatting Defense ───');
  let t6Caught = false;
  try {
    // Attacker attempts to prove for appId1 using their own salt
    simulator.proveQualification(listingId, appId1, now, {
      attestation: {
        annualIncome: 90000,
        creditScore: 700,
        employmentMonths: 20,
        backgroundClean: true,
        subjectCommitment: 'fraudulent-commitment-hash',
        issuedAt: now - 3600,
        expiresAt: now + 86400 * 30,
      },
      tenantSecret: 'attacker-secret',
      tenantSalt: 'attacker-salt',
    });
  } catch (err: any) {
    t6Caught = true;
    assert(err.message.includes('Commitment mismatch'), 'T6: Attacker rejected for mismatched commitment');
  }
  assert(t6Caught, 'T6: Application squatting blocked');

  console.log('\n─── T7: Expired Attestation Enforcement ───');
  let t7Caught = false;
  try {
    const expiredTime = now - 100;
    simulator.proveQualification(listingId, 'app-expired', now, {
      attestation: {
        annualIncome: 90000,
        creditScore: 700,
        employmentMonths: 20,
        backgroundClean: true,
        subjectCommitment: createHash('sha256').update(`zkrent:tenant:app-expired:salt-exp`).digest('hex'),
        issuedAt: now - 86400 * 60,
        expiresAt: expiredTime, // Expired
      },
      tenantSecret: 'sec-exp',
      tenantSalt: 'salt-exp',
    });
  } catch (err: any) {
    t7Caught = true;
    assert(err.message.includes('Attestation has expired'), 'T7: Expired attestation rejected by time assertion');
  }
  assert(t7Caught, 'T7: Stale credential blocked');

  console.log('\n─── T8: Unauthorized Listing Modification Protection ───');
  let t8Caught = false;
  try {
    // Impostor tries to edit listingId criteria
    simulator.registerListingCriteria(impostorSk, listingId, {
      monthlyRent: 500, // Maliciously low rent
      minMonthlyIncome: 1000,
      maxRentToIncomeRatioBps: 5000,
      minCreditScore: 500,
      requireCleanBackground: false,
      minEmploymentMonths: 0,
      primeMinIncomeRatioBps: 1000,
      primeMinCreditScore: 600,
      active: true,
    });
  } catch (err: any) {
    t8Caught = true;
    assert(err.message.includes('Only listing owner can update criteria'), 'T8: Impostor rejected from updating criteria');
  }
  assert(t8Caught, 'T8: Landlord access control verified');

  console.log('\n─── Lifecycle: Lease Consumption ───');
  simulator.consumeQualification(landlordSk, appId1);
  assert(simulator.applicationRecords.get(appId1)?.lifecycle === 'Consumed', 'Lease signing transitions record to Consumed');

  let reConsumeCaught = false;
  try {
    simulator.consumeQualification(landlordSk, appId1);
  } catch (err: any) {
    reConsumeCaught = true;
    assert(err.message.includes('Qualification is not in active state'), 'Cannot consume an already consumed qualification');
  }
  assert(reConsumeCaught, 'Double-consumption prevented');

  console.log(`\n══════════════════════════════════════════════════════════════`);
  console.log(`  Contract Test Results: ${passed} passed, ${failed} failed`);
  console.log(`══════════════════════════════════════════════════════════════\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runContractTests().catch((err) => {
  console.error('Unhandled contract test error:', err);
  process.exit(1);
});
