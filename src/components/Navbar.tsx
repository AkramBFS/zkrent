'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useZkRent } from '@/context/ZkRentContext';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { LUXURY_EASE } from '@/components/motion/motion';
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
  const { activeRole, setActiveRole, resetDemoData, applications, currentUser } = useZkRent();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#E5E0D8]/95 backdrop-blur-md border-b border-[#231F20]/15 shadow-sm'
          : 'bg-[#E5E0D8]/90 backdrop-blur-md border-b border-[#231F20]/10'
      }`}
    >
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
              <motion.button
                whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#3D3531] hover:bg-[#3D3531] text-[#E5E0D8] text-[11px] font-mono border border-white/10 transition-colors cursor-pointer"
              >
                <span>Viewing as:</span>
                <span className="text-[#B86A36] font-bold uppercase">
                  {isLandlordRoute ? 'Landlord' : isTenantRoute ? 'Tenant' : 'Marketplace'}
                </span>
                <motion.span
                  animate={{ rotate: roleMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-3 h-3 text-[#908682]" />
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {roleMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.18, ease: LUXURY_EASE }}
                    className="absolute right-0 mt-1 w-44 bg-[#231F20] border border-white/15 rounded-md shadow-2xl py-1 z-50 origin-top-right"
                  >
                    <button
                      onClick={() => {
                        setActiveRole('tenant');
                        setRoleMenuOpen(false);
                        router.push('/tenant');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-mono text-white hover:bg-[#3D3531] flex items-center gap-2 transition-colors cursor-pointer"
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
                      className="w-full text-left px-3 py-2 text-xs font-mono text-white hover:bg-[#3D3531] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#B86A36]" />
                      <span>Landlord Portal</span>
                    </button>
                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        router.push('/properties');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-mono text-white hover:bg-[#3D3531] flex items-center gap-2 transition-colors cursor-pointer"
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
                      className="w-full text-left px-3 py-1.5 text-[11px] font-mono text-amber-300 hover:bg-[#3D3531] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Demo State</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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
              <motion.div
                whileHover={prefersReduced ? undefined : { scale: 1.05, rotate: -2 }}
                className="w-9 h-9 rounded-md bg-[#231F20] text-[#B86A36] flex items-center justify-center shadow group-hover:bg-[#3D3531] transition-colors border border-[#B86A36]/40"
              >
                <ShieldCheck className="w-5 h-5 text-[#B86A36]" />
              </motion.div>
              <div className="flex flex-col">
                <span className="font-serif font-extrabold text-xl tracking-tight text-[#231F20]">
                  ZkRent
                </span>
                <span className="font-mono text-[9px] tracking-widest text-[#3D3531] uppercase -mt-1">
                  Private Rental Protocol
                </span>
              </div>
            </Link>

            {/* Navigation Links based on Mode with Animated Indicator */}
            <nav className="hidden md:flex items-center gap-1 relative">
              {isLandlordRoute ? (
                <>
                  {[
                    { href: '/landlord', label: 'Dashboard', isActive: pathname === '/landlord' },
                    {
                      href: '/landlord/properties',
                      label: 'My Properties',
                      isActive: pathname.startsWith('/landlord/properties') && pathname !== '/landlord/properties/new',
                    },
                    {
                      href: '/landlord/applications',
                      label: 'Applications',
                      isActive: pathname.startsWith('/landlord/applications'),
                    },
                    { href: '/landlord/settings', label: 'Settings', isActive: pathname === '/landlord/settings' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        item.isActive ? 'text-white' : 'text-[#231F20] hover:bg-[#231F20]/10'
                      }`}
                    >
                      {item.isActive && (
                        <motion.div
                          layoutId="active-landlord-nav-pill"
                          className="absolute inset-0 bg-[#231F20] rounded-md z-0"
                          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  ))}
                </>
              ) : isTenantRoute ? (
                <>
                  {[
                    { href: '/tenant', label: 'Dashboard', isActive: pathname === '/tenant' },
                    {
                      href: '/tenant/applications',
                      label: 'My Applications',
                      isActive: pathname.startsWith('/tenant/applications'),
                      badge: pendingReveals > 0 ? pendingReveals : null,
                    },
                    {
                      href: '/tenant/verification',
                      label: 'Proof Vault',
                      isActive: pathname.startsWith('/tenant/verification'),
                    },
                    {
                      href: '/properties',
                      label: 'Browse Rentals',
                      isActive: false,
                    },
                    { href: '/tenant/settings', label: 'Settings', isActive: pathname === '/tenant/settings' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        item.isActive ? 'text-white' : 'text-[#231F20] hover:bg-[#231F20]/10'
                      }`}
                    >
                      {item.isActive && (
                        <motion.div
                          layoutId="active-tenant-nav-pill"
                          className="absolute inset-0 bg-[#231F20] rounded-md z-0"
                          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                        />
                      )}
                      <span className="relative z-10 inline-flex items-center">
                        {item.label}
                        {item.badge && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[#B86A36] text-white text-[10px] font-mono">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { href: '/properties', label: 'Properties', isActive: pathname === '/properties' },
                    { href: '/how-it-works', label: 'How It Works', isActive: pathname === '/how-it-works' },
                    { href: '/about', label: 'About ZK Privacy', isActive: pathname === '/about' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                        item.isActive ? 'text-white' : 'text-[#231F20] hover:bg-[#231F20]/10'
                      }`}
                    >
                      {item.isActive && (
                        <motion.div
                          layoutId="active-public-nav-pill"
                          className="absolute inset-0 bg-[#231F20] rounded-md z-0"
                          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isLandlordRoute ? (
              <>
                <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                  <Link
                    href="/landlord/properties/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white font-medium text-sm shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Listing</span>
                  </Link>
                </motion.div>
                <Link
                  href="/tenant"
                  className="px-3 py-2 text-xs font-mono text-[#3D3531] hover:text-[#231F20] border border-[#E5E0D8] rounded-md hover:bg-[#231F20]/5 transition-colors"
                >
                  Switch to Tenant
                </Link>
              </>
            ) : isTenantRoute ? (
              <>
                <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                  <Link
                    href="/properties"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-white font-medium text-sm shadow-sm transition-all"
                  >
                    <Home className="w-4 h-4 text-[#B86A36]" />
                    <span>Find a Home</span>
                  </Link>
                </motion.div>
                <Link
                  href="/landlord"
                  className="px-3 py-2 text-xs font-mono text-[#3D3531] hover:text-[#231F20] border border-[#E5E0D8] rounded-md hover:bg-[#231F20]/5 transition-colors"
                >
                  Switch to Landlord
                </Link>
              </>
            ) : (
              <>
                {/* Redundancy Fix: Check if user is authenticated/active to avoid showing duplicate contradictory buttons */}
                {currentUser?.id ? (
                  <>
                    <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                      <Link
                        href={activeRole === 'landlord' ? '/landlord' : '/tenant'}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-white text-sm font-medium transition-all shadow-sm"
                      >
                        <span>{activeRole === 'landlord' ? 'Landlord Portal' : 'Tenant Portal'}</span>
                      </Link>
                    </motion.div>
                    <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                      <Link
                        href={activeRole === 'landlord' ? '/tenant' : '/landlord'}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white text-sm font-medium transition-all shadow-sm"
                      >
                        <span>{activeRole === 'landlord' ? 'Tenant Portal' : 'Landlord Portal'}</span>
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-3.5 py-2 text-sm font-medium text-[#231F20] hover:text-[#B86A36] transition-colors"
                    >
                      Log in
                    </Link>
                    <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                      <Link
                        href="/tenant"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-white text-sm font-medium transition-all shadow-sm"
                      >
                        <span>Tenant Portal</span>
                      </Link>
                    </motion.div>
                    <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                      <Link
                        href="/landlord"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#B86A36] hover:bg-[#A05A2C] text-white text-sm font-medium transition-all shadow-sm"
                      >
                        <span>Landlord Portal</span>
                      </Link>
                    </motion.div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-[#231F20] hover:bg-[#231F20]/10 transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: LUXURY_EASE }}
            className="md:hidden bg-[#E5E0D8] border-b border-[#E5E0D8] px-4 pt-2 pb-6 space-y-3 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#231F20]/10">
              <button
                onClick={() => {
                  setActiveRole('tenant');
                  setMobileOpen(false);
                  router.push('/tenant');
                }}
                className="p-2 text-center rounded bg-[#231F20] text-white text-xs font-mono cursor-pointer"
              >
                Tenant View
              </button>
              <button
                onClick={() => {
                  setActiveRole('landlord');
                  setMobileOpen(false);
                  router.push('/landlord');
                }}
                className="p-2 text-center rounded bg-[#B86A36] text-white text-xs font-mono cursor-pointer"
              >
                Landlord View
              </button>
            </div>

            <div className="flex flex-col space-y-1">
              <Link
                href="/properties"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded text-sm font-medium text-[#231F20] hover:bg-[#231F20]/5 transition-colors"
              >
                Browse Properties
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded text-sm font-medium text-[#231F20] hover:bg-[#231F20]/5 transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded text-sm font-medium text-[#231F20] hover:bg-[#231F20]/5 transition-colors"
              >
                About ZK Privacy
              </Link>
              <Link
                href="/tenant/applications"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded text-sm font-medium text-[#231F20] hover:bg-[#231F20]/5 transition-colors"
              >
                Tenant Applications
              </Link>
              <Link
                href="/landlord/applications"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded text-sm font-medium text-[#231F20] hover:bg-[#231F20]/5 transition-colors"
              >
                Landlord Applications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
