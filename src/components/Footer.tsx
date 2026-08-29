'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, ExternalLink, RotateCcw } from 'lucide-react';
import { useZkRent } from '@/context/ZkRentContext';

export function Footer() {
  const { resetDemoData } = useZkRent();

  return (
    <footer className="bg-[#14213D] text-[#EDECE4] border-t border-[#AE8B3F]/30 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#17181A] border border-[#AE8B3F]/40 flex items-center justify-center text-[#AE8B3F]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-xl text-white">
                ZkRent
              </span>
            </div>
            <p className="text-sm text-[#8794AD] max-w-sm leading-relaxed">
              The privacy-preserving rental application protocol powered by Midnight Network zero-knowledge proofs.
              Prove you qualify without exposing private tax returns, pay stubs, or bank statements.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#17181A] border border-[#4FB3A5]/30 text-xs font-mono text-[#4FB3A5]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Midnight Network Halo2 Verification Engine</span>
            </div>
          </div>

          {/* Marketplace Col */}
          <div>
            <h4 className="font-serif font-semibold text-white text-sm tracking-wider uppercase mb-3 text-[#AE8B3F]">
              Marketplace
            </h4>
            <ul className="space-y-2 text-sm text-[#8794AD]">
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
          </div>

          {/* Tenant Col */}
          <div>
            <h4 className="font-serif font-semibold text-white text-sm tracking-wider uppercase mb-3 text-[#4FB3A5]">
              Tenants
            </h4>
            <ul className="space-y-2 text-sm text-[#8794AD]">
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
          </div>

          {/* Landlords Col */}
          <div>
            <h4 className="font-serif font-semibold text-white text-sm tracking-wider uppercase mb-3 text-[#AE8B3F]">
              Landlords
            </h4>
            <ul className="space-y-2 text-sm text-[#8794AD]">
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
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8794AD] gap-4">
          <div className="flex items-center gap-4">
            <span>© 2026 ZkRent Protocol. Zero Raw Documents Stored.</span>
            <span>•</span>
            <button
              onClick={resetDemoData}
              className="text-[#AE8B3F] hover:underline inline-flex items-center gap-1 font-mono"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo State</span>
            </button>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span className="text-[#4FB3A5]">Midnight Testnet v1.2</span>
            <span>Cryptographic Privacy Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
