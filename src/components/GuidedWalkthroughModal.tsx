'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
} from 'lucide-react';

interface Step {
  title: string;
  badge: string;
  headline: string;
  description: string;
  keyPoints: string[];
  ctaText?: string;
  ctaHref?: string;
}

const STEPS: Step[] = [
  {
    title: 'Zero-Knowledge Leasing',
    badge: 'Step 1 of 4: The Paradigm Shift',
    headline: 'Verify Income & Background with Zero Paperwork',
    description:
      'Traditional rental applications demand your most sensitive data: W-2 forms, bank statements, SSNs, and tax returns. ZkRent replaces paper disclosure with zero-knowledge proofs on the Midnight Network.',
    keyPoints: [
      'Landlords define mathematical qualification rules (income multiples, credit thresholds).',
      'Tenants prove compliance cryptographically without revealing raw integers.',
      'No centralized honeypot of sensitive tenant financial dossiers.',
    ],
  },
  {
    title: 'Client-Side Proving',
    badge: 'Step 2 of 4: Privacy Architecture',
    headline: 'Your Financial Data Never Leaves Your Browser',
    description:
      'Document OCR and witness synthesis run directly inside your client browser. Only the cryptographic qualification seal and epoch-scoped nullifier are sent to the network.',
    keyPoints: [
      'In-browser Tesseract OCR extracts numbers strictly into client RAM.',
      'Midnight Halo2 zero-knowledge circuit proves qualification against criteria.',
      'Server and landlord receive only { isEligible, tier, nullifier, proofHash }.',
    ],
    ctaText: 'Explore Available Listings',
    ctaHref: '/properties',
  },
  {
    title: 'Tiered Anti-Squatting Proofs',
    badge: 'Step 3 of 4: Smart Contract Rules',
    headline: 'Deterministic Tiers & Division-Free Circuit Math',
    description:
      'Midnight smart contracts evaluate integer ratios without floating-point errors. Qualified applicants can unlock "Prime Tier" status (4× rent ratio + 750+ credit) for expedited approval.',
    keyPoints: [
      'Anti-squatting binds each proof to your unique application ID.',
      'Epoch-scoped nullifier prevents reusing proofs across unrelated listings.',
      'Criteria hash locks verification to immutable landlord requirements.',
    ],
  },
  {
    title: 'Two-Phase Consent Reveal',
    badge: 'Step 4 of 4: Identity Handshake',
    headline: 'Selective Reveal: You Control When Landlords See Your Name',
    description:
      'Landlords review anonymous proofs labeled "Applicant #8492". Once a landlord indicates intent to offer a lease, you receive a consent prompt to unlock your contact info.',
    keyPoints: [
      'No landlord can see your name or email during initial screening.',
      'Landlord requests identity reveal; tenant explicitly signs "Grant" or "Decline".',
      'Lease offer is confirmed only after mutually consented verification.',
    ],
    ctaText: 'Go to Dashboard',
    ctaHref: '/dashboard',
  },
];

export function GuidedWalkthroughModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if first-time user
  useEffect(() => {
    try {
      const seen = localStorage.getItem('zkrent_walkthrough_seen');
      if (!seen) {
        // Automatically suggest tour on first landing
        const timer = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const closeTour = useCallback((markAsSeen = true) => {
    setIsOpen(false);
    if (markAsSeen) {
      try {
        localStorage.setItem('zkrent_walkthrough_seen', 'true');
      } catch {
        // Ignore
      }
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTour();
      } else if (e.key === 'ArrowRight' && currentStep < STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, closeTour]);

  const step = STEPS[currentStep];

  return (
    <>
      {/* Trigger button in bottom corner */}
      <button
        onClick={() => {
          setCurrentStep(0);
          setIsOpen(true);
        }}
        title="2-Minute Quickstart Guided Tour"
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#231F20] text-[#E5E0D8] border border-[#3D3531] shadow-xl hover:border-[#B86A36] transition-all text-xs font-mono group cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#B86A36] group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline font-medium">Quickstart Tour</span>
        <span className="sm:hidden font-medium">Tour</span>
      </button>

      {/* Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl bg-[#231F20] text-[#FAFAFA] rounded-2xl border border-[#3D3531] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#3D3531] bg-[#1E1A1B]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#B86A36]/20 border border-[#B86A36]/40 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#B86A36]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-white">
                      ZkRent Architecture & Quickstart
                    </h3>
                    <div className="text-[11px] font-mono text-[#908682]">
                      2-Minute Zero-Knowledge Interactive Walkthrough
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => closeTour(true)}
                  className="p-1.5 rounded-lg text-[#908682] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Close tour"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#B86A36] font-bold uppercase tracking-wider">
                    {step.badge}
                  </span>
                  <span className="text-[#908682]">
                    {currentStep + 1} of {STEPS.length}
                  </span>
                </div>

                <div>
                  <h4 className="font-serif text-xl font-bold text-white mb-2">
                    {step.headline}
                  </h4>
                  <p className="text-xs text-[#C5BDB7] leading-relaxed font-sans">
                    {step.description}
                  </p>
                </div>

                {/* Key Points */}
                <div className="space-y-2 bg-[#1A1718] p-3.5 rounded-xl border border-[#3D3531]/70">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#908682] block mb-1">
                    Key Highlights:
                  </span>
                  {step.keyPoints.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#E5E0D8]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00A8E8] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer navigation */}
              <div className="p-5 border-t border-[#3D3531] bg-[#1E1A1B] flex items-center justify-between">
                {/* Stepper dots */}
                <div className="flex items-center gap-1.5">
                  {STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentStep(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        i === currentStep
                          ? 'w-6 bg-[#B86A36]'
                          : 'w-2 bg-[#3D3531] hover:bg-[#908682]'
                      }`}
                      aria-label={`Go to step ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Next / Prev Buttons */}
                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                      className="px-3 py-1.5 rounded-lg border border-[#3D3531] hover:bg-white/5 text-[#E5E0D8] text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                  )}

                  {currentStep < STEPS.length - 1 ? (
                    <button
                      onClick={() => setCurrentStep((prev) => prev + 1)}
                      className="px-4 py-1.5 rounded-lg bg-[#B86A36] hover:bg-[#A05A2C] text-white text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => closeTour(true)}
                      className="px-4 py-1.5 rounded-lg bg-[#00A8E8] hover:bg-[#0090c8] text-white text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Finish & Explore</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
