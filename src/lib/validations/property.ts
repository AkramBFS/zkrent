import { z } from 'zod';

export const createPropertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(3, 'Zip is required'),
  price: z.coerce.number().positive('Monthly price must be positive'),
  beds: z.coerce.number().int().min(0, 'Beds must be non-negative'),
  baths: z.coerce.number().min(0, 'Baths must be non-negative'),
  sqft: z.coerce.number().int().positive('Square footage must be positive'),
  type: z.string().min(1, 'Property type is required'),
  description: z.string().min(5, 'Description is required'),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  status: z.string().default('active'),
  minIncome: z.coerce.number().positive('Minimum income must be positive').default(75000),
  requireBackground: z.boolean().default(true),
  requireEmployment: z.boolean().default(true),
  verificationFee: z.coerce.number().min(0).default(5.0),
  maxRentToIncomeRatioBps: z.coerce.number().int().min(1000).max(6000).default(3300),
  minCreditScore: z.coerce.number().int().min(300).max(850).default(650),
  minEmploymentMonths: z.coerce.number().int().min(0).max(120).default(12),
  primeMinIncomeRatioBps: z.coerce.number().int().min(1000).max(5000).default(2500),
  primeMinCreditScore: z.coerce.number().int().min(300).max(850).default(750),
});

export const updatePropertySchema = createPropertySchema.partial();

export const updatePropertyRequirementsSchema = z.object({
  minIncome: z.coerce.number().positive('Minimum income must be positive'),
  requireBackground: z.boolean(),
  requireEmployment: z.boolean(),
  verificationFee: z.coerce.number().min(0).default(5.0),
  maxRentToIncomeRatioBps: z.coerce.number().int().min(1000).max(6000).optional().default(3300),
  minCreditScore: z.coerce.number().int().min(300).max(850).optional().default(650),
  minEmploymentMonths: z.coerce.number().int().min(0).max(120).optional().default(12),
  primeMinIncomeRatioBps: z.coerce.number().int().min(1000).max(5000).optional().default(2500),
  primeMinCreditScore: z.coerce.number().int().min(300).max(850).optional().default(750),
});
