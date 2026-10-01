'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FadeIn, MotionCard, LUXURY_EASE } from '@/components/motion/motion';
import {
  SlidersHorizontal,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Crown,
  Lock,
  EyeOff,
  Save,
} from 'lucide-react';

export default function EditRequirementsPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;
  const { getProperty, updatePropertyRequirements, fetchProperties } = useZkRent();
  const prefersReduced = useReducedMotion();

  const property = getProperty(propertyId);

  const [minIncome, setMinIncome] = useState<number>(75000);
  const [maxRentToIncomeRatioBps, setMaxRentToIncomeRatioBps] = useState<number>(3300);
  const [minCreditScore, setMinCreditScore] = useState<number>(650);
  const [minEmploymentMonths, setMinEmploymentMonths] = useState<number>(12);
  const [primeMaxRentToIncomeRatioBps, setPrimeMaxRentToIncomeRatioBps] = useState<number>(2500);
  const [primeMinCreditScore, setPrimeMinCreditScore] = useState<number>(750);
  const [requireBackground, setRequireBackground] = useState<boolean>(true);
  const [requireEmployment, setRequireEmployment] = useState<boolean>(true);
  const [verificationFee, setVerificationFee] = useState<number>(5.0);
  const [saved, setSaved] = useState(false);

  // On-chain registration state
  const [isRegisteringOnChain, setIsRegisteringOnChain] = useState<boolean>(false);
  const [onChainSyncResult, setOnChainSyncResult] = useState<{
    txHash: string;
    criteriaHash: string;
    criteriaVersion: number;
    mode: string;
  } | null>(null);
  const [onChainError, setOnChainError] = useState<string | null>(null);

  useEffect(() => {
    if (property) {
      setMinIncome(property.requirements.minIncome);
      if (property.requirements.maxRentToIncomeRatioBps) setMaxRentToIncomeRatioBps(property.requirements.maxRentToIncomeRatioBps);
      if (property.requirements.minCreditScore) setMinCreditScore(property.requirements.minCreditScore);
      if (property.requirements.minEmploymentMonths !== undefined) setMinEmploymentMonths(property.requirements.minEmploymentMonths);
      if (property.requirements.primeMaxRentToIncomeRatioBps) {
        setPrimeMaxRentToIncomeRatioBps(property.requirements.primeMaxRentToIncomeRatioBps);
      } else if (property.requirements.primeMinIncomeRatioBps) {
        setPrimeMaxRentToIncomeRatioBps(property.requirements.primeMinIncomeRatioBps);
      }
      if (property.requirements.primeMinCreditScore) setPrimeMinCreditScore(property.requirements.primeMinCreditScore);
      setRequireBackground(property.requirements.requireBackground);
      setRequireEmployment(property.requirements.requireEmployment);
      setVerificationFee(property.requirements.verificationFee);
    }
  }, [property]);

  if (!property) {
    return (
      <div className="min-h-screen bg-[#E5E0D8] py-16 px-4 flex items-center justify-center">
        <FadeIn className="bg-[#FAFAFA] p-8 rounded-xl border border-[#E5E0D8] max-w-md text-center space-y-4">
          <SlidersHorizontal className="w-12 h-12 text-[#908682] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#231F20]">Property Not Found</h2>
          <Link
            href="/landlord/properties"
            className="inline-block px-5 py-2.5 rounded-md bg-[#231F20] text-white text-sm font-medium"
          >
            Back to Properties
          </Link>
        </FadeIn>
      </div>
    );
  }

  const hasUnsavedChanges =
    minIncome !== property.requirements.minIncome ||
    maxRentToIncomeRatioBps !== (property.requirements.maxRentToIncomeRatioBps ?? 3300) ||
    minCreditScore !== (property.requirements.minCreditScore ?? 650) ||
    minEmploymentMonths !== (property.requirements.minEmploymentMonths ?? 12) ||
    primeMaxRentToIncomeRatioBps !== (property.requirements.primeMaxRentToIncomeRatioBps ?? property.requirements.primeMinIncomeRatioBps ?? 2500) ||
    primeMinCreditScore !== (property.requirements.primeMinCreditScore ?? 750) ||
    requireBackground !== property.requirements.requireBackground ||
    requireEmployment !== property.requirements.requireEmployment ||
    verificationFee !== property.requirements.verificationFee;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePropertyRequirements(property.id, {
      minIncome,
      requireBackground,
      requireEmployment,
      verificationFee,
      maxRentToIncomeRatioBps,
      minCreditScore,
      minEmploymentMonths,
      primeMaxRentToIncomeRatioBps,
      primeMinCreditScore,
    });
    setSaved(true);
    setTimeout(() => {
      router.push(`/landlord/properties/${property.id}`);
    }, 800);
  };

  const handleRegisterOnChain = async () => {
    setIsRegisteringOnChain(true);
    setOnChainError(null);
    try {
      // 1. Save requirements in DB first
      await updatePropertyRequirements(property.id, {
        minIncome,
        requireBackground,
        requireEmployment,
        verificationFee,
        maxRentToIncomeRatioBps,
        minCreditScore,
        minEmploymentMonths,
        primeMaxRentToIncomeRatioBps,
        primeMinCreditScore,
      });

      // 2. Call register-criteria route to bind on Midnight contract
      const res = await fetch(`/api/properties/${property.id}/register-criteria`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register listing criteria on Midnight Network');
      }

      setOnChainSyncResult({
        txHash: data.midnightTxHash,
        criteriaHash: data.criteriaHash,
        criteriaVersion: data.criteriaVersion,
        mode: data.mode,
      });
      await fetchProperties();
    } catch (err: unknown) {
      setOnChainError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsRegisteringOnChain(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-8 overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back Link */}
        <FadeIn className="flex items-center justify-between">
          <Link
            href={`/landlord/properties/${property.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3D3531] hover:text-[#231F20] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Cancel & return to property</span>
          </Link>

          {property.criteriaHash && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#231F20]/5 border border-[#231F20]/15 text-[11px] font-mono text-[#231F20]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Contract Criteria v{property.criteriaVersion || 1}: {property.criteriaHash.slice(0, 10)}...</span>
            </div>
          )}
        </FadeIn>

        {/* Divergence Detection Banner */}
        <AnimatePresence>
          {(hasUnsavedChanges || !property.criteriaHash) && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">On-Chain Criteria Divergence Detected</div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Modifying thresholds changes the listing criteria hash. You must register these criteria on the
                    Midnight Network smart contract so applicant ZK circuits verify against your latest terms.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRegisterOnChain}
                disabled={isRegisteringOnChain}
                className="px-4 py-2 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white font-bold text-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 transition-colors shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegisteringOnChain ? 'animate-spin' : ''}`} />
                <span>{isRegisteringOnChain ? 'Registering...' : 'Register on Contract'}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* On-Chain Success Result Banner */}
        <AnimatePresence>
          {onChainSyncResult && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-mono text-xs space-y-2 shadow-sm"
            >
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Criteria Successfully Registered on Midnight Smart Contract</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                <div className="p-2 rounded bg-white border border-emerald-200">
                  <span className="text-[#908682] block text-[10px]">Criteria Version</span>
                  <span className="font-bold">v{onChainSyncResult.criteriaVersion}</span>
                </div>
                <div className="p-2 rounded bg-white border border-emerald-200">
                  <span className="text-[#908682] block text-[10px]">Transaction Hash</span>
                  <span className="font-bold truncate block">{onChainSyncResult.txHash}</span>
                </div>
                <div className="p-2 rounded bg-white border border-emerald-200">
                  <span className="text-[#908682] block text-[10px]">Canonical Hash</span>
                  <span className="font-bold truncate block">{onChainSyncResult.criteriaHash}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* On-Chain Error Banner */}
        <AnimatePresence>
          {onChainError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 font-mono text-xs flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-700 flex-shrink-0" />
              <span>{onChainError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: LUXURY_EASE }}
              className="p-4 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono text-xs flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-700" />
              <span>ZK qualification rules updated! Redirecting...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Requirements Form Card */}
        <FadeIn delay={0.08}>
          <form onSubmit={handleSave} className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#231F20] text-[#00A8E8] text-xs font-mono mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Midnight Network Verification Contract</span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-[#231F20]">
                Configure Zero-Knowledge Qualification Rules
              </h1>
              <p className="text-xs text-[#3D3531] mt-0.5">
                These rules directly define what applicants must prove to receive an &quot;Eligible ✓&quot; seal for{' '}
                <strong>{property.title}</strong>.
              </p>
            </div>

            <div className="space-y-5 font-mono text-xs">
              {/* Income */}
              <div className="p-5 rounded-xl bg-white border border-[#E5E0D8] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-[#231F20] text-sm block">
                      Minimum Annual Income Threshold
                    </label>
                    <p className="text-[11px] text-[#3D3531]">
                      Standard Tier: Tenant proves <code className="text-[#231F20]">Income ≥ Threshold</code>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[#4A6B32] font-bold text-lg font-serif">
                      ${minIncome.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-[#908682]">/ year</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="30000"
                  max="200000"
                  step="2500"
                  value={minIncome}
                  onChange={(e) => setMinIncome(parseInt(e.target.value))}
                  className="w-full accent-[#4A6B32]"
                />

                <div className="flex justify-between text-[10px] text-[#908682]">
                  <span>$30,000</span>
                  <span>$100,000</span>
                  <span>$200,000</span>
                </div>
              </div>

              {/* Rent-to-Income Ratio */}
              <div className="p-5 rounded-xl bg-white border border-[#E5E0D8] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-[#231F20] text-sm block">
                      Maximum Rent-to-Income Ratio (Standard Tier)
                    </label>
                    <p className="text-[11px] text-[#3D3531]">
                      Division-free condition: <code className="text-[#231F20]">Annual Rent × 10000 ≤ Income × {maxRentToIncomeRatioBps} bps</code>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[#4A6B32] font-bold text-lg font-serif">
                      {(maxRentToIncomeRatioBps / 100).toFixed(0)}%
                    </div>
                    <span className="text-[10px] text-[#908682]">of gross income</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="2000"
                  max="5000"
                  step="100"
                  value={maxRentToIncomeRatioBps}
                  onChange={(e) => setMaxRentToIncomeRatioBps(parseInt(e.target.value))}
                  className="w-full accent-[#4A6B32]"
                />

                <div className="flex justify-between text-[10px] text-[#908682]">
                  <span>20% (Strict)</span>
                  <span>33% (Standard)</span>
                  <span>50% (Flexible)</span>
                </div>
              </div>

              {/* Credit Score */}
              <div className="p-5 rounded-xl bg-white border border-[#E5E0D8] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-[#231F20] text-sm block">
                      Minimum Credit Score (Standard Tier)
                    </label>
                    <p className="text-[11px] text-[#3D3531]">
                      Condition: Tenant proves <code className="text-[#231F20]">Credit Score ≥ {minCreditScore}</code>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[#4A6B32] font-bold text-lg font-serif">
                      {minCreditScore}
                    </div>
                    <span className="text-[10px] text-[#908682]">FICO / Experian</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="550"
                  max="800"
                  step="10"
                  value={minCreditScore}
                  onChange={(e) => setMinCreditScore(parseInt(e.target.value))}
                  className="w-full accent-[#4A6B32]"
                />

                <div className="flex justify-between text-[10px] text-[#908682]">
                  <span>550 (Fair)</span>
                  <span>650 (Good)</span>
                  <span>750+ (Prime)</span>
                </div>
              </div>

              {/* Employment Tenure */}
              <div className="p-5 rounded-xl bg-white border border-[#E5E0D8] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-[#231F20] text-sm block">
                      Minimum Continuous Employment Tenure
                    </label>
                    <p className="text-[11px] text-[#3D3531]">
                      Condition: Tenant proves <code className="text-[#231F20]">Employment Tenure ≥ {minEmploymentMonths} months</code>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[#4A6B32] font-bold text-lg font-serif">
                      {minEmploymentMonths}
                    </div>
                    <span className="text-[10px] text-[#908682]">months</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="36"
                  step="3"
                  value={minEmploymentMonths}
                  onChange={(e) => setMinEmploymentMonths(parseInt(e.target.value))}
                  className="w-full accent-[#4A6B32]"
                />

                <div className="flex justify-between text-[10px] text-[#908682]">
                  <span>0 mo (Any)</span>
                  <span>12 mo (1 Year)</span>
                  <span>36 mo (3 Years)</span>
                </div>
              </div>

              {/* PRIME TIER THRESHOLDS CARD */}
              <div className="p-5 rounded-xl bg-[#231F20]/5 border-2 border-[#B86A36]/30 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#B86A36] uppercase tracking-wider">
                  <Crown className="w-4 h-4 text-[#B86A36]" />
                  <span>Tier 2: Prime Qualification Thresholds (Gold Seal)</span>
                </div>

                {/* Prime Max Rent to Income */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-bold text-[#231F20] text-xs block">
                        Prime Max Rent-to-Income Ratio
                      </label>
                      <p className="text-[11px] text-[#3D3531]">
                        Strict threshold for Prime status: <code className="text-[#231F20]">≤ {(primeMaxRentToIncomeRatioBps / 100).toFixed(0)}%</code>
                      </p>
                    </div>
                    <div className="text-[#B86A36] font-bold text-base font-serif">
                      {(primeMaxRentToIncomeRatioBps / 100).toFixed(0)}%
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1500"
                    max="3500"
                    step="100"
                    value={primeMaxRentToIncomeRatioBps}
                    onChange={(e) => setPrimeMaxRentToIncomeRatioBps(parseInt(e.target.value))}
                    className="w-full accent-[#B86A36]"
                  />
                  <div className="flex justify-between text-[10px] text-[#908682]">
                    <span>15% (Strict)</span>
                    <span>25% (Recommended)</span>
                    <span>35% (Relaxed)</span>
                  </div>
                </div>

                {/* Prime Min Credit Score */}
                <div className="space-y-2 pt-2 border-t border-[#231F20]/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-bold text-[#231F20] text-xs block">
                        Prime Minimum Credit Score
                      </label>
                      <p className="text-[11px] text-[#3D3531]">
                        Requires exceptional credit history: <code className="text-[#231F20]">≥ {primeMinCreditScore}</code>
                      </p>
                    </div>
                    <div className="text-[#B86A36] font-bold text-base font-serif">
                      {primeMinCreditScore}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="700"
                    max="850"
                    step="10"
                    value={primeMinCreditScore}
                    onChange={(e) => setPrimeMinCreditScore(parseInt(e.target.value))}
                    className="w-full accent-[#B86A36]"
                  />
                  <div className="flex justify-between text-[10px] text-[#908682]">
                    <span>700 (Very Good)</span>
                    <span>750 (Excellent)</span>
                    <span>800+ (Exceptional)</span>
                  </div>
                </div>
              </div>

              {/* Background */}
              <div className="p-5 rounded-xl bg-white border border-[#E5E0D8] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#231F20] text-sm">
                    Criminal & Eviction Background Check
                  </div>
                  <p className="text-[11px] text-[#3D3531]">
                    Demands certified clear background registry attestation in proof witness.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={requireBackground}
                  onChange={(e) => setRequireBackground(e.target.checked)}
                  className="w-5 h-5 rounded text-[#4A6B32] focus:ring-[#4A6B32]"
                />
              </div>

              {/* Employment */}
              <div className="p-5 rounded-xl bg-white border border-[#E5E0D8] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#231F20] text-sm">
                    Employment Status Attestation
                  </div>
                  <p className="text-[11px] text-[#3D3531]">
                    Demands active corporate payroll registry attestation in proof witness.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={requireEmployment}
                  onChange={(e) => setRequireEmployment(e.target.checked)}
                  className="w-5 h-5 rounded text-[#4A6B32] focus:ring-[#4A6B32]"
                />
              </div>

              {/* Verification Fee */}
              <div className="p-4 rounded-xl bg-[#E5E0D8] border border-[#231F20]/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#231F20]">
                    Applicant Verification Fee
                  </div>
                  <p className="text-[11px] text-[#3D3531]">
                    Covers on-chain proving gas and circuit execution costs paid by applicant.
                  </p>
                </div>
                <div className="font-bold text-[#231F20] text-base">${verificationFee.toFixed(2)}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#231F20]/10 flex items-center justify-between">
              <Link
                href={`/landlord/properties/${property.id}`}
                className="px-5 py-2.5 rounded-md bg-[#E5E0D8] text-[#231F20] font-mono text-xs hover:bg-[#231F20]/10 transition-colors"
              >
                Cancel
              </Link>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRegisterOnChain}
                  disabled={isRegisteringOnChain}
                  className="px-5 py-3 rounded-md bg-[#231F20] hover:bg-[#3D3531] text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegisteringOnChain ? 'animate-spin' : ''}`} />
                  <span>Register on Midnight Contract</span>
                </button>

                <motion.button
                  whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  type="submit"
                  className="px-6 py-3 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 shadow cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Requirements</span>
                </motion.button>
              </div>
            </div>
          </form>
        </FadeIn>
      </div>
    </div>
  );
}
