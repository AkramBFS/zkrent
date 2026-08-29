'use client';

import React, { useEffect, useState } from 'react';
import {
  motion,
  useReducedMotion,
  HTMLMotionProps,
  Variants,
} from 'framer-motion';

// Luxury Mediterranean easing curve
export const LUXURY_EASE = [0.22, 1, 0.36, 1] as const;

export const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: LUXURY_EASE,
    },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: LUXURY_EASE,
    },
  },
};

export interface FadeInProps extends HTMLMotionProps<'div'> {
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
}

export function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  distance = 14,
  duration = 0.6,
  className = '',
  ...props
}: FadeInProps) {
  const prefersReduced = useReducedMotion();

  const getOffset = () => {
    if (prefersReduced || direction === 'none') return { x: 0, y: 0 };
    switch (direction) {
      case 'up':
        return { x: 0, y: distance };
      case 'down':
        return { x: 0, y: -distance };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const offset = getOffset();

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: prefersReduced ? 0.15 : duration,
        delay: prefersReduced ? 0 : delay,
        ease: LUXURY_EASE,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  staggerDelay?: number;
  initialDelay?: number;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  initialDelay = 0.05,
  className = '',
  ...props
}: StaggerContainerProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: prefersReduced ? 0 : staggerDelay,
            delayChildren: prefersReduced ? 0 : initialDelay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
  ...props
}: HTMLMotionProps<'div'>) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: prefersReduced ? 0 : 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: prefersReduced ? 0.15 : 0.55,
            ease: LUXURY_EASE,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionCard({
  children,
  className = '',
  whileHoverScale = 1.012,
  whileHoverY = -3,
  ...props
}: HTMLMotionProps<'div'> & {
  whileHoverScale?: number;
  whileHoverY?: number;
}) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      whileHover={
        prefersReduced
          ? undefined
          : {
              scale: whileHoverScale,
              y: whileHoverY,
              transition: { duration: 0.25, ease: LUXURY_EASE },
            }
      }
      whileTap={
        prefersReduced
          ? undefined
          : {
              scale: 0.99,
              transition: { duration: 0.15 },
            }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionButton({
  children,
  className = '',
  ...props
}: HTMLMotionProps<'button'>) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.button
      whileHover={
        prefersReduced
          ? undefined
          : {
              scale: 1.02,
              transition: { duration: 0.2, ease: LUXURY_EASE },
            }
      }
      whileTap={
        prefersReduced
          ? undefined
          : {
              scale: 0.98,
              transition: { duration: 0.1 },
            }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function AnimatedNumber({
  value,
  duration = 1.2,
  prefix = '',
  suffix = '',
  className = '',
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(prefersReduced ? value : 0);

  useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const startTime = performance.now();
    const durationMs = duration * 1000;

    const frame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Easing out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    const rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration, prefersReduced]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
