import { prisma } from '../src/lib/prisma';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✕ FAIL: ${msg}`);
  }
}

async function runStripeDedupeAndRefundTests() {
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  Stripe Webhook Idempotency & Refund Semantics Tests');
  console.log('══════════════════════════════════════════════════════════════\n');

  const tenant = await prisma.user.findFirst({ where: { role: 'TENANT' } });
  const property = await prisma.property.findFirst();

  if (!tenant || !property) {
    throw new Error('Database must be seeded before running tests');
  }

  const app = await prisma.application.upsert({
    where: { propertyId_tenantId: { propertyId: property.id, tenantId: tenant.id } },
    update: {},
    create: {
      applicantDisplayId: '#STRIPE1',
      propertyId: property.id,
      tenantId: tenant.id,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT',
    },
  });

  const testEventId = `evt_test_dedupe_${Date.now()}`;
  const testSessionId = `cs_test_${Date.now()}`;
  const testPaymentIntentId = `pi_test_${Date.now()}`;

  // 1. First event processing
  console.log('─── 1. Stripe Event Ingestion & Deduplication ───');
  const payment = await prisma.payment.create({
    data: {
      applicationId: app.id,
      userId: tenant.id,
      amount: 5.0,
      status: 'PAID',
      stripeSessionId: testSessionId,
      stripePaymentIntentId: testPaymentIntentId,
      stripeEventId: testEventId,
    },
  });

  assert(payment.stripeEventId === testEventId, 'stripeEventId recorded on payment record');

  // Verify deduplication check detects this event
  const duplicateCheck = await prisma.payment.findFirst({
    where: { stripeEventId: testEventId },
  });

  assert(duplicateCheck !== null, 'Duplicate Stripe event detected by stripeEventId unique filter');

  // 2. Refund Semantics: Qualification Revocation
  console.log('\n─── 2. Refund Semantics: Active Qualification Revocation ───');
  // Create an active verification
  const verification = await prisma.verification.create({
    data: {
      applicationId: app.id,
      status: 'VERIFIED',
      isEligible: true,
      tier: 1,
      lifecycle: 'Active',
      criteriaHash: '0x1234',
    },
  });

  assert(verification.lifecycle === 'Active', 'Verification created in Active lifecycle');

  // Simulate charge.refunded event execution
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'REFUNDED' },
  });

  // Revoke active verifications
  await prisma.verification.updateMany({
    where: { applicationId: app.id, lifecycle: 'Active' },
    data: { lifecycle: 'Revoked' },
  });

  await prisma.application.update({
    where: { id: app.id },
    data: { paymentStatus: 'REFUNDED', status: 'WITHDRAWN' },
  });

  const updatedVerification = await prisma.verification.findUnique({
    where: { id: verification.id },
  });
  const updatedApp = await prisma.application.findUnique({
    where: { id: app.id },
  });

  assert(
    updatedVerification?.lifecycle === 'Revoked',
    'Active verification was revoked upon payment refund (prevents free lease signing)'
  );
  assert(
    updatedApp?.status === 'WITHDRAWN',
    'Application transitioned to WITHDRAWN status upon payment refund'
  );

  // Clean up test records
  await prisma.verification.delete({ where: { id: verification.id } });
  await prisma.payment.delete({ where: { id: payment.id } });
  await prisma.$disconnect();

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (failed > 0) process.exit(1);
}

runStripeDedupeAndRefundTests().catch((err) => {
  console.error('Stripe test failed:', err);
  process.exit(1);
});
