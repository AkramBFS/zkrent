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
      <header className="w-full bg-[#231F20] border-b border-[#00A8E8]/20 py-3.5 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/tenant/applications" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#231F20] border border-[#00A8E8]/40 flex items-center justify-center text-[#00A8E8]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-serif font-bold text-lg tracking-wide text-white">
              ZkRent <span className="text-[#00A8E8] text-xs font-mono font-normal">/ Midnight Prover</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#231F20] border border-[#00A8E8]/30 text-xs font-mono text-[#00A8E8]">
              <span className="w-2 h-2 rounded-full bg-[#00A8E8] animate-pulse" />
              <span>Isolated Local ZK Sandbox</span>
            </div>
            <Link
              href="/tenant/applications"
              className="text-xs font-mono text-[#908682] hover:text-white px-3 py-1 rounded border border-white/10 hover:border-white/20 transition-colors"
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
    <header className="sticky top-0 z-50 bg-[#E5E0D8]/90 backdrop-blur-md border-b border-[#231F20]/10">
      {/* Top Utility Demo Bar */}
      <div className="bg-[#231F20] text-[#E5E0D8] text-xs py-1.5 px-4 font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[#00A8E8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A8E8] animate-pulse" />
              Midnight Network Zero-Knowledge Proof Layer
            </span>
            <span className="hidden md:inline text-white/30">•</span>
            <span className="hidden md:inline text-[#908682]">Zero raw financial docs shared</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Fast Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#3D3531] hover:bg-[#3D3531] text-[#E5E0D8] text-[11px] font-mono border border-white/10 transition-colors"
              >
                <span>Viewing as:</span>
                <span className="text-[#B86A36] font-bold uppercase">
                  {isLandlordRoute ? 'Landlord' : isTenantRoute ? 'Tenant' : 'Marketplace'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#908682]" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-[#231F20] border border-white/15 rounded-md shadow-2xl py-1 z-50">
                  <button
                    onClick={() => {
                      setActiveRole('tenant');
                      setRoleMenuOpen(false);
                      router.push('/tenant');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono text-white hover:bg-[#3D3531] flex items-center gap-2"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#00A8E8]" />
                    <span>Tenant Portal</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveRole('landlord');
                      setRoleMenuOpen(false);
                      router.push('/landlord');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono text-white hover:bg-[#3D3531] flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#B86A36]" />
                    <span>Landlord Portal</span>
                  </button>
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      router.push('/properties');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono text-white hover:bg-[#3D3531] flex items-center gap-2"
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
                    className="w-full text-left px-3 py-1.5 text-[11px] font-mono text-amber-300 hover:bg-[#3D3531] flex items-center gap-1.5"
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
              <div className="w-9 h-9 rounded-md bg-[#231F20] text-[#B86A36] flex items-center justify-center shadow group-hover:bg-[#3D3531] transition-colors border border-[#B86A36]/40">
                <ShieldCheck className="w-5 h-5 text-[#B86A36]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-extrabold text-xl tracking-tight text-[#231F20]">
                  ZkRent
                </span>
                <span className="font-mono text-[9px] tracking-widest text-[#3D3531] uppercase -mt-1">
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
                        ? 'bg-[#231F20] text-white'
                        : 'text-[#231F20] hover:bg-[#231F20]/10'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/landlord/properties"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname.startsWith('/landlord/properties') && pathname !== '/landlord/properties/new'
                        ? 'bg-[#231F20] text-white'
                        : 'text-[#231F20] hover:bg-[#231F20]/10'
                    }`}
                  >
                    My Properties
                  </Link>
                  <Link
                    href="/landlord/applications"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname.startsWith('/landlord/applications')
                        ? 'bg-[#231F20] text-white'
                        : 'text-[#231F20] hover:bg-[#231F20]/10'
                    }`}
                  >
                    Applications
                  </Link>
                  <Link
                    href="/landlord/settings"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === '/landlord/settings'
                        ? 'bg-[#231F20] text-white'
                        : 'text-[#231F20] hover:bg-[#231F20]/10'
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
                        ? 'bg-[#231F20] text-white'
                        : 'text-[#231F20] hover:bg-[#231F20]/10'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/tenant/applications"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                      pathname.startsWith('/tenant/applications')
                        ? 'bg-[#231F20] text-white'
                        : 'text-[#231F20] hover:bg-[#231F20]/10'
                    }`}
                  >
                    My Applications
                    {pendingReveals > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[#B86A36] text-white text-[10px] font-mono">
                        {pendingReveals}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/tenant/verification"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname.startsWith('/tenant/verification')
                        ? 'bg-[#231F20] text-white'
                        : 'text-[#231F20] hover:bg-[#231F20]/10'
                    }`}
                  >
                    Proof Vault
                  </Link>
                  <Link
                    href="/properties"
                    className="px-3 py-2 rounded-md text-sm font-medium text-[#231F20] hover:bg-[#231F20]/10"
                  >
                    Browse Rentals
                  </Link>
                  <Link
                    href="/tenant/settings"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === '/tenant/settings'
                        ? 'bg-[#231F20] text-white'
                        : 'text-[#231F20] hover:bg-[#231F20]/10'
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
                        ? 'bg-[#231F20] text-white'
                        : 'text-[#231F20] hover:bg-[#231F20]/10'
                    }`}
                  >
                    Properties
                  </Link>
                  <Link
                    href="/how-it-works"
                    className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === '/how-it-works'
                        ? 'bg-[#231F20] text-white'
                        : 'text-[#231F20] hover:bg-[#231F20]/10'
                    }`}
                  >
                    How It Works
                  </Link>
                  <Link
                    href="/about"
                    className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === '/about'
                        ? 'bg-[#231F20] text-white'
                        : 'text-[#231F20] hover:bg-[#231F20]/10'
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white font-medium text-sm shadow-sm transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Listing</span>
                </Link>
                <Link
                  href="/tenant"
                  className="px-3 py-2 text-xs font-mono text-[#3D3531] hover:text-[#231F20] border border-[#E5E0D8] rounded-md hover:bg-[#231F20]/5"
                >
                  Switch to Tenant
                </Link>
              </>
            ) : isTenantRoute ? (
              <>
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-white font-medium text-sm shadow-sm transition-all"
                >
                  <Home className="w-4 h-4 text-[#B86A36]" />
                  <span>Find a Home</span>
                </Link>
                <Link
                  href="/landlord"
                  className="px-3 py-2 text-xs font-mono text-[#3D3531] hover:text-[#231F20] border border-[#E5E0D8] rounded-md hover:bg-[#231F20]/5"
                >
                  Switch to Landlord
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-sm font-medium text-[#231F20] hover:text-[#B86A36] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/tenant"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-white text-sm font-medium transition-all shadow-sm"
                >
                  <span>Tenant Portal</span>
                </Link>
                <Link
                  href="/landlord"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white text-sm font-medium transition-all shadow-sm"
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
              className="p-2 rounded-md text-[#231F20] hover:bg-[#231F20]/10"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#E5E0D8] border-b border-[#E5E0D8] px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#231F20]/10">
            <button
              onClick={() => {
                setActiveRole('tenant');
                setMobileOpen(false);
                router.push('/tenant');
              }}
              className="p-2 text-center rounded bg-[#231F20] text-white text-xs font-mono"
            >
              Tenant View
            </button>
            <button
              onClick={() => {
                setActiveRole('landlord');
                setMobileOpen(false);
                router.push('/landlord');
              }}
              className="p-2 text-center rounded bg-[#B86A36] text-white text-xs font-mono"
            >
              Landlord View
            </button>
          </div>

          <div className="flex flex-col space-y-1">
            <Link
              href="/properties"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded text-sm font-medium text-[#231F20]"
            >
              Browse Properties
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded text-sm font-medium text-[#231F20]"
            >
              How It Works
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded text-sm font-medium text-[#231F20]"
            >
              About ZK Privacy
            </Link>
            <Link
              href="/tenant/applications"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded text-sm font-medium text-[#231F20]"
            >
              Tenant Applications
            </Link>
            <Link
              href="/landlord/applications"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded text-sm font-medium text-[#231F20]"
            >
              Landlord Applications
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
