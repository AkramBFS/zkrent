# Architectural Decision Records (ADRs)

This document records architectural decisions made during the evolution of ZkRent, documenting the context, options considered, decisions made, and consequences.

---

## ADR 001: Working Branch Strategy for Master Plan Execution

- **Status**: Accepted
- **Date**: 2026-10-01
- **Context**: The repository has multiple diverging branches (`main`, `testing`, `deploy`, `ui`) with unresolved merge conflicts and broken baseline commands. A stable staging branch is required to execute Phases 1 through 7 without disrupting existing branches.
- **Decision**: Create and standardize on `master-plan` branched from `testing` (the latest integration branch). All atomic commits for each phase will land on `master-plan`.
- **Consequences**: Provides clean isolation while preserving history. When all phases are satisfied and verified, `master-plan` can be reviewed and merged back cleanly.

---

## ADR 002: Database Source of Truth Strategy

- **Status**: Proposed (to be executed in Phase 1)
- **Context**: `prisma/schema.prisma` was overwritten with snake_case plural models (`applications`, `payments`, etc.) that do not match the generated Prisma client, database queries (`prisma.application`, `prisma.property`), or migration scripts (`scripts/migrate.js`, `scripts/seed.js`). Running `prisma generate` currently breaks the build.
- **Decision**: Elevate the schema definition in `prisma/schema.prisma` to match the canonical application types (singular PascalCase models `User`, `Property`, `Application`, `Payment`, `Verification` with camelCase fields). Re-generate the client with Prisma 7, replace ad-hoc `scripts/migrate.js` with declarative Prisma migrations (`prisma migrate dev` / `prisma db push`), and adapt `scripts/seed.js` to use the typed Prisma client.
- **Alternatives Considered**:
  - *Keep ad-hoc pg client scripts and abandon Prisma*: Rejected because typed Prisma client is heavily embedded across API routes and server actions.
  - *Keep snake_case schema and refactor the entire codebase*: Rejected because it introduces massive unnecessary churn and regression risk across 31 pages and 11 API endpoints.
- **Consequences**: `prisma generate` will become safe, repeatable, and aligned with the TypeScript codebase.

---

## ADR 003: Privacy Invariant Enforcement for ZK Proving

- **Status**: Proposed (to be executed in Phase 2)
- **Context**: The audit revealed that `POST /api/verifications/prove` accepts raw income and background status in the JSON request body. Because `executeMidnightQualificationProof` runs on the server (`'use server'`), tenant credentials leave the browser over HTTP, violating the core privacy invariant: *"raw income and documents never leave the tenant's device"*.
- **Decision**: Refactor the proving architecture to ensure private witness construction and execution occur strictly on-device (client-side in WebAssembly/browser or via a local tenant wallet/proof provider). The backend server will only receive the resulting zero-knowledge proof, public inputs, and transaction commitment/hash.
- **Consequences**: Restores cryptographic privacy integrity. Server never touches or logs raw credentials.

---

## ADR 004: Dual-Mode Architecture & Proof Transparency

- **Status**: Accepted
- **Context**: Real Midnight testnet/devnet proving requires active infrastructure (node, proof server, indexer) and funded wallet keys. In offline, CI, or local demo scenarios without active infrastructure, a deterministic simulated proof engine is essential.
- **Decision**: Maintain dual-mode capability:
  1. *Live Mode*: Connects to Midnight node, indexer, and proof-server using official `@midnight-ntwrk/*` libraries.
  2. *Sandbox / Simulation Mode*: Deterministic, offline mathematical simulation with verifiable mock hashes and timing.
  All UI elements, receipts, badges, and API responses must explicitly and unambiguously display whether a proof was generated via Live Network or Simulation Mode.
- **Consequences**: Demos will never fail due to transient infrastructure outages, while preserving complete honesty about what is real vs. simulated.
