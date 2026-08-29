'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ZkVerifiedBadge } from '@/components/ZkBadges';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, LUXURY_EASE } from '@/components/motion/motion';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock,
  EyeOff,
  Building,
  ArrowLeft,
  Share2,
  Heart,
  FileCheck2,
  HelpCircle,
  Coins,
} from 'lucide-react';

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;
  const { getProperty, createApplication, setActiveRole } = useZkRent();
  const prefersReduced = useReducedMotion();

  const property = getProperty(propertyId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isApplying, setIsApplying] = useState(false);

  if (!property) {
    return (
      <div className="min-h-screen bg-[#E5E0D8] py-16 px-4 flex items-center justify-center">
        <FadeIn className="bg-[#FAFAFA] p-8 rounded-xl border border-[#E5E0D8] max-w-md text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#908682] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#231F20]">Property Not Found</h2>
          <p className="text-sm text-[#3D3531]">The listing you requested could not be found or has been unlisted.</p>
          <Link
            href="/properties"
            className="inline-block px-5 py-2.5 rounded-md bg-[#231F20] text-white text-sm font-medium"
          >
            Return to Properties
          </Link>
        </FadeIn>
      </div>
    );
  }

  const handleApply = async () => {
    setIsApplying(true);
    setActiveRole('tenant');
    try {
      const newApp = await createApplication(property.id);
      if (newApp.paymentStatus === 'paid') {
        router.push(`/tenant/applications/${newApp.id}/verify`);
      } else {
        router.push(`/tenant/applications/${newApp.id}/payment`);
      }
    } catch (err) {
      console.error('Failed to create application:', err);
      router.push(`/login?callbackUrl=/properties/${property.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link & Title Navigation */}
        <FadeIn className="flex items-center justify-between">
          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 text-sm font-mono text-[#3D3531] hover:text-[#231F20] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to all properties</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded bg-[#231F20] text-[#00A8E8] border border-[#00A8E8]/30">
              Midnight ZK Circuit Ready
            </span>
          </div>
        </FadeIn>

        {/* Gallery Section with Crossfade */}
        <FadeIn delay={0.05} className="space-y-3">
          <div className="relative h-[380px] sm:h-[480px] w-full rounded-xl overflow-hidden bg-zinc-900 shadow-md">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={property.images[activeImageIndex] || property.images[0]}
                alt={property.title}
                initial={{ opacity: 0.6, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.6 }}
                transition={{ duration: 0.35, ease: LUXURY_EASE }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded bg-[#231F20]/90 text-[#E5E0D8] text-xs font-mono font-medium backdrop-blur-sm border border-white/10">
                {property.type}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {property.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-20 w-32 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#B86A36] scale-[1.02] shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </FadeIn>

        {/* 2-Column Layout: Left Details / Right Sticky Requirements Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Details (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header info */}
            <FadeIn delay={0.1}>
              <MotionCard className="bg-[#FAFAFA] p-6 rounded-xl border border-[#E5E0D8] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-[#B86A36] font-bold uppercase tracking-widest">
                      Managed by {property.landlordName}
                    </span>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#231F20] mt-1">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-1.5 text-sm text-[#3D3531] mt-1">
                      <MapPin className="w-4 h-4 text-[#B86A36]" />
                      <span>
                        {property.address}, {property.city}, {property.state} {property.zip}
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <div className="font-serif text-3xl font-bold text-[#231F20]">
                      ${property.price.toLocaleString()}
                    </div>
                    <span className="text-xs font-mono text-[#3D3531]">per month</span>
                  </div>
                </div>

                {/* Specs row */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#231F20]/10 font-mono text-sm">
                  <div className="flex items-center gap-2 text-[#231F20]">
                    <Bed className="w-4 h-4 text-[#B86A36]" />
                    <span>{property.beds === 0 ? 'Studio' : `${property.beds} Bedrooms`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#231F20]">
                    <Bath className="w-4 h-4 text-[#B86A36]" />
                    <span>{property.baths} Bathrooms</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#231F20]">
                    <Maximize2 className="w-4 h-4 text-[#B86A36]" />
                    <span>{property.sqft} sq ft</span>
                  </div>
                </div>
              </MotionCard>
            </FadeIn>

            {/* Description */}
            <FadeIn delay={0.15}>
              <MotionCard className="bg-[#FAFAFA] p-6 rounded-xl border border-[#E5E0D8] space-y-3">
                <h2 className="font-serif text-xl font-bold text-[#231F20]">About This Residence</h2>
                <p className="text-sm text-[#3D3531] leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </MotionCard>
            </FadeIn>

            {/* Amenities */}
            <FadeIn delay={0.2}>
              <MotionCard className="bg-[#FAFAFA] p-6 rounded-xl border border-[#E5E0D8] space-y-4">
                <h2 className="font-serif text-xl font-bold text-[#231F20]">Building & Unit Amenities</h2>
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.amenities.map((amenity, idx) => (
                    <StaggerItem key={idx}>
                      <div className="flex items-center gap-2.5 text-sm text-[#231F20] font-mono">
                        <CheckCircle2 className="w-4 h-4 text-[#4A6B32]" />
                        <span>{amenity}</span>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </MotionCard>
            </FadeIn>

            {/* Privacy Explanation Banner */}
            <FadeIn delay={0.25}>
              <MotionCard className="bg-[#231F20] text-[#E5E0D8] p-6 rounded-xl border border-[#00A8E8]/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#231F20] border border-[#00A8E8]/40 flex items-center justify-center text-[#00A8E8]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">
                      Private Zero-Knowledge Application
                    </h3>
                    <p className="text-xs font-mono text-[#00A8E8]">
                      No Raw Documents • No Document Uploads • Anonymized Tenant Identity
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#908682] leading-relaxed">
                  When you apply for this property, your financial documents stay in your local browser sandbox.
                  The Midnight Network Halo2 zero-knowledge prover checks if your income meets the required{' '}
                  <strong className="text-white">${property.requirements.minIncome.toLocaleString()} / year</strong>{' '}
                  threshold without disclosing your exact earnings.
                </p>
              </MotionCard>
            </FadeIn>
          </div>

          {/* Right Sticky Sidebar: Explicit ZK Requirements (4 cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-5">
            <FadeIn delay={0.15}>
              <div className="bg-[#FAFAFA] rounded-xl border border-[#231F20]/20 shadow-lg overflow-hidden">
                {/* Sidebar Header */}
                <div className="p-6 bg-[#231F20] text-white space-y-1">
                  <div className="text-xs font-mono text-[#B86A36] font-bold uppercase tracking-wider">
                    Qualification Standard
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="font-serif text-3xl font-bold">
                      ${property.price.toLocaleString()}
                    </div>
                    <span className="text-xs font-mono text-[#908682]">/ month</span>
                  </div>
                </div>

                {/* Requirements Checklist */}
                <div className="p-6 space-y-5">
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#231F20] mb-1">
                      Eligibility Requirements
                    </h4>
                    <p className="text-xs text-[#3D3531]">
                      These are the exact criteria evaluated in zero-knowledge:
                    </p>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {/* Income */}
                    <div className="p-3 rounded-lg bg-[#E5E0D8] border border-[#231F20]/10 space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#231F20]">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#4A6B32]" />
                          <span>Minimum Annual Income</span>
                        </span>
                        <span className="text-[#4A6B32]">
                          ${property.requirements.minIncome.toLocaleString()} / yr
                        </span>
                      </div>
                      <p className="text-[11px] text-[#3D3531]">
                        Proves you earn at least ${(property.requirements.minIncome).toLocaleString()} without revealing actual salary.
                      </p>
                    </div>

                    {/* Background */}
                    <div className="p-3 rounded-lg bg-[#E5E0D8] border border-[#231F20]/10 space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#231F20]">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#4A6B32]" />
                          <span>Background Check</span>
                        </span>
                        <span className="text-[#231F20]">
                          {property.requirements.requireBackground ? 'Required' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#3D3531]">
                        Cryptographic attestation from accredited background registry.
                      </p>
                    </div>

                    {/* Employment */}
                    <div className="p-3 rounded-lg bg-[#E5E0D8] border border-[#231F20]/10 space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#231F20]">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#4A6B32]" />
                          <span>Employment Verification</span>
                        </span>
                        <span className="text-[#231F20]">
                          {property.requirements.requireEmployment ? 'Required' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#3D3531]">
                        Verifies active employment without revealing employer name or role.
                      </p>
                    </div>
                  </div>

                  {/* Verification Fee */}
                  <div className="pt-3 border-t border-[#231F20]/10 flex items-center justify-between font-mono text-xs">
                    <span className="text-[#3D3531]">Privacy Verification Fee</span>
                    <span className="font-bold text-[#231F20] text-sm">
                      ${property.requirements.verificationFee.toFixed(2)}
                    </span>
                  </div>

                  {/* Main Action Button */}
                  <motion.button
                    whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                    onClick={handleApply}
                    disabled={isApplying}
                    className="w-full py-3.5 px-4 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white font-bold text-sm text-center shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>{isApplying ? 'Initiating Application...' : 'Apply with Midnight Proof'}</span>
                  </motion.button>

                  <p className="text-[11px] text-[#908682] text-center font-mono">
                    Guaranteed privacy • Math evaluated on your device
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
