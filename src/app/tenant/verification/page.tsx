'use client';

import React from 'react';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ApplicantIdTag } from '@/components/ZkBadges';
import { VerifyReceiptDrawer } from '@/components/VerifyReceiptDrawer';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  History,
  FileCheck2,
  Calendar,
} from 'lucide-react';

export default function TenantVerificationHistoryPage() {
  const { applications } = useZkRent();

  // Applications that have completed verification
  const verifiedApplications = applications.filter((a) => a.verification);

  return (
    <div className="min-h-screen bg-[#EDECE4] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#14213D]/10">
          <div>
            <span className="font-mono text-xs text-[#2E7D74] font-bold uppercase tracking-widest">
              Cryptographic Records
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#14213D] mt-1">
              Zero-Knowledge Proof Vault
            </h1>
            <p className="text-sm text-[#4B5A79] mt-1">
              Inspect on-chain proof receipts, Halo2 circuit constraints, and verification nullifiers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded bg-[#14213D] text-[#4FB3A5] font-mono text-xs border border-[#4FB3A5]/30">
              Midnight Testnet Halo2
            </span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-[#14213D] text-[#EDECE4] p-5 rounded-xl border border-[#4FB3A5]/30 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#4FB3A5] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[#8794AD] space-y-1">
            <strong className="text-white">Tamper-Proof Receipt Records:</strong> Each verification
            receipt below represents a zero-knowledge circuit evaluated on your device and registered to
            the Midnight Network smart contract. Landlords verify satisfaction against these mathematical receipts.
          </div>
        </div>

        {/* Verifications List */}
        {verifiedApplications.length === 0 ? (
          <div className="p-12 text-center bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 space-y-3">
            <ShieldCheck className="w-10 h-10 text-[#8794AD] mx-auto" />
            <h3 className="font-serif text-xl font-bold text-[#14213D]">No ZK Proofs Generated Yet</h3>
            <p className="text-sm text-[#4B5A79]">Complete an application payment and run the on-device prover.</p>
            <Link
              href="/properties"
              className="inline-block px-4 py-2 rounded bg-[#14213D] text-white text-xs font-mono"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {verifiedApplications.map((app) => {
              const v = app.verification!;
              const reqCount =
                (v.requirements.income.satisfied ? 1 : 0) +
                (v.requirements.background.satisfied ? 1 : 0) +
                (v.requirements.employment.satisfied ? 1 : 0);

              return (
                <div
                  key={app.id}
                  className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 shadow-sm space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#14213D]/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <ApplicantIdTag id={app.applicantDisplayId} size="sm" />
                        <span className="text-xs font-mono text-[#8794AD]">
                          Verified on {new Date(v.verifiedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                          {new Date(v.verifiedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-[#14213D] mt-1">
                        {app.propertyTitle}
                      </h3>
                      <p className="text-xs text-[#4B5A79]">{app.propertyAddress}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                          v.eligible
                            ? 'bg-[#2E7D74]/20 text-[#1F5751] border-[#2E7D74]/40'
                            : 'bg-[#B4483A]/15 text-[#B4483A] border-[#B4483A]/30'
                        }`}
                      >
                        {v.eligible ? '✓ Eligible (3 / 3 Requirements)' : '✕ Ineligible'}
                      </span>
                      <span className="text-[11px] font-mono text-[#8794AD]">
                        Proving time: {v.zkMetrics.provingTimeMs}ms
                      </span>
                    </div>
                  </div>

                  {/* Verifiable Receipt Drawer Component */}
                  <VerifyReceiptDrawer
                    proof={v}
                    applicantDisplayId={app.applicantDisplayId}
                    propertyTitle={app.propertyTitle}
                    defaultExpanded={false}
                  />

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-2">
                    <Link
                      href={`/tenant/verification/${app.id}`}
                      className="text-xs font-mono text-[#AE8B3F] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Open Fullscreen Audit View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href={`/tenant/applications/${app.id}`}
                      className="px-4 py-2 rounded bg-[#14213D] text-white text-xs font-mono hover:bg-[#1E2F54] transition-colors"
                    >
                      View Application Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
