'use client';

import React, { useState } from 'react';
import { useZkRent } from '@/context/ZkRentContext';
import {
  Building2,
  User,
  Bell,
  Lock,
  RotateCcw,
  Check,
  Smartphone,
  Shield,
  Sparkles,
} from 'lucide-react';

export default function LandlordSettingsPage() {
  const { resetDemoData } = useZkRent();
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#EDECE4] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-[#14213D]/10">
          <span className="font-mono text-xs text-[#AE8B3F] font-bold uppercase tracking-widest">
            Portfolio Configuration
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#14213D] mt-1">
            Landlord Account & Business Settings
          </h1>
          <p className="text-sm text-[#4B5A79] mt-1">
            Manage your property management company profile, notification preferences, and verification rules.
          </p>
        </div>

        {saved && (
          <div className="p-4 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Landlord preferences updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Business & Account Card */}
          <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#14213D]/10">
              <Building2 className="w-5 h-5 text-[#AE8B3F]" />
              <h3 className="font-serif font-bold text-lg text-[#14213D]">
                Property Management Entity
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="block text-[#4B5A79] mb-1 font-semibold">Entity / Company Name</label>
                <input
                  type="text"
                  defaultValue="Highline Property Management LLC"
                  className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                />
              </div>

              <div>
                <label className="block text-[#4B5A79] mb-1 font-semibold">Primary Contact Name</label>
                <input
                  type="text"
                  defaultValue="Alexander Wright"
                  className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                />
              </div>

              <div>
                <label className="block text-[#4B5A79] mb-1 font-semibold">Business Email</label>
                <input
                  type="email"
                  defaultValue="leasing@highlineproperties.com"
                  className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                />
              </div>

              <div>
                <label className="block text-[#4B5A79] mb-1 font-semibold">Leasing Phone</label>
                <input
                  type="tel"
                  defaultValue="+1 (512) 780-4920"
                  className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                />
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#14213D]/10">
              <Bell className="w-5 h-5 text-[#2E7D74]" />
              <h3 className="font-serif font-bold text-lg text-[#14213D]">
                Verification & Application Alerts
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs text-[#14213D]">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#2E7D74]" />
                <span>Instant email notification when a new applicant pays fee</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#2E7D74]" />
                <span>Notify immediately when a Midnight ZK proof reaches "Eligible ✓" status</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#2E7D74]" />
                <span>Alert when an applicant authorizes identity reveal for lease drafting</span>
              </label>
            </div>
          </div>

          {/* Security & Reset State */}
          <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#14213D]/10">
              <Lock className="w-5 h-5 text-[#14213D]" />
              <h3 className="font-serif font-bold text-lg text-[#14213D]">
                Security & Platform Diagnostics
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs font-mono p-3 rounded-lg bg-white border border-[#14213D]/10">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#2E7D74]" />
                <span>Active Landlord Session (Austin, TX)</span>
              </div>
              <span className="text-[#2E7D74] font-bold">Secure</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={resetDemoData}
                className="text-xs font-mono text-amber-800 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo State to Initial Seed Data</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-md bg-[#AE8B3F] hover:bg-[#977732] text-white font-mono text-xs font-bold transition-colors shadow"
              >
                Save Landlord Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
