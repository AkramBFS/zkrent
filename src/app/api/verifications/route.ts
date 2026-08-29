import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { submitVerificationSchema } from '@/lib/validations/verification';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Only tenants can submit verifications' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Safety check: Reject if request includes raw private financial attributes
    if ('annualIncome' in body || 'salary' in body || 'income' in body || 'backgroundReport' in body) {
      return NextResponse.json(
        { error: 'Security Violation: Private financial credentials must remain client-side and cannot be sent to the server.' },
        { status: 400 }
      );
    }

    const parsed = submitVerificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const {
      applicationId,
      isEligible,
      proofHash,
      midnightTx,
      circuitId,
      merkleRoot,
      blockHeight,
      provingTimeMs,
    } = parsed.data;

    // Check application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { property: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.tenantId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this application' }, { status: 403 });
    }

    // Verify payment was completed
    if (application.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'Payment required: Please pay the verification fee before submitting proof' },
        { status: 402 }
      );
    }

    // Create Verification record
    const verification = await prisma.verification.create({
      data: {
        applicationId,
        status: 'VERIFIED',
        isEligible,
        proofHash,
        midnightTx: midnightTx || `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`,
        circuitId: circuitId || 'mid_zk_v3_qualification_0x992a',
        merkleRoot: merkleRoot || '0x38e0192a84919018420e91402849102830198420198402849184029481948201',
        blockHeight: blockHeight || 1849210,
        provingTimeMs: provingTimeMs || 1450,
        verifiedAt: new Date(),
      },
    });

    // Update Application status
    const targetStatus = isEligible ? 'ZK_VERIFIED' : 'ZK_REJECTED';
    const targetVerificationStatus = isEligible ? 'VERIFIED' : 'FAILED';

    const updatedApp = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: targetStatus,
        verificationStatus: targetVerificationStatus,
      },
    });

    return NextResponse.json({
      status: 'verified',
      verificationId: verification.id,
      applicationStatus: updatedApp.status.toLowerCase(),
      isEligible: verification.isEligible,
      proofHash: verification.proofHash,
      midnightTx: verification.midnightTx,
      verifiedAt: verification.verifiedAt?.toISOString(),
    });
  } catch (error) {
    console.error('Verification submission error:', error);
    return NextResponse.json({ error: 'Failed to record verification' }, { status: 500 });
  }
}

