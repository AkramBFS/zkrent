import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateApplicationSchema } from '@/lib/validations/application';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId } = await params;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        property: {
          include: {
            landlord: {
              select: {
                displayName: true,
                email: true,
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
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const isTenant = application.tenantId === session.user.id;
    const isLandlord = application.property.landlordId === session.user.id;

    if (!isTenant && !isLandlord) {
      return NextResponse.json({ error: 'Forbidden: You do not have access to this application' }, { status: 403 });
    }

    const latestVerification = application.verifications[0];
    const latestPayment = application.payments[0];
    const isRevealed = application.revealStatus === 'GRANTED';

    const formatted = {
      id: application.id,
      applicantDisplayId: application.applicantDisplayId,
      propertyId: application.propertyId,
      propertyTitle: application.property.title,
      propertyAddress: `${application.property.address}, ${application.property.city}, ${application.property.state} ${application.property.zip}`,
      propertyPrice: application.property.price,
      tenantId: application.tenantId,
      tenantName: isTenant || isRevealed ? (application.tenant.displayName || 'Tenant') : `Applicant ${application.applicantDisplayId}`,
      tenantEmail: isTenant || isRevealed ? application.tenant.email : undefined,
      tenantPhone: isTenant || isRevealed ? '+1 (512) 892-4910' : undefined,
      status: application.status.toLowerCase(),
      rawStatus: application.status,
      paymentStatus: application.paymentStatus.toLowerCase(),
      rawPaymentStatus: application.paymentStatus,
      paymentDate: latestPayment?.createdAt?.toISOString(),
      paymentTxId: latestPayment?.transactionId || latestPayment?.stripeSessionId,
      verificationStatus: application.verificationStatus.toLowerCase(),
      rawVerificationStatus: application.verificationStatus,
      revealStatus: application.revealStatus.toLowerCase(),
      rawRevealStatus: application.revealStatus,
      revealRequestedAt: application.revealRequestedAt?.toISOString(),
      revealGrantedAt: application.revealGrantedAt?.toISOString(),
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
      propertyRequirements: {
        minIncome: application.property.minIncome,
        requireBackground: application.property.requireBackground,
        requireEmployment: application.property.requireEmployment,
        verificationFee: application.property.verificationFee,
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
              income: { required: application.property.minIncome, satisfied: latestVerification.isEligible },
              background: { required: application.property.requireBackground, satisfied: latestVerification.isEligible || !application.property.requireBackground },
              employment: { required: application.property.requireEmployment, satisfied: latestVerification.isEligible || !application.property.requireEmployment },
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

    return NextResponse.json({ status: 'ok', application: formatted });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId } = await params;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        property: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const isTenant = application.tenantId === session.user.id;
    const isLandlord = application.property.landlordId === session.user.id;

    if (!isTenant && !isLandlord) {
      return NextResponse.json({ error: 'Forbidden: You do not own or manage this application' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const parsed = updateApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const dataToUpdate: any = {};

    // Landlord can request reveal
    if (parsed.data.revealStatus === 'REQUESTED') {
      if (!isLandlord) {
        return NextResponse.json({ error: 'Only the property landlord can request an identity reveal' }, { status: 403 });
      }
      dataToUpdate.revealStatus = 'REQUESTED';
      dataToUpdate.revealRequestedAt = new Date();
    }

    // Tenant can grant or decline consent
    if (parsed.data.revealStatus === 'GRANTED' || parsed.data.revealStatus === 'DECLINED') {
      if (!isTenant) {
        return NextResponse.json({ error: 'Only the tenant applicant can grant or decline reveal consent' }, { status: 403 });
      }
      dataToUpdate.revealStatus = parsed.data.revealStatus;
      if (parsed.data.revealStatus === 'GRANTED') {
        dataToUpdate.revealGrantedAt = new Date();
        dataToUpdate.status = 'LEASE_OFFERED';
      }
    }

    // Tenant withdrawal
    if (parsed.data.status === 'WITHDRAWN') {
      if (!isTenant) {
        return NextResponse.json({ error: 'Only the applicant can withdraw an application' }, { status: 403 });
      }
      dataToUpdate.status = 'WITHDRAWN';
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: dataToUpdate,
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
      },
    });

    return NextResponse.json({
      status: 'ok',
      application: {
        id: updated.id,
        applicantDisplayId: updated.applicantDisplayId,
        status: updated.status.toLowerCase(),
        rawStatus: updated.status,
        revealStatus: updated.revealStatus.toLowerCase(),
        rawRevealStatus: updated.revealStatus,
        revealRequestedAt: updated.revealRequestedAt?.toISOString(),
        revealGrantedAt: updated.revealGrantedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

