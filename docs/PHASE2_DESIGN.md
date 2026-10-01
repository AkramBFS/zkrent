# Phase 2 Step A: Smart Contract & ZK Architecture Design Document (Revised)

**Date**: October 2026  
**Revision**: 2.0 (Post-Review Architecture)  
**Status**: Resubmitted for Approval  
**Context**: ZkRent Decentralized Privacy-Preserving Tenant Qualification Engine  

---

## 1. Summary of Changes in Revision 2.0

Based on architectural feedback on Revision 1.0, the following changes have been incorporated:
1. **Listing Ownership & Key Model**: Explicit public-key-based access control. Only the listing's verified owner can register or modify criteria. Each verification record binds directly to the immutable criteria hash (`criteriaHash`) and version proven against.
2. **Landlord Queryability & Nullifier Decoupling**: Decoupled the public lookup directory (`applicationRecords` keyed by `applicationId`) from the private replay-prevention set (`nullifierSet` keyed by private tenant nullifier). Landlords can verify qualification status without knowledge of tenant secrets.
3. **Application Squatting Defense**: Each `applicationId` is bound to a `tenantCommitment` at creation. Only the holder of the matching secret can submit proofs for that application.
4. **Semantics of Non-Qualification**: Clarified that failing circuits produce no proof on-chain. Removed redundant boolean flags (`qualified: true`). Documented client-side handling and privacy preservation for ineligible applicants.
5. **On-Chain Time Integrity**: Eliminated client-supplied timestamps. Time constraints use on-chain time assertions (`blockTimeLt`) with a documented block tolerance window ($\pm 15$ seconds).
6. **Proving Architecture & Privacy Realities**: Evaluated Midnight proof-server architecture. Documented data visibility across Local Dev, Hosted Demo, and Tenant-Local modes. Completely removed raw financial data from server-bound HTTP requests (`/api/verifications/prove`).
7. **Lifecycle & Admin Controls**: Implemented an emergency pause circuit (`isPaused`) and a complete verification lifecycle (`Active -> Consumed -> Revoked`) including lease-signing consumption.
8. **Multiplication-Only Circuit Arithmetic & Customizable Tiers**: Replaced expensive circuit division with integer cross-multiplication. Moved Prime tier thresholds into `ListingCriteria`. Documented the decision on off-chain cryptographic consent for identity reveals.
9. **Attestation-Formatted Inputs & Demo Verifier**: Formatted witness inputs into an `Attestation` structure compatible with future digital signatures, and implemented a verifiable demo issuer workflow.
10. **Engineering Plans**: Added a formal Contract Test Plan, Constraint Profiling Plan, Staged Migration Plan, and Simulation Mode Fidelity Specification.

---

## 2. System Architecture & Role Boundaries

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TENANT DEVICE (Client)                            │
│                                                                             │
│  [ Paystub / W2 / Bank PDF ] ──> [ Local OCR (Tesseract.js) ]               │
│                                           │                                 │
│                                           ▼                                 │
│                               [ Attestation Preimage ]                      │
│                                           │                                 │
│                                           ▼                                 │
│                       [ Compact ZK Prover / Proof Server ]                  │
│                                           │                                 │
│         Private Witnesses                 │  ZK Proof, Nullifier,           │
│      (NEVER leave the device)             │  Public Outputs                 │
└───────────────────────────────────────────┼─────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MIDNIGHT LEDGER                                  │
│                                                                             │
│  • Listings Registry:       listings[listingId] -> ListingCriteria          │
│  • Public Applications:     applicationRecords[appId] -> StatusRecord       │
│  • Replay Protection Set:   nullifierSet -> Set<Bytes<32>>                  │
│  • Contract Administration: isPaused (Boolean), adminPk (Bytes<32>)         │
└───────────────────────────────────────────┬─────────────────────────────────┘
                                            │
                                            ▼  Query by applicationId
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LANDLORD PORTAL & BACKEND                            │
│                                                                             │
│  • Reads applicationRecords[appId] (Tier, Expiry, Status, CriteriaHash)     │
│  • Never sees tenant income, credit score, or raw documents                 │
│  • Request Identity Reveal -> Tenant signs cryptographic consent token     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Public Ledger State vs. Private Witness State

### 3.1 Public Ledger State (On-Chain)
The contract maintains three core ledger structures and administrative state:

```compact
// 1. Listing Criteria Registry
export ledger listings: Map<Bytes<32>, ListingCriteria>;

// 2. Public Application Verification Directory (Landlord Queryable)
export ledger applicationRecords: Map<Bytes<32>, ApplicationStatusRecord>;

// 3. Replay-Prevention Nullifier Set (Private Unlinkability)
export ledger nullifierSet: Set<Bytes<32>>;

// 4. Contract Administration & Circuit Emergency Stop
export sealed ledger contractAdmin: Bytes<32>;
export ledger isPaused: Boolean;
```

#### Data Structs:
```compact
export struct ListingCriteria {
  landlordPk: Bytes<32>,               // Landlord authority key
  criteriaVersion: Uint<32>,           // Incremented on update
  criteriaHash: Bytes<32>,             // Hash of requirements for immutable binding
  monthlyRent: Uint<64>,               // Rent in smallest currency unit (cents)
  minMonthlyIncome: Uint<64>,          // Absolute minimum monthly income
  maxRentToIncomeRatioBps: Uint<16>,   // Max rent/income in basis points (e.g. 3300 = 33%)
  minCreditScore: Uint<16>,            // e.g. 650
  requireCleanBackground: Boolean,     // True if criminal background check must be clean
  minEmploymentMonths: Uint<16>,       // Continuous employment duration
  primeMinIncomeRatioBps: Uint<16>,    // Prime tier threshold (e.g. 40000 = 4x rent)
  primeMinCreditScore: Uint<16>,       // Prime tier credit (e.g. 750)
  active: Boolean                      // Availability flag
}

export enum RecordLifecycle { Active, Consumed, Revoked }

export struct ApplicationStatusRecord {
  listingId: Bytes<32>,                // Property reference
  criteriaHash: Bytes<32>,             // Exact criteria hash proven against
  tenantCommitment: Bytes<32>,         // Bound tenant identity commitment
  tier: Uint<8>,                       // 0 = Standard, 1 = Prime
  lifecycle: RecordLifecycle,          // Active, Consumed, or Revoked
  verifiedAt: Uint<64>,                // Block timestamp when proof was finalized
  expiresAt: Uint<64>                  // Block timestamp after which proof is invalid
}
```

### 3.2 Private Witness State (Client-Side Prover Only)
The tenant's machine evaluates private witnesses locally; these values never leave the device:
```compact
witness getAttestation(): Attestation;
witness getTenantSecret(): Bytes<32>;
witness getTenantSalt(): Bytes<32>;
```
Where `Attestation` is structured for future issuer compatibility:
```compact
export struct Attestation {
  issuerPk: Bytes<32>,
  subjectCommitment: Bytes<32>,
  annualIncome: Uint<64>,
  creditScore: Uint<16>,
  employmentMonths: Uint<16>,
  backgroundClean: Boolean,
  issuedAt: Uint<64>,
  expiresAt: Uint<64>
}
```

---

## 4. Key Models & Security Invariants

### 4.1 Listing Ownership & Key Model
- **Key Derivation**: Landlords generate a 32-byte public key via standard domain-separated persistent hash:
  `landlordPk = persistentHash([pad(32, "zkrent:pk:"), landlordSecretKey])`.
- **Registration**: When `registerListingCriteria` is called:
  - If `listings.member(listingId)` is false: sets `listing.landlordPk = callerPk`.
  - If `listings.member(listingId)` is true: asserts `callerPk == existingListing.landlordPk`, preventing any third party from modifying criteria.
- **Criteria Binding**: Every update computes:
  `criteriaHash = persistentHash([listingId, criteriaVersion, monthlyRent, minMonthlyIncome, maxRentToIncomeRatioBps, minCreditScore])`.
  The verification record permanently records this `criteriaHash`. If a landlord alters requirements later, previously verified applications verifiably demonstrate which terms they satisfied.

### 4.2 Application Squatting Prevention
- To prevent front-running or malicious blocking of an `applicationId`, each application is bound to a `tenantCommitment`:
  `tenantCommitment = persistentCommit(tenantPublicId, tenantSalt)`.
- At application initialization, `applicationRecords.insert(applicationId, PendingRecord { tenantCommitment, ... })` is anchored.
- In `proveQualification`, the circuit asserts that the tenant witness possesses the pre-image to `tenantCommitment`. A third party cannot prove or claim another tenant's application.

### 4.3 Landlord Queryability & Nullifier Decoupling
- **Nullifier (Private Replay Protection)**:
  `nullifier = persistentHash([pad(32, "zkrent:null:"), tenantSecret, listingId])`.
  The circuit checks `!nullifierSet.member(nullifier)` and inserts it. This prevents a tenant from submitting multiple applications with the same credential for the same listing.
- **Application Record (Public Lookup)**:
  The outcome is written to `applicationRecords[applicationId]`. Landlords query `applicationRecords.lookup(applicationId)` directly using the application UUID. The landlord never learns `nullifier` or `tenantSecret`.

### 4.4 Semantics of Non-Qualification
- In zero-knowledge proof systems, an unsatisfiable circuit statement throws a constraint violation and **generates no proof**.
- A transaction submitted to the ledger with a valid proof by definition represents a **qualified applicant**.
- Redundant fields like `qualified: Boolean` are removed. The presence of an `Active` record on-chain signifies qualification.
- **Handling Ineligible Applicants**:
  - Ineligible applicants fail proof generation client-side.
  - No transaction is submitted to the blockchain.
  - The local database and UI record the application state as `UNQUALIFIED` or `FAILED_PRECONDITION`.
  - **Privacy Guarantee**: An applicant's failure to qualify is never publicized on-chain, protecting the applicant from negative reputation leakage.

### 4.5 On-Chain Time Bounds & Tolerance Window
- No client-supplied time parameters are trusted.
- The contract uses Midnight standard library block-time primitives:
  - `assert(blockTimeLt(attestation.expiresAt), "Attestation has expired")`
  - `assert(blockTimeGte(attestation.issuedAt), "Attestation not yet valid")`
- **Tolerance Window**: Midnight node and Cardano consensus allow a clock drift window of up to $\pm 15$ seconds between validator nodes. Time assertions use this tolerance buffer to prevent legitimate transactions from rejecting at boundary seconds.
- **Proof Expiration**: The verification record sets `expiresAt = currentBlockTime + 30 days`. Landlords cannot accept qualifications older than 30 days.

### 4.6 Circuit Arithmetic: Division Avoidance
Integer division in ZK circuits is computationally expensive because it requires introducing slack variables and remainder range checks. All calculations are rewritten to use **pure integer multiplication**:
1. **Minimum Income Threshold**:
   - `annualIncome >= listing.minMonthlyIncome * 12`
2. **Rent-to-Income Ratio Threshold**:
   - Standard definition: `(monthlyRent / monthlyIncome) <= (maxRentToIncomeRatioBps / 10000)`
   - Multiplied out: `monthlyRent * 12 * 10000 <= annualIncome * maxRentToIncomeRatioBps`
   - *Example*: Rent = \$2,000, Max Ratio = 33% (3300 bps), Annual Income = \$80,000:
     - LHS: $2000 \times 12 \times 10000 = 240,000,000$
     - RHS: $80000 \times 3300 = 264,000,000$
     - Constraint: $240,000,000 \le 264,000,000$ (Satisfied; zero divisions required!).
3. **Prime Tier Qualification**:
   - `monthlyRent * 12 * 10000 <= annualIncome * listing.primeMinIncomeRatioBps` AND `creditScore >= listing.primeMinCreditScore`.

---

## 5. Proving Architecture & Privacy Realities

### 5.1 Midnight Prover Mechanics
Midnight smart contracts compile to Halo2 ZK intermediate representation (`.bzkir`). Generating a proof requires:
1. Compiling the witness assignments and contract state into a `ProofPreimageVersioned`.
2. Calling the `midnight-proof-server` via binary `POST /prove` with the preimage and proving key material (~150MB).
3. Receiving the binary Halo2 proof and submitting it to the Midnight node.

### 5.2 Operating Modes & Privacy Boundary Analysis

| Mode | Where Proof Server Runs | Who Can See Private Witnesses | UI / Documentation Disclosure |
|---|---|---|---|
| **Local Dev** | Local Docker / Native binary on `localhost:6300` | Only the local developer on their machine | Labeled: `[Localhost Prover - Confidential]` |
| **Hosted Demo** | Hosted backend service on demo server | The hosted server operator could inspect HTTP preimages | Labeled: `[Hosted Prover - Demonstration Only: Do not use real PII]` |
| **Tenant-Local (Target)** | Midnight Desktop / Browser Wasm Prover | 100% Client-Side. No third party sees witnesses | Labeled: `[Client-Side Prover - Zero Knowledge]` |
| **Simulation Mode** | Client browser runtime (deterministic simulator) | 100% Client-Side. Deterministic commitments | Labeled: `[SIMULATED PROOF - Offline Testing]` |

### 5.3 Elimination of Server-Side Witness Leakage
In the current codebase, `POST /api/verifications/prove` receives `{ income: 95000, backgroundVerified: true }`.
**In Revision 2.0, this route is refactored**:
- The client-side application orchestrates proof generation (against `localhost:6300` or via client simulation).
- The client submits ONLY the public verification proof envelope to `/api/verifications/prove`:
  ```typescript
  {
    applicationId: string,
    proofHash: string,
    midnightTx: string,
    circuitId: "proveQualification",
    criteriaHash: string,
    tier: number,
    merkleRoot: string,
    blockHeight: number
  }
  ```
- **Zero raw financial numbers or documents are ever transmitted to the application server.**

---

## 6. Lifecycle Management & Identity Reveal Consent

### 6.1 Admin Emergency Pause
- Deployer sets `contractAdmin`.
- `circuit setPaused(paused: Boolean)` can only be invoked by `contractAdmin`.
- All operational circuits assert `!isPaused, "Contract is currently paused"`.

### 6.2 Application Consumption Lifecycle
- `Active`: Proof has been verified and is available for landlord review.
- `Consumed`: When a lease is executed, `circuit consumeQualification(applicationId)` transitions status to `Consumed`. The qualification can never be used to sign a second lease.
- `Revoked`: If the tenant withdraws their application, `circuit revokeQualification(applicationId)` marks it `Revoked`.

### 6.3 Two-Phase Identity Reveal Decision
- **Decision: Cryptographic Off-Chain Consent (Deferred on-chain storage)**.
- *Rationale*: Storing tenant identity (name, email, phone) on-chain—even encrypted—leaves a perpetual cryptographic footprint on the ledger.
- *Implementation*:
  1. Tenant applies under pseudonymous `applicantDisplayId` (e.g. `ZK-TENANT-8F42`).
  2. Landlord reviews qualification criteria, tier, and proof on-chain.
  3. Landlord clicks "Request Identity Reveal".
  4. Tenant signs an EIP-712 / typed consent token authorizing the landlord to decrypt their contact details from secure application storage.
  5. The on-chain ledger remains completely free of identifying personal data.

---

## 7. Contract Test Plan

The contract suite will be validated across 8 test suites:

| Suite # | Target Behavior | Expected Result |
|---|---|---|
| **T1: Standard Qualify** | Income $\ge$ threshold, ratio $\le$ max, clean background | Proof synthesizes, `tier = 0`, status `Active` |
| **T2: Prime Qualify** | Income $\ge 4\times$ rent, credit $\ge 750$ | Proof synthesizes, `tier = 1`, status `Active` |
| **T3: Low Income Rejection** | Income fails ratio or minimum | Constraint assertion failure, zero proof emitted |
| **T4: Bad Credit / Background**| Credit below minimum or criminal background | Constraint assertion failure, zero proof emitted |
| **T5: Replay Prevention** | Resubmit with same `nullifier` | Assert `!nullifierSet.member` fails, rejected |
| **T6: Application Squatting**| Submit proof for `applicationId` without matching commitment | Commitment pre-image check fails, rejected |
| **T7: Expired Attestation** | Block time past `attestation.expiresAt` | Assert `blockTimeLt` fails, rejected |
| **T8: Unauthorized Update** | Non-owner attempts to modify `ListingCriteria` | Authority check fails, rejected |

---

## 8. Profiling & Constraint Budget Plan

- **Constraint Budget**: Target Halo2 $k$-value of $\le 15$ ($2^{15} = 32,768$ rows) to ensure sub-5-second proving times on standard consumer hardware.
- **Profiling Toolchain**:
  - Run `POST /k` on compiled intermediate representation to measure circuit rank.
  - Run `POST /check` to profile constraint usage and branch zero-padding.
  - Measure memory consumption during witness assignment ($\le 512\text{ MB}$).

---

## 9. Staged Implementation Plan (Step B Roadmap)

1. **Step B.1: Contract Implementation**:
   - Write revised [`contracts/qualification.compact`](file:///c:/Users/akram/Desktop/zkren/midnighthack/zkrent/contracts/qualification.compact).
   - Compile via toolchain into `contracts/managed/qualification`.
2. **Step B.2: Contract Test Suite**:
   - Implement Vitest/native contract tests matching T1–T8.
3. **Step B.3: Witness & Prover Service**:
   - Refactor [`src/midnight/witnesses.ts`](file:///c:/Users/akram/Desktop/zkren/midnighthack/zkrent/src/midnight/witnesses.ts) with `Attestation` structure.
   - Refactor [`src/midnight/zk.ts`](file:///c:/Users/akram/Desktop/zkren/midnighthack/zkrent/src/midnight/zk.ts) into client-safe proving module.
4. **Step B.4: API & Database Migration**:
   - Update Prisma schema (`VerificationRecord`, `ListingCriteria` bindings).
   - Execute migration and seeding workflow.
   - Refactor `POST /api/verifications/prove` to receive only proofs.
5. **Step B.5: UI & Simulation Mode**:
   - Update tenant verification form to run prover client-side.
   - Update landlord dashboard to query `applicationRecords`.
   - Add clear visual badge indicators for `[SIMULATED]` vs. `[DEVNET]` proofs.
