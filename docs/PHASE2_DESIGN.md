# Phase 2 Step A: Smart Contract & ZK Architecture Design Document

**Date**: October 2026  
**Status**: Pending Review & User Approval  
**Context**: ZkRent Decentralized Privacy-Preserving Tenant Qualification Engine  

---

## 1. Executive Summary & Purpose

The existing Midnight Compact contract ([`contracts/qualification.compact`](file:///c:/Users/akram/Desktop/zkren/midnighthack/zkrent/contracts/qualification.compact)) operates as a simplistic prototype: it only evaluates whether an annual income meets a single global threshold and a boolean background check is clean. Furthermore, its current application runtime exposes raw private tenant income over HTTP to a Next.js server route (`/api/verifications/prove`), violating the fundamental privacy promise of zero-knowledge proofs.

Phase 2 transforms the contract into an **institutional-grade, privacy-first qualification primitive**. The redesigned system will:
1. Enable **listing-specific, composable qualification criteria** (rent-to-income, credit tier, background, employment) without requiring a new contract deployment per property.
2. Bind proofs cryptographically to specific applications and listings via **deterministic nullifiers and commitment hashes**, preventing proof reuse, replay attacks, or front-running by third parties.
3. Enforce **freshness and lifecycle bounds** (validity windows / block-time expiration).
4. Guarantee **client-side proving** so private financial and credential data never leave the tenant's browser/device.
5. Provide **selective, minimal disclosure** where landlords receive only an attestation of qualification (and optional coarse qualification tier) while raw financial values remain zero-knowledge.

---

## 2. Public Ledger State vs. Private Witness State

To balance privacy, verifiability, and on-chain storage efficiency, the state is partitioned cleanly:

### 2.1 Public Ledger State (On-Chain)
All public state is verifiable by any participant or indexer without revealing tenant identities or private balances:
- **`export ledger listings: Map<Bytes<32>, ListingCriteria>`**:
  - Key: `listingId` (32-byte domain-separated hash of property UUID + landlord public key).
  - Value: Struct defining requirements chosen by the landlord:
    - `minMonthlyIncome`: `Uint<64>` (in smallest currency units / cents).
    - `maxRentToIncomeRatioBps`: `Uint<16>` (e.g. 3300 = 33.00% max rent-to-income).
    - `monthlyRent`: `Uint<64>`.
    - `minCreditScore`: `Uint<16>` (e.g. 680).
    - `requireCleanBackground`: `Boolean`.
    - `minEmploymentMonths`: `Uint<16>` (e.g. 12 months).
    - `active`: `Boolean`.
- **`export ledger verifiedApplications: Map<Bytes<32>, VerificationRecord>`**:
  - Key: `applicationNullifier: Bytes<32>` = `persistentHash([pad(32, "zkrent:nullifier:"), tenantSalt, applicationId, listingId])`.
  - Value: `VerificationRecord` struct:
    - `listingId: Bytes<32>`.
    - `qualified: Boolean`.
    - `tier: Uint<8>` (0 = Standard Qualify, 1 = Prime Qualify [4x income, 750+ credit], 2 = Conditional).
    - `timestamp: Uint<64>` (block timestamp when proof was verified).
    - `expiresAt: Uint<64>` (block timestamp after which proof is invalid).
- **`export sealed ledger contractAdmin: Bytes<32>`**: Contract owner/deployer public key hash for administrative control (e.g. emergency pause).

### 2.2 Private Witness State (Client-Side Only)
Private witness data is supplied locally inside the prover (tenant's device) and is **never** broadcast to the network or sent to the server:
- `annualIncome`: `Uint<64>` (actual annual income extracted from paystubs/tax docs).
- `creditScore`: `Uint<16>` (actual credit score, e.g. 720).
- `employmentMonths`: `Uint<16>` (actual continuous employment history).
- `backgroundClean`: `Boolean` (clean background check signal).
- `tenantSecret`: `Bytes<32>` (tenant's private entropy key generating their nullifier).
- `applicationContext`: `Bytes<32>` (unique application identifier).

---

## 3. Circuit Architecture & Function Signatures

### 3.1 Landlord Circuit: `registerListingCriteria`
Allows a landlord to register or update criteria for a property listing on-chain:
```compact
export circuit registerListingCriteria(
  listingId: Bytes<32>,
  criteria: ListingCriteria
): [] {
  // Verifies listing belongs to landlord or sender
  listings.insert(listingId, criteria);
}
```

### 3.2 Tenant Circuit: `proveQualification`
The central zero-knowledge circuit executed on the tenant's machine:
```compact
export circuit proveQualification(
  listingId: Bytes<32>,
  applicationId: Bytes<32>,
  currentBlockTime: Uint<64>
): VerificationOutcome {
  // 1. Fetch on-chain listing requirements
  assert(listings.member(listingId), "Listing does not exist");
  const listing = listings.lookup(listingId);
  assert(listing.active, "Listing is inactive");

  // 2. Obtain private witnesses (client-side)
  const income = witnessAnnualIncome();
  const credit = witnessCreditScore();
  const empMonths = witnessEmploymentMonths();
  const bgClean = witnessBackgroundClean();
  const tenantSecret = witnessTenantSecret();

  // 3. Evaluate criteria composably
  const monthlyIncome = income / 12;
  const incomeOk = monthlyIncome >= listing.minMonthlyIncome;

  // Rent-to-income check (integer math in basis points)
  // (monthlyRent * 10000) / monthlyIncome <= maxRentToIncomeRatioBps
  const rentRatioBps = (listing.monthlyRent * 10000) / monthlyIncome;
  const ratioOk = rentRatioBps <= (listing.maxRentToIncomeRatioBps as Uint<64>);

  const creditOk = credit >= listing.minCreditScore;
  const empOk = empMonths >= listing.minEmploymentMonths;
  const bgOk = !listing.requireCleanBackground || bgClean;

  const isQualified = incomeOk && ratioOk && creditOk && empOk && bgOk;
  assert(isQualified, "Applicant does not satisfy qualification criteria");

  // 4. Derive Coarse Tier (Selective Minimal Disclosure)
  // Tier 1: Prime (Income >= 4x rent and credit >= 750)
  // Tier 0: Standard (Satisfies all listed baseline criteria)
  const isPrime = (monthlyIncome >= listing.monthlyRent * 4) && (credit >= 750);
  const tier: Uint<8> = isPrime ? 1 : 0;

  // 5. Compute Application-Bound Nullifier
  const nullifier = persistentHash<Vector<4, Bytes<32>>>([
    pad(32, "zkrent:nullifier:"),
    tenantSecret,
    applicationId,
    listingId
  ]);

  // Enforce Replay Protection: Ensure nullifier has not been recorded previously
  assert(!verifiedApplications.member(nullifier), "Proof already consumed for this application");

  // 6. Record On-Chain Verification with Expiration
  const validityPeriod: Uint<64> = 30 * 24 * 3600; // 30 days validity
  const expiresAt = currentBlockTime + validityPeriod;

  const record = VerificationRecord {
    listingId: listingId,
    qualified: true,
    tier: tier,
    timestamp: currentBlockTime,
    expiresAt: expiresAt
  };

  verifiedApplications.insert(nullifier, record);

  return VerificationOutcome {
    nullifier: disclose(nullifier),
    qualified: disclose(true),
    tier: disclose(tier),
    expiresAt: disclose(expiresAt)
  };
}
```

---

## 4. Threat Model & Security Invariants

| Threat | Attack Vector | Mitigation in Architecture |
|---|---|---|
| **Proof Theft / Front-Running** | Attacker intercepts proof on-chain or network and attaches it to their own rental application. | **Cryptographic Context Binding**: The nullifier explicitly hashes `applicationId` and `listingId` alongside `tenantSecret`. A proof cannot validate any other application or listing. |
| **Proof Replay across Properties** | Tenant qualifies once for cheap property A, reuses same proof to apply for luxury property B. | Nullifier depends on `listingId`; contract checks criteria from `listings.lookup(listingId)`. Cross-property replay fails constraint check. |
| **Double Application / Spam** | Tenant re-submits identical proof repeatedly. | Contract enforces `assert(!verifiedApplications.member(nullifier))`; on-chain set insertion prevents duplicate processing. |
| **Stale Qualifications** | Tenant qualifies when employed, suffers income loss 6 months later, reuses old verification. | On-chain `expiresAt` timestamp constraint; verification expires after 30 days. Landlord and UI reject expired proofs. |
| **Financial Data Exfiltration** | Server or landlord attempts to deduce tenant's exact salary from proof payload. | **Zero-Knowledge Property**: Proof only outputs a binary `qualified = true` and coarse `tier = 0 or 1`. Mathematical Zero-Knowledge ensures no salary bits leak. |
| **Server-Side Eavesdropping** | Server action captures income from HTTP request before proving. | **Client-Side Proving**: Raw OCR data and witness secrets stay in local browser indexedDB/Wasm. Server API receives only the finished proof object and public nullifier. |

---

## 5. Input Trust Model & Honest Assumptions

A critical tenet of real-world ZK design is transparency about witness input credibility:
1. **Current Demo / Prototype Mode**:
   - Tenant uploads a PDF/image paystub.
   - Client-side OCR (`tesseract.js`) extracts numbers directly on the tenant's browser.
   - The user can inspect/edit the extracted values before client-side proving.
   - *Honest Trust Assumption*: In this mode, the client is self-reporting witness values. The ZK proof proves *that the supplied values satisfy the property rules*, but does not prove *the authenticity of the underlying paystub*.
2. **Path to Issuer / Attestation Credibility (Production Target)**:
   - For an untamperable production workflow, an authorized third party (e.g. Plaid, Experian, or landlord-trusted KYC oracle) issues a signed cryptographic attestation:
     `Attestation = Sign_Issuer(tenantPubKey, income, credit, expiry, nonce)`.
   - The Compact circuit receives the signature as a witness and verifies:
     `verifySignature(issuerPubKey, attestationHash, signature) == true`.
   - *Phase 2 Decision*: For our hackathon deliverable, we build the full client-side proving pipeline with OCR extraction and local witness injection, and document this attestation model clearly in the UI and documentation as an acknowledged trust assumption.

---

## 6. Two-Phase Identity Reveal Model

1. **Phase 1 (Anonymous Pre-Qualification)**:
   - Landlord receives application with `nullifier`, `tier`, ZK proof hash, and Midnight transaction ID.
   - Landlord cannot see tenant's legal name, email, phone, or raw financial documents.
   - Landlord reviews qualification criteria and marks application as "Shortlisted / Pre-Approved".
2. **Phase 2 (Consent-Gated Reveal)**:
   - Landlord clicks "Request Identity Reveal".
   - Tenant receives an in-app prompt to consent to sharing contact details.
   - Tenant authorizes the reveal: contact details are unlocked for the landlord via signed authorization token.

---

## 7. Recommended Scope vs. Deliberately Deferred

### Included in Phase 2 Scope:
- [x] Multi-criteria Compact contract supporting income, rent-to-income, credit score, background, and employment.
- [x] On-chain `ListingCriteria` registry mapping `listingId` to landlord requirements.
- [x] Application-bound `nullifier` preventing replay attacks and proof theft.
- [x] Time-bounded validity window (`expiresAt`).
- [x] Selective disclosure producing binary qualification and coarse tiering (Prime vs. Standard).
- [x] Full stack client-side proving migration: browser-based witness injection and proof submission, eliminating raw financial values from HTTP payloads.
- [x] Comprehensive test suite covering valid qualification, low income failure, bad credit failure, background failure, replay prevention, and expired proofs.
- [x] Mirroring in simulation mode with visual badges distinguishing live vs. simulated proofs.

### Deliberately Deferred (to Phase 3 / 4):
- [ ] Direct on-chain multi-party ECDSA issuer signature verification (deferred to avoid bloating Halo2 circuit constraint budget before live testnet profiling).
- [ ] Escrowed cryptocurrency rental deposits (scoped for Phase 4 payments integration).

---

## 8. Approval Gate

Per `phasedplan.md` guidelines:
> "Then stop and give me the design for approval, including your recommended scope and what you'd deliberately defer. Implement after approval."
