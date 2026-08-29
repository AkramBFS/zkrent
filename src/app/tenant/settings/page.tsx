'use client';

import React, { useState } from 'react';
import { useZkRent } from '@/context/ZkRentContext';
import {
  User,
  Shield,
  Key,
  Wallet,
  Lock,
  RotateCcw,
  Check,
  Sparkles,
  Smartphone,
  LogOut,
} from 'lucide-react';

export default function TenantSettingsPage() {
  const { currentUser, resetDemoData } = useZkRent();
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
            Preferences & Security
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#14213D] mt-1">
            Tenant Account Settings
          </h1>
          <p className="text-sm text-[#4B5A79] mt-1">
            Manage your personal profile, local zero-knowledge privacy parameters, and connected wallet.
          </p>
        </div>

        {saved && (
          <div className="p-4 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Preferences saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Account Profile Card */}
          <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#14213D]/10">
              <User className="w-5 h-5 text-[#AE8B3F]" />
              <h3 className="font-serif font-bold text-lg text-[#14213D]">
                Personal Identity (Private by Default)
              </h3>
            </div>
            <p className="text-xs text-[#4B5A79]">
              This legal name and contact information are strictly private. They are never shown to
              landlords until you explicitly grant consent during final lease drafting.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="block text-[#4B5A79] mb-1 font-semibold">Legal Full Name</label>
                <input
                  type="text"
                  defaultValue={currentUser.name}
                  className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                />
              </div>

              <div>
                <label className="block text-[#4B5A79] mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  defaultValue={currentUser.email}
                  className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                />
              </div>

              <div>
                <label className="block text-[#4B5A79] mb-1 font-semibold">Phone Number</label>
                <input
                  type="tel"
                  defaultValue={currentUser.phone}
                  className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
                />
              </div>

              <div>
                <label className="block text-[#4B5A79] mb-1 font-semibold">Account Role</label>
                <input
                  type="text"
                  value="Verified Tenant (Applicant)"
                  readOnly
                  className="w-full p-2.5 rounded-lg bg-[#EDECE4] border border-[#14213D]/10 text-[#4B5A79]"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Connected Wallet Card */}
          <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#14213D]/10">
              <Wallet className="w-5 h-5 text-[#2E7D74]" />
              <h3 className="font-serif font-bold text-lg text-[#14213D]">
                Midnight Network Privacy & Prover State
              </h3>
            </div>

            <div className="p-4 rounded-lg bg-[#14213D] text-[#EDECE4] space-y-3 font-mono text-xs border border-[#4FB3A5]/30">
              <div className="flex items-center justify-between">
                <span className="text-[#4FB3A5] font-bold">Connected Midnight Wallet</span>
                <span className="px-2 py-0.5 rounded bg-[#2E7D74]/40 text-[#4FB3A5] text-[10px]">
                  Active on Testnet
                </span>
              </div>
              <div className="text-[11px] text-[#8794AD] break-all">
                {currentUser.midnightAddress}
              </div>
              <div className="flex items-center justify-between text-xs text-white pt-2 border-t border-white/10">
                <span>Prover Engine: Halo2 WebAssembly (Local)</span>
                <span className="text-[#AE8B3F]">Zero Server Uploads</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono text-[#14213D]">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-[#2E7D74]" />
                <span>Automatically redact all income credentials during proof synthesis</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-[#2E7D74]" />
                <span>Require 2FA biometric confirmation before releasing lease identity reveal</span>
              </label>
            </div>
          </div>

          {/* Security & Sessions */}
          <div className="bg-[#F6F5F0] rounded-xl border border-[#14213D]/15 p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#14213D]/10">
              <Lock className="w-5 h-5 text-[#14213D]" />
              <h3 className="font-serif font-bold text-lg text-[#14213D]">
                Security & Active Sessions
              </h3>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#14213D]/10">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#2E7D74]" />
                  <div>
                    <span className="font-bold text-[#14213D]">Current Browser Session</span>
                    <div className="text-[10px] text-[#8794AD]">Chrome on macOS • Austin, TX</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#2E7D74]">Active Now</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={resetDemoData}
                className="text-xs font-mono text-amber-800 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo State & LocalStorage</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-md bg-[#14213D] hover:bg-[#1E2F54] text-white font-medium text-xs font-mono transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
