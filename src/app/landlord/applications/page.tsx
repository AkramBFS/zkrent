'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ZkVerifiedBadge, ApplicantIdTag } from '@/components/ZkBadges';
import { motion, useReducedMotion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard } from '@/components/motion/motion';
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
  const prefersReduced = useReducedMotion();

  const filteredApplications = applications.filter((app) => {
    if (filter === 'eligible') return app.status === 'verified_eligible' || app.status === 'lease_offered';
    if (filter === 'pending') return app.status === 'pending_payment' || app.status === 'pending_verification';
    if (filter === 'rejected') return app.status === 'verified_ineligible';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <FadeIn className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#231F20]/10">
          <div>
            <span className="font-mono text-xs text-[#B86A36] font-bold uppercase tracking-widest">
              Applicant Review
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#231F20] mt-1">
              Anonymous Applicant Inquiries
            </h1>
            <p className="text-sm text-[#3D3531] mt-1">
              Review mathematical Zero-Knowledge eligibility outcomes. No raw financial documents are exposed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded bg-[#231F20] text-[#00A8E8] font-mono text-xs border border-[#00A8E8]/30">
              Midnight ZK Protocol
            </span>
          </div>
        </FadeIn>

        {/* Filter Tabs with Animated Layout Pill */}
        <FadeIn delay={0.08} className="flex gap-2 border-b border-[#231F20]/10 pb-2 overflow-x-auto">
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
              className={`relative px-4 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'text-white font-bold'
                  : 'bg-[#FAFAFA] text-[#3D3531] hover:bg-[#E5E0D8] border border-[#231F20]/10'
              }`}
            >
              {filter === tab.id && (
                <motion.div
                  layoutId="landlord-filter-pill"
                  className="absolute inset-0 bg-[#231F20] rounded-lg z-0"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </FadeIn>

        {/* Applications Feed */}
        {filteredApplications.length === 0 ? (
          <FadeIn className="p-12 text-center bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] space-y-3">
            <ShieldCheck className="w-10 h-10 text-[#908682] mx-auto" />
            <h3 className="font-serif text-xl font-bold text-[#231F20]">No Applications in this Category</h3>
            <p className="text-sm text-[#3D3531]">Check back once prospective tenants submit proof verifications.</p>
          </FadeIn>
        ) : (
          <StaggerContainer className="space-y-4">
            {filteredApplications.map((app) => (
              <StaggerItem key={app.id}>
                <MotionCard className="bg-[#FAFAFA] p-6 rounded-xl border border-[#E5E0D8] shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ApplicantIdTag id={app.applicantDisplayId} size="sm" />
                      <span className="text-xs font-mono text-[#908682]">
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

                    <h3 className="font-serif text-xl font-bold text-[#231F20]">
                      {app.propertyTitle}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-[#3D3531]">
                      <MapPin className="w-3.5 h-3.5 text-[#B86A36]" />
                      <span>{app.propertyAddress}</span>
                    </div>

                    <div className="pt-1 flex items-center gap-3 text-xs font-mono text-[#3D3531]">
                      <span className="font-bold text-[#231F20]">
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
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-[#231F20]/10">
                    <div>
                      {app.status === 'verified_eligible' || app.status === 'lease_offered' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#4A6B32]/20 text-[#3A5427] text-xs font-mono font-bold border border-[#4A6B32]/40">
                          <CheckCircle2 className="w-4 h-4 text-[#4A6B32]" />
                          ✓ ZK VERIFIED: Eligible
                        </span>
                      ) : app.status === 'verified_ineligible' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E85D31]/15 text-[#E85D31] text-xs font-mono font-bold border border-[#E85D31]/30">
                          Ineligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold">
                          Pending Proof
                        </span>
                      )}
                    </div>

                    <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                      <Link
                        href={`/landlord/applications/${app.id}`}
                        className="px-4 py-2 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-white text-xs font-medium transition-colors inline-block"
                      >
                        Inspect Proof & Manage →
                      </Link>
                    </motion.div>
                  </div>
                </MotionCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
