'use client';

import React from 'react';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { motion, useReducedMotion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard } from '@/components/motion/motion';
import {
  Building2,
  PlusCircle,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  Edit,
  ExternalLink,
  Users,
  Sparkles,
} from 'lucide-react';

export default function LandlordPropertiesListPage() {
  const { properties, applications } = useZkRent();
  const prefersReduced = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <FadeIn className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#231F20]/10">
          <div>
            <span className="font-mono text-xs text-[#B86A36] font-bold uppercase tracking-widest">
              Portfolio Management
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#231F20] mt-1">
              My Rental Properties
            </h1>
            <p className="text-sm text-[#3D3531] mt-1">
              Manage your listings, adjust Zero-Knowledge income/background thresholds, and review candidate funnels.
            </p>
          </div>

          <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
            <Link
              href="/landlord/properties/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white text-xs font-mono font-bold shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Listing (Free)</span>
            </Link>
          </motion.div>
        </FadeIn>

        {/* Properties Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((p) => {
            const propertyApps = applications.filter((a) => a.propertyId === p.id);
            const verifiedCount = propertyApps.filter(
              (a) => a.status === 'verified_eligible' || a.status === 'lease_offered'
            ).length;

            return (
              <StaggerItem key={p.id}>
                <MotionCard className="bg-[#FAFAFA] rounded-xl overflow-hidden border border-[#E5E0D8] shadow-card transition-all flex flex-col justify-between group h-full">
                  <div>
                    {/* Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-zinc-800">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded bg-[#231F20]/90 text-[#E5E0D8] text-xs font-mono font-medium backdrop-blur-sm border border-white/10">
                          {p.type}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="px-3 py-1 rounded bg-[#231F20] text-[#B86A36] font-serif font-bold text-sm shadow">
                          ${p.price.toLocaleString()}{' '}
                          <span className="text-xs font-sans text-white/80 font-normal">/mo</span>
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-[#231F20] group-hover:text-[#B86A36] transition-colors">
                          {p.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-[#3D3531] mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#B86A36]" />
                          <span>{p.address}, {p.city}</span>
                        </div>
                      </div>

                      {/* ZK Criteria summary */}
                      <div className="p-3 rounded-lg bg-[#E5E0D8] border border-[#231F20]/10 font-mono text-xs space-y-1">
                        <div className="flex justify-between text-[#231F20] font-semibold">
                          <span>ZK Min Income:</span>
                          <span className="text-[#4A6B32]">${p.requirements.minIncome.toLocaleString()}/yr</span>
                        </div>
                        <div className="flex justify-between text-[#3D3531]">
                          <span>Background Check:</span>
                          <span>{p.requirements.requireBackground ? 'Required' : 'Optional'}</span>
                        </div>
                      </div>

                      {/* Applicant metrics */}
                      <div className="grid grid-cols-2 gap-2 font-mono text-xs text-center">
                        <div className="p-2 rounded bg-white border border-[#231F20]/10">
                          <div className="text-[10px] text-[#908682]">Applications</div>
                          <div className="font-bold text-base text-[#231F20]">{propertyApps.length}</div>
                        </div>
                        <div className="p-2 rounded bg-white border border-[#231F20]/10">
                          <div className="text-[10px] text-[#4A6B32]">Verified Eligible</div>
                          <div className="font-bold text-base text-[#4A6B32]">{verifiedCount}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                    <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                      <Link
                        href={`/landlord/properties/${p.id}`}
                        className="w-full py-2 rounded bg-[#231F20] hover:bg-[#3D3531] text-white text-xs font-mono text-center block transition-colors"
                      >
                        Manage Listing
                      </Link>
                    </motion.div>

                    <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                      <Link
                        href={`/landlord/properties/${p.id}/requirements`}
                        className="w-full py-2 rounded bg-white border border-[#231F20]/20 hover:bg-[#E5E0D8] text-[#231F20] text-xs font-mono text-center block transition-colors"
                      >
                        Edit ZK Rules
                      </Link>
                    </motion.div>
                  </div>
                </MotionCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </div>
  );
}
