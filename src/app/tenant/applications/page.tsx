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
    <div className="min-h-screen bg-[#E5E0D8] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#231F20]/10">
          <div>
            <span className="font-mono text-xs text-[#B86A36] font-bold uppercase tracking-widest">
              Tenant Dashboard
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#231F20] mt-1">
              My Rental Applications
            </h1>
            <p className="text-sm text-[#3D3531] mt-1">
              Track your privacy-preserved applications and Midnight zero-knowledge verification statuses.
            </p>
          </div>

          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-white text-xs font-mono font-medium shadow transition-all"
          >
            <Home className="w-4 h-4 text-[#B86A36]" />
            <span>Apply to New Property</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-[#231F20]/10 pb-2">
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
                  ? 'bg-[#231F20] text-white font-bold'
                  : 'bg-[#FAFAFA] text-[#3D3531] hover:bg-[#E5E0D8] border border-[#231F20]/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] space-y-3">
            <ShieldCheck className="w-10 h-10 text-[#908682] mx-auto" />
            <h3 className="font-serif text-xl font-bold text-[#231F20]">No Applications in this Category</h3>
            <p className="text-sm text-[#3D3531]">You can browse available properties and start an application anytime.</p>
            <Link
              href="/properties"
              className="inline-block px-4 py-2 rounded bg-[#231F20] text-white text-xs font-mono"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-[#FAFAFA] p-6 rounded-xl border border-[#E5E0D8] shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <ApplicantIdTag id={app.applicantDisplayId} size="sm" />
                    <span className="text-xs font-mono text-[#908682]">
                      Applied {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {app.revealStatus === 'requested' && (
                      <span className="px-2 py-0.5 rounded bg-[#B86A36] text-white text-[11px] font-mono font-bold animate-pulse">
                        Lease Reveal Requested
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#231F20]">
                    {app.propertyTitle}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#3D3531]">
                    <MapPin className="w-3.5 h-3.5 text-[#B86A36]" />
                    <span>{app.propertyAddress}</span>
                  </div>

                  <div className="pt-1 flex items-center gap-3 text-xs font-mono text-[#3D3531]">
                    <span className="font-bold text-[#231F20] text-sm">
                      ${app.propertyPrice.toLocaleString()} / month
                    </span>
                    <span>•</span>
                    <span>Fee: {app.paymentStatus === 'paid' ? 'Paid ✓' : 'Unpaid ($5.00)'}</span>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-[#231F20]/10">
                  <div>
                    {app.status === 'verified_eligible' || app.status === 'lease_offered' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#4A6B32]/20 text-[#3A5427] text-xs font-mono font-bold border border-[#4A6B32]/40">
                        <CheckCircle2 className="w-4 h-4 text-[#4A6B32]" />
                        ZK Verified • Eligible
                      </span>
                    ) : app.status === 'verified_ineligible' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E85D31]/15 text-[#E85D31] text-xs font-mono font-bold border border-[#E85D31]/30">
                        Ineligible
                      </span>
                    ) : app.paymentStatus === 'unpaid' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#B86A36]/15 text-[#B86A36] text-xs font-mono font-bold border border-[#B86A36]/30">
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
                      className="px-4 py-2 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-white text-xs font-medium transition-colors"
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
