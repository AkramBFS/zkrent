'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useZkRent } from '@/context/ZkRentContext';
import { CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const appId = searchParams.get('appId');
  const { applications } = useZkRent();

  const app = appId ? applications.find((a) => a.id === appId) : applications[0];

  return (
    <div className="w-full max-w-md bg-[#FAFAFA] rounded-2xl border border-[#E5E0D8] p-8 shadow-xl text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-mono text-[#B86A36] font-bold uppercase tracking-wider">
          Verification Fee Paid
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#231F20]">
          Payment Successful
        </h1>
        <p className="text-xs text-[#3D3531]">
          Your $5.00 zero-knowledge circuit session has been allocated on Midnight Testnet.
        </p>
      </div>

      {app && (
        <div className="p-4 rounded-xl bg-[#E5E0D8] border border-[#231F20]/10 text-left font-mono text-xs space-y-1">
          <div className="text-[#908682]">Target Listing:</div>
          <div className="font-bold text-[#231F20]">{app.propertyTitle}</div>
          <div className="text-[11px] text-[#3D3531]">Applicant ID: {app.applicantDisplayId}</div>
        </div>
      )}

      <div className="space-y-3">
        <Link
          href={app ? `/tenant/applications/${app.id}/verify` : '/tenant/applications'}
          className="w-full py-3.5 px-6 rounded-lg bg-[#00A8E8] hover:bg-[#0277BD] text-white font-mono text-xs font-bold transition-all shadow flex items-center justify-center gap-2"
        >
          <span>Continue to ZK Verification Prover</span>
          <ArrowRight className="w-4 h-4 text-[#00A8E8]" />
        </Link>

        <Link
          href="/tenant"
          className="block text-xs font-mono text-[#3D3531] hover:underline"
        >
          Go to Tenant Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#E5E0D8] py-16 px-4 flex items-center justify-center">
      <Suspense fallback={<div className="font-mono text-xs text-[#231F20]">Loading payment receipt...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
