'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, Application, UserProfile, ZkProofDetails, PropertyRequirements } from '@/types';

interface ZkRentContextType {
  properties: Property[];
  applications: Application[];
  currentUser: UserProfile;
  activeRole: 'tenant' | 'landlord';
  setActiveRole: (role: 'tenant' | 'landlord') => void;
  getProperty: (id: string) => Property | undefined;
  getApplication: (id: string) => Application | undefined;
  addProperty: (prop: Omit<Property, 'id' | 'createdAt' | 'landlordId' | 'landlordName'>) => Property;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  updatePropertyRequirements: (id: string, requirements: PropertyRequirements) => void;
  createApplication: (propertyId: string) => Application;
  payApplicationFee: (applicationId: string) => Application;
  submitVerificationProof: (
    applicationId: string,
    credentials: {
      income: number;
      backgroundVerified: boolean;
      employmentVerified: boolean;
    }
  ) => { application: Application; isEligible: boolean; proof: ZkProofDetails };
  requestReveal: (applicationId: string) => void;
  grantRevealConsent: (applicationId: string) => void;
  declineRevealConsent: (applicationId: string) => void;
  resetDemoData: () => void;
}

const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'The Ashton Highrise #14B',
    address: '101 Colorado St, Unit 14B',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    price: 2400,
    beds: 2,
    baths: 2,
    sqft: 1150,
    type: 'Apartment',
    description:
      'Stunning 14th floor corner residence featuring floor-to-ceiling glass, Italian kitchen cabinetry with quartz waterfall island, engineered hardwood flooring, and panoramic skyline views over Lady Bird Lake.',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'Concierge & 24/7 Security',
      'Infinity Edge Sky Pool',
      'Midnight ZK Application Ready',
      'Reserved EV Parking',
      'Fitness & Wellness Center',
      'Pet Spa & Run',
    ],
    landlordId: 'landlord-1',
    landlordName: 'Highline Property Management',
    status: 'active',
    createdAt: '2026-08-15T10:00:00Z',
    requirements: {
      minIncome: 75000,
      requireBackground: true,
      requireEmployment: true,
      verificationFee: 5.0,
    },
  },
  {
    id: 'prop-2',
    title: 'Rainey St Modern Loft',
    address: '70 Rainey St, Suite 804',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    price: 3100,
    beds: 2,
    baths: 2.5,
    sqft: 1320,
    type: 'Condo',
    description:
      'Boutique architectural loft in the heart of the Rainey Historic District. Custom architectural steel accents, Miele appliances, private balcony, and smart home lighting controls.',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'Private Terrace',
      'Smart Thermostat & Keyless Entry',
      'Rooftop Clubhouse',
      'Bicycle Storage & Workshop',
      'Fiber Internet Ready',
    ],
    landlordId: 'landlord-1',
    landlordName: 'Highline Property Management',
    status: 'active',
    createdAt: '2026-08-18T14:30:00Z',
    requirements: {
      minIncome: 95000,
      requireBackground: true,
      requireEmployment: true,
      verificationFee: 5.0,
    },
  },
  {
    id: 'prop-3',
    title: 'South Congress Brownstone Flat',
    address: '1600 S Congress Ave, #3',
    city: 'Austin',
    state: 'TX',
    zip: '78704',
    price: 1850,
    beds: 1,
    baths: 1,
    sqft: 780,
    type: 'Apartment',
    description:
      'Charming sunlit flat on iconic South Congress. Exposed brick walls, reclaimed heart pine floors, subway tile bath, and walking distance to cafes, galleries, and live music venues.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502005229762-ee152da915ba?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'In-unit Washer & Dryer',
      'Courtyard Garden',
      'High Ceilings',
      'Google Fiber',
      'Off-street Parking',
    ],
    landlordId: 'landlord-2',
    landlordName: 'Capital City Properties',
    status: 'active',
    createdAt: '2026-08-20T09:15:00Z',
    requirements: {
      minIncome: 58000,
      requireBackground: true,
      requireEmployment: false,
      verificationFee: 5.0,
    },
  },
  {
    id: 'prop-4',
    title: 'Lavaca Executive Studio',
    address: '1100 Lavaca St, Unit 402',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    price: 1550,
    beds: 0,
    baths: 1,
    sqft: 550,
    type: 'Studio',
    description:
      'Efficient luxury studio near the Capitol complex. Built-in Murphy bed system, chef kitchen with induction cooktop, oversized walk-in closet, and quiet courtyard facing view.',
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'Built-in Storage Systems',
      'Rooftop Lounge',
      'Coworking Space',
      'Secure Package Locker',
    ],
    landlordId: 'landlord-2',
    landlordName: 'Capital City Properties',
    status: 'active',
    createdAt: '2026-08-22T16:00:00Z',
    requirements: {
      minIncome: 50000,
      requireBackground: true,
      requireEmployment: true,
      verificationFee: 5.0,
    },
  },
  {
    id: 'prop-5',
    title: 'Zilker Park Contemporary Flat',
    address: '2200 Barton Springs Rd, Apt 210',
    city: 'Austin',
    state: 'TX',
    zip: '78704',
    price: 2800,
    beds: 2,
    baths: 2,
    sqft: 1200,
    type: 'Apartment',
    description:
      'Live seconds from Barton Springs pool and Zilker Park. Modern open-concept floor plan, private patio overlooking greenbelt, gas cooking, and spa-grade soaking tub.',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'Direct Trail Access',
      'Kayaking Storage',
      'Resort Pool',
      'Outdoor Kitchen & Firepit',
    ],
    landlordId: 'landlord-1',
    landlordName: 'Highline Property Management',
    status: 'active',
    createdAt: '2026-08-24T11:20:00Z',
    requirements: {
      minIncome: 84000,
      requireBackground: true,
      requireEmployment: true,
      verificationFee: 5.0,
    },
  },
  {
    id: 'prop-6',
    title: 'Clarksville Historic Craftsman',
    address: '1405 W 10th St',
    city: 'Austin',
    state: 'TX',
    zip: '78703',
    price: 4200,
    beds: 3,
    baths: 2.5,
    sqft: 2100,
    type: 'House',
    description:
      'Impeccably restored 1920s craftsman home with wraparound porch, mature pecan trees, detached studio/office space, and modern commercial-grade Viking kitchen.',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'Fenced Private Yard',
      'Detached Studio/Office',
      'Wine Cellar',
      'Gas Fireplace',
      '2-Car Garage',
    ],
    landlordId: 'landlord-1',
    landlordName: 'Highline Property Management',
    status: 'active',
    createdAt: '2026-08-25T13:45:00Z',
    requirements: {
      minIncome: 130000,
      requireBackground: true,
      requireEmployment: true,
      verificationFee: 5.0,
    },
  },
];

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-a81f',
    applicantDisplayId: '#A81F',
    propertyId: 'prop-1',
    propertyTitle: 'The Ashton Highrise #14B',
    propertyAddress: '101 Colorado St, Unit 14B, Austin, TX',
    propertyPrice: 2400,
    tenantId: 'tenant-1',
    tenantName: 'Elena Rostova',
    tenantEmail: 'elena.rostova@example.com',
    tenantPhone: '+1 (512) 892-4910',
    status: 'verified_eligible',
    paymentStatus: 'paid',
    paymentDate: '2026-08-28T14:20:00Z',
    paymentTxId: 'ch_3Mzk81F920akL49281a',
    createdAt: '2026-08-28T14:15:00Z',
    updatedAt: '2026-08-28T14:25:00Z',
    verification: {
      verified: true,
      eligible: true,
      verifiedAt: '2026-08-28T14:22:18Z',
      midnightTxHash: '0x7a8f192bce49102948cba38210f92bfa7c9138402948194827104928104812aa',
      circuitId: 'mid_zk_v3_eligibility_standard_0x992a',
      zkProofHash: 'zk_p_98ff02a9411bc4028fa7210e4a901844bca99281729018491829048192801948',
      blockHeight: 1849204,
      merkleRoot: '0x38e0192a84919018420e91402849102830198420198402849184029481948201',
      requirements: {
        income: { required: 75000, satisfied: true },
        background: { required: true, satisfied: true },
        employment: { required: true, satisfied: true },
      },
      zkMetrics: {
        constraints: 38420,
        provingTimeMs: 1420,
        circuitSize: '2.4 MB',
        protocolVersion: 'Midnight Halo2 v1.2',
      },
    },
    revealStatus: 'none',
  },
  {
    id: 'app-92c4',
    applicantDisplayId: '#92C4',
    propertyId: 'prop-2',
    propertyTitle: 'Rainey St Modern Loft',
    propertyAddress: '70 Rainey St, Suite 804, Austin, TX',
    propertyPrice: 3100,
    tenantId: 'tenant-2',
    tenantName: 'Marcus Vance',
    tenantEmail: 'marcus.v@example.com',
    tenantPhone: '+1 (512) 402-9912',
    status: 'verified_eligible',
    paymentStatus: 'paid',
    paymentDate: '2026-08-27T11:00:00Z',
    paymentTxId: 'ch_3Mzk92C420akL77123b',
    createdAt: '2026-08-27T10:45:00Z',
    updatedAt: '2026-08-28T16:00:00Z',
    verification: {
      verified: true,
      eligible: true,
      verifiedAt: '2026-08-27T11:05:42Z',
      midnightTxHash: '0x92c4819204810294810481204810481204819048120481904819048120481204',
      circuitId: 'mid_zk_v3_eligibility_standard_0x992a',
      zkProofHash: 'zk_p_4810284019284019284019284019284019284019284019284019284019284019',
      blockHeight: 1848910,
      merkleRoot: '0x7182940182940182940182940182940182940182940182940182940182940182',
      requirements: {
        income: { required: 95000, satisfied: true },
        background: { required: true, satisfied: true },
        employment: { required: true, satisfied: true },
      },
      zkMetrics: {
        constraints: 38420,
        provingTimeMs: 1530,
        circuitSize: '2.4 MB',
        protocolVersion: 'Midnight Halo2 v1.2',
      },
    },
    revealStatus: 'requested',
    revealRequestedAt: '2026-08-28T16:00:00Z',
  },
  {
    id: 'app-7b12',
    applicantDisplayId: '#7B12',
    propertyId: 'prop-1',
    propertyTitle: 'The Ashton Highrise #14B',
    propertyAddress: '101 Colorado St, Unit 14B, Austin, TX',
    propertyPrice: 2400,
    tenantId: 'tenant-3',
    tenantName: 'David Sterling',
    tenantEmail: 'd.sterling@example.com',
    tenantPhone: '+1 (512) 330-8192',
    status: 'pending_verification',
    paymentStatus: 'paid',
    paymentDate: '2026-08-28T18:30:00Z',
    paymentTxId: 'ch_3Mzk7B1220akL99381c',
    createdAt: '2026-08-28T18:25:00Z',
    updatedAt: '2026-08-28T18:30:00Z',
    revealStatus: 'none',
  },
  {
    id: 'app-3d90',
    applicantDisplayId: '#3D90',
    propertyId: 'prop-3',
    propertyTitle: 'South Congress Brownstone Flat',
    propertyAddress: '1600 S Congress Ave, #3, Austin, TX',
    propertyPrice: 1850,
    tenantId: 'tenant-4',
    tenantName: 'Rachel Green',
    tenantEmail: 'rachel.g@example.com',
    tenantPhone: '+1 (512) 555-0192',
    status: 'verified_ineligible',
    paymentStatus: 'paid',
    paymentDate: '2026-08-26T09:00:00Z',
    paymentTxId: 'ch_3Mzk3D9020akL11284d',
    createdAt: '2026-08-26T08:50:00Z',
    updatedAt: '2026-08-26T09:12:00Z',
    verification: {
      verified: true,
      eligible: false,
      verifiedAt: '2026-08-26T09:10:15Z',
      midnightTxHash: '0x3d90184029481029481048120481048120481904812048190481904812048120',
      circuitId: 'mid_zk_v3_eligibility_standard_0x992a',
      zkProofHash: 'zk_p_3d90284019284019284019284019284019284019284019284019284019284019',
      blockHeight: 1847102,
      merkleRoot: '0x1029481029481029481029481029481029481029481029481029481029481029',
      requirements: {
        income: { required: 58000, satisfied: false },
        background: { required: true, satisfied: true },
        employment: { required: false, satisfied: true },
      },
      zkMetrics: {
        constraints: 38420,
        provingTimeMs: 1390,
        circuitSize: '2.4 MB',
        protocolVersion: 'Midnight Halo2 v1.2',
      },
    },
    revealStatus: 'none',
  },
];

const DEFAULT_USER: UserProfile = {
  id: 'tenant-1',
  name: 'Elena Rostova',
  email: 'elena.rostova@example.com',
  phone: '+1 (512) 892-4910',
  role: 'tenant',
  walletConnected: true,
  midnightAddress: 'mn_addr1q8f2940182948102948102948102948102948102948102948102948102948',
  createdAt: '2026-08-01T00:00:00Z',
};

const ZkRentContext = createContext<ZkRentContextType | undefined>(undefined);

export function ZkRentProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [currentUser] = useState<UserProfile>(DEFAULT_USER);
  const [activeRole, setActiveRole] = useState<'tenant' | 'landlord'>('tenant');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const savedProps = localStorage.getItem('zkrent_properties_v2');
      const savedApps = localStorage.getItem('zkrent_applications_v2');
      const savedRole = localStorage.getItem('zkrent_active_role_v2');

      if (savedProps) setProperties(JSON.parse(savedProps));
      if (savedApps) setApplications(JSON.parse(savedApps));
      if (savedRole && (savedRole === 'tenant' || savedRole === 'landlord')) {
        setActiveRole(savedRole);
      }
    } catch (e) {
      console.error('Error loading state from storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('zkrent_properties_v2', JSON.stringify(properties));
      localStorage.setItem('zkrent_applications_v2', JSON.stringify(applications));
      localStorage.setItem('zkrent_active_role_v2', activeRole);
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [properties, applications, activeRole, isLoaded]);

  const getProperty = (id: string) => properties.find((p) => p.id === id);
  const getApplication = (id: string) => applications.find((a) => a.id === id);

  const addProperty = (propData: Omit<Property, 'id' | 'createdAt' | 'landlordId' | 'landlordName'>) => {
    const newId = `prop-${Date.now()}`;
    const newProperty: Property = {
      ...propData,
      id: newId,
      landlordId: 'landlord-1',
      landlordName: 'Highline Property Management',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setProperties((prev) => [newProperty, ...prev]);
    return newProperty;
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const updatePropertyRequirements = (id: string, requirements: PropertyRequirements) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, requirements: { ...p.requirements, ...requirements } } : p))
    );
  };

  const createApplication = (propertyId: string): Application => {
    const property = properties.find((p) => p.id === propertyId);
    if (!property) throw new Error('Property not found');

    // Check if an existing unpaid/in-progress application exists
    const existing = applications.find(
      (a) => a.propertyId === propertyId && a.tenantId === currentUser.id
    );
    if (existing) return existing;

    const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    const applicantDisplayId = `#A${randomHex.slice(0, 3)}`;
    const newId = `app-${Date.now()}`;

    const newApp: Application = {
      id: newId,
      applicantDisplayId,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: `${property.address}, ${property.city}, ${property.state}`,
      propertyPrice: property.price,
      tenantId: currentUser.id,
      tenantName: currentUser.name,
      tenantEmail: currentUser.email,
      tenantPhone: currentUser.phone,
      status: 'pending_payment',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revealStatus: 'none',
    };

    setApplications((prev) => [newApp, ...prev]);
    return newApp;
  };

  const payApplicationFee = (applicationId: string): Application => {
    let updatedApp: Application | undefined;
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === applicationId) {
          updatedApp = {
            ...app,
            paymentStatus: 'paid',
            paymentDate: new Date().toISOString(),
            paymentTxId: `ch_3Mzk${Math.random().toString(36).substring(2, 9)}`,
            status: app.status === 'pending_payment' ? 'pending_verification' : app.status,
            updatedAt: new Date().toISOString(),
          };
          return updatedApp;
        }
        return app;
      })
    );
    return updatedApp || applications.find((a) => a.id === applicationId)!;
  };

  const submitVerificationProof = (
    applicationId: string,
    credentials: {
      income: number;
      backgroundVerified: boolean;
      employmentVerified: boolean;
    }
  ) => {
    const app = applications.find((a) => a.id === applicationId);
    const prop = app ? properties.find((p) => p.id === app.propertyId) : undefined;

    const minRequiredIncome = prop?.requirements.minIncome ?? 75000;
    const bgRequired = prop?.requirements.requireBackground ?? true;
    const empRequired = prop?.requirements.requireEmployment ?? true;

    const incomeSatisfied = credentials.income >= minRequiredIncome;
    const bgSatisfied = !bgRequired || credentials.backgroundVerified;
    const empSatisfied = !empRequired || credentials.employmentVerified;

    const isEligible = incomeSatisfied && bgSatisfied && empSatisfied;

    const proofHash = `zk_p_${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const midnightTx = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const merkleRoot = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const proofDetails: ZkProofDetails = {
      verified: true,
      eligible: isEligible,
      verifiedAt: new Date().toISOString(),
      midnightTxHash: midnightTx,
      circuitId: 'mid_zk_v3_eligibility_standard_0x992a',
      zkProofHash: proofHash,
      blockHeight: 1849000 + Math.floor(Math.random() * 500),
      merkleRoot,
      requirements: {
        income: { required: minRequiredIncome, satisfied: incomeSatisfied },
        background: { required: bgRequired, satisfied: bgSatisfied },
        employment: { required: empRequired, satisfied: empSatisfied },
      },
      zkMetrics: {
        constraints: 38420,
        provingTimeMs: 1450 + Math.floor(Math.random() * 200),
        circuitSize: '2.4 MB',
        protocolVersion: 'Midnight Halo2 v1.2',
      },
    };

    let updatedApplication: Application | undefined;

    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === applicationId) {
          updatedApplication = {
            ...a,
            status: isEligible ? 'verified_eligible' : 'verified_ineligible',
            verification: proofDetails,
            updatedAt: new Date().toISOString(),
          };
          return updatedApplication;
        }
        return a;
      })
    );

    return {
      application: updatedApplication || app!,
      isEligible,
      proof: proofDetails,
    };
  };

  const requestReveal = (applicationId: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              revealStatus: 'requested',
              revealRequestedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : app
      )
    );
  };

  const grantRevealConsent = (applicationId: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              revealStatus: 'granted',
              revealGrantedAt: new Date().toISOString(),
              status: 'lease_offered',
              updatedAt: new Date().toISOString(),
            }
          : app
      )
    );
  };

  const declineRevealConsent = (applicationId: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              revealStatus: 'declined',
              updatedAt: new Date().toISOString(),
            }
          : app
      )
    );
  };

  const resetDemoData = () => {
    setProperties(INITIAL_PROPERTIES);
    setApplications(INITIAL_APPLICATIONS);
    try {
      localStorage.removeItem('zkrent_properties_v2');
      localStorage.removeItem('zkrent_applications_v2');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ZkRentContext.Provider
      value={{
        properties,
        applications,
        currentUser,
        activeRole,
        setActiveRole,
        getProperty,
        getApplication,
        addProperty,
        updateProperty,
        updatePropertyRequirements,
        createApplication,
        payApplicationFee,
        submitVerificationProof,
        requestReveal,
        grantRevealConsent,
        declineRevealConsent,
        resetDemoData,
      }}
    >
      {children}
    </ZkRentContext.Provider>
  );
}

export function useZkRent() {
  const context = useContext(ZkRentContext);
  if (!context) {
    throw new Error('useZkRent must be used within a ZkRentProvider');
  }
  return context;
}
