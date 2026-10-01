import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";
import { applyRateLimit } from "@/lib/rate-limit";

export const GET = handlers.GET;

export async function POST(req: NextRequest) {
  const rateLimitResponse = applyRateLimit(req, { limit: 10, windowMs: 60000, prefix: 'auth' });
  if (rateLimitResponse) return rateLimitResponse;
  return handlers.POST(req);
}
