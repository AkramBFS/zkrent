'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ZkVerifiedBadge, ApplicantIdTag } from '@/components/ZkBadges';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  EyeOff,
  UserCheck,
  Filter,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function LandlordApplicationsListPage() {
  const { applications } = useZkRent();
  const [filter, setFilter] = useState<'all' | 'eligible' | 'pending' | 'rejected'>('all');

  const filteredApplications = applications.filter((app) => {
    if (filter === 'eligible') return app.status === 'verified_eligible' || app.status === 'lease_offered';
    if (filter === 'pending') return app.status === 'pending_payment' || app.status === 'pending_verification';
    if (filter === 'rejected') return app.status === 'verified_ineligible';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#EDECE4] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#14213D]/10">
          <div>
            <span className="font-mono text-xs text-[#AE8B3F] font-bold uppercase tracking-widest">
              Applicant Review
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#14213D] mt-1">
              Anonymous Applicant Inquiries
            </h1>
            <p className="text-sm text-[#4B5A79] mt-1">
              Review mathematical Zero-Knowledge eligibility outcomes. No raw financial documents are exposed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded bg-[#14213D] text-[#4FB3A5] font-mono text-xs border border-[#4FB3A5]/30">
              Midnight ZK Protocol
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-[#14213D]/10 pb-2">
          {(
            [
              { id: 'all', label: `All Applications (${applications.length})` },
              {
                id: 'eligible',
                label: `Eligible (${
                  applications.filter((a) => a.status === 'verified_eligible' || a.status === 'lease_offered')
                    .length
                })`,
              },
              {
                id: 'pending',
                label: `Pending Proof (${
                  applications.filter(
                    (a) => a.status === 'pending_payment' || a.status === 'pending_verification'
                  ).length
                })`,
              },
              {
                id: 'rejected',
                label: `Ineligible (${
                  applications.filter((a) => a.status === 'verified_ineligible').length
                })`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-mono transition-colors ${
                filter === tab.id
                  ? 'bg-[#14213D] text-white font-bold'
                  : 'bg-[#F6F5F0] text-[#4B5A79] hover:bg-[#EDECE4] border border-[#14213D]/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Applications Feed */}
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 space-y-3">
            <ShieldCheck className="w-10 h-10 text-[#8794AD] mx-auto" />
            <h3 className="font-serif text-xl font-bold text-[#14213D]">No Applications in this Category</h3>
            <p className="text-sm text-[#4B5A79]">Check back once prospective tenants submit proof verifications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-[#F6F5F0] p-6 rounded-xl border border-[#14213D]/15 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <ApplicantIdTag id={app.applicantDisplayId} size="sm" />
                    <span className="text-xs font-mono text-[#8794AD]">
                      Applied {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {app.revealStatus === 'granted' && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">
                        ✓ Identity Consented ({app.tenantName})
                      </span>
                    )}
                    {app.revealStatus === 'requested' && (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px] font-mono font-bold">
                        Reveal Request Pending
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#14213D]">
                    {app.propertyTitle}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#4B5A79]">
                    <MapPin className="w-3.5 h-3.5 text-[#AE8B3F]" />
                    <span>{app.propertyAddress}</span>
                  </div>

                  <div className="pt-1 flex items-center gap-3 text-xs font-mono text-[#4B5A79]">
                    <span className="font-bold text-[#14213D]">
                      ${app.propertyPrice.toLocaleString()} / mo
                    </span>
                    <span>•</span>
                    <span>
                      {app.verification
                        ? `Midnight Tx: ${app.verification.midnightTxHash.substring(0, 16)}...`
                        : 'Awaiting on-device proof generation'}
                    </span>
                  </div>
                </div>

                {/* Outcome Badge & View Link */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-[#14213D]/10">
                  <div>
                    {app.status === 'verified_eligible' || app.status === 'lease_offered' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#2E7D74]/20 text-[#1F5751] text-xs font-mono font-bold border border-[#2E7D74]/40">
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D74]" />
                        ✓ ZK VERIFIED: Eligible
                      </span>
                    ) : app.status === 'verified_ineligible' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#B4483A]/15 text-[#B4483A] text-xs font-mono font-bold border border-[#B4483A]/30">
                        Ineligible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold">
                        Pending Proof
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/landlord/applications/${app.id}`}
                    className="px-4 py-2 rounded-md bg-[#14213D] hover:bg-[#1E2F54] text-white text-xs font-medium transition-colors"
                  >
                    Inspect Proof & Manage →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
