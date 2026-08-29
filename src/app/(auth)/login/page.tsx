'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { ShieldCheck, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      // Fetch session to determine role-based redirect
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      if (session?.user?.role === 'LANDLORD') {
        router.push('/landlord');
      } else {
        router.push('/tenant');
      }
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
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

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700 font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        <div>
          <label className="block text-[#4B5A79] mb-1 font-semibold">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
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
            placeholder="••••••••••••"
            required
            className="w-full p-2.5 rounded-lg bg-white border border-[#14213D]/15 text-[#14213D]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-[#14213D] hover:bg-[#1E2F54] text-white font-bold text-xs font-mono transition-colors shadow flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          {!loading && <ArrowRight className="w-4 h-4 text-[#AE8B3F]" />}
        </button>
      </form>

      <div className="text-center pt-2 text-xs font-mono text-[#4B5A79]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#AE8B3F] font-bold hover:underline">
          Create account
        </Link>
      </div>
    </div>
  );
}
