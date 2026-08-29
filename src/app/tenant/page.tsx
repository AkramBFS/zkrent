'use client';

import React from 'react';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ZkVerifiedBadge, ApplicantIdTag } from '@/components/ZkBadges';
import {
  ShieldCheck,
  Building,
  Home,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Lock,
  EyeOff,
  History,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function TenantDashboardPage() {
  const { applications, currentUser, properties } = useZkRent();

  // Tenant's applications
  const myApplications = applications;
  const verifiedCount = myApplications.filter((a) => a.status === 'verified_eligible').length;
  const pendingCount = myApplications.filter((a) => a.status === 'pending_payment' || a.status === 'pending_verification').length;
  const pendingReveals = myApplications.filter((a) => a.revealStatus === 'requested');

  return (
    <div className="min-h-screen bg-[#EDECE4] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Greeting Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#14213D]/10">
          <div>
            <span className="font-mono text-xs text-[#AE8B3F] font-bold uppercase tracking-widest">
              Tenant Portal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#14213D] mt-1">
              Good morning, {currentUser.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-[#4B5A79] mt-1">
              Manage your private rental applications and Midnight ZK proofs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#14213D] hover:bg-[#1E2F54] text-white text-sm font-medium shadow transition-all"
            >
              <Home className="w-4 h-4 text-[#AE8B3F]" />
              <span>Browse Properties</span>
            </Link>
          </div>
        </div>

        {/* Reveal Consent Action Banner (if landlord requested reveal) */}
        {pendingReveals.length > 0 && (
          <div className="p-5 rounded-xl bg-[#14213D] text-[#EDECE4] border border-[#AE8B3F] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#AE8B3F] animate-ping" />
                <span className="font-mono text-xs text-[#AE8B3F] font-bold uppercase tracking-wider">
                  Action Required: Landlord Lease Reveal Request
                </span>
              </div>
              <p className="text-sm text-white">
                The landlord for <strong className="text-[#AE8B3F]">{pendingReveals[0].propertyTitle}</strong> is ready to draft a lease and requested to view your legal name and contact information.
              </p>
            </div>
            <Link
              href={`/tenant/applications/${pendingReveals[0].id}`}
              className="px-4 py-2 rounded-md bg-[#AE8B3F] hover:bg-[#977732] text-white text-xs font-mono font-bold whitespace-nowrap shadow transition-colors"
            >
              Review Consent Request →
            </Link>
          </div>
        )}

        {/* Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-[#F6F5F0] border border-[#14213D]/15 space-y-2">
            <div className="text-xs font-mono text-[#4B5A79]">Active Applications</div>
            <div className="font-serif text-3xl font-bold text-[#14213D]">
              {myApplications.length}
            </div>
            <div className="text-[11px] font-mono text-[#8794AD]">Submissions in review</div>
          </div>

          <div className="p-5 rounded-xl bg-[#F6F5F0] border border-[#14213D]/15 space-y-2">
            <div className="text-xs font-mono text-[#2E7D74]">Verified Eligible</div>
            <div className="font-serif text-3xl font-bold text-[#2E7D74]">
              {verifiedCount}
            </div>
            <div className="text-[11px] font-mono text-[#8794AD]">Proofs accepted on-chain</div>
          </div>

          <div className="p-5 rounded-xl bg-[#F6F5F0] border border-[#14213D]/15 space-y-2">
            <div className="text-xs font-mono text-[#AE8B3F]">Pending Verification</div>
            <div className="font-serif text-3xl font-bold text-[#AE8B3F]">
              {pendingCount}
            </div>
            <div className="text-[11px] font-mono text-[#8794AD]">Ready for proof generation</div>
          </div>
        </div>

        {/* 2-Column: Applications Feed & Privacy Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Applications Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#14213D]">
                My Rental Applications
              </h2>
              <Link
                href="/tenant/applications"
                className="text-xs font-mono text-[#14213D] hover:text-[#AE8B3F] font-semibold"
              >
                View all ({myApplications.length})
              </Link>
            </div>

            <div className="space-y-3">
              {myApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-[#F6F5F0] p-5 rounded-xl border border-[#14213D]/15 shadow-sm hover:shadow transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <ApplicantIdTag id={app.applicantDisplayId} size="sm" />
                        <span className="text-xs font-mono text-[#4B5A79]">
                          {new Date(app.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#14213D] mt-1">
                        {app.propertyTitle}
                      </h3>
                      <p className="text-xs text-[#4B5A79]">{app.propertyAddress}</p>
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                      <div className="font-serif font-bold text-lg text-[#14213D]">
                        ${app.propertyPrice.toLocaleString()} <span className="text-xs font-sans text-[#4B5A79]">/mo</span>
                      </div>
                      <div className="mt-1">
                        {app.status === 'verified_eligible' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2E7D74]/20 text-[#1F5751] text-xs font-mono font-bold border border-[#2E7D74]/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D74]" />
                            Eligible ✓
                          </span>
                        ) : app.status === 'verified_ineligible' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B4483A]/15 text-[#B4483A] text-xs font-mono font-bold border border-[#B4483A]/30">
                            Not Eligible
                          </span>
                        ) : app.paymentStatus === 'unpaid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#AE8B3F]/15 text-[#AE8B3F] text-xs font-mono font-bold border border-[#AE8B3F]/30">
                            Payment Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-mono font-bold">
                            Ready for ZK Proof
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#14213D]/10 flex items-center justify-between">
                    <div className="text-xs font-mono text-[#8794AD]">
                      {app.verification ? (
                        <span>Tx: {app.verification.midnightTxHash.substring(0, 16)}...</span>
                      ) : (
                        <span>Step: {app.paymentStatus === 'unpaid' ? 'Pay $5 Fee' : 'Generate Proof'}</span>
                      )}
                    </div>

                    <Link
                      href={
                        app.paymentStatus === 'unpaid'
                          ? `/tenant/applications/${app.id}/payment`
                          : app.status === 'pending_verification'
                          ? `/tenant/applications/${app.id}/verify`
                          : `/tenant/applications/${app.id}`
                      }
                      className="px-4 py-1.5 rounded bg-[#14213D] hover:bg-[#1E2F54] text-white text-xs font-medium transition-colors"
                    >
                      {app.paymentStatus === 'unpaid'
                        ? 'Pay Fee ($5.00)'
                        : app.status === 'pending_verification'
                        ? 'Generate ZK Proof →'
                        : 'View Application & Receipt'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Privacy Pledge (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-[#F6F5F0] p-6 rounded-xl border border-[#14213D]/15 space-y-4">
              <h3 className="font-serif font-bold text-base text-[#14213D]">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/properties"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#EDECE4] hover:bg-[#EDECE4]/80 text-xs font-mono text-[#14213D] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-[#AE8B3F]" />
                    Browse Properties
                  </span>
                  <span>→</span>
                </Link>

                <Link
                  href="/tenant/applications"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#EDECE4] hover:bg-[#EDECE4]/80 text-xs font-mono text-[#14213D] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2E7D74]" />
                    View Applications ({myApplications.length})
                  </span>
                  <span>→</span>
                </Link>

                <Link
                  href="/tenant/verification"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#EDECE4] hover:bg-[#EDECE4]/80 text-xs font-mono text-[#14213D] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#14213D]" />
                    ZK Proof Receipt Vault
                  </span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Privacy Guarantee Reminder Card */}
            <div className="bg-[#14213D] text-[#EDECE4] p-6 rounded-xl border border-[#4FB3A5]/30 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#17181A] border border-[#4FB3A5]/40 flex items-center justify-center text-[#4FB3A5]">
                  <EyeOff className="w-4 h-4" />
                </div>
                <h4 className="font-serif font-bold text-sm text-white">
                  Privacy Guarantee
                </h4>
              </div>

              <p className="text-xs text-[#8794AD] leading-relaxed">
                Your private financial credentials (salary, tax records, bank statements) are{' '}
                <strong className="text-white">never stored by ZkRent</strong> and never sent across the network.
                All proofs execute in isolated WebAssembly inside your browser.
              </p>

              <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-mono text-[#4FB3A5]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Midnight Zero-Knowledge v1.2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
