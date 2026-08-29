'use client';

import React from 'react';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ApplicantIdTag } from '@/components/ZkBadges';
import { VerifyReceiptDrawer } from '@/components/VerifyReceiptDrawer';
import { motion, useReducedMotion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard } from '@/components/motion/motion';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  History,
  FileCheck2,
  Calendar,
} from 'lucide-react';

export default function TenantVerificationHistoryPage() {
  const { applications } = useZkRent();
  const prefersReduced = useReducedMotion();

  // Applications that have completed verification
  const verifiedApplications = applications.filter((a) => a.verification);

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-8 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <FadeIn className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#231F20]/10">
          <div>
            <span className="font-mono text-xs text-[#4A6B32] font-bold uppercase tracking-widest">
              Cryptographic Records
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#231F20] mt-1">
              Zero-Knowledge Proof Vault
            </h1>
            <p className="text-sm text-[#3D3531] mt-1">
              Inspect on-chain proof receipts, Halo2 circuit constraints, and verification nullifiers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded bg-[#231F20] text-[#00A8E8] font-mono text-xs border border-[#00A8E8]/30">
              Midnight Testnet Halo2
            </span>
          </div>
        </FadeIn>

        {/* Info Banner */}
        <FadeIn delay={0.08}>
          <MotionCard className="bg-[#231F20] text-[#E5E0D8] p-5 rounded-xl border border-[#00A8E8]/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#00A8E8] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#908682] space-y-1">
              <strong className="text-white">Tamper-Proof Receipt Records:</strong> Each verification
              receipt below represents a zero-knowledge circuit evaluated on your device and registered to
              the Midnight Network smart contract. Landlords verify satisfaction against these mathematical receipts.
            </div>
          </MotionCard>
        </FadeIn>

        {/* Verifications List */}
        {verifiedApplications.length === 0 ? (
          <FadeIn className="p-12 text-center bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] space-y-3">
            <ShieldCheck className="w-10 h-10 text-[#908682] mx-auto" />
            <h3 className="font-serif text-xl font-bold text-[#231F20]">No ZK Proofs Generated Yet</h3>
            <p className="text-sm text-[#3D3531]">Complete an application payment and run the on-device prover.</p>
            <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }} className="inline-block">
              <Link
                href="/properties"
                className="inline-block px-4 py-2 rounded bg-[#231F20] text-white text-xs font-mono"
              >
                Browse Properties
              </Link>
            </motion.div>
          </FadeIn>
        ) : (
          <StaggerContainer className="space-y-6">
            {verifiedApplications.map((app) => {
              const v = app.verification!;

              return (
                <StaggerItem key={app.id}>
                  <MotionCard className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#231F20]/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <ApplicantIdTag id={app.applicantDisplayId} size="sm" />
                          <span className="text-xs font-mono text-[#908682]">
                            Verified on {new Date(v.verifiedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                            {new Date(v.verifiedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-[#231F20] mt-1">
                          {app.propertyTitle}
                        </h3>
                        <p className="text-xs text-[#3D3531]">{app.propertyAddress}</p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                            v.eligible
                              ? 'bg-[#4A6B32]/20 text-[#3A5427] border-[#4A6B32]/40'
                              : 'bg-[#E85D31]/15 text-[#E85D31] border-[#E85D31]/30'
                          }`}
                        >
                          {v.eligible ? '✓ Eligible (3 / 3 Requirements)' : '✕ Ineligible'}
                        </span>
                        <span className="text-[11px] font-mono text-[#908682]">
                          Proving time: {v.zkMetrics.provingTimeMs}ms
                        </span>
                      </div>
                    </div>

                    {/* Verifiable Receipt Drawer Component */}
                    <VerifyReceiptDrawer
                      proof={v}
                      applicantDisplayId={app.applicantDisplayId}
                      propertyTitle={app.propertyTitle}
                      defaultExpanded={false}
                    />

                    {/* Actions footer */}
                    <div className="flex items-center justify-between pt-2">
                      <Link
                        href={`/tenant/verification/${app.id}`}
                        className="text-xs font-mono text-[#B86A36] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Open Fullscreen Audit View</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                        <Link
                          href={`/tenant/applications/${app.id}`}
                          className="px-4 py-2 rounded bg-[#231F20] text-white text-xs font-mono hover:bg-[#3D3531] transition-colors inline-block"
                        >
                          View Application Details →
                        </Link>
                      </motion.div>
                    </div>
                  </MotionCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
