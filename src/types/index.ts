export type PropertyType = 'Apartment' | 'Condo' | 'House' | 'Townhouse' | 'Studio';

export interface PropertyRequirements {
  minIncome: number; // e.g. 75000
  requireBackground: boolean;
  requireEmployment: boolean;
  verificationFee: number; // e.g. 5.00
}

export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number; // Monthly rent
  beds: number;
  baths: number;
  sqft: number;
  type: PropertyType;
  description: string;
  images: string[];
  amenities: string[];
  landlordId: string;
  landlordName: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  requirements: PropertyRequirements;
}

export interface RequirementVerificationResult {
  required: boolean | number;
  satisfied: boolean;
  type: 'income' | 'background' | 'employment';
  label: string;
}

export interface ZkProofDetails {
  verified: boolean;
  eligible: boolean;
  verifiedAt: string;
  midnightTxHash: string;
  circuitId: string;
  zkProofHash: string;
  blockHeight: number;
  merkleRoot: string;
  requirements: {
    income: { required: number; satisfied: boolean };
    background: { required: boolean; satisfied: boolean };
    employment: { required: boolean; satisfied: boolean };
  };
  zkMetrics: {
    constraints: number;
    provingTimeMs: number;
    circuitSize: string;
    protocolVersion: string;
  };
}

export type ApplicationStatus =
  | 'pending_payment'
  | 'pending_verification'
  | 'verified_eligible'
  | 'verified_ineligible'
  | 'under_review'
  | 'lease_offered'
  | 'rejected';

export type RevealStatus = 'none' | 'requested' | 'granted' | 'declined';

export interface Application {
  id: string;
  applicantDisplayId: string; // e.g. #A81F
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyPrice: number;
  tenantId: string;
  // Revealed ONLY after tenant grants explicit consent
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  status: ApplicationStatus;
  paymentStatus: 'unpaid' | 'paid';
  paymentDate?: string;
  paymentTxId?: string;
  createdAt: string;
  updatedAt: string;
  verification?: ZkProofDetails;
  revealStatus: RevealStatus;
  revealRequestedAt?: string;
  revealGrantedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'tenant' | 'landlord';
  walletConnected: boolean;
  midnightAddress?: string;
  createdAt: string;
}
