'use client';

import React from 'react';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ZkVerifiedBadge, ApplicantIdTag } from '@/components/ZkBadges';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  MotionCard,
  AnimatedNumber,
  LUXURY_EASE,
} from '@/components/motion/motion';
import {
  Building2,
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  FileCheck2,
  EyeOff,
  Home,
} from 'lucide-react';

export default function LandlordDashboardPage() {
  const { properties, applications } = useZkRent();
  const prefersReduced = useReducedMotion();

  const totalProperties = properties.length;
  const totalApplications = applications.length;
  const verifiedCount = applications.filter((a) => a.status === 'verified_eligible' || a.status === 'lease_offered').length;
  const pendingCount = applications.filter((a) => a.status === 'pending_verification' || a.status === 'pending_payment').length;

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Greeting Header */}
        <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#231F20]/10">
          <div>
            <span className="font-mono text-xs text-[#B86A36] font-bold uppercase tracking-widest">
              Landlord Portal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#231F20] mt-1">
              Good morning, Property Manager
            </h1>
            <p className="text-sm text-[#3D3531] mt-1">
              Review privacy-preserving Zero-Knowledge applicant qualifications for your listings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
              <Link
                href="/landlord/properties/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white text-sm font-medium shadow transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Create Free Listing</span>
              </Link>
            </motion.div>
          </div>
        </FadeIn>

        {/* Statistics Tiles with Animated Numbers */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StaggerItem>
            <MotionCard className="p-5 rounded-xl bg-[#FAFAFA] border border-[#E5E0D8] space-y-2 h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#3D3531]">Active Properties</span>
                <Building2 className="w-4 h-4 text-[#B86A36]" />
              </div>
              <div className="font-serif text-3xl font-bold text-[#231F20]">
                <AnimatedNumber value={totalProperties} />
              </div>
              <div className="text-[11px] font-mono text-[#908682]">Free listings published</div>
            </MotionCard>
          </StaggerItem>

          <StaggerItem>
            <MotionCard className="p-5 rounded-xl bg-[#FAFAFA] border border-[#E5E0D8] space-y-2 h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#3D3531]">Total Applications</span>
                <Users className="w-4 h-4 text-[#231F20]" />
              </div>
              <div className="font-serif text-3xl font-bold text-[#231F20]">
                <AnimatedNumber value={totalApplications} />
              </div>
              <div className="text-[11px] font-mono text-[#908682]">Anonymized tenant applicants</div>
            </MotionCard>
          </StaggerItem>

          <StaggerItem>
            <MotionCard className="p-5 rounded-xl bg-[#FAFAFA] border border-[#E5E0D8] space-y-2 h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#4A6B32]">Verified Eligible</span>
                <ShieldCheck className="w-4 h-4 text-[#4A6B32]" />
              </div>
              <div className="font-serif text-3xl font-bold text-[#4A6B32]">
                <AnimatedNumber value={verifiedCount} />
              </div>
              <div className="text-[11px] font-mono text-[#908682]">Midnight ZK math validated</div>
            </MotionCard>
          </StaggerItem>
        </StaggerContainer>

        {/* Hard Rule Notice Banner */}
        <FadeIn delay={0.1}>
          <MotionCard className="bg-[#231F20] text-[#E5E0D8] p-4 rounded-xl border border-[#00A8E8]/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#231F20] border border-[#00A8E8]/40 flex items-center justify-center text-[#00A8E8] flex-shrink-0">
                <EyeOff className="w-4 h-4" />
              </div>
              <div className="text-xs font-mono">
                <span className="text-[#00A8E8] font-bold">Zero-Knowledge Privacy Standard:</span> Applicants
                remain anonymized (#A81F) with zero raw salary, bank, or tax data exposed. Only
                cryptographically verifiable outcomes and receipts are surfaced.
              </div>
            </div>
          </MotionCard>
        </FadeIn>

        {/* 2-Column Section: Recent Applicants Feed & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Applicant Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <FadeIn className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#231F20]">
                Recent Anonymous Applications
              </h2>
              <Link
                href="/landlord/applications"
                className="text-xs font-mono text-[#231F20] hover:text-[#B86A36] font-semibold"
              >
                View all ({applications.length})
              </Link>
            </FadeIn>

            <StaggerContainer className="space-y-3">
              {applications.map((app) => (
                <StaggerItem key={app.id}>
                  <MotionCard className="bg-[#FAFAFA] p-5 rounded-xl border border-[#E5E0D8] shadow-sm hover:shadow transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <ApplicantIdTag id={app.applicantDisplayId} size="md" />
                          <span className="text-xs font-mono text-[#908682]">
                            {new Date(app.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          {app.revealStatus === 'granted' && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">
                              Identity Consented
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-lg font-bold text-[#231F20]">
                          {app.propertyTitle}
                        </h3>
                        <p className="text-xs text-[#3D3531]">{app.propertyAddress}</p>
                      </div>

                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                        <div className="font-serif font-bold text-base text-[#231F20]">
                          ${app.propertyPrice.toLocaleString()} / mo
                        </div>
                        <div className="mt-1">
                          {app.status === 'verified_eligible' || app.status === 'lease_offered' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4A6B32]/20 text-[#3A5427] text-xs font-mono font-bold border border-[#4A6B32]/40">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B32]" />
                              ✓ ZK VERIFIED: Eligible
                            </span>
                          ) : app.status === 'verified_ineligible' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E85D31]/15 text-[#E85D31] text-xs font-mono font-bold border border-[#E85D31]/30">
                              Ineligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold">
                              Pending ZK Proof
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#231F20]/10 flex items-center justify-between">
                      <div className="text-xs font-mono text-[#908682]">
                        {app.verification ? (
                          <span>Tx: {app.verification.midnightTxHash.substring(0, 16)}...</span>
                        ) : (
                          <span>Awaiting tenant proof synthesis</span>
                        )}
                      </div>

                      <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                        <Link
                          href={`/landlord/applications/${app.id}`}
                          className="px-4 py-1.5 rounded bg-[#00A8E8] hover:bg-[#0277BD] text-white text-xs font-medium transition-colors inline-block"
                        >
                          Review Applicant & Proof →
                        </Link>
                      </motion.div>
                    </div>
                  </MotionCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* Quick Actions & Property Management (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <FadeIn delay={0.1}>
              <MotionCard className="bg-[#FAFAFA] p-6 rounded-xl border border-[#E5E0D8] space-y-4">
                <h3 className="font-serif font-bold text-base text-[#231F20]">
                  Landlord Quick Actions
                </h3>
                <div className="space-y-2">
                  <motion.div whileHover={prefersReduced ? undefined : { x: 3 }}>
                    <Link
                      href="/landlord/properties/new"
                      className="flex items-center justify-between p-3 rounded-lg bg-[#B86A36] text-white text-xs font-mono font-bold shadow hover:bg-[#A05A2C] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        + Create New Listing (Free)
                      </span>
                      <span>→</span>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={prefersReduced ? undefined : { x: 3 }}>
                    <Link
                      href="/landlord/properties"
                      className="flex items-center justify-between p-3 rounded-lg bg-[#E5E0D8] hover:bg-[#E5E0D8]/80 text-xs font-mono text-[#231F20] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#B86A36]" />
                        Manage Properties ({properties.length})
                      </span>
                      <span>→</span>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={prefersReduced ? undefined : { x: 3 }}>
                    <Link
                      href="/landlord/applications"
                      className="flex items-center justify-between p-3 rounded-lg bg-[#E5E0D8] hover:bg-[#E5E0D8]/80 text-xs font-mono text-[#231F20] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#4A6B32]" />
                        Review All Applications ({applications.length})
                      </span>
                      <span>→</span>
                    </Link>
                  </motion.div>
                </div>
              </MotionCard>
            </FadeIn>

            {/* Properties Overview Mini Card */}
            <FadeIn delay={0.15}>
              <MotionCard className="bg-[#FAFAFA] p-6 rounded-xl border border-[#E5E0D8] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-[#231F20]">
                    Active Listings
                  </h4>
                  <Link href="/landlord/properties" className="text-xs font-mono text-[#B86A36] hover:underline">
                    All
                  </Link>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  {properties.slice(0, 3).map((p) => (
                    <motion.div
                      key={p.id}
                      whileHover={prefersReduced ? undefined : { x: 2 }}
                      className="p-2.5 rounded bg-white border border-[#231F20]/10 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="font-bold text-[#231F20]">{p.title}</div>
                        <div className="text-[11px] text-[#908682]">${p.price.toLocaleString()}/mo</div>
                      </div>
                      <Link
                        href={`/landlord/properties/${p.id}`}
                        className="text-[#B86A36] hover:underline"
                      >
                        Manage
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </MotionCard>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
