import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Guest Auth Integration Tests", () => {
  it("rejects POST /auth/guest with no token with 400", async () => {
    const res = await request(app).post("/api/auth/guest").send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects invalid guest token with 401 (or 503 if Supabase unconfigured)", async () => {
    const res = await request(app)
      .post("/api/auth/guest")
      .send({ supabaseAccessToken: "not-a-real-token" });

    expect([401, 503]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});
