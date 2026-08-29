'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, ExternalLink, RotateCcw } from 'lucide-react';
import { useZkRent } from '@/context/ZkRentContext';
import { motion, useReducedMotion } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem, LUXURY_EASE } from '@/components/motion/motion';

export function Footer() {
  const { resetDemoData } = useZkRent();
  const prefersReduced = useReducedMotion();

  return (
    <footer className="bg-[#231F20] text-[#E5E0D8] border-t border-[#B86A36]/30 pt-14 pb-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <StaggerItem className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#231F20] border border-[#B86A36]/40 flex items-center justify-center text-[#B86A36]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-xl text-white">
                ZkRent
              </span>
            </div>
            <p className="text-sm text-[#908682] max-w-sm leading-relaxed">
              The privacy-preserving rental application protocol powered by Midnight Network zero-knowledge proofs.
              Prove you qualify without exposing private tax returns, pay stubs, or bank statements.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#231F20] border border-[#00A8E8]/30 text-xs font-mono text-[#00A8E8]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Midnight Network Halo2 Verification Engine</span>
            </div>
          </StaggerItem>

          {/* Marketplace Col */}
          <StaggerItem>
            <h4 className="font-serif font-semibold text-white text-sm tracking-wider uppercase mb-3 text-[#B86A36]">
              Marketplace
            </h4>
            <ul className="space-y-2 text-sm text-[#908682]">
              <li>
                <Link href="/properties" className="hover:text-white transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How ZK Proofs Work
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About & Principles
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </StaggerItem>

          {/* Tenant Col */}
          <StaggerItem>
            <h4 className="font-serif font-semibold text-white text-sm tracking-wider uppercase mb-3 text-[#00A8E8]">
              Tenants
            </h4>
            <ul className="space-y-2 text-sm text-[#908682]">
              <li>
                <Link href="/tenant" className="hover:text-white transition-colors">
                  Tenant Dashboard
                </Link>
              </li>
              <li>
                <Link href="/tenant/applications" className="hover:text-white transition-colors">
                  Active Applications
                </Link>
              </li>
              <li>
                <Link href="/tenant/verification" className="hover:text-white transition-colors">
                  Proof Receipt Vault
                </Link>
              </li>
              <li>
                <Link href="/tenant/settings" className="hover:text-white transition-colors">
                  Privacy Settings
                </Link>
              </li>
            </ul>
          </StaggerItem>

          {/* Landlords Col */}
          <StaggerItem>
            <h4 className="font-serif font-semibold text-white text-sm tracking-wider uppercase mb-3 text-[#B86A36]">
              Landlords
            </h4>
            <ul className="space-y-2 text-sm text-[#908682]">
              <li>
                <Link href="/landlord" className="hover:text-white transition-colors">
                  Landlord Dashboard
                </Link>
              </li>
              <li>
                <Link href="/landlord/properties/new" className="hover:text-white transition-colors">
                  List Property (Free)
                </Link>
              </li>
              <li>
                <Link href="/landlord/properties" className="hover:text-white transition-colors">
                  Manage Listings
                </Link>
              </li>
              <li>
                <Link href="/landlord/applications" className="hover:text-white transition-colors">
                  Review Applicants
                </Link>
              </li>
              <li>
                <Link href="/landlord/settings" className="hover:text-white transition-colors">
                  Account Settings
                </Link>
              </li>
            </ul>
          </StaggerItem>
        </StaggerContainer>

        {/* Bottom bar */}
        <FadeIn delay={0.2} className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#908682] gap-4">
          <div className="flex items-center gap-4">
            <span>© 2026 ZkRent Protocol. Zero Raw Documents Stored.</span>
            <span>•</span>
            <motion.button
              whileHover={prefersReduced ? undefined : { scale: 1.05 }}
              whileTap={prefersReduced ? undefined : { scale: 0.95 }}
              onClick={resetDemoData}
              className="text-[#B86A36] hover:underline inline-flex items-center gap-1 font-mono cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo State</span>
            </motion.button>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span className="text-[#00A8E8]">Midnight Testnet v1.2</span>
            <span>Cryptographic Privacy Guaranteed</span>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}
