import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { executeMidnightQualificationProof } from '@/midnight/zk';
import { z } from 'zod';

const proveRequestSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID format'),
  credentials: z.object({
    income: z.number().nonnegative('Income must be non-negative'),
    backgroundVerified: z.boolean(),
    employmentVerified: z.boolean().optional().default(true),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Only tenants can execute verification proofs' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const parsed = proveRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { applicationId, credentials } = parsed.data;

    // Retrieve application and property rules
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

    // Ensure payment has been completed before allowing proving
    if (application.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'Payment required: Please pay the verification fee before proving qualification' },
        { status: 402 }
      );
    }

    const propertyRules = {
      minIncome: application.property.minIncome,
      requireBackground: application.property.requireBackground,
      requireEmployment: application.property.requireEmployment,
    };

    // Execute zero-knowledge proof via Midnight Compact contract engine
    const proofResult = await executeMidnightQualificationProof(
      {
        annualIncome: credentials.income,
        backgroundClean: credentials.backgroundVerified,
        employmentVerified: credentials.employmentVerified,
      },
      propertyRules
    );

    // Persist verification in database
    const verification = await prisma.verification.create({
      data: {
        applicationId,
        status: 'VERIFIED',
        isEligible: proofResult.isEligible,
        proofHash: proofResult.proofHash,
        midnightTx: proofResult.midnightTxHash,
        circuitId: proofResult.circuitId,
        merkleRoot: proofResult.merkleRoot,
        blockHeight: proofResult.blockHeight,
        provingTimeMs: proofResult.provingTimeMs,
        verifiedAt: new Date(),
      },
    });

    // Update Application status
    const targetStatus = proofResult.isEligible ? 'ZK_VERIFIED' : 'ZK_REJECTED';
    const targetVerificationStatus = proofResult.isEligible ? 'VERIFIED' : 'FAILED';

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
      isEligible: proofResult.isEligible,
      mode: proofResult.mode,
      proof: {
        verified: true,
        eligible: proofResult.isEligible,
        verifiedAt: verification.verifiedAt?.toISOString() || new Date().toISOString(),
        midnightTxHash: proofResult.midnightTxHash,
        circuitId: proofResult.circuitId,
        zkProofHash: proofResult.proofHash,
        blockHeight: proofResult.blockHeight,
        merkleRoot: proofResult.merkleRoot,
        provingTimeMs: proofResult.provingTimeMs,
        contractAddress: proofResult.contractAddress,
        mode: proofResult.mode,
        requirements: {
          income: {
            required: Number(proofResult.requirements.income.required),
            satisfied: proofResult.requirements.income.satisfied,
          },
          background: {
            required: Boolean(proofResult.requirements.background.required),
            satisfied: proofResult.requirements.background.satisfied,
          },
          employment: {
            required: Boolean(proofResult.requirements.employment.required),
            satisfied: proofResult.requirements.employment.satisfied,
          },
        },
        zkMetrics: proofResult.zkMetrics,
      },
    });
  } catch (error) {
    console.error('Midnight verification proof error:', error);
    return NextResponse.json({ error: 'Failed to synthesize qualification proof' }, { status: 500 });
  }
}
