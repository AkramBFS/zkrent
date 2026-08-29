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
      <div className="min-h-screen bg-[#EDECE4] py-16 px-4 flex items-center justify-center">
        <div className="bg-[#F6F5F0] p-8 rounded-xl border border-[#14213D]/15 max-w-md text-center space-y-4">
          <SlidersHorizontal className="w-12 h-12 text-[#8794AD] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#14213D]">Property Not Found</h2>
          <Link
            href="/landlord/properties"
            className="inline-block px-5 py-2.5 rounded-md bg-[#14213D] text-white text-sm font-medium"
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
    <div className="min-h-screen bg-[#EDECE4] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href={`/landlord/properties/${property.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#4B5A79] hover:text-[#14213D]"
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
        <form onSubmit={handleSave} className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#14213D] text-[#4FB3A5] text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Midnight Network Verification Contract</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#14213D]">
              Configure Zero-Knowledge Qualification Rules
            </h1>
            <p className="text-xs text-[#4B5A79] mt-0.5">
              These rules directly define what applicants must prove to receive an "Eligible ✓" seal for{' '}
              <strong>{property.title}</strong>.
            </p>
          </div>

          <div className="space-y-5 font-mono text-xs">
            {/* Income */}
            <div className="p-5 rounded-xl bg-white border border-[#14213D]/15 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-bold text-[#14213D] text-sm block">
                    Minimum Annual Income Threshold
                  </label>
                  <p className="text-[11px] text-[#4B5A79]">
                    Condition: Tenant proves <code className="text-[#14213D]">Income ≥ Threshold</code>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[#2E7D74] font-bold text-lg font-serif">
                    ${minIncome.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#8794AD]">/ year</span>
                </div>
              </div>

              <input
                type="range"
                min="30000"
                max="200000"
                step="2500"
                value={minIncome}
                onChange={(e) => setMinIncome(parseInt(e.target.value))}
                className="w-full accent-[#2E7D74]"
              />

              <div className="flex justify-between text-[10px] text-[#8794AD]">
                <span>$30,000</span>
                <span>$100,000</span>
                <span>$200,000</span>
              </div>
            </div>

            {/* Background */}
            <div className="p-5 rounded-xl bg-white border border-[#14213D]/15 flex items-center justify-between">
              <div>
                <div className="font-bold text-[#14213D] text-sm">
                  Criminal & Eviction Background Check
                </div>
                <p className="text-[11px] text-[#4B5A79]">
                  Demands certified clear background registry attestation in proof witness.
                </p>
              </div>
              <input
                type="checkbox"
                checked={requireBackground}
                onChange={(e) => setRequireBackground(e.target.checked)}
                className="w-5 h-5 rounded text-[#2E7D74] focus:ring-[#2E7D74]"
              />
            </div>

            {/* Employment */}
            <div className="p-5 rounded-xl bg-white border border-[#14213D]/15 flex items-center justify-between">
              <div>
                <div className="font-bold text-[#14213D] text-sm">
                  Employment Status Attestation
                </div>
                <p className="text-[11px] text-[#4B5A79]">
                  Demands active corporate payroll registry attestation in proof witness.
                </p>
              </div>
              <input
                type="checkbox"
                checked={requireEmployment}
                onChange={(e) => setRequireEmployment(e.target.checked)}
                className="w-5 h-5 rounded text-[#2E7D74] focus:ring-[#2E7D74]"
              />
            </div>

            {/* Verification Fee */}
            <div className="p-4 rounded-xl bg-[#EDECE4] border border-[#14213D]/10 flex items-center justify-between">
              <div>
                <div className="font-bold text-[#14213D]">
                  Applicant Verification Fee
                </div>
                <p className="text-[11px] text-[#4B5A79]">
                  Covers on-chain proving gas and circuit execution costs paid by applicant.
                </p>
              </div>
              <div className="font-bold text-[#14213D] text-base">${verificationFee.toFixed(2)}</div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#14213D]/10 flex items-center justify-between">
            <Link
              href={`/landlord/properties/${property.id}`}
              className="px-5 py-2.5 rounded-md bg-[#EDECE4] text-[#14213D] font-mono text-xs hover:bg-[#14213D]/10"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="px-6 py-3 rounded-md bg-[#AE8B3F] hover:bg-[#977732] text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 shadow"
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
