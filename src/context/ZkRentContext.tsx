'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Property, Application, UserProfile, ZkProofDetails, PropertyRequirements } from '@/types';
import { defaultVerifier } from '@/lib/verification';

interface ZkRentContextType {
  properties: Property[];
  applications: Application[];
  currentUser: UserProfile;
  activeRole: 'tenant' | 'landlord';
  setActiveRole: (role: 'tenant' | 'landlord') => void;
  isLoading: boolean;
  getProperty: (id: string) => Property | undefined;
  getApplication: (id: string) => Application | undefined;
  fetchProperties: () => Promise<void>;
  fetchApplications: () => Promise<void>;
  addProperty: (prop: Omit<Property, 'id' | 'createdAt' | 'landlordId' | 'landlordName'>) => Promise<Property>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  updatePropertyRequirements: (id: string, requirements: PropertyRequirements) => Promise<void>;
  createApplication: (propertyId: string) => Promise<Application>;
  payApplicationFee: (applicationId: string) => Promise<Application>;
  submitVerificationProof: (
    applicationId: string,
    credentials: {
      income: number;
      backgroundVerified: boolean;
      employmentVerified: boolean;
    }
  ) => Promise<{ application: Application; isEligible: boolean; proof: ZkProofDetails }>;
  requestReveal: (applicationId: string) => Promise<void>;
  grantRevealConsent: (applicationId: string) => Promise<void>;
  declineRevealConsent: (applicationId: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const DEFAULT_USER: UserProfile = {
  id: 'tenant-user',
  name: 'Elena Rostova',
  email: 'tenant@example.com',
  phone: '+1 (512) 892-4910',
  role: 'tenant',
  walletConnected: true,
  midnightAddress: 'mn_addr1q8f2940182948102948102948102948102948102948102948102948102948',
  createdAt: '2026-08-01T00:00:00Z',
};

const ZkRentContext = createContext<ZkRentContextType | undefined>(undefined);

export function ZkRentProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER);
  const [activeRole, setActiveRole] = useState<'tenant' | 'landlord'>('tenant');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch properties from PostgreSQL API
  const fetchProperties = useCallback(async () => {
    try {
      const res = await fetch('/api/properties');
      if (res.ok) {
        const data = await res.json();
        if (data.properties) {
          setProperties(data.properties);
        }
      }
    } catch (e) {
      console.error('Error fetching properties from API:', e);
    }
  }, []);

  // Fetch applications from PostgreSQL API
  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        if (data.applications) {
          setApplications(data.applications);
        }
      }
    } catch (e) {
      console.error('Error fetching applications from API:', e);
    }
  }, []);

  // Fetch session to set current user
  const fetchSessionUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const session = await res.json();
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            name: session.user.name || (session.user.role === 'LANDLORD' ? 'Property Manager' : 'Elena Rostova'),
            email: session.user.email,
            phone: '+1 (512) 892-4910',
            role: session.user.role === 'LANDLORD' ? 'landlord' : 'tenant',
            walletConnected: true,
            midnightAddress: 'mn_addr1q8f2940182948102948102948102948102948102948102948102948102948',
            createdAt: '2026-08-01T00:00:00Z',
          });
          setActiveRole(session.user.role === 'LANDLORD' ? 'landlord' : 'tenant');
        }
      }
    } catch (e) {
      console.error('Error fetching session user:', e);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([fetchSessionUser(), fetchProperties(), fetchApplications()]);
      setIsLoading(false);
    };
    loadAll();
  }, [fetchSessionUser, fetchProperties, fetchApplications]);

  const getProperty = (id: string) => properties.find((p) => p.id === id);
  const getApplication = (id: string) => applications.find((a) => a.id === id);

  const addProperty = async (propData: Omit<Property, 'id' | 'createdAt' | 'landlordId' | 'landlordName'>) => {
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create property');
      }

      const data = await res.json();
      const newProperty = data.property;

      setProperties((prev) => [newProperty, ...prev.filter((p) => p.id !== newProperty.id)]);
      return newProperty;
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...data.property } : p)));
      }
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  const updatePropertyRequirements = async (id: string, requirements: PropertyRequirements) => {
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requirements),
      });

      if (res.ok) {
        const data = await res.json();
        setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...data.property } : p)));
      }
    } catch (error) {
      console.error('Error updating property requirements:', error);
    }
  };

  const createApplication = async (propertyId: string): Promise<Application> => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create application');
      }

      const data = await res.json();
      const app = data.application;

      setApplications((prev) => [app, ...prev.filter((a) => a.id !== app.id)]);
      return app;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  };

  const payApplicationFee = async (applicationId: string): Promise<Application> => {
    const app = applications.find((a) => a.id === applicationId);
    const propId = app?.propertyId;

    try {
      const res = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          propertyId: propId,
          simulate: true,
        }),
      });

      if (res.ok) {
        await fetchApplications();
      }
    } catch (error) {
      console.error('Error paying fee:', error);
    }

    const updated = applications.find((a) => a.id === applicationId);
    return updated || (app as Application);
  };

  const submitVerificationProof = async (
    applicationId: string,
    credentials: {
      income: number;
      backgroundVerified: boolean;
      employmentVerified: boolean;
    }
  ) => {
    const app = applications.find((a) => a.id === applicationId);
    const prop = app ? properties.find((p) => p.id === app.propertyId) : undefined;

    const rules = {
      minIncome: prop?.requirements.minIncome ?? 75000,
      requireBackground: prop?.requirements.requireBackground ?? true,
      requireEmployment: prop?.requirements.requireEmployment ?? true,
      verificationFee: prop?.requirements.verificationFee ?? 5.0,
    };

    let proofResult: ZkProofDetails;
    let isEligible = false;

    try {
      // 1. Synthesize Zero-Knowledge Proof via Midnight Prover Endpoint
      const res = await fetch('/api/verifications/prove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          credentials: {
            income: credentials.income,
            backgroundVerified: credentials.backgroundVerified,
            employmentVerified: credentials.employmentVerified,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        proofResult = data.proof;
        isEligible = data.isEligible;
      } else {
        // Fallback to local client verifier if server route errors
        console.warn('Server prover returned status:', res.status, 'Falling back to client verifier');
        proofResult = await defaultVerifier.verify(rules, credentials);
        isEligible = proofResult.eligible;
      }

      await fetchApplications();
    } catch (e) {
      console.error('Error in proof pipeline, using client verifier:', e);
      proofResult = await defaultVerifier.verify(rules, credentials);
      isEligible = proofResult.eligible;
    }

    const updatedApp: Application = {
      ...(app || ({} as Application)),
      status: isEligible ? 'verified_eligible' : 'verified_ineligible',
      verification: proofResult,
      updatedAt: new Date().toISOString(),
    };

    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? updatedApp : a))
    );

    return {
      application: updatedApp,
      isEligible,
      proof: proofResult,
    };
  };

  const requestReveal = async (applicationId: string) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revealStatus: 'REQUESTED' }),
      });

      if (res.ok) {
        await fetchApplications();
      }
    } catch (e) {
      console.error('Error requesting reveal:', e);
    }
  };

  const grantRevealConsent = async (applicationId: string) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revealStatus: 'GRANTED' }),
      });

      if (res.ok) {
        await fetchApplications();
      }
    } catch (e) {
      console.error('Error granting reveal consent:', e);
    }
  };

  const declineRevealConsent = async (applicationId: string) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revealStatus: 'DECLINED' }),
      });

      if (res.ok) {
        await fetchApplications();
      }
    } catch (e) {
      console.error('Error declining reveal consent:', e);
    }
  };

  const resetDemoData = async () => {
    try {
      localStorage.clear();
      await Promise.all([fetchProperties(), fetchApplications()]);
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
        isLoading,
        getProperty,
        getApplication,
        fetchProperties,
        fetchApplications,
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

