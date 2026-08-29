'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ApplicantIdTag } from '@/components/ZkBadges';
import { VerifyReceiptDrawer } from '@/components/VerifyReceiptDrawer';
import { ShieldCheck, ArrowLeft, Terminal, Cpu, Check, Lock } from 'lucide-react';

export default function SingleVerificationReceiptPage() {
  const params = useParams();
  const applicationId = params.applicationId as string;
  const { getApplication, getProperty } = useZkRent();

  const application = getApplication(applicationId);
  const property = application ? getProperty(application.propertyId) : undefined;

  if (!application || !application.verification) {
    return (
      <div className="min-h-screen bg-[#E5E0D8] py-16 px-4 flex items-center justify-center">
        <div className="bg-[#FAFAFA] p-8 rounded-xl border border-[#E5E0D8] max-w-md text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#908682] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#231F20]">Verification Receipt Not Found</h2>
          <Link
            href="/tenant/verification"
            className="inline-block px-5 py-2.5 rounded-md bg-[#231F20] text-white text-sm font-medium"
          >
            Back to Proof Vault
          </Link>
        </div>
      </div>
    );
  }

  const v = application.verification;

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/tenant/verification"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3D3531] hover:text-[#231F20]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Proof Vault</span>
          </Link>

          <ApplicantIdTag id={application.applicantDisplayId} size="md" />
        </div>

        {/* Receipt Main Card */}
        <div className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#231F20]/10">
            <div>
              <span className="text-xs font-mono text-[#4A6B32] font-bold uppercase tracking-wider">
                Cryptographic Attestation Receipt
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#231F20] mt-1">
                {application.propertyTitle}
              </h1>
              <p className="text-xs text-[#3D3531]">{application.propertyAddress}</p>
            </div>

            <StampedSeal status={v.eligible ? 'eligible' : 'ineligible'} size="sm" />
          </div>

          {/* Full Proof Drawer (Always Expanded) */}
          <VerifyReceiptDrawer
            proof={v}
            applicantDisplayId={application.applicantDisplayId}
            propertyTitle={application.propertyTitle}
            defaultExpanded={true}
          />

          <div className="pt-4 border-t border-[#231F20]/10 flex items-center justify-between">
            <Link
              href={`/tenant/applications/${application.id}`}
              className="text-xs font-mono text-[#231F20] hover:underline font-semibold"
            >
              ← View Application Lifecycle
            </Link>

            <Link
              href={`/properties/${application.propertyId}`}
              className="text-xs font-mono text-[#B86A36] hover:underline font-semibold"
            >
              View Property Listing →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
