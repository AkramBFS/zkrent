# ZkRent

> **Prove you can afford the rent without revealing your income, tax returns, W-2 forms, full bank statements, and social security number**

ZkRent is a privacy-first rental application platform powered by **Midnight Network** and **Zero-Knowledge (ZK) proofs**.

Traditional rental applications require tenants to disclose sensitive financial and employment information to landlords—often including income, employment records, and background-check information.

This creates catastrophic identity theft risk for tenants and massive legal liability for property owners who are forced to become custodians of sensitive personally identifiable information (PII)

**ZkRent changes what the landlord receives.**

Instead of revealing the underlying data, a tenant generates a privacy-preserving proof that they satisfy the landlord's requirements. The landlord receives the **verification result**, not the sensitive information used to produce it.

---

## The Problem

Renting a home often requires applicants to disclose far more information than a landlord actually needs.

A landlord may need to know:

> "Does this applicant earn at least $75,000 per year?"

But the traditional application process gives them:

> "Here is my exact income, employment information, financial documentation, and other sensitive personal data."

This creates unnecessary privacy exposure and forces tenants to trust multiple parties with highly sensitive information.

**The problem isn't that landlords need verification.**

The problem is that verification traditionally requires **disclosure**.

---

## Our Solution

ZkRent separates **proving eligibility** from **revealing personal data**.

A landlord defines public eligibility requirements:

```text
Minimum annual income: $75,000
Background check: Required
Employment verification: Required
```

The tenant keeps their underlying credentials private:

```text
Actual income: $91,000
Background status: Clean
Employment: Verified
```

The tenant then generates a ZK proof locally.

The Midnight network verifies that the private information satisfies the public requirements without exposing the underlying values.

The landlord receives:

```text
Anonymous Applicant #A81F

✓ Income requirement satisfied
✓ Background requirement satisfied
✓ Employment requirement satisfied

QUALIFIED
```

Not:

```text
Income: $91,000
Employer: ...
Background report: ...
```

### Core principle

> **Prove eligibility, not identity data.**

---

# Why Midnight?

ZkRent is not a conventional rental marketplace with blockchain added on top.

**Privacy is the reason Midnight is part of the architecture.**

The core operation of ZkRent is:

```text
Private tenant data
        │
        ▼
   ZK circuit
        │
        │ proves:
        │
        │ income ≥ requirement
        │ background = valid
        │ employment = valid
        ▼
Midnight verification
        │
        ▼
Public eligibility result
```

The sensitive inputs remain private while the result can be independently verified.

This makes Midnight's programmable privacy architecture a natural fit for the problem rather than an optional infrastructure component.

---

# What Is Private?

ZkRent deliberately establishes a privacy boundary between application data and verification state.

| Data                     | Tenant | Landlord | PostgreSQL |      Public Ledger |
| ------------------------ | -----: | -------: | ---------: | -----------------: |
| Actual income            |      ✓ |        ✗ |          ✗ |                  ✗ |
| Financial documents      |      ✓ |        ✗ |          ✗ |                  ✗ |
| Background details       |      ✓ |        ✗ |          ✗ |                  ✗ |
| Employment details       |      ✓ |        ✗ |          ✗ |                  ✗ |
| Eligibility requirements |      — |        ✓ |          ✓ | Public as required |
| Verification result      |      ✓ |        ✓ |   Metadata |                  ✓ |
| Transaction reference    |      — |        ✓ |          ✓ |                  ✓ |

**PostgreSQL stores platform state and verification metadata—not the tenant's raw financial credentials.**

The ZK layer is responsible for proving the relationship between private credentials and public eligibility requirements.

---

# End-to-End Flow

```text
┌──────────────────┐
│     LANDLORD     │
│                  │
│ Create listing   │
│ Define criteria  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    PROPERTY      │
│                  │
│ Income ≥ $75K    │
│ Background ✓     │
│ Employment ✓     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│      TENANT      │
│                  │
│ Apply privately  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  PRIVATE INPUTS  │
│                  │
│ Income: $91K     │
│ Background: ✓    │
│ Employment: ✓    │
└────────┬─────────┘
         │
         │ never stored
         │ as raw data
         ▼
┌──────────────────┐
│    ZK PROOF      │
│                  │
│ income ≥ $75K    │
│ background ✓     │
│ employment ✓     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│     MIDNIGHT     │
│                  │
│ Verify proof     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│     LANDLORD     │
│                  │
│ Anonymous        │
│ Applicant #A81F  │
│                  │
│ ✓ QUALIFIED      │
└──────────────────┘
```

---

# Key Features

## 🔐 Privacy-Preserving Eligibility

Tenants can prove they satisfy rental requirements without exposing the underlying financial or credential data.

## 🏠 Privacy-Native Rental Marketplace

ZkRent retains the familiar rental experience:

* Browse properties
* Search and filter listings
* View rental requirements
* Submit applications
* Track verification status

The difference is that sensitive eligibility information does not need to be handed to the landlord.

## 🧮 ZK Eligibility Verification

Eligibility conditions are evaluated inside the privacy-preserving verification layer.

For example:

```text
private annual_income ≥ public minimum_income
```

The resulting proof demonstrates that the condition was satisfied without making the private value public.

## 👤 Anonymous Applicant Results

Landlords can review verification outcomes without receiving the tenant's underlying sensitive credentials.

Example:

```text
Anonymous Applicant #A81F

ZK Verification
────────────────
Income requirement       ✓
Background requirement   ✓
Employment requirement   ✓

Result: QUALIFIED
```

## 💳 Web2 Payments

ZkRent uses **Stripe** for fiat payments so users do not need to acquire cryptocurrency merely to use the application.

The MVP monetization model uses a small privacy-verification fee while keeping landlord property listings free.

## ⛽ Sponsored Midnight Transactions

The application is designed to abstract Midnight transaction costs from normal users through delegated DUST sponsorship.

The goal is a familiar Web2 experience:

```text
User → Verify privately

not:

User → Acquire crypto → Manage gas → Verify
```

## 🗄️ Conventional Application Infrastructure

ZkRent uses PostgreSQL for ordinary application state:

* Users
* Properties
* Applications
* Payments
* Verification metadata

The database is intentionally **not** the source of truth for private eligibility credentials.

---

# Privacy Architecture

ZkRent uses three distinct layers.

### 1. Application Layer

Next.js / React handles:

* Property discovery
* Tenant and landlord portals
* Applications
* Authentication
* Payment flows

### 2. Application Database

PostgreSQL stores conventional platform state.

It does **not** need to store:

* Raw income
* Financial documents
* Private credential values
* Sensitive background information

### 3. Midnight ZK Layer

Midnight handles the privacy-sensitive verification logic.

Conceptually:

```text
                ZkRent
                   │
       ┌───────────┴───────────┐
       │                       │
   Web2 State             Private State
       │                       │
   PostgreSQL              Tenant Device
       │                       │
       │                       ▼
       │                  ZK Witnesses
       │                       │
       │                       ▼
       │                 Compact Circuit
       │                       │
       └───────────────┬───────┘
                       ▼
                  Midnight
                       │
                       ▼
                Verification Result
```

This separation is fundamental to the design.

---

# Technology Stack

| Layer           | Technology                    | Purpose                         |
| --------------- | ----------------------------- | ------------------------------- |
| Frontend        | Next.js / React / TypeScript  | Rental marketplace and portals  |
| Styling         | Tailwind CSS                  | UI                              |
| Authentication  | Auth.js                       | Tenant / landlord sessions      |
| Database        | PostgreSQL                    | Application and platform state  |
| ORM             | Prisma                        | Type-safe database access       |
| Payments        | Stripe                        | Fiat verification payments      |
| ZK / Blockchain | Midnight Network              | Privacy-preserving verification |
| Smart Contracts | Compact                       | ZK verification circuits        |
| Midnight SDK    | `@midnight-ntwrk/midnight-js` | Client/network integration      |
| Gas abstraction | Midnight DUST                 | Sponsored transaction execution |

---

# Application Architecture

```text
                         ┌─────────────────────┐
                         │      Next.js        │
                         │                     │
                         │ Tenant Portal       │
                         │ Landlord Portal     │
                         │ Property Discovery  │
                         └──────────┬──────────┘
                                    │
                              HTTPS / API
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Application API   │
                         │                     │
                         │ Auth                │
                         │ Properties          │
                         │ Applications        │
                         │ Payments            │
                         │ Verification state  │
                         └──────┬───────┬──────┘
                                │       │
                     ┌──────────┘       └──────────┐
                     ▼                             ▼
             ┌──────────────┐             ┌─────────────────┐
             │  PostgreSQL  │             │     Stripe      │
             │              │             │                 │
             │ App state    │             │ Checkout        │
             │ Payments     │             │ Webhooks        │
             │ Metadata     │             └─────────────────┘
             └──────────────┘
                               
                                Tenant private data
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │  Midnight / Compact │
                              │                     │
                              │ ZK Eligibility      │
                              │ Verification        │
                              └──────────┬──────────┘
                                         │
                                         ▼
                                  Verified Result
```

---

# Smart Contract Design

The core Midnight contract is responsible for evaluating rental eligibility using private inputs against landlord-defined public requirements.

A simplified representation:

```compact
export circuit verifyQualification(
    private annual_income: Uint<64>,
    private background_clean: Boolean,
    public min_income_req: Uint<64>
): Boolean {

    assert annual_income >= min_income_req;

    assert background_clean == true;

    return true;
}
```

The important property is the **privacy boundary**:

```text
PRIVATE
──────────────
annual_income
background status
employment credentials
tenant secrets

        │
        │ ZK proof
        ▼

PUBLIC
──────────────
eligibility result
verification metadata
required public policy
```

The raw private values do not need to become public ledger state.

---

# Payment Model

ZkRent is designed around a simple MVP business model.

### Landlords

**Free**

Landlords can:

* Create listings
* Define eligibility requirements
* Receive applications
* Review verification results

### Tenants

A small verification fee can be charged when submitting a privacy-preserving application.

Example:

```text
Privacy Verification
$5.00

[ Pay & Verify Privately ]
```

The fee is processed through Stripe.

### Rent

ZkRent does **not** take custody of monthly rent in the MVP.

Rent remains a direct tenant-to-landlord transaction.

This keeps ZkRent focused on its core value proposition:

> **privacy-preserving rental qualification.**

---

# Security & Privacy Principles

ZkRent follows several design principles.

### Never store raw private eligibility data unnecessarily

Sensitive financial and credential information should remain local to the tenant wherever possible.

### Prove predicates, not values

Instead of revealing:

```text
income = $91,000
```

prove:

```text
income >= $75,000
```

### Disclose as late as possible

Information should only cross the private/public boundary when the application genuinely requires it.

### Use cryptographic commitments where appropriate

Private application state can be represented through commitments rather than publishing the underlying values.

### Prevent proof/application replay

Where an eligibility credential or application must be single-use, nullifiers can prevent reuse without exposing the underlying identity.

### Never rely on application UI for authorization

Security-sensitive authorization must be enforced by the cryptographic/application layer rather than by trusting client-supplied identity information.

---

# Why This Matters

ZkRent demonstrates a broader principle:

> **Many systems don't actually need your data. They need proof about your data.**

A landlord doesn't necessarily need to know:

> "What is your exact income?"

They need to know:

> "Do you satisfy my income requirement?"

ZK proofs allow ZkRent to make that distinction explicit.

The same architecture can eventually extend beyond rental applications to:

* Credit qualification
* Insurance eligibility
* Employment verification
* Age or residency requirements
* Financial qualification
* Other privacy-sensitive approval workflows

---

# Current MVP Scope

The MVP focuses on one complete privacy-preserving workflow:

```text
Landlord creates property
        ↓
Landlord defines eligibility criteria
        ↓
Tenant discovers property
        ↓
Tenant starts application
        ↓
Tenant completes verification payment
        ↓
Tenant provides private credentials
        ↓
ZK proof is generated
        ↓
Midnight verifies eligibility
        ↓
Landlord receives anonymous verification result
```

The goal is not to build every feature of a traditional property-management platform.

The goal is to demonstrate one thing exceptionally well:

> **A tenant can prove rental eligibility without surrendering the sensitive data used to prove it.**

---

# Development

## Prerequisites

* Node.js 22+
* PostgreSQL
* Midnight development environment
* Midnight-compatible wallet
* Stripe test account

## Environment

Create `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres:password@localhost:5432/zkrent

AUTH_SECRET=your_auth_secret

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

MIDNIGHT_NETWORK=testnet
MIDNIGHT_NODE_URL=https://rpc.testnet.midnight.network
MIDNIGHT_PROOF_SERVER_URL=http://localhost:6300
MIDNIGHT_CONTRACT_ADDRESS=...
MIDNIGHT_SPONSOR_TREASURY_KEY=...
```

## Install

```bash
npm install
```

## Database

```bash
npx prisma generate
npx prisma migrate dev
```

## Run the application

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

# Project Structure

```text
zkrent/
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   ├── properties/
│   ├── applications/
│   └── api/
│
├── components/
│   ├── properties/
│   ├── applications/
│   ├── landlord/
│   └── tenant/
│
├── contracts/
│   └── ...
│
├── lib/
│   ├── midnight/
│   ├── stripe/
│   ├── prisma/
│   └── auth/
│
├── prisma/
│   └── schema.prisma
│
└── public/
```

---

# The Privacy Test

The most important test for ZkRent is not whether the dashboard looks good.

It is whether the system can demonstrate:

```text
Given:

Private income = $91,000
Public requirement = $75,000

↓

Generate ZK proof

↓

Midnight verifies:

$91,000 ≥ $75,000

↓

Landlord receives:

QUALIFIED

↓

Landlord does NOT receive:

$91,000
```

That is the core product.

---

# Vision

ZkRent starts with rental applications, but the underlying idea is broader.

Today:

> **Prove you qualify for a rental without revealing your income.**

Tomorrow:

> **Prove a fact about yourself without surrendering the data behind that fact.**

ZkRent is an experiment in building consumer applications around that principle.

---

## Built With

**Next.js · React · TypeScript · PostgreSQL · Prisma · Stripe · Compact · Midnight Network · Zero-Knowledge Proofs**

---

## Hackathon Focus

ZkRent was built to demonstrate a practical application of **programmable privacy**:

**Real-world problem → private data → ZK proof → independently verifiable result.**

The blockchain is not the product.

**The privacy it enables is.**
