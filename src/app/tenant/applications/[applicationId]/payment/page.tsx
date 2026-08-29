'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FadeIn, MotionCard, LUXURY_EASE } from '@/components/motion/motion';
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
  const prefersReduced = useReducedMotion();

  const application = getApplication(applicationId);
  const property = application ? getProperty(application.propertyId) : undefined;
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'midnight'>('card');

  if (!application) {
    return (
      <div className="min-h-screen bg-[#E5E0D8] py-16 px-4 flex items-center justify-center">
        <FadeIn className="bg-[#FAFAFA] p-8 rounded-xl border border-[#E5E0D8] max-w-md text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#908682] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#231F20]">Application Not Found</h2>
          <Link
            href="/tenant"
            className="inline-block px-5 py-2.5 rounded-md bg-[#231F20] text-white text-sm font-medium"
          >
            Return to Dashboard
          </Link>
        </FadeIn>
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
    <div className="min-h-screen bg-[#E5E0D8] py-10 overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Navigation back */}
        <FadeIn>
          <Link
            href={`/properties/${application.propertyId}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3D3531] hover:text-[#231F20] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Cancel & return to property</span>
          </Link>
        </FadeIn>

        {/* Header */}
        <FadeIn delay={0.05} className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#231F20] text-[#00A8E8] font-mono text-xs border border-[#00A8E8]/30">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted Checkout</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#231F20]">
            Complete Verification Fee
          </h1>
          <p className="text-sm text-[#3D3531]">
            This fee covers the on-chain circuit session and zero-knowledge proof verification.
          </p>
        </FadeIn>

        {/* Card Checkout Container */}
        <FadeIn delay={0.1}>
          <div className="bg-[#FAFAFA] rounded-xl border border-[#231F20]/20 shadow-xl overflow-hidden">
            {/* Property Summary Strip */}
            <div className="p-6 bg-[#231F20] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-[#B86A36] font-bold uppercase">
                  Target Property
                </span>
                <h3 className="font-serif text-xl font-bold">{application.propertyTitle}</h3>
                <p className="text-xs text-[#908682]">{application.propertyAddress}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-[#908682]">Verification Fee</span>
                <div className="font-serif text-3xl font-bold text-[#00A8E8]">
                  ${fee.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-mono font-bold text-[#231F20] uppercase">
                  Select Payment Method
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-[#231F20] bg-[#E5E0D8] shadow-sm'
                        : 'border-[#E5E0D8] bg-white hover:bg-[#E5E0D8]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <CreditCard className="w-5 h-5 text-[#231F20]" />
                      <span className="text-[10px] font-mono font-bold text-[#B86A36]">STRIPE</span>
                    </div>
                    <div className="text-xs font-bold text-[#231F20]">Credit / Debit Card</div>
                    <div className="text-[11px] text-[#3D3531]">Instant verification unlock</div>
                  </motion.button>

                  <motion.button
                    whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                    type="button"
                    onClick={() => setPaymentMethod('midnight')}
                    className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                      paymentMethod === 'midnight'
                        ? 'border-[#4A6B32] bg-[#E5E0D8] shadow-sm'
                        : 'border-[#E5E0D8] bg-white hover:bg-[#E5E0D8]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Sparkles className="w-5 h-5 text-[#4A6B32]" />
                      <span className="text-[10px] font-mono font-bold text-[#4A6B32]">TESTNET</span>
                    </div>
                    <div className="text-xs font-bold text-[#231F20]">Midnight Wallet (DUST)</div>
                    <div className="text-[11px] text-[#3D3531]">Native token settlement</div>
                  </motion.button>
                </div>
              </div>

              {/* Form container with AnimatePresence */}
              <AnimatePresence mode="wait">
                {paymentMethod === 'card' ? (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-lg bg-white border border-[#E5E0D8] space-y-3 font-mono text-xs"
                  >
                    <div>
                      <label className="block text-[#3D3531] mb-1">Card Number</label>
                      <input
                        type="text"
                        defaultValue="•••• •••• •••• 4242"
                        readOnly
                        className="w-full p-2.5 rounded bg-[#E5E0D8]/40 border border-[#E5E0D8] text-[#231F20]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#3D3531] mb-1">Expires</label>
                        <input
                          type="text"
                          defaultValue="08/28"
                          readOnly
                          className="w-full p-2.5 rounded bg-[#E5E0D8]/40 border border-[#E5E0D8] text-[#231F20]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#3D3531] mb-1">CVC</label>
                        <input
                          type="text"
                          defaultValue="•••"
                          readOnly
                          className="w-full p-2.5 rounded bg-[#E5E0D8]/40 border border-[#E5E0D8] text-[#231F20]"
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="midnight"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-lg bg-[#231F20] text-[#E5E0D8] border border-[#00A8E8]/30 space-y-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between text-[#00A8E8]">
                      <span>Connected Midnight Wallet</span>
                      <span className="w-2 h-2 rounded-full bg-[#00A8E8] animate-pulse" />
                    </div>
                    <div className="text-[11px] text-[#908682] break-all">
                      mn_addr1q8f2940182948102948102948102948102948102948102948
                    </div>
                    <div className="pt-2 flex justify-between text-xs text-white">
                      <span>Balance: 124.50 DUST</span>
                      <span className="text-[#B86A36]">Cost: 5.00 DUST</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* What Happens Next Guide */}
              <div className="p-4 rounded-lg bg-[#E5E0D8] border border-[#231F20]/10 space-y-2.5">
                <h4 className="font-mono text-xs font-bold text-[#231F20] uppercase tracking-wider">
                  What Happens Next:
                </h4>
                <ol className="space-y-1.5 text-xs text-[#3D3531] font-mono list-decimal list-inside">
                  <li>Complete payment to initialize the Midnight proof session.</li>
                  <li>Enter your credentials privately in your local browser sandbox.</li>
                  <li>Generate your cryptographic ZK proof (takes ~2 seconds).</li>
                  <li>Landlord receives verified "ELIGIBLE" badge with zero raw data.</li>
                </ol>
              </div>

              {/* Submit CTA */}
              <motion.button
                whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isProcessing ? 'Authorizing Secure Payment...' : `Pay $${fee.toFixed(2)} & Proceed to ZK Prover`}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#908682]">
                <ShieldCheck className="w-4 h-4 text-[#4A6B32]" />
                <span>256-Bit SSL Encrypted • Powered by Midnight Network</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
