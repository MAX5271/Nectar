import { describe, it, expect } from "vitest";
import express from "express";
import rateLimit from "express-rate-limit";
import request from "supertest";

describe("Rate Limiting Security Tests", () => {
  it("enforces rate limits and returns 429 when threshold is exceeded on swap limiter", async () => {
    const testApp = express();
    testApp.use(express.json());

    // Test limiter configured identically to swapLimiter with small limit for test speed
    const testSwapLimiter = rateLimit({
      windowMs: 60 * 1000,
      limit: 2,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: "Meal swap limit reached for this hour. Please try again later." },
    });

    testApp.post("/api/diet/swap", testSwapLimiter, (_req, res) => {
      res.status(200).json({ success: true, swapped: true });
    });

    // Request 1: Allowed
    const res1 = await request(testApp).post("/api/diet/swap").send({});
    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);

    // Request 2: Allowed
    const res2 = await request(testApp).post("/api/diet/swap").send({});
    expect(res2.status).toBe(200);

    // Request 3: Blocked with 429 Too Many Requests
    const res3 = await request(testApp).post("/api/diet/swap").send({});
    expect(res3.status).toBe(429);
    expect(res3.body.success).toBe(false);
    expect(res3.body.message).toMatch(/meal swap limit reached/i);
    expect(res3.headers["ratelimit-limit"]).toBe("2");
    expect(res3.headers["ratelimit-remaining"]).toBe("0");
  });

  it("enforces rate limits on refresh endpoint and returns 429 with standard headers", async () => {
    const testApp = express();
    testApp.use(express.json());

    const testRefreshLimiter = rateLimit({
      windowMs: 60 * 1000,
      limit: 3,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: "Too many token refresh attempts, please try again later." },
    });

    testApp.post("/api/auth/refresh", testRefreshLimiter, (_req, res) => {
      res.status(200).json({ success: true, accessToken: "new-token" });
    });

    // Fire 3 requests: All succeed
    for (let i = 0; i < 3; i++) {
      const res = await request(testApp).post("/api/auth/refresh").send({});
      expect(res.status).toBe(200);
    }

    // 4th request: Blocked with 429
    const blockedRes = await request(testApp).post("/api/auth/refresh").send({});
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.body.success).toBe(false);
    expect(blockedRes.body.message).toMatch(/too many token refresh attempts/i);
  });
});
