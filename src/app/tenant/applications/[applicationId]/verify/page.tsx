'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ApplicantIdTag } from '@/components/ZkBadges';
import confetti from 'canvas-confetti';
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
    setTimeout(() => {
      setProgress(100);
      setProvingStage('Submitting cryptographic proof to Midnight Network contract...');

      const result = submitVerificationProof(applicationId, {
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
              colors: ['#4FB3A5', '#AE8B3F', '#EDECE4'],
            });
          } catch (e) {
            // ignore if confetti fails
          }
        }
      }, 700);
    }, 2800);
  };

  if (!application) {
    return (
      <div className="min-h-screen bg-[#14213D] text-[#EDECE4] py-16 px-4 flex items-center justify-center">
        <div className="bg-[#17181A] p-8 rounded-xl border border-white/15 max-w-md text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#4FB3A5] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-white">Application Not Found</h2>
          <Link
            href="/tenant"
            className="inline-block px-5 py-2.5 rounded-md bg-[#4FB3A5] text-[#14213D] text-sm font-bold"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#14213D] text-[#EDECE4] py-10 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full space-y-8">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-[#4FB3A5]/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#17181A] border border-[#4FB3A5]/40 flex items-center justify-center text-[#4FB3A5]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif font-bold text-white text-base">
                Midnight ZK Prover
              </span>
              <div className="text-[11px] font-mono text-[#8794AD]">
                {application.propertyTitle} • {application.applicantDisplayId}
              </div>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 font-mono text-xs text-[#8794AD]">
            <span className={step === 1 ? 'text-[#4FB3A5] font-bold' : ''}>1. Criteria</span>
            <span>→</span>
            <span className={step === 2 ? 'text-[#4FB3A5] font-bold' : ''}>2. Witness</span>
            <span>→</span>
            <span className={step === 3 ? 'text-[#4FB3A5] font-bold' : ''}>3. Proving</span>
            <span>→</span>
            <span className={step === 4 ? 'text-[#4FB3A5] font-bold' : ''}>4. Verdict</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* STEP 1: REQUIREMENTS RECAP */}
        {/* ------------------------------------------------------------------ */}
        {step === 1 && (
          <div className="bg-[#17181A] rounded-xl border border-[#4FB3A5]/30 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded bg-[#2E7D74]/30 text-[#4FB3A5] text-xs font-mono border border-[#4FB3A5]/30 inline-block">
                Step 1 of 4: Qualification Criteria
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Verify Your Eligibility Privately
              </h2>
              <p className="text-sm text-[#8794AD] leading-relaxed">
                The landlord for <strong className="text-white">{application.propertyTitle}</strong> has
                established the following public qualification rules. You will prove satisfaction of these
                rules using a zero-knowledge circuit.
              </p>
            </div>

            {/* Criteria list */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-lg bg-[#14213D] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#17181A] text-[#4FB3A5] flex items-center justify-center border border-[#4FB3A5]/30">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      Minimum Annual Income
                    </div>
                    <div className="text-[#8794AD]">
                      Must earn ≥ ${minRequiredIncome.toLocaleString()} / year
                    </div>
                  </div>
                </div>
                <span className="text-[#4FB3A5] font-bold">Required</span>
              </div>

              <div className="p-4 rounded-lg bg-[#14213D] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#17181A] text-[#4FB3A5] flex items-center justify-center border border-[#4FB3A5]/30">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      Criminal & Eviction Background Check
                    </div>
                    <div className="text-[#8794AD]">
                      Clear registry verification required
                    </div>
                  </div>
                </div>
                <span className="text-[#4FB3A5] font-bold">
                  {bgRequired ? 'Required' : 'Optional'}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-[#14213D] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#17181A] text-[#4FB3A5] flex items-center justify-center border border-[#4FB3A5]/30">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      Employment Attestation
                    </div>
                    <div className="text-[#8794AD]">
                      Active employment credential required
                    </div>
                  </div>
                </div>
                <span className="text-[#4FB3A5] font-bold">
                  {empRequired ? 'Required' : 'Optional'}
                </span>
              </div>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="p-4 rounded-lg bg-[#14213D]/80 border border-[#4FB3A5]/30 flex items-start gap-3">
              <EyeOff className="w-5 h-5 text-[#4FB3A5] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#8794AD] leading-relaxed">
                <strong className="text-white">On-Device Proof Guarantee:</strong> Your actual salary,
                employer name, and background records are computed locally inside your browser. No human or
                server will ever see raw values.
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 px-6 rounded-md bg-[#4FB3A5] hover:bg-[#3FA193] text-[#14213D] font-bold text-sm transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
            >
              <span>Begin Private Proof Construction</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 2: PRIVATE CREDENTIALS INPUT */}
        {/* ------------------------------------------------------------------ */}
        {step === 2 && (
          <div className="bg-[#17181A] rounded-xl border border-[#4FB3A5]/30 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded bg-[#AE8B3F]/20 text-[#AE8B3F] text-xs font-mono border border-[#AE8B3F]/40 inline-block">
                Step 2 of 4: Private Witness Construction
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Enter Your Private Credentials
              </h2>
              <div className="p-3 rounded-lg bg-[#14213D] border border-amber-400/20 text-xs font-mono text-amber-200/90 leading-relaxed">
                ⚠️ <strong>Important Distinction:</strong> You are constructing a cryptographic witness in your
                local browser memory. This data is <strong>NOT</strong> being submitted or transmitted anywhere.
              </div>
            </div>

            <div className="space-y-5 font-mono text-xs">
              {/* Annual Income */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[#8794AD]">
                  <label className="font-semibold text-white">
                    1. Your Actual Annual Gross Income
                  </label>
                  <span>Requirement: ≥ ${minRequiredIncome.toLocaleString()}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8794AD] font-bold text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(parseInt(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-3 rounded-lg bg-[#14213D] border border-white/20 text-white font-mono text-base focus:outline-none focus:ring-2 focus:ring-[#4FB3A5]"
                  />
                </div>
                <p className="text-[11px] text-[#8794AD]">
                  {annualIncome >= minRequiredIncome ? (
                    <span className="text-[#4FB3A5] font-semibold">
                      ✓ Satisfies threshold (${(annualIncome - minRequiredIncome).toLocaleString()} above required minimum)
                    </span>
                  ) : (
                    <span className="text-[#B4483A] font-semibold">
                      ✕ Below required minimum of ${minRequiredIncome.toLocaleString()}
                    </span>
                  )}
                </p>
              </div>

              {/* Background Check Toggle */}
              <div className="p-4 rounded-lg bg-[#14213D] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">
                      2. Criminal & Eviction Background
                    </div>
                    <div className="text-[11px] text-[#8794AD]">
                      Accredited identity registry attestation
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBackgroundVerified(true)}
                      className={`px-3 py-1.5 rounded border text-xs font-mono transition-colors ${
                        backgroundVerified
                          ? 'bg-[#2E7D74] text-white border-[#4FB3A5]'
                          : 'bg-[#17181A] text-[#8794AD] border-white/10'
                      }`}
                    >
                      ✓ Verified (Clear)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBackgroundVerified(false)}
                      className={`px-3 py-1.5 rounded border text-xs font-mono transition-colors ${
                        !backgroundVerified
                          ? 'bg-[#B4483A] text-white border-[#B4483A]'
                          : 'bg-[#17181A] text-[#8794AD] border-white/10'
                      }`}
                    >
                      ✕ Unverified
                    </button>
                  </div>
                </div>
              </div>

              {/* Employment Verification Toggle */}
              <div className="p-4 rounded-lg bg-[#14213D] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">
                      3. Employment Status
                    </div>
                    <div className="text-[11px] text-[#8794AD]">
                      Active employment attestation
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEmploymentVerified(true)}
                      className={`px-3 py-1.5 rounded border text-xs font-mono transition-colors ${
                        employmentVerified
                          ? 'bg-[#2E7D74] text-white border-[#4FB3A5]'
                          : 'bg-[#17181A] text-[#8794AD] border-white/10'
                      }`}
                    >
                      ✓ Verified Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmploymentVerified(false)}
                      className={`px-3 py-1.5 rounded border text-xs font-mono transition-colors ${
                        !employmentVerified
                          ? 'bg-[#B4483A] text-white border-[#B4483A]'
                          : 'bg-[#17181A] text-[#8794AD] border-white/10'
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
                className="px-4 py-3 rounded-md bg-[#14213D] text-white text-xs font-mono hover:bg-white/10 transition-colors border border-white/15"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleStartProving}
                className="flex-1 py-3.5 px-6 rounded-md bg-[#4FB3A5] hover:bg-[#3FA193] text-[#14213D] font-bold text-sm transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Construct Witness & Generate ZK Proof</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 3: PROOF GENERATION ANIMATION (HERO FLAGSHIP MOMENT) */}
        {/* ------------------------------------------------------------------ */}
        {step === 3 && (
          <div className="bg-[#17181A] rounded-xl border border-[#4FB3A5]/40 p-6 sm:p-10 space-y-8 shadow-2xl text-center relative overflow-hidden">
            {/* Ambient Circuit Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#4FB3A5]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14213D] text-[#4FB3A5] font-mono text-xs border border-[#4FB3A5]/40">
                <Cpu className="w-4 h-4 animate-spin" />
                <span>Midnight Network Halo2 Prover Active</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-white">
                Generating Zero-Knowledge Proof
              </h2>
              <p className="text-xs font-mono text-[#8794AD] max-w-md mx-auto">
                {provingStage}
              </p>
            </div>

            {/* Animated Redaction Witness Pipeline */}
            <div className="max-w-md mx-auto space-y-3 text-left font-mono text-xs relative z-10">
              {/* Field 1: Income Redaction */}
              <div className="p-3 rounded-lg bg-[#14213D] border border-white/10 flex items-center justify-between">
                <span className="text-[#8794AD]">Annual Salary Witness:</span>
                {redactedCount >= 1 ? (
                  <span className="px-3 py-1 rounded bg-[#17181A] text-transparent select-none border border-[#4FB3A5]/40 transition-all font-bold">
                    ██████████ (REDACTED)
                  </span>
                ) : (
                  <span className="text-white font-bold">${annualIncome.toLocaleString()}</span>
                )}
              </div>

              {/* Field 2: Identity & Attestation Redaction */}
              <div className="p-3 rounded-lg bg-[#14213D] border border-white/10 flex items-center justify-between">
                <span className="text-[#8794AD]">Tenant PII & Tax Records:</span>
                {redactedCount >= 2 ? (
                  <span className="px-3 py-1 rounded bg-[#17181A] text-transparent select-none border border-[#4FB3A5]/40 transition-all font-bold">
                    ███████████████
                  </span>
                ) : (
                  <span className="text-[#4FB3A5]">Active Attestation</span>
                )}
              </div>

              {/* Field 3: Circuit Constraints */}
              <div className="p-3 rounded-lg bg-[#14213D] border border-white/10 flex items-center justify-between">
                <span className="text-[#8794AD]">Halo2 Arithmetic Gates:</span>
                <span className="text-[#AE8B3F] font-bold">
                  {redactedCount >= 3 ? '38,420 Constraints Bound' : 'Synthesizing...'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto space-y-2 relative z-10">
              <div className="h-3 w-full bg-[#14213D] rounded-full overflow-hidden border border-[#4FB3A5]/30 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#2E7D74] to-[#4FB3A5] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#8794AD]">
                <span>Evaluating on-device SNARK witness</span>
                <span className="text-[#4FB3A5] font-bold">{progress}%</span>
              </div>
            </div>

            {/* Persistent Privacy Seal */}
            <div className="pt-2 text-[11px] font-mono text-[#8794AD] flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#4FB3A5]" />
              <span>Your private numbers never leave this device.</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 4: VERIFICATION RESULT (STAMPED SEAL VERDICT) */}
        {/* ------------------------------------------------------------------ */}
        {step === 4 && (
          <div className="bg-[#17181A] rounded-xl border border-[#4FB3A5]/40 p-6 sm:p-10 space-y-8 shadow-2xl text-center">
            {/* Header */}
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-[#2E7D74]/30 text-[#4FB3A5] font-mono text-xs border border-[#4FB3A5]/30 inline-block">
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
            <div className="max-w-lg mx-auto bg-[#14213D] rounded-xl border border-white/10 p-5 space-y-3 font-mono text-xs text-left">
              <div className="text-[11px] font-semibold text-[#4FB3A5] uppercase tracking-wider mb-2">
                Verified Requirements Summary
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-[#8794AD]">
                  Income Requirement (≥ ${minRequiredIncome.toLocaleString()} / yr)
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-bold ${
                    proofResult?.requirements.income.satisfied
                      ? 'text-[#4FB3A5]'
                      : 'text-[#B4483A]'
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
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-[#8794AD]">Background Check Registry</span>
                <span
                  className={`inline-flex items-center gap-1 font-bold ${
                    proofResult?.requirements.background.satisfied
                      ? 'text-[#4FB3A5]'
                      : 'text-[#B4483A]'
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
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-[#8794AD]">Employment Attestation</span>
                <span
                  className={`inline-flex items-center gap-1 font-bold ${
                    proofResult?.requirements.employment.satisfied
                      ? 'text-[#4FB3A5]'
                      : 'text-[#B4483A]'
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
              </div>
            </div>

            {/* Proof Metadata Pill */}
            {proofResult && (
              <div className="max-w-lg mx-auto p-3 rounded-lg bg-[#14213D] border border-[#4FB3A5]/20 font-mono text-xs text-[#8794AD] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Midnight Tx Hash:</span>
                  <span className="text-[#4FB3A5]">
                    {proofResult.midnightTxHash.substring(0, 18)}...
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Block Height:</span>
                  <span className="text-white">#{proofResult.blockHeight.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-md bg-[#14213D] hover:bg-white/10 text-white font-mono text-xs border border-white/15 transition-colors"
              >
                Re-run Prover Sandbox
              </button>

              <Link
                href={`/tenant/applications/${application.id}`}
                className="flex-1 py-3.5 px-6 rounded-md bg-[#4FB3A5] hover:bg-[#3FA193] text-[#14213D] font-bold text-sm transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
              >
                <span>View Complete Application</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="text-center py-6 text-xs font-mono text-[#8794AD]">
        Zero-Knowledge Verification Protocol • Powered by Midnight Network Halo2
      </div>
    </div>
  );
}
