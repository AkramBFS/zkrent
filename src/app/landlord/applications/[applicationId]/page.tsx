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
  Lock,
  EyeOff,
  UserCheck,
  FileCheck2,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  FileText,
  Clock,
  Send,
  Mail,
  User,
  Check,
  X,
} from 'lucide-react';

export default function LandlordApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;
  const {
    getApplication,
    getProperty,
    requestReveal,
    fetchApplications,
  } = useZkRent();
  const prefersReduced = useReducedMotion();

  const application = getApplication(applicationId);
  const property = application ? getProperty(application.propertyId) : undefined;
  const [requestSent, setRequestSent] = useState(false);
  const [leaseOfferedMessage, setLeaseOfferedMessage] = useState(false);

  const handleRequestReveal = async () => {
    await requestReveal(applicationId);
    setRequestSent(true);
  };

  const handleOfferLease = async () => {
    try {
      await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'LEASE_OFFERED' }),
      });
      await fetchApplications();
    } catch (e) {
      console.error(e);
    }
    setLeaseOfferedMessage(true);
  };

  if (!application) {
    return (
      <div className="min-h-screen bg-[#E5E0D8] py-16 px-4 flex items-center justify-center">
        <FadeIn className="bg-[#FAFAFA] p-8 rounded-xl border border-[#E5E0D8] max-w-md text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#908682] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#231F20]">Application Not Found</h2>
          <Link
            href="/landlord/applications"
            className="inline-block px-5 py-2.5 rounded-md bg-[#231F20] text-white text-sm font-medium"
          >
            Return to Inquiries
          </Link>
        </FadeIn>
      </div>
    );
  }

  const isEligible = application.status === 'verified_eligible' || application.status === 'lease_offered';
  const hasProof = !!application.verification;

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-8 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back Link */}
        <FadeIn className="flex items-center justify-between">
          <Link
            href="/landlord/applications"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3D3531] hover:text-[#231F20] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to all applicant inquiries</span>
          </Link>

          <ApplicantIdTag id={application.applicantDisplayId} size="md" />
        </FadeIn>

        {/* Main Application Card */}
        <FadeIn delay={0.08}>
          <MotionCard className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#231F20]/10">
              <div>
                <span className="text-xs font-mono text-[#B86A36] font-bold uppercase tracking-wider">
                  Anonymous Applicant Inquiry
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#231F20] mt-1">
                  Applicant {application.applicantDisplayId}
                </h1>
                <p className="text-xs text-[#3D3531] mt-0.5">
                  Applied for <strong>{application.propertyTitle}</strong> • {application.propertyAddress}
                </p>
              </div>

              <div className="sm:text-right">
                <div className="font-serif text-2xl font-bold text-[#231F20]">
                  ${application.propertyPrice.toLocaleString()}
                </div>
                <span className="text-xs font-mono text-[#3D3531]">monthly rent</span>
              </div>
            </div>

            {/* Verdict Display Banner */}
            <div className="p-6 rounded-xl bg-[#231F20] text-[#E5E0D8] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <div className="text-xs font-mono text-[#00A8E8] font-semibold uppercase">
                  Zero-Knowledge Proof Evaluation
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  {isEligible
                    ? 'VERIFIED ELIGIBLE'
                    : application.status === 'verified_ineligible'
                    ? 'INELIGIBLE (CRITERIA NOT MET)'
                    : 'AWAITING TENANT PROOF'}
                </h2>
                <p className="text-xs text-[#908682] max-w-md">
                  {isEligible
                    ? 'This applicant’s private witness satisfies all required thresholds on the Midnight smart contract.'
                    : 'The applicant has not yet completed on-device proof generation.'}
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

            {/* Parameter Satisfaction Checklist */}
            {application.verification && (
              <div className="p-5 rounded-xl bg-[#E5E0D8] border border-[#231F20]/10 space-y-3 font-mono text-xs">
                <div className="font-bold text-[#231F20] uppercase tracking-wider text-[11px]">
                  Cryptographically Verified Requirements
                </div>

                <StaggerContainer className="space-y-2">
                  <StaggerItem className="flex items-center justify-between py-2 border-b border-[#231F20]/10">
                    <span className="text-[#231F20]">
                      1. Income Threshold (≥ ${(application.verification.requirements.income.required).toLocaleString()} / yr)
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#4A6B32] font-bold">
                      <Check className="w-4 h-4" /> Satisfied (Private Witness)
                    </span>
                  </StaggerItem>

                  <StaggerItem className="flex items-center justify-between py-2 border-b border-[#231F20]/10">
                    <span className="text-[#231F20]">2. Criminal & Eviction Background Check</span>
                    <span className="inline-flex items-center gap-1 text-[#4A6B32] font-bold">
                      <Check className="w-4 h-4" /> Clear (Attested)
                    </span>
                  </StaggerItem>

                  <StaggerItem className="flex items-center justify-between py-2">
                    <span className="text-[#231F20]">3. Active Employment Status</span>
                    <span className="inline-flex items-center gap-1 text-[#4A6B32] font-bold">
                      <Check className="w-4 h-4" /> Active (Attested)
                    </span>
                  </StaggerItem>
                </StaggerContainer>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* IDENTITY REVEAL / LEASE DRAFTING WORKFLOW CARD */}
            {/* ------------------------------------------------------------- */}
            <div className="p-6 rounded-xl bg-white border border-[#231F20]/15 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#231F20] text-[#B86A36] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-[#B86A36] uppercase tracking-wider">
                    Next Step: Lease Agreement
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#231F20]">
                    Applicant Identity & Contact Reveal
                  </h3>
                  <p className="text-xs text-[#3D3531] leading-relaxed">
                    To maintain strict privacy, the tenant’s legal name and contact information are hidden until
                    you are ready to draft a lease and the tenant authorizes the reveal.
                  </p>
                </div>
              </div>

              {/* State 1: Identity has been consented and revealed */}
              {application.revealStatus === 'granted' ? (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✓ Tenant Authorized Identity Reveal</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-[#231F20]">
                    <div className="p-3 rounded bg-white border border-emerald-200">
                      <div className="text-[10px] text-[#908682]">Legal Tenant Name</div>
                      <div className="font-bold text-sm mt-0.5">{application.tenantName}</div>
                    </div>
                    <div className="p-3 rounded bg-white border border-emerald-200">
                      <div className="text-[10px] text-[#908682]">Direct Email</div>
                      <div className="font-bold text-sm mt-0.5">{application.tenantEmail}</div>
                    </div>
                    <div className="p-3 rounded bg-white border border-emerald-200">
                      <div className="text-[10px] text-[#908682]">Phone Number</div>
                      <div className="font-bold text-sm mt-0.5">{application.tenantPhone}</div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-emerald-800 font-mono">
                      {leaseOfferedMessage ? '✓ Lease offered to tenant!' : 'Ready to finalize contract.'}
                    </span>

                    {!leaseOfferedMessage && (
                      <motion.button
                        whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                        whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                        onClick={handleOfferLease}
                        className="px-5 py-2.5 rounded-md bg-[#4A6B32] hover:bg-[#3A5427] text-white font-bold text-xs font-mono shadow transition-colors cursor-pointer"
                      >
                        Send Formal Lease Offer →
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ) : application.revealStatus === 'requested' || requestSent ? (
                /* State 2: Reveal requested, waiting on tenant */
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-amber-50 border border-amber-300 space-y-2 text-xs font-mono text-amber-900"
                >
                  <div className="flex items-center gap-2 font-bold">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Identity Reveal Request Pending Tenant Consent</span>
                  </div>
                  <p className="text-[#3D3531]">
                    A notification was dispatched to applicant {application.applicantDisplayId}. Once they confirm,
                    their legal name and contact details will appear here.
                  </p>
                </motion.div>
              ) : (
                /* State 3: Unrequested */
                <div className="pt-2">
                  <motion.button
                    whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                    onClick={handleRequestReveal}
                    disabled={!isEligible}
                    className="w-full sm:w-auto px-6 py-3 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white font-bold text-xs font-mono shadow transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Request Tenant Identity for Lease Drafting</span>
                  </motion.button>
                </div>
              )}
            </div>

            {/* Expandable Proof Receipt Drawer */}
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
          </MotionCard>
        </FadeIn>
      </div>
    </div>
  );
}
