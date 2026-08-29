'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { PropertyType } from '@/types';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FadeIn, MotionCard, LUXURY_EASE } from '@/components/motion/motion';
import { Building2, ArrowLeft, Check, Save } from 'lucide-react';

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;
  const { getProperty, updateProperty } = useZkRent();
  const prefersReduced = useReducedMotion();

  const property = getProperty(propertyId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [type, setType] = useState<PropertyType>('Apartment');
  const [price, setPrice] = useState<number>(0);
  const [beds, setBeds] = useState<number>(0);
  const [baths, setBaths] = useState<number>(0);
  const [sqft, setSqft] = useState<number>(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (property) {
      setTitle(property.title);
      setDescription(property.description);
      setAddress(property.address);
      setCity(property.city);
      setState(property.state);
      setZip(property.zip);
      setType(property.type);
      setPrice(property.price);
      setBeds(property.beds);
      setBaths(property.baths);
      setSqft(property.sqft);
    }
  }, [property]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProperty(property.id, {
      title,
      description,
      address,
      city,
      state,
      zip,
      type,
      price,
      beds,
      baths,
      sqft,
    });
    setSaved(true);
    setTimeout(() => {
      router.push(`/landlord/properties/${property.id}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-8 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back Link */}
        <FadeIn className="flex items-center justify-between">
          <Link
            href={`/landlord/properties/${property.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3D3531] hover:text-[#231F20] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Cancel & return to property</span>
          </Link>
        </FadeIn>

        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: LUXURY_EASE }}
              className="p-4 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono text-xs flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Changes saved successfully! Redirecting...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Form Card */}
        <FadeIn delay={0.08}>
          <form onSubmit={handleSave} className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#231F20]">
                Edit Property Listing
              </h1>
              <p className="text-xs text-[#3D3531] mt-0.5">
                Update unit specifications, rental pricing, and description.
              </p>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[#3D3531] mb-1 font-semibold">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
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
                    <label className="block text-[#3D3531] mb-1 font-semibold">Zip</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Condo">Condo</option>
                    <option value="House">House</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Monthly Rent ($)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20] font-bold"
                  />
                </div>

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
                    onChange={(e) => setBaths(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#3D3531] mb-1 font-semibold">Square Footage</label>
                <input
                  type="number"
                  value={sqft}
                  onChange={(e) => setSqft(parseInt(e.target.value) || 0)}
                  className="w-full max-w-xs p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
                />
              </div>

              <div>
                <label className="block text-[#3D3531] mb-1 font-semibold">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20] text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#231F20]/10 flex items-center justify-between">
              <Link
                href={`/landlord/properties/${property.id}`}
                className="px-5 py-2.5 rounded-md bg-[#E5E0D8] text-[#231F20] font-mono text-xs hover:bg-[#231F20]/10 transition-colors"
              >
                Cancel
              </Link>

              <motion.button
                whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                type="submit"
                className="px-6 py-2.5 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 shadow cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#B86A36]" />
                <span>Save Changes</span>
              </motion.button>
            </div>
          </form>
        </FadeIn>
      </div>
    </div>
  );
}
