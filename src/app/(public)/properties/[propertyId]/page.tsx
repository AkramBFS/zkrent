'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { StampedSeal, ZkVerifiedBadge } from '@/components/ZkBadges';
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

  const property = getProperty(propertyId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isApplying, setIsApplying] = useState(false);

  if (!property) {
    return (
      <div className="min-h-screen bg-[#EDECE4] py-16 px-4 flex items-center justify-center">
        <div className="bg-[#F6F5F0] p-8 rounded-xl border border-[#14213D]/15 max-w-md text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-[#8794AD] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#14213D]">Property Not Found</h2>
          <p className="text-sm text-[#4B5A79]">The listing you requested could not be found or has been unlisted.</p>
          <Link
            href="/properties"
            className="inline-block px-5 py-2.5 rounded-md bg-[#14213D] text-white text-sm font-medium"
          >
            Return to Properties
          </Link>
        </div>
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
    <div className="min-h-screen bg-[#EDECE4] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link & Title Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 text-sm font-mono text-[#4B5A79] hover:text-[#14213D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all properties</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded bg-[#14213D] text-[#4FB3A5] border border-[#4FB3A5]/30">
              Midnight ZK Circuit Ready
            </span>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="space-y-3">
          <div className="relative h-[380px] sm:h-[480px] w-full rounded-xl overflow-hidden bg-zinc-900 shadow-md">
            <img
              src={property.images[activeImageIndex] || property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded bg-[#14213D]/90 text-[#EDECE4] text-xs font-mono font-medium backdrop-blur-sm border border-white/10">
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
                  className={`relative h-20 w-32 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-[#AE8B3F] scale-[1.02] shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2-Column Layout: Left Details / Right Sticky Requirements Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Details (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header info */}
            <div className="bg-[#F6F5F0] p-6 rounded-xl border border-[#14213D]/15 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono text-[#AE8B3F] font-bold uppercase tracking-widest">
                    Managed by {property.landlordName}
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14213D] mt-1">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-1.5 text-sm text-[#4B5A79] mt-1">
                    <MapPin className="w-4 h-4 text-[#AE8B3F]" />
                    <span>
                      {property.address}, {property.city}, {property.state} {property.zip}
                    </span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="font-serif text-3xl font-bold text-[#14213D]">
                    ${property.price.toLocaleString()}
                  </div>
                  <span className="text-xs font-mono text-[#4B5A79]">per month</span>
                </div>
              </div>

              {/* Specs row */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#14213D]/10 font-mono text-sm">
                <div className="flex items-center gap-2 text-[#14213D]">
                  <Bed className="w-4 h-4 text-[#AE8B3F]" />
                  <span>{property.beds === 0 ? 'Studio' : `${property.beds} Bedrooms`}</span>
                </div>
                <div className="flex items-center gap-2 text-[#14213D]">
                  <Bath className="w-4 h-4 text-[#AE8B3F]" />
                  <span>{property.baths} Bathrooms</span>
                </div>
                <div className="flex items-center gap-2 text-[#14213D]">
                  <Maximize2 className="w-4 h-4 text-[#AE8B3F]" />
                  <span>{property.sqft} sq ft</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#F6F5F0] p-6 rounded-xl border border-[#14213D]/15 space-y-3">
              <h2 className="font-serif text-xl font-bold text-[#14213D]">About This Residence</h2>
              <p className="text-sm text-[#4B5A79] leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-[#F6F5F0] p-6 rounded-xl border border-[#14213D]/15 space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#14213D]">Building & Unit Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-sm text-[#14213D] font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D74]" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Explanation Banner */}
            <div className="bg-[#14213D] text-[#EDECE4] p-6 rounded-xl border border-[#4FB3A5]/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#17181A] border border-[#4FB3A5]/40 flex items-center justify-center text-[#4FB3A5]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    Private Zero-Knowledge Application
                  </h3>
                  <p className="text-xs font-mono text-[#4FB3A5]">
                    No Raw Documents • No Document Uploads • Anonymized Tenant Identity
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#8794AD] leading-relaxed">
                When you apply for this property, your financial documents stay in your local browser sandbox.
                The Midnight Network Halo2 zero-knowledge prover checks if your income meets the required{' '}
                <strong className="text-white">${property.requirements.minIncome.toLocaleString()} / year</strong>{' '}
                threshold without disclosing your exact earnings.
              </p>
            </div>
          </div>

          {/* Right Sticky Sidebar: Explicit ZK Requirements (4 cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-5">
            <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/20 shadow-lg overflow-hidden">
              {/* Sidebar Header */}
              <div className="p-6 bg-[#14213D] text-white space-y-1">
                <div className="text-xs font-mono text-[#AE8B3F] font-bold uppercase tracking-wider">
                  Qualification Standard
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="font-serif text-3xl font-bold">
                    ${property.price.toLocaleString()}
                  </div>
                  <span className="text-xs font-mono text-[#8794AD]">/ month</span>
                </div>
              </div>

              {/* Requirements Checklist */}
              <div className="p-6 space-y-5">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#14213D] mb-1">
                    Eligibility Requirements
                  </h4>
                  <p className="text-xs text-[#4B5A79]">
                    These are the exact criteria evaluated in zero-knowledge:
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {/* Income */}
                  <div className="p-3 rounded-lg bg-[#EDECE4] border border-[#14213D]/10 space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#14213D]">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D74]" />
                        <span>Minimum Annual Income</span>
                      </span>
                      <span className="text-[#2E7D74]">
                        ${property.requirements.minIncome.toLocaleString()} / yr
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4B5A79]">
                      Proves you earn at least ${(property.requirements.minIncome).toLocaleString()} without revealing actual salary.
                    </p>
                  </div>

                  {/* Background */}
                  <div className="p-3 rounded-lg bg-[#EDECE4] border border-[#14213D]/10 space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#14213D]">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D74]" />
                        <span>Background Check</span>
                      </span>
                      <span className="text-[#14213D]">
                        {property.requirements.requireBackground ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4B5A79]">
                      Cryptographic attestation from accredited background registry.
                    </p>
                  </div>

                  {/* Employment */}
                  <div className="p-3 rounded-lg bg-[#EDECE4] border border-[#14213D]/10 space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#14213D]">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D74]" />
                        <span>Employment Verification</span>
                      </span>
                      <span className="text-[#14213D]">
                        {property.requirements.requireEmployment ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4B5A79]">
                      Verifies active employment without revealing employer name or role.
                    </p>
                  </div>
                </div>

                {/* Verification Fee */}
                <div className="pt-3 border-t border-[#14213D]/10 flex items-center justify-between font-mono text-xs">
                  <span className="text-[#4B5A79]">Privacy Verification Fee</span>
                  <span className="font-bold text-[#14213D] text-sm">
                    ${property.requirements.verificationFee.toFixed(2)}
                  </span>
                </div>

                {/* Main Action Button */}
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="w-full py-3.5 px-4 rounded-md bg-[#AE8B3F] hover:bg-[#977732] text-white font-bold text-sm text-center shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>{isApplying ? 'Initiating Application...' : 'Apply with Midnight Proof'}</span>
                </button>

                <p className="text-[11px] text-[#8794AD] text-center font-mono">
                  Guaranteed privacy • Math evaluated on your device
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
