interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetSeconds: number;
}

const memoryStore = new Map<string, { count: number; resetAt: number }>();

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 8;

export async function rateLimit(key: string): Promise<RateLimitResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    return redisRateLimit(key, redisUrl, redisToken);
  }

  const now = Date.now();
  const resetAt = now + WINDOW_SECONDS * 1000;
  const current = memoryStore.get(key);

  if (!current || current.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt });
    return { ok: true, remaining: MAX_REQUESTS - 1, resetSeconds: WINDOW_SECONDS };
  }

  current.count += 1;
  const remaining = Math.max(0, MAX_REQUESTS - current.count);
  return {
    ok: current.count <= MAX_REQUESTS,
    remaining,
    resetSeconds: Math.ceil((current.resetAt - now) / 1000)
  };
}

async function redisRateLimit(key: string, url: string, token: string): Promise<RateLimitResult> {
  const redisKey = `rl:${key}`;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const incr = await fetch(`${url}/incr/${redisKey}`, { headers, cache: "no-store" });
  const count = Number(await incr.text());

  if (count === 1) {
    await fetch(`${url}/expire/${redisKey}/${WINDOW_SECONDS}`, { headers, cache: "no-store" });
  }

  return {
    ok: count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - count),
    resetSeconds: WINDOW_SECONDS
  };
}
