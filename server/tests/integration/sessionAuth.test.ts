import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { REFRESH_COOKIE } from "../../src/utils/cookie.js";

describe("Session & Token Rotation Integration Tests", () => {
  const testUser = {
    email: `session_test_${Date.now()}@example.com`,
    password: "Password123!",
    username: "SessionTester",
    age: 25,
    height: 175,
    weight: 70,
    gender: "MALE",
    planType: "CUTTING",
    unitSystem: "METRIC",
    preferences: "None",
  };

  function extractCookie(res: request.Response, cookieName: string): string | undefined {
    const cookies = res.headers["set-cookie"];
    if (!cookies) return undefined;
    const cookieHeader = Array.isArray(cookies) ? cookies : [cookies];
    for (const c of cookieHeader) {
      if (c.startsWith(`${cookieName}=`)) {
        return c.split(";")[0].split("=")[1];
      }
    }
    return undefined;
  }

  it("creates a session on signup and sets HttpOnly refresh cookie", async () => {
    const res = await request(app)
      .post("/api/user/signup")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();

    const refreshCookie = extractCookie(res, REFRESH_COOKIE);
    expect(refreshCookie).toBeDefined();
  });

  it("allows login from multiple devices, each receiving their own session", async () => {
    // Device 1
    const res1 = await request(app)
      .post("/api/auth/login")
      .set("User-Agent", "MobileApp/1.0")
      .send({ email: testUser.email, password: testUser.password });

    expect(res1.status).toBe(200);
    const token1 = res1.body.data.accessToken;
    const refresh1 = extractCookie(res1, REFRESH_COOKIE);

    // Device 2
    const res2 = await request(app)
      .post("/api/auth/login")
      .set("User-Agent", "ChromeBrowser/120.0")
      .send({ email: testUser.email, password: testUser.password });

    expect(res2.status).toBe(200);
    const refresh2 = extractCookie(res2, REFRESH_COOKIE);
    expect(refresh1).not.toBe(refresh2);

    // Verify session listing
    const sessionsRes = await request(app)
      .get("/api/auth/sessions")
      .set("Authorization", `Bearer ${token1}`);

    expect(sessionsRes.status).toBe(200);
    expect(sessionsRes.body.success).toBe(true);
    expect(sessionsRes.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it("rotates refresh token on refresh and detects reuse breaches", async () => {
    // Login to get a fresh token
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    const initialRefresh = extractCookie(loginRes, REFRESH_COOKIE)!;

    // First refresh: valid, should rotate
    const refreshRes1 = await request(app)
      .get("/api/auth/refresh")
      .set("Cookie", `${REFRESH_COOKIE}=${initialRefresh}`);

    expect(refreshRes1.status).toBe(200);
    expect(refreshRes1.body.success).toBe(true);
    expect(refreshRes1.body.accessToken).toBeDefined();

    const rotatedRefresh = extractCookie(refreshRes1, REFRESH_COOKIE);
    expect(rotatedRefresh).toBeDefined();
    expect(rotatedRefresh).not.toBe(initialRefresh);

    // REUSE DETECTION: Re-using the initial (now rotated) token must trigger reuse detection
    const reuseRes = await request(app)
      .get("/api/auth/refresh")
      .set("Cookie", `${REFRESH_COOKIE}=${initialRefresh}`);

    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.message).toMatch(/reuse detected/i);

    // After reuse detection, all sessions for the user must be revoked
    const afterReuseAttempt = await request(app)
      .get("/api/auth/refresh")
      .set("Cookie", `${REFRESH_COOKIE}=${rotatedRefresh}`);

    expect(afterReuseAttempt.status).toBe(401);
  });

  it("deletes session upon logout", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    const refreshCookie = extractCookie(loginRes, REFRESH_COOKIE)!;

    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", `${REFRESH_COOKIE}=${refreshCookie}`);

    expect(logoutRes.status).toBe(200);

    // Refreshing with logged-out cookie should fail
    const refreshRes = await request(app)
      .get("/api/auth/refresh")
      .set("Cookie", `${REFRESH_COOKIE}=${refreshCookie}`);

    expect(refreshRes.status).toBe(401);
  });
});
