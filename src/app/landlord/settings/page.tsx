'use client';

import React, { useState } from 'react';
import { useZkRent } from '@/context/ZkRentContext';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FadeIn, MotionCard, LUXURY_EASE } from '@/components/motion/motion';
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
  const prefersReduced = useReducedMotion();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#E5E0D8] py-8 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <FadeIn className="pb-4 border-b border-[#231F20]/10">
          <span className="font-mono text-xs text-[#B86A36] font-bold uppercase tracking-widest">
            Portfolio Configuration
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#231F20] mt-1">
            Landlord Account & Business Settings
          </h1>
          <p className="text-sm text-[#3D3531] mt-1">
            Manage your property management company profile, notification preferences, and verification rules.
          </p>
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
              <span>Landlord preferences updated successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Business & Account Card */}
          <FadeIn delay={0.05}>
            <MotionCard className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#231F20]/10">
                <Building2 className="w-5 h-5 text-[#B86A36]" />
                <h3 className="font-serif font-bold text-lg text-[#231F20]">
                  Property Management Entity
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Entity / Company Name</label>
                  <input
                    type="text"
                    defaultValue="Highline Property Management LLC"
                    className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20] focus:ring-2 focus:ring-[#B86A36] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Primary Contact Name</label>
                  <input
                    type="text"
                    defaultValue="Alexander Wright"
                    className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20] focus:ring-2 focus:ring-[#B86A36] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Business Email</label>
                  <input
                    type="email"
                    defaultValue="leasing@highlineproperties.com"
                    className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20] focus:ring-2 focus:ring-[#B86A36] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Leasing Phone</label>
                  <input
                    type="tel"
                    defaultValue="+1 (512) 780-4920"
                    className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20] focus:ring-2 focus:ring-[#B86A36] focus:outline-none transition-all"
                  />
                </div>
              </div>
            </MotionCard>
          </FadeIn>

          {/* Notifications Card */}
          <FadeIn delay={0.1}>
            <MotionCard className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#231F20]/10">
                <Bell className="w-5 h-5 text-[#4A6B32]" />
                <h3 className="font-serif font-bold text-lg text-[#231F20]">
                  Verification & Application Alerts
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs text-[#231F20]">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#4A6B32] focus:ring-[#4A6B32]" />
                  <span>Instant email notification when a new applicant pays fee</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#4A6B32] focus:ring-[#4A6B32]" />
                  <span>Notify immediately when a Midnight ZK proof reaches &quot;Eligible ✓&quot; status</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#4A6B32] focus:ring-[#4A6B32]" />
                  <span>Alert when an applicant authorizes identity reveal for lease drafting</span>
                </label>
              </div>
            </MotionCard>
          </FadeIn>

          {/* Security & Reset State */}
          <FadeIn delay={0.15}>
            <MotionCard className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#231F20]/10">
                <Lock className="w-5 h-5 text-[#231F20]" />
                <h3 className="font-serif font-bold text-lg text-[#231F20]">
                  Security & Platform Diagnostics
                </h3>
              </div>

              <div className="flex items-center justify-between text-xs font-mono p-3 rounded-lg bg-white border border-[#231F20]/10">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#4A6B32]" />
                  <span>Active Landlord Session (Austin, TX)</span>
                </div>
                <span className="text-[#4A6B32] font-bold">Secure</span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <motion.button
                  whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  type="button"
                  onClick={resetDemoData}
                  className="text-xs font-mono text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo State to Initial Seed Data</span>
                </motion.button>

                <motion.button
                  whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  type="submit"
                  className="px-6 py-2.5 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white font-mono text-xs font-bold transition-colors shadow cursor-pointer"
                >
                  Save Landlord Settings
                </motion.button>
              </div>
            </MotionCard>
          </FadeIn>
        </form>
      </div>
    </div>
  );
}
