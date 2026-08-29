'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard } from '@/components/motion/motion';
import { ShieldCheck, Sparkles, Lock, EyeOff, FileX2, Cpu, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-12 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <FadeIn className="text-center space-y-3">
          <span className="font-mono text-xs text-[#B86A36] font-bold uppercase tracking-widest">
            Protocol Principles
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#231F20]">
            About ZkRent
          </h1>
          <p className="text-base text-[#3D3531] leading-relaxed max-w-xl mx-auto">
            We are building a future where tenants prove qualification through cryptography rather than
            unprotected personal document disclosure.
          </p>
        </FadeIn>

        {/* The Problem */}
        <FadeIn delay={0.1}>
          <MotionCard className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#231F20]">
              The Problem with Conventional Rental Applications
            </h2>
            <p className="text-sm text-[#3D3531] leading-relaxed">
              Every year, millions of renters hand over their most sensitive financial documents—tax returns,
              W-2 forms, full bank statements, and social security numbers—to unknown landlords and leasing agents.
              These documents sit indefinitely in unsecured email inboxes, local desktop folders, and legacy property
              management servers.
            </p>
            <p className="text-sm text-[#3D3531] leading-relaxed">
              This creates catastrophic identity theft risk for tenants and massive legal liability for property owners
              who are forced to become custodians of sensitive personally identifiable information (PII).
            </p>
          </MotionCard>
        </FadeIn>

        {/* Why Midnight Network */}
        <FadeIn delay={0.15}>
          <MotionCard className="bg-[#231F20] text-white rounded-xl border border-[#00A8E8]/30 p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-[#00A8E8] font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Why Midnight Network?</span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-white">
              Built for Regulated Privacy & Zero-Knowledge Verification
            </h2>

            <p className="text-sm text-[#908682] leading-relaxed">
              Midnight Network is specifically architected for confidential computation and zero-knowledge smart
              contracts. By combining client-side Halo2 proof synthesis with verifiable on-chain settlement, Midnight
              allows ZkRent to evaluate complex financial conditions (<code className="text-[#00A8E8]">Income ≥ $75,000</code>)
              without revealing the inputs to any third party.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#231F20] border border-white/10">
                <div className="text-[#00A8E8] font-bold">Client-Side Prover</div>
                <div className="text-[#908682] text-[11px] mt-1">WebAssembly execution in browser</div>
              </div>
              <div className="p-3 rounded-lg bg-[#231F20] border border-white/10">
                <div className="text-[#00A8E8] font-bold">Halo2 SNARKs</div>
                <div className="text-[#908682] text-[11px] mt-1">38,420 arithmetic constraints</div>
              </div>
              <div className="p-3 rounded-lg bg-[#231F20] border border-white/10">
                <div className="text-[#00A8E8] font-bold">Inspectable Receipts</div>
                <div className="text-[#908682] text-[11px] mt-1">Immutable on-chain verification</div>
              </div>
            </div>
          </MotionCard>
        </FadeIn>

        {/* Core Principles */}
        <FadeIn delay={0.2}>
          <div className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#231F20]">
              Our Core Principles
            </h2>

            <StaggerContainer className="space-y-3 font-mono text-xs text-[#231F20]">
              <StaggerItem>
                <div className="p-3 rounded-lg bg-white border border-[#231F20]/10 flex items-start gap-3">
                  <span className="font-bold text-[#B86A36] text-sm">1.</span>
                  <div>
                    <strong>Zero Raw Document Storage:</strong> ZkRent does not operate a file storage server for
                    tax documents or bank statements.
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="p-3 rounded-lg bg-white border border-[#231F20]/10 flex items-start gap-3">
                  <span className="font-bold text-[#B86A36] text-sm">2.</span>
                  <div>
                    <strong>Anonymity Until Consented:</strong> Prospective tenants remain anonymized as hash IDs
                    (#A81F) until an explicit reveal is consented for lease drafting.
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="p-3 rounded-lg bg-white border border-[#231F20]/10 flex items-start gap-3">
                  <span className="font-bold text-[#B86A36] text-sm">3.</span>
                  <div>
                    <strong>Mathematical Inspectability:</strong> Landlords receive inspectable cryptographic receipts
                    with transaction hashes rather than having to trust a blind green badge.
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.25} className="text-center pt-4">
          <motion.div whileHover={prefersReduced ? undefined : { scale: 1.03 }} whileTap={prefersReduced ? undefined : { scale: 0.97 }} className="inline-block">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-white font-mono text-xs font-bold transition-all shadow"
            >
              <span>Explore Properties on ZkRent</span>
              <ArrowRight className="w-4 h-4 text-[#B86A36]" />
            </Link>
          </motion.div>
        </FadeIn>
      </div>
    </div>
  );
}
