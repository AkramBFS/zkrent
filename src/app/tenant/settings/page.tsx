'use client';

import React, { useState } from 'react';
import { useZkRent } from '@/context/ZkRentContext';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FadeIn, MotionCard, LUXURY_EASE } from '@/components/motion/motion';
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
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useMidnightWallet } from '@/hooks/useMidnightWallet';

export default function TenantSettingsPage() {
  const { currentUser, resetDemoData } = useZkRent();
  const wallet = useMidnightWallet();
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
            Preferences & Security
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#231F20] mt-1">
            Tenant Account Settings
          </h1>
          <p className="text-sm text-[#3D3531] mt-1">
            Manage your personal profile, local zero-knowledge privacy parameters, and connected wallet.
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
              <span>Preferences saved successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Account Profile Card */}
          <FadeIn delay={0.05}>
            <MotionCard className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#231F20]/10">
                <User className="w-5 h-5 text-[#B86A36]" />
                <h3 className="font-serif font-bold text-lg text-[#231F20]">
                  Personal Identity (Private by Default)
                </h3>
              </div>
              <p className="text-xs text-[#3D3531]">
                This legal name and contact information are strictly private. They are never shown to
                landlords until you explicitly grant consent during final lease drafting.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Legal Full Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20] focus:ring-2 focus:ring-[#B86A36] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    defaultValue={currentUser.email}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20] focus:ring-2 focus:ring-[#B86A36] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue={currentUser.phone}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20] focus:ring-2 focus:ring-[#B86A36] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[#3D3531] mb-1 font-semibold">Account Role</label>
                  <input
                    type="text"
                    value="Verified Tenant (Applicant)"
                    readOnly
                    className="w-full p-2.5 rounded-lg bg-[#E5E0D8] border border-[#231F20]/10 text-[#3D3531]"
                  />
                </div>
              </div>
            </MotionCard>
          </FadeIn>

          {/* Privacy & Connected Wallet Card */}
          <FadeIn delay={0.1}>
            <MotionCard className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#231F20]/10">
                <Wallet className="w-5 h-5 text-[#4A6B32]" />
                <h3 className="font-serif font-bold text-lg text-[#231F20]">
                  Midnight Network Wallet & Prover State
                </h3>
              </div>

              {/* Connected Wallet Box */}
              <div className="p-4 rounded-lg bg-[#231F20] text-[#E5E0D8] space-y-3 font-mono text-xs border border-[#00A8E8]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[#00A8E8] font-bold">Midnight Shielded Wallet</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        wallet.walletType === 'lace_extension' && wallet.isConnected
                          ? 'bg-purple-900/60 text-purple-200 border-purple-400'
                          : 'bg-[#4A6B32]/40 text-[#00A8E8] border-[#00A8E8]/30'
                      }`}
                    >
                      {wallet.walletType === 'lace_extension' && wallet.isConnected
                        ? 'Lace Extension'
                        : 'Demo Keypair (Sandbox)'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#908682]">
                    {wallet.network}
                  </span>
                </div>

                <div className="text-[11px] text-white/90 break-all bg-black/30 p-2 rounded border border-white/5">
                  {wallet.address || currentUser.midnightAddress}
                </div>

                {/* Balances */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2 rounded bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#908682] block">tSTAR Balance (Gas)</span>
                    <span className="text-sm font-bold text-[#00A8E8]">{wallet.balance.tStar} tSTAR</span>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#908682] block">Shielded DUST</span>
                    <span className="text-sm font-bold text-amber-400">{wallet.balance.dust} DUST</span>
                  </div>
                </div>

                {/* Connection Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    {wallet.isLaceAvailable ? (
                      <motion.button
                        whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                        whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                        type="button"
                        onClick={() => wallet.connectLace()}
                        disabled={wallet.isLoading}
                        className="px-3 py-1.5 rounded bg-purple-700 hover:bg-purple-600 text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{wallet.isConnected && wallet.walletType === 'lace_extension' ? 'Connected to Lace' : 'Connect Lace Wallet'}</span>
                      </motion.button>
                    ) : (
                      <a
                        href="https://docs.midnight.network"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#00A8E8] hover:underline flex items-center gap-1"
                      >
                        <span>Install Lace Extension</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <motion.button
                      whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                      whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                      type="button"
                      onClick={() => wallet.connectDemo()}
                      className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-[#E5E0D8] text-[11px] transition-colors cursor-pointer"
                    >
                      Reset to Demo Key
                    </motion.button>
                  </div>

                  <span className="text-[10px] text-[#908682]">Zero Server Uploads</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono text-[#231F20]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#4A6B32] focus:ring-[#4A6B32]" />
                  <span>Automatically redact all income credentials during proof synthesis</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#4A6B32] focus:ring-[#4A6B32]" />
                  <span>Require cryptographic signature confirmation before releasing identity reveal</span>
                </label>
              </div>
            </MotionCard>
          </FadeIn>

          {/* Security & Sessions */}
          <FadeIn delay={0.15}>
            <MotionCard className="bg-[#FAFAFA] rounded-xl border border-[#E5E0D8] p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#231F20]/10">
                <Lock className="w-5 h-5 text-[#231F20]" />
                <h3 className="font-serif font-bold text-lg text-[#231F20]">
                  Security & Active Sessions
                </h3>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#231F20]/10">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#4A6B32]" />
                    <div>
                      <span className="font-bold text-[#231F20]">Current Browser Session</span>
                      <div className="text-[10px] text-[#908682]">Chrome on macOS • Austin, TX</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#4A6B32]">Active Now</span>
                </div>
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
                  <span>Reset Demo State & LocalStorage</span>
                </motion.button>

                <motion.button
                  whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  type="submit"
                  className="px-6 py-2.5 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-white font-medium text-xs font-mono transition-colors shadow cursor-pointer"
                >
                  Save Settings
                </motion.button>
              </div>
            </MotionCard>
          </FadeIn>
        </form>
      </div>
    </div>
  );
}
