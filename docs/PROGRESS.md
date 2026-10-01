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

