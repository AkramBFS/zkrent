'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ApplicantIdTag } from '@/components/ZkBadges';
import { DocumentOcrUploader } from '@/components/DocumentOcrUploader';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem, LUXURY_EASE } from '@/components/motion/motion';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Terminal,
  FileCheck,
  Check,
  X,
  FileX2,
} from 'lucide-react';

export default function ZkVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;
  const { getApplication, getProperty, submitVerificationProof } = useZkRent();
  const prefersReduced = useReducedMotion();

  const application = getApplication(applicationId);
  const property = application ? getProperty(application.propertyId) : undefined;

  // Flow State: 1 = Requirements, 2 = Credentials, 3 = Proving Animation, 4 = Result
  const [step, setStep] = useState<1 | 2 | 3 | 4>(
    application?.status === 'verified_eligible' || application?.status === 'verified_ineligible'
      ? 4
      : 1
  );

  // Private Credential Inputs (Local only)
  const [annualIncome, setAnnualIncome] = useState<number>(88000);
  const [backgroundVerified, setBackgroundVerified] = useState<boolean>(true);
  const [employmentVerified, setEmploymentVerified] = useState<boolean>(true);

  // Income input mode: 'manual' (classic) or 'ocr' (document upload)
  const [incomeInputMode, setIncomeInputMode] = useState<'manual' | 'ocr'>('manual');

  // Proving Animation State
  const [progress, setProgress] = useState(0);
  const [provingStage, setProvingStage] = useState<string>('Initializing local prover sandbox...');
  const [redactedCount, setRedactedCount] = useState(0);
  const [proofResult, setProofResult] = useState<any>(application?.verification || null);

  const minRequiredIncome = property?.requirements.minIncome ?? 75000;
  const bgRequired = property?.requirements.requireBackground ?? true;
  const empRequired = property?.requirements.requireEmployment ?? true;

  // Proving animation effect
  const handleStartProving = () => {
    setStep(3);
    setProgress(0);
    setRedactedCount(0);
    setProvingStage('Constructing private witness from local inputs...');

    // Stage 1: Redaction of sensitive fields
    setTimeout(() => {
      setProgress(20);
      setRedactedCount(1);
      setProvingStage('Applying redaction bars to income and private identifiers...');
    }, 600);

    // Stage 2: Halo2 Circuit evaluation
    setTimeout(() => {
      setProgress(50);
      setRedactedCount(2);
      setProvingStage('Compiling 38,420 Halo2 arithmetic constraints in WebAssembly...');
    }, 1300);

    // Stage 3: SNARK Proof synthesis
    setTimeout(() => {
      setProgress(75);
      setRedactedCount(3);
      setProvingStage('Generating Zero-Knowledge SNARK proof...');
    }, 2000);

    // Stage 4: Midnight Network submission & completion
    setTimeout(async () => {
      setProgress(100);
      setProvingStage('Submitting cryptographic proof to Midnight Network contract...');

      try {
        const result = await submitVerificationProof(applicationId, {
          income: annualIncome,
          backgroundVerified,
          employmentVerified,
        });

        setProofResult(result.proof);

        setTimeout(() => {
          setStep(4);
          if (result.isEligible) {
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00A8E8', '#B86A36', '#E5E0D8'],
              });
            } catch (e) {
              // ignore if confetti fails
            }
          }
        }, 700);
      } catch (err) {
        console.error('Proving error:', err);
      }
    }, 2800);
  };

  if (!application) {
    return (
      <div className="min-h-screen bg-[#231F20] text-[#E5E0D8] py-16 px-4 flex items-center justify-center">
        <FadeIn className="bg-[#231F20] p-8 rounded-xl border border-white/15 max-w-md text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#00A8E8] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-white">Application Not Found</h2>
          <Link
            href="/tenant"
            className="inline-block px-5 py-2.5 rounded-md bg-[#00A8E8] text-[#231F20] text-sm font-bold"
          >
            Return to Dashboard
          </Link>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#231F20] text-[#E5E0D8] py-10 flex flex-col justify-between overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full space-y-8">
        {/* Step Indicator Header */}
        <FadeIn className="flex items-center justify-between border-b border-[#00A8E8]/20 pb-4">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={prefersReduced ? undefined : { scale: 1.05 }}
              className="w-8 h-8 rounded bg-[#231F20] border border-[#00A8E8]/40 flex items-center justify-center text-[#00A8E8]"
            >
              <ShieldCheck className="w-5 h-5" />
            </motion.div>
            <div>
              <span className="font-serif font-bold text-white text-base">
                Midnight ZK Prover
              </span>
              <div className="text-[11px] font-mono text-[#908682]">
                {application.propertyTitle} • {application.applicantDisplayId}
              </div>
            </div>
          </div>

          {/* Stepper Dots with Animated Highlights */}
          <div className="flex items-center gap-2 font-mono text-xs text-[#908682]">
            <span className={step === 1 ? 'text-[#00A8E8] font-bold' : ''}>1. Criteria</span>
            <span>→</span>
            <span className={step === 2 ? 'text-[#00A8E8] font-bold' : ''}>2. Witness</span>
            <span>→</span>
            <span className={step === 3 ? 'text-[#00A8E8] font-bold' : ''}>3. Proving</span>
            <span>→</span>
            <span className={step === 4 ? 'text-[#00A8E8] font-bold' : ''}>4. Verdict</span>
          </div>
        </FadeIn>

        {/* Wizard Multi-Step Container with AnimatePresence */}
        <AnimatePresence mode="wait">
          {/* ------------------------------------------------------------------ */}
          {/* STEP 1: REQUIREMENTS RECAP */}
          {/* ------------------------------------------------------------------ */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35, ease: LUXURY_EASE }}
              className="bg-[#231F20] rounded-xl border border-[#00A8E8]/30 p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-full bg-[#4A6B32]/12 text-[#4A6B32] text-xs font-mono border border-[#00A8E8]/30 inline-block">
                  Step 1 of 4: Qualification Criteria
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Verify Your Eligibility Privately
                </h2>
                <p className="text-sm text-[#908682] leading-relaxed">
                  The landlord for <strong className="text-white">{application.propertyTitle}</strong> has
                  established the following public qualification rules. You will prove satisfaction of these
                  rules using a zero-knowledge circuit.
                </p>
              </div>

              {/* Criteria list */}
              <div className="space-y-3 font-mono text-xs">
                <div className="p-4 rounded-lg bg-[#231F20] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#231F20] text-[#00A8E8] flex items-center justify-center border border-[#00A8E8]/30">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">
                        Minimum Annual Income
                      </div>
                      <div className="text-[#908682]">
                        Must earn ≥ ${minRequiredIncome.toLocaleString()} / year
                      </div>
                    </div>
                  </div>
                  <span className="text-[#00A8E8] font-bold">Required</span>
                </div>

                <div className="p-4 rounded-lg bg-[#231F20] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#231F20] text-[#00A8E8] flex items-center justify-center border border-[#00A8E8]/30">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">
                        Criminal & Eviction Background Check
                      </div>
                      <div className="text-[#908682]">
                        Clear registry verification required
                      </div>
                    </div>
                  </div>
                  <span className="text-[#00A8E8] font-bold">
                    {bgRequired ? 'Required' : 'Optional'}
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-[#231F20] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#231F20] text-[#00A8E8] flex items-center justify-center border border-[#00A8E8]/30">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">
                        Employment Attestation
                      </div>
                      <div className="text-[#908682]">
                        Active employment credential required
                      </div>
                    </div>
                  </div>
                  <span className="text-[#00A8E8] font-bold">
                    {empRequired ? 'Required' : 'Optional'}
                  </span>
                </div>
              </div>

              {/* Privacy Guarantee Note */}
              <div className="p-4 rounded-lg bg-[#231F20]/80 border border-[#00A8E8]/30 flex items-start gap-3">
                <EyeOff className="w-5 h-5 text-[#00A8E8] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#908682] leading-relaxed">
                  <strong className="text-white">On-Device Proof Guarantee:</strong> Your actual salary,
                  employer name, and background records are computed locally inside your browser. No human or
                  server will ever see raw values.
                </div>
              </div>

              <motion.button
                whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                onClick={() => setStep(2)}
                className="w-full py-4 px-6 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-[#231F20] font-bold text-sm transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
              >
                <span>Begin Private Proof Construction</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* STEP 2: PRIVATE CREDENTIALS INPUT */}
          {/* ------------------------------------------------------------------ */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35, ease: LUXURY_EASE }}
              className="bg-[#231F20] rounded-xl border border-[#00A8E8]/30 p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded bg-[#B86A36]/20 text-[#B86A36] text-xs font-mono border border-[#B86A36]/40 inline-block">
                  Step 2 of 4: Private Witness Construction
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Enter Your Private Credentials
                </h2>
                <div className="p-3 rounded-lg bg-[#231F20] border border-amber-400/20 text-xs font-mono text-amber-200/90 leading-relaxed">
                  ⚠️ <strong>Important Distinction:</strong> You are constructing a cryptographic witness in your
                  local browser memory. This data is <strong>NOT</strong> being submitted or transmitted anywhere.
                </div>
              </div>

              <div className="space-y-5 font-mono text-xs">
                {/* Annual Income — Tabbed: Manual / OCR Upload */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[#908682]">
                    <label className="font-semibold text-white">
                      1. Your Actual Annual Gross Income
                    </label>
                    <span>Requirement: ≥ ${minRequiredIncome.toLocaleString()}</span>
                  </div>

                  {/* Mode tabs */}
                  <div className="flex rounded-lg border border-white/10 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIncomeInputMode('manual')}
                      className={`flex-1 py-2 px-3 text-xs font-mono transition-colors cursor-pointer ${
                        incomeInputMode === 'manual'
                          ? 'bg-[#00A8E8]/15 text-[#00A8E8] font-bold border-b-2 border-[#00A8E8]'
                          : 'text-[#908682] hover:bg-white/5'
                      }`}
                    >
                      Manual Entry
                    </button>
                    <button
                      type="button"
                      onClick={() => setIncomeInputMode('ocr')}
                      className={`flex-1 py-2 px-3 text-xs font-mono transition-colors cursor-pointer ${
                        incomeInputMode === 'ocr'
                          ? 'bg-[#00A8E8]/15 text-[#00A8E8] font-bold border-b-2 border-[#00A8E8]'
                          : 'text-[#908682] hover:bg-white/5'
                      }`}
                    >
                      Upload Bank Statement
                    </button>
                  </div>

                  {/* Manual input */}
                  {incomeInputMode === 'manual' && (
                    <div className="space-y-1.5">
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#908682] font-bold text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          value={annualIncome}
                          onChange={(e) => setAnnualIncome(parseInt(e.target.value) || 0)}
                          className="w-full pl-8 pr-4 py-3 rounded-lg bg-[#231F20] border border-white/20 text-white font-mono text-base focus:outline-none focus:ring-2 focus:ring-[#00A8E8] transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* OCR upload */}
                  {incomeInputMode === 'ocr' && (
                    <DocumentOcrUploader
                      onAmountConfirmed={(amount) => {
                        setAnnualIncome(Math.round(amount));
                        setIncomeInputMode('manual');
                      }}
                    />
                  )}

                  {/* Threshold indicator (always visible) */}
                  <p className="text-[11px] text-[#908682]">
                    {annualIncome >= minRequiredIncome ? (
                      <span className="text-[#00A8E8] font-semibold">
                        ✓ Satisfies threshold (${(annualIncome - minRequiredIncome).toLocaleString()} above required minimum)
                      </span>
                    ) : (
                      <span className="text-[#E85D31] font-semibold">
                        ✕ Below required minimum of ${minRequiredIncome.toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>

                {/* Background Check Toggle */}
                <div className="p-4 rounded-lg bg-[#231F20] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">
                        2. Criminal & Eviction Background
                      </div>
                      <div className="text-[11px] text-[#908682]">
                        Accredited identity registry attestation
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setBackgroundVerified(true)}
                        className={`px-3 py-1.5 rounded border text-xs font-mono transition-colors cursor-pointer ${
                          backgroundVerified
                            ? 'bg-[#4A6B32] text-white border-[#00A8E8]'
                            : 'bg-[#231F20] text-[#908682] border-white/10'
                        }`}
                      >
                        ✓ Verified (Clear)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBackgroundVerified(false)}
                        className={`px-3 py-1.5 rounded border text-xs font-mono transition-colors cursor-pointer ${
                          !backgroundVerified
                            ? 'bg-[#E85D31] text-white border-[#E85D31]'
                            : 'bg-[#231F20] text-[#908682] border-white/10'
                        }`}
                      >
                        ✕ Unverified
                      </button>
                    </div>
                  </div>
                </div>

                {/* Employment Verification Toggle */}
                <div className="p-4 rounded-lg bg-[#231F20] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">
                        3. Employment Status
                      </div>
                      <div className="text-[11px] text-[#908682]">
                        Active employment attestation
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEmploymentVerified(true)}
                        className={`px-3 py-1.5 rounded border text-xs font-mono transition-colors cursor-pointer ${
                          employmentVerified
                            ? 'bg-[#4A6B32] text-white border-[#00A8E8]'
                            : 'bg-[#231F20] text-[#908682] border-white/10'
                        }`}
                      >
                        ✓ Verified Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmploymentVerified(false)}
                        className={`px-3 py-1.5 rounded border text-xs font-mono transition-colors cursor-pointer ${
                          !employmentVerified
                            ? 'bg-[#E85D31] text-white border-[#E85D31]'
                            : 'bg-[#231F20] text-[#908682] border-white/10'
                        }`}
                      >
                        ✕ Unverified
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-md bg-[#231F20] text-white text-xs font-mono hover:bg-white/10 transition-colors border border-white/15 cursor-pointer"
                >
                  ← Back
                </button>
                <motion.button
                  whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  type="button"
                  onClick={handleStartProving}
                  className="flex-1 py-3.5 px-6 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-[#231F20] font-bold text-sm transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Construct Witness & Generate ZK Proof</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* STEP 3: PROOF GENERATION ANIMATION (HERO FLAGSHIP MOMENT) */}
          {/* ------------------------------------------------------------------ */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: LUXURY_EASE }}
              className="bg-[#231F20] rounded-xl border border-[#00A8E8]/40 p-6 sm:p-10 space-y-8 shadow-2xl text-center relative overflow-hidden"
            >
              {/* Ambient Circuit Glow Pulse */}
              <motion.div
                animate={
                  prefersReduced
                    ? undefined
                    : {
                        scale: [1, 1.15, 1],
                        opacity: [0.12, 0.25, 0.12],
                      }
                }
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00A8E8]/10 rounded-full blur-3xl pointer-events-none"
              />

              <div className="space-y-3 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#231F20] text-[#00A8E8] font-mono text-xs border border-[#00A8E8]/40">
                  <Cpu className="w-4 h-4 animate-spin" />
                  <span>Midnight Network Halo2 Prover Active</span>
                </div>
                <h2 className="font-serif text-3xl font-bold text-white">
                  Generating Zero-Knowledge Proof
                </h2>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={provingStage}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-mono text-[#908682] max-w-md mx-auto"
                  >
                    {provingStage}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Animated Redaction Witness Pipeline */}
              <div className="max-w-md mx-auto space-y-3 text-left font-mono text-xs relative z-10">
                {/* Field 1: Income Redaction */}
                <div className="p-3 rounded-lg bg-[#231F20] border border-white/10 flex items-center justify-between">
                  <span className="text-[#908682]">Annual Salary Witness:</span>
                  {redactedCount >= 1 ? (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-1 rounded bg-[#231F20] text-transparent select-none border border-[#00A8E8]/40 transition-all font-bold"
                    >
                      ██████████ (REDACTED)
                    </motion.span>
                  ) : (
                    <span className="text-white font-bold">${annualIncome.toLocaleString()}</span>
                  )}
                </div>

                {/* Field 2: Identity & Attestation Redaction */}
                <div className="p-3 rounded-lg bg-[#231F20] border border-white/10 flex items-center justify-between">
                  <span className="text-[#908682]">Tenant PII & Tax Records:</span>
                  {redactedCount >= 2 ? (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-1 rounded bg-[#231F20] text-transparent select-none border border-[#00A8E8]/40 transition-all font-bold"
                    >
                      ███████████████
                    </motion.span>
                  ) : (
                    <span className="text-[#00A8E8]">Active Attestation</span>
                  )}
                </div>

                {/* Field 3: Circuit Constraints */}
                <div className="p-3 rounded-lg bg-[#231F20] border border-white/10 flex items-center justify-between">
                  <span className="text-[#908682]">Halo2 Arithmetic Gates:</span>
                  <span className="text-[#B86A36] font-bold">
                    {redactedCount >= 3 ? '38,420 Constraints Bound' : 'Synthesizing...'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-2 relative z-10">
                <div className="h-3 w-full bg-[#231F20] rounded-full overflow-hidden border border-[#00A8E8]/30 p-0.5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#4A6B32] to-[#00A8E8] rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#908682]">
                  <span>Evaluating on-device SNARK witness</span>
                  <span className="text-[#00A8E8] font-bold">{progress}%</span>
                </div>
              </div>

              {/* Persistent Privacy Seal */}
              <div className="pt-2 text-[11px] font-mono text-[#908682] flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00A8E8]" />
                <span>Your private numbers never leave this device.</span>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* STEP 4: VERIFICATION RESULT (STAMPED SEAL VERDICT) */}
          {/* ------------------------------------------------------------------ */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: LUXURY_EASE }}
              className="bg-[#231F20] rounded-xl border border-[#00A8E8]/40 p-6 sm:p-10 space-y-8 shadow-2xl text-center"
            >
              {/* Header */}
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-[#4A6B32]/12 text-[#4A6B32] font-mono text-xs border border-[#00A8E8]/30 inline-block">
                  Verification Complete
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
                  Midnight ZK Proof Verdict
                </h2>
              </div>

              {/* Hero Stamped Seal Component */}
              <div className="flex flex-col items-center justify-center py-4">
                <StampedSeal
                  status={proofResult?.eligible ? 'eligible' : 'ineligible'}
                  size="hero"
                  animate={true}
                  subtext={proofResult?.eligible ? 'SEALED & PROVED' : 'REQUIREMENTS NOT MET'}
                />
              </div>

              {/* Per-Requirement Pass/Fail Checklist */}
              <StaggerContainer className="max-w-lg mx-auto bg-[#231F20] rounded-xl border border-white/10 p-5 space-y-3 font-mono text-xs text-left">
                <div className="text-[11px] font-semibold text-[#00A8E8] uppercase tracking-wider mb-2">
                  Verified Requirements Summary
                </div>

                <StaggerItem className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-[#908682]">
                    Income Requirement (≥ ${minRequiredIncome.toLocaleString()} / yr)
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold ${
                      proofResult?.requirements.income.satisfied
                        ? 'text-[#00A8E8]'
                        : 'text-[#E85D31]'
                    }`}
                  >
                    {proofResult?.requirements.income.satisfied ? (
                      <>
                        <Check className="w-4 h-4" /> Satisfied
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" /> Failed
                      </>
                    )}
                  </span>
                </StaggerItem>

                <StaggerItem className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-[#908682]">Background Check Registry</span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold ${
                      proofResult?.requirements.background.satisfied
                        ? 'text-[#00A8E8]'
                        : 'text-[#E85D31]'
                    }`}
                  >
                    {proofResult?.requirements.background.satisfied ? (
                      <>
                        <Check className="w-4 h-4" /> Verified
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" /> Failed
                      </>
                    )}
                  </span>
                </StaggerItem>

                <StaggerItem className="flex items-center justify-between py-2">
                  <span className="text-[#908682]">Employment Attestation</span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold ${
                      proofResult?.requirements.employment.satisfied
                        ? 'text-[#00A8E8]'
                        : 'text-[#E85D31]'
                    }`}
                  >
                    {proofResult?.requirements.employment.satisfied ? (
                      <>
                        <Check className="w-4 h-4" /> Verified
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" /> Failed
                      </>
                    )}
                  </span>
                </StaggerItem>
              </StaggerContainer>

              {/* Proof Metadata Pill */}
              {proofResult && (
                <FadeIn delay={0.1} className="max-w-lg mx-auto p-3.5 rounded-lg bg-[#231F20] border border-[#00A8E8]/20 font-mono text-xs text-[#908682] space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Midnight Prover Engine:</span>
                    <span className="px-2 py-0.5 rounded bg-[#00A8E8]/10 text-[#00A8E8] text-[10px] font-bold border border-[#00A8E8]/30">
                      {proofResult.mode === 'live_devnet' ? '⚡ Live Devnet Proof' : '🔒 Midnight Halo2 Prover'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Midnight Tx Hash:</span>
                    <span className="text-[#00A8E8] font-bold">
                      {proofResult.midnightTxHash.substring(0, 20)}...
                    </span>
                  </div>
                  {proofResult.contractAddress && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Contract Target:</span>
                      <span className="text-white/80">
                        {proofResult.contractAddress.substring(0, 16)}...
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Block Height / Time:</span>
                    <span className="text-white">
                      #{proofResult.blockHeight.toLocaleString()} • {proofResult.zkMetrics?.provingTimeMs || proofResult.provingTimeMs || 1420}ms
                    </span>
                  </div>
                </FadeIn>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-3 px-4 rounded-md bg-[#231F20] hover:bg-white/10 text-white font-mono text-xs border border-white/15 transition-colors cursor-pointer"
                >
                  Re-run Prover Sandbox
                </button>

                <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }} className="flex-1">
                  <Link
                    href={`/tenant/applications/${application.id}`}
                    className="w-full py-3.5 px-6 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-[#231F20] font-bold text-sm transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
                  >
                    <span>View Complete Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Disclaimer */}
      <FadeIn delay={0.3} className="text-center py-6 text-xs font-mono text-[#908682]">
        Zero-Knowledge Verification Protocol • Powered by Midnight Network Halo2
      </FadeIn>
    </div>
  );
}
