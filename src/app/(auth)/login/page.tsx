'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FadeIn, MotionCard, LUXURY_EASE } from '@/components/motion/motion';
import { ShieldCheck, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const prefersReduced = useReducedMotion();

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
    <motion.div
      initial={prefersReduced ? undefined : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: LUXURY_EASE }}
      className="w-full max-w-md bg-[#FAFAFA] rounded-2xl border border-[#E5E0D8] p-8 shadow-xl space-y-6"
    >
      <div className="text-center space-y-2">
        <motion.div
          whileHover={prefersReduced ? undefined : { scale: 1.05, rotate: -2 }}
          className="w-12 h-12 rounded-xl bg-[#231F20] text-[#B86A36] flex items-center justify-center mx-auto border border-[#B86A36]/30 shadow"
        >
          <ShieldCheck className="w-7 h-7" />
        </motion.div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#231F20]">
          Welcome Back to ZkRent
        </h1>
        <p className="text-xs text-[#3D3531]">
          Sign in to access your zero-knowledge rental applications or properties.
        </p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700 font-mono overflow-hidden"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        <div>
          <label className="block text-[#3D3531] mb-1 font-semibold">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            required
            className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20] focus:ring-2 focus:ring-[#B86A36] focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-[#3D3531] mb-1 font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20] focus:ring-2 focus:ring-[#B86A36] focus:outline-none transition-all"
          />
        </div>

        <motion.button
          whileHover={prefersReduced ? undefined : { scale: 1.02 }}
          whileTap={prefersReduced ? undefined : { scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-[#00A8E8] hover:bg-[#0277BD] text-white font-bold text-xs font-mono transition-colors shadow flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          {!loading && <ArrowRight className="w-4 h-4 text-[#B86A36]" />}
        </motion.button>
      </form>

      <div className="text-center pt-2 text-xs font-mono text-[#3D3531]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#B86A36] font-bold hover:underline">
          Create account
        </Link>
      </div>
    </motion.div>
  );
}
