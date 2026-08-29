'use client';

import React, { useState } from 'react';
import { ZkProofDetails } from '@/types';
import { ShieldCheck, Check, Copy, CheckCheck, ChevronDown, ChevronUp, Terminal, Cpu } from 'lucide-react';

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const truncatedHash = (hash: string, chars = 10) => {
    if (!hash) return '';
    return `${hash.substring(0, chars)}...${hash.substring(hash.length - chars)}`;
  };

  return (
    <div className="border border-[#14213D]/15 rounded-lg bg-[#F6F5F0] overflow-hidden transition-all shadow-sm">
      {/* Header / Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#EDECE4]/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#14213D] text-[#4FB3A5] flex items-center justify-center border border-[#4FB3A5]/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-[#14213D] text-base">
                Cryptographic Proof Receipt
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#2E7D74]/15 text-[#1F5751] border border-[#2E7D74]/30 font-medium">
                Midnight Verified
              </span>
            </div>
            <p className="text-xs text-[#4B5A79] mt-0.5">
              Inspect on-chain proof metadata for {applicantDisplayId} {propertyTitle ? `• ${propertyTitle}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#AE8B3F] font-semibold">
          <span>{isExpanded ? 'Hide Receipt' : 'Verify Receipt'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Details Panel */}
      {isExpanded && (
        <div className="p-5 border-t border-[#14213D]/10 bg-[#14213D] text-[#EDECE4]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#4FB3A5]/20">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#4FB3A5]" />
              <span className="font-mono text-xs font-semibold text-[#4FB3A5] tracking-wider uppercase">
                Midnight Network Execution Log
              </span>
            </div>
            <span className="font-mono text-xs text-[#8794AD]">
              Block #{proof.blockHeight.toLocaleString()} • {new Date(proof.verifiedAt).toLocaleString()}
            </span>
          </div>

          {/* Cryptographic Hashes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded bg-[#17181A] border border-[#4FB3A5]/20">
              <div className="flex items-center justify-between text-xs text-[#8794AD] mb-1 font-mono">
                <span>Midnight Tx Hash</span>
                <button
                  onClick={() => copyToClipboard(proof.midnightTxHash, 'tx')}
                  className="text-[#4FB3A5] hover:text-white flex items-center gap-1"
                >
                  {copiedHash === 'tx' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{copiedHash === 'tx' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-[#4FB3A5] break-all">
                {proof.midnightTxHash}
              </div>
            </div>

            <div className="p-3 rounded bg-[#17181A] border border-[#4FB3A5]/20">
              <div className="flex items-center justify-between text-xs text-[#8794AD] mb-1 font-mono">
                <span>ZK Circuit Reference</span>
                <button
                  onClick={() => copyToClipboard(proof.circuitId, 'circuit')}
                  className="text-[#4FB3A5] hover:text-white flex items-center gap-1"
                >
                  {copiedHash === 'circuit' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{copiedHash === 'circuit' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-[#EDECE4] break-all">
                {proof.circuitId}
              </div>
            </div>
          </div>

          {/* Circuit Metrics & Verification Proof Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded bg-[#17181A]/80 border border-white/10">
              <div className="text-[11px] font-mono text-[#8794AD]">Circuit Constraints</div>
              <div className="text-sm font-mono font-bold text-white mt-1">
                {proof.zkMetrics.constraints.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded bg-[#17181A]/80 border border-white/10">
              <div className="text-[11px] font-mono text-[#8794AD]">Proving Time</div>
              <div className="text-sm font-mono font-bold text-[#4FB3A5] mt-1">
                {proof.zkMetrics.provingTimeMs} ms
              </div>
            </div>
            <div className="p-3 rounded bg-[#17181A]/80 border border-white/10">
              <div className="text-[11px] font-mono text-[#8794AD]">Protocol Version</div>
              <div className="text-sm font-mono font-bold text-[#AE8B3F] mt-1">
                {proof.zkMetrics.protocolVersion}
              </div>
            </div>
          </div>

          {/* Verified Criteria Breakdown */}
          <div className="p-3 rounded bg-[#17181A] border border-[#4FB3A5]/20">
            <div className="font-mono text-xs font-semibold text-[#4FB3A5] mb-2 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Verified Parameter Outcomes (Evaluated in Zero-Knowledge)</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-[#8794AD]">
                  Income Requirement Threshold (≥ ${(proof.requirements.income.required).toLocaleString()}/yr)
                </span>
                <span className="inline-flex items-center gap-1 text-[#4FB3A5] font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  {proof.requirements.income.satisfied ? 'Satisfied (Private Witness)' : 'Failed'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-[#8794AD]">Criminal & Credit Background Verification</span>
                <span className="inline-flex items-center gap-1 text-[#4FB3A5] font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  {proof.requirements.background.satisfied ? 'Satisfied (No Records)' : 'Failed'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#8794AD]">Active Employment Status Verification</span>
                <span className="inline-flex items-center gap-1 text-[#4FB3A5] font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  {proof.requirements.employment.satisfied ? 'Satisfied (Active Attestation)' : 'Failed'}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee Footer */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8794AD] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Math inspected & valid on Midnight Testnet
            </span>
            <span className="text-white/60">
              Zero raw documents or figures revealed to landlord
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
