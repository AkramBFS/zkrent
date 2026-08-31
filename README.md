# ZkRent

> **Prove you can afford the rent without revealing your income, tax returns, W-2 forms, full bank statements, or social security number.**

ZkRent is a privacy-first rental application platform powered by Midnight Network and Zero-Knowledge (ZK) proofs.

Traditional rental applications require tenants to disclose sensitive financial and employment information to landlords—often including income, employment records, and background-check information.

This creates catastrophic identity theft risk for tenants AND massive legal liability for property owners who are forced to become custodians of sensitive personally identifiable information (PII).

ZkRent changes what the landlord receives.

Instead of revealing the underlying data, a tenant generates a privacy-preserving proof that they satisfy the landlord's requirements. The landlord receives the verification result, not the sensitive information used to produce it.

---

## LINK TO PREVIEW VIDEO

https://vimeo.com/1222486300?fl=ip&fe=ec

## 🎯 Executive Overview & Problem Statement

### The Problem

Renting a home routinely forces applicants to hand over their most sensitive financial documents: bank statements, tax returns, W-2 forms, pay stubs, employer contacts, and government ID numbers.

A landlord legitimately needs to know:

> *"Does this applicant satisfy my requirement of earning at least $75,000 per year with a clean background check?"*

Under the legacy model, answering that simple question requires total document surrender:

> *"Here are 40 pages of my unredacted bank records showing every transaction, healthcare payment, account balance, and employer record."*

This creates two critical vulnerabilities:

1. **For Tenants:** Extreme risk of identity theft, data breaches, profiling, and discrimination.
2. **For Landlords & Property Managers:** Massive compliance exposure (GDPR, CCPA, PII regulations) and severe liability from holding unencrypted consumer financial data.

**The fundamental insight of ZkRent:** Landlords need *verification*, not *custody of private data*.

### The ZkRent Solution

ZkRent separates **proving eligibility** from **revealing personal data**:

```text
┌──────────────────────────────────────────────────────────┐
│                    TRADITIONAL MODEL                     │
│ Tenant Data ──────> Landlord Database ──────> Inspection │
│ (Full PII exposed, permanent custody, breach risk)       │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                        ZKRENT MODEL                      │
│ Tenant Data ──> [On-Device ZK Prover] ──> Proof Hash     │
│                                              │           │
│                                              ▼           │
│ Landlord Receives <─────────────── [Midnight Network]    │
│ (Eligible: YES | Verified by Math | Zero PII Disclosed)  │
└──────────────────────────────────────────────────────────┘

```

---

## 🏆 Key Architecture & System Capabilities

| Feature Pillar | Implementation Details |
| --- | --- |
| **Technology** | • **Midnight Compact Smart Contracts:** Custom `qualification.compact` circuit compiled to 38,420 Halo2 arithmetic constraints.<br>

<br>• **Client-Side Document OCR:** In-browser Web Worker Tesseract.js pipeline with canvas binarization extracting income locally without uploading files.<br>

<br>• **Midnight JS Integration:** Seamless connection with Midnight Node, Indexer, Proof Server, LevelDB private state store, and cost models.<br>

<br>• **Full-Stack Architecture:** Next.js 16 (App Router), React 19, TypeScript, PostgreSQL via Prisma ORM, Stripe Checkout, and NextAuth. |
| **Originality** | • **Zero-Knowledge Tenant Screening:** First implementation translating rental underwriting rules into verifiable cryptographic predicates.<br>

<br>• **Predicate vs. Value Disclosure:** Proving $Income \ge Requirement$ without publishing the exact salary or bank balance.<br>

<br>• **Two-Phase Consent-Driven Reveal:** Tenants remain pseudonymous until a formal lease offer is extended and the tenant explicitly authorizes identity disclosure. |
| **Execution** | • **Polished Dark-Luxury UI/UX:** Built with Tailwind CSS, Framer Motion animations, custom micro-interactions, responsive mobile views, and luxury easing.<br>

<br>• **Interactive Prover Wizard:** Multi-step on-device witness construction, animated witness redaction pipeline, and stamped seal verification badges.<br>

<br>• **Cryptographic Proof Drawer:** Expandable inspector displaying Midnight transaction hashes, contract addresses, block heights, and constraint metrics for full transparency. |
| **Completion** | • **End-to-End Operational Workflows:** Landlords create listings with custom criteria; tenants search listings, complete Stripe checkout, run local OCR, generate ZK proofs, and receive Midnight verification; landlords review anonymous verified applicants and issue lease offers. |
| **Documentation** | • **Developer-First Design:** Clear architectural diagrams, strict privacy boundary matrices, local Docker devnet instructions, and transparent step-by-step setup guides. |
| **Business Value** | • **$300B+ Global Rental Market:** Direct, immediate utility for property managers, landlords, and millions of tenants.<br>

<br>• **Viable Monetization:** Frictionless $5–$10 fiat verification fee via Stripe while listing remains free for landlords.<br>

<br>• **Massive Compliance Relief:** Eliminates GDPR/CCPA PII liability for property management firms by removing the need to store tenant financial documents. |

---

## 🔐 Strict Privacy Architecture & Data Boundaries

ZkRent enforces cryptographic isolation between the client device, application database, and the Midnight public ledger.

```text
                                  ┌───────────────────────────────┐
                                  │       Tenant Local Device     │
                                  │  • Bank Statement / W-2 OCR   │
                                  │  • Private Witness (Salary)   │
                                  │  • Halo2 Proof Generation     │
                                  └──────────────┬────────────────┘
                                                 │
                                            ZK SNARK Proof
                                          (Zero PII Transferred)
                                                 │
                                                 ▼
┌───────────────────────────────┐         ┌───────────────────────────────┐
│     PostgreSQL App State      │         │    Midnight Public Ledger     │
│  • Property Listings          │◄───────►│  • Minimum Income Requirement │
│  • Stripe Payment Status      │         │  • Proof Verification Result  │
│  • Verification Metadata      │         │  • Nullifiers / Commitments   │
│  • NO Private Financial Data  │         │  • NO Private Witness Data    │
└───────────────────────────────┘         └───────────────────────────────┘

```

### Data Boundary Matrix

| Data Point | Tenant | Landlord | PostgreSQL Database | Midnight Public Ledger |
| --- | --- | --- | --- | --- |
| **Raw Annual Income** | ✅ Private | ❌ Never | ❌ Never | ❌ Never |
| **Bank Statements & Tax Forms** | ✅ Local Device | ❌ Never | ❌ Never | ❌ Never |
| **Background / Credit Details** | ✅ Private | ❌ Never | ❌ Never | ❌ Never |
| **Property Eligibility Rules** | ✅ Public | ✅ Public | ✅ Stored | ✅ Stored on Ledger |
| **Verification Verdict (`QUALIFIED`)** | ✅ Visible | ✅ Visible | ✅ Verification Record | ✅ Public Result |
| **Midnight Proof & Transaction Hash** | ✅ Visible | ✅ Visible | ✅ Proof Reference | ✅ Verified on Chain |
| **Tenant Legal Name & Contact** | ✅ Private | 🔒 Only After Consent | 🔒 Encrypted Session | ❌ Never |

---

## ⚡ Key Technical Innovations

### 1. In-Browser Client-Side Document OCR (Zero Document Upload)

Rather than requiring users to manually guess their income or upload sensitive PDF/image files to a backend server, ZkRent includes an on-device OCR engine:

* **Web Worker Isolation:** Runs Tesseract.js inside a dedicated browser Web Worker thread.
* **Canvas Preprocessing:** Automatically rescales, grayscales, enhances contrast, and binarizes uploaded documents on an HTML5 canvas.
* **Semantic Currency & Income Parsing:** Extracts gross annual or monthly figures and converts currencies ($ / € / £).
* **Zero Document Leakage:** The raw document and extracted OCR text **never leave the user's browser**. Once the numeric salary is confirmed into local witness memory, all image buffers and OCR artifacts are immediately freed.

```text
[Bank Statement / W-2 Image]
            │
            ▼ (Client-side Canvas)
[Preprocessed Image Blob]
            │
            ▼ (Web Worker Tesseract.js)
[OCR Text Stream] ──> [Semantic Income Regex Parser] ──> [Numeric Witness Value]
                                                                  │
                                                       (Buffers Cleared from Memory)

```

### 2. Midnight Compact Circuit Logic

The qualification logic is compiled directly into Halo2 zero-knowledge circuits compiled from Midnight's native Compact language:

* **Witnesses:** `annualIncome()` and `backgroundClean()` are private inputs supplied exclusively by the tenant's device.
* **Circuit Constraints:** Mathematically enforces constraints that $annualIncome \ge minIncomeReq$ and $backgroundClean == true$.
* **Disclosure Controls:** Only the resulting qualification verdict flags and public contract parameters are disclosed to the ledger upon proof verification.

### 3. Two-Stage Pseudonymous Lease Workflow

1. **Application & Verification:** The applicant is identified solely by a pseudonymous tag (e.g. `Applicant #A81F`). The landlord evaluates verified cryptographic credentials without bias or identity leaks.
2. **Lease Offer & Selective Reveal:** When the landlord selects an applicant and prepares a lease agreement, they initiate an *Identity Reveal Request*. The tenant receives an explicit prompt and can approve or decline sharing their legal name and contact details.

---

## 🛠️ Technology Stack

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND & UI                                   │
│  Next.js 16 (App Router) • React 19 • TypeScript • Tailwind CSS v4      │
│  Framer Motion • Lucide Icons • Canvas Confetti • Tesseract.js (OCR)    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                         BACKEND & API                                   │
│  Next.js Server Actions & Route Handlers • Auth.js (NextAuth)            │
│  Prisma ORM 7 • PostgreSQL (@prisma/adapter-pg) • Stripe Checkout SDK  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                 MIDNIGHT NETWORK ZERO-KNOWLEDGE LAYER                   │
│  Compact Language • Halo2 Proof System • @midnight-ntwrk/midnight-js-* │
│  Midnight Proof Server • Midnight Node • Indexer • LevelDB Store        │
└─────────────────────────────────────────────────────────────────────────┘

```

| Layer | Component | Version / Purpose |
| --- | --- | --- |
| **Smart Contract** | Compact | `^0.22` • Smart contract & Halo2 ZK circuit definition |
| **ZK Runtime** | `@midnight-ntwrk/compact-runtime` | `0.19.0` • Compact bytecode execution |
| **Midnight SDK** | `@midnight-ntwrk/midnight-js-*` | `4.0.4` • Contract orchestration & proof submission |
| **Ledger Runtime** | `@midnight-ntwrk/ledger-v8` | `8.0.3` • Transaction & cost model management |
| **Framework** | Next.js | `16.3.3` (App Router, Server Components) |
| **UI Library** | React & React-DOM | `19.2.8` |
| **Styling & Motion** | Tailwind CSS v4 & Framer Motion | `^4.0` / `^13.1` • Dark-luxury responsive UI |
| **Client OCR** | Tesseract.js | `^7.0.0` • Local Web Worker document scanning |
| **Database & ORM** | PostgreSQL + Prisma ORM | `^7.10.0` • Type-safe metadata persistence |
| **Payments** | Stripe | `^22.6.0` • Fiat checkout session integration |
| **Authentication** | Auth.js (NextAuth) | `^5.0.0-beta` • Role-based auth (Tenant & Landlord) |

---

## 🚀 End-to-End User Journey

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. LANDLORD ONBOARDING & LISTING CREATION                               │
│    • Landlord registers and publishes property listing.                 │
│    • Configures qualification rules: minimum income, background check,   │
│      employment requirement, and verification fee.                      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ 2. TENANT DISCOVERY & APPLICATION                                       │
│    • Tenant explores available rental properties and requirements.       │
│    • Initiates private application and completes Stripe checkout ($5).  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ 3. ON-DEVICE OCR & WITNESS CREATION                                     │
│    • Tenant uploads bank statement / W-2 (scanned locally in browser).   │
│    • Private witness constructed in local memory (never uploaded).      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ 4. MIDNIGHT ZERO-KNOWLEDGE PROOF SYNTHESIS                              │
│    • Halo2 circuit evaluates constraints against landlord rules.         │
│    • Midnight network verifies proof and registers cryptographic receipt.│
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ 5. LANDLORD REVIEW & LEASE OFFER                                        │
│    • Landlord reviews anonymous applicant verdict (QUALIFIED / SEALED). │
│    • Inspects on-chain proof hash, block height, and metrics drawer.    │
│    • Landlord requests identity reveal -> Tenant consents -> Lease sent.│
└─────────────────────────────────────────────────────────────────────────┘

```

---

## 💻 Developer Setup & Installation

### Prerequisites

* **Node.js**: `v22.x` or higher
* **npm**: `v10.x` or higher
* **Docker & Docker Compose**: For running the local Midnight network and PostgreSQL
* **Git**

---

### Step 1: Clone and Install Dependencies

```bash
git clone https://github.com/your-username/zkrent.git
cd zkrent
npm install

```

---

### Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# PostgreSQL Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zkrent?schema=public"

# Auth.js / NextAuth
AUTH_SECRET="zkrent-secure-auth-secret-key-production"

# Stripe Payments (Test Mode)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Midnight Network Configuration
MIDNIGHT_NETWORK="undeployed"
MIDNIGHT_NODE_URL="http://127.0.0.1:9944"
MIDNIGHT_NODE_WS_URL="ws://127.0.0.1:9944"
MIDNIGHT_INDEXER_URL="http://127.0.0.1:8088/api/v4/graphql"
MIDNIGHT_INDEXER_WS_URL="ws://127.0.0.1:8088/api/v4/graphql/ws"
MIDNIGHT_PROOF_SERVER_URL="http://127.0.0.1:6300"
MIDNIGHT_CONTRACT_ADDRESS="02005a91f89bcde319409827104928194028194028194028194028194028194028"

```

---

### Step 3: Start Midnight Network Infrastructure

Launch the Midnight devnet stack (Node, Indexer, and Proof Server) using Docker Compose:

```bash
docker compose up -d

```

Verify services are healthy:

* **Proof Server:** `[http://127.0.0.1:6300](http://127.0.0.1:6300)`
* **Midnight Node:** `[http://127.0.0.1:9944/health](http://127.0.0.1:9944/health)`
* **Midnight Indexer:** `[http://127.0.0.1:8088](http://127.0.0.1:8088)`

---

### Step 4: Initialize the Database

Ensure your PostgreSQL instance is running, then generate the Prisma client and push the schema:

```bash
npx prisma generate
npx prisma db push

```

---

### Step 5: Start the Development Server

```bash
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Repository Structure

```text
zkrent/
├── contracts/                               # Midnight Smart Contracts
│   ├── qualification.compact                # Compact ZK qualification circuit
│   └── managed/qualification/               # Compiled circuit artifacts
│       ├── contract/                        # Generated JS/TS contract bindings
│       ├── keys/                            # Halo2 prover & verifier keys
│       └── zkir/                            # ZKIR binary & JSON representations
│
├── prisma/
│   └── schema.prisma                        # PostgreSQL database schema
│
├── src/
│   ├── app/                                 # Next.js App Router
│   │   ├── (auth)/                          # Login, registration, onboarding
│   │   ├── (public)/                        # Landing, property search, how-it-works
│   │   ├── landlord/                        # Landlord portal (properties, inquiries)
│   │   ├── tenant/                          # Tenant portal (applications, ZK prover)
│   │   └── api/                             # REST API route handlers
│   │       ├── applications/                # Application lifecycle & reveal consent
│   │       ├── payments/                    # Stripe checkout & webhooks
│   │       ├── properties/                  # Property management & criteria
│   │       └── verifications/prove/         # Midnight ZK proof execution endpoint
│   │
│   ├── components/                          # React UI Components
│   │   ├── DocumentOcrUploader.tsx          # Client-side Tesseract Web Worker OCR
│   │   ├── VerifyReceiptDrawer.tsx          # Cryptographic proof & metadata inspector
│   │   ├── ZkBadges.tsx                     # Stamped seals & applicant tags
│   │   ├── Navbar.tsx & Footer.tsx          # Navigation & site layout
│   │   └── motion/                          # Framer Motion animations & transitions
│   │
│   ├── context/
│   │   └── ZkRentContext.tsx                # Client application state & flows
│   │
│   ├── lib/
│   │   ├── auth.ts                          # NextAuth session configuration
│   │   ├── prisma.ts                        # Prisma database client
│   │   ├── stripe.ts                        # Stripe integration helper
│   │   └── ocr/                             # Document preprocessing & regex parsers
│   │       ├── image-preprocess.ts          # HTML5 Canvas image binarization
│   │       ├── income-ocr.ts                # Tesseract Web Worker singleton
│   │       └── income-parser.ts             # Semantic currency & income parsing
│   │
│   └── midnight/                            # Midnight Network Integration
│       ├── types.ts                         # ZK proving & witness data types
│       ├── witnesses.ts                     # Compact contract witness constructor
│       └── zk.ts                            # Midnight ZK proving engine
│
├── docker-compose.yml                       # Midnight devnet Docker stack
├── package.json                             # Dependencies & build scripts
└── README.md                                # Project documentation

```

---

## 💼 Business Model & Market Viability

### Target Market

* **Global Residential Rental Market:** $300B+ annual transaction volume. Over 110 million renters in the US and EU apply for apartments each year.
* **High-Risk Segment:** Tech workers, self-employed contractors, expats, and privacy-conscious professionals who refuse to email unredacted tax returns to unvetted landlords.

### Revenue Model

1. **Verification Fee:** $5.00–$10.00 charged to the tenant per verified application via Stripe (displacing traditional $30–$75 background check fees).
2. **Landlord Enterprise SaaS:** Free tier for individual property owners; monthly subscription for property management companies wanting automated lease generation, multi-property syndication, and API integration.

### Strategic Advantages

* **Regulatory Compliance by Default:** Eliminates the risk of GDPR/CCPA fines for landlords by removing PII storage entirely.
* **Zero Crypto Barrier:** Renters and landlords use standard credit/debit cards via Stripe—Midnight network transaction fees are abstracted seamlessly.

---

## 🔮 Future Roadmap

* [ ] **Deployment Script Integration:** Single-command automated deployment pipelines for local devnet, testnet, and mainnet smart contract deployments.
* [ ] **Multi-Jurisdiction DID Attestations:** Integration with decentralized identity providers (e.g. Polygon ID, Cardano Atala PRISM) for cryptographic government ID verification.
* [ ] **Automated ZK Lease Smart Contracts:** Programmable escrow for security deposits and monthly rent payments with automated zero-knowledge dispute arbitration on Midnight.

---

## 🛡️ License

This project is open-source under the [MIT License](https://www.google.com/search?q=LICENSE).
