'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { PropertyType } from '@/types';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FadeIn, MotionCard, LUXURY_EASE } from '@/components/motion/motion';
import {
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  X,
  Lock,
} from 'lucide-react';

export default function NewPropertyWizardPage() {
  const router = useRouter();
  const { addProperty } = useZkRent();
  const prefersReduced = useReducedMotion();

  // Wizard Step (1: Basics, 2: Specs & Details, 3: ZK Requirements, 4: Review & Publish)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PropertyType>('Apartment');
  const [price, setPrice] = useState<number>(2400);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Austin');
  const [state, setState] = useState('TX');
  const [zip, setZip] = useState('78701');
  const [beds, setBeds] = useState<number>(2);
  const [baths, setBaths] = useState<number>(2);
  const [sqft, setSqft] = useState<number>(1150);
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([
    'In-Unit Washer/Dryer',
    'Hardwood Floors',
    'Reserved Garage Parking',
  ]);
  const [newAmenity, setNewAmenity] = useState('');

  // ZK Requirements Form State
  const [minIncome, setMinIncome] = useState<number>(72000);
  const [requireBackground, setRequireBackground] = useState<boolean>(true);
  const [requireEmployment, setRequireEmployment] = useState<boolean>(true);
  const [verificationFee, setVerificationFee] = useState<number>(5.0);

  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (item: string) => {
    setAmenities(amenities.filter((a) => a !== item));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newProp = await addProperty({
        title,
        type,
        price,
        address,
        city,
        state,
        zip,
        beds,
        baths,
        sqft,
        description,
        amenities,
        images: [imageUrl],
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
      console.error('Failed to create listing:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-8 overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Navigation & Stepper Header */}
        <FadeIn className="flex items-center justify-between border-b border-[#231F20]/10 pb-4">
          <Link
            href="/landlord/properties"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3D3531] hover:text-[#231F20] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Cancel & return</span>
          </Link>

          <div className="flex items-center gap-2 font-mono text-xs text-[#908682]">
            <span className={step === 1 ? 'text-[#B86A36] font-bold' : ''}>1. Basics</span>
            <span>→</span>
            <span className={step === 2 ? 'text-[#B86A36] font-bold' : ''}>2. Specs</span>
            <span>→</span>
            <span className={step === 3 ? 'text-[#B86A36] font-bold' : ''}>3. ZK Rules</span>
            <span>→</span>
            <span className={step === 4 ? 'text-[#B86A36] font-bold' : ''}>4. Publish</span>
          </div>
        </FadeIn>

        {/* Wizard Step Card with AnimatePresence */}
        <AnimatePresence mode="wait">
          {/* STEP 1: BASICS */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35, ease: LUXURY_EASE }}
              className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 sm:p-8 space-y-6 shadow-sm"
            >
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#B86A36] font-bold uppercase tracking-wider">
                  Step 1 of 4: Basic Information
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#231F20]">
                  Property Overview
                </h2>
                <p className="text-xs text-[#3D3531]">
                  Listings are 100% free to publish on ZkRent.
                </p>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Listing Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Penthouse with Skyline Views"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-sm text-[#231F20] focus:ring-2 focus:ring-[#B86A36] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#3D3531] mb-1 font-semibold">Property Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as PropertyType)}
                      className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="Condo">Condo</option>
                      <option value="House">House</option>
                      <option value="Studio">Studio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#3D3531] mb-1 font-semibold">Monthly Rent ($ USD)</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 401 Colorado St #1802"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#3D3531] mb-1 font-semibold">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3D3531] mb-1 font-semibold">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3D3531] mb-1 font-semibold">Zip Code</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <motion.button
                  whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!title || !address}
                  className="py-3 px-6 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Continue to Specs</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SPECS & AMENITIES */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35, ease: LUXURY_EASE }}
              className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 sm:p-8 space-y-6 shadow-sm"
            >
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#B86A36] font-bold uppercase tracking-wider">
                  Step 2 of 4: Unit Specifications
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#231F20]">
                  Layout, Description & Photos
                </h2>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#3D3531] mb-1 font-semibold">Bedrooms</label>
                    <input
                      type="number"
                      value={beds}
                      onChange={(e) => setBeds(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3D3531] mb-1 font-semibold">Bathrooms</label>
                    <input
                      type="number"
                      step="0.5"
                      value={baths}
                      onChange={(e) => setBaths(parseFloat(e.target.value) || 1)}
                      className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3D3531] mb-1 font-semibold">Square Feet</label>
                    <input
                      type="number"
                      value={sqft}
                      onChange={(e) => setSqft(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Property Description</label>
                  <textarea
                    rows={4}
                    placeholder="Describe the unit features, views, neighborhood, and highlights..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20] text-xs font-sans"
                  />
                </div>

                {/* Amenities Manager with AnimatePresence */}
                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Amenities</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add an amenity (e.g. Balcony, Pool, EV Charger)"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                      className="flex-1 p-2 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                    />
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="px-3 py-2 bg-[#231F20] text-white rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <AnimatePresence>
                      {amenities.map((a) => (
                        <motion.span
                          key={a}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5E0D8] text-[#231F20] text-[11px]"
                        >
                          <span>{a}</span>
                          <button
                            type="button"
                            onClick={() => removeAmenity(a)}
                            className="hover:text-red-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Photo Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-2.5 px-4 rounded-md border border-[#231F20]/20 text-[#231F20] font-mono text-xs cursor-pointer"
                >
                  ← Back
                </button>
                <motion.button
                  whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  type="button"
                  onClick={() => setStep(3)}
                  className="py-3 px-6 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Define ZK Rules</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: ZK REQUIREMENTS (FLAGSHIP STEP) */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35, ease: LUXURY_EASE }}
              className="bg-[#231F20] text-[#E5E0D8] rounded-xl border border-[#00A8E8]/40 p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#00A8E8] font-mono text-xs font-bold uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Step 3 of 4: Zero-Knowledge Verification Parameters</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-white">
                  Define Qualification Rules
                </h2>
                <p className="text-xs text-[#908682]">
                  These conditions are encoded directly into the Midnight Network smart contract circuit.
                  You will receive cryptographic &quot;ELIGIBLE&quot; seals without collecting raw tenant files.
                </p>
              </div>

              <div className="space-y-5 font-mono text-xs">
                {/* Min Income */}
                <div className="p-4 rounded-lg bg-[#231F20] border border-[#00A8E8]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-white text-sm">
                      1. Minimum Annual Gross Income Threshold
                    </label>
                    <span className="text-[#00A8E8] font-bold text-base">
                      ${minIncome.toLocaleString()} / year
                    </span>
                  </div>
                  <p className="text-[11px] text-[#908682]">
                    Typically 3x monthly rent (${(price * 36).toLocaleString()}/yr). Applicants prove earnings ≥ this amount in zero-knowledge.
                  </p>
                  <input
                    type="range"
                    min="30000"
                    max="250000"
                    step="5000"
                    value={minIncome}
                    onChange={(e) => setMinIncome(parseInt(e.target.value))}
                    className="w-full accent-[#00A8E8] mt-2"
                  />
                </div>

                {/* Background Check Requirement */}
                <div className="p-4 rounded-lg bg-[#231F20] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">
                      2. Criminal & Eviction Background Check
                    </div>
                    <div className="text-[11px] text-[#908682]">
                      Requires verified clear attestation from accredited registry
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireBackground}
                      onChange={(e) => setRequireBackground(e.target.checked)}
                      className="w-4 h-4 rounded text-[#00A8E8] focus:ring-[#00A8E8]"
                    />
                    <span className="text-white font-bold">{requireBackground ? 'Enforced' : 'Disabled'}</span>
                  </label>
                </div>

                {/* Employment Verification Requirement */}
                <div className="p-4 rounded-lg bg-[#231F20] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">
                      3. Active Employment Verification
                    </div>
                    <div className="text-[11px] text-[#908682]">
                      Requires active employment attestation
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireEmployment}
                      onChange={(e) => setRequireEmployment(e.target.checked)}
                      className="w-4 h-4 rounded text-[#00A8E8] focus:ring-[#00A8E8]"
                    />
                    <span className="text-white font-bold">{requireEmployment ? 'Enforced' : 'Disabled'}</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-2.5 px-4 rounded-md bg-[#231F20] border border-white/15 text-white font-mono text-xs hover:bg-white/10 transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <motion.button
                  whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  type="button"
                  onClick={() => setStep(4)}
                  className="py-3 px-6 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-[#231F20] font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Review & Publish</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: REVIEW & PUBLISH */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35, ease: LUXURY_EASE }}
              className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 sm:p-8 space-y-6 shadow-sm"
            >
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#B86A36] font-bold uppercase tracking-wider">
                  Step 4 of 4: Final Confirmation
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#231F20]">
                  Ready to Publish Listing
                </h2>
                <p className="text-xs text-[#3D3531]">
                  Your property will appear in the marketplace with upfront ZK qualification rules.
                </p>
              </div>

              {/* Review Summary */}
              <div className="p-4 rounded-lg bg-[#E5E0D8] space-y-3 font-mono text-xs text-[#231F20]">
                <div className="flex justify-between pb-2 border-b border-[#231F20]/10">
                  <span className="font-bold text-sm">{title}</span>
                  <span className="font-bold text-sm">${price.toLocaleString()} / mo</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Type: <strong>{type}</strong></div>
                  <div>Location: <strong>{address}, {city}</strong></div>
                  <div>Layout: <strong>{beds} Bed • {baths} Bath • {sqft} sqft</strong></div>
                  <div>Fee: <strong>${verificationFee.toFixed(2)}</strong></div>
                </div>

                <div className="pt-2 border-t border-[#231F20]/10 space-y-1">
                  <div className="text-[11px] font-bold text-[#4A6B32]">Midnight ZK Rules Enforced:</div>
                  <div>• Minimum Income: ≥ ${minIncome.toLocaleString()} / yr</div>
                  <div>• Background Check: {requireBackground ? 'Enforced' : 'None'}</div>
                  <div>• Employment Check: {requireEmployment ? 'Enforced' : 'None'}</div>
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="py-2.5 px-4 rounded-md border border-[#231F20]/20 text-[#231F20] font-mono text-xs cursor-pointer"
                >
                  ← Back
                </button>
                <motion.button
                  whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="py-3 px-8 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white font-mono text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Publishing Listing...' : 'Publish Listing (Free)'}</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
