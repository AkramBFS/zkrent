'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { ApplicantIdTag, StampedSeal } from '@/components/ZkBadges';
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

  const property = getProperty(propertyId);

  if (!property) {
    return (
      <div className="min-h-screen bg-[#EDECE4] py-16 px-4 flex items-center justify-center">
        <div className="bg-[#F6F5F0] p-8 rounded-xl border border-[#14213D]/15 max-w-md text-center space-y-4">
          <Building2 className="w-12 h-12 text-[#8794AD] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#14213D]">Property Not Found</h2>
          <Link
            href="/landlord/properties"
            className="inline-block px-5 py-2.5 rounded-md bg-[#14213D] text-white text-sm font-medium"
          >
            Back to Properties
          </Link>
        </div>
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
    <div className="min-h-screen bg-[#EDECE4] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/landlord/properties"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#4B5A79] hover:text-[#14213D]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all properties</span>
          </Link>

          <Link
            href={`/properties/${property.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#AE8B3F] hover:underline"
          >
            <span>View Public Listing</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Property Header Card */}
        <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#14213D]/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                  Published ✓
                </span>
                <span className="text-xs font-mono text-[#8794AD]">
                  Listed on {new Date(property.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14213D]">
                {property.title}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-[#4B5A79] mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#AE8B3F]" />
                <span>{property.address}, {property.city}, {property.state} {property.zip}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/landlord/properties/${property.id}/edit`}
                className="px-4 py-2 rounded-md bg-[#EDECE4] hover:bg-[#14213D]/10 text-[#14213D] text-xs font-mono font-bold border border-[#14213D]/15 flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Property</span>
              </Link>

              <Link
                href={`/landlord/properties/${property.id}/requirements`}
                className="px-4 py-2 rounded-md bg-[#AE8B3F] hover:bg-[#977732] text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Edit ZK Requirements</span>
              </Link>
            </div>
          </div>

          {/* Application Funnel Tiles */}
          <div>
            <h3 className="font-mono text-xs font-bold text-[#14213D] uppercase tracking-wider mb-3">
              Application Funnel
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
              <div className="p-4 rounded-lg bg-white border border-[#14213D]/10">
                <div className="text-xs text-[#4B5A79]">Total Applications</div>
                <div className="font-serif text-2xl font-bold text-[#14213D] mt-1">
                  {propApps.length}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-[#14213D]/10">
                <div className="text-xs text-[#2E7D74]">Eligible (ZK Proved)</div>
                <div className="font-serif text-2xl font-bold text-[#2E7D74] mt-1">
                  {eligibleCount}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-[#14213D]/10">
                <div className="text-xs text-[#AE8B3F]">Pending Verification</div>
                <div className="font-serif text-2xl font-bold text-[#AE8B3F] mt-1">
                  {pendingCount}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-[#14213D]/10">
                <div className="text-xs text-[#B4483A]">Ineligible</div>
                <div className="font-serif text-2xl font-bold text-[#B4483A] mt-1">
                  {rejectedCount}
                </div>
              </div>
            </div>
          </div>

          {/* Current ZK Qualification Requirements Recap */}
          <div className="p-5 rounded-xl bg-[#14213D] text-white space-y-3 font-mono text-xs border border-[#4FB3A5]/30">
            <div className="flex items-center justify-between">
              <span className="text-[#4FB3A5] font-bold uppercase tracking-wider">
                Current Midnight ZK Qualification Rules
              </span>
              <Link
                href={`/landlord/properties/${property.id}/requirements`}
                className="text-xs text-[#AE8B3F] hover:underline"
              >
                Modify Rules →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-2.5 rounded bg-[#17181A] border border-white/10">
                <div className="text-[#8794AD]">Min Income Threshold:</div>
                <div className="font-bold text-white mt-0.5">
                  ≥ ${property.requirements.minIncome.toLocaleString()} / yr
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#17181A] border border-white/10">
                <div className="text-[#8794AD]">Background Check:</div>
                <div className="font-bold text-white mt-0.5">
                  {property.requirements.requireBackground ? 'Mandatory' : 'Optional'}
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#17181A] border border-white/10">
                <div className="text-[#8794AD]">Employment Verification:</div>
                <div className="font-bold text-white mt-0.5">
                  {property.requirements.requireEmployment ? 'Mandatory' : 'Optional'}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Applicants for this property */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#14213D]">
              Applicants for this Property
            </h3>

            {propApps.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg border border-[#14213D]/10 text-xs font-mono text-[#8794AD]">
                No applicants have submitted proofs for this property yet.
              </div>
            ) : (
              <div className="space-y-2">
                {propApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-lg bg-white border border-[#14213D]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <ApplicantIdTag id={app.applicantDisplayId} size="sm" />
                      <div className="text-xs font-mono">
                        <span className="text-[#8794AD]">Applied: </span>
                        <span className="text-[#14213D]">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {app.status === 'verified_eligible' || app.status === 'lease_offered' ? (
                        <span className="text-xs font-mono font-bold text-[#2E7D74]">
                          ✓ Verified Eligible
                        </span>
                      ) : app.status === 'verified_ineligible' ? (
                        <span className="text-xs font-mono font-bold text-[#B4483A]">
                          ✕ Ineligible
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-[#AE8B3F]">
                          Pending Proof
                        </span>
                      )}

                      <Link
                        href={`/landlord/applications/${app.id}`}
                        className="px-3 py-1.5 rounded bg-[#14213D] text-white text-xs font-mono hover:bg-[#1E2F54]"
                      >
                        Review Applicant →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
