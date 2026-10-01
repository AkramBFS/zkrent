# ZkRent — Privacy Model, Threat Analysis & Honest Limits

Privacy is the primary product invariant of ZkRent. This document outlines what is hidden, from whom, what is guaranteed cryptographically, what is protected through application-layer architecture, and the honest limits of the system.

---

## 1. Core Privacy Invariants

The ZkRent platform enforces three non-negotiable invariants across all code paths, API boundaries, database schemas, and client user interfaces:

1. **Raw Financial Data Never Leaves the Tenant's Device**:
   - Pay stubs, bank statements, tax returns, W-2s, and precise salary amounts are strictly parsed and evaluated on the client machine.
   - The Next.js backend server, database, and logs never receive, store, or transmit raw financial records or unredacted documents.
2. **Landlords Learn Zero Unnecessary Telemetry**:
   - Before tenant consent, landlords see only coarse eligibility: a boolean qualification pass/fail and a coarse tier (Standard Tier vs Prime Tier).
   - Landlords never see exact income, employer names, debt-to-income figures, or specific credit scores.
3. **Applicants Remain Anonymous Until Consent**:
   - Landlords review incoming applications identified only by an anonymized pseudonym (e.g., `Applicant 8492` or `App #A81F`).
   - Personal contact details (Legal Name, Email, Phone Number) are protected behind an explicit, tenant-authorized selective disclosure consent gate.

---

## 2. Information Disclosure Matrix

| Entity | Sees Exact Income? | Sees Credit Score? | Sees Raw Documents? | Sees Legal Identity? | Sees Verified Verdict? |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Tenant** | YES | YES | YES | YES | YES |
| **Next.js Backend Server** | **NEVER** | **NEVER** | **NEVER (403)** | YES (User Auth) | YES (Receipt Hash) |
| **Landlord (Pre-Consent)** | **NEVER** | **NEVER** | **NEVER** | **NEVER (Pseudonym)** | YES (Coarse Tier) |
| **Landlord (Post-Consent)**| **NEVER** | **NEVER** | **NEVER** | **YES (Contact Only)**| YES (Coarse Tier) |
| **Midnight Public Ledger** | **NEVER** | **NEVER** | **NEVER** | **NEVER (Commitment)**| YES (ZK Proof) |

---

## 3. Selective Disclosure & Coarse Tiering

Instead of forcing a binary (Yes/No) that gives property managers zero nuance, or revealing exact income which destroys privacy, ZkRent implements **Coarse Tiering**:

- **Standard Tier (Tier 0)**:
  - Meets all baseline criteria: $\text{monthlyRent} \times 120000 \le \text{annualIncome} \times \text{maxRentToIncomeRatioBps}$ and minimum credit score.
- **Prime Tier (Tier 1)**:
  - Exceeds premium thresholds: satisfies tighter rent-to-income ratio (e.g. $\le 25\%$) and credit score $\ge 750$.

The ZK proof outputs only the discrete integer `0` or `1`. A landlord cannot reverse-engineer whether an applicant makes \$120,000 or \$450,000.

---

## 4. Architectural Defense Mechanisms

### 4.1 On-Device OCR Processing
Document OCR is executed entirely inside the browser using `tesseract.js` compiled to WebAssembly. The uploaded document buffer is processed in a browser Web Worker and discarded from memory immediately after regex parsing.

### 4.2 Endpoint Upload Discrimination
The file upload route (`POST /api/upload`) enforces strict role gates:
- **Landlords**: Permitted to upload property listing photographs.
- **Tenants**: Explicitly rejected with **HTTP 403 Forbidden** if attempting to upload documents to server storage.

### 4.3 Sharp EXIF Metadata Sanitization
All uploaded listing photographs are re-encoded through `sharp` to strip:
- GPS latitude and longitude coordinates.
- Camera make, model, and serial numbers.
- Timestamps and device identification metadata.

### 4.4 Database Schema Cleanliness
Automated regression tests ([`scripts/test-privacy-regression.ts`](file:///c:/Users/akram/Desktop/zkren/midnighthack/zkrent/scripts/test-privacy-regression.ts)) continuously audit the PostgreSQL Prisma schema to assert that no `salary`, `income`, `ssn`, or `tax_id` columns exist anywhere in the database tables.

---

## 5. Honest Limits & Trust Assumptions

A credible zero-knowledge system must state plainly where cryptography stops and trust assumptions begin:

1. **Attestation Trust Model (Input Provenance)**:
   - In the hackathon prototype, client-side OCR extracts income from tenant-provided pay stubs. Because client-side OCR runs on user-controlled hardware, a sophisticated adversary could edit PDF text before OCR.
   - **Production Roadmap**: The contract witness interface is already pre-structured as an attestation (`AttestationPayload`). In production, this witness will be signed by an authorized verifier (e.g., Plaid, Argyle, or a certified banking oracle) via an in-circuit Ed25519/Schnorr signature check.
2. **Identity Correlation**:
   - If an applicant reveals their identity to a landlord upon consent, the landlord can correlate the applicant's name with that specific application and coarse tier. However, the landlord still cannot discover the applicant's exact salary or private documents.
3. **Serverless Rate Limiting**:
   - The in-memory sliding window rate limiter protects long-lived container instances (standalone Node.js / Docker). In multi-region ephemeral serverless environments (AWS Lambda), state is isolated per container; production serverless deployments should swap this memory store for an external distributed Redis cache (e.g., Upstash).
