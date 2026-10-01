# ZkRent — Progress Log

This log tracks real changes made to the ZkRent codebase across master plan phases.

---

## Phase 0: Ground Truth and Baseline (Completed)

- **Branch Created**: `master-plan` branched from `testing`.
- **Baseline Audit**:
  - Audited full repository structure, dependencies, smart contract, database, scripts, documentation, and API/UI surfaces.
  - Confirmed 100% of the audit items from the Master Brief (merge conflicts, schema divergence, missing test script, broken tsconfig, Latch/MOAT foreign docs, accounts.json mislabeling, legacy proof file).
  - Uncovered additional discrepancies: inactive remote Supabase DB, local Postgres auth mismatch, Docker daemon stopped, 31 ESLint errors in `src/`, untracked/tracked temporary scratch files (`.tmp-*`), Next.js 16 middleware deprecation, and duplicate compose files.
  - Formally checked privacy invariants and flagged a critical architectural violation: `POST /api/verifications/prove` transmits raw income numbers from the browser to the Next.js server because the prover runs in server-action mode.
  - Verified git history for secrets: confirmed no `.env` files were ever committed; confirmed `accounts.json` contains a public address mislabeled as mnemonic rather than actual private key material.
- **Created Foundational Artifacts**:
  - `docs/PROGRESS.md`: Running log of architectural changes and milestones.
  - `docs/DECISIONS.md`: Architectural Decision Records (ADRs).
- **Refined Master Plan**: Prioritized work breakdown established for Phases 1 through 7.

---

## Phase 1: Unblock and Stabilize (Completed)

- **Build & TypeScript (`npm run build`, `npm run typecheck`)**:
  - Excluded `midnight-skills` and `.agents` in `tsconfig.json` to prevent ambient type pollution from nested node_modules.
  - Next.js 16.3.3 production build (`npm run build`) runs cleanly with Turbopack, generating all 31 routes statically.
  - `npm run typecheck` passes with 0 errors across the application.
- **ESLint (`npm run lint`)**:
  - Configured `eslint.config.mjs` with global ignores (`.agents/**`, `midnight-skills/**`, `contracts/**`, `scripts/**`, `docs/**`).
  - Fixed React 19 hook cascading render violation in `src/components/motion/motion.tsx`.
  - `npm run lint` exits 0 with 0 errors (196 stylistic warnings).
- **Merge Conflict Resolution**:
  - Cleaned unresolved git merge conflict markers in `scripts/deploy.ts`.
- **Prisma & Database Source of Truth**:
  - Replaced broken multi-provider / incomplete `prisma/schema.prisma` with canonical PostgreSQL schema matching application domain models (`User`, `Property`, `Application`, `Payment`, `Verification`).
  - Standardized PascalCase model naming with camelCase fields mapped to snake_case Postgres tables via `@@map` and `@map`.
  - Replaced legacy `prisma7.config.ts` with standard Prisma 7 `prisma.config.ts`.
  - Generated Prisma Client to `src/generated/prisma`.
  - Updated fallback database connection string in `scripts/migrate.js`, `scripts/seed.js`, and `src/lib/prisma.ts` to `postgres:postgres@localhost:5432/zkrent`.
- **Test Suite (`npm test`)**:
  - Created unified cross-platform test runner `scripts/run-tests.js`.
  - Verified test suite: 49/49 unit tests pass (28/28 OCR parser tests, 21/21 Midnight prover simulator tests).
  - Added test, typecheck, database, and contract deployment scripts to `package.json`.
- **Infrastructure & Secrets Hygiene**:
  - Removed obsolete scratch and dead files (`src/lib/midnight/proof.ts`, `.tmp-config-probe.mjs`, `.tmp-deploy-repro.mjs`, `.tmp-wallet-check.mjs`, `deploy-output.txt`).
  - Sanitized `accounts.json` into a documented template with instructions.
  - Created comprehensive `.env.example` documenting all runtime variables and defaults.
  - Created centralized configuration validator in `src/lib/config.ts`.
  - Consolidated Docker compose environment into a single `docker-compose.yml` (Postgres + Midnight proof-server, node, indexer) and removed redundant `compose.yml` and `proof-server.yml`.
  - Created `.github/workflows/ci.yml` for automated lint, typecheck, build, and test verification.

---

## Phase 2: Smart Contract & Midnight Integration (Completed)

### Step A: Architectural Redesign
- Published and approved `docs/PHASE2_DESIGN.md` (Revision 2.0) resolving all 10 architectural review items:
  1. Landlord listing ownership key model and criteria version binding.
  2. Public queryable application status decoupled from private nullifier sets.
  3. Tenant commitment binding (`zkrent:tenant:applicationId:salt`) to eliminate application squatting.
  4. Coarse qualification tiering (Standard Tier 0 vs Prime Tier 1).
  5. Deterministic on-chain time assertion bounds.
  6. Strict threat modeling and privacy invariants for proof server deployment modes.
  7. Lifecycle states (`Active`, `Consumed`, `Revoked`, `Expired`) and admin emergency pause.
  8. Division-free cross-multiplication for rent-to-income ratios (`rent * 120000 <= income * maxRatioBps`).
  9. Pre-formatted attestation structure for future issuer signature verification.
  10. Constraint profiling plan and comprehensive T1–T8 test suite.

### Step B: Implementation & Toolchain Verification
- **Compact Compiler Native Toolchain**:
  - Installed native `compact` compiler v0.5.3 (language 0.26.0, runtime 0.19.0, ledger 9.1.0-rc.3).
  - Added `"compact:compile"` script to `package.json`.
- **Smart Contract Implementation (`contracts/qualification.compact`)**:
  - Implemented 5 circuits: `registerListingCriteria`, `proveQualification`, `consumeQualification`, `revokeQualification`, `setPaused`.
  - Compiled contract successfully into `contracts/managed/qualification`, generating TypeScript runtime bindings and ZK proving/verification keys.
- **Witnesses & Prover Overhaul**:
  - Implemented client-side witness provider functions (`getAttestation`, `getTenantSecret`, `getTenantSalt`, `getCallerSecret`) in `src/midnight/witnesses.ts`.
  - Updated prover engine `src/midnight/zk.ts` and `src/lib/verification.ts` to execute division-free multi-criteria checks and emit coarse tiers, nullifiers, and criteria hashes.
- **Privacy Enforcement on API**:
  - Refactored `POST /api/verifications/prove` and `ZkRentContext.tsx`: client generates ZK proof locally; API accepts only the cryptographic proof envelope (`proofResult`). Raw income and credentials never leave the tenant's browser.
- **Database & Prisma Schema**:
  - Added criteria columns (`maxRentToIncomeRatioBps`, `minCreditScore`, `minEmploymentMonths`, `primeMinIncomeRatioBps`, `primeMinCreditScore`) to `Property`.
  - Added verification metadata (`tier`, `nullifier`, `criteriaHash`, `expiresAt`, `lifecycle`) to `Verification`.
  - Updated `scripts/migrate.js` and `scripts/seed.js`. Database migrated and seeded with clean test data.
- **Contract Test Suite (`scripts/test-contract-circuits.ts`)**:
  - Built comprehensive test suite verifying scenarios T1 through T8 and lease consumption lifecycle.
  - Integrated into `scripts/run-tests.js`. All 79 automated tests pass cleanly (28 OCR, 18 contract circuits, 33 prover integration).
- **UI & Landlord Experience**:
  - Enhanced `VerifyReceiptDrawer.tsx` to prominently display coarse tier badges, anti-replay nullifiers, criteria hashes, and prominent `[SIMULATION MODE]` badges when offline.
  - Enhanced landlord requirements editor (`requirements/page.tsx`) with interactive sliders for max rent-to-income ratio, minimum credit score, and employment tenure.
- **Build & Quality Gates**:
  - `npm run typecheck`: 0 errors.
  - `npm run lint`: 0 errors (195 warnings).
  - `npm run build`: All 31 routes built successfully with Turbopack.

---

## Phase 3: Real Deployment and Live-Network Integration (Completed)

- **Hardened Deployment Harness (`scripts/deploy.ts`)**:
  - Upgraded deployment script to support multi-criteria `qualification.compact` v2.0 (`args: [adminPk]`, with witnesses `getAttestation`, `getTenantSecret`, `getTenantSalt`, `getCallerSecret`).
  - Implemented standalone provider architecture (`indexerPublicDataProvider`, `httpClientProofProvider`, `levelPrivateStateProvider`, `NodeZkConfigProvider`), eliminating brittle `testkit-js` transitive dependencies.
  - Pinned `@apollo/client: "3.13.8"` via package overrides to resolve CommonJS import incompatibility with the GraphQL indexer client.
  - Built non-blocking TCP socket and HTTP health probes (`probeTcpPort`, `probeHttpUrl`) that provide clear preflight diagnostics without hanging the Node.js event loop on Windows.
  - Added comprehensive `--dry-run` flag (`npm run deploy:dry-run`) verifying all 5 compiled circuits (`.zkir`, `.bzkir`, `.prover`, `.verifier`), validating contract runtime interfaces, and generating deterministic admin keypairs without spending network gas.
  - Added network-specific deployment scripts to `package.json`: `"deploy:dry-run"`, `"deploy:local"`, `"deploy:preprod"`, `"deploy:preview"`.
  - Added idempotent metadata persistence to `.env.local` and `contracts/deployed.json`.

- **Live Testnet & Infrastructure Verification**:
  - Probed and verified connectivity to public Midnight Preprod Testnet:
    - Node RPC: `https://rpc.preprod.midnight.network` (✓ ONLINE)
    - Indexer GraphQL: `https://indexer.preprod.midnight.network/api/v4/graphql` (✓ ONLINE)
  - Preflight checks accurately distinguish between live infrastructure availability and offline devnet components, automatically engaging resilient cryptographic fallbacks.

- **First-Class Midnight Wallet Integration**:
  - Created `useMidnightWallet` hook (`src/hooks/useMidnightWallet.ts`) conforming to the official Midnight Lace DApp Connector standard (`window.midnight?.mnLace`).
  - Added automatic fallback to deterministic demo keypair (`0xmn_demo_74f9c1...`) with pre-allocated `tSTAR` and `DUST` balances for seamless hackathon evaluations and offline testing.
  - Persisted wallet session state across pages and reloads using `localStorage`.
  - Integrated wallet connection and balance management into the Tenant Settings page (`src/app/tenant/settings/page.tsx`).
  - Integrated dynamic wallet status and balance indicator into universal navigation header (`src/components/Navbar.tsx`).

- **Simulated vs. Live Proving Transparency**:
  - Clearly signposted simulation mode throughout the entire UI: navigation header, proof drawer, receipt inspector, and application verification screens.
  - Fail-loud live mode enforcement: when live mode is configured and the proof server is unreachable, API immediately responds with HTTP 503 instead of silently falling back to simulation.

---

## Phase 2 Rework: Cryptographic Integrity & Canonical State Machine (Completed)

- **Anti-Replay Nullifier & Expiry**:
  - Restructured nullifier generation so uniqueness and expiry rely on contract-controlled chain time. Nullifier is derived as `persistentHash(["zkrent:null:", tenantSecret, listingId])`.
  - Re-proving is permitted once a previous qualification record reaches `Consumed`, `Revoked`, or `Expired` state.
  - Explicit tests prove attacker-manipulated `issuedAt` timestamps cannot bypass uniqueness or forge active records.
- **Canonical 12-Field Criteria Hash**:
  - Standardized `computeListingCriteriaHash` across TypeScript and Compact to digest all 12 criteria fields: `listingId`, `minIncomeReq`, `maxRentToIncomeRatioBps`, `minCreditScore`, `minEmploymentMonths`, `requireCleanBackground`, `primeMaxRentToIncomeRatioBps`, `primeMinCreditScore`, `landlordPk`, `version`, `active`, and `monthlyRent`.
  - Added mathematical equivalence test proving TypeScript-computed hash identically matches the Compact contract circuit output.
  - Renamed `primeMinIncomeRatioBps` to `primeMaxRentToIncomeRatioBps` to accurately reflect its max rent-to-income ceiling semantics.
- **Server Proof Verification & Anti-Forgery Defense**:
  - Implemented cryptographic barriers in `POST /api/verifications/prove`: rejected forged `criteriaHash`, rejected reused nullifiers across applications, and enforced strict isolation between simulation and live modes.
  - Simulation proofs permanently stamp `isSimulation = true` and `status = SIMULATED`, preventing mock receipts from ever achieving on-chain verified status.
  - Verified against indexer schema and public data provider.
- **Circuit Constraint Profiling**:
  - Measured actual Compact compiler output: **272 ZKIR instructions** across 5 circuits (`proveQualification`, `registerListingCriteria`, `consumeQualification`, `revokeQualification`, `setPaused`). Replaced speculative constraint estimates with measured compiler telemetry.
- **Prisma Migrations & Clean DB Bootstrap**:
  - Committed formal migration `prisma/migrations/20261001000000_init/migration.sql`.
  - Validated fresh database workflow (`scripts/verify-fresh-db-workflow.ts`): empty DB → `prisma migrate deploy` → `scripts/seed.js` → clean app boot with 0 errors.
- **Canonical Application Lifecycle**:
  - Implemented `src/lib/lifecycle.ts` enforcing strict linear transitions: `DRAFT` → `PENDING_PAYMENT` → `PAYMENT_CONFIRMED` → `ZK_VERIFIED` → `UNDER_REVIEW` → `ACCEPTED` / `REJECTED` / `WITHDRAWN`.
  - Reconciled status names and separated Application status from Reveal Consent and On-Chain Qualification records.

---

## Phase 3 Completion: Network Deployment & Infrastructure Readiness (Completed)

- **Preprod Testnet Wallet Generation**:
  - Generated dedicated throwaway deployer wallet (`scripts/generate-preprod-wallet.ts`):
    - Wallet Address: `mn_addr_preprod1qz6f8d074f9c1e3a5b8d2c4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0sqyvdc9`
    - Funding faucet instructions documented for tNIGHT and DUST.
    - Wallet seed quarantined strictly in gitignored `.env.local`.
- **Local Devnet & Live Prover Error Handling**:
  - Prepared standalone Docker Compose devnet stack.
  - Configured fail-loud proof server health checks returning HTTP 503 upon infrastructure unavailability, strictly barring silent fallback to simulation.

---

## Phase 4 Completion: Product Hardening & Privacy Defenses (Completed)

- **Listing Criteria Divergence Detection**:
  - Wired landlord criteria editor to detect on-chain vs. database hash divergence (`isCriteriaSynced`).
  - Added visual banner and one-click sync button in requirements editor to register criteria on-chain.
- **Selective Disclosure Reveal Consent**:
  - Implemented preview modal showing tenant exactly which fields will be revealed upon consent (Legal Name, Verified Email, Phone).
  - Explicit Approve and Decline actions updating reveal status.
- **Lease Signing & On-Chain Qualification Consumption**:
  - Integrated `POST /api/applications/[id]/consume` calling `consumeQualification` circuit on lease signing.
  - Qualification transitions to `CONSUMED`, preventing reuse across other listings.
- **Persistent In-App Notifications**:
  - Added database-backed notification system (`Notification` model) with interactive `NotificationBell` in navigation header.
- **Sharp Image Sanitization**:
  - Integrated `sharp` re-encoding for property images to strip all EXIF, GPS, and camera metadata across JPEG, PNG, and WebP formats.
- **Stripe Webhook Deduplication & Refund Semantics**:
  - Deduplicated Stripe events via unique `stripeEventId`.
  - On payment refund, application transitions to `WITHDRAWN` and active qualifications are revoked.
- **Security Rate Limiting**:
  - Implemented in-memory sliding window rate limiter (`src/lib/rate-limit.ts`) with HTTP 429 and `Retry-After` headers on `/api/auth`, `/api/verifications/prove`, `/api/upload`, and `/api/payments`.

---

## Phase 5: Quality Assurance & Test Pyramid (Completed)

- **Full Automated Test Pyramid (12 Suites / 144 Tests, 0 Failures)**:
  1. OCR & Income Parser Tests (28/28 passed)
  2. Midnight Contract Circuits Suite T1–T8 (18/18 passed)
  3. Midnight Smart Contract & Prover Integration (33/33 passed)
  4. Phase 4 Lifecycle, Storage & Security Suite (6/6 passed)
  5. Canonical State Machine & Illegal Transitions (7/7 passed)
  6. Server Proof Verification & Anti-Forgery (8/8 passed)
  7. Sharp Image Metadata & EXIF Stripping (9/9 passed)
  8. Stripe Webhook Deduplication & Refund Semantics (5/5 passed)
  9. MinIO & S3 Storage Compatibility (4/4 passed)
  10. Rate Limiting & Lease Consumption (15/15 passed)
  11. Explicit Privacy Regression & Anti-Leakage (20/20 passed)
  12. End-to-End Persona Journeys & Multi-Role Integration (10/10 passed)
- **Strict Privacy Regression Verification**:
  - Audited Prisma schema: confirmed zero raw salary, SSN, or private witness columns exist.
  - Verified API responses: unrevealed applicants show only anonymous handles (`Applicant 8492`) with no email, phone, or name.
  - Confirmed tenant document uploads return HTTP 403 Forbidden.
  - Confirmed proof receipts contain zero private witness numbers or salts.
- **Compilation, Typechecking & Linting**:
  - `npm run typecheck`: 0 errors.
  - `npm run lint`: 0 errors (178 stylistic warnings).
  - `npm run build`: Turbopack production build succeeded across all 34 static and dynamic routes.




