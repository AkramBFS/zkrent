'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ZkVerifiedBadge, ApplicantIdTag } from '@/components/ZkBadges';
import {
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Filter,
  Search,
  MapPin,
  Home,
} from 'lucide-react';

export default function TenantApplicationsListPage() {
  const { applications } = useZkRent();
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');

  const filteredApplications = applications.filter((app) => {
    if (filter === 'verified') return app.status === 'verified_eligible' || app.status === 'lease_offered';
    if (filter === 'pending') return app.status === 'pending_payment' || app.status === 'pending_verification';
    if (filter === 'rejected') return app.status === 'verified_ineligible' || app.status === 'rejected';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#EDECE4] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#14213D]/10">
          <div>
            <span className="font-mono text-xs text-[#AE8B3F] font-bold uppercase tracking-widest">
              Tenant Dashboard
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#14213D] mt-1">
              My Rental Applications
            </h1>
            <p className="text-sm text-[#4B5A79] mt-1">
              Track your privacy-preserved applications and Midnight zero-knowledge verification statuses.
            </p>
          </div>

          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-[#14213D] hover:bg-[#1E2F54] text-white text-xs font-mono font-medium shadow transition-all"
          >
            <Home className="w-4 h-4 text-[#AE8B3F]" />
            <span>Apply to New Property</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-[#14213D]/10 pb-2">
          {(
            [
              { id: 'all', label: `All (${applications.length})` },
              {
                id: 'verified',
                label: `Verified Eligible (${
                  applications.filter((a) => a.status === 'verified_eligible' || a.status === 'lease_offered')
                    .length
                })`,
              },
              {
                id: 'pending',
                label: `Pending (${
                  applications.filter(
                    (a) => a.status === 'pending_payment' || a.status === 'pending_verification'
                  ).length
                })`,
              },
              {
                id: 'rejected',
                label: `Rejected (${
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

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 space-y-3">
            <ShieldCheck className="w-10 h-10 text-[#8794AD] mx-auto" />
            <h3 className="font-serif text-xl font-bold text-[#14213D]">No Applications in this Category</h3>
            <p className="text-sm text-[#4B5A79]">You can browse available properties and start an application anytime.</p>
            <Link
              href="/properties"
              className="inline-block px-4 py-2 rounded bg-[#14213D] text-white text-xs font-mono"
            >
              Browse Properties
            </Link>
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
                    {app.revealStatus === 'requested' && (
                      <span className="px-2 py-0.5 rounded bg-[#AE8B3F] text-white text-[11px] font-mono font-bold animate-pulse">
                        Lease Reveal Requested
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
                    <span className="font-bold text-[#14213D] text-sm">
                      ${app.propertyPrice.toLocaleString()} / month
                    </span>
                    <span>•</span>
                    <span>Fee: {app.paymentStatus === 'paid' ? 'Paid ✓' : 'Unpaid ($5.00)'}</span>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-[#14213D]/10">
                  <div>
                    {app.status === 'verified_eligible' || app.status === 'lease_offered' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#2E7D74]/20 text-[#1F5751] text-xs font-mono font-bold border border-[#2E7D74]/40">
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D74]" />
                        ZK Verified • Eligible
                      </span>
                    ) : app.status === 'verified_ineligible' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#B4483A]/15 text-[#B4483A] text-xs font-mono font-bold border border-[#B4483A]/30">
                        Ineligible
                      </span>
                    ) : app.paymentStatus === 'unpaid' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#AE8B3F]/15 text-[#AE8B3F] text-xs font-mono font-bold border border-[#AE8B3F]/30">
                        Payment Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-mono font-bold">
                        Proof Generation Ready
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/tenant/applications/${app.id}`}
                      className="px-4 py-2 rounded-md bg-[#14213D] hover:bg-[#1E2F54] text-white text-xs font-medium transition-colors"
                    >
                      View Details & Status →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
