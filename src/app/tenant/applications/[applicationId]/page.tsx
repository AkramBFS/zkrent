'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ZkVerifiedBadge, ApplicantIdTag } from '@/components/ZkBadges';
import { VerifyReceiptDrawer } from '@/components/VerifyReceiptDrawer';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, LUXURY_EASE } from '@/components/motion/motion';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Building,
  DollarSign,
  Lock,
  EyeOff,
  UserCheck,
  FileCheck2,
  Sparkles,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function TenantApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;
  const {
    getApplication,
    getProperty,
    grantRevealConsent,
    declineRevealConsent,
  } = useZkRent();
  const prefersReduced = useReducedMotion();

  const application = getApplication(applicationId);
  const property = application ? getProperty(application.propertyId) : undefined;
  const [consentSuccess, setConsentSuccess] = useState<string | null>(null);

  if (!application) {
    return (
      <div className="min-h-screen bg-[#E5E0D8] py-16 px-4 flex items-center justify-center">
        <FadeIn className="bg-[#FAFAFA] p-8 rounded-xl border border-[#E5E0D8] max-w-md text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#908682] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#231F20]">Application Not Found</h2>
          <Link
            href="/tenant/applications"
            className="inline-block px-5 py-2.5 rounded-md bg-[#231F20] text-white text-sm font-medium"
          >
            Return to Applications
          </Link>
        </FadeIn>
      </div>
    );
  }

  const isEligible = application.status === 'verified_eligible' || application.status === 'lease_offered';
  const isPaid = application.paymentStatus === 'paid';
  const isVerified = !!application.verification;

  const handleGrantConsent = async () => {
    await grantRevealConsent(application.id);
    setConsentSuccess('Identity information securely authorized for lease drafting!');
  };

  const handleDeclineConsent = async () => {
    await declineRevealConsent(application.id);
  };

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-8 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back Link */}
        <FadeIn className="flex items-center justify-between">
          <Link
            href="/tenant/applications"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3D3531] hover:text-[#231F20] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to all applications</span>
          </Link>

          <ApplicantIdTag id={application.applicantDisplayId} size="md" />
        </FadeIn>

        {/* Application Header Card */}
        <FadeIn delay={0.08}>
          <MotionCard className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#231F20]/10">
              <div>
                <span className="text-xs font-mono text-[#B86A36] font-bold uppercase tracking-wider">
                  Application #{application.applicantDisplayId}
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#231F20] mt-1">
                  {application.propertyTitle}
                </h1>
                <p className="text-xs text-[#3D3531] mt-0.5">{application.propertyAddress}</p>
              </div>

              <div className="sm:text-right">
                <div className="font-serif text-2xl font-bold text-[#231F20]">
                  ${application.propertyPrice.toLocaleString()}
                </div>
                <span className="text-xs font-mono text-[#3D3531]">monthly rent</span>
              </div>
            </div>

            {/* 4-Stage Lifecycle Checklist */}
            <div className="space-y-3">
              <h3 className="font-mono text-xs font-bold text-[#231F20] uppercase tracking-wider">
                Application Lifecycle
              </h3>
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
                {/* Stage 1 */}
                <StaggerItem>
                  <div className="p-3 rounded-lg bg-[#E5E0D8] border border-[#231F20]/10 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4A6B32]" />
                    <span className="font-semibold text-[#231F20]">Application Created</span>
                  </div>
                </StaggerItem>

                {/* Stage 2 */}
                <StaggerItem>
                  <div
                    className={`p-3 rounded-lg border flex items-center gap-2 ${
                      isPaid
                        ? 'bg-[#E5E0D8] border-[#231F20]/10 text-[#231F20]'
                        : 'bg-white border-[#B86A36] text-[#B86A36]'
                    }`}
                  >
                    {isPaid ? (
                      <CheckCircle2 className="w-4 h-4 text-[#4A6B32]" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#B86A36]" />
                    )}
                    <span className="font-semibold">{isPaid ? 'Fee Paid ($5.00)' : 'Fee Unpaid'}</span>
                  </div>
                </StaggerItem>

                {/* Stage 3 */}
                <StaggerItem>
                  <div
                    className={`p-3 rounded-lg border flex items-center gap-2 ${
                      isVerified
                        ? 'bg-[#E5E0D8] border-[#231F20]/10 text-[#231F20]'
                        : 'bg-white border-white/20 text-[#908682]'
                    }`}
                  >
                    {isVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-[#4A6B32]" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#908682]" />
                    )}
                    <span className="font-semibold">Credentials Verified</span>
                  </div>
                </StaggerItem>

                {/* Stage 4 */}
                <StaggerItem>
                  <div
                    className={`p-3 rounded-lg border flex items-center gap-2 ${
                      isVerified
                        ? 'bg-[#E5E0D8] border-[#231F20]/10 text-[#231F20]'
                        : 'bg-white border-white/20 text-[#908682]'
                    }`}
                  >
                    {isVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-[#4A6B32]" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#908682]" />
                    )}
                    <span className="font-semibold">Midnight Proof Sealed</span>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>

            {/* Verdict Banner */}
            <div className="p-6 rounded-xl bg-[#231F20] text-[#E5E0D8] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <div className="text-xs font-mono text-[#00A8E8] font-semibold uppercase">
                  Midnight ZK Verification Outcome
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  {isEligible
                    ? 'QUALIFIED & ELIGIBLE'
                    : application.status === 'verified_ineligible'
                    ? 'CRITERIA NOT MET'
                    : 'VERIFICATION PENDING'}
                </h2>
                <p className="text-xs text-[#908682] max-w-md">
                  {isEligible
                    ? 'Your private zero-knowledge credentials satisfy all landlord qualification rules. No raw documents were revealed.'
                    : application.status === 'verified_ineligible'
                    ? 'Your on-device credentials did not meet the landlord’s qualification criteria.'
                    : 'Please complete payment and run the on-device proof generator.'}
                </p>
              </div>

              <div className="flex-shrink-0">
                <StampedSeal
                  status={
                    isEligible
                      ? 'eligible'
                      : application.status === 'verified_ineligible'
                      ? 'ineligible'
                      : 'pending'
                  }
                  size="md"
                />
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* TENANT CONSENT REVEAL CARD (EXPLICIT TENANT CONSENT STEP) */}
            {/* ------------------------------------------------------------- */}
            <AnimatePresence>
              {application.revealStatus === 'requested' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: LUXURY_EASE }}
                  className="p-6 rounded-xl bg-[#FAFAFA] border-2 border-[#B86A36] space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#231F20] text-[#B86A36] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-[#B86A36] uppercase tracking-wider">
                        Consent Request from Landlord
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#231F20]">
                        Landlord is Ready to Draft Your Lease
                      </h3>
                      <p className="text-xs text-[#3D3531] leading-relaxed">
                        The property owner for <strong>{application.propertyTitle}</strong> has reviewed your
                        eligible ZK proof and wants to proceed with lease drafting. Would you like to authorize
                        sharing your legal name (<strong>{application.tenantName}</strong>) and contact details (
                        {application.tenantEmail})?
                      </p>
                    </div>
                  </div>

                  {consentSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-mono"
                    >
                      ✓ {consentSuccess}
                    </motion.div>
                  ) : (
                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <motion.button
                        whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                        whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                        onClick={handleGrantConsent}
                        className="flex-1 py-3 px-4 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white font-bold text-xs font-mono transition-colors shadow cursor-pointer"
                      >
                        ✓ Yes, Authorize Reveal for Lease Drafting
                      </motion.button>
                      <motion.button
                        whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                        whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                        onClick={handleDeclineConsent}
                        className="py-3 px-4 rounded-md bg-white border border-[#231F20]/20 text-[#231F20] font-mono text-xs hover:bg-[#E5E0D8] transition-colors cursor-pointer"
                      >
                        ✕ Decline (Remain Anonymized)
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {application.revealStatus === 'granted' && (
              <FadeIn className="p-4 rounded-lg bg-[#4A6B32]/15 border border-[#4A6B32]/30 text-xs font-mono text-[#3A5427] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4A6B32]" />
                  <span>Identity consented & revealed to landlord for lease preparation.</span>
                </span>
                <span className="text-[11px] font-bold text-[#4A6B32]">Lease In Progress</span>
              </FadeIn>
            )}

            {/* Expandable Inspectable Proof Receipt */}
            {application.verification && (
              <div className="pt-2">
                <VerifyReceiptDrawer
                  proof={application.verification}
                  applicantDisplayId={application.applicantDisplayId}
                  propertyTitle={application.propertyTitle}
                  defaultExpanded={false}
                />
              </div>
            )}

            {/* Quick links & Actions */}
            <div className="pt-4 border-t border-[#231F20]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href={`/properties/${application.propertyId}`}
                className="text-xs font-mono text-[#231F20] hover:text-[#B86A36] font-semibold"
              >
                ← View Property Details
              </Link>

              {application.paymentStatus === 'unpaid' ? (
                <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                  <Link
                    href={`/tenant/applications/${application.id}/payment`}
                    className="px-5 py-2.5 rounded-md bg-[#B86A36] text-white font-bold text-xs font-mono inline-block shadow"
                  >
                    Pay $5.00 Verification Fee →
                  </Link>
                </motion.div>
              ) : application.status === 'pending_verification' ? (
                <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                  <Link
                    href={`/tenant/applications/${application.id}/verify`}
                    className="px-5 py-2.5 rounded-md bg-[#231F20] text-white font-bold text-xs font-mono inline-block shadow"
                  >
                    Launch ZK Prover →
                  </Link>
                </motion.div>
              ) : null}
            </div>
          </MotionCard>
        </FadeIn>
      </div>
    </div>
  );
}
