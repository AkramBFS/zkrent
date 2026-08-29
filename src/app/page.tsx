"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { useZkRent } from "@/context/ZkRentContext";
import {
  ShieldCheck,
  Lock,
  FileX2,
  Sparkles,
  ArrowRight,
  EyeOff,
  MapPin,
  Bed,
  Bath,
  Maximize2,
} from "lucide-react";

export default function HomePage() {
  const { properties } = useZkRent();
  const featuredProperties = properties.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#231F20]/10 bg-gradient-hero">
        {/* Next.js Optimized Image Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.jpg"
            alt="Hero Background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Tailwind Tint/Overlay Layer for Text Readability */}
          <div className="absolute inset-0 bg-[#E5E0D8]/85 backdrop-blur-[0.5px]" />
        </div>

        {/* Content Wrapper */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#231F20] text-[#E5E0D8] text-xs font-mono border border-[#00A8E8]/40 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#00A8E8]" />
                <span>Zero-Knowledge Rental Protocol on Midnight</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#231F20] tracking-tight leading-[1.15]">
                Rent without exposing your private financial data.
              </h1>

              <p className="text-lg sm:text-xl text-[#3D3531] leading-relaxed max-w-2xl">
                Prove you meet a landlord&apos;s income, background, and
                employment requirements using cryptographic zero-knowledge
                proofs — without uploading pay stubs, bank statements, or tax
                returns.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/properties"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-white font-medium text-base shadow-md transition-all group"
                >
                  <span>Find a Home</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#B86A36]" />
                </Link>

                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-transparent hover:bg-[#231F20]/5 text-[#231F20] border border-[#231F20]/25 font-medium text-base transition-colors"
                >
                  <span>How Midnight ZK Works</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#231F20]/10 grid grid-cols-3 gap-4 text-xs font-mono text-[#3D3531]">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-[#4A6B32]" />
                  <span>Redacted Witness</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#B86A36]" />
                  <span>On-Device Proving</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#231F20]" />
                  <span>Inspectable Receipt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of your page content remains here */}

      {/* Featured Properties Section */}
      <section className="py-16 bg-[#E5E0D8] border-b border-[#231F20]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="font-mono text-xs text-[#B86A36] font-bold uppercase tracking-widest">
                Curated Listings
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#231F20] mt-1">
                Featured Midnight-Verified Properties
              </h2>
              <p className="text-sm text-[#3D3531] mt-1">
                All properties display explicit ZK requirements upfront before
                you apply.
              </p>
            </div>
            <Link
              href="/properties"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[#231F20] hover:text-[#B86A36] transition-colors"
            >
              <span>View all {properties.length} properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-[#FAFAFA] rounded-xl overflow-hidden border border-[#E5E0D8] shadow-card transition-all flex flex-col group"
              >
                {/* Photo */}
                <div className="relative h-56 w-full overflow-hidden bg-zinc-800">
                  <img
                    src={
                      property.images?.[0] ||
                      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={property.title || "Property"}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded bg-[#231F20]/90 text-[#E5E0D8] text-xs font-mono font-medium backdrop-blur-sm border border-white/10">
                      {property.type}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-3 py-1 rounded bg-[#231F20] text-[#B86A36] font-serif font-bold text-sm shadow">
                      ${property.price.toLocaleString()}{" "}
                      <span className="text-xs font-sans text-white/80 font-normal">
                        /mo
                      </span>
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#231F20] group-hover:text-[#B86A36] transition-colors">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-[#3D3531] mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#B86A36]" />
                      <span>
                        {property.address}, {property.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-[#3D3531] mt-3 py-2 border-y border-[#231F20]/10">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" /> {property.beds} Bed
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5" /> {property.baths} Bath
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5" /> {property.sqft}{" "}
                        sqft
                      </span>
                    </div>
                  </div>

                  {/* ZK Requirements Visible Upfront */}
                  <div className="p-3 rounded-lg bg-[#E5E0D8] border border-[#231F20]/10 space-y-1.5">
                    <div className="text-[11px] font-mono font-semibold text-[#231F20] flex items-center justify-between">
                      <span>ZK Criteria:</span>
                      <span className="text-[#4A6B32] font-bold">
                        ${property.requirements.verificationFee.toFixed(2)} Fee
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#4A6B32]/12 text-[#4A6B32] font-semibold border-transparent">
                        ✓ Income ≥ $
                        {(property.requirements.minIncome / 1000).toFixed(0)}
                        k/yr
                      </span>
                      {property.requirements.requireBackground && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#4A6B32]/12 text-[#4A6B32] font-semibold border-transparent">
                          ✓ Background check
                        </span>
                      )}
                      {property.requirements.requireEmployment && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#4A6B32]/12 text-[#4A6B32] font-semibold border-transparent">
                          ✓ Employment verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Link */}
                  <Link
                    href={`/properties/${property.id}`}
                    className="w-full py-2.5 px-4 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-white text-center text-sm font-medium transition-colors shadow-sm block"
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
      <section className="py-16 bg-[#F3F0EA] border-b border-[#231F20]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-mono text-xs text-[#4A6B32] font-bold uppercase tracking-widest">
              Core Principles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#231F20] mt-2">
              Why ZkRent Changes Renting
            </h2>
            <p className="text-[#3D3531] text-base mt-2">
              Traditional rental applications demand your most sensitive
              financial papers. We replace intrusive disclosures with
              unforgeable cryptography.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="p-6 rounded-xl bg-[#E5E0D8] border border-[#E5E0D8] space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#231F20] text-[#00A8E8] flex items-center justify-center border border-[#00A8E8]/30">
                <FileX2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#231F20]">
                No Financial Documents Shared
              </h3>
              <p className="text-sm text-[#3D3531] leading-relaxed">
                Landlords never receive bank statements, W-2 forms, or tax
                returns. Private values stay in your browser where the
                cryptographic witness is generated.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-xl bg-[#E5E0D8] border border-[#E5E0D8] space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#231F20] text-[#B86A36] flex items-center justify-center border border-[#B86A36]/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#231F20]">
                Inspectable, Verifiable Proofs
              </h3>
              <p className="text-sm text-[#3D3531] leading-relaxed">
                Landlords don&apos;t have to take our word for it. Every
                application comes with an inspectable proof receipt verified on
                the Midnight Network smart contract.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-xl bg-[#E5E0D8] border border-[#E5E0D8] space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#231F20] text-[#4A6B32] flex items-center justify-center border border-[#4A6B32]/30">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#231F20]">
                Anonymized Until Consented
              </h3>
              <p className="text-sm text-[#3D3531] leading-relaxed">
                Applicants remain anonymous (e.g. #A81F) throughout review. Your
                real name and contact info are only revealed when the landlord
                requests to draft a lease and you explicitly agree.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section className="py-16 bg-[#E5E0D8] border-b border-[#231F20]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="font-mono text-xs text-[#B86A36] font-bold uppercase tracking-widest">
              Simple Protocol
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#231F20] mt-1">
              How You Apply with Midnight ZK
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-lg bg-[#FAFAFA] border border-[#E5E0D8] space-y-3 relative">
              <span className="font-mono font-extrabold text-2xl text-[#B86A36]">
                01
              </span>
              <h4 className="font-serif font-bold text-base text-[#231F20]">
                Choose Property
              </h4>
              <p className="text-xs text-[#3D3531] leading-relaxed">
                Browse listings and inspect the exact ZK qualification
                thresholds before starting.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#FAFAFA] border border-[#E5E0D8] space-y-3 relative">
              <span className="font-mono font-extrabold text-2xl text-[#B86A36]">
                02
              </span>
              <h4 className="font-serif font-bold text-base text-[#231F20]">
                Pay Verification Fee
              </h4>
              <p className="text-xs text-[#3D3531] leading-relaxed">
                Complete a low $5.00 verification fee to initiate the on-chain
                circuit session.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#FAFAFA] border border-[#E5E0D8] space-y-3 relative">
              <span className="font-mono font-extrabold text-2xl text-[#B86A36]">
                03
              </span>
              <h4 className="font-serif font-bold text-base text-[#231F20]">
                Generate ZK Proof
              </h4>
              <p className="text-xs text-[#3D3531] leading-relaxed">
                Input credentials into your private local prover sandbox.
                Sensitive fields redact instantly.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#FAFAFA] border border-[#E5E0D8] space-y-3 relative">
              <span className="font-mono font-extrabold text-2xl text-[#B86A36]">
                04
              </span>
              <h4 className="font-serif font-bold text-base text-[#231F20]">
                Landlord Reviews Proof
              </h4>
              <p className="text-xs text-[#3D3531] leading-relaxed">
                Landlord receives an unforgeable &quot;ELIGIBLE&quot; verdict
                without seeing any underlying data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Split Dual CTA */}
      <section className="py-16 bg-[#231F20] text-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tenant CTA */}
            <div className="p-8 rounded-xl bg-[#231F20] border border-[#00A8E8]/30 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-[#4A6B32]/12 text-[#4A6B32] font-mono text-xs border border-[#00A8E8]/40 inline-block">
                  For Renters
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Apply to your next home with complete privacy.
                </h3>
                <p className="text-sm text-[#908682] leading-relaxed">
                  Browse available properties in Austin and start an application
                  with on-device zero-knowledge verification.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-[#231F20] font-bold text-sm transition-colors shadow"
                >
                  <span>Explore Rental Properties</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Landlord CTA */}
            <div className="p-8 rounded-xl bg-[#231F20] border border-[#B86A36]/30 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-[#B86A36]/20 text-[#B86A36] font-mono text-xs border border-[#B86A36]/40 inline-block">
                  For Property Owners
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  List for free. Receive cryptographically verified tenants.
                </h3>
                <p className="text-sm text-[#908682] leading-relaxed">
                  Eliminate document fraud and liability from storing tenant
                  PII. Define custom income and background criteria.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href="/landlord/properties/new"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white font-bold text-sm transition-colors shadow"
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
