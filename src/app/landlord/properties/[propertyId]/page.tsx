'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { ApplicantIdTag, StampedSeal } from '@/components/ZkBadges';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  MotionCard,
  AnimatedNumber,
  LUXURY_EASE,
} from '@/components/motion/motion';
import {
  Building2,
  Edit,
  SlidersHorizontal,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  MapPin,
  ExternalLink,
  ShieldCheck,
  EyeOff,
} from 'lucide-react';

export default function LandlordPropertyManagementPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;
  const { getProperty, applications } = useZkRent();
  const prefersReduced = useReducedMotion();

  const property = getProperty(propertyId);

  if (!property) {
    return (
      <div className="min-h-screen bg-[#E5E0D8] py-16 px-4 flex items-center justify-center">
        <FadeIn className="bg-[#FAFAFA] p-8 rounded-xl border border-[#E5E0D8] max-w-md text-center space-y-4">
          <Building2 className="w-12 h-12 text-[#908682] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#231F20]">Property Not Found</h2>
          <Link
            href="/landlord/properties"
            className="inline-block px-5 py-2.5 rounded-md bg-[#231F20] text-white text-sm font-medium"
          >
            Back to Properties
          </Link>
        </FadeIn>
      </div>
    );
  }

  const propApps = applications.filter((a) => a.propertyId === property.id);
  const eligibleCount = propApps.filter(
    (a) => a.status === 'verified_eligible' || a.status === 'lease_offered'
  ).length;
  const pendingCount = propApps.filter(
    (a) => a.status === 'pending_verification' || a.status === 'pending_payment'
  ).length;
  const rejectedCount = propApps.filter((a) => a.status === 'verified_ineligible').length;

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-8 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back Link */}
        <FadeIn className="flex items-center justify-between">
          <Link
            href="/landlord/properties"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3D3531] hover:text-[#231F20] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to all properties</span>
          </Link>

          <Link
            href={`/properties/${property.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#B86A36] hover:underline"
          >
            <span>View Public Listing</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </FadeIn>

        {/* Property Header Card */}
        <FadeIn delay={0.08}>
          <MotionCard className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#231F20]/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                    Published ✓
                  </span>
                  <span className="text-xs font-mono text-[#908682]">
                    Listed on {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#231F20]">
                  {property.title}
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-[#3D3531] mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#B86A36]" />
                  <span>{property.address}, {property.city}, {property.state} {property.zip}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                  <Link
                    href={`/landlord/properties/${property.id}/edit`}
                    className="px-4 py-2 rounded-md bg-[#E5E0D8] hover:bg-[#231F20]/10 text-[#231F20] text-xs font-mono font-bold border border-[#E5E0D8] flex items-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Property</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                  <Link
                    href={`/landlord/properties/${property.id}/requirements`}
                    className="px-4 py-2 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Edit ZK Requirements</span>
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Application Funnel Tiles with Animated Numbers */}
            <div>
              <h3 className="font-mono text-xs font-bold text-[#231F20] uppercase tracking-wider mb-3">
                Application Funnel
              </h3>
              <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                <StaggerItem>
                  <div className="p-4 rounded-lg bg-white border border-[#231F20]/10">
                    <div className="text-xs text-[#3D3531]">Total Applications</div>
                    <div className="font-serif text-2xl font-bold text-[#231F20] mt-1">
                      <AnimatedNumber value={propApps.length} />
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="p-4 rounded-lg bg-white border border-[#231F20]/10">
                    <div className="text-xs text-[#4A6B32]">Eligible (ZK Proved)</div>
                    <div className="font-serif text-2xl font-bold text-[#4A6B32] mt-1">
                      <AnimatedNumber value={eligibleCount} />
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="p-4 rounded-lg bg-white border border-[#231F20]/10">
                    <div className="text-xs text-[#B86A36]">Pending Verification</div>
                    <div className="font-serif text-2xl font-bold text-[#B86A36] mt-1">
                      <AnimatedNumber value={pendingCount} />
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="p-4 rounded-lg bg-white border border-[#231F20]/10">
                    <div className="text-xs text-[#E85D31]">Ineligible</div>
                    <div className="font-serif text-2xl font-bold text-[#E85D31] mt-1">
                      <AnimatedNumber value={rejectedCount} />
                    </div>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>

            {/* Current ZK Qualification Requirements Recap */}
            <div className="p-5 rounded-xl bg-[#231F20] text-white space-y-3 font-mono text-xs border border-[#00A8E8]/30">
              <div className="flex items-center justify-between">
                <span className="text-[#00A8E8] font-bold uppercase tracking-wider">
                  Current Midnight ZK Qualification Rules
                </span>
                <Link
                  href={`/landlord/properties/${property.id}/requirements`}
                  className="text-xs text-[#B86A36] hover:underline"
                >
                  Modify Rules →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-2.5 rounded bg-[#231F20] border border-white/10">
                  <div className="text-[#908682]">Min Income Threshold:</div>
                  <div className="font-bold text-white mt-0.5">
                    ≥ ${property.requirements.minIncome.toLocaleString()} / yr
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#231F20] border border-white/10">
                  <div className="text-[#908682]">Background Check:</div>
                  <div className="font-bold text-white mt-0.5">
                    {property.requirements.requireBackground ? 'Mandatory' : 'Optional'}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#231F20] border border-white/10">
                  <div className="text-[#908682]">Employment Verification:</div>
                  <div className="font-bold text-white mt-0.5">
                    {property.requirements.requireEmployment ? 'Mandatory' : 'Optional'}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Applicants for this property */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#231F20]">
                Applicants for this Property
              </h3>

              {propApps.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-lg border border-[#231F20]/10 text-xs font-mono text-[#908682]">
                  No applicants have submitted proofs for this property yet.
                </div>
              ) : (
                <StaggerContainer className="space-y-2">
                  {propApps.map((app) => (
                    <StaggerItem key={app.id}>
                      <div className="p-4 rounded-lg bg-white border border-[#231F20]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <ApplicantIdTag id={app.applicantDisplayId} size="sm" />
                          <div className="text-xs font-mono">
                            <span className="text-[#908682]">Applied: </span>
                            <span className="text-[#231F20]">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {app.status === 'verified_eligible' || app.status === 'lease_offered' ? (
                            <span className="text-xs font-mono font-bold text-[#4A6B32]">
                              ✓ Verified Eligible
                            </span>
                          ) : app.status === 'verified_ineligible' ? (
                            <span className="text-xs font-mono font-bold text-[#E85D31]">
                              ✕ Ineligible
                            </span>
                          ) : (
                            <span className="text-xs font-mono font-bold text-[#B86A36]">
                              Pending Proof
                            </span>
                          )}

                          <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                            <Link
                              href={`/landlord/applications/${app.id}`}
                              className="px-3 py-1.5 rounded bg-[#231F20] text-white text-xs font-mono hover:bg-[#3D3531] transition-colors inline-block"
                            >
                              Review Applicant →
                            </Link>
                          </motion.div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          </MotionCard>
        </FadeIn>
      </div>
    </div>
  );
}
