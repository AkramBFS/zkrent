'use client';

import React from 'react';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import {
  Building2,
  PlusCircle,
  Users,
  CheckCircle2,
  SlidersHorizontal,
  MapPin,
  Bed,
  Bath,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function LandlordPropertiesPage() {
  const { properties, applications } = useZkRent();

  return (
    <div className="min-h-screen bg-[#EDECE4] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#14213D]/10">
          <div>
            <span className="font-mono text-xs text-[#AE8B3F] font-bold uppercase tracking-widest">
              Listing Portfolio
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#14213D] mt-1">
              My Rental Properties
            </h1>
            <p className="text-sm text-[#4B5A79] mt-1">
              Manage your listings, adjust zero-knowledge qualification requirements, and monitor applications.
            </p>
          </div>

          <Link
            href="/landlord/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#AE8B3F] hover:bg-[#977732] text-white text-xs font-mono font-bold shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Free Listing</span>
          </Link>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const propApps = applications.filter((a) => a.propertyId === property.id);
            const eligibleCount = propApps.filter(
              (a) => a.status === 'verified_eligible' || a.status === 'lease_offered'
            ).length;

            return (
              <div
                key={property.id}
                className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-48 w-full bg-zinc-800 overflow-hidden">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded bg-[#14213D]/90 text-[#EDECE4] text-xs font-mono font-medium border border-white/10">
                        {property.type}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded bg-emerald-900/90 text-emerald-200 text-xs font-mono font-bold border border-emerald-500/30">
                        Published ✓
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="px-3 py-1 rounded bg-[#14213D] text-[#AE8B3F] font-serif font-bold text-sm">
                        ${property.price.toLocaleString()} / mo
                      </span>
                    </div>
                  </div>

                  {/* Body info */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-serif text-lg font-bold text-[#14213D]">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#4B5A79]">
                      <MapPin className="w-3.5 h-3.5 text-[#AE8B3F]" />
                      <span>{property.address}, {property.city}</span>
                    </div>

                    {/* Stats metrics */}
                    <div className="p-3 rounded-lg bg-[#EDECE4] border border-[#14213D]/10 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[#4B5A79]">Applications:</span>{' '}
                        <strong className="text-[#14213D]">{propApps.length}</strong>
                      </div>
                      <div>
                        <span className="text-[#2E7D74]">Eligible:</span>{' '}
                        <strong className="text-[#2E7D74]">{eligibleCount}</strong>
                      </div>
                    </div>

                    {/* ZK Requirements Pill */}
                    <div className="text-[11px] font-mono text-[#8794AD] space-y-0.5 pt-1">
                      <div>ZK Income: ≥ ${(property.requirements.minIncome).toLocaleString()} / yr</div>
                      <div>Background: {property.requirements.requireBackground ? 'Required' : 'Optional'}</div>
                    </div>
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2 font-mono text-xs">
                  <Link
                    href={`/landlord/properties/${property.id}/requirements`}
                    className="py-2 text-center rounded bg-[#EDECE4] text-[#14213D] hover:bg-[#14213D]/10 border border-[#14213D]/10"
                  >
                    ZK Rules
                  </Link>
                  <Link
                    href={`/landlord/properties/${property.id}`}
                    className="py-2 text-center rounded bg-[#14213D] text-white font-bold hover:bg-[#1E2F54]"
                  >
                    Manage →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
