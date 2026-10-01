import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  executeMidnightQualificationProof,
  checkDevnetHealth,
  computeListingCriteriaHash,
  queryOnChainApplicationRecord,
  DEFAULT_CONFIG,
} from '@/midnight/zk';
import {
  assertApplicationTransition,
  assertVerificationTransition,
  InvalidStateTransitionError,
  type ApplicationStatus,
  type VerificationStatus,
} from '@/lib/lifecycle';
import { applyRateLimit } from '@/lib/rate-limit';
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
      tenantCommitment: z.string().min(10, 'Tenant commitment required').optional(),
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
  const rateLimitResponse = applyRateLimit(req, { limit: 10, windowMs: 60000, prefix: 'prove' });
  if (rateLimitResponse) return rateLimitResponse;

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

    // Calculate expected criteria hash from listing parameters
    const expectedCriteriaHash = application.property.criteriaHash || computeListingCriteriaHash(
      application.property.id,
      {
        monthlyRent: application.property.price,
        minMonthlyIncome: Math.round(application.property.minIncome / 12),
        maxRentToIncomeRatioBps: application.property.maxRentToIncomeRatioBps,
        minCreditScore: application.property.minCreditScore,
        minEmploymentMonths: application.property.minEmploymentMonths,
        requireCleanBackground: application.property.requireBackground,
        primeMaxRentToIncomeRatioBps: application.property.primeMaxRentToIncomeRatioBps,
        primeMinCreditScore: application.property.primeMinCreditScore,
        criteriaVersion: application.property.criteriaVersion,
      }
    );

    let finalProofResult: {
      isEligible: boolean;
      tier: number;
      nullifier: string;
      criteriaHash: string;
      tenantCommitment: string;
      midnightTxHash: string;
      proofHash: string;
      circuitId: string;
      merkleRoot: string;
      blockHeight: number;
      provingTimeMs: number;
      mode: 'live_devnet' | 'sandbox_simulation';
      isSimulation: boolean;
      requirements?: Record<string, unknown>;
      zkMetrics?: Record<string, unknown>;
    };

    if (clientProof) {
      const isSimulation = clientProof.mode === 'sandbox_simulation';

      // 1. Strict Criteria Hash Verification (Anti-Forgery)
      if (clientProof.criteriaHash !== expectedCriteriaHash) {
        return NextResponse.json(
          {
            error: 'Proof rejected: Criteria hash mismatch. The proof was generated against outdated or forged listing rules.',
            expected: expectedCriteriaHash,
            received: clientProof.criteriaHash,
          },
          { status: 400 }
        );
      }

      // 2. Validate Tenant Commitment format
      const tenantCommitment = clientProof.tenantCommitment || `tc_${createHash('sha256').update(application.id).digest('hex').slice(0, 32)}`;

      // 3. Live Devnet Mode Checks
      if (clientProof.mode === 'live_devnet') {
        const health = await checkDevnetHealth();
        if (!health.ready) {
          // Hard rule: No silent fallback to simulation when live mode is requested
          return NextResponse.json(
            {
              error: 'Live proof verification failed: Midnight devnet node or proof-server is offline. Cannot verify on-chain evidence.',
              proofServerOnline: health.proofServer,
              nodeOnline: health.node,
            },
            { status: 503 }
          );
        }

        // Live devnet indexer query check
        const onChainRecord = await queryOnChainApplicationRecord(
          DEFAULT_CONFIG.contractAddress,
          application.id
        );

        if (onChainRecord && onChainRecord.found) {
          if (onChainRecord.tenantCommitment && onChainRecord.tenantCommitment !== tenantCommitment) {
            return NextResponse.json(
              { error: 'Proof rejected: On-chain tenant commitment does not match submitted proof (anti-squatting violation)' },
              { status: 400 }
            );
          }
          if (onChainRecord.tier !== undefined && onChainRecord.tier !== clientProof.tier) {
            return NextResponse.json(
              { error: 'Proof rejected: Client asserted tier does not match on-chain verified tier' },
              { status: 400 }
            );
          }
        }
      }

      // 4. Simulation Mode Checks
      if (clientProof.mode === 'sandbox_simulation') {
        if (process.env.ALLOW_SIMULATED_PROOFS === 'false') {
          return NextResponse.json(
            { error: 'Simulated proofs are disabled in this environment' },
            { status: 403 }
          );
        }
      }

      finalProofResult = {
        isEligible: clientProof.isEligible,
        tier: clientProof.tier ?? 0,
        nullifier: clientProof.nullifier,
        criteriaHash: clientProof.criteriaHash,
        tenantCommitment,
        midnightTxHash: clientProof.midnightTxHash,
        proofHash: clientProof.proofHash,
        circuitId: clientProof.circuitId,
        merkleRoot: clientProof.merkleRoot || clientProof.proofHash,
        blockHeight: clientProof.blockHeight,
        provingTimeMs: clientProof.provingTimeMs,
        mode: clientProof.mode,
        isSimulation,
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
        primeMaxRentToIncomeRatioBps: application.property.primeMaxRentToIncomeRatioBps,
        primeMinCreditScore: application.property.primeMinCreditScore,
        criteriaHash: expectedCriteriaHash,
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
        tenantCommitment: `tc_${createHash('sha256').update(application.id).digest('hex').slice(0, 32)}`,
        midnightTxHash: result.midnightTxHash,
        proofHash: result.proofHash,
        circuitId: result.circuitId,
        merkleRoot: result.merkleRoot,
        blockHeight: result.blockHeight,
        provingTimeMs: result.provingTimeMs,
        mode: result.mode,
        isSimulation: result.mode === 'sandbox_simulation',
        requirements: result.requirements,
        zkMetrics: result.zkMetrics as unknown as Record<string, unknown>,
      };
    } else {
      return NextResponse.json(
        { error: 'Missing proofResult or credentials in request' },
        { status: 400 }
      );
    }

    // 5. Anti-Replay: Nullifier consumption check
    const existingNullifier = await prisma.verification.findFirst({
      where: {
        nullifier: finalProofResult.nullifier,
        status: { in: ['VERIFIED', 'SIMULATED'] },
        lifecycle: 'Active',
        expiresAt: { gt: new Date() },
        applicationId: { not: applicationId },
      },
    });

    if (existingNullifier) {
      return NextResponse.json(
        { error: 'Proof rejected: Nullifier has already been registered for an active application (anti-replay check failed)' },
        { status: 409 }
      );
    }

    const validityPeriodMs = 30 * 24 * 3600 * 1000;
    const expiresAt = new Date(Date.now() + validityPeriodMs);

    // State Machine Target Status Determination
    const targetStatus = finalProofResult.isEligible ? 'ZK_VERIFIED' : 'ZK_REJECTED';
    const targetVerificationStatus = finalProofResult.isEligible
      ? (finalProofResult.isSimulation ? 'SIMULATED' : 'VERIFIED')
      : 'FAILED';

    // Validate state transitions with canonical state machine
    try {
      assertApplicationTransition(application.status as ApplicationStatus, targetStatus as ApplicationStatus);
      assertVerificationTransition(
        application.verificationStatus as VerificationStatus,
        targetVerificationStatus as VerificationStatus
      );
    } catch (err) {
      if (err instanceof InvalidStateTransitionError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    // Persist verification in database
    const verification = await prisma.verification.create({
      data: {
        applicationId,
        status: targetVerificationStatus,
        isEligible: finalProofResult.isEligible,
        isSimulation: finalProofResult.isSimulation,
        tenantCommitment: finalProofResult.tenantCommitment,
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
    const updatedApp = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: targetStatus,
        verificationStatus: targetVerificationStatus,
        isSimulation: finalProofResult.isSimulation,
      },
    });

    // Create DB-backed notification for the landlord
    try {
      await prisma.notification.create({
        data: {
          userId: application.property.landlordId,
          title: 'New Qualification Verified',
          message: `Applicant verified qualification for "${application.property.title}" (${
            finalProofResult.isSimulation ? 'Simulated Sandbox' : 'On-Chain Midnight Proof'
          }, Tier: ${finalProofResult.tier === 1 ? 'Prime' : 'Standard'}).`,
          type: 'SUCCESS',
          link: `/properties/${application.propertyId}/applications`,
        },
      });
    } catch (notifyErr) {
      console.warn('Failed to dispatch landlord notification:', notifyErr);
    }

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
