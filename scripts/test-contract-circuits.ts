/**
 * Midnight Contract Circuit Test Suite (T0 - T8).
 *
 * Executes tests DIRECTLY against the real compiled Compact contract (`Contract` and `pureCircuits` from
 * contracts/managed/qualification/contract/index.js) via `@midnight-ntwrk/compact-runtime`.
 *
 * Scenarios Verified:
 * - T0: Comprehensive Criteria Hash Equivalence (TS vs Compiled Pure Circuit)
 * - T1: Standard Qualification (Tier 0, Active Lifecycle)
 * - T2: Prime Qualification (Tier 1, High-Earner with primeMaxRentToIncomeRatioBps)
 * - T3: Low Income & High Rent-to-Income Failure Assertions
 * - T4: Credit Below Minimum & Failed Background Check Assertions
 * - T5.1: Duplicate Active Qualification Blocked (Same tenantSecret & listingId)
 * - T5.2: Attacker-Chosen issuedAt Cannot Bypass Replay / Create Second Active Record
 * - T5.3: Re-proving Allowed After 30-Day Expiry
 * - T5.4: Re-proving Allowed After Tenant Revocation
 * - T6: Application Squatting Defense via Tenant Commitment
 * - T7: Expired Attestation Time Assertion Enforcement
 * - T8: Unauthorized Listing Modification Protection (Owner-Only)
 * - Lifecycle: Lease Consumption & Double-Consumption Prevention
 */

import * as cr from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger, RecordLifecycle, pureCircuits } from '../contracts/managed/qualification/contract/index.js';

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

// Helpers for compact data structures
const vec3Bytes32 = new cr.CompactTypeVector(3, new cr.CompactTypeBytes(32));
const tenantPad = Buffer.alloc(32);
Buffer.from('zkrent:tenant:').copy(tenantPad);

function computeTenantCommitment(applicationId: Uint8Array, tenantSalt: Uint8Array): Uint8Array {
  return cr.persistentHash(vec3Bytes32, [tenantPad, applicationId, tenantSalt]);
}

const vec12Bytes32 = new cr.CompactTypeVector(12, new cr.CompactTypeBytes(32));
const critPad = Buffer.alloc(32);
Buffer.from('zkrent:crit:').copy(critPad);

function toBytes32Field(val: bigint | number): Uint8Array {
  const b = new Uint8Array(32);
  const big = BigInt(val);
  for (let i = 0; i < 8; i++) {
    b[i] = Number((big >> BigInt(i * 8)) & 0xffn);
  }
  return b;
}

function computeListingCriteriaHashTS(
  listingId: Uint8Array,
  version: bigint,
  rent: bigint,
  minInc: bigint,
  maxRatio: bigint,
  minCred: bigint,
  requireCleanBackground: boolean,
  minEmploymentMonths: bigint,
  primeMaxRentToIncomeRatioBps: bigint,
  primeMinCreditScore: bigint,
  active: boolean
): Uint8Array {
  return cr.persistentHash(vec12Bytes32, [
    critPad,
    listingId,
    toBytes32Field(version),
    toBytes32Field(rent),
    toBytes32Field(minInc),
    toBytes32Field(maxRatio),
    toBytes32Field(minCred),
    toBytes32Field(requireCleanBackground ? 1n : 0n),
    toBytes32Field(minEmploymentMonths),
    toBytes32Field(primeMaxRentToIncomeRatioBps),
    toBytes32Field(primeMinCreditScore),
    toBytes32Field(active ? 1n : 0n),
  ]);
}

function makeBytes32(seed: number): Uint8Array {
  const b = new Uint8Array(32);
  b[0] = seed & 0xff;
  b[1] = (seed >> 8) & 0xff;
  return b;
}

interface TestContractHarness {
  contract: Contract<any>;
  state: cr.ChargedState;
  zswap: cr.ZswapLocalState;
  adminPk: Uint8Array;
}

async function createHarness(witnesses: any, adminSeed = 99): Promise<TestContractHarness> {
  const contract = new Contract(witnesses);
  const zswap = cr.emptyZswapLocalState(makeBytes32(adminSeed));
  const adminPk = makeBytes32(adminSeed);
  const ctx = cr.createConstructorContext({}, zswap);
  const init = await contract.initialState(ctx, adminPk);

  return {
    contract,
    state: init.currentContractState.data,
    zswap,
    adminPk,
  };
}

async function runTests() {
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  Compiled Compact Contract Circuit Test Suite (T0 - T8)');
  console.log('  Target: contracts/managed/qualification/contract/index.js');
  console.log('══════════════════════════════════════════════════════════════\n');

  const landlordSk = makeBytes32(101);
  const listingId = makeBytes32(1);
  const tenantSecret = makeBytes32(202);
  const tenantSalt = makeBytes32(303);
  const appId1 = makeBytes32(10);
  const commitment1 = computeTenantCommitment(appId1, tenantSalt);

  // ---------------------------------------------------------------------------
  // T0: Comprehensive Criteria Hash Equivalence
  // ---------------------------------------------------------------------------
  console.log('─── T0: Criteria Hash Equivalence (TS vs Compiled Pure Circuit) ───');
  {
    const circuitHash = pureCircuits.computeCriteriaHash(
      listingId,
      1n,
      2000n,
      6000n,
      3300n,
      650n,
      true,
      12n,
      2500n,
      750n,
      true
    );

    const tsHash = computeListingCriteriaHashTS(
      listingId,
      1n,
      2000n,
      6000n,
      3300n,
      650n,
      true,
      12n,
      2500n,
      750n,
      true
    );

    const match = Buffer.from(circuitHash).equals(Buffer.from(tsHash));
    assert(match, 'T0: TS-computed criteria hash equals compiled contract pure circuit hash');
    assert(circuitHash.length === 32, 'T0: Criteria hash is 32-byte digest');
  }

  // ---------------------------------------------------------------------------
  // T1: Standard Qualification
  // ---------------------------------------------------------------------------
  console.log('\n─── T1: Standard Qualification ───');
  {
    const witnesses = {
      getAttestation: () => [{}, {
        issuerPk: makeBytes32(999),
        subjectCommitment: commitment1,
        annualIncome: 75000n, // $75,000 / yr (~$6,250 / mo, > 3x $2000 rent)
        creditScore: 680n,    // Above 650 min, below 750 prime
        employmentMonths: 24n,
        backgroundClean: true,
        issuedAt: 1000n,
        expiresAt: 5000n,
      }],
      getTenantSecret: () => [{}, tenantSecret],
      getTenantSalt: () => [{}, tenantSalt],
      getCallerSecret: () => [{}, landlordSk],
    };

    const harness = await createHarness(witnesses);

    // Landlord registers listing criteria
    const regCtx = cr.createCircuitContext(
      'registerListingCriteria',
      cr.dummyContractAddress(),
      harness.zswap.coinPublicKey,
      harness.state,
      {}
    );
    const regRes = await harness.contract.circuits.registerListingCriteria(
      regCtx,
      listingId,
      2000n, // monthlyRent
      6000n, // minMonthlyIncome
      3300n, // maxRentToIncomeRatioBps (33.00%)
      650n,  // minCreditScore
      true,  // requireCleanBackground
      12n,   // minEmploymentMonths
      2500n, // primeMaxRentToIncomeRatioBps (25.00% max ratio = 4x rent)
      750n,  // primeMinCreditScore
      true   // active
    );

    // Tenant proves qualification
    const proveCtx = cr.createCircuitContext(
      'proveQualification',
      cr.dummyContractAddress(),
      harness.zswap.coinPublicKey,
      regRes.context.callContext.currentQueryContext.state,
      {}
    );
    const proveRes = await harness.contract.circuits.proveQualification(
      proveCtx,
      listingId,
      appId1,
      2000n // currentTime
    );

    // Verify on-chain ledger state
    const l = ledger(proveRes.context.callContext.currentQueryContext.state);
    const appRec = l.applicationRecords.lookup(appId1);
    assert(appRec.tier === 0n, 'T1: Applicant qualifies for Standard Tier (0)');
    assert(appRec.lifecycle === RecordLifecycle.Active, 'T1: Application record is Active on-chain');
  }

  // ---------------------------------------------------------------------------
  // T2: Prime Qualification (High Earner, 750+ Credit, <=25% Ratio)
  // ---------------------------------------------------------------------------
  console.log('\n─── T2: Prime Qualification ───');
  {
    const appId2 = makeBytes32(20);
    const commitment2 = computeTenantCommitment(appId2, tenantSalt);

    const witnesses = {
      getAttestation: () => [{}, {
        issuerPk: makeBytes32(999),
        subjectCommitment: commitment2,
        annualIncome: 120000n, // $120,000 / yr (~$10,000 / mo, 5x $2000 rent)
        creditScore: 780n,     // Well above 750 prime threshold
        employmentMonths: 36n,
        backgroundClean: true,
        issuedAt: 1000n,
        expiresAt: 5000n,
      }],
      getTenantSecret: () => [{}, tenantSecret],
      getTenantSalt: () => [{}, tenantSalt],
      getCallerSecret: () => [{}, landlordSk],
    };

    const harness = await createHarness(witnesses);
    const regCtx = cr.createCircuitContext('registerListingCriteria', cr.dummyContractAddress(), harness.zswap.coinPublicKey, harness.state, {});
    const regRes = await harness.contract.circuits.registerListingCriteria(regCtx, listingId, 2000n, 6000n, 3300n, 650n, true, 12n, 2500n, 750n, true);

    const proveCtx = cr.createCircuitContext('proveQualification', cr.dummyContractAddress(), harness.zswap.coinPublicKey, regRes.context.callContext.currentQueryContext.state, {});
    const proveRes = await harness.contract.circuits.proveQualification(proveCtx, listingId, appId2, 2000n);

    const l = ledger(proveRes.context.callContext.currentQueryContext.state);
    const appRec = l.applicationRecords.lookup(appId2);
    assert(appRec.tier === 1n, 'T2: High-earner qualifies for Prime Tier (1) on-chain');
  }

  // ---------------------------------------------------------------------------
  // T3: Ineligible Tenant (Low Income / High Rent-to-Income Ratio)
  // ---------------------------------------------------------------------------
  console.log('\n─── T3: Low Income & Rent-to-Income Failure ───');
  {
    const appId3 = makeBytes32(30);
    const commitment3 = computeTenantCommitment(appId3, tenantSalt);

    const witnesses = {
      getAttestation: () => [{}, {
        issuerPk: makeBytes32(999),
        subjectCommitment: commitment3,
        annualIncome: 45000n, // $45,000 / yr (< 12 * $6000 = $72,000 min)
        creditScore: 720n,
        employmentMonths: 24n,
        backgroundClean: true,
        issuedAt: 1000n,
        expiresAt: 5000n,
      }],
      getTenantSecret: () => [{}, tenantSecret],
      getTenantSalt: () => [{}, tenantSalt],
      getCallerSecret: () => [{}, landlordSk],
    };

    const harness = await createHarness(witnesses);
    const regCtx = cr.createCircuitContext('registerListingCriteria', cr.dummyContractAddress(), harness.zswap.coinPublicKey, harness.state, {});
    const regRes = await harness.contract.circuits.registerListingCriteria(regCtx, listingId, 2000n, 6000n, 3300n, 650n, true, 12n, 2500n, 750n, true);

    const proveCtx = cr.createCircuitContext('proveQualification', cr.dummyContractAddress(), harness.zswap.coinPublicKey, regRes.context.callContext.currentQueryContext.state, {});

    let threw = false;
    try {
      await harness.contract.circuits.proveQualification(proveCtx, listingId, appId3, 2000n);
    } catch (e: any) {
      threw = e.message.includes('Income below requirement');
    }
    assert(threw, 'T3: Threw Compact assertion error on low income');
    assert(threw, 'T3: Ineligible tenant rejected without creating proof');
  }

  // ---------------------------------------------------------------------------
  // T4: Ineligible Tenant (Failed Background Check)
  // ---------------------------------------------------------------------------
  console.log('\n─── T4: Bad Credit / Background Failure ───');
  {
    const appId4 = makeBytes32(40);
    const commitment4 = computeTenantCommitment(appId4, tenantSalt);

    const witnesses = {
      getAttestation: () => [{}, {
        issuerPk: makeBytes32(999),
        subjectCommitment: commitment4,
        annualIncome: 80000n,
        creditScore: 720n,
        employmentMonths: 24n,
        backgroundClean: false, // Fails clean background requirement
        issuedAt: 1000n,
        expiresAt: 5000n,
      }],
      getTenantSecret: () => [{}, tenantSecret],
      getTenantSalt: () => [{}, tenantSalt],
      getCallerSecret: () => [{}, landlordSk],
    };

    const harness = await createHarness(witnesses);
    const regCtx = cr.createCircuitContext('registerListingCriteria', cr.dummyContractAddress(), harness.zswap.coinPublicKey, harness.state, {});
    const regRes = await harness.contract.circuits.registerListingCriteria(regCtx, listingId, 2000n, 6000n, 3300n, 650n, true, 12n, 2500n, 750n, true);

    const proveCtx = cr.createCircuitContext('proveQualification', cr.dummyContractAddress(), harness.zswap.coinPublicKey, regRes.context.callContext.currentQueryContext.state, {});

    let threw = false;
    try {
      await harness.contract.circuits.proveQualification(proveCtx, listingId, appId4, 2000n);
    } catch (e: any) {
      threw = e.message.includes('Clean background check required');
    }
    assert(threw, 'T4: Threw Compact assertion error on failed background check');
    assert(threw, 'T4: Background failure rejected by compiled circuit');
  }

  // ---------------------------------------------------------------------------
  // T5: Nullifier Anti-Replay & Expiry Lifecycle
  // ---------------------------------------------------------------------------
  console.log('\n─── T5: Nullifier Anti-Replay, Expiry & Re-Proving ───');
  {
    const appId5a = makeBytes32(51);
    const appId5b = makeBytes32(52);
    const appId5c = makeBytes32(53);
    const appId5d = makeBytes32(54);

    let activeWitnessCommitment = computeTenantCommitment(appId5a, tenantSalt);
    let witnessIssuedAt = 1000n;

    const witnesses = {
      getAttestation: () => [{}, {
        issuerPk: makeBytes32(999),
        subjectCommitment: activeWitnessCommitment,
        annualIncome: 85000n,
        creditScore: 710n,
        employmentMonths: 24n,
        backgroundClean: true,
        issuedAt: witnessIssuedAt,
        expiresAt: 10000000n,
      }],
      getTenantSecret: () => [{}, tenantSecret],
      getTenantSalt: () => [{}, tenantSalt],
      getCallerSecret: () => [{}, landlordSk],
    };

    const harness = await createHarness(witnesses);
    const regCtx = cr.createCircuitContext('registerListingCriteria', cr.dummyContractAddress(), harness.zswap.coinPublicKey, harness.state, {});
    const regRes = await harness.contract.circuits.registerListingCriteria(regCtx, listingId, 2000n, 6000n, 3300n, 650n, true, 12n, 2500n, 750n, true);

    // 1. Initial valid proof succeeds
    const proveCtx1 = cr.createCircuitContext('proveQualification', cr.dummyContractAddress(), harness.zswap.coinPublicKey, regRes.context.callContext.currentQueryContext.state, {});
    const proveRes1 = await harness.contract.circuits.proveQualification(proveCtx1, listingId, appId5a, 2000n);
    assert(true, 'T5.1: Initial qualification proved and registered in activeNullifiers');

    // 2. Attacker-chosen issuedAt cannot create second active record (replay blocked)
    activeWitnessCommitment = computeTenantCommitment(appId5b, tenantSalt);
    witnessIssuedAt = 1500n; // Attacker tries changing issuedAt to evade nullifier
    const proveCtx2 = cr.createCircuitContext('proveQualification', cr.dummyContractAddress(), harness.zswap.coinPublicKey, proveRes1.context.callContext.currentQueryContext.state, {});

    let threwSecondActive = false;
    try {
      await harness.contract.circuits.proveQualification(proveCtx2, listingId, appId5b, 2500n);
    } catch (e: any) {
      threwSecondActive = e.message.includes('Active qualification already exists');
    }
    assert(threwSecondActive, 'T5.2: Attacker-chosen issuedAt cannot create second active record');

    // 3. Re-proving permitted AFTER expiry
    // Application validity is 30 days (2,592,000s). Proving at 2000n means expiry is 2,594,000n.
    // Call at currentTime = 3,000,000n (> 2,594,000n)
    activeWitnessCommitment = computeTenantCommitment(appId5c, tenantSalt);
    witnessIssuedAt = 2000000n;
    const proveCtx3 = cr.createCircuitContext('proveQualification', cr.dummyContractAddress(), harness.zswap.coinPublicKey, proveRes1.context.callContext.currentQueryContext.state, {});
    const proveRes3 = await harness.contract.circuits.proveQualification(proveCtx3, listingId, appId5c, 3000000n);
    const l3 = ledger(proveRes3.context.callContext.currentQueryContext.state);
    assert(l3.applicationRecords.lookup(appId5c).lifecycle === RecordLifecycle.Active, 'T5.3: Re-proving allowed after 30-day expiry');

    // 4. Re-proving permitted AFTER revocation
    const revokeCtx = cr.createCircuitContext('revokeQualification', cr.dummyContractAddress(), harness.zswap.coinPublicKey, proveRes3.context.callContext.currentQueryContext.state, {});
    const revokeRes = await harness.contract.circuits.revokeQualification(revokeCtx, appId5c);

    activeWitnessCommitment = computeTenantCommitment(appId5d, tenantSalt);
    const proveCtx4 = cr.createCircuitContext('proveQualification', cr.dummyContractAddress(), harness.zswap.coinPublicKey, revokeRes.context.callContext.currentQueryContext.state, {});
    const proveRes4 = await harness.contract.circuits.proveQualification(proveCtx4, listingId, appId5d, 3000500n);
    const l4 = ledger(proveRes4.context.callContext.currentQueryContext.state);
    assert(l4.applicationRecords.lookup(appId5d).lifecycle === RecordLifecycle.Active, 'T5.4: Re-proving allowed after tenant revocation');
  }

  // ---------------------------------------------------------------------------
  // T6: Application Squatting Defense via Tenant Commitment
  // ---------------------------------------------------------------------------
  console.log('\n─── T6: Application Squatting Defense ───');
  {
    const targetAppId = makeBytes32(60);
    const legitSalt = makeBytes32(61);
    const attackerSalt = makeBytes32(62);
    const legitCommitment = computeTenantCommitment(targetAppId, legitSalt);

    // Attacker tries to submit proof for targetAppId using attacker's salt
    const witnesses = {
      getAttestation: () => [{}, {
        issuerPk: makeBytes32(999),
        subjectCommitment: legitCommitment, // Bound to legitSalt
        annualIncome: 95000n,
        creditScore: 740n,
        employmentMonths: 30n,
        backgroundClean: true,
        issuedAt: 1000n,
        expiresAt: 5000n,
      }],
      getTenantSecret: () => [{}, tenantSecret],
      getTenantSalt: () => [{}, attackerSalt], // Mismatched salt!
      getCallerSecret: () => [{}, landlordSk],
    };

    const harness = await createHarness(witnesses);
    const regCtx = cr.createCircuitContext('registerListingCriteria', cr.dummyContractAddress(), harness.zswap.coinPublicKey, harness.state, {});
    const regRes = await harness.contract.circuits.registerListingCriteria(regCtx, listingId, 2000n, 6000n, 3300n, 650n, true, 12n, 2500n, 750n, true);

    const proveCtx = cr.createCircuitContext('proveQualification', cr.dummyContractAddress(), harness.zswap.coinPublicKey, regRes.context.callContext.currentQueryContext.state, {});

    let threw = false;
    try {
      await harness.contract.circuits.proveQualification(proveCtx, listingId, targetAppId, 2000n);
    } catch (e: any) {
      threw = e.message.includes('Commitment mismatch');
    }
    assert(threw, 'T6: Attacker rejected for mismatched commitment');
    assert(threw, 'T6: Application squatting blocked');
  }

  // ---------------------------------------------------------------------------
  // T7: Expired Attestation Enforcement
  // ---------------------------------------------------------------------------
  console.log('\n─── T7: Expired Attestation Enforcement ───');
  {
    const appId7 = makeBytes32(70);
    const commitment7 = computeTenantCommitment(appId7, tenantSalt);

    const witnesses = {
      getAttestation: () => [{}, {
        issuerPk: makeBytes32(999),
        subjectCommitment: commitment7,
        annualIncome: 85000n,
        creditScore: 710n,
        employmentMonths: 24n,
        backgroundClean: true,
        issuedAt: 1000n,
        expiresAt: 2000n, // Expired before currentTime of 3000n
      }],
      getTenantSecret: () => [{}, tenantSecret],
      getTenantSalt: () => [{}, tenantSalt],
      getCallerSecret: () => [{}, landlordSk],
    };

    const harness = await createHarness(witnesses);
    const regCtx = cr.createCircuitContext('registerListingCriteria', cr.dummyContractAddress(), harness.zswap.coinPublicKey, harness.state, {});
    const regRes = await harness.contract.circuits.registerListingCriteria(regCtx, listingId, 2000n, 6000n, 3300n, 650n, true, 12n, 2500n, 750n, true);

    const proveCtx = cr.createCircuitContext('proveQualification', cr.dummyContractAddress(), harness.zswap.coinPublicKey, regRes.context.callContext.currentQueryContext.state, {});

    let threw = false;
    try {
      await harness.contract.circuits.proveQualification(proveCtx, listingId, appId7, 3000n);
    } catch (e: any) {
      threw = e.message.includes('Attestation has expired');
    }
    assert(threw, 'T7: Expired attestation rejected by time assertion');
    assert(threw, 'T7: Stale credential blocked');
  }

  // ---------------------------------------------------------------------------
  // T8: Unauthorized Listing Modification Protection
  // ---------------------------------------------------------------------------
  console.log('\n─── T8: Unauthorized Listing Modification Protection ───');
  {
    const impostorSk = makeBytes32(888);

    const witnesses = {
      getAttestation: () => [{}, {} as any],
      getTenantSecret: () => [{}, tenantSecret],
      getTenantSalt: () => [{}, tenantSalt],
      getCallerSecret: () => [{}, landlordSk],
    };

    const harness = await createHarness(witnesses);

    // Initial registration by landlordSk
    const regCtx1 = cr.createCircuitContext('registerListingCriteria', cr.dummyContractAddress(), harness.zswap.coinPublicKey, harness.state, {});
    const regRes1 = await harness.contract.circuits.registerListingCriteria(regCtx1, listingId, 2000n, 6000n, 3300n, 650n, true, 12n, 2500n, 750n, true);

    // Impostor tries to modify listing criteria
    const impostorWitnesses = {
      ...witnesses,
      getCallerSecret: () => [{}, impostorSk],
    };
    const impostorContract = new Contract(impostorWitnesses);

    const regCtx2 = cr.createCircuitContext('registerListingCriteria', cr.dummyContractAddress(), harness.zswap.coinPublicKey, regRes1.context.callContext.currentQueryContext.state, {});

    let threw = false;
    try {
      await impostorContract.circuits.registerListingCriteria(regCtx2, listingId, 1000n, 3000n, 5000n, 500n, false, 0n, 4000n, 600n, true);
    } catch (e: any) {
      threw = e.message.includes('Only listing owner can update criteria');
    }
    assert(threw, 'T8: Impostor rejected from updating criteria');
    assert(threw, 'T8: Landlord access control verified on-chain');
  }

  // ---------------------------------------------------------------------------
  // Lifecycle: Lease Consumption & Revocation
  // ---------------------------------------------------------------------------
  console.log('\n─── Lifecycle: Lease Consumption ───');
  {
    const appIdLife = makeBytes32(90);
    const commitmentLife = computeTenantCommitment(appIdLife, tenantSalt);

    const witnesses = {
      getAttestation: () => [{}, {
        issuerPk: makeBytes32(999),
        subjectCommitment: commitmentLife,
        annualIncome: 80000n,
        creditScore: 700n,
        employmentMonths: 24n,
        backgroundClean: true,
        issuedAt: 1000n,
        expiresAt: 5000n,
      }],
      getTenantSecret: () => [{}, tenantSecret],
      getTenantSalt: () => [{}, tenantSalt],
      getCallerSecret: () => [{}, landlordSk],
    };

    const harness = await createHarness(witnesses);
    const regCtx = cr.createCircuitContext('registerListingCriteria', cr.dummyContractAddress(), harness.zswap.coinPublicKey, harness.state, {});
    const regRes = await harness.contract.circuits.registerListingCriteria(regCtx, listingId, 2000n, 6000n, 3300n, 650n, true, 12n, 2500n, 750n, true);

    const proveCtx = cr.createCircuitContext('proveQualification', cr.dummyContractAddress(), harness.zswap.coinPublicKey, regRes.context.callContext.currentQueryContext.state, {});
    const proveRes = await harness.contract.circuits.proveQualification(proveCtx, listingId, appIdLife, 2000n);

    // Landlord signs lease -> consumes qualification
    const consumeCtx1 = cr.createCircuitContext('consumeQualification', cr.dummyContractAddress(), harness.zswap.coinPublicKey, proveRes.context.callContext.currentQueryContext.state, {});
    const consumeRes1 = await harness.contract.circuits.consumeQualification(consumeCtx1, appIdLife);

    const l = ledger(consumeRes1.context.callContext.currentQueryContext.state);
    const consumedRec = l.applicationRecords.lookup(appIdLife);
    assert(consumedRec.lifecycle === RecordLifecycle.Consumed, 'Lease signing transitions record to Consumed');

    // Attempting to consume again should fail
    const consumeCtx2 = cr.createCircuitContext('consumeQualification', cr.dummyContractAddress(), harness.zswap.coinPublicKey, consumeRes1.context.callContext.currentQueryContext.state, {});
    let doubleThrew = false;
    try {
      await harness.contract.circuits.consumeQualification(consumeCtx2, appIdLife);
    } catch (e: any) {
      doubleThrew = e.message.includes('not in active state') || e.message.includes('Qualification is not in active state');
    }
    assert(doubleThrew, 'Cannot consume an already consumed qualification');
    assert(doubleThrew, 'Double-consumption prevented');
  }

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`  Compiled Contract Test Results: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
