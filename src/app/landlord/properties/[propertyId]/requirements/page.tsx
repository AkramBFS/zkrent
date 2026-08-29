'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import {
  SlidersHorizontal,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check,
  Lock,
  EyeOff,
  Save,
} from 'lucide-react';

export default function EditRequirementsPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;
  const { getProperty, updatePropertyRequirements } = useZkRent();

  const property = getProperty(propertyId);

  const [minIncome, setMinIncome] = useState<number>(75000);
  const [requireBackground, setRequireBackground] = useState<boolean>(true);
  const [requireEmployment, setRequireEmployment] = useState<boolean>(true);
  const [verificationFee, setVerificationFee] = useState<number>(5.0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (property) {
      setMinIncome(property.requirements.minIncome);
      setRequireBackground(property.requirements.requireBackground);
      setRequireEmployment(property.requirements.requireEmployment);
      setVerificationFee(property.requirements.verificationFee);
    }
  }, [property]);

  if (!property) {
    return (
      <div className="min-h-screen bg-[#E5E0D8] py-16 px-4 flex items-center justify-center">
        <div className="bg-[#FAFAFA] p-8 rounded-xl border border-[#E5E0D8] max-w-md text-center space-y-4">
          <SlidersHorizontal className="w-12 h-12 text-[#908682] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#231F20]">Property Not Found</h2>
          <Link
            href="/landlord/properties"
            className="inline-block px-5 py-2.5 rounded-md bg-[#231F20] text-white text-sm font-medium"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePropertyRequirements(property.id, {
      minIncome,
      requireBackground,
      requireEmployment,
      verificationFee,
    });
    setSaved(true);
    setTimeout(() => {
      router.push(`/landlord/properties/${property.id}`);
    }, 800);
  };


  return (
    <div className="min-h-screen bg-[#E5E0D8] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href={`/landlord/properties/${property.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3D3531] hover:text-[#231F20]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & return to property</span>
          </Link>
        </div>

        {saved && (
          <div className="p-4 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>ZK qualification rules updated on-chain! Redirecting...</span>
          </div>
        )}

        {/* Requirements Form Card */}
        <form onSubmit={handleSave} className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#231F20] text-[#00A8E8] text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Midnight Network Verification Contract</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#231F20]">
              Configure Zero-Knowledge Qualification Rules
            </h1>
            <p className="text-xs text-[#3D3531] mt-0.5">
              These rules directly define what applicants must prove to receive an "Eligible ✓" seal for{' '}
              <strong>{property.title}</strong>.
            </p>
          </div>

          <div className="space-y-5 font-mono text-xs">
            {/* Income */}
            <div className="p-5 rounded-xl bg-white border border-[#E5E0D8] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-bold text-[#231F20] text-sm block">
                    Minimum Annual Income Threshold
                  </label>
                  <p className="text-[11px] text-[#3D3531]">
                    Condition: Tenant proves <code className="text-[#231F20]">Income ≥ Threshold</code>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[#4A6B32] font-bold text-lg font-serif">
                    ${minIncome.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#908682]">/ year</span>
                </div>
              </div>

              <input
                type="range"
                min="30000"
                max="200000"
                step="2500"
                value={minIncome}
                onChange={(e) => setMinIncome(parseInt(e.target.value))}
                className="w-full accent-[#4A6B32]"
              />

              <div className="flex justify-between text-[10px] text-[#908682]">
                <span>$30,000</span>
                <span>$100,000</span>
                <span>$200,000</span>
              </div>
            </div>

            {/* Background */}
            <div className="p-5 rounded-xl bg-white border border-[#E5E0D8] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#231F20] text-sm">
                  Criminal & Eviction Background Check
                </div>
                <p className="text-[11px] text-[#3D3531]">
                  Demands certified clear background registry attestation in proof witness.
                </p>
              </div>
              <input
                type="checkbox"
                checked={requireBackground}
                onChange={(e) => setRequireBackground(e.target.checked)}
                className="w-5 h-5 rounded text-[#4A6B32] focus:ring-[#4A6B32]"
              />
            </div>

            {/* Employment */}
            <div className="p-5 rounded-xl bg-white border border-[#E5E0D8] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#231F20] text-sm">
                  Employment Status Attestation
                </div>
                <p className="text-[11px] text-[#3D3531]">
                  Demands active corporate payroll registry attestation in proof witness.
                </p>
              </div>
              <input
                type="checkbox"
                checked={requireEmployment}
                onChange={(e) => setRequireEmployment(e.target.checked)}
                className="w-5 h-5 rounded text-[#4A6B32] focus:ring-[#4A6B32]"
              />
            </div>

            {/* Verification Fee */}
            <div className="p-4 rounded-xl bg-[#E5E0D8] border border-[#231F20]/10 flex items-center justify-between">
              <div>
                <div className="font-bold text-[#231F20]">
                  Applicant Verification Fee
                </div>
                <p className="text-[11px] text-[#3D3531]">
                  Covers on-chain proving gas and circuit execution costs paid by applicant.
                </p>
              </div>
              <div className="font-bold text-[#231F20] text-base">${verificationFee.toFixed(2)}</div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#231F20]/10 flex items-center justify-between">
            <Link
              href={`/landlord/properties/${property.id}`}
              className="px-5 py-2.5 rounded-md bg-[#E5E0D8] text-[#231F20] font-mono text-xs hover:bg-[#231F20]/10"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="px-6 py-3 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 shadow"
            >
              <Save className="w-4 h-4" />
              <span>Save Requirements to Contract</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
