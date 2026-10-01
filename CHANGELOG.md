# Changelog

All notable changes to the ZkRent platform are documented in this file.
The project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-10-01

### Added
- **Multi-Criteria Compact Smart Contract (`contracts/qualification.compact`)**:
  - Implemented 5 zero-knowledge circuits: `registerListingCriteria`, `proveQualification`, `consumeQualification`, `revokeQualification`, `setPaused`.
  - Canonical 12-field `criteriaHash` binding verification proofs to landlord-defined criteria versions.
  - Anti-replay nullifiers (`persistentHash(["zkrent:null:", tenantSecret, listingId])`) with chain-time expiry semantics.
  - Anti-squatting tenant commitments (`persistentHash(["zkrent:tenant:", applicationId, tenantSalt])`).
  - Division-free cross-multiplication for rent-to-income checks (`monthlyRent * 120000 <= annualIncome * maxRentToIncomeRatioBps`).
  - Coarse-grained selective disclosure: Standard Tier (0) vs Prime Tier (1).
- **Client-Side ZK Prover & Dual-Mode Engine (`src/midnight/zk.ts`)**:
  - Pure in-browser / on-device witness generation (`src/midnight/witnesses.ts`).
  - Standalone Midnight provider composition (Indexer GraphQL, HTTP proof server, Level private state, Node ZK config).
  - Resilient simulation mode with permanent audit flags (`isSimulation: true`, status `SIMULATED`).
  - Strict fail-loud enforcement: live prover returns HTTP 503 upon infrastructure outage rather than silent simulation fallback.
- **Canonical Application Lifecycle Machine (`src/lib/lifecycle.ts`)**:
  - Enforced transitions: `DRAFT` $\to$ `PENDING_PAYMENT` $\to$ `PAYMENT_CONFIRMED` $\to$ `ZK_VERIFIED` $\to$ `UNDER_REVIEW` $\to$ `ACCEPTED` / `REJECTED` / `WITHDRAWN`.
  - Decoupled reveal consent (`NOT_REQUESTED`, `REQUESTED`, `GRANTED`, `DECLINED`) and qualification states (`ACTIVE`, `CONSUMED`, `REVOKED`, `EXPIRED`).
- **Product & Security Hardening**:
  - Criteria editor divergence banner with on-chain synchronization action.
  - Selective disclosure modal previewing exact tenant fields revealed upon consent.
  - Single-use qualification consumption upon lease finalization.
  - In-app database-backed notification system with interactive navbar bell.
  - Image metadata sanitization using `sharp` across PNG, WebP, and JPEG.
  - Stripe webhook deduplication on `stripeEventId` with automatic qualification revocation upon refund.
  - Sliding-window rate limiting on auth, upload, prove, and payment routes.
- **Deployment & Testnet Harness (`scripts/deploy.ts`)**:
  - Preflight health probes for Midnight Preprod and local devnet.
  - Dedicated throwaway Preprod deployer wallet generator (`scripts/generate-preprod-wallet.ts`).
  - Idempotent address logging to `contracts/deployed.json` and `.env.local`.
- **Quality Assurance & Verification**:
  - 12 automated test suites (144 passing tests, 0 failures).
  - Explicit privacy regression suite (20/20 tests verifying zero raw PII or financial leakage).
  - End-to-end persona journey integration tests.
  - Reproducible fresh database workflow (`prisma migrate deploy` $\to$ `seed.js`).

### Changed
- Replaced snake_case database schema with canonical PascalCase Prisma 7 schema (`prisma/schema.prisma`).
- Removed legacy `src/lib/midnight/proof.ts` and raw-income transmission from `POST /api/verifications/prove`.
- Updated Next.js configuration to exclude nested vendor skill modules from ambient TypeScript compilation.

### Removed
- Removed foreign Latch/MOAT project files (`contract.md`, `deployment.md`, `deploy-undeployed.md`, `docker.md`).
- Removed redundant Docker compose files (`compose.yml`, `proof-server.yml`) in favor of unified `docker-compose.yml`.
- Removed scratch scripts and obsolete temporary files.
