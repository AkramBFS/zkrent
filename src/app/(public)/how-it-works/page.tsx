'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, LUXURY_EASE } from '@/components/motion/motion';
import {
  ShieldCheck,
  FileX2,
  FileText,
  Lock,
  EyeOff,
  Cpu,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building,
  UserCheck,
} from 'lucide-react';

export default function HowItWorksPage() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-12 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <FadeIn className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#231F20] text-[#00A8E8] text-xs font-mono border border-[#00A8E8]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Midnight Network Halo2 Verification Architecture</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#231F20] tracking-tight">
            How Zero-Knowledge Renting Works
          </h1>

          <p className="text-base sm:text-lg text-[#3D3531] leading-relaxed">
            Traditional renting forces you to surrender your most sensitive financial papers.
            ZkRent replaces paper trails with unforgeable mathematical proofs.
          </p>
        </FadeIn>

        {/* Traditional vs ZkRent Comparison Section */}
        <div className="space-y-6">
          <FadeIn className="text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#231F20]">
              Traditional Applications vs. ZkRent on Midnight
            </h2>
            <p className="text-xs font-mono text-[#908682] mt-1 uppercase tracking-wider">
              A paradigm shift from document sharing to cryptographic verification
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Traditional application */}
            <StaggerItem>
              <MotionCard className="bg-[#FAFAFA] rounded-2xl border-2 border-red-200 p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-sm h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-red-100">
                    <div className="flex items-center gap-2 text-[#E85D31] font-bold font-serif text-lg">
                      <AlertTriangle className="w-5 h-5 text-[#E85D31]" />
                      <span>Traditional Rental Process</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded">
                      High Privacy Risk
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs text-[#231F20]">
                    <div className="p-3 rounded-lg bg-red-50/50 border border-red-100 flex items-center justify-between">
                      <span>• 3 Months of Pay Stubs</span>
                      <span className="text-[#E85D31]">Exposed to Landlord</span>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50/50 border border-red-100 flex items-center justify-between">
                      <span>• Full Bank Account Statements</span>
                      <span className="text-[#E85D31]">Exposed to Landlord</span>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50/50 border border-red-100 flex items-center justify-between">
                      <span>• W-2 Forms & Tax Returns</span>
                      <span className="text-[#E85D31]">Exposed to Landlord</span>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50/50 border border-red-100 flex items-center justify-between">
                      <span>• Social Security & Identity Records</span>
                      <span className="text-[#E85D31]">Stored in Unsecured PDFs</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-red-100/60 text-red-900 text-xs font-mono leading-relaxed">
                  ✕ <strong>The Vulnerability:</strong> Landlords and property managers store your private
                  finances indefinitely in inbox folders, creating severe identity theft and data leak liabilities.
                </div>
              </MotionCard>
            </StaggerItem>

            {/* ZkRent application */}
            <StaggerItem>
              <MotionCard className="bg-[#231F20] text-white rounded-2xl border-2 border-[#00A8E8]/50 p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-xl relative overflow-hidden h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2 text-[#00A8E8] font-bold font-serif text-lg">
                      <ShieldCheck className="w-5 h-5 text-[#00A8E8]" />
                      <span>ZkRent on Midnight</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-[#4A6B32]/40 text-[#00A8E8] px-2 py-0.5 rounded border border-[#00A8E8]/40">
                      Mathematically Private
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-[#231F20] border border-[#00A8E8]/30 flex items-center justify-between">
                      <span>Private Salary & Earnings</span>
                      <span className="text-[#00A8E8]">Redacted in Browser</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#231F20] border border-[#00A8E8]/30 flex items-center justify-between">
                      <span>Zero-Knowledge Proof Circuit</span>
                      <span className="text-[#B86A36]">38,420 Constraints</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#231F20] border border-[#00A8E8]/30 flex items-center justify-between">
                      <span>Midnight Network Consensus</span>
                      <span className="text-[#00A8E8]">Verified on Chain</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#231F20] border border-[#00A8E8]/30 flex items-center justify-between">
                      <span>Landlord Receives</span>
                      <span className="text-white font-bold bg-[#4A6B32] px-2 py-0.5 rounded">
                        "Eligible ✓" Seal Only
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#231F20] border border-[#00A8E8]/30 text-xs font-mono text-[#908682] leading-relaxed">
                  ✓ <strong>The Privacy Guarantee:</strong> Your actual income, bank balances, and tax documents
                  are never uploaded, never sent across the network, and never stored in any database.
                </div>
              </MotionCard>
            </StaggerItem>
          </StaggerContainer>
        </div>

        {/* 5-Step Process Deep Dive */}
        <div className="space-y-8">
          <FadeIn className="text-center">
            <span className="font-mono text-xs text-[#B86A36] font-bold uppercase tracking-widest">
              End-to-End Workflow
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#231F20] mt-1">
              The 5-Step Verification Lifecycle
            </h2>
          </FadeIn>

          <StaggerContainer className="space-y-4 font-mono text-xs">
            {[
              {
                num: '01',
                title: '1. Choose a Property',
                sub: 'Inspect upfront ZK requirements',
                desc: 'Browse available homes. Every property explicitly displays minimum income thresholds, background criteria, and verification fees before you start.',
              },
              {
                num: '02',
                title: '2. Pay $5 Verification Fee',
                sub: 'Initialize on-chain session',
                desc: 'The one-time $5.00 fee covers the Midnight Network gas allocation, smart contract nullifier registration, and cryptographic session allocation.',
              },
              {
                num: '03',
                title: '3. Enter Private Credentials',
                sub: 'Local WebAssembly memory only',
                desc: 'Input your income and background credentials into the local client sandbox. Sensitive fields instantly redact behind solid black witness bars.',
              },
              {
                num: '04',
                title: '4. Generate ZK Proof',
                sub: 'Halo2 SNARK circuit compilation',
                desc: 'Your browser evaluates the arithmetic circuit, generating a succinct mathematical proof that proves your earnings exceed the required minimum without exposing the raw amount.',
              },
              {
                num: '05',
                title: '5. Landlord Receives Sealed Verdict',
                sub: 'Anonymized review & receipt audit',
                desc: 'The landlord receives an inspectable "Eligible ✓" seal with an immutable Midnight transaction receipt. Identity is only revealed if both parties agree to draft a lease agreement.',
              },
            ].map((s) => (
              <StaggerItem key={s.num}>
                <MotionCard className="bg-[#FAFAFA] p-6 rounded-xl border border-[#E5E0D8] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-1 font-serif text-3xl font-bold text-[#B86A36]">{s.num}</div>
                  <div className="md:col-span-4">
                    <h3 className="font-serif text-lg font-bold text-[#231F20]">{s.title}</h3>
                    <p className="text-[#3D3531]">{s.sub}</p>
                  </div>
                  <div className="md:col-span-7 text-[#3D3531] leading-relaxed">
                    {s.desc}
                  </div>
                </MotionCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* CTA Footer */}
        <FadeIn className="p-8 rounded-2xl bg-[#231F20] text-white text-center space-y-4">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold">
            Ready to experience private renting?
          </h3>
          <p className="text-xs font-mono text-[#908682] max-w-lg mx-auto">
            Browse our curated Austin properties and test the live on-device Midnight prover sandbox.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <motion.div whileHover={prefersReduced ? undefined : { scale: 1.03 }} whileTap={prefersReduced ? undefined : { scale: 0.97 }}>
              <Link
                href="/properties"
                className="px-6 py-3 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white font-mono text-xs font-bold transition-colors shadow inline-block"
              >
                Browse Properties →
              </Link>
            </motion.div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
