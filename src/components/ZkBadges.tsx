'use client';

import React from 'react';
import { ShieldCheck, Check, Sparkles } from 'lucide-react';

interface StampedSealProps {
  status?: 'eligible' | 'ineligible' | 'pending' | 'verified';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  animate?: boolean;
  className?: string;
  subtext?: string;
}

export function StampedSeal({
  status = 'eligible',
  size = 'md',
  animate = false,
  className = '',
  subtext,
}: StampedSealProps) {
  const isEligible = status === 'eligible' || status === 'verified';
  const isIneligible = status === 'ineligible';
  const isPending = status === 'pending';

  const sizeClasses = {
    sm: 'w-24 h-24 text-[10px]',
    md: 'w-36 h-36 text-xs',
    lg: 'w-48 h-48 text-sm',
    hero: 'w-64 h-64 text-base',
  };

  const ringColor = isEligible
    ? 'border-[#AE8B3F] text-[#AE8B3F]'
    : isIneligible
    ? 'border-[#B4483A] text-[#B4483A]'
    : 'border-[#485674] text-[#485674]';

  const innerBg = isEligible
    ? 'bg-[#14213D] border-[#2E7D74]'
    : isIneligible
    ? 'bg-[#14213D] border-[#B4483A]'
    : 'bg-[#14213D] border-[#485674]';

  const textLabel = isEligible ? 'ELIGIBLE' : isIneligible ? 'INELIGIBLE' : 'PENDING';

  return (
    <div
      className={`relative flex items-center justify-center select-none ${sizeClasses[size]} ${
        animate ? 'animate-stamp-snap' : 'rotate-[-1.5deg]'
      } ${className}`}
    >
      {/* Outer Brass Double Ring */}
      <div
        className={`absolute inset-0 rounded-full border-2 border-dashed ${ringColor} opacity-80`}
      />
      <div
        className={`absolute inset-1.5 rounded-full border ${ringColor} opacity-90`}
      />

      {/* Inner Stamp Shield */}
      <div
        className={`relative z-10 w-[84%] h-[84%] rounded-full border-2 ${innerBg} shadow-xl flex flex-col items-center justify-center p-2 text-center`}
      >
        <div className="flex items-center gap-1 mb-0.5 opacity-90">
          <Sparkles className="w-2.5 h-2.5 text-[#4FB3A5]" />
          <span className="font-mono text-[8px] tracking-widest text-[#4FB3A5] uppercase">
            Midnight ZK
          </span>
        </div>

        <div className="my-0.5">
          {isEligible && <Check className="w-6 h-6 text-[#4FB3A5] stroke-[3]" />}
          {isIneligible && <span className="text-xl font-bold text-[#B4483A]">✕</span>}
          {isPending && <ShieldCheck className="w-6 h-6 text-[#AE8B3F]" />}
        </div>

        <div className="font-serif font-extrabold tracking-widest text-white text-xs sm:text-sm">
          {textLabel}
        </div>

        <div className="font-mono text-[7.5px] tracking-tight text-[#8794AD] mt-0.5">
          {subtext || 'SEALED & PROVED'}
        </div>
      </div>
    </div>
  );
}

export function ZkVerifiedBadge({
  label = 'ZK Verified',
  variant = 'teal',
  size = 'md',
}: {
  label?: string;
  variant?: 'teal' | 'brass' | 'dark' | 'outline';
  size?: 'sm' | 'md';
}) {
  const styles = {
    teal: 'bg-[#2E7D74]/15 text-[#1F5751] border-[#2E7D74]/30 dark:bg-[#2E7D74]/30 dark:text-[#4FB3A5] dark:border-[#4FB3A5]/40',
    brass: 'bg-[#AE8B3F]/15 text-[#7E642A] border-[#AE8B3F]/30',
    dark: 'bg-[#14213D] text-[#4FB3A5] border-[#4FB3A5]/30',
    outline: 'border border-[#14213D]/20 text-[#14213D]',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-md border ${styles[variant]} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D74] animate-pulse" />
      {label}
    </span>
  );
}

export function ApplicantIdTag({
  id,
  size = 'md',
}: {
  id: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono tracking-wider bg-[#14213D] text-[#EDECE4] rounded border border-[#14213D]/40 ${sizes[size]}`}
    >
      <span className="text-[#AE8B3F] font-bold">ID</span>
      <span>{id}</span>
    </span>
  );
}
