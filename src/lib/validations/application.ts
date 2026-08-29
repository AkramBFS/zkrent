import { z } from 'zod';

export const createApplicationSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
});

export const updateApplicationSchema = z.object({
  status: z
    .enum([
      'PENDING_PAYMENT',
      'PAYMENT_CONFIRMED',
      'VERIFYING',
      'ZK_VERIFIED',
      'ZK_REJECTED',
      'LEASE_OFFERED',
      'WITHDRAWN',
    ])
    .optional(),
  revealStatus: z.enum(['NONE', 'REQUESTED', 'GRANTED', 'DECLINED']).optional(),
});
