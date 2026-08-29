'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, Lock, EyeOff, FileX2, Cpu, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#EDECE4] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="font-mono text-xs text-[#AE8B3F] font-bold uppercase tracking-widest">
            Protocol Principles
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#14213D]">
            About ZkRent
          </h1>
          <p className="text-base text-[#4B5A79] leading-relaxed max-w-xl mx-auto">
            We are building a future where tenants prove qualification through cryptography rather than
            unprotected personal document disclosure.
          </p>
        </div>

        {/* The Problem */}
        <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-[#14213D]">
            The Problem with Conventional Rental Applications
          </h2>
          <p className="text-sm text-[#4B5A79] leading-relaxed">
            Every year, millions of renters hand over their most sensitive financial documents—tax returns,
            W-2 forms, full bank statements, and social security numbers—to unknown landlords and leasing agents.
            These documents sit indefinitely in unsecured email inboxes, local desktop folders, and legacy property
            management servers.
          </p>
          <p className="text-sm text-[#4B5A79] leading-relaxed">
            This creates catastrophic identity theft risk for tenants and massive legal liability for property owners
            who are forced to become custodians of sensitive personally identifiable information (PII).
          </p>
        </div>

        {/* Why Midnight Network */}
        <div className="bg-[#14213D] text-white rounded-xl border border-[#4FB3A5]/30 p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-[#4FB3A5] font-mono text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Why Midnight Network?</span>
          </div>

          <h2 className="font-serif text-2xl font-bold text-white">
            Built for Regulated Privacy & Zero-Knowledge Verification
          </h2>

          <p className="text-sm text-[#8794AD] leading-relaxed">
            Midnight Network is specifically architected for confidential computation and zero-knowledge smart
            contracts. By combining client-side Halo2 proof synthesis with verifiable on-chain settlement, Midnight
            allows ZkRent to evaluate complex financial conditions (<code className="text-[#4FB3A5]">Income ≥ $75,000</code>)
            without revealing the inputs to any third party.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#17181A] border border-white/10">
              <div className="text-[#4FB3A5] font-bold">Client-Side Prover</div>
              <div className="text-[#8794AD] text-[11px] mt-1">WebAssembly execution in browser</div>
            </div>
            <div className="p-3 rounded-lg bg-[#17181A] border border-white/10">
              <div className="text-[#4FB3A5] font-bold">Halo2 SNARKs</div>
              <div className="text-[#8794AD] text-[11px] mt-1">38,420 arithmetic constraints</div>
            </div>
            <div className="p-3 rounded-lg bg-[#17181A] border border-white/10">
              <div className="text-[#4FB3A5] font-bold">Inspectable Receipts</div>
              <div className="text-[#8794AD] text-[11px] mt-1">Immutable on-chain verification</div>
            </div>
          </div>
        </div>

        {/* Core Principles */}
        <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-[#14213D]">
            Our Core Principles
          </h2>

          <div className="space-y-3 font-mono text-xs text-[#14213D]">
            <div className="p-3 rounded-lg bg-white border border-[#14213D]/10 flex items-start gap-3">
              <span className="font-bold text-[#AE8B3F] text-sm">1.</span>
              <div>
                <strong>Zero Raw Document Storage:</strong> ZkRent does not operate a file storage server for
                tax documents or bank statements.
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-[#14213D]/10 flex items-start gap-3">
              <span className="font-bold text-[#AE8B3F] text-sm">2.</span>
              <div>
                <strong>Anonymity Until Consented:</strong> Prospective tenants remain anonymized as hash IDs
                (#A81F) until an explicit reveal is consented for lease drafting.
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-[#14213D]/10 flex items-start gap-3">
              <span className="font-bold text-[#AE8B3F] text-sm">3.</span>
              <div>
                <strong>Mathematical Inspectability:</strong> Landlords receive inspectable cryptographic receipts
                with transaction hashes rather than having to trust a blind green badge.
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-[#14213D] hover:bg-[#1E2F54] text-white font-mono text-xs font-bold transition-all shadow"
          >
            <span>Explore Properties on ZkRent</span>
            <ArrowRight className="w-4 h-4 text-[#AE8B3F]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
