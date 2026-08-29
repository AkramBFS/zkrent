'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  User,
  Sparkles,
  ArrowRight,
  EyeOff,
  FileCheck2,
} from 'lucide-react';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const { activeRole, setActiveRole } = useZkRent();

  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord'>(
    roleParam === 'landlord' ? 'landlord' : activeRole
  );

  const handleContinue = () => {
    setActiveRole(selectedRole);
    if (selectedRole === 'landlord') {
      router.push('/landlord');
    } else {
      router.push('/tenant');
    }
  };

  return (
    <div className="w-full max-w-xl bg-[#F6F5F0] rounded-2xl border border-[#14213D]/15 p-8 sm:p-10 shadow-xl space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[#14213D] text-[#4FB3A5] flex items-center justify-center mx-auto border border-[#4FB3A5]/30 shadow">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#14213D]">
          Welcome to ZkRent
        </h1>
        <p className="text-sm text-[#4B5A79]">
          The zero-knowledge rental protocol where credentials stay private and outcomes are verified mathematically.
        </p>
      </div>

      {/* Role Toggle Switch */}
      <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-[#EDECE4] border border-[#14213D]/10">
        <button
          type="button"
          onClick={() => setSelectedRole('tenant')}
          className={`py-2.5 px-4 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            selectedRole === 'tenant'
              ? 'bg-[#14213D] text-white shadow'
              : 'text-[#4B5A79] hover:text-[#14213D]'
          }`}
        >
          <User className="w-4 h-4 text-[#4FB3A5]" />
          <span>Tenant Onboarding</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole('landlord')}
          className={`py-2.5 px-4 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            selectedRole === 'landlord'
              ? 'bg-[#AE8B3F] text-white shadow'
              : 'text-[#4B5A79] hover:text-[#14213D]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Landlord Onboarding</span>
        </button>
      </div>

      {/* Role Specific Content */}
      {selectedRole === 'tenant' ? (
        <div className="space-y-6">
          <div className="bg-[#14213D] text-white p-6 rounded-xl border border-[#4FB3A5]/30 space-y-4">
            <div className="flex items-center gap-2 text-[#4FB3A5] font-mono text-xs font-bold uppercase">
              <EyeOff className="w-4 h-4" />
              <span>Your Private Information Stays Private</span>
            </div>

            <div className="space-y-3 font-mono text-xs text-[#EDECE4]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#4FB3A5] flex-shrink-0 mt-0.5" />
                <span>Find rental properties with clear ZK qualification rules upfront.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#4FB3A5] flex-shrink-0 mt-0.5" />
                <span>Prove eligibility on-device using Midnight Network zero-knowledge circuits.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#4FB3A5] flex-shrink-0 mt-0.5" />
                <span>Share cryptographic verification results, never raw tax documents or pay stubs.</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleContinue}
              className="flex-1 py-3.5 px-6 rounded-lg bg-[#14213D] hover:bg-[#1E2F54] text-white font-mono text-xs font-bold transition-colors shadow flex items-center justify-center gap-2"
            >
              <span>Go to Tenant Portal</span>
              <ArrowRight className="w-4 h-4 text-[#AE8B3F]" />
            </button>
            <Link
              href="/properties"
              className="py-3.5 px-6 rounded-lg bg-[#AE8B3F] hover:bg-[#977732] text-white font-mono text-xs font-bold text-center transition-colors shadow"
            >
              Browse Properties Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#14213D] text-white p-6 rounded-xl border border-[#AE8B3F]/30 space-y-4">
            <div className="flex items-center gap-2 text-[#AE8B3F] font-mono text-xs font-bold uppercase">
              <Building2 className="w-4 h-4" />
              <span>Welcome Property Owner</span>
            </div>

            <div className="space-y-3 font-mono text-xs text-[#EDECE4]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#AE8B3F] flex-shrink-0 mt-0.5" />
                <span>List your properties 100% free with custom eligibility criteria.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#AE8B3F] flex-shrink-0 mt-0.5" />
                <span>Define minimum income, background, and employment rules encoded into smart contracts.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#AE8B3F] flex-shrink-0 mt-0.5" />
                <span>Receive unforgeable "Eligible ✓" proofs with inspectable cryptographic receipts.</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/landlord/properties/new"
              className="flex-1 py-3.5 px-6 rounded-lg bg-[#AE8B3F] hover:bg-[#977732] text-white font-mono text-xs font-bold text-center transition-colors shadow flex items-center justify-center gap-2"
            >
              <span>+ Create Your First Listing (Free)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleContinue}
              className="py-3.5 px-6 rounded-lg bg-[#14213D] hover:bg-[#1E2F54] text-white font-mono text-xs font-bold transition-colors shadow"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-[#14213D]">Loading onboarding...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
