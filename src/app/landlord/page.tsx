'use client';

import React from 'react';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ZkVerifiedBadge, ApplicantIdTag } from '@/components/ZkBadges';
import {
  Building2,
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  FileCheck2,
  EyeOff,
  Home,
} from 'lucide-react';

export default function LandlordDashboardPage() {
  const { properties, applications } = useZkRent();

  const totalProperties = properties.length;
  const totalApplications = applications.length;
  const verifiedCount = applications.filter((a) => a.status === 'verified_eligible' || a.status === 'lease_offered').length;
  const pendingCount = applications.filter((a) => a.status === 'pending_verification' || a.status === 'pending_payment').length;

  return (
    <div className="min-h-screen bg-[#EDECE4] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Greeting Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#14213D]/10">
          <div>
            <span className="font-mono text-xs text-[#AE8B3F] font-bold uppercase tracking-widest">
              Landlord Portal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#14213D] mt-1">
              Good morning, Property Manager
            </h1>
            <p className="text-sm text-[#4B5A79] mt-1">
              Review privacy-preserving Zero-Knowledge applicant qualifications for your listings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/landlord/properties/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#AE8B3F] hover:bg-[#977732] text-white text-sm font-medium shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create Free Listing</span>
            </Link>
          </div>
        </div>

        {/* Statistics Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-[#F6F5F0] border border-[#14213D]/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#4B5A79]">Active Properties</span>
              <Building2 className="w-4 h-4 text-[#AE8B3F]" />
            </div>
            <div className="font-serif text-3xl font-bold text-[#14213D]">
              {totalProperties}
            </div>
            <div className="text-[11px] font-mono text-[#8794AD]">Free listings published</div>
          </div>

          <div className="p-5 rounded-xl bg-[#F6F5F0] border border-[#14213D]/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#4B5A79]">Total Applications</span>
              <Users className="w-4 h-4 text-[#14213D]" />
            </div>
            <div className="font-serif text-3xl font-bold text-[#14213D]">
              {totalApplications}
            </div>
            <div className="text-[11px] font-mono text-[#8794AD]">Anonymized tenant applicants</div>
          </div>

          <div className="p-5 rounded-xl bg-[#F6F5F0] border border-[#14213D]/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#2E7D74]">Verified Eligible</span>
              <ShieldCheck className="w-4 h-4 text-[#2E7D74]" />
            </div>
            <div className="font-serif text-3xl font-bold text-[#2E7D74]">
              {verifiedCount}
            </div>
            <div className="text-[11px] font-mono text-[#8794AD]">Midnight ZK math validated</div>
          </div>
        </div>

        {/* Hard Rule Notice Banner */}
        <div className="bg-[#14213D] text-[#EDECE4] p-4 rounded-xl border border-[#4FB3A5]/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#17181A] border border-[#4FB3A5]/40 flex items-center justify-center text-[#4FB3A5] flex-shrink-0">
              <EyeOff className="w-4 h-4" />
            </div>
            <div className="text-xs font-mono">
              <span className="text-[#4FB3A5] font-bold">Zero-Knowledge Privacy Standard:</span> Applicants
              remain anonymized (#A81F) with zero raw salary, bank, or tax data exposed. Only
              cryptographically verifiable outcomes and receipts are surfaced.
            </div>
          </div>
        </div>

        {/* 2-Column Section: Recent Applicants Feed & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Applicant Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#14213D]">
                Recent Anonymous Applications
              </h2>
              <Link
                href="/landlord/applications"
                className="text-xs font-mono text-[#14213D] hover:text-[#AE8B3F] font-semibold"
              >
                View all ({applications.length})
              </Link>
            </div>

            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-[#F6F5F0] p-5 rounded-xl border border-[#14213D]/15 shadow-sm hover:shadow transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ApplicantIdTag id={app.applicantDisplayId} size="md" />
                        <span className="text-xs font-mono text-[#8794AD]">
                          {new Date(app.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {app.revealStatus === 'granted' && (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">
                            Identity Consented
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#14213D]">
                        {app.propertyTitle}
                      </h3>
                      <p className="text-xs text-[#4B5A79]">{app.propertyAddress}</p>
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                      <div className="font-serif font-bold text-base text-[#14213D]">
                        ${app.propertyPrice.toLocaleString()} / mo
                      </div>
                      <div className="mt-1">
                        {app.status === 'verified_eligible' || app.status === 'lease_offered' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2E7D74]/20 text-[#1F5751] text-xs font-mono font-bold border border-[#2E7D74]/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D74]" />
                            ✓ ZK VERIFIED: Eligible
                          </span>
                        ) : app.status === 'verified_ineligible' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B4483A]/15 text-[#B4483A] text-xs font-mono font-bold border border-[#B4483A]/30">
                            Ineligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold">
                            Pending ZK Proof
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
                        <span>Awaiting tenant proof synthesis</span>
                      )}
                    </div>

                    <Link
                      href={`/landlord/applications/${app.id}`}
                      className="px-4 py-1.5 rounded bg-[#14213D] hover:bg-[#1E2F54] text-white text-xs font-medium transition-colors"
                    >
                      Review Applicant & Proof →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Property Management (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#F6F5F0] p-6 rounded-xl border border-[#14213D]/15 space-y-4">
              <h3 className="font-serif font-bold text-base text-[#14213D]">
                Landlord Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/landlord/properties/new"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#AE8B3F] text-white text-xs font-mono font-bold shadow hover:bg-[#977732] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    + Create New Listing (Free)
                  </span>
                  <span>→</span>
                </Link>

                <Link
                  href="/landlord/properties"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#EDECE4] hover:bg-[#EDECE4]/80 text-xs font-mono text-[#14213D] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#AE8B3F]" />
                    Manage Properties ({properties.length})
                  </span>
                  <span>→</span>
                </Link>

                <Link
                  href="/landlord/applications"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#EDECE4] hover:bg-[#EDECE4]/80 text-xs font-mono text-[#14213D] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#2E7D74]" />
                    Review All Applications ({applications.length})
                  </span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Properties Overview Mini Card */}
            <div className="bg-[#F6F5F0] p-6 rounded-xl border border-[#14213D]/15 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-[#14213D]">
                  Active Listings
                </h4>
                <Link href="/landlord/properties" className="text-xs font-mono text-[#AE8B3F] hover:underline">
                  All
                </Link>
              </div>
              <div className="space-y-2 text-xs font-mono">
                {properties.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded bg-white border border-[#14213D]/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-[#14213D]">{p.title}</div>
                      <div className="text-[11px] text-[#8794AD]">${p.price.toLocaleString()}/mo</div>
                    </div>
                    <Link
                      href={`/landlord/properties/${p.id}`}
                      className="text-[#AE8B3F] hover:underline"
                    >
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
