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
