'use client';

import React from 'react';
import Link from 'next/link';
import { StampedSeal } from '@/components/ZkBadges';
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
  return (
    <div className="min-h-screen bg-[#EDECE4] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14213D] text-[#4FB3A5] text-xs font-mono border border-[#4FB3A5]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Midnight Network Halo2 Verification Architecture</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#14213D] tracking-tight">
            How Zero-Knowledge Renting Works
          </h1>

          <p className="text-base sm:text-lg text-[#4B5A79] leading-relaxed">
            Traditional renting forces you to surrender your most sensitive financial papers.
            ZkRent replaces paper trails with unforgeable mathematical proofs.
          </p>
        </div>

        {/* Traditional vs ZkRent Comparison Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14213D]">
              Traditional Applications vs. ZkRent on Midnight
            </h2>
            <p className="text-xs font-mono text-[#8794AD] mt-1 uppercase tracking-wider">
              A paradigm shift from document sharing to cryptographic verification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Traditional application */}
            <div className="bg-[#F6F5F0] rounded-2xl border-2 border-red-200 p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-red-100">
                  <div className="flex items-center gap-2 text-[#B4483A] font-bold font-serif text-lg">
                    <AlertTriangle className="w-5 h-5 text-[#B4483A]" />
                    <span>Traditional Rental Process</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded">
                    High Privacy Risk
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs text-[#14213D]">
                  <div className="p-3 rounded-lg bg-red-50/50 border border-red-100 flex items-center justify-between">
                    <span>• 3 Months of Pay Stubs</span>
                    <span className="text-[#B4483A]">Exposed to Landlord</span>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50/50 border border-red-100 flex items-center justify-between">
                    <span>• Full Bank Account Statements</span>
                    <span className="text-[#B4483A]">Exposed to Landlord</span>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50/50 border border-red-100 flex items-center justify-between">
                    <span>• W-2 Forms & Tax Returns</span>
                    <span className="text-[#B4483A]">Exposed to Landlord</span>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50/50 border border-red-100 flex items-center justify-between">
                    <span>• Social Security & Identity Records</span>
                    <span className="text-[#B4483A]">Stored in Unsecured PDFs</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-red-100/60 text-red-900 text-xs font-mono leading-relaxed">
                ✕ <strong>The Vulnerability:</strong> Landlords and property managers store your private
                finances indefinitely in inbox folders, creating severe identity theft and data leak liabilities.
              </div>
            </div>

            {/* ZkRent application */}
            <div className="bg-[#14213D] text-white rounded-2xl border-2 border-[#4FB3A5]/50 p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-[#4FB3A5] font-bold font-serif text-lg">
                    <ShieldCheck className="w-5 h-5 text-[#4FB3A5]" />
                    <span>ZkRent on Midnight</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-[#2E7D74]/40 text-[#4FB3A5] px-2 py-0.5 rounded border border-[#4FB3A5]/40">
                    Mathematically Private
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-[#17181A] border border-[#4FB3A5]/30 flex items-center justify-between">
                    <span>Private Salary & Earnings</span>
                    <span className="text-[#4FB3A5]">Redacted in Browser</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#17181A] border border-[#4FB3A5]/30 flex items-center justify-between">
                    <span>Zero-Knowledge Proof Circuit</span>
                    <span className="text-[#AE8B3F]">38,420 Constraints</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#17181A] border border-[#4FB3A5]/30 flex items-center justify-between">
                    <span>Midnight Network Consensus</span>
                    <span className="text-[#4FB3A5]">Verified on Chain</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#17181A] border border-[#4FB3A5]/30 flex items-center justify-between">
                    <span>Landlord Receives</span>
                    <span className="text-white font-bold bg-[#2E7D74] px-2 py-0.5 rounded">
                      "Eligible ✓" Seal Only
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#17181A] border border-[#4FB3A5]/30 text-xs font-mono text-[#8794AD] leading-relaxed">
                ✓ <strong>The Privacy Guarantee:</strong> Your actual income, bank balances, and tax documents
                are never uploaded, never sent across the network, and never stored in any database.
              </div>
            </div>
          </div>
        </div>

        {/* 5-Step Process Deep Dive */}
        <div className="space-y-8">
          <div className="text-center">
            <span className="font-mono text-xs text-[#AE8B3F] font-bold uppercase tracking-widest">
              End-to-End Workflow
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#14213D] mt-1">
              The 5-Step Verification Lifecycle
            </h2>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="bg-[#F6F5F0] p-6 rounded-xl border border-[#14213D]/15 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-1 font-serif text-3xl font-bold text-[#AE8B3F]">01</div>
              <div className="md:col-span-4">
                <h3 className="font-serif text-lg font-bold text-[#14213D]">1. Choose a Property</h3>
                <p className="text-[#4B5A79]">Inspect upfront ZK requirements</p>
              </div>
              <div className="md:col-span-7 text-[#4B5A79] leading-relaxed">
                Browse available homes. Every property explicitly displays minimum income thresholds, background
                criteria, and verification fees before you start.
              </div>
            </div>

            <div className="bg-[#F6F5F0] p-6 rounded-xl border border-[#14213D]/15 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-1 font-serif text-3xl font-bold text-[#AE8B3F]">02</div>
              <div className="md:col-span-4">
                <h3 className="font-serif text-lg font-bold text-[#14213D]">2. Pay $5 Verification Fee</h3>
                <p className="text-[#4B5A79]">Initialize on-chain session</p>
              </div>
              <div className="md:col-span-7 text-[#4B5A79] leading-relaxed">
                The one-time $5.00 fee covers the Midnight Network gas allocation, smart contract nullifier
                registration, and cryptographic session allocation.
              </div>
            </div>

            <div className="bg-[#F6F5F0] p-6 rounded-xl border border-[#14213D]/15 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-1 font-serif text-3xl font-bold text-[#AE8B3F]">03</div>
              <div className="md:col-span-4">
                <h3 className="font-serif text-lg font-bold text-[#14213D]">3. Enter Private Credentials</h3>
                <p className="text-[#4B5A79]">Local WebAssembly memory only</p>
              </div>
              <div className="md:col-span-7 text-[#4B5A79] leading-relaxed">
                Input your income and background credentials into the local client sandbox. Sensitive fields
                instantly redact behind solid black witness bars.
              </div>
            </div>

            <div className="bg-[#F6F5F0] p-6 rounded-xl border border-[#14213D]/15 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-1 font-serif text-3xl font-bold text-[#AE8B3F]">04</div>
              <div className="md:col-span-4">
                <h3 className="font-serif text-lg font-bold text-[#14213D]">4. Generate ZK Proof</h3>
                <p className="text-[#4B5A79]">Halo2 SNARK circuit compilation</p>
              </div>
              <div className="md:col-span-7 text-[#4B5A79] leading-relaxed">
                Your browser evaluates the arithmetic circuit, generating a succinct mathematical proof that
                proves your earnings exceed the required minimum without exposing the raw amount.
              </div>
            </div>

            <div className="bg-[#F6F5F0] p-6 rounded-xl border border-[#14213D]/15 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-1 font-serif text-3xl font-bold text-[#AE8B3F]">05</div>
              <div className="md:col-span-4">
                <h3 className="font-serif text-lg font-bold text-[#14213D]">5. Landlord Receives Sealed Verdict</h3>
                <p className="text-[#4B5A79]">Anonymized review & receipt audit</p>
              </div>
              <div className="md:col-span-7 text-[#4B5A79] leading-relaxed">
                The landlord receives an inspectable "Eligible ✓" seal with an immutable Midnight transaction
                receipt. Identity is only revealed if both parties agree to draft a lease agreement.
              </div>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="p-8 rounded-2xl bg-[#14213D] text-white text-center space-y-4">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold">
            Ready to experience private renting?
          </h3>
          <p className="text-xs font-mono text-[#8794AD] max-w-lg mx-auto">
            Browse our curated Austin properties and test the live on-device Midnight prover sandbox.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/properties"
              className="px-6 py-3 rounded-md bg-[#AE8B3F] hover:bg-[#977732] text-white font-mono text-xs font-bold transition-colors shadow"
            >
              Browse Properties →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
