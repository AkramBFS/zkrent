import { z } from 'zod';

export const submitVerificationSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID'),
  isEligible: z.boolean(),
  proofHash: z.string().min(1, 'Proof hash is required'),
  midnightTx: z.string().optional(),
  circuitId: z.string().optional(),
  merkleRoot: z.string().optional(),
  blockHeight: z.number().int().optional(),
  provingTimeMs: z.number().int().optional(),
});
