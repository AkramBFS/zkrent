const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/zkrent';

async function migrate() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to PostgreSQL for schema synchronization...');

  const sql = `
    -- Enums
    DO $$ BEGIN
      CREATE TYPE "UserRole" AS ENUM ('TENANT', 'LANDLORD');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'VERIFYING', 'ZK_VERIFIED', 'ZK_REJECTED', 'LEASE_OFFERED', 'WITHDRAWN');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "RevealStatus" AS ENUM ('NONE', 'REQUESTED', 'GRANTED', 'DECLINED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    -- Drop existing tables to ensure clean schema rebuild
    DROP TABLE IF EXISTS "verifications" CASCADE;
    DROP TABLE IF EXISTS "payments" CASCADE;
    DROP TABLE IF EXISTS "applications" CASCADE;
    DROP TABLE IF EXISTS "properties" CASCADE;
    DROP TABLE IF EXISTS "users" CASCADE;

    -- Create users table
    CREATE TABLE "users" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "role" "UserRole" NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "displayName" TEXT,
      "passwordHash" TEXT,
      "authProvider" TEXT,
      "authProviderId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "users_auth_unique" UNIQUE ("authProvider", "authProviderId")
    );

    -- Create properties table
    CREATE TABLE "properties" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "title" TEXT NOT NULL,
      "address" TEXT NOT NULL,
      "city" TEXT NOT NULL,
      "state" TEXT NOT NULL,
      "zip" TEXT NOT NULL,
      "price" INTEGER NOT NULL,
      "beds" INTEGER NOT NULL,
      "baths" DOUBLE PRECISION NOT NULL,
      "sqft" INTEGER NOT NULL,
      "type" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "amenities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "status" TEXT NOT NULL DEFAULT 'active',
      "minIncome" INTEGER NOT NULL DEFAULT 75000,
      "requireBackground" BOOLEAN NOT NULL DEFAULT true,
      "requireEmployment" BOOLEAN NOT NULL DEFAULT true,
      "verificationFee" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
      "landlordId" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Create applications table
    CREATE TABLE "applications" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "applicantDisplayId" TEXT NOT NULL,
      "propertyId" UUID NOT NULL REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "tenantId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
      "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
      "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
      "revealStatus" "RevealStatus" NOT NULL DEFAULT 'NONE',
      "revealRequestedAt" TIMESTAMP(3),
      "revealGrantedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "applications_property_tenant_unique" UNIQUE ("propertyId", "tenantId")
    );

    -- Create payments table
    CREATE TABLE "payments" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "applicationId" UUID NOT NULL REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "amount" DOUBLE PRECISION NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'USD',
      "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
      "stripeSessionId" TEXT UNIQUE,
      "stripePaymentIntentId" TEXT,
      "transactionId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Create verifications table
    CREATE TABLE "verifications" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "applicationId" UUID NOT NULL REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
      "isEligible" BOOLEAN NOT NULL DEFAULT false,
      "proofHash" TEXT,
      "midnightTx" TEXT,
      "circuitId" TEXT,
      "merkleRoot" TEXT,
      "blockHeight" INTEGER,
      "provingTimeMs" INTEGER,
      "verifiedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await client.query(sql);
  console.log('Schema migration executed successfully!');
  await client.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
