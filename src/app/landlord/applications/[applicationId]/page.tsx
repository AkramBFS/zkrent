'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ZkVerifiedBadge, ApplicantIdTag } from '@/components/ZkBadges';
import { VerifyReceiptDrawer } from '@/components/VerifyReceiptDrawer';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  EyeOff,
  UserCheck,
  ArrowLeft,
  FileCheck2,
  Sparkles,
  Mail,
  Phone,
  User,
  AlertCircle,
  FileText,
  Check,
} from 'lucide-react';

export default function LandlordApplicantDetailsPage() {
  const params = useParams();
  const applicationId = params.applicationId as string;
  const { getApplication, getProperty, requestReveal } = useZkRent();

  const application = getApplication(applicationId);
  const property = application ? getProperty(application.propertyId) : undefined;
  const [requestSent, setRequestSent] = useState(false);

  if (!application) {
    return (
      <div className="min-h-screen bg-[#EDECE4] py-16 px-4 flex items-center justify-center">
        <div className="bg-[#F6F5F0] p-8 rounded-xl border border-[#14213D]/15 max-w-md text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#8794AD] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#14213D]">Application Not Found</h2>
          <Link
            href="/landlord/applications"
            className="inline-block px-5 py-2.5 rounded-md bg-[#14213D] text-white text-sm font-medium"
          >
            Return to Applications
          </Link>
        </div>
      </div>
    );
  }

  const isEligible =
    application.status === 'verified_eligible' || application.status === 'lease_offered';
  const isRevealed = application.revealStatus === 'granted';
  const isRevealPending = application.revealStatus === 'requested' || requestSent;

  const handleMoveForward = () => {
    requestReveal(application.id);
    setRequestSent(true);
  };

  return (
    <div className="min-h-screen bg-[#EDECE4] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/landlord/applications"
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
                Anonymous Applicant Profile
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14213D] mt-1">
                Applicant {application.applicantDisplayId}
              </h1>
              <p className="text-xs text-[#4B5A79] mt-0.5">
                Applied for: <strong>{application.propertyTitle}</strong> ({application.propertyAddress})
              </p>
            </div>

            <div className="sm:text-right">
              <div className="font-serif text-2xl font-bold text-[#14213D]">
                ${application.propertyPrice.toLocaleString()}
              </div>
              <span className="text-xs font-mono text-[#4B5A79]">monthly rent</span>
            </div>
          </div>

          {/* Privacy Guarantee Notice */}
          <div className="p-4 rounded-lg bg-[#14213D] text-[#EDECE4] border border-[#4FB3A5]/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <EyeOff className="w-5 h-5 text-[#4FB3A5] flex-shrink-0" />
              <div className="text-xs font-mono">
                <span className="text-[#4FB3A5] font-bold">Midnight Privacy Boundary:</span> In
                accordance with protocol rules, no raw income figures, tax returns, or bank statements
                are accessible. Only mathematical proof satisfaction is presented.
              </div>
            </div>
          </div>

          {/* Big Verdict Banner */}
          <div className="p-6 rounded-xl bg-[#14213D] text-[#EDECE4] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="text-xs font-mono text-[#4FB3A5] font-semibold uppercase">
                Zero-Knowledge Proof Outcome
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {isEligible
                  ? 'VERIFIED & ELIGIBLE'
                  : application.status === 'verified_ineligible'
                  ? 'CRITERIA NOT SATISFIED'
                  : 'AWAITING VERIFICATION'}
              </h2>
              <p className="text-xs text-[#8794AD] max-w-md">
                {isEligible
                  ? 'The applicant mathematically proves they meet all qualification thresholds. The proof is recorded on Midnight Network.'
                  : 'The applicant does not meet your minimum income or background criteria.'}
              </p>
            </div>

            <div className="flex-shrink-0">
              <StampedSeal
                status={isEligible ? 'eligible' : 'ineligible'}
                size="md"
              />
            </div>
          </div>

          {/* Per-Requirement Outcome Checklist (No numbers exposed!) */}
          <div className="bg-white rounded-xl border border-[#14213D]/15 p-6 space-y-4 font-mono text-xs">
            <h3 className="font-serif font-bold text-base text-[#14213D]">
              Requirement Satisfaction Checklist
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#EDECE4]/50 border border-[#14213D]/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#14213D]">Minimum Income Requirement</div>
                  <div className="text-[11px] text-[#4B5A79]">
                    Condition: <code className="text-[#14213D]">Income ≥ Threshold</code>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[#2E7D74] font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D74]" />
                  ✓ Satisfied (Zero-Knowledge Witness)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#EDECE4]/50 border border-[#14213D]/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#14213D]">Background Check Attestation</div>
                  <div className="text-[11px] text-[#4B5A79]">
                    Condition: Certified Clear Registry
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[#2E7D74] font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D74]" />
                  ✓ Verified (Zero Records)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#EDECE4]/50 border border-[#14213D]/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#14213D]">Employment Verification</div>
                  <div className="text-[11px] text-[#4B5A79]">
                    Condition: Active Employment Attestation
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[#2E7D74] font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D74]" />
                  ✓ Verified (Active)
                </span>
              </div>
            </div>
          </div>

          {/* Expandable Inspectable Proof Receipt for Skeptical Landlord */}
          {application.verification && (
            <div className="space-y-2">
              <VerifyReceiptDrawer
                proof={application.verification}
                applicantDisplayId={application.applicantDisplayId}
                propertyTitle={application.propertyTitle}
                defaultExpanded={false}
              />
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* MOVE FORWARD / REVEAL REQUEST ACTION SECTION */}
          {/* ------------------------------------------------------------- */}
          <div className="p-6 rounded-xl bg-[#EDECE4] border border-[#14213D]/15 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-[#14213D]">
                  Lease Drafting & Identity Reveal
                </h3>
                <p className="text-xs text-[#4B5A79]">
                  Applicants remain anonymized until they consent to share their identity for lease preparation.
                </p>
              </div>
            </div>

            {isRevealed ? (
              /* Revealed State (Consent Granted) */
              <div className="p-5 rounded-lg bg-emerald-50 border border-emerald-300 space-y-3 font-mono text-xs text-[#14213D]">
                <div className="flex items-center justify-between text-emerald-900 font-bold">
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <span>Tenant Identity Revealed (Consent Granted)</span>
                  </span>
                  <span className="text-[10px] uppercase bg-emerald-200 px-2 py-0.5 rounded">
                    Ready for Lease
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-2.5 rounded bg-white border border-emerald-200">
                    <div className="text-[10px] text-[#8794AD]">Legal Full Name</div>
                    <div className="font-bold text-[#14213D]">{application.tenantName}</div>
                  </div>
                  <div className="p-2.5 rounded bg-white border border-emerald-200">
                    <div className="text-[10px] text-[#8794AD]">Email Address</div>
                    <div className="font-bold text-[#14213D]">{application.tenantEmail}</div>
                  </div>
                  <div className="p-2.5 rounded bg-white border border-emerald-200">
                    <div className="text-[10px] text-[#8794AD]">Phone Number</div>
                    <div className="font-bold text-[#14213D]">{application.tenantPhone}</div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => alert(`Drafting lease agreement for ${application.tenantName}...`)}
                    className="px-5 py-2 rounded bg-[#14213D] text-white font-bold hover:bg-[#1E2F54] transition-colors"
                  >
                    Draft Digital Lease Agreement →
                  </button>
                </div>
              </div>
            ) : isRevealPending ? (
              /* Pending Tenant Consent */
              <div className="p-4 rounded-lg bg-[#14213D] text-[#EDECE4] border border-[#AE8B3F] space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-[#AE8B3F] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#AE8B3F] animate-ping" />
                  <span>Reveal Request Sent — Awaiting Tenant Consent</span>
                </div>
                <p className="text-[#8794AD]">
                  A consent notification has been dispatched to {application.applicantDisplayId}. Once they
                  authorize sharing their legal name and contact in their tenant dashboard, this card will
                  update in place.
                </p>
                <div className="pt-1 text-[11px] text-amber-300">
                  Tip: Switch to the Tenant Portal to approve the consent prompt!
                </div>
              </div>
            ) : (
              /* Action to Request Reveal */
              <div className="pt-2">
                <button
                  onClick={handleMoveForward}
                  className="w-full sm:w-auto px-6 py-3 rounded-md bg-[#AE8B3F] hover:bg-[#977732] text-white font-mono text-xs font-bold transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Move Forward with this Applicant (Request Identity Reveal)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
