'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useZkRent } from '@/context/ZkRentContext';
import { ShieldCheck, User, Building2, ArrowRight, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setActiveRole } = useZkRent();

  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveRole(role);
    router.push(`/onboarding?role=${role}`);
  };

  return (
    <div className="w-full max-w-md bg-[#F6F5F0] rounded-2xl border border-[#14213D]/15 p-8 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[#14213D] text-[#AE8B3F] flex items-center justify-center mx-auto border border-[#AE8B3F]/30 shadow">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14213D]">
          Create ZkRent Account
        </h1>
        <p className="text-xs text-[#4B5A79]">
          Join the privacy-first rental protocol powered by Midnight Network.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
        {/* Role Picker */}
        <div className="space-y-2">
          <label className="block text-[#4B5A79] font-semibold">I want to use ZkRent as a:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('tenant')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                role === 'tenant'
                  ? 'bg-[#14213D] text-white border-[#14213D] shadow'
                  : 'bg-white text-[#14213D] border-[#14213D]/15 hover:bg-[#EDECE4]'
              }`}
            >
              <User className={`w-5 h-5 ${role === 'tenant' ? 'text-[#4FB3A5]' : 'text-[#14213D]'}`} />
              <span className="font-bold">Tenant</span>
              <span className="text-[10px] opacity-75">Apply Privately</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('landlord')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                role === 'landlord'
                  ? 'bg-[#AE8B3F] text-white border-[#AE8B3F] shadow'
                  : 'bg-white text-[#14213D] border-[#14213D]/15 hover:bg-[#EDECE4]'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span className="font-bold">Landlord</span>
              <span className="text-[10px] opacity-75">List for Free</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[#4B5A79] mb-1 font-semibold">Email Address</label>
          <input
            type="email"
            value={email}
            placeholder="you@domain.com"
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
            placeholder="••••••••••••"
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
          />
        </div>

        <div>
          <label className="block text-[#4B5A79] mb-1 font-semibold">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            placeholder="••••••••••••"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-lg bg-[#14213D] hover:bg-[#1E2F54] text-white font-bold text-xs font-mono transition-colors shadow flex items-center justify-center gap-2"
        >
          <span>Create Account & Onboard</span>
          <ArrowRight className="w-4 h-4 text-[#AE8B3F]" />
        </button>
      </form>

      <div className="text-center pt-2 text-xs font-mono text-[#4B5A79]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#AE8B3F] font-bold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
