import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { executeMidnightQualificationProof, checkDevnetHealth } from '@/midnight/zk';
import { z } from 'zod';

const proveRequestSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID format'),
  // Preferred zero-knowledge payload: proof computed client-side, zero raw income transmitted
  proofResult: z
    .object({
      isEligible: z.boolean(),
      tier: z.number().int().min(0).max(2).optional().default(0),
      nullifier: z.string().min(10, 'Nullifier required'),
      criteriaHash: z.string().min(8, 'Criteria hash required'),
      midnightTxHash: z.string().min(10, 'Transaction hash required'),
      proofHash: z.string().min(10, 'Proof hash required'),
      circuitId: z.string().optional().default('proveQualification'),
      blockHeight: z.number().int().optional().default(1849200),
      merkleRoot: z.string().optional(),
      provingTimeMs: z.number().int().optional().default(1200),
      mode: z.enum(['live_devnet', 'sandbox_simulation']).default('sandbox_simulation'),
      requirements: z.record(z.string(), z.unknown()).optional(),
      zkMetrics: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
  // Fallback legacy payload
  credentials: z
    .object({
      income: z.number().nonnegative('Income must be non-negative'),
      backgroundVerified: z.boolean(),
      employmentVerified: z.boolean().optional().default(true),
    })
    .optional(),
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

    const { applicationId, proofResult: clientProof, credentials } = parsed.data;

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

    let finalProofResult: {
      isEligible: boolean;
      tier: number;
      nullifier: string;
      criteriaHash: string;
      midnightTxHash: string;
      proofHash: string;
      circuitId: string;
      merkleRoot: string;
      blockHeight: number;
      provingTimeMs: number;
      mode: 'live_devnet' | 'sandbox_simulation';
      requirements?: Record<string, unknown>;
      zkMetrics?: Record<string, unknown>;
    };

    if (clientProof) {
      // 1. Live Devnet Verification Check
      if (clientProof.mode === 'live_devnet') {
        const health = await checkDevnetHealth();
        if (!health.ready) {
          return NextResponse.json(
            { error: 'Live proof verification failed: Midnight devnet node or proof-server is offline' },
            { status: 503 }
          );
        }
        // In live devnet mode, check criteria hash binding
        if (application.property.criteriaHash && clientProof.criteriaHash !== application.property.criteriaHash) {
          return NextResponse.json(
            { error: 'Proof rejected: Proof criteria hash does not match current listing requirements' },
            { status: 400 }
          );
        }
      }

      // 2. Simulation Mode Checks
      if (clientProof.mode === 'sandbox_simulation') {
        if (process.env.ALLOW_SIMULATED_PROOFS === 'false') {
          return NextResponse.json(
            { error: 'Simulated proofs are disabled in this environment' },
            { status: 403 }
          );
        }
        // Ensure criteria hash is bound
        if (application.property.criteriaHash && clientProof.criteriaHash !== application.property.criteriaHash) {
          return NextResponse.json(
            { error: 'Proof rejected: Criteria hash mismatch' },
            { status: 400 }
          );
        }
      }

      finalProofResult = {
        isEligible: clientProof.isEligible,
        tier: clientProof.tier ?? 0,
        nullifier: clientProof.nullifier,
        criteriaHash: clientProof.criteriaHash,
        midnightTxHash: clientProof.midnightTxHash,
        proofHash: clientProof.proofHash,
        circuitId: clientProof.circuitId,
        merkleRoot: clientProof.merkleRoot || clientProof.proofHash,
        blockHeight: clientProof.blockHeight,
        provingTimeMs: clientProof.provingTimeMs,
        mode: clientProof.mode,
        requirements: clientProof.requirements,
        zkMetrics: clientProof.zkMetrics,
      };
    } else if (credentials) {
      // Fallback Path: Server-side proving (logs privacy warning)
      console.warn('[ZkRent-Security] Warning: Raw credentials received over HTTP for server-side proving fallback.');
      const propertyRules = {
        monthlyRent: application.property.price,
        minMonthlyIncome: Math.round(application.property.minIncome / 12),
        maxRentToIncomeRatioBps: application.property.maxRentToIncomeRatioBps,
        minCreditScore: application.property.minCreditScore,
        minEmploymentMonths: application.property.minEmploymentMonths,
        requireCleanBackground: application.property.requireBackground,
        primeMinIncomeRatioBps: application.property.primeMinIncomeRatioBps,
        primeMinCreditScore: application.property.primeMinCreditScore,
        criteriaHash: application.property.criteriaHash || undefined,
      };

      const result = await executeMidnightQualificationProof(
        {
          annualIncome: credentials.income,
          backgroundClean: credentials.backgroundVerified,
          employmentVerified: credentials.employmentVerified,
        },
        propertyRules
      );

      finalProofResult = {
        isEligible: result.isEligible,
        tier: result.tier,
        nullifier: result.nullifier,
        criteriaHash: result.criteriaHash,
        midnightTxHash: result.midnightTxHash,
        proofHash: result.proofHash,
        circuitId: result.circuitId,
        merkleRoot: result.merkleRoot,
        blockHeight: result.blockHeight,
        provingTimeMs: result.provingTimeMs,
        mode: result.mode,
        requirements: result.requirements,
        zkMetrics: result.zkMetrics as unknown as Record<string, unknown>,
      };
    } else {
      return NextResponse.json(
        { error: 'Missing proofResult or credentials in request' },
        { status: 400 }
      );
    }

    // 3. Anti-Replay: Nullifier consumption check
    const existingNullifier = await prisma.verification.findFirst({
      where: {
        nullifier: finalProofResult.nullifier,
        status: 'VERIFIED',
        lifecycle: 'Active',
        expiresAt: { gt: new Date() },
        applicationId: { not: applicationId },
      },
    });

    if (existingNullifier) {
      return NextResponse.json(
        { error: 'Proof rejected: Nullifier has already been consumed for another application (anti-replay check failed)' },
        { status: 409 }
      );
    }

    const validityPeriodMs = 30 * 24 * 3600 * 1000;
    const expiresAt = new Date(Date.now() + validityPeriodMs);

    // Persist verification in database
    const verification = await prisma.verification.create({
      data: {
        applicationId,
        status: finalProofResult.isEligible ? 'VERIFIED' : 'FAILED',
        isEligible: finalProofResult.isEligible,
        tier: finalProofResult.tier,
        nullifier: finalProofResult.nullifier,
        criteriaHash: finalProofResult.criteriaHash,
        expiresAt,
        lifecycle: finalProofResult.isEligible ? 'Active' : 'Revoked',
        proofHash: finalProofResult.proofHash,
        midnightTx: finalProofResult.midnightTxHash,
        circuitId: finalProofResult.circuitId,
        merkleRoot: finalProofResult.merkleRoot,
        blockHeight: finalProofResult.blockHeight,
        provingTimeMs: finalProofResult.provingTimeMs,
        verifiedAt: new Date(),
      },
    });

    // Update Application status
    const targetStatus = finalProofResult.isEligible ? 'ZK_VERIFIED' : 'ZK_REJECTED';
    const targetVerificationStatus = finalProofResult.isEligible ? 'VERIFIED' : 'FAILED';

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
      isEligible: finalProofResult.isEligible,
      tier: finalProofResult.tier,
      mode: finalProofResult.mode,
      proof: {
        verified: true,
        eligible: finalProofResult.isEligible,
        tier: finalProofResult.tier,
        nullifier: finalProofResult.nullifier,
        criteriaHash: finalProofResult.criteriaHash,
        verifiedAt: verification.verifiedAt?.toISOString() || new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        midnightTxHash: finalProofResult.midnightTxHash,
        circuitId: finalProofResult.circuitId,
        zkProofHash: finalProofResult.proofHash,
        blockHeight: finalProofResult.blockHeight,
        merkleRoot: finalProofResult.merkleRoot,
        mode: finalProofResult.mode,
        zkMetrics: finalProofResult.zkMetrics,
      },
    });
  } catch (error) {
    console.error('Error in proof verification API:', error);
    return NextResponse.json({ error: 'Internal server error processing proof' }, { status: 500 });
  }
}
