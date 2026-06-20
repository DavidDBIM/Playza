// Simple in-memory TTL cache for read-heavy, low-volatility endpoints
// (leaderboards, rankings, etc). Not for user-specific or financial data.
//
// Why: under high traffic, hundreds of users can request the exact same
// leaderboard within the same few seconds. Without this, every single
// request re-runs the full ranking query against Supabase. With this,
// only one request per TTL window hits the database — everyone else
// gets the cached result back instantly.

type CacheEntry<T> = { value: T; expiresAt: number }

const store = new Map<string, CacheEntry<any>>()

/**
 * Get a cached value, or compute + cache it if missing/expired.
 * @param key Unique cache key (include all params that affect the result)
 * @param ttlMs How long the cached value stays valid, in milliseconds
 * @param compute Function that fetches the real data (only called on cache miss)
 */
export async function cached<T>(key: string, ttlMs: number, compute: () => Promise<T>): Promise<T> {
  const now = Date.now()
  const hit = store.get(key)
  if (hit && hit.expiresAt > now) {
    return hit.value
  }
  const value = await compute()
  store.set(key, { value, expiresAt: now + ttlMs })
  return value
}

/** Manually clear one cached key (e.g. after an admin action that changes rankings) */
export function invalidate(key: string) {
  store.delete(key)
}

/** Clear all keys starting with a prefix (e.g. invalidatePrefix('leaderboard:loyalty')) */
export function invalidatePrefix(prefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}

// Periodically sweep expired entries so memory doesn't grow unbounded
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) store.delete(key)
  }
}, 60_000)
