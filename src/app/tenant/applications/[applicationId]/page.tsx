'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ZkVerifiedBadge, ApplicantIdTag } from '@/components/ZkBadges';
import { VerifyReceiptDrawer } from '@/components/VerifyReceiptDrawer';
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

  const application = getApplication(applicationId);
  const property = application ? getProperty(application.propertyId) : undefined;
  const [consentSuccess, setConsentSuccess] = useState<string | null>(null);

  if (!application) {
    return (
      <div className="min-h-screen bg-[#EDECE4] py-16 px-4 flex items-center justify-center">
        <div className="bg-[#F6F5F0] p-8 rounded-xl border border-[#14213D]/15 max-w-md text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#8794AD] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#14213D]">Application Not Found</h2>
          <Link
            href="/tenant/applications"
            className="inline-block px-5 py-2.5 rounded-md bg-[#14213D] text-white text-sm font-medium"
          >
            Return to Applications
          </Link>
        </div>
      </div>
    );
  }

  const isEligible = application.status === 'verified_eligible' || application.status === 'lease_offered';
  const isPaid = application.paymentStatus === 'paid';
  const isVerified = !!application.verification;

  const handleGrantConsent = () => {
    grantRevealConsent(application.id);
    setConsentSuccess('Identity information securely authorized for lease drafting!');
  };

  const handleDeclineConsent = () => {
    declineRevealConsent(application.id);
  };

  return (
    <div className="min-h-screen bg-[#EDECE4] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/tenant/applications"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#4B5A79] hover:text-[#14213D]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all applications</span>
          </Link>

          <ApplicantIdTag id={application.applicantDisplayId} size="md" />
        </div>

        {/* Application Header Card */}
        <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#14213D]/10">
            <div>
              <span className="text-xs font-mono text-[#AE8B3F] font-bold uppercase tracking-wider">
                Application #{application.applicantDisplayId}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14213D] mt-1">
                {application.propertyTitle}
              </h1>
              <p className="text-xs text-[#4B5A79] mt-0.5">{application.propertyAddress}</p>
            </div>

            <div className="sm:text-right">
              <div className="font-serif text-2xl font-bold text-[#14213D]">
                ${application.propertyPrice.toLocaleString()}
              </div>
              <span className="text-xs font-mono text-[#4B5A79]">monthly rent</span>
            </div>
          </div>

          {/* 4-Stage Lifecycle Checklist */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold text-[#14213D] uppercase tracking-wider">
              Application Lifecycle
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
              {/* Stage 1 */}
              <div className="p-3 rounded-lg bg-[#EDECE4] border border-[#14213D]/10 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D74]" />
                <span className="font-semibold text-[#14213D]">Application Created</span>
              </div>

              {/* Stage 2 */}
              <div
                className={`p-3 rounded-lg border flex items-center gap-2 ${
                  isPaid
                    ? 'bg-[#EDECE4] border-[#14213D]/10 text-[#14213D]'
                    : 'bg-white border-[#AE8B3F] text-[#AE8B3F]'
                }`}
              >
                {isPaid ? (
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D74]" />
                ) : (
                  <Clock className="w-4 h-4 text-[#AE8B3F]" />
                )}
                <span className="font-semibold">{isPaid ? 'Fee Paid ($5.00)' : 'Fee Unpaid'}</span>
              </div>

              {/* Stage 3 */}
              <div
                className={`p-3 rounded-lg border flex items-center gap-2 ${
                  isVerified
                    ? 'bg-[#EDECE4] border-[#14213D]/10 text-[#14213D]'
                    : 'bg-white border-white/20 text-[#8794AD]'
                }`}
              >
                {isVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D74]" />
                ) : (
                  <Clock className="w-4 h-4 text-[#8794AD]" />
                )}
                <span className="font-semibold">Credentials Verified</span>
              </div>

              {/* Stage 4 */}
              <div
                className={`p-3 rounded-lg border flex items-center gap-2 ${
                  isVerified
                    ? 'bg-[#EDECE4] border-[#14213D]/10 text-[#14213D]'
                    : 'bg-white border-white/20 text-[#8794AD]'
                }`}
              >
                {isVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D74]" />
                ) : (
                  <Clock className="w-4 h-4 text-[#8794AD]" />
                )}
                <span className="font-semibold">Midnight Proof Sealed</span>
              </div>
            </div>
          </div>

          {/* Verdict Banner */}
          <div className="p-6 rounded-xl bg-[#14213D] text-[#EDECE4] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="text-xs font-mono text-[#4FB3A5] font-semibold uppercase">
                Midnight ZK Verification Outcome
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {isEligible
                  ? 'QUALIFIED & ELIGIBLE'
                  : application.status === 'verified_ineligible'
                  ? 'CRITERIA NOT MET'
                  : 'VERIFICATION PENDING'}
              </h2>
              <p className="text-xs text-[#8794AD] max-w-md">
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
          {application.revealStatus === 'requested' && (
            <div className="p-6 rounded-xl bg-[#F4EEDD] border-2 border-[#AE8B3F] space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#14213D] text-[#AE8B3F] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-[#AE8B3F] uppercase tracking-wider">
                    Consent Request from Landlord
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#14213D]">
                    Landlord is Ready to Draft Your Lease
                  </h3>
                  <p className="text-xs text-[#4B5A79] leading-relaxed">
                    The property owner for <strong>{application.propertyTitle}</strong> has reviewed your
                    eligible ZK proof and wants to proceed with lease drafting. Would you like to authorize
                    sharing your legal name (<strong>{application.tenantName}</strong>) and contact details (
                    {application.tenantEmail})?
                  </p>
                </div>
              </div>

              {consentSuccess ? (
                <div className="p-3 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-mono">
                  ✓ {consentSuccess}
                </div>
              ) : (
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleGrantConsent}
                    className="flex-1 py-3 px-4 rounded-md bg-[#AE8B3F] hover:bg-[#977732] text-white font-bold text-xs font-mono transition-colors shadow"
                  >
                    ✓ Yes, Authorize Reveal for Lease Drafting
                  </button>
                  <button
                    onClick={handleDeclineConsent}
                    className="py-3 px-4 rounded-md bg-white border border-[#14213D]/20 text-[#14213D] font-mono text-xs hover:bg-[#EDECE4] transition-colors"
                  >
                    ✕ Decline (Remain Anonymized)
                  </button>
                </div>
              )}
            </div>
          )}

          {application.revealStatus === 'granted' && (
            <div className="p-4 rounded-lg bg-[#2E7D74]/15 border border-[#2E7D74]/30 text-xs font-mono text-[#1F5751] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D74]" />
                <span>Identity consented & revealed to landlord for lease preparation.</span>
              </span>
              <span className="text-[11px] font-bold text-[#2E7D74]">Lease In Progress</span>
            </div>
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
          <div className="pt-4 border-t border-[#14213D]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href={`/properties/${application.propertyId}`}
              className="text-xs font-mono text-[#14213D] hover:text-[#AE8B3F] font-semibold"
            >
              ← View Property Details
            </Link>

            {application.paymentStatus === 'unpaid' ? (
              <Link
                href={`/tenant/applications/${application.id}/payment`}
                className="px-5 py-2.5 rounded-md bg-[#AE8B3F] text-white font-bold text-xs font-mono"
              >
                Pay $5.00 Verification Fee →
              </Link>
            ) : application.status === 'pending_verification' ? (
              <Link
                href={`/tenant/applications/${application.id}/verify`}
                className="px-5 py-2.5 rounded-md bg-[#14213D] text-white font-bold text-xs font-mono"
              >
                Launch ZK Prover →
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
