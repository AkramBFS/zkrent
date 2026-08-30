# Latch deployment record

This record separates the reproducible deployment artifact from the external
hosting fact. The static application is built and verified. A public origin is
not currently available, so this repository does **not** claim a live demo URL.

## Status

| Fact | Verified value |
| --- | --- |
| Initial documentation source | `feat/atharv/docs` at `37bf7c1b3929835fab591c9da73672acb80c13cf` |
| Initial artifact review | [#10 - Prepare verified deployment bundle](https://github.com/CipherCollective/Latch/pull/10) |
| Current application source | `fix/atharv/wallet-focus-stability` at `53a8a58eb70becb6fc3cc3b72d39a874dc01ec82` |
| Current static artifact commit | `65a9195cd2e1f514515c3c0480603c45c05ca7c7` |
| Current refresh review | [#12 - Stabilize wallet focus revalidation](https://github.com/CipherCollective/Latch/pull/12) |
| Base path | `/Latch/` |
| Entrypoint | `docs/index.html` |
| Runtime required by the repository | Node.js `>=22.13.0 <23`; the reproducibility build used `22.13.0` |
| Demo environment values | None |
| Public URL | `[DEPLOYMENT FACT REQUIRED]` |
| Public-host smoke test | Blocked until an authorized hosting target exists |

The bundle is intentionally fixture-only. It does not contain or claim a real
Midnight contract, proof, capability, receipt, destination, transaction, block,
address, or explorer link. The hardened wallet connector boundary remains
available, but no real capability or payment action is enabled without the
independently verified core factory.

## Reproduce the artifact

Use the supported Node release line and a clean checkout:

```bash
npm ci
npm run typecheck
npm run test:run
npm run build:pages
npx --yes prettier@3.6.2 --write docs/index.html
```

`--emptyOutDir false` is required because `docs/` also contains authored
documentation and evidence. Never replace it with `true` when targeting this
directory. The committed `.nojekyll` file is a publisher instruction and is not
emitted by Vite. The committed `.gitattributes` pins text release inputs to LF
so a Windows checkout cannot silently change a copied asset's digest.

For a local hosted-artifact check:

```bash
npm run preview --workspace @latch/web -- \
  --base /Latch/ \
  --outDir ../docs \
  --host 127.0.0.1 \
  --port 4174
```

Open `http://127.0.0.1:4174/Latch/`. Vite preview is a verification server, not
a production hosting service.

## Artifact manifest

SHA-256 values are lowercase hexadecimal over the exact committed bytes.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `docs/index.html` | 1,195 | `f95c614b3cc5c6130d6e10b96e444d12e13353dfcc8275cabe4be5f9aaa8ae29` |
| `docs/assets/index-RNyzXTd4.css` | 32,712 | `9d1972bafa18cc2155d01696def99451f106117cce8e9ed1322d99a720028568` |
| `docs/assets/index-CWrhvGPy.js` | 293,586 | `c1f90ba0a24856c8696792b7a986e9a2c2d38046bbccdccb240c1ae6d3ea6b86` |
| `docs/latch-mark.svg` | 447 | `ace7249d68ab2d51a83897ac6fdd26cea6ac8f8a0128b5c060991ad9935eb1a9` |
| `docs/THIRD_PARTY_NOTICES.txt` | 18,074 | `9bb1763e0847029c4cbdbc9d01e13596456cb6eacbfe96f90b654acb9031a89f` |
| `docs/.nojekyll` | 48 | `95db1598a91b84c16ce818427289c2c3d9e5d4e363ae997af53cf9c000734a63` |

An isolated rebuild under Node.js `22.13.0` reproduced the JavaScript, CSS,
SVG, notice file, and formatted HTML byte-for-byte. The HTML comparison applied
the same pinned Prettier `3.6.2` normalization used for the committed file. The
manifest was computed from a clean remote checkout, after Git applied the
committed LF policy, rather than from a pre-index Windows working copy.

## Local hosted-artifact verification

The committed artifact was served at its production base path and exercised in
headless Microsoft Edge using Playwright and Axe Core `4.12.1`.

| Check | Result |
| --- | --- |
| Initial load and hashed assets | Passed; no failed request or HTTP response `>= 400` |
| Third-party notice | `200` |
| Deterministic create and owner dashboard | Passed |
| CodeShield approval and receipt verification | Passed |
| AlphaSignal policy rejection | Passed |
| Replay rejection | Passed |
| Owner/Public Observer projection | Passed for approval and both rejection paths |
| Revocation and post-revocation action disablement | Passed |
| New capability and reset | Passed |
| Missing-wallet state | Passed |
| Compatible Preprod fixture connector | Passed without exposing a real core action |
| Desktop `1440x900` | Inspected |
| Mobile `390x844` | Inspected |
| Narrow `320x720` | Zero document or wallet-flow horizontal overflow |
| WCAG A/AA automated scan | Zero Axe violations on landing, wallet-missing, wallet-connected, owner-approved, and observer-approved states |
| Browser diagnostics | Zero application console errors, request failures, or error responses |
| Focus transfer | Dashboard heading received programmatic focus after navigation |

This is evidence about the exact local static artifact. It is not evidence that
an unauthenticated public origin is reachable.

## Hosting attempt and exact blocker

On 2026-07-18, the deployment branch was pushed and the
[GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages) was asked to
publish `/docs`. Repository metadata reported a private organization repository
with Pages disabled. The create-site request returned HTTP `422`:

```text
Your current plan does not support GitHub Pages for this repository.
```

No Vercel, Netlify, Cloudflare Pages, or equivalent deployment credential or
preconfigured project is available in this workspace. Changing repository
visibility, changing organization billing, or creating a separate public mirror
would be an external governance decision, so none was performed implicitly.

The repository includes `vercel.json` for an authorized Vercel deployment. It
builds `web/dist`, rewrites application paths to `index.html`, and configures
anti-framing, MIME-sniffing, and referrer response headers using
[Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json).
GitHub Pages does not apply Vercel's response-header configuration; selecting
Pages would therefore require an explicit review of that difference.

## Unblock and finish public verification

One authorized hosting path is required:

1. Enable GitHub Pages for this private repository/organization plan and publish
   the reviewed final integration commit from `/docs`; or
2. provide access to an approved Vercel project and credential, then deploy from
   the repository root using the committed `vercel.json`; or
3. choose another approved static host and define its response-header policy.

After a host is selected, record the immutable deployment URL and commit, open
it in a fresh unauthenticated browser, rerun the complete matrix above on the
hosted origin, inspect response headers, and replace only the
`[DEPLOYMENT FACT REQUIRED]` placeholders supported by that evidence.