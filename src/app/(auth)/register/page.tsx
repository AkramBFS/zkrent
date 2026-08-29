'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { ShieldCheck, User, Building2, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<'TENANT' | 'LANDLORD'>('TENANT');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName || undefined,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto-login after successful registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed — redirect to login
        router.push('/login');
        return;
      }

      // Redirect based on role
      if (role === 'LANDLORD') {
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
    <div className="w-full max-w-md bg-[#FAFAFA] rounded-2xl border border-[#E5E0D8] p-8 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[#231F20] text-[#B86A36] flex items-center justify-center mx-auto border border-[#B86A36]/30 shadow">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#231F20]">
          Create ZkRent Account
        </h1>
        <p className="text-xs text-[#3D3531]">
          Join the privacy-first rental protocol powered by Midnight Network.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700 font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
        {/* Role Picker */}
        <div className="space-y-2">
          <label className="block text-[#3D3531] font-semibold">I want to use ZkRent as a:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('TENANT')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                role === 'TENANT'
                  ? 'bg-[#231F20] text-white border-[#231F20] shadow'
                  : 'bg-white text-[#231F20] border-[#E5E0D8] hover:bg-[#E5E0D8]'
              }`}
            >
              <User className={`w-5 h-5 ${role === 'TENANT' ? 'text-[#00A8E8]' : 'text-[#231F20]'}`} />
              <span className="font-bold">Tenant</span>
              <span className="text-[10px] opacity-75">Apply Privately</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('LANDLORD')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                role === 'LANDLORD'
                  ? 'bg-[#B86A36] text-white border-[#B86A36] shadow'
                  : 'bg-white text-[#231F20] border-[#E5E0D8] hover:bg-[#E5E0D8]'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span className="font-bold">Landlord</span>
              <span className="text-[10px] opacity-75">List for Free</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[#3D3531] mb-1 font-semibold">Display Name (optional)</label>
          <input
            type="text"
            value={displayName}
            placeholder="Your name"
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
          />
        </div>

        <div>
          <label className="block text-[#3D3531] mb-1 font-semibold">Email Address</label>
          <input
            type="email"
            value={email}
            placeholder="you@domain.com"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
          />
        </div>

        <div>
          <label className="block text-[#3D3531] mb-1 font-semibold">Password</label>
          <input
            type="password"
            value={password}
            placeholder="••••••••••••"
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
          />
        </div>

        <div>
          <label className="block text-[#3D3531] mb-1 font-semibold">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            placeholder="••••••••••••"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-[#231F20]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-lg bg-[#00A8E8] hover:bg-[#0277BD] text-white font-bold text-xs font-mono transition-colors shadow flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          {!loading && <ArrowRight className="w-4 h-4 text-[#B86A36]" />}
        </button>
      </form>

      <div className="text-center pt-2 text-xs font-mono text-[#3D3531]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#B86A36] font-bold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
