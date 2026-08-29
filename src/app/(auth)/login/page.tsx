'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { ShieldCheck, Lock, User, Building2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setActiveRole } = useZkRent();
  const [email, setEmail] = useState('elena.rostova@example.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleLoginTenant = () => {
    setActiveRole('tenant');
    router.push('/tenant');
  };

  const handleLoginLandlord = () => {
    setActiveRole('landlord');
    router.push('/landlord');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLoginTenant();
  };

  return (
    <div className="w-full max-w-md bg-[#F6F5F0] rounded-2xl border border-[#14213D]/15 p-8 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[#14213D] text-[#AE8B3F] flex items-center justify-center mx-auto border border-[#AE8B3F]/30 shadow">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14213D]">
          Welcome Back to ZkRent
        </h1>
        <p className="text-xs text-[#4B5A79]">
          Sign in to access your zero-knowledge rental applications or properties.
        </p>
      </div>

      {/* Quick Demo Access Bar */}
      <div className="p-3 rounded-lg bg-[#EDECE4] border border-[#14213D]/10 space-y-2 text-center">
        <span className="text-[11px] font-mono text-[#AE8B3F] font-bold uppercase tracking-wider block">
          ⚡ One-Click Demo Mode
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleLoginTenant}
            className="py-2 px-3 rounded-md bg-[#14213D] text-white text-xs font-mono font-bold hover:bg-[#1E2F54] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <User className="w-3.5 h-3.5 text-[#4FB3A5]" />
            <span>As Tenant</span>
          </button>
          <button
            type="button"
            onClick={handleLoginLandlord}
            className="py-2 px-3 rounded-md bg-[#AE8B3F] text-white text-xs font-mono font-bold hover:bg-[#977732] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>As Landlord</span>
          </button>
        </div>
      </div>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-[#14213D]/10" />
        <span className="flex-shrink mx-3 text-[11px] font-mono text-[#8794AD] uppercase">
          or continue with email
        </span>
        <div className="flex-grow border-t border-[#14213D]/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        <div>
          <label className="block text-[#4B5A79] mb-1 font-semibold">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
          />
        </div>

        <div>
          <label className="block text-[#4B5A79] mb-1 font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-[#14213D] hover:bg-[#1E2F54] text-white font-bold text-xs font-mono transition-colors shadow flex items-center justify-center gap-2"
        >
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4 text-[#AE8B3F]" />
        </button>
      </form>

      <div className="text-center pt-2 text-xs font-mono text-[#4B5A79]">
        Don't have an account?{' '}
        <Link href="/register" className="text-[#AE8B3F] font-bold hover:underline">
          Create account
        </Link>
      </div>
    </div>
  );
}
