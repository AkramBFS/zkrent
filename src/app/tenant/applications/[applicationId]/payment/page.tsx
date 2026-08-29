'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Building,
  DollarSign,
} from 'lucide-react';

export default function ApplicationPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;
  const { getApplication, payApplicationFee, getProperty } = useZkRent();

  const application = getApplication(applicationId);
  const property = application ? getProperty(application.propertyId) : undefined;
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'midnight'>('card');

  if (!application) {
    return (
      <div className="min-h-screen bg-[#EDECE4] py-16 px-4 flex items-center justify-center">
        <div className="bg-[#F6F5F0] p-8 rounded-xl border border-[#14213D]/15 max-w-md text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#8794AD] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#14213D]">Application Not Found</h2>
          <Link
            href="/tenant"
            className="inline-block px-5 py-2.5 rounded-md bg-[#14213D] text-white text-sm font-medium"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const fee = property?.requirements.verificationFee ?? 5.0;

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      await payApplicationFee(application.id);
      router.push(`/tenant/applications/${application.id}/verify`);
    } catch (err) {
      console.error('Payment error:', err);
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#EDECE4] py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Navigation back */}
        <div>
          <Link
            href={`/properties/${application.propertyId}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#4B5A79] hover:text-[#14213D]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & return to property</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14213D] text-[#4FB3A5] font-mono text-xs border border-[#4FB3A5]/30">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted Checkout</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#14213D]">
            Complete Verification Fee
          </h1>
          <p className="text-sm text-[#4B5A79]">
            This fee covers the on-chain circuit session and zero-knowledge proof verification.
          </p>
        </div>

        {/* Card Checkout Container */}
        <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/20 shadow-xl overflow-hidden">
          {/* Property Summary Strip */}
          <div className="p-6 bg-[#14213D] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[#AE8B3F] font-bold uppercase">
                Target Property
              </span>
              <h3 className="font-serif text-xl font-bold">{application.propertyTitle}</h3>
              <p className="text-xs text-[#8794AD]">{application.propertyAddress}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-[#8794AD]">Verification Fee</span>
              <div className="font-serif text-3xl font-bold text-[#4FB3A5]">
                ${fee.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold text-[#14213D] uppercase">
                Select Payment Method
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#14213D] bg-[#EDECE4] shadow-sm'
                      : 'border-[#14213D]/15 bg-white hover:bg-[#EDECE4]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <CreditCard className="w-5 h-5 text-[#14213D]" />
                    <span className="text-[10px] font-mono font-bold text-[#AE8B3F]">STRIPE</span>
                  </div>
                  <div className="text-xs font-bold text-[#14213D]">Credit / Debit Card</div>
                  <div className="text-[11px] text-[#4B5A79]">Instant verification unlock</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('midnight')}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    paymentMethod === 'midnight'
                      ? 'border-[#2E7D74] bg-[#EDECE4] shadow-sm'
                      : 'border-[#14213D]/15 bg-white hover:bg-[#EDECE4]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Sparkles className="w-5 h-5 text-[#2E7D74]" />
                    <span className="text-[10px] font-mono font-bold text-[#2E7D74]">TESTNET</span>
                  </div>
                  <div className="text-xs font-bold text-[#14213D]">Midnight Wallet (DUST)</div>
                  <div className="text-[11px] text-[#4B5A79]">Native token settlement</div>
                </button>
              </div>
            </div>

            {/* Mock Card Form */}
            {paymentMethod === 'card' ? (
              <div className="p-4 rounded-lg bg-white border border-[#14213D]/15 space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-[#4B5A79] mb-1">Card Number</label>
                  <input
                    type="text"
                    defaultValue="•••• •••• •••• 4242"
                    readOnly
                    className="w-full p-2.5 rounded bg-[#EDECE4]/40 border border-[#14213D]/15 text-[#14213D]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#4B5A79] mb-1">Expires</label>
                    <input
                      type="text"
                      defaultValue="08/28"
                      readOnly
                      className="w-full p-2.5 rounded bg-[#EDECE4]/40 border border-[#14213D]/15 text-[#14213D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#4B5A79] mb-1">CVC</label>
                    <input
                      type="text"
                      defaultValue="•••"
                      readOnly
                      className="w-full p-2.5 rounded bg-[#EDECE4]/40 border border-[#14213D]/15 text-[#14213D]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[#14213D] text-[#EDECE4] border border-[#4FB3A5]/30 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[#4FB3A5]">
                  <span>Connected Midnight Wallet</span>
                  <span className="w-2 h-2 rounded-full bg-[#4FB3A5] animate-pulse" />
                </div>
                <div className="text-[11px] text-[#8794AD] break-all">
                  mn_addr1q8f2940182948102948102948102948102948102948102948
                </div>
                <div className="pt-2 flex justify-between text-xs text-white">
                  <span>Balance: 124.50 DUST</span>
                  <span className="text-[#AE8B3F]">Cost: 5.00 DUST</span>
                </div>
              </div>
            )}

            {/* What Happens Next Guide */}
            <div className="p-4 rounded-lg bg-[#EDECE4] border border-[#14213D]/10 space-y-2.5">
              <h4 className="font-mono text-xs font-bold text-[#14213D] uppercase tracking-wider">
                What Happens Next:
              </h4>
              <ol className="space-y-1.5 text-xs text-[#4B5A79] font-mono list-decimal list-inside">
                <li>Complete payment to initialize the Midnight proof session.</li>
                <li>Enter your credentials privately in your local browser sandbox.</li>
                <li>Generate your cryptographic ZK proof (takes ~2 seconds).</li>
                <li>Landlord receives verified "ELIGIBLE" badge with zero raw data.</li>
              </ol>
            </div>

            {/* Submit CTA */}
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-md bg-[#AE8B3F] hover:bg-[#977732] text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isProcessing ? 'Authorizing Secure Payment...' : `Pay $${fee.toFixed(2)} & Proceed to ZK Prover`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#8794AD]">
              <ShieldCheck className="w-4 h-4 text-[#2E7D74]" />
              <span>256-Bit SSL Encrypted • Powered by Midnight Network</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
