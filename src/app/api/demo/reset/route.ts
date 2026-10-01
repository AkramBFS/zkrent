import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// In-memory rate limiting tracker (1 reset per 60 seconds)
let lastResetTimestamp = 0;

export async function POST(req: NextRequest) {
  try {
    // 1. Gating Check: Ensure demo reset is explicitly enabled in environment
    const isDemoEnabled =
      process.env.ENABLE_DEMO_RESET === 'true' ||
      process.env.NODE_ENV !== 'production';

    if (!isDemoEnabled) {
      return NextResponse.json(
        { error: 'Forbidden: Demo reset endpoint is disabled in production.' },
        { status: 403 }
      );
    }

    // 2. Rate Limiting Check: Max 1 reset per 60 seconds
    const now = Date.now();
    const elapsed = now - lastResetTimestamp;
    const cooldownMs = 60 * 1000;

    if (elapsed < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - elapsed) / 1000);
      return NextResponse.json(
        { error: `Rate limited: Please wait ${waitSeconds} seconds before resetting demo state again.` },
        { status: 429 }
      );
    }

    lastResetTimestamp = now;

    // 3. Clean and re-seed database state
    // Delete dependent records first
    await prisma.verification.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.user.deleteMany({});

    // Create Demo Users
    const passwordHash = await bcrypt.hash('password123', 10);

    const landlord = await prisma.user.create({
      data: {
        id: 'landlord-user',
        email: 'landlord@example.com',
        displayName: 'Aurelia Vance',
        passwordHash,
        role: 'LANDLORD',
      },
    });

    const tenant = await prisma.user.create({
      data: {
        id: 'tenant-user',
        email: 'tenant@example.com',
        displayName: 'Elena Rostova',
        passwordHash,
        role: 'TENANT',
      },
    });

    // Create Curated Demo Properties with Division-Free Criteria
    const prop1 = await prisma.property.create({
      data: {
        landlordId: landlord.id,
        title: 'The Solstice Penthouse',
        description: 'Ultra-luxurious corner residence with floor-to-ceiling glass and panoramic skyline vistas.',
        address: '840 Congress Ave, Penthouse B',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        type: 'Apartment',
        price: 3200,
        beds: 2,
        baths: 2.0,
        sqft: 1450,
        images: ['/images/properties/solstice-penthouse.svg'],
        minIncome: 96000,
        maxRentToIncomeRatioBps: 3300,
        minCreditScore: 680,
        requireBackground: true,
        minEmploymentMonths: 12,
        primeMinIncomeRatioBps: 2500,
        primeMinCreditScore: 750,
        verificationFee: 5.0,
        criteriaHash: 'ch_solstice_penthouse_v1',
      },
    });

    const prop2 = await prisma.property.create({
      data: {
        landlordId: landlord.id,
        title: 'Heritage Row Brownstone',
        description: 'Restored Victorian residence featuring original exposed brick and custom walnut millwork.',
        address: '142 W 11th Street',
        city: 'New York',
        state: 'NY',
        zip: '10011',
        type: 'Townhouse',
        price: 4500,
        beds: 3,
        baths: 2.5,
        sqft: 2100,
        images: ['/images/properties/heritage-brownstone.svg'],
        minIncome: 150000,
        maxRentToIncomeRatioBps: 3000,
        minCreditScore: 700,
        requireBackground: true,
        minEmploymentMonths: 24,
        primeMinIncomeRatioBps: 2200,
        primeMinCreditScore: 760,
        verificationFee: 5.0,
        criteriaHash: 'ch_heritage_brownstone_v1',
      },
    });

    // Create Initial Demo Application
    await prisma.application.create({
      data: {
        applicantDisplayId: '74F9',
        propertyId: prop1.id,
        tenantId: tenant.id,
        status: 'PAYMENT_CONFIRMED',
        paymentStatus: 'PAID',
        verificationStatus: 'PENDING',
        revealStatus: 'NONE',
      },
    });

    return NextResponse.json({
      status: 'ok',
      message: 'Demo state successfully reset to pristine seed fixtures.',
      counts: {
        properties: 2,
        users: 2,
        applications: 1,
      },
    });
  } catch (error) {
    console.error('Error during demo reset:', error);
    return NextResponse.json({ error: 'Failed to reset demo state' }, { status: 500 });
  }
}
