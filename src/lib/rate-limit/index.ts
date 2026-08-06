/**
 * src/lib/rate-limit/index.ts — Rate Limiting (Server-Side)
 *
 * Rate limiting is enforced server-side via:
 *   1. Supabase Row Level Security policies (DB-level)
 *   2. Next.js Route Handler checks (application-level)
 *
 * No external paid rate-limit service (e.g. Upstash) required for MVP.
 * Can be upgraded to Redis-backed rate limiting in V1.1.
 *
 * Full implementation in Stage 1.
 */

import { MAX_POSTS_PER_DAY, MAX_POSTS_PER_HOUR } from "@/lib/constants";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt?: string;
  reason?: string;
}

/**
 * Check if a user has exceeded their post creation rate limit.
 * Implementation will query Supabase in Stage 1.
 */
export async function checkPostRateLimit(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _userId: string
): Promise<RateLimitResult> {
  // Placeholder — full Supabase query implementation in Stage 1
  return {
    allowed: true,
    remaining: MAX_POSTS_PER_HOUR,
  };
}


export { MAX_POSTS_PER_DAY, MAX_POSTS_PER_HOUR };
