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
    <div className="min-h-screen bg-[#E5E0D8] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#231F20]/10">
          <div>
            <span className="font-mono text-xs text-[#B86A36] font-bold uppercase tracking-widest">
              Listing Portfolio
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#231F20] mt-1">
              My Rental Properties
            </h1>
            <p className="text-sm text-[#3D3531] mt-1">
              Manage your listings, adjust zero-knowledge qualification requirements, and monitor applications.
            </p>
          </div>

          <Link
            href="/landlord/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white text-xs font-mono font-bold shadow transition-all"
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
                className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] overflow-hidden shadow-card transition-all flex flex-col justify-between"
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
                      <span className="px-2.5 py-1 rounded bg-[#231F20]/90 text-[#E5E0D8] text-xs font-mono font-medium border border-white/10">
                        {property.type}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded bg-emerald-900/90 text-emerald-200 text-xs font-mono font-bold border border-emerald-500/30">
                        Published ✓
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="px-3 py-1 rounded bg-[#231F20] text-[#B86A36] font-serif font-bold text-sm">
                        ${property.price.toLocaleString()} / mo
                      </span>
                    </div>
                  </div>

                  {/* Body info */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-serif text-lg font-bold text-[#231F20]">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#3D3531]">
                      <MapPin className="w-3.5 h-3.5 text-[#B86A36]" />
                      <span>{property.address}, {property.city}</span>
                    </div>

                    {/* Stats metrics */}
                    <div className="p-3 rounded-lg bg-[#E5E0D8] border border-[#231F20]/10 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[#3D3531]">Applications:</span>{' '}
                        <strong className="text-[#231F20]">{propApps.length}</strong>
                      </div>
                      <div>
                        <span className="text-[#4A6B32]">Eligible:</span>{' '}
                        <strong className="text-[#4A6B32]">{eligibleCount}</strong>
                      </div>
                    </div>

                    {/* ZK Requirements Pill */}
                    <div className="text-[11px] font-mono text-[#908682] space-y-0.5 pt-1">
                      <div>ZK Income: ≥ ${(property.requirements.minIncome).toLocaleString()} / yr</div>
                      <div>Background: {property.requirements.requireBackground ? 'Required' : 'Optional'}</div>
                    </div>
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2 font-mono text-xs">
                  <Link
                    href={`/landlord/properties/${property.id}/requirements`}
                    className="py-2 text-center rounded bg-[#E5E0D8] text-[#231F20] hover:bg-[#231F20]/10 border border-[#231F20]/10"
                  >
                    ZK Rules
                  </Link>
                  <Link
                    href={`/landlord/properties/${property.id}`}
                    className="py-2 text-center rounded bg-[#231F20] text-white font-bold hover:bg-[#3D3531]"
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
