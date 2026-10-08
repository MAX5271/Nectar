import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Supabase Session Auth Integration Tests", () => {
  it("rejects POST /api/auth/supabase-session with no token with 400", async () => {
    const res = await request(app).post("/api/auth/supabase-session").send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects invalid Supabase token with 401 (or 503 if Supabase unconfigured)", async () => {
    const res = await request(app)
      .post("/api/auth/supabase-session")
      .send({ supabaseAccessToken: "invalid-token" });

    expect([401, 503]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});
