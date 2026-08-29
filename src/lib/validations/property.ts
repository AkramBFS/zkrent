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
});

export const updatePropertySchema = createPropertySchema.partial();

export const updatePropertyRequirementsSchema = z.object({
  minIncome: z.coerce.number().positive('Minimum income must be positive'),
  requireBackground: z.boolean(),
  requireEmployment: z.boolean(),
  verificationFee: z.coerce.number().min(0).default(5.0),
});
