'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useZkRent } from '@/context/ZkRentContext';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  const appId = searchParams.get('appId');
  const { applications } = useZkRent();

  const app = appId ? applications.find((a) => a.id === appId) : applications[0];

  return (
    <div className="w-full max-w-md bg-[#FAFAFA] rounded-2xl border border-[#E5E0D8] p-8 shadow-xl text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-500 text-amber-800 flex items-center justify-center mx-auto shadow-sm">
        <AlertCircle className="w-9 h-9" />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-mono text-[#B86A36] font-bold uppercase tracking-wider">
          Checkout Incomplete
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#231F20]">
          Payment Cancelled
        </h1>
        <p className="text-xs text-[#3D3531]">
          Your verification fee was not charged. You can resume checkout or return to your applications.
        </p>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {app && (
          <Link
            href={`/tenant/applications/${app.id}/payment`}
            className="w-full py-3.5 px-6 rounded-lg bg-[#B86A36] hover:bg-[#A05A2C] text-white font-bold transition-all shadow flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Payment ($5.00)</span>
          </Link>
        )}

        <Link
          href="/tenant/applications"
          className="w-full py-3 px-6 rounded-lg bg-[#E5E0D8] hover:bg-[#231F20]/10 text-[#231F20] font-medium transition-colors block border border-[#E5E0D8]"
        >
          Return to My Applications
        </Link>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-[#E5E0D8] py-16 px-4 flex items-center justify-center">
      <Suspense fallback={<div className="font-mono text-xs text-[#231F20]">Loading...</div>}>
        <PaymentCancelledContent />
      </Suspense>
    </div>
  );
}
