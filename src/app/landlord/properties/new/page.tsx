'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { PropertyType } from '@/types';
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Lock,
} from 'lucide-react';

const SAMPLE_IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
];

export default function CreatePropertyPage() {
  const router = useRouter();
  const { addProperty } = useZkRent();

  // Wizard Step: 1 = Basic Info, 2 = Photos & Amenities, 3 = ZK Requirements, 4 = Review
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form States
  const [title, setTitle] = useState('The Domain Skyloft #2204');
  const [description, setDescription] = useState(
    'Modern executive flat featuring 10ft ceilings, wide-plank oak flooring, quartz countertops, stainless steel gas appliances, and private terrace overlooking north Austin.'
  );
  const [address, setAddress] = useState('3121 Palm Way, Unit 2204');
  const [city, setCity] = useState('Austin');
  const [state, setState] = useState('TX');
  const [zip, setZip] = useState('78758');
  const [propertyType, setPropertyType] = useState<PropertyType>('Apartment');
  const [price, setPrice] = useState<number>(2650);
  const [beds, setBeds] = useState<number>(2);
  const [baths, setBaths] = useState<number>(2);
  const [sqft, setSqft] = useState<number>(1180);

  // Photos & Amenities
  const [selectedImage, setSelectedImage] = useState(SAMPLE_IMAGE_PRESETS[0]);
  const [amenities, setAmenities] = useState<string[]>([
    'Rooftop Pool & Cabana',
    'Midnight ZK Fast-Track Verification',
    'Reserved Garage Parking',
    '24-Hour Fitness Club',
    'Smart Keyless Entry',
  ]);
  const [newAmenity, setNewAmenity] = useState('');

  // ZK Requirements
  const [minIncome, setMinIncome] = useState<number>(79500); // ~3x rent
  const [requireBackground, setRequireBackground] = useState<boolean>(true);
  const [requireEmployment, setRequireEmployment] = useState<boolean>(true);
  const [verificationFee, setVerificationFee] = useState<number>(5.0);

  const [isPublishing, setIsPublishing] = useState(false);

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (idx: number) => {
    setAmenities(amenities.filter((_, i) => i !== idx));
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const newProp = await addProperty({
        title,
        description,
        address,
        city,
        state,
        zip,
        type: propertyType,
        price,
        beds,
        baths,
        sqft,
        images: [selectedImage],
        amenities,
        status: 'active',
        requirements: {
          minIncome,
          requireBackground,
          requireEmployment,
          verificationFee,
        },
      });

      router.push(`/landlord/properties/${newProp.id}`);
    } catch (err) {
      console.error('Failed to create property:', err);
      setIsPublishing(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#EDECE4] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/landlord/properties"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#4B5A79] hover:text-[#14213D]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & return to listings</span>
          </Link>

          <span className="px-3 py-1 rounded bg-[#AE8B3F]/20 text-[#7E642A] text-xs font-mono font-bold border border-[#AE8B3F]/30">
            Free Landlord Listing
          </span>
        </div>

        {/* Wizard Stepper Bar */}
        <div className="bg-[#F6F5F0] p-4 rounded-xl border border-[#14213D]/15 shadow-sm">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            {[
              { num: 1, label: '1. Basic Info' },
              { num: 2, label: '2. Photos & Amenities' },
              { num: 3, label: '3. ZK Requirements' },
              { num: 4, label: '4. Review & Publish' },
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => setStep(s.num as any)}
                className={`py-2 px-1 rounded-lg border transition-all ${
                  step === s.num
                    ? 'bg-[#14213D] text-white border-[#14213D] font-bold shadow'
                    : step > s.num
                    ? 'bg-[#EDECE4] text-[#14213D] border-[#14213D]/20'
                    : 'bg-white/50 text-[#8794AD] border-transparent'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: BASIC INFO */}
        {/* ------------------------------------------------------------- */}
        {step === 1 && (
          <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#14213D]">
                Step 1: Property Specifications
              </h2>
              <p className="text-xs text-[#4B5A79] mt-0.5">
                Enter address, monthly rent, and core layout specifications.
              </p>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[#4B5A79] mb-1 font-semibold">Property Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#4B5A79] mb-1 font-semibold">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[#4B5A79] mb-1 font-semibold">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#4B5A79] mb-1 font-semibold">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#4B5A79] mb-1 font-semibold">Zip</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[#4B5A79] mb-1 font-semibold">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Condo">Condo</option>
                    <option value="House">House</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#4B5A79] mb-1 font-semibold">Monthly Rent ($)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => {
                      const newPrice = parseInt(e.target.value) || 0;
                      setPrice(newPrice);
                      setMinIncome(newPrice * 30); // auto compute ~2.5x - 3x annual income suggestion
                    }}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[#4B5A79] mb-1 font-semibold">Bedrooms</label>
                  <input
                    type="number"
                    value={beds}
                    onChange={(e) => setBeds(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                  />
                </div>

                <div>
                  <label className="block text-[#4B5A79] mb-1 font-semibold">Bathrooms</label>
                  <input
                    type="number"
                    step="0.5"
                    value={baths}
                    onChange={(e) => setBaths(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4B5A79] mb-1 font-semibold">Square Footage</label>
                <input
                  type="number"
                  value={sqft}
                  onChange={(e) => setSqft(parseInt(e.target.value) || 0)}
                  className="w-full max-w-xs p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                />
              </div>

              <div>
                <label className="block text-[#4B5A79] mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D] text-xs"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-md bg-[#14213D] text-white font-mono text-xs font-bold hover:bg-[#1E2F54] transition-colors flex items-center gap-2"
              >
                <span>Continue to Photos & Amenities</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: PHOTOS & AMENITIES */}
        {/* ------------------------------------------------------------- */}
        {step === 2 && (
          <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#14213D]">
                Step 2: Photos & Amenities
              </h2>
              <p className="text-xs text-[#4B5A79] mt-0.5">
                Select high-resolution imagery and list unit features.
              </p>
            </div>

            {/* Photo preset picker */}
            <div className="space-y-3 font-mono text-xs">
              <label className="block font-semibold text-[#14213D]">Select Cover Photograph Preset</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {SAMPLE_IMAGE_PRESETS.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? 'border-[#AE8B3F] scale-105 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities list & add */}
            <div className="space-y-3 font-mono text-xs">
              <label className="block font-semibold text-[#14213D]">Property Amenities</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. EV Charging Station, Wine Fridge"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                  className="flex-1 p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="px-4 py-2 rounded-lg bg-[#AE8B3F] text-white font-bold"
                >
                  + Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D74]" />
                    <span>{amenity}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(idx)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-md bg-[#EDECE4] text-[#14213D] font-mono text-xs hover:bg-[#14213D]/10"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-md bg-[#14213D] text-white font-mono text-xs font-bold hover:bg-[#1E2F54] transition-colors flex items-center gap-2"
              >
                <span>Continue to ZK Requirements</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: ZK ELIGIBILITY REQUIREMENTS */}
        {/* ------------------------------------------------------------- */}
        {step === 3 && (
          <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#14213D] text-[#4FB3A5] text-xs font-mono mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Midnight Circuit Qualification Parameters</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#14213D]">
                Step 3: Define Zero-Knowledge Requirements
              </h2>
              <p className="text-xs text-[#4B5A79] mt-0.5">
                These rules will be encoded into the Midnight verification contract. Applicants must
                cryptographically prove compliance without exposing raw data.
              </p>
            </div>

            <div className="space-y-5 font-mono text-xs">
              {/* Income threshold */}
              <div className="p-4 rounded-xl bg-white border border-[#14213D]/15 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#14213D] text-sm">
                    Minimum Annual Income Requirement ($)
                  </label>
                  <span className="text-[#2E7D74] font-bold text-base">
                    ${minIncome.toLocaleString()} / year
                  </span>
                </div>
                <input
                  type="range"
                  min="30000"
                  max="200000"
                  step="2500"
                  value={minIncome}
                  onChange={(e) => setMinIncome(parseInt(e.target.value))}
                  className="w-full accent-[#2E7D74]"
                />
                <p className="text-[11px] text-[#4B5A79]">
                  Tenants will prove <code className="text-[#14213D]">Income ≥ ${minIncome.toLocaleString()}</code> without disclosing actual salary.
                </p>
              </div>

              {/* Background Requirement */}
              <div className="p-4 rounded-xl bg-white border border-[#14213D]/15 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#14213D] text-sm">
                    Require Criminal & Eviction Background Check
                  </div>
                  <p className="text-[11px] text-[#4B5A79]">
                    Demands certified clear background registry attestation in proof witness.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={requireBackground}
                  onChange={(e) => setRequireBackground(e.target.checked)}
                  className="w-5 h-5 rounded text-[#2E7D74] focus:ring-[#2E7D74]"
                />
              </div>

              {/* Employment Requirement */}
              <div className="p-4 rounded-xl bg-white border border-[#14213D]/15 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#14213D] text-sm">
                    Require Verified Employment Attestation
                  </div>
                  <p className="text-[11px] text-[#4B5A79]">
                    Demands active corporate payroll registry attestation in proof witness.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={requireEmployment}
                  onChange={(e) => setRequireEmployment(e.target.checked)}
                  className="w-5 h-5 rounded text-[#2E7D74] focus:ring-[#2E7D74]"
                />
              </div>

              {/* Verification Fee */}
              <div className="p-4 rounded-xl bg-[#EDECE4] border border-[#14213D]/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#14213D]">
                    Tenant Privacy Verification Fee ($)
                  </div>
                  <p className="text-[11px] text-[#4B5A79]">
                    Standard $5.00 covers Midnight Network gas and circuit execution.
                  </p>
                </div>
                <span className="font-bold text-[#14213D] text-base">${verificationFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-md bg-[#EDECE4] text-[#14213D] font-mono text-xs hover:bg-[#14213D]/10"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-md bg-[#14213D] text-white font-mono text-xs font-bold hover:bg-[#1E2F54] transition-colors flex items-center gap-2"
              >
                <span>Review & Finalize Listing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 4: REVIEW & PUBLISH */}
        {/* ------------------------------------------------------------- */}
        {step === 4 && (
          <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <span className="px-3 py-1 rounded bg-[#AE8B3F]/20 text-[#7E642A] text-xs font-mono font-bold border border-[#AE8B3F]/30 inline-block mb-2">
                100% Free Landlord Listing
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#14213D]">
                Step 4: Review & Publish Listing
              </h2>
              <p className="text-xs text-[#4B5A79] mt-0.5">
                Confirm your listing details before publishing live to the ZkRent marketplace.
              </p>
            </div>

            {/* Summary Card */}
            <div className="p-5 rounded-xl bg-[#14213D] text-white space-y-4 font-mono text-xs">
              <div className="flex justify-between items-start pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#4FB3A5]">{title}</h3>
                  <p className="text-[#8794AD]">{address}, {city}, {state} {zip}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-serif font-bold text-[#AE8B3F]">
                    ${price.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#8794AD]">/ month</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 py-2 border-b border-white/10 text-white">
                <div>{beds === 0 ? 'Studio' : `${beds} Beds`}</div>
                <div>{baths} Baths</div>
                <div>{sqft} sq ft</div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[#4FB3A5] font-bold">Midnight ZK Qualification Rules:</span>
                <div className="text-xs text-[#8794AD] space-y-1">
                  <div>✓ Annual Income ≥ ${minIncome.toLocaleString()}</div>
                  <div>✓ Background Check: {requireBackground ? 'Required' : 'Optional'}</div>
                  <div>✓ Employment Attestation: {requireEmployment ? 'Required' : 'Optional'}</div>
                  <div>✓ Tenant Verification Fee: ${verificationFee.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <span>
                Publishing this listing is completely free for landlords. Applicants will pay the $5.00
                ZK verification fee when applying.
              </span>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-md bg-[#EDECE4] text-[#14213D] font-mono text-xs hover:bg-[#14213D]/10"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-8 py-3.5 rounded-md bg-[#AE8B3F] hover:bg-[#977732] text-white font-mono text-xs font-bold shadow-lg transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isPublishing ? 'Publishing on Midnight...' : 'Publish Property Live (Free)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
