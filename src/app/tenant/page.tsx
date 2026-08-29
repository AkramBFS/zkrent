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
  ShieldCheck,
  Building,
  Home,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Lock,
  EyeOff,
  History,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function TenantDashboardPage() {
  const { applications, currentUser, properties } = useZkRent();
  const prefersReduced = useReducedMotion();

  // Tenant's applications
  const myApplications = applications;
  const verifiedCount = myApplications.filter((a) => a.status === 'verified_eligible').length;
  const pendingCount = myApplications.filter((a) => a.status === 'pending_payment' || a.status === 'pending_verification').length;
  const pendingReveals = myApplications.filter((a) => a.revealStatus === 'requested');

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Greeting Header */}
        <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#231F20]/10">
          <div>
            <span className="font-mono text-xs text-[#B86A36] font-bold uppercase tracking-widest">
              Tenant Portal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#231F20] mt-1">
              Good morning, {currentUser.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-[#3D3531] mt-1">
              Manage your private rental applications and Midnight ZK proofs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-white text-sm font-medium shadow transition-all"
              >
                <Home className="w-4 h-4 text-[#B86A36]" />
                <span>Browse Properties</span>
              </Link>
            </motion.div>
          </div>
        </FadeIn>

        {/* Reveal Consent Action Banner (if landlord requested reveal) */}
        {pendingReveals.length > 0 && (
          <FadeIn>
            <MotionCard className="p-5 rounded-xl bg-[#231F20] text-[#E5E0D8] border border-[#B86A36] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B86A36] animate-ping" />
                  <span className="font-mono text-xs text-[#B86A36] font-bold uppercase tracking-wider">
                    Action Required: Landlord Lease Reveal Request
                  </span>
                </div>
                <p className="text-sm text-white">
                  The landlord for <strong className="text-[#B86A36]">{pendingReveals[0].propertyTitle}</strong> is ready to draft a lease and requested to view your legal name and contact information.
                </p>
              </div>
              <motion.div whileHover={prefersReduced ? undefined : { scale: 1.03 }} whileTap={prefersReduced ? undefined : { scale: 0.97 }}>
                <Link
                  href={`/tenant/applications/${pendingReveals[0].id}`}
                  className="px-4 py-2 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white text-xs font-mono font-bold whitespace-nowrap shadow transition-colors inline-block"
                >
                  Review Consent Request →
                </Link>
              </motion.div>
            </MotionCard>
          </FadeIn>
        )}

        {/* Metric Tiles with Animated Counters */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StaggerItem>
            <MotionCard className="p-5 rounded-xl bg-[#FAFAFA] border border-[#E5E0D8] space-y-2 h-full">
              <div className="text-xs font-mono text-[#3D3531]">Active Applications</div>
              <div className="font-serif text-3xl font-bold text-[#231F20]">
                <AnimatedNumber value={myApplications.length} />
              </div>
              <div className="text-[11px] font-mono text-[#908682]">Submissions in review</div>
            </MotionCard>
          </StaggerItem>

          <StaggerItem>
            <MotionCard className="p-5 rounded-xl bg-[#FAFAFA] border border-[#E5E0D8] space-y-2 h-full">
              <div className="text-xs font-mono text-[#4A6B32]">Verified Eligible</div>
              <div className="font-serif text-3xl font-bold text-[#4A6B32]">
                <AnimatedNumber value={verifiedCount} />
              </div>
              <div className="text-[11px] font-mono text-[#908682]">Proofs accepted on-chain</div>
            </MotionCard>
          </StaggerItem>

          <StaggerItem>
            <MotionCard className="p-5 rounded-xl bg-[#FAFAFA] border border-[#E5E0D8] space-y-2 h-full">
              <div className="text-xs font-mono text-[#B86A36]">Pending Verification</div>
              <div className="font-serif text-3xl font-bold text-[#B86A36]">
                <AnimatedNumber value={pendingCount} />
              </div>
              <div className="text-[11px] font-mono text-[#908682]">Ready for proof generation</div>
            </MotionCard>
          </StaggerItem>
        </StaggerContainer>

        {/* 2-Column: Applications Feed & Privacy Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Applications Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <FadeIn className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#231F20]">
                My Rental Applications
              </h2>
              <Link
                href="/tenant/applications"
                className="text-xs font-mono text-[#231F20] hover:text-[#B86A36] font-semibold"
              >
                View all ({myApplications.length})
              </Link>
            </FadeIn>

            <StaggerContainer className="space-y-3">
              {myApplications.map((app) => (
                <StaggerItem key={app.id}>
                  <MotionCard className="bg-[#FAFAFA] p-5 rounded-xl border border-[#E5E0D8] shadow-sm hover:shadow transition-all space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <ApplicantIdTag id={app.applicantDisplayId} size="sm" />
                          <span className="text-xs font-mono text-[#3D3531]">
                            {new Date(app.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-[#231F20] mt-1">
                          {app.propertyTitle}
                        </h3>
                        <p className="text-xs text-[#3D3531]">{app.propertyAddress}</p>
                      </div>

                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                        <div className="font-serif font-bold text-lg text-[#231F20]">
                          ${app.propertyPrice.toLocaleString()} <span className="text-xs font-sans text-[#3D3531]">/mo</span>
                        </div>
                        <div className="mt-1">
                          {app.status === 'verified_eligible' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4A6B32]/20 text-[#3A5427] text-xs font-mono font-bold border border-[#4A6B32]/40">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B32]" />
                              Eligible ✓
                            </span>
                          ) : app.status === 'verified_ineligible' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E85D31]/15 text-[#E85D31] text-xs font-mono font-bold border border-[#E85D31]/30">
                              Not Eligible
                            </span>
                          ) : app.paymentStatus === 'unpaid' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B86A36]/15 text-[#B86A36] text-xs font-mono font-bold border border-[#B86A36]/30">
                              Payment Required
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-mono font-bold">
                              Ready for ZK Proof
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
                          <span>Step: {app.paymentStatus === 'unpaid' ? 'Pay $5 Fee' : 'Generate Proof'}</span>
                        )}
                      </div>

                      <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                        <Link
                          href={
                            app.paymentStatus === 'unpaid'
                              ? `/tenant/applications/${app.id}/payment`
                              : app.status === 'pending_verification'
                              ? `/tenant/applications/${app.id}/verify`
                              : `/tenant/applications/${app.id}`
                          }
                          className="px-4 py-1.5 rounded bg-[#00A8E8] hover:bg-[#0277BD] text-white text-xs font-medium transition-colors inline-block"
                        >
                          {app.paymentStatus === 'unpaid'
                            ? 'Pay Fee ($5.00)'
                            : app.status === 'pending_verification'
                            ? 'Generate ZK Proof →'
                            : 'View Application & Receipt'}
                        </Link>
                      </motion.div>
                    </div>
                  </MotionCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* Quick Actions & Privacy Pledge (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions Card */}
            <FadeIn delay={0.1}>
              <MotionCard className="bg-[#FAFAFA] p-6 rounded-xl border border-[#E5E0D8] space-y-4">
                <h3 className="font-serif font-bold text-base text-[#231F20]">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <motion.div whileHover={prefersReduced ? undefined : { x: 3 }}>
                    <Link
                      href="/properties"
                      className="flex items-center justify-between p-3 rounded-lg bg-[#E5E0D8] hover:bg-[#E5E0D8]/80 text-xs font-mono text-[#231F20] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-[#B86A36]" />
                        Browse Properties
                      </span>
                      <span>→</span>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={prefersReduced ? undefined : { x: 3 }}>
                    <Link
                      href="/tenant/applications"
                      className="flex items-center justify-between p-3 rounded-lg bg-[#E5E0D8] hover:bg-[#E5E0D8]/80 text-xs font-mono text-[#231F20] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#4A6B32]" />
                        View Applications ({myApplications.length})
                      </span>
                      <span>→</span>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={prefersReduced ? undefined : { x: 3 }}>
                    <Link
                      href="/tenant/verification"
                      className="flex items-center justify-between p-3 rounded-lg bg-[#E5E0D8] hover:bg-[#E5E0D8]/80 text-xs font-mono text-[#231F20] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <History className="w-4 h-4 text-[#231F20]" />
                        ZK Proof Receipt Vault
                      </span>
                      <span>→</span>
                    </Link>
                  </motion.div>
                </div>
              </MotionCard>
            </FadeIn>

            {/* Privacy Guarantee Reminder Card */}
            <FadeIn delay={0.15}>
              <MotionCard className="bg-[#231F20] text-[#E5E0D8] p-6 rounded-xl border border-[#00A8E8]/30 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#231F20] border border-[#00A8E8]/40 flex items-center justify-center text-[#00A8E8]">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-white">
                    Privacy Guarantee
                  </h4>
                </div>

                <p className="text-xs text-[#908682] leading-relaxed">
                  Your private financial credentials (salary, tax records, bank statements) are{' '}
                  <strong className="text-white">never stored by ZkRent</strong> and never sent across the network.
                  All proofs execute in isolated WebAssembly inside your browser.
                </p>

                <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-mono text-[#00A8E8]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Midnight Zero-Knowledge v1.2</span>
                </div>
              </MotionCard>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
