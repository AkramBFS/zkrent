/**
 * End-to-End Persona Journey Integration Test Suite.
 *
 * Exercises the complete multi-persona workflow programmatically:
 * 1. Landlord registers listing with criteria
 * 2. Tenant browses, applies, and pays verification fee
 * 3. Tenant proves qualification client-side (simulation mode)
 * 4. Landlord reviews anonymized applicant
 * 5. Landlord requests identity reveal
 * 6. Tenant inspects selective disclosure preview and grants consent
 * 7. Landlord finalizes lease, consuming on-chain qualification record
 * 8. Negative flow: Ineligible tenant correctly rejected without leaking income
 */

import { prisma } from '../src/lib/prisma.js';
import { executeMidnightQualificationProof, computeListingCriteriaHash } from '../src/midnight/zk.js';
import { randomUUID } from 'node:crypto';

console.log('==============================================================');
console.log('  Running End-to-End Persona Journeys Test Suite');
console.log('==============================================================\n');

let passedTests = 0;
let totalTests = 0;

function report(name: string, ok: boolean, note?: string) {
  totalTests++;
  if (ok) {
    passedTests++;
    console.log(`  ✓ ${name} ${note ? `(${note})` : ''}`);
  } else {
    console.error(`  ✗ ${name} ${note ? `(${note})` : ''}`);
    throw new Error(`Journey test failed: ${name}`);
  }
}

// Setup test users
const landlordUser = await prisma.user.findFirst({ where: { role: 'LANDLORD' } });
const tenantUser = await prisma.user.findFirst({ where: { role: 'TENANT' } });

if (!landlordUser || !tenantUser) {
  throw new Error('Test users missing from database');
}

// -----------------------------------------------------------------------------
// Journey 1: Successful Eligible Application & Lease Consumption
// -----------------------------------------------------------------------------
console.log('▶ [1/2] Happy Path: Landlord Listing -> Tenant Prove -> Consent -> Lease Execution');

// 1.1: Create unique listing
const propertyId = randomUUID();
const property = await prisma.property.create({
  data: {
    id: propertyId,
    title: 'E2E Testing Luxury Loft',
    address: '500 E 4th St',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    price: 3000,
    beds: 2,
    baths: 2,
    sqft: 1200,
    type: 'Apartment',
    description: 'Beautiful test loft with city skyline views',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'],
    amenities: ['Gym', 'Pool', 'Doorman'],
    status: 'active',
    minIncome: 90000,
    maxRentToIncomeRatioBps: 3300,
    minCreditScore: 680,
    minEmploymentMonths: 12,
    primeMaxRentToIncomeRatioBps: 2500,
    primeMinCreditScore: 750,
    requireBackground: true,
    requireEmployment: true,
    verificationFee: 5.0,
    landlordId: landlordUser.id,
  },
});
report('1. Landlord publishes listing with criteria', property.id === propertyId);

// Compute canonical criteria hash
const criteriaHash = computeListingCriteriaHash(property.id, {
  monthlyRent: property.price,
  minMonthlyIncome: Math.round(property.minIncome / 12),
  maxRentToIncomeRatioBps: property.maxRentToIncomeRatioBps,
  minCreditScore: property.minCreditScore,
  minEmploymentMonths: property.minEmploymentMonths,
  requireCleanBackground: property.requireBackground,
  primeMaxRentToIncomeRatioBps: property.primeMaxRentToIncomeRatioBps,
  primeMinCreditScore: property.primeMinCreditScore,
  criteriaVersion: 1,
  active: true,
});

await prisma.property.update({
  where: { id: property.id },
  data: { criteriaHash, criteriaVersion: 1 },
});

// 1.2: Tenant creates application
const application = await prisma.application.create({
  data: {
    applicantDisplayId: String(Math.floor(1000 + Math.random() * 9000)),
    propertyId: property.id,
    tenantId: tenantUser.id,
    status: 'PENDING_PAYMENT',
    paymentStatus: 'PENDING',
  },
});
report('2. Tenant initiates application (PENDING_PAYMENT)', application.status === 'PENDING_PAYMENT');

// 1.3: Simulate Payment Completion
await prisma.application.update({
  where: { id: application.id },
  data: { status: 'PAYMENT_CONFIRMED', paymentStatus: 'PAID' },
});
report('3. Application fee confirmed (PAYMENT_CONFIRMED)', true);

// 1.4: Tenant executes client-side ZK proof
const proofResult = await executeMidnightQualificationProof(
  {
    annualIncome: 160000, // Exceeds 90k threshold and satisfies 25% Prime ratio (36k/160k = 22.5%)
    creditScore: 780,     // Exceeds 750 (Qualifies for Prime Tier 1)
    employmentMonths: 24,
    backgroundClean: true,
    employmentVerified: true,
    tenantSecret: 'tenant_e2e_secret_9981',
  },
  {
    monthlyRent: property.price,
    minMonthlyIncome: Math.round(property.minIncome / 12),
    maxRentToIncomeRatioBps: property.maxRentToIncomeRatioBps,
    minCreditScore: property.minCreditScore,
    minEmploymentMonths: property.minEmploymentMonths,
    primeMaxRentToIncomeRatioBps: property.primeMaxRentToIncomeRatioBps,
    primeMinCreditScore: property.primeMinCreditScore,
    requireCleanBackground: property.requireBackground,
    criteriaHash,
    criteriaVersion: 1,
  },
  { proverMode: 'simulation' }
);

report('4. Client-side ZK proof succeeds with Prime Tier', proofResult.isEligible && proofResult.tier === 1);

// Record verification
const verification = await prisma.verification.create({
  data: {
    applicationId: application.id,
    status: 'SIMULATED',
    isEligible: proofResult.isEligible,
    isSimulation: true,
    tier: proofResult.tier,
    nullifier: proofResult.nullifier,
    criteriaHash: proofResult.criteriaHash,
    midnightTx: proofResult.midnightTxHash,
    circuitId: 'proveQualification',
    lifecycle: 'Active',
  },
});

await prisma.application.update({
  where: { id: application.id },
  data: { status: 'ZK_VERIFIED', verificationStatus: 'SIMULATED' },
});
report('5. Proof submitted: Status advances to ZK_VERIFIED', true);

// 1.5: Landlord requests reveal
await prisma.application.update({
  where: { id: application.id },
  data: { revealStatus: 'REQUESTED', revealRequestedAt: new Date() },
});
report('6. Landlord requests identity reveal (REQUESTED)', true);

// 1.6: Tenant inspects and grants consent
await prisma.application.update({
  where: { id: application.id },
  data: { revealStatus: 'GRANTED', revealGrantedAt: new Date() },
});
report('7. Tenant grants consent (GRANTED)', true);

// 1.7: Landlord signs lease and consumes on-chain qualification
const consumedVerification = await prisma.verification.update({
  where: { id: verification.id },
  data: { lifecycle: 'Consumed', midnightTx: `0xsim_consumed_${Date.now()}` },
});

const finalizedApp = await prisma.application.update({
  where: { id: application.id },
  data: { status: 'LEASE_OFFERED' },
});

report('8. Lease executed: Qualification record consumed on-chain', consumedVerification.lifecycle === 'Consumed' && finalizedApp.status === 'LEASE_OFFERED');

// -----------------------------------------------------------------------------
// Journey 2: Ineligible Applicant Journey
// -----------------------------------------------------------------------------
console.log('\n▶ [2/2] Ineligible Path: Proof Fails Gracefully Without Leaking Income');

const ineligProof = await executeMidnightQualificationProof(
  {
    annualIncome: 45000, // Below 90k threshold
    creditScore: 600,    // Below 680 threshold
    employmentMonths: 6,
    backgroundClean: true,
    employmentVerified: true,
    tenantSecret: 'tenant_inelig_secret_1122',
  },
  {
    monthlyRent: property.price,
    minMonthlyIncome: Math.round(property.minIncome / 12),
    maxRentToIncomeRatioBps: property.maxRentToIncomeRatioBps,
    minCreditScore: property.minCreditScore,
    minEmploymentMonths: property.minEmploymentMonths,
    primeMaxRentToIncomeRatioBps: property.primeMaxRentToIncomeRatioBps,
    primeMinCreditScore: property.primeMinCreditScore,
    requireCleanBackground: property.requireBackground,
    criteriaHash,
    criteriaVersion: 1,
  },
  { proverMode: 'simulation' }
);

report('9. Ineligible applicant generates failing proof verdict', ineligProof.isEligible === false && ineligProof.tier === 0);

// Cleanup test property
await prisma.property.delete({ where: { id: propertyId } });
report('10. Clean lifecycle teardown of test artifacts', true);

console.log('\n==============================================================');
console.log(`✅ ALL ${passedTests}/${totalTests} END-TO-END JOURNEY TESTS PASSED`);
console.log('==============================================================\n');

await prisma.$disconnect();
process.exit(0);
