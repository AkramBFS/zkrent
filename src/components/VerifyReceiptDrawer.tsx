'use client';

import React, { useState } from 'react';
import { ZkProofDetails } from '@/types';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { LUXURY_EASE } from '@/components/motion/motion';
import { ShieldCheck, Check, Copy, CheckCheck, ChevronDown, Terminal, Cpu } from 'lucide-react';

interface VerifyReceiptProps {
  proof: ZkProofDetails;
  applicantDisplayId: string;
  propertyTitle?: string;
  defaultExpanded?: boolean;
}

export function VerifyReceiptDrawer({
  proof,
  applicantDisplayId,
  propertyTitle,
  defaultExpanded = false,
}: VerifyReceiptProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const prefersReduced = useReducedMotion();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="border border-[#E5E0D8] rounded-lg bg-[#FAFAFA] overflow-hidden shadow-sm transition-shadow hover:shadow">
      {/* Header / Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#E5E0D8]/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={prefersReduced ? undefined : { scale: 1.05 }}
            className="w-9 h-9 rounded-md bg-[#231F20] text-[#00A8E8] flex items-center justify-center border border-[#00A8E8]/30"
          >
            <ShieldCheck className="w-5 h-5" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-[#231F20] text-base">
                Cryptographic Proof Receipt
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#4A6B32]/15 text-[#3A5427] border border-[#4A6B32]/30 font-medium">
                Midnight Verified
              </span>
            </div>
            <p className="text-xs text-[#3D3531] mt-0.5">
              Inspect on-chain proof metadata for {applicantDisplayId} {propertyTitle ? `• ${propertyTitle}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#B86A36] font-semibold">
          <span>{isExpanded ? 'Hide Receipt' : 'Verify Receipt'}</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: LUXURY_EASE }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </button>

      {/* Expanded Details Panel with Smooth Height Animation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: LUXURY_EASE }}
            className="overflow-hidden"
          >
            <div className="p-5 border-t border-[#231F20]/10 bg-[#231F20] text-[#E5E0D8]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#00A8E8]/20">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#00A8E8]" />
                  <span className="font-mono text-xs font-semibold text-[#00A8E8] tracking-wider uppercase">
                    Midnight Network Execution Log
                  </span>
                </div>
                <span className="font-mono text-xs text-[#908682]">
                  Block #{proof.blockHeight.toLocaleString()} • {new Date(proof.verifiedAt).toLocaleString()}
                </span>
              </div>

              {/* Cryptographic Hashes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded bg-[#231F20] border border-[#00A8E8]/20">
                  <div className="flex items-center justify-between text-xs text-[#908682] mb-1 font-mono">
                    <span>Midnight Tx Hash</span>
                    <motion.button
                      whileTap={prefersReduced ? undefined : { scale: 0.92 }}
                      onClick={() => copyToClipboard(proof.midnightTxHash, 'tx')}
                      className="text-[#00A8E8] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedHash === 'tx' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copiedHash === 'tx' ? 'Copied' : 'Copy'}</span>
                    </motion.button>
                  </div>
                  <div className="font-mono text-xs text-[#00A8E8] break-all">
                    {proof.midnightTxHash}
                  </div>
                </div>

                <div className="p-3 rounded bg-[#231F20] border border-[#00A8E8]/20">
                  <div className="flex items-center justify-between text-xs text-[#908682] mb-1 font-mono">
                    <span>ZK Circuit Reference</span>
                    <motion.button
                      whileTap={prefersReduced ? undefined : { scale: 0.92 }}
                      onClick={() => copyToClipboard(proof.circuitId, 'circuit')}
                      className="text-[#00A8E8] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedHash === 'circuit' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copiedHash === 'circuit' ? 'Copied' : 'Copy'}</span>
                    </motion.button>
                  </div>
                  <div className="font-mono text-xs text-[#E5E0D8] break-all">
                    {proof.circuitId}
                  </div>
                </div>
              </div>

              {/* Circuit Metrics & Verification Proof Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded bg-[#231F20]/80 border border-white/10">
                  <div className="text-[11px] font-mono text-[#908682]">Circuit Constraints</div>
                  <div className="text-sm font-mono font-bold text-white mt-1">
                    {proof.zkMetrics.constraints.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded bg-[#231F20]/80 border border-white/10">
                  <div className="text-[11px] font-mono text-[#908682]">Proving Time</div>
                  <div className="text-sm font-mono font-bold text-[#00A8E8] mt-1">
                    {proof.zkMetrics.provingTimeMs} ms
                  </div>
                </div>
                <div className="p-3 rounded bg-[#231F20]/80 border border-white/10">
                  <div className="text-[11px] font-mono text-[#908682]">Protocol Version</div>
                  <div className="text-sm font-mono font-bold text-[#B86A36] mt-1">
                    {proof.zkMetrics.protocolVersion}
                  </div>
                </div>
              </div>

              {/* Verified Criteria Breakdown */}
              <div className="p-3 rounded bg-[#231F20] border border-[#00A8E8]/20">
                <div className="font-mono text-xs font-semibold text-[#00A8E8] mb-2 flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Verified Parameter Outcomes (Evaluated in Zero-Knowledge)</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-[#908682]">
                      Income Requirement Threshold (≥ ${(proof.requirements.income.required).toLocaleString()}/yr)
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#00A8E8] font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      {proof.requirements.income.satisfied ? 'Satisfied (Private Witness)' : 'Failed'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-[#908682]">Criminal & Credit Background Verification</span>
                    <span className="inline-flex items-center gap-1 text-[#00A8E8] font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      {proof.requirements.background.satisfied ? 'Satisfied (No Records)' : 'Failed'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[#908682]">Active Employment Status Verification</span>
                    <span className="inline-flex items-center gap-1 text-[#00A8E8] font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      {proof.requirements.employment.satisfied ? 'Satisfied (Active Attestation)' : 'Failed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Privacy Guarantee Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#908682] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Math inspected & valid on Midnight Testnet
                </span>
                <span className="text-white/60">
                  Zero raw documents or figures revealed to landlord
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
