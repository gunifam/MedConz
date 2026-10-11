import { createHash, randomBytes } from "node:crypto";

export function makeShareCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no look-alikes
  const bytes = randomBytes(6);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

export function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

// In-memory throttles. Single server local dev — move to Redis for prod.
const buckets = new Map<string, { n: number; reset: number }>();
export function throttle(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  b.n++;
  return b.n <= limit;
}
