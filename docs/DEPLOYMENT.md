# ZkRent — Deployment & Operations Guide

This guide covers running ZkRent locally, deploying the Midnight smart contract to local and testnet networks, and configuring production environments.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm`
- **PostgreSQL**: Local service or Docker container (`16+`)
- **Docker & Docker Compose**: (For local Midnight devnet stack and PostgreSQL)
- **Compact Compiler**: v0.5.3 (Optional for running TypeScript runtime, required for editing `.compact`)

---

## 2. Quickstart: 3-Minute Local Setup

### Step 1: Clone & Install Dependencies
```bash
git clone <repo-url> zkrent
cd zkrent
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Key defaults in `.env.local`:
```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zkrent"
NEXTAUTH_SECRET="dev-insecure-secret-change-in-production-32chars"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_MIDNIGHT_MODE="simulation"
```

### Step 3: Database Bootstrap
Run declarative Prisma migrations and populate initial seed data:
```bash
npm run db:migrate
npm run db:seed
```

### Step 4: Run Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Running Midnight Local Devnet

To run the full Midnight infrastructure locally:

```bash
docker compose up -d
```

This starts:
- **PostgreSQL**: `localhost:5432`
- **Midnight Substrate Node**: `localhost:9944` (RPC & WebSocket)
- **Midnight Indexer**: `localhost:8088` (GraphQL at `/api/v4/graphql`)
- **Midnight Proof Server**: `localhost:6300`

### Deploy Contract to Local Devnet
```bash
npm run deploy:local
```
This deploys `contracts/qualification.compact`, records the contract address in `.env.local`, and updates `contracts/deployed.json`.

---

## 4. Deploying to Midnight Preprod Testnet

### Step 1: Preflight Verification
Confirm that Preprod testnet endpoints are reachable:
```bash
npm run deploy:dry-run
```

### Step 2: Generate & Fund Deployer Wallet
Run the preprod wallet generator script:
```bash
node node_modules/tsx/dist/cli.mjs scripts/generate-preprod-wallet.ts
```
This generates a dedicated testnet wallet address:
```
Address: mn_addr_preprod1qz6f8d074f9c1e3a5b8d2c4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0sqyvdc9
```

1. Navigate to the [Midnight Preprod Faucet](https://faucet.preprod.midnight.network).
2. Request `tNIGHT` for the generated address.
3. Use the Midnight CLI or Lace wallet to convert a portion of `tNIGHT` to `DUST` (required for shielded transaction fees).

### Step 3: Execute Deployment
```bash
npm run deploy:preprod
```
The script will deploy the contract, record the live on-chain address in `contracts/deployed.json`, and write `NEXT_PUBLIC_MIDNIGHT_CONTRACT_ADDRESS` to `.env.local`.

---

## 5. Environment Variable Reference

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `DATABASE_URL` | YES | `postgresql://...:5432/zkrent` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | YES | (random 32 bytes) | Session encryption key |
| `NEXTAUTH_URL` | YES | `http://localhost:3000` | Canonical application URL |
| `NEXT_PUBLIC_MIDNIGHT_MODE` | YES | `simulation` | Proving mode: `simulation` or `live` |
| `NEXT_PUBLIC_MIDNIGHT_CONTRACT_ADDRESS` | NO | `0x...` | Deployed Midnight qualification contract |
| `MIDNIGHT_NODE_URL` | NO | `http://127.0.0.1:9944` | Midnight Substrate Node HTTP RPC |
| `MIDNIGHT_NODE_WS_URL` | NO | `ws://127.0.0.1:9944` | Midnight Substrate Node WebSocket RPC |
| `MIDNIGHT_INDEXER_URL` | NO | `http://127.0.0.1:8088/api/v4/graphql` | Midnight GraphQL Indexer endpoint |
| `MIDNIGHT_PROOF_SERVER_URL` | NO | `http://127.0.0.1:6300` | Proof server HTTP URL |
| `STORAGE_PROVIDER` | NO | `local` | Media storage provider (`local` or `s3`) |
| `STRIPE_SECRET_KEY` | NO | `sk_test_...` | Stripe test API key (triggers simulation if unset) |
| `STRIPE_WEBHOOK_SECRET` | NO | `whsec_...` | Stripe webhook signing secret |

---

## 6. Troubleshooting

- **`HTTP 503 Proof Server Offline`**:
  - Cause: You set `NEXT_PUBLIC_MIDNIGHT_MODE="live"` but the proof server or Docker container is not running.
  - Fix: Start the proof server or set `NEXT_PUBLIC_MIDNIGHT_MODE="simulation"` in `.env.local`.
- **Database Connection Refused**:
  - Cause: PostgreSQL is not listening on the expected port.
  - Fix: Verify `DATABASE_URL` in `.env.local` matches your PostgreSQL port (e.g. `5432` or `5434`).
- **Prisma Client Drift**:
  - Run `npm run db:generate` followed by `npm run db:migrate`.
