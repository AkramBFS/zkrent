'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { PropertyType } from '@/types';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';

export default function PropertiesPage() {
  const { properties } = useZkRent();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedBeds, setSelectedBeds] = useState<string>('all');
  const [maxRent, setMaxRent] = useState<number>(5000);
  const [filterRequireBg, setFilterRequireBg] = useState<boolean>(false);
  const [filterRequireEmp, setFilterRequireEmp] = useState<boolean>(false);
  const [maxIncomeReq, setMaxIncomeReq] = useState<number>(150000);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'newest'>('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filtered & Sorted Properties
  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => {
        // Query match
        const matchesQuery =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.zip.includes(searchQuery);

        // Type match
        const matchesType = selectedType === 'all' || p.type === selectedType;

        // Beds match
        const matchesBeds =
          selectedBeds === 'all' ||
          (selectedBeds === 'studio' && p.beds === 0) ||
          (selectedBeds === '3+' ? p.beds >= 3 : p.beds === parseInt(selectedBeds));

        // Rent max match
        const matchesRent = p.price <= maxRent;

        // ZK Requirement matches
        const matchesBg = !filterRequireBg || p.requirements.requireBackground;
        const matchesEmp = !filterRequireEmp || p.requirements.requireEmployment;
        const matchesIncome = p.requirements.minIncome <= maxIncomeReq;

        return matchesQuery && matchesType && matchesBeds && matchesRent && matchesBg && matchesEmp && matchesIncome;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0; // recommended default
      });
  }, [
    properties,
    searchQuery,
    selectedType,
    selectedBeds,
    maxRent,
    filterRequireBg,
    filterRequireEmp,
    maxIncomeReq,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedBeds('all');
    setMaxRent(5000);
    setFilterRequireBg(false);
    setFilterRequireEmp(false);
    setMaxIncomeReq(150000);
    setSortBy('recommended');
  };

  return (
    <div className="min-h-screen bg-[#EDECE4] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#14213D]/10">
          <div>
            <span className="font-mono text-xs text-[#AE8B3F] font-bold uppercase tracking-widest">
              Marketplace
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#14213D] mt-1">
              Available Rental Properties
            </h1>
            <p className="text-sm text-[#4B5A79] mt-1">
              Every listing displays verified Zero-Knowledge eligibility rules upfront before you apply.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#4B5A79]">
              Showing <strong className="text-[#14213D]">{filteredProperties.length}</strong> of{' '}
              {properties.length} properties
            </span>
          </div>
        </div>

        {/* Search & Main Filter Bar */}
        <div className="bg-[#F6F5F0] p-4 rounded-xl border border-[#14213D]/15 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-[#4B5A79] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by city, neighborhood, address, or zip (e.g. Austin, 78701)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-[#14213D]/15 text-sm text-[#14213D] placeholder-[#8794AD] focus:outline-none focus:ring-2 focus:ring-[#AE8B3F]"
              />
            </div>

            {/* Property Type Selector */}
            <div className="md:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#14213D]/15 text-sm text-[#14213D] focus:outline-none focus:ring-2 focus:ring-[#AE8B3F]"
              >
                <option value="all">All Property Types</option>
                <option value="Apartment">Apartment</option>
                <option value="Condo">Condo</option>
                <option value="House">House</option>
                <option value="Studio">Studio</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="md:col-span-3 flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-3 py-2.5 rounded-lg bg-white border border-[#14213D]/15 text-sm text-[#14213D] focus:outline-none focus:ring-2 focus:ring-[#AE8B3F]"
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Listed</option>
              </select>

              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`px-3 py-2.5 rounded-lg border text-sm font-mono flex items-center gap-1.5 transition-colors ${
                  filtersOpen
                    ? 'bg-[#14213D] text-white border-[#14213D]'
                    : 'bg-white text-[#14213D] border-[#14213D]/15 hover:bg-[#EDECE4]'
                }`}
                title="Toggle ZK Filters"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#AE8B3F]" />
                <span className="hidden sm:inline">ZK Filters</span>
              </button>
            </div>
          </div>

          {/* Expandable ZK Filters Panel */}
          {filtersOpen && (
            <div className="pt-4 border-t border-[#14213D]/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono text-[#14213D]">
              {/* Max Rent */}
              <div>
                <label className="block font-semibold mb-1">
                  Max Monthly Rent: <span className="text-[#AE8B3F] font-bold">${maxRent.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="1000"
                  max="6000"
                  step="100"
                  value={maxRent}
                  onChange={(e) => setMaxRent(parseInt(e.target.value))}
                  className="w-full accent-[#AE8B3F]"
                />
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block font-semibold mb-1">Bedrooms</label>
                <div className="flex gap-1">
                  {['all', 'studio', '1', '2', '3+'].map((bed) => (
                    <button
                      key={bed}
                      onClick={() => setSelectedBeds(bed)}
                      className={`flex-1 py-1.5 rounded text-center border uppercase transition-colors ${
                        selectedBeds === bed
                          ? 'bg-[#14213D] text-white border-[#14213D]'
                          : 'bg-white text-[#14213D] border-[#14213D]/15 hover:bg-[#EDECE4]'
                      }`}
                    >
                      {bed}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max ZK Min-Income Threshold */}
              <div>
                <label className="block font-semibold mb-1">
                  Max Income Requirement: <span className="text-[#2E7D74] font-bold">≤ ${(maxIncomeReq / 1000).toFixed(0)}k/yr</span>
                </label>
                <input
                  type="range"
                  min="40000"
                  max="150000"
                  step="5000"
                  value={maxIncomeReq}
                  onChange={(e) => setMaxIncomeReq(parseInt(e.target.value))}
                  className="w-full accent-[#2E7D74]"
                />
              </div>

              {/* Toggles & Reset */}
              <div className="flex flex-col justify-between">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterRequireBg}
                      onChange={(e) => setFilterRequireBg(e.target.checked)}
                      className="rounded text-[#2E7D74] focus:ring-[#2E7D74]"
                    />
                    <span>Requires Background ZK</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterRequireEmp}
                      onChange={(e) => setFilterRequireEmp(e.target.checked)}
                      className="rounded text-[#2E7D74] focus:ring-[#2E7D74]"
                    />
                    <span>Requires Employment ZK</span>
                  </label>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-[#AE8B3F] hover:underline text-[11px] font-mono flex items-center gap-1 mt-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset all filters</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="p-12 text-center bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 space-y-3">
            <ShieldCheck className="w-10 h-10 text-[#8794AD] mx-auto" />
            <h3 className="font-serif text-xl font-bold text-[#14213D]">No properties match your filter</h3>
            <p className="text-sm text-[#4B5A79] max-w-md mx-auto">
              Try adjusting your price range or ZK income qualification thresholds to see more listings.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded bg-[#14213D] text-white text-xs font-mono"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
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
                      ${property.price.toLocaleString()}{' '}
                      <span className="text-xs font-sans text-white/80 font-normal">/month</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
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
                        <Bed className="w-3.5 h-3.5" /> {property.beds === 0 ? 'Studio' : `${property.beds} Bed`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5" /> {property.baths} Bath
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5" /> {property.sqft} sqft
                      </span>
                    </div>
                  </div>

                  {/* ZK Requirements Visible Before Applying */}
                  <div className="p-3.5 rounded-lg bg-[#EDECE4] border border-[#14213D]/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#14213D]">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#2E7D74]" />
                        <span>ZK Qualification Rules:</span>
                      </span>
                      <span className="text-[#AE8B3F]">${property.requirements.verificationFee.toFixed(2)} Fee</span>
                    </div>

                    <div className="space-y-1 text-xs font-mono text-[#14213D]">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D74]" />
                        <span>ZK Income: ≥ ${(property.requirements.minIncome).toLocaleString()} / yr</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D74]" />
                        <span>Background Check: {property.requirements.requireBackground ? 'Required' : 'Optional'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D74]" />
                        <span>Employment Verification: {property.requirements.requireEmployment ? 'Required' : 'Optional'}</span>
                      </div>
                    </div>
                  </div>

                  {/* View Property CTA */}
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
        )}
      </div>
    </div>
  );
}
