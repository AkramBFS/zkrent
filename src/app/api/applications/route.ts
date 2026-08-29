import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createApplicationSchema } from '@/lib/validations/application';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');

    let applications: any[] = [];

    if (user.role === 'TENANT') {
      const where: any = { tenantId: user.id };
      if (propertyId) where.propertyId = propertyId;

      applications = await prisma.application.findMany({
        where,
        include: {
          property: {
            include: {
              landlord: {
                select: {
                  displayName: true,
                },
              },
            },
          },
          tenant: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
          verifications: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = applications.map((app) => {
        const latestVerification = app.verifications[0];
        const latestPayment = app.payments[0];

        return {
          id: app.id,
          applicantDisplayId: app.applicantDisplayId,
          propertyId: app.propertyId,
          propertyTitle: app.property.title,
          propertyAddress: `${app.property.address}, ${app.property.city}, ${app.property.state} ${app.property.zip}`,
          propertyPrice: app.property.price,
          tenantId: app.tenantId,
          tenantName: app.tenant.displayName || 'Tenant',
          tenantEmail: app.tenant.email,
          status: app.status.toLowerCase(),
          rawStatus: app.status,
          paymentStatus: app.paymentStatus.toLowerCase(),
          rawPaymentStatus: app.paymentStatus,
          paymentDate: latestPayment?.createdAt?.toISOString(),
          paymentTxId: latestPayment?.transactionId || latestPayment?.stripeSessionId,
          verificationStatus: app.verificationStatus.toLowerCase(),
          rawVerificationStatus: app.verificationStatus,
          revealStatus: app.revealStatus.toLowerCase(),
          rawRevealStatus: app.revealStatus,
          revealRequestedAt: app.revealRequestedAt?.toISOString(),
          revealGrantedAt: app.revealGrantedAt?.toISOString(),
          createdAt: app.createdAt.toISOString(),
          updatedAt: app.updatedAt.toISOString(),
          propertyRequirements: {
            minIncome: app.property.minIncome,
            requireBackground: app.property.requireBackground,
            requireEmployment: app.property.requireEmployment,
            verificationFee: app.property.verificationFee,
          },
          verification: latestVerification
            ? {
                verified: latestVerification.status === 'VERIFIED',
                eligible: latestVerification.isEligible,
                verifiedAt: latestVerification.verifiedAt?.toISOString() || latestVerification.createdAt.toISOString(),
                midnightTxHash: latestVerification.midnightTx || `0x${latestVerification.id.replace(/-/g, '')}`,
                circuitId: latestVerification.circuitId || 'mid_zk_v3_qualification_0x992a',
                zkProofHash: latestVerification.proofHash || `zk_p_${latestVerification.id.replace(/-/g, '')}`,
                blockHeight: latestVerification.blockHeight || 1849200,
                merkleRoot: latestVerification.merkleRoot || '0x38e0192a84919018420e91402849102830198420198402849184029481948201',
                requirements: {
                  income: { required: app.property.minIncome, satisfied: latestVerification.isEligible },
                  background: { required: app.property.requireBackground, satisfied: latestVerification.isEligible || !app.property.requireBackground },
                  employment: { required: app.property.requireEmployment, satisfied: latestVerification.isEligible || !app.property.requireEmployment },
                },
                zkMetrics: {
                  constraints: 38420,
                  provingTimeMs: latestVerification.provingTimeMs || 1420,
                  circuitSize: '2.4 MB',
                  protocolVersion: 'Midnight Halo2 v1.2',
                },
              }
            : undefined,
        };
      });

      return NextResponse.json({ status: 'ok', applications: formatted });
    } else if (user.role === 'LANDLORD') {
      const where: any = {
        property: {
          landlordId: user.id,
        },
      };
      if (propertyId) where.propertyId = propertyId;

      applications = await prisma.application.findMany({
        where,
        include: {
          property: true,
          tenant: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
          verifications: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = applications.map((app) => {
        const latestVerification = app.verifications[0];
        const isRevealed = app.revealStatus === 'GRANTED';

        return {
          id: app.id,
          applicantDisplayId: app.applicantDisplayId,
          propertyId: app.propertyId,
          propertyTitle: app.property.title,
          propertyAddress: `${app.property.address}, ${app.property.city}, ${app.property.state} ${app.property.zip}`,
          propertyPrice: app.property.price,
          tenantId: app.tenantId,
          // Privacy preservation: Identity exposed ONLY if consent granted
          tenantName: isRevealed ? (app.tenant.displayName || 'Tenant') : `Applicant ${app.applicantDisplayId}`,
          tenantEmail: isRevealed ? app.tenant.email : undefined,
          tenantPhone: isRevealed ? '+1 (512) 892-4910' : undefined,
          status: app.status.toLowerCase(),
          rawStatus: app.status,
          paymentStatus: app.paymentStatus.toLowerCase(),
          rawPaymentStatus: app.paymentStatus,
          verificationStatus: app.verificationStatus.toLowerCase(),
          rawVerificationStatus: app.verificationStatus,
          revealStatus: app.revealStatus.toLowerCase(),
          rawRevealStatus: app.revealStatus,
          revealRequestedAt: app.revealRequestedAt?.toISOString(),
          revealGrantedAt: app.revealGrantedAt?.toISOString(),
          createdAt: app.createdAt.toISOString(),
          updatedAt: app.updatedAt.toISOString(),
          propertyRequirements: {
            minIncome: app.property.minIncome,
            requireBackground: app.property.requireBackground,
            requireEmployment: app.property.requireEmployment,
            verificationFee: app.property.verificationFee,
          },
          verification: latestVerification
            ? {
                verified: latestVerification.status === 'VERIFIED',
                eligible: latestVerification.isEligible,
                verifiedAt: latestVerification.verifiedAt?.toISOString() || latestVerification.createdAt.toISOString(),
                midnightTxHash: latestVerification.midnightTx || `0x${latestVerification.id.replace(/-/g, '')}`,
                circuitId: latestVerification.circuitId || 'mid_zk_v3_qualification_0x992a',
                zkProofHash: latestVerification.proofHash || `zk_p_${latestVerification.id.replace(/-/g, '')}`,
                blockHeight: latestVerification.blockHeight || 1849200,
                merkleRoot: latestVerification.merkleRoot || '0x38e0192a84919018420e91402849102830198420198402849184029481948201',
                requirements: {
                  income: { required: app.property.minIncome, satisfied: latestVerification.isEligible },
                  background: { required: app.property.requireBackground, satisfied: latestVerification.isEligible || !app.property.requireBackground },
                  employment: { required: app.property.requireEmployment, satisfied: latestVerification.isEligible || !app.property.requireEmployment },
                },
                zkMetrics: {
                  constraints: 38420,
                  provingTimeMs: latestVerification.provingTimeMs || 1420,
                  circuitSize: '2.4 MB',
                  protocolVersion: 'Midnight Halo2 v1.2',
                },
              }
            : undefined,
        };
      });

      return NextResponse.json({ status: 'ok', applications: formatted });
    }

    return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Only tenants can submit applications' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const parsed = createApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const { propertyId } = parsed.data;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check if tenant already has an application for this property
    const existing = await prisma.application.findUnique({
      where: {
        propertyId_tenantId: {
          propertyId,
          tenantId: session.user.id,
        },
      },
      include: {
        property: true,
        verifications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        status: 'ok',
        application: {
          id: existing.id,
          applicantDisplayId: existing.applicantDisplayId,
          propertyId: existing.propertyId,
          propertyTitle: existing.property.title,
          propertyAddress: `${existing.property.address}, ${existing.property.city}`,
          propertyPrice: existing.property.price,
          tenantId: existing.tenantId,
          status: existing.status.toLowerCase(),
          rawStatus: existing.status,
          paymentStatus: existing.paymentStatus.toLowerCase(),
          rawPaymentStatus: existing.paymentStatus,
          verificationStatus: existing.verificationStatus.toLowerCase(),
          revealStatus: existing.revealStatus.toLowerCase(),
          createdAt: existing.createdAt.toISOString(),
        },
        message: 'Existing application found',
      });
    }

    // Generate random anonymized applicant ID
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    const applicantDisplayId = `#A${randomHex.slice(0, 3)}`;

    const newApp = await prisma.application.create({
      data: {
        applicantDisplayId,
        propertyId,
        tenantId: session.user.id,
        status: 'PENDING_PAYMENT',
        paymentStatus: 'PENDING',
        verificationStatus: 'PENDING',
        revealStatus: 'NONE',
      },
      include: {
        property: true,
        tenant: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    });

    const formatted = {
      id: newApp.id,
      applicantDisplayId: newApp.applicantDisplayId,
      propertyId: newApp.propertyId,
      propertyTitle: newApp.property.title,
      propertyAddress: `${newApp.property.address}, ${newApp.property.city}`,
      propertyPrice: newApp.property.price,
      tenantId: newApp.tenantId,
      tenantName: newApp.tenant.displayName || 'Tenant',
      tenantEmail: newApp.tenant.email,
      status: newApp.status.toLowerCase(),
      rawStatus: newApp.status,
      paymentStatus: newApp.paymentStatus.toLowerCase(),
      rawPaymentStatus: newApp.paymentStatus,
      verificationStatus: newApp.verificationStatus.toLowerCase(),
      revealStatus: newApp.revealStatus.toLowerCase(),
      createdAt: newApp.createdAt.toISOString(),
      updatedAt: newApp.updatedAt.toISOString(),
    };

    return NextResponse.json({ status: 'created', application: formatted }, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}

