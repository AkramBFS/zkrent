# ZkRent: Agent Master Plan

How to use this file: paste **Part 1 (Master Brief)** into the agent once at the start of the session. Then feed it **one phase prompt at a time** (Part 2). Don't move to the next phase until the agent's end-of-phase report satisfies that phase's "Done when" list. Each phase prompt assumes the Master Brief is already in context.

---

## Part 1: Master Brief (paste once)

### Mission

ZkRent is currently a hackathon-grade repo: a privacy-preserving rental qualification platform on the Midnight Network (Next.js, React, Prisma/PostgreSQL, Compact smart contract, on-device OCR, Stripe payments). It works in simulation, but it is messy, partially broken, and has unfinished and missing pieces.

Your mission is to turn it into a **complete, credible, well-documented demo of a real product idea**: a rental platform where tenants prove they qualify (income, background, and more) without ever revealing the underlying data, and landlords get a cryptographically verifiable yes/no without seeing documents or identity until the tenant consents.

"Done" means a stranger can clone the repo, read the docs, run it in minutes, walk through the whole flow, understand the privacy model, and believe the engineering.

### Four goals, in priority order

1. **Level up the Compact contract.** The current contract is a single threshold check on two private witnesses. It should become a meaningful, well-reasoned privacy primitive that justifies using a ZK chain at all (see Phase 2 for direction).
2. **Finish everything unfinished or missing.** Anything the audit marks as half-done, unfinished, or missing, plus anything you find that's needed for the app to feel complete end to end.
3. **Clean the repo.** Remove legacy, foreign, redundant, and misleading material. One source of truth for everything.
4. **Document it properly.** Documentation should be accurate, minimal-but-complete, and match the code.

### Current state (audit summary, to be verified, not trusted)

- Compact contract at `contracts/qualification.compact`: public `minIncomeReq`, private witnesses `annualIncome` and `backgroundClean`, circuit `verifyQualification`. Compiled artifacts exist (managed output, keys, zkir).
- Dual-mode prover in `src/midnight/zk.ts`: live devnet mode, or deterministic simulated proofs when services are offline. Witnesses in `src/midnight/witnesses.ts`.
- `scripts/deploy.ts` has unresolved merge-conflict markers; contract is **not deployed**; `.env.local` holds a placeholder address; `accounts.json` has a wallet address labeled as a mnemonic.
- `prisma/schema.prisma` was overwritten with snake_case fields that no longer match the generated client, `scripts/migrate.js`, `scripts/seed.js`, or the app's queries. Running `prisma generate` would break the build.
- `next build` fails type-checking because of a missing `tsconfig.json` exclude (`midnight-skills`).
- Stripe routes exist with a simulation fallback; live keys not configured.
- On-device OCR (Tesseract.js) works with unit tests; ZK prover has tests; **no `test` script in `package.json`**.
- Docs `contract.md`, `deployment.md`, `deploy-undeployed.md`, `docker.md` were copied from an unrelated project ("Latch / MOAT") and are wrong for this repo.
- `src/lib/midnight/proof.ts` is a legacy implementation; property images are external Unsplash URLs.
- The app has ~31 pages and API routes across public, auth, tenant, landlord, payment, and API areas (see the repo itself for the real list).

**The audit may be wrong or stale.** Verify every claim against the code before acting on it, and record discrepancies.

### Operating principles

- **You own the implementation details.** Explore the codebase, read current Midnight/Compact docs and SDK versions, and decide the how yourself. Don't ask me for permission on technical choices. Do ask me when a decision needs credentials, money, accounts, external funding, or is a genuine product-direction fork. Batch those questions rather than drip-feeding them.
- **Research before assuming.** Midnight tooling (Compact language, compiler, SDKs, proof server, indexer, networks) changes quickly. Check current documentation and the versions pinned in this repo. Don't rely on memory.
- **Honesty about what's real.** Simulated proofs, fake payments, and mocked services must be explicit and distinguishable from real ones in code, UI, and docs. Never let a simulated proof be presented as an on-chain verification. Likewise, state plainly what the system does and does not guarantee (for example, where input data comes from and who vouches for it).
- **Privacy is the product.** Every change must preserve the invariants: raw income and documents never leave the tenant's device; landlords never see raw credentials; applicants stay anonymous until the tenant consents to a reveal. Treat any violation as a bug of the highest severity. Consider logs, analytics, DB columns, API responses, and error messages, not just the UI.
- **Small, reviewable, reversible steps.** Work on a branch. Make atomic commits with clear messages. Keep the app buildable at each phase boundary.
- **Leave a trail.** Maintain `docs/PROGRESS.md` (running log: what changed, why, what's next) and `docs/DECISIONS.md` (short ADR-style entries for non-obvious choices, with alternatives rejected). These are working documents; fold the valuable parts into final docs in Phase 6.
- **Don't gold-plate and don't stub.** Prefer a complete, narrower feature over a broad, half-working one. No TODO-ridden placeholders in shipped paths. If something is deliberately out of scope, say so in the docs.
- **Verify, don't claim.** A thing is done when you've run it: build, type-check, lint, tests, and a real walkthrough of the affected flow. Report what you actually ran and the actual result.

### End-of-phase report format

At the end of every phase, reply with:

1. What was done (concise, grouped by theme)
2. What was verified, with the commands/flows you ran and their results
3. Discrepancies, surprises, or deviations from the plan
4. Open questions or decisions needed from me
5. Risks or debt carried into the next phase
6. Confirmation that every "Done when" item is met (or which aren't, and why)

---

## Part 2: Phase Prompts

### Phase 0: Ground Truth and Baseline

**Objective:** Know exactly what this repo is before changing anything.

**Directions**

- Audit the repo independently. Compare findings against the audit summary above and list every discrepancy.
- Establish a baseline: install, build, type-check, lint, run every existing test/script, boot the app. Record what passes and fails, and why.
- Map the real architecture: data model, route and API surface, auth and role boundaries, the Midnight integration path (witness → prover → receipt → DB → landlord view), payment flow, OCR flow. Note anything that violates the privacy invariants.
- Check for secrets or sensitive material committed to the repo or visible in history (wallet material, keys, env files, tokens). Flag it; don't silently rewrite history. Ask me before any history rewrite.
- Create the working branch, `docs/PROGRESS.md`, and `docs/DECISIONS.md`.
- Produce a **prioritized work breakdown** of Phases 1–7 adapted to what you actually found: reorder or split work if reality demands it.

**Done when:** I have a verified baseline report, a discrepancy list, a privacy-invariant check of the current code, and a refined plan I can approve.

---

### Phase 1: Unblock and Stabilize

**Objective:** A clean, reproducible foundation: it builds, type-checks, migrates, seeds, and tests from scratch.

**Directions**

- Resolve everything blocking a clean build and deploy script execution (merge conflict markers, type-check configuration, anything else you find).
- **Database: establish one source of truth.** Decide whether the Prisma schema or the hand-written migration/seed scripts lead, then make everything else derive from it. Prefer a proper migration workflow over ad-hoc scripts. Regenerating the client must be safe. Fresh setup (empty DB → migrated → seeded → running) must work with a minimal number of documented commands. Be careful that the schema may need to change again in Phase 2; design for that.
- Add a real `test` script that runs all existing suites, and wire up lint, type-check, and build as scripts. Introduce CI that runs them.
- Environment and secrets hygiene: a complete, commented `.env.example`; startup-time validation of required config with clear errors; clean separation of dev/demo/production-like configuration; sensible `.gitignore`. Fix the `accounts.json` mislabeling and make sure no real wallet material is committed.
- Remove dead code and legacy duplicates that are clearly superseded (for example the old proof implementation), after confirming nothing references them.
- Dependency sanity: pinned/consistent versions, no unused or vulnerable packages that matter.

**Done when:** From a fresh clone, one documented sequence installs, migrates, seeds, builds, type-checks, lints, tests, and runs the app with zero errors. `prisma generate` is safe. CI is green.

---

### Phase 2: Level Up the Compact Contract

**Objective:** Transform the contract from a single threshold assertion into a well-designed qualification primitive, then propagate the change through the whole stack.

**Step A: Design first (no code until I've seen it).** Produce a short design document covering the proposed contract: purpose, what's public vs. private, circuits, on-chain state, threat model, and trade-offs. Explore and decide among, at minimum, these directions (use judgment; drop what doesn't hold up, add what's better):

- **Richer, composable criteria.** Beyond income and background: for example rent-to-income ratio relative to the specific property's rent, employment/tenure signals, credit tier bands, rental history, deposit/liquidity coverage. Landlords should be able to choose which criteria apply per listing without redeploying a new contract per listing.
- **On-chain criteria and listings.** Landlord-defined requirements anchored on-chain so a proof is verifiably bound to *specific* requirements, not just "some" threshold.
- **Proof binding and replay resistance.** A proof should be bound to a particular tenant-application-property context and be non-reusable or non-transferable (think nullifiers/commitments), so it can't be replayed for another application or lifted by someone else.
- **Freshness and lifecycle.** Expiry, revocation, and re-verification semantics. Qualification shouldn't be eternal.
- **Selective, minimal disclosure.** The landlord learns exactly one thing (qualifies or not, perhaps with a coarse tier) and nothing else. Consider tier/band outputs vs. pure boolean, and the privacy trade-off of each.
- **Consent-gated identity reveal.** Whether the two-phase reveal (anonymous → tenant-approved) can have a cryptographic or on-chain component rather than purely database state.
- **Input trust model.** Today the prover trusts self-reported witness values (even if OCR-assisted). Think seriously about this: what attestation or issuer model could make the inputs credible (for example signed attestations from a bank/employer/verifier, or a clearly scoped "verifier service" role)? Implement what is feasible for a demo, and **document honestly** what remains a trust assumption.
- **Contract ergonomics.** Clear naming, documented circuits, bounded complexity, sane constraint counts, and testable behavior.

Then **stop and give me the design for approval**, including your recommended scope and what you'd deliberately defer.

**Step B: Implement after approval.**

- Write the contract, compile it, and update generated artifacts and bindings through the proper toolchain (not hand edits).
- Write contract-level tests covering success paths, every failure/rejection path, replay attempts, boundary values, and expiry/revocation if included.
- Propagate through the stack: witnesses, prover engine, API routes, database schema and migrations (via the Phase 1 workflow), receipts, tenant and landlord UI (including the listing criteria editor and the receipt inspector), seed data, and existing tests.
- Update the simulation mode so it mirrors the new contract's semantics faithfully and is **visibly labeled as simulation** wherever a proof is shown.

**Done when:** The new contract compiles, passes its tests, and the entire app (UI → API → prover → DB → landlord view) works against it in both live-capable and simulation modes. Design doc and decision log are updated. Trust assumptions are written down.

---

### Phase 3: Real Deployment and Live-Network Integration

**Objective:** The contract is actually deployed and the app genuinely interacts with it, not just simulates it.

**Directions**

- Make the deploy script robust: clear preflight checks, helpful errors, idempotent behavior where sensible, and automatic recording of deployed address and metadata into configuration.
- Bring up the local devnet stack from the repo's compose setup (verify the pinned image versions are current and compatible with the contract toolchain). Deploy to it and run the full flow in live mode end to end.
- Go beyond local: deploy to the appropriate public Midnight test network and run the flow there. This will need wallet funding or faucet access. **Ask me for anything you need and tell me exactly what.**
- Make live mode first-class: proof generation, submission, confirmation, and the landlord-side verification should read real chain/indexer state. Handle slow proofs, timeouts, failures, retries, and partial states gracefully in the UI.
- Reconsider the wallet story: the tenant settings page references a Midnight wallet address. Decide what a sensible wallet integration is for a demo (connect, display, use for signing) and implement it to the extent that's reliable.
- Keep simulation mode as a deliberate, clearly signposted fallback for offline demos and CI. Provide an obvious mode indicator in the UI and configuration.
- Record deployed addresses/network info in docs.

**Done when:** A recorded, repeatable run exists of the full flow against a real network with verifiable on-chain evidence (transaction identifiers, addresses) and the receipt inspector shows genuine data. Switching between live and simulation is explicit and safe.

---

### Phase 4: Complete the Product

**Objective:** Close every unfinished and missing item, and make the app feel like a finished product, not a scaffold.

**Directions**

- **Payments.** Make the Stripe flow work properly in test mode with real webhooks (including idempotency, signature verification, and failure/cancel/refund paths). The simulator must remain available but clearly marked.
- **Media storage.** Replace external stock-photo dependence with proper upload, storage, and serving of property images via an abstraction that works locally and in a hosted setup. Pick a sensible backend, justify it in the decision log, and handle validation, size limits, and cleanup. Seed data should still look good.
- **Complete flows end to end.** Walk each persona fully and fix gaps: landlord (create/edit listing, set ZK criteria, receive anonymized inquiries, inspect receipts, request reveal, progress to lease) and tenant (browse, apply, pay, prove, consent to reveal, track status). Anything half-wired, dead-ended, aliased awkwardly, or placeholder should be finished or removed.
- **Product completeness.** Consider and decide on: notifications (in-app and/or email in dev-safe form), application lifecycle states, empty/loading/error states everywhere, form validation, pagination and filtering performance, account settings, session handling, and a graceful path for users without a wallet.
- **Security hardening.** Authorization on every route and every object (not just page-level role gates), input validation at API boundaries, rate limiting on sensitive endpoints, CSRF/session safety, safe error messages, and no sensitive data in logs. Write a short threat model.
- **UX and accessibility.** Responsive layouts, keyboard navigation, contrast, reduced-motion support for heavy animations, and consistent copy that explains the privacy model clearly to non-technical users.
- **Demo-readiness features.** Fast one-click demo personas, resettable demo data, and an optional guided walkthrough so a reviewer understands the point within two minutes.

**Done when:** Every flow works end to end for both personas with no dead ends or placeholders in shipped paths; payments, storage, and security items above are complete; privacy invariants re-verified by inspecting code, DB contents, network responses, and logs.

---

### Phase 5: Quality Assurance

**Objective:** Confidence that it works and keeps working.

**Directions**

- Build a proper test pyramid: unit tests (OCR parsing, witness mapping, business rules), contract tests, API/integration tests against a real test database, and end-to-end browser tests covering the critical journeys for both personas in simulation mode (and, where practical, live mode as a separate gated suite).
- Add explicit **privacy regression tests**: automated checks that landlord-facing responses and pages never contain raw credentials or tenant identity before consent, and that documents never reach the server.
- Wire everything into CI with sensible caching and clear failure output. Add coverage reporting without chasing vanity numbers.
- Do a performance pass (bundle size, heavy animation cost, OCR responsiveness, slow queries) and fix meaningful issues.
- Do a dependency and security audit pass and address real findings.
- Do a full manual QA walkthrough of every page and flow at desktop and mobile sizes; log and fix what you find.

**Done when:** CI is green with the full suite, privacy regression tests exist and pass, and your manual QA log shows no open high-severity issues.

---

### Phase 6: Repo Cleanup and Documentation

**Objective:** The repo reads as intentional, professional, and self-explanatory.

**Directions**

- **Remove all foreign and stale material**, including the Latch/MOAT documents and anything else that doesn't describe this project. Remove leftover scratch files, dead configs, duplicate compose files (keep one clear source), unused assets, and misleading names. Organize the tree so structure matches architecture.
- **Write documentation from the final code**, not from memory. Aim for accurate and navigable over voluminous. At minimum:
  - A README that sells and explains the idea in the first screen, shows how it works, lists prerequisites, and gets someone running quickly (including a "no blockchain required" simulation path and a "real network" path).
  - Architecture overview (components, data flow, trust boundaries) with diagrams where they clarify.
  - Privacy and trust model: what's hidden, from whom, what's guaranteed, and the honest limits.
  - Smart contract documentation: purpose, public/private data, each circuit, state, lifecycle, how to compile, test, and deploy.
  - Deployment and operations guide: local, test network, and hosted app; environment variable reference; troubleshooting.
  - Demo guide: personas, a scripted walkthrough, what to point out at each step.
  - Contributing/development guide, testing guide, and a short roadmap of what's deliberately out of scope or would come next.
  - Fold the useful parts of `DECISIONS.md` into proper ADRs; retire working-notes files that no longer serve a purpose.
- Add license, changelog or release notes, issue/PR templates if they add value, and consistent code-level documentation where logic is non-obvious (not noise comments).
- Ensure the docs have been **tested by following them literally** in a clean environment. Fix every place they fail.

**Done when:** A fresh reader can understand, run, and evaluate the project using only the docs, every command in the docs has been executed successfully, and no stale or foreign files remain.

---

### Phase 7: Demo Polish and Release

**Objective:** Ship something people can actually try and judge.

**Directions**

- Prepare a hosted demo deployment (propose the platform and approach; ask me about accounts/credentials), with demo data, safe defaults, and clearly labeled mode (live test network vs. simulation).
- Produce a concise demo script and a list of talking points tied to the product's differentiator (privacy-preserving verification that couldn't exist without ZK).
- Do a final end-to-end rehearsal from a clean environment. Run the full CI suite, the manual QA checklist, and the doc walkthrough one last time.
- Tag a release, write release notes, and summarize known limitations honestly.
- Deliver a final report: what the project now is, what changed since the baseline, what is real vs. simulated, remaining risks, and recommended next steps.

**Done when:** There's a working hosted demo or a one-command local demo, a tagged release, a rehearsed demo script, and a final report I can hand to anyone.

---

## Appendix: Decisions to expect the agent to bring to you

- Target Midnight network(s) and wallet funding
- Contract scope approved at the end of Phase 2 Step A
- Image/media storage backend
- Hosting platform and domain for the hosted demo
- Stripe test-mode keys and webhook endpoint setup
- Whether any git history rewrite is warranted for committed secrets