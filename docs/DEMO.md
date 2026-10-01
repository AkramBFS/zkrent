# ZkRent — Evaluator Demo Guide & Scripted Walkthrough

This guide provides a rapid 2-minute walkthrough designed for hackathon judges, technical evaluators, and reviewers.

---

## 1. Demo Personas & Pre-Seeded Accounts

The database comes pre-seeded with two primary demo personas:

| Persona | Role | Email | Password | Context |
| :--- | :--- | :--- | :--- | :--- |
| **Alex Rivera** | Tenant | `tenant@zkrent.dev` | `demo123` | High-earning software engineer applying for luxury apartments |
| **Marcus Vance** | Landlord | `landlord@zkrent.dev` | `demo123` | Property manager managing luxury listings with ZK criteria |

> **Tip**: You can use the **1-Click Demo Login** buttons on `/login` to switch between personas instantly without typing passwords.

---

## 2. 2-Minute Scripted Walkthrough

### Part 1: Landlord Sets ZK Listing Criteria (30 Seconds)
1. Navigate to `/login` and click **"Demo Landlord"**.
2. Click **"Properties"** $\to$ select **"The Pacific Penthouse"** $\to$ click **"Requirements"**.
3. Point out the **Interactive Criteria Sliders**:
   - Monthly Rent: \$4,800
   - Max Rent-to-Income Ratio: 33% (requires gross annual income $\ge \$174,545$)
   - Prime Tier Threshold: 25% rent-to-income and $\ge 750$ credit score
   - Clean Background: Required
4. Note the **Canonical Criteria Hash**: Every change automatically updates the 12-field criteria hash anchored on-chain.

### Part 2: Tenant Applies with Zero-Knowledge Proof (45 Seconds)
1. Log out or open an Incognito window $\to$ click **"Demo Tenant"** at `/login`.
2. Navigate to `/properties` and select **"The Pacific Penthouse"**.
3. Click **"Apply with Midnight Proof"**.
4. Pay the \$5.00 verification fee (one-click demo payment).
5. On the **ZK Prover Screen** (`/verify`):
   - Drop in the sample pay stub or use the pre-filled financial inputs (\$185,000 salary, clean background, 780 credit score).
   - Point out: **Files are parsed locally in the browser via Tesseract.js WebAssembly. Zero financial records touch the server.**
6. Click **"Generate Zero-Knowledge Proof"**.
7. Watch the synthesis animation:
   - Evaluates pure arithmetic circuits in zero-knowledge.
   - Emits a stamped **ELIGIBLE** seal and awards **Prime Tier (1)**!
8. Click **"View Cryptographic Receipt"**:
   - Point out the anti-replay nullifier and criteria hash matching the listing.

### Part 3: Landlord Reviews Anonymized Inquiries (30 Seconds)
1. Switch back to **"Demo Landlord"**.
2. Navigate to `/landlord/applications`.
3. Open the newly submitted application:
   - Notice: The applicant appears only as **"Applicant 8492"** (Legal name, email, and phone are hidden).
   - The landlord sees: **Qualified · Prime Tier · Criteria Hash Match**.
   - Expand the **"Verify Receipt"** panel: Verifiable cryptographic evidence without data custody liability!
4. Click **"Request Identity Reveal"** to proceed toward a lease.

### Part 4: Tenant Consent & Lease Execution (15 Seconds)
1. Switch back to **"Demo Tenant"** $\to$ navigate to `/tenant/applications`.
2. Notice the **Selective Disclosure Consent Modal**:
   - Previews the exact contact information that will be shared (Name, Email, Phone).
3. Click **"Authorize Reveal"**.
4. Landlord view instantly unlocks contact details. Landlord clicks **"Execute Lease"**, which calls the `consumeQualification` circuit, safely marking the on-chain qualification record as **CONSUMED**!

---

## 3. Resetting Demo State

To reset the database and return all applications, notifications, and properties to a clean initial state:

```bash
npm run db:seed
```

Or trigger the in-app reset via `POST /api/demo/reset` from the application footer.
