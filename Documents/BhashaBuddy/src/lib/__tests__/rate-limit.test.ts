import { describe, it, expect } from "vitest";
import { rateLimit } from "../rate-limit";

describe("rateLimit", () => {
  it("should allow requests under the threshold", async () => {
    const res = await rateLimit("ip-address-1");
    expect(res.ok).toBe(true);
    expect(res.remaining).toBe(7); // 8 - 1
  });

  it("should block requests once rate limit is exceeded", async () => {
    const key = "ip-address-2";
    
    // Fire 8 allowed requests
    for (let i = 0; i < 8; i++) {
      const res = await rateLimit(key);
      expect(res.ok).toBe(true);
    }

    // 9th request should fail
    const blockedRes = await rateLimit(key);
    expect(blockedRes.ok).toBe(false);
    expect(blockedRes.remaining).toBe(0);
  });
});
