import { NextRequest, NextResponse } from 'next/server';

/**
 * In-Memory Sliding Window Rate Limiter
 * 
 * SERVERLESS ARCHITECTURE NOTE:
 * This in-memory limiter maintains state in the process memory.
 * - In long-lived containers (e.g. standalone Docker Node.js deployment):
 *   This provides effective per-instance throttling across requests.
 * - In distributed serverless environments (e.g. AWS Lambda / Vercel Serverless Functions):
 *   Memory is isolated per ephemeral lambda container and does not share state across instances.
 *   For multi-region / distributed serverless clusters, replace the memory store with
 *   Upstash Redis or an external distributed cache.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const store = new Map<string, RateLimitRecord>();

// Cleanup stale keys every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      // Remove timestamps older than 10 minutes
      record.timestamps = record.timestamps.filter((ts) => now - ts < 600000);
      if (record.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 300000);
  if (cleanupTimer && typeof cleanupTimer.unref === 'function') {
    cleanupTimer.unref();
  }
}

export interface RateLimitOptions {
  limit: number;      // Maximum allowed requests within windowMs
  windowMs: number;   // Sliding window size in milliseconds
  prefix?: string;    // Identifier prefix (e.g., 'auth', 'prove', 'upload')
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export function checkRateLimit(identifier: string, options: RateLimitOptions): RateLimitResult {
  const { limit, windowMs, prefix = 'default' } = options;
  const key = `${prefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = store.get(key);
  if (!record) {
    record = { timestamps: [] };
    store.set(key, record);
  }

  // Filter out timestamps outside current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetMs = Math.max(0, oldestTimestamp + windowMs - now);
    return {
      success: false,
      limit,
      remaining: 0,
      resetMs,
    };
  }

  // Record this request timestamp
  record.timestamps.push(now);

  const resetMs = windowMs;
  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    resetMs,
  };
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

export function applyRateLimit(
  req: NextRequest,
  options: RateLimitOptions
): NextResponse | null {
  const clientIp = getClientIp(req);
  const result = checkRateLimit(clientIp, options);

  if (!result.success) {
    const retryAfterSec = Math.ceil(result.resetMs / 1000);
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: `Rate limit exceeded for ${options.prefix || 'requests'}. Please try again in ${retryAfterSec} seconds.`,
        retryAfter: retryAfterSec,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSec),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil((Date.now() + result.resetMs) / 1000)),
        },
      }
    );
  }

  return null;
}
