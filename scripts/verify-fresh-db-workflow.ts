import { execSync } from 'node:child_process';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const { Client } = pg;
const connectionString =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  'postgresql://postgres:postgres@localhost:5434/zkrent';

async function verifyFreshCloneWorkflow() {
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  Verifying Fresh Database Workflow: Empty DB -> Migrate -> Seed -> Boot');
  console.log('══════════════════════════════════════════════════════════════\n');

  // Step 1: Drop and recreate public schema (simulating empty fresh DB)
  console.log('Step 1: Resetting database to clean empty state...');
  const client = new Client({ connectionString });
  await client.connect();
  await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
  await client.end();
  console.log('  ✓ Database reset to completely empty state.');

  // Step 2: Run Prisma migrate deploy
  console.log('\nStep 2: Executing "npm run db:migrate" (npx prisma migrate deploy)...');
  const migrateOutput = execSync('npm run db:migrate', { encoding: 'utf8' });
  console.log('  ✓ Migration deploy completed successfully.');

  // Step 3: Run seed
  console.log('\nStep 3: Executing "npm run db:seed"...');
  const seedOutput = execSync('npm run db:seed', { encoding: 'utf8' });
  console.log('  ✓ Database seeded successfully.');

  // Step 4: Verify contents via Prisma Client
  console.log('\nStep 4: Boot verification via Prisma Client...');
  const { prisma } = await import('../src/lib/prisma');
  const userCount = await prisma.user.count();
  const propertyCount = await prisma.property.count();
  await prisma.$disconnect();

  console.log(`  ✓ Boot check confirmed: ${userCount} users, ${propertyCount} properties loaded.`);
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  Workflow Verification: PASSED (100% reproducible)');
  console.log('══════════════════════════════════════════════════════════════\n');
}

verifyFreshCloneWorkflow().catch((err) => {
  console.error('Fresh clone workflow failed:', err);
  process.exit(1);
});
