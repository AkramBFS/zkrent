'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { PropertyType } from '@/types';
import { Building2, ArrowLeft, Check, Save } from 'lucide-react';

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;
  const { getProperty, updateProperty } = useZkRent();

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
    <div className="min-h-screen bg-[#EDECE4] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href={`/landlord/properties/${property.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#4B5A79] hover:text-[#14213D]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & return to property</span>
          </Link>
        </div>

        {saved && (
          <div className="p-4 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Changes saved successfully! Redirecting...</span>
          </div>
        )}

        {/* Edit Form Card */}
        <form onSubmit={handleSave} className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#14213D]">
              Edit Property Listing
            </h1>
            <p className="text-xs text-[#4B5A79] mt-0.5">
              Update unit specifications, rental pricing, and description.
            </p>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[#4B5A79] mb-1 font-semibold">Title</label>
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
                <label className="block text-[#4B5A79] mb-1 font-semibold">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
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
                  onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
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
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D] text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#14213D]/10 flex items-center justify-between">
            <Link
              href={`/landlord/properties/${property.id}`}
              className="px-5 py-2.5 rounded-md bg-[#EDECE4] text-[#14213D] font-mono text-xs hover:bg-[#14213D]/10"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-md bg-[#14213D] hover:bg-[#1E2F54] text-white font-mono text-xs font-bold transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-[#AE8B3F]" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
