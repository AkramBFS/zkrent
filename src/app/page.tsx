'use client';

import React from 'react';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ZkVerifiedBadge } from '@/components/ZkBadges';
import {
  ShieldCheck,
  Lock,
  FileX2,
  Sparkles,
  ArrowRight,
  Building,
  CheckCircle2,
  Cpu,
  EyeOff,
  Coins,
  MapPin,
  Bed,
  Bath,
  Maximize2,
} from 'lucide-react';

export default function HomePage() {
  const { properties } = useZkRent();
  const featuredProperties = properties.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#14213D]/10 bg-gradient-to-b from-[#EDECE4] via-[#F4F3EE] to-[#EDECE4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14213D] text-[#EDECE4] text-xs font-mono border border-[#4FB3A5]/40 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#4FB3A5]" />
                <span>Zero-Knowledge Rental Protocol on Midnight</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#14213D] tracking-tight leading-[1.15]">
                Rent without exposing your private financial data.
              </h1>

              <p className="text-lg sm:text-xl text-[#4B5A79] leading-relaxed max-w-2xl">
                Prove you meet a landlord's income, background, and employment requirements using
                cryptographic zero-knowledge proofs — without uploading pay stubs, bank statements,
                or tax returns.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/properties"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-[#14213D] hover:bg-[#1E2F54] text-white font-medium text-base shadow-md transition-all group"
                >
                  <span>Find a Home</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#AE8B3F]" />
                </Link>

                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-transparent hover:bg-[#14213D]/5 text-[#14213D] border border-[#14213D]/25 font-medium text-base transition-colors"
                >
                  <span>How Midnight ZK Works</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#14213D]/10 grid grid-cols-3 gap-4 text-xs font-mono text-[#4B5A79]">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-[#2E7D74]" />
                  <span>Redacted Witness</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#AE8B3F]" />
                  <span>On-Device Proving</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#14213D]" />
                  <span>Inspectable Receipt</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Concept Visualization */}
            <div className="lg:col-span-5">
              <div className="bg-[#14213D] text-[#EDECE4] rounded-xl p-6 shadow-2xl border border-[#4FB3A5]/30 relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4FB3A5] animate-pulse" />
                    <span className="font-mono text-xs text-[#4FB3A5] font-semibold uppercase tracking-wider">
                      The ZkRent Guarantee
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#8794AD]">Halo2 Circuit</span>
                </div>

                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="p-3 rounded-lg bg-[#17181A] border border-white/10 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-mono text-[#8794AD]">1. Landlord Requirement</div>
                      <div className="text-sm font-semibold text-white">Min Income ≥ $75,000 / yr</div>
                    </div>
                    <span className="px-2 py-1 text-[11px] font-mono rounded bg-white/10 text-[#AE8B3F]">
                      Public Rule
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 rounded-lg bg-[#17181A] border border-[#AE8B3F]/30 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-mono text-[#8794AD]">2. Tenant Private Data</div>
                      <div className="text-sm font-mono text-white flex items-center gap-2">
                        <span>Actual Salary:</span>
                        <span className="bg-[#17181A] px-2 py-0.5 rounded border border-[#AE8B3F]/40 text-[#AE8B3F] font-bold">
                          [REDACTED & PRIVATE]
                        </span>
                      </div>
                    </div>
                    <EyeOff className="w-4 h-4 text-[#AE8B3F]" />
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 rounded-lg bg-[#17181A] border border-[#2E7D74]/40 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-mono text-[#4FB3A5]">3. Zero-Knowledge Circuit</div>
                      <div className="text-xs font-mono text-[#8794AD]">
                        Evaluates: <code className="text-[#4FB3A5]">Private_Income ≥ Threshold</code>
                      </div>
                    </div>
                    <Cpu className="w-4 h-4 text-[#4FB3A5] animate-spin" />
                  </div>

                  {/* Verdict Seal Stamp */}
                  <div className="pt-2 flex flex-col items-center justify-center">
                    <StampedSeal status="eligible" size="md" subtext="NO RAW DATA SHARED" />
                    <p className="font-mono text-[11px] text-[#4FB3A5] mt-2 text-center">
                      ✓ Mathematical proof verified on Midnight Network
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16 bg-[#EDECE4] border-b border-[#14213D]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="font-mono text-xs text-[#AE8B3F] font-bold uppercase tracking-widest">
                Curated Listings
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#14213D] mt-1">
                Featured Midnight-Verified Properties
              </h2>
              <p className="text-sm text-[#4B5A79] mt-1">
                All properties display explicit ZK requirements upfront before you apply.
              </p>
            </div>
            <Link
              href="/properties"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[#14213D] hover:text-[#AE8B3F] transition-colors"
            >
              <span>View all {properties.length} properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-[#F6F5F0] rounded-xl overflow-hidden border border-[#14213D]/15 shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Photo */}
                <div className="relative h-56 w-full overflow-hidden bg-zinc-800">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded bg-[#14213D]/90 text-[#EDECE4] text-xs font-mono font-medium backdrop-blur-sm border border-white/10">
                      {property.type}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-3 py-1 rounded bg-[#14213D] text-[#AE8B3F] font-serif font-bold text-sm shadow">
                      ${property.price.toLocaleString()} <span className="text-xs font-sans text-white/80 font-normal">/mo</span>
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#14213D] group-hover:text-[#AE8B3F] transition-colors">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-[#4B5A79] mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#AE8B3F]" />
                      <span>{property.address}, {property.city}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-[#4B5A79] mt-3 py-2 border-y border-[#14213D]/10">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" /> {property.beds} Bed
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5" /> {property.baths} Bath
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5" /> {property.sqft} sqft
                      </span>
                    </div>
                  </div>

                  {/* ZK Requirements Visible Upfront */}
                  <div className="p-3 rounded-lg bg-[#EDECE4] border border-[#14213D]/10 space-y-1.5">
                    <div className="text-[11px] font-mono font-semibold text-[#14213D] flex items-center justify-between">
                      <span>ZK Criteria:</span>
                      <span className="text-[#2E7D74] font-bold">${property.requirements.verificationFee.toFixed(2)} Fee</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/70 text-[#14213D] border border-[#14213D]/10">
                        ✓ Income ≥ ${(property.requirements.minIncome / 1000).toFixed(0)}k/yr
                      </span>
                      {property.requirements.requireBackground && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/70 text-[#14213D] border border-[#14213D]/10">
                          ✓ Background check
                        </span>
                      )}
                      {property.requirements.requireEmployment && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/70 text-[#14213D] border border-[#14213D]/10">
                          ✓ Employment verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Link */}
                  <Link
                    href={`/properties/${property.id}`}
                    className="w-full py-2.5 px-4 rounded-md bg-[#14213D] hover:bg-[#1E2F54] text-white text-center text-sm font-medium transition-colors shadow-sm block"
                  >
                    View Property & Requirements
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ZkRent Value Pillars */}
      <section className="py-16 bg-[#F4F3EE] border-b border-[#14213D]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-mono text-xs text-[#2E7D74] font-bold uppercase tracking-widest">
              Core Principles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#14213D] mt-2">
              Why ZkRent Changes Renting
            </h2>
            <p className="text-[#4B5A79] text-base mt-2">
              Traditional rental applications demand your most sensitive financial papers.
              We replace intrusive disclosures with unforgeable cryptography.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="p-6 rounded-xl bg-[#EDECE4] border border-[#14213D]/15 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#14213D] text-[#4FB3A5] flex items-center justify-center border border-[#4FB3A5]/30">
                <FileX2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#14213D]">
                No Financial Documents Shared
              </h3>
              <p className="text-sm text-[#4B5A79] leading-relaxed">
                Landlords never receive bank statements, W-2 forms, or tax returns.
                Private values stay in your browser where the cryptographic witness is generated.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-xl bg-[#EDECE4] border border-[#14213D]/15 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#14213D] text-[#AE8B3F] flex items-center justify-center border border-[#AE8B3F]/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#14213D]">
                Inspectable, Verifiable Proofs
              </h3>
              <p className="text-sm text-[#4B5A79] leading-relaxed">
                Landlords don't have to take our word for it. Every application comes with an
                inspectable proof receipt verified on the Midnight Network smart contract.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-xl bg-[#EDECE4] border border-[#14213D]/15 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#14213D] text-[#2E7D74] flex items-center justify-center border border-[#2E7D74]/30">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#14213D]">
                Anonymized Until Consented
              </h3>
              <p className="text-sm text-[#4B5A79] leading-relaxed">
                Applicants remain anonymous (e.g. #A81F) throughout review. Your real name and
                contact info are only revealed when the landlord requests to draft a lease and you explicitly agree.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section className="py-16 bg-[#EDECE4] border-b border-[#14213D]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="font-mono text-xs text-[#AE8B3F] font-bold uppercase tracking-widest">
              Simple Protocol
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#14213D] mt-1">
              How You Apply with Midnight ZK
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-lg bg-[#F6F5F0] border border-[#14213D]/15 space-y-3 relative">
              <span className="font-mono font-extrabold text-2xl text-[#AE8B3F]">01</span>
              <h4 className="font-serif font-bold text-base text-[#14213D]">Choose Property</h4>
              <p className="text-xs text-[#4B5A79] leading-relaxed">
                Browse listings and inspect the exact ZK qualification thresholds before starting.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F6F5F0] border border-[#14213D]/15 space-y-3 relative">
              <span className="font-mono font-extrabold text-2xl text-[#AE8B3F]">02</span>
              <h4 className="font-serif font-bold text-base text-[#14213D]">Pay Verification Fee</h4>
              <p className="text-xs text-[#4B5A79] leading-relaxed">
                Complete a low $5.00 verification fee to initiate the on-chain circuit session.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F6F5F0] border border-[#14213D]/15 space-y-3 relative">
              <span className="font-mono font-extrabold text-2xl text-[#AE8B3F]">03</span>
              <h4 className="font-serif font-bold text-base text-[#14213D]">Generate ZK Proof</h4>
              <p className="text-xs text-[#4B5A79] leading-relaxed">
                Input credentials into your private local prover sandbox. Sensitive fields redact instantly.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F6F5F0] border border-[#14213D]/15 space-y-3 relative">
              <span className="font-mono font-extrabold text-2xl text-[#AE8B3F]">04</span>
              <h4 className="font-serif font-bold text-base text-[#14213D]">Landlord Reviews Proof</h4>
              <p className="text-xs text-[#4B5A79] leading-relaxed">
                Landlord receives an unforgeable "ELIGIBLE" verdict without seeing any underlying data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Split Dual CTA */}
      <section className="py-16 bg-[#14213D] text-[#EDECE4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tenant CTA */}
            <div className="p-8 rounded-xl bg-[#17181A] border border-[#4FB3A5]/30 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-[#2E7D74]/30 text-[#4FB3A5] font-mono text-xs border border-[#4FB3A5]/40 inline-block">
                  For Renters
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Apply to your next home with complete privacy.
                </h3>
                <p className="text-sm text-[#8794AD] leading-relaxed">
                  Browse available properties in Austin and start an application with on-device zero-knowledge verification.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[#4FB3A5] hover:bg-[#3FA193] text-[#14213D] font-bold text-sm transition-colors shadow"
                >
                  <span>Explore Rental Properties</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Landlord CTA */}
            <div className="p-8 rounded-xl bg-[#17181A] border border-[#AE8B3F]/30 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-[#AE8B3F]/20 text-[#AE8B3F] font-mono text-xs border border-[#AE8B3F]/40 inline-block">
                  For Property Owners
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  List for free. Receive cryptographically verified tenants.
                </h3>
                <p className="text-sm text-[#8794AD] leading-relaxed">
                  Eliminate document fraud and liability from storing tenant PII. Define custom income and background criteria.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href="/landlord/properties/new"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[#AE8B3F] hover:bg-[#977732] text-white font-bold text-sm transition-colors shadow"
                >
                  <span>Create Free Listing</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
