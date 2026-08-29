'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useZkRent } from '@/context/ZkRentContext';
import {
  ShieldCheck,
  Building2,
  Home,
  UserCheck,
  FileCheck,
  PlusCircle,
  Menu,
  X,
  RotateCcw,
  Sparkles,
  Settings,
  ChevronDown,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeRole, setActiveRole, resetDemoData, applications } = useZkRent();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const isTenantRoute = pathname.startsWith('/tenant');
  const isLandlordRoute = pathname.startsWith('/landlord');
  const isVerifyRoute = pathname.includes('/verify');

  // If in verify route, keep navbar minimal dark precision mode
  if (isVerifyRoute) {
    return (
      <header className="w-full bg-[#14213D] border-b border-[#4FB3A5]/20 py-3.5 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/tenant/applications" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#17181A] border border-[#4FB3A5]/40 flex items-center justify-center text-[#4FB3A5]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-serif font-bold text-lg tracking-wide text-white">
              ZkRent <span className="text-[#4FB3A5] text-xs font-mono font-normal">/ Midnight Prover</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17181A] border border-[#4FB3A5]/30 text-xs font-mono text-[#4FB3A5]">
              <span className="w-2 h-2 rounded-full bg-[#4FB3A5] animate-pulse" />
              <span>Isolated Local ZK Sandbox</span>
            </div>
            <Link
              href="/tenant/applications"
              className="text-xs font-mono text-[#8794AD] hover:text-white px-3 py-1 rounded border border-white/10 hover:border-white/20 transition-colors"
            >
              Exit Prover
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // Count pending items
  const pendingReveals = applications.filter((a) => a.revealStatus === 'requested').length;
  const verifiedCount = applications.filter((a) => a.status === 'verified_eligible').length;

  return (
    <header className="sticky top-0 z-50 bg-[#EDECE4]/90 backdrop-blur-md border-b border-[#14213D]/10">
      {/* Top Utility Demo Bar */}
      <div className="bg-[#14213D] text-[#EDECE4] text-xs py-1.5 px-4 font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[#4FB3A5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4FB3A5] animate-pulse" />
              Midnight Network Zero-Knowledge Proof Layer
            </span>
            <span className="hidden md:inline text-white/30">•</span>
            <span className="hidden md:inline text-[#8794AD]">Zero raw financial docs shared</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Fast Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#1E2F54] hover:bg-[#253966] text-[#EDECE4] text-[11px] font-mono border border-white/10 transition-colors"
              >
                <span>Viewing as:</span>
                <span className="text-[#AE8B3F] font-bold uppercase">
                  {isLandlordRoute ? 'Landlord' : isTenantRoute ? 'Tenant' : 'Marketplace'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#8794AD]" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-[#14213D] border border-white/15 rounded-md shadow-2xl py-1 z-50">
                  <button
                    onClick={() => {
                      setActiveRole('tenant');
                      setRoleMenuOpen(false);
                      router.push('/tenant');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono text-white hover:bg-[#1E2F54] flex items-center gap-2"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#4FB3A5]" />
                    <span>Tenant Portal</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveRole('landlord');
                      setRoleMenuOpen(false);
                      router.push('/landlord');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono text-white hover:bg-[#1E2F54] flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#AE8B3F]" />
                    <span>Landlord Portal</span>
                  </button>
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      router.push('/properties');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono text-white hover:bg-[#1E2F54] flex items-center gap-2"
                  >
                    <Home className="w-3.5 h-3.5 text-white/70" />
                    <span>Marketplace Browse</span>
                  </button>
                  <div className="border-t border-white/10 my-1" />
                  <button
                    onClick={() => {
                      resetDemoData();
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[11px] font-mono text-amber-300 hover:bg-[#1E2F54] flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Demo State</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-md bg-[#14213D] text-[#AE8B3F] flex items-center justify-center shadow group-hover:bg-[#1E2F54] transition-colors border border-[#AE8B3F]/40">
                <ShieldCheck className="w-5 h-5 text-[#AE8B3F]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-extrabold text-xl tracking-tight text-[#14213D]">
                  ZkRent
                </span>
                <span className="font-mono text-[9px] tracking-widest text-[#4B5A79] uppercase -mt-1">
                  Private Rental Protocol
                </span>
              </div>
            </Link>

            {/* Navigation Links based on Mode */}
            <nav className="hidden md:flex items-center gap-1">
              {isLandlordRoute ? (
                <>
                  <Link
                    href="/landlord"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === '/landlord'
                        ? 'bg-[#14213D] text-white'
                        : 'text-[#14213D] hover:bg-[#14213D]/10'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/landlord/properties"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname.startsWith('/landlord/properties') && pathname !== '/landlord/properties/new'
                        ? 'bg-[#14213D] text-white'
                        : 'text-[#14213D] hover:bg-[#14213D]/10'
                    }`}
                  >
                    My Properties
                  </Link>
                  <Link
                    href="/landlord/applications"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname.startsWith('/landlord/applications')
                        ? 'bg-[#14213D] text-white'
                        : 'text-[#14213D] hover:bg-[#14213D]/10'
                    }`}
                  >
                    Applications
                  </Link>
                  <Link
                    href="/landlord/settings"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === '/landlord/settings'
                        ? 'bg-[#14213D] text-white'
                        : 'text-[#14213D] hover:bg-[#14213D]/10'
                    }`}
                  >
                    Settings
                  </Link>
                </>
              ) : isTenantRoute ? (
                <>
                  <Link
                    href="/tenant"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === '/tenant'
                        ? 'bg-[#14213D] text-white'
                        : 'text-[#14213D] hover:bg-[#14213D]/10'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/tenant/applications"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                      pathname.startsWith('/tenant/applications')
                        ? 'bg-[#14213D] text-white'
                        : 'text-[#14213D] hover:bg-[#14213D]/10'
                    }`}
                  >
                    My Applications
                    {pendingReveals > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[#AE8B3F] text-white text-[10px] font-mono">
                        {pendingReveals}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/tenant/verification"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname.startsWith('/tenant/verification')
                        ? 'bg-[#14213D] text-white'
                        : 'text-[#14213D] hover:bg-[#14213D]/10'
                    }`}
                  >
                    Proof Vault
                  </Link>
                  <Link
                    href="/properties"
                    className="px-3 py-2 rounded-md text-sm font-medium text-[#14213D] hover:bg-[#14213D]/10"
                  >
                    Browse Rentals
                  </Link>
                  <Link
                    href="/tenant/settings"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === '/tenant/settings'
                        ? 'bg-[#14213D] text-white'
                        : 'text-[#14213D] hover:bg-[#14213D]/10'
                    }`}
                  >
                    Settings
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/properties"
                    className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === '/properties'
                        ? 'bg-[#14213D] text-white'
                        : 'text-[#14213D] hover:bg-[#14213D]/10'
                    }`}
                  >
                    Properties
                  </Link>
                  <Link
                    href="/how-it-works"
                    className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === '/how-it-works'
                        ? 'bg-[#14213D] text-white'
                        : 'text-[#14213D] hover:bg-[#14213D]/10'
                    }`}
                  >
                    How It Works
                  </Link>
                  <Link
                    href="/about"
                    className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === '/about'
                        ? 'bg-[#14213D] text-white'
                        : 'text-[#14213D] hover:bg-[#14213D]/10'
                    }`}
                  >
                    About ZK Privacy
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isLandlordRoute ? (
              <>
                <Link
                  href="/landlord/properties/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#AE8B3F] hover:bg-[#977732] text-white font-medium text-sm shadow-sm transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Listing</span>
                </Link>
                <Link
                  href="/tenant"
                  className="px-3 py-2 text-xs font-mono text-[#4B5A79] hover:text-[#14213D] border border-[#14213D]/15 rounded-md hover:bg-[#14213D]/5"
                >
                  Switch to Tenant
                </Link>
              </>
            ) : isTenantRoute ? (
              <>
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#14213D] hover:bg-[#1E2F54] text-white font-medium text-sm shadow-sm transition-all"
                >
                  <Home className="w-4 h-4 text-[#AE8B3F]" />
                  <span>Find a Home</span>
                </Link>
                <Link
                  href="/landlord"
                  className="px-3 py-2 text-xs font-mono text-[#4B5A79] hover:text-[#14213D] border border-[#14213D]/15 rounded-md hover:bg-[#14213D]/5"
                >
                  Switch to Landlord
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-sm font-medium text-[#14213D] hover:text-[#AE8B3F] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/tenant"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#14213D] hover:bg-[#1E2F54] text-white text-sm font-medium transition-all shadow-sm"
                >
                  <span>Tenant Portal</span>
                </Link>
                <Link
                  href="/landlord"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#AE8B3F] hover:bg-[#977732] text-white text-sm font-medium transition-all shadow-sm"
                >
                  <span>Landlord Portal</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-[#14213D] hover:bg-[#14213D]/10"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#EDECE4] border-b border-[#14213D]/15 px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#14213D]/10">
            <button
              onClick={() => {
                setActiveRole('tenant');
                setMobileOpen(false);
                router.push('/tenant');
              }}
              className="p-2 text-center rounded bg-[#14213D] text-white text-xs font-mono"
            >
              Tenant View
            </button>
            <button
              onClick={() => {
                setActiveRole('landlord');
                setMobileOpen(false);
                router.push('/landlord');
              }}
              className="p-2 text-center rounded bg-[#AE8B3F] text-white text-xs font-mono"
            >
              Landlord View
            </button>
          </div>

          <div className="flex flex-col space-y-1">
            <Link
              href="/properties"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded text-sm font-medium text-[#14213D]"
            >
              Browse Properties
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded text-sm font-medium text-[#14213D]"
            >
              How It Works
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded text-sm font-medium text-[#14213D]"
            >
              About ZK Privacy
            </Link>
            <Link
              href="/tenant/applications"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded text-sm font-medium text-[#14213D]"
            >
              Tenant Applications
            </Link>
            <Link
              href="/landlord/applications"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded text-sm font-medium text-[#14213D]"
            >
              Landlord Applications
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
