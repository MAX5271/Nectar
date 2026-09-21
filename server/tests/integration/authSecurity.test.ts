import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Auth & Guardrail Integration Tests", () => {
  it("rejects login with non-existent credentials with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent_user_xyz@test.com", password: "wrongpassword123" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  it("rejects signup with malformed email or missing fields with 400", async () => {
    const res = await request(app)
      .post("/api/user/signup")
      .send({
        email: "not-an-email",
        password: "short",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects protected diet routes without Bearer token with 401", async () => {
    const res = await request(app).get("/api/diet/latest");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/authorization failed/i);
  });

  it("rejects diet plan by id when provided an invalid Bearer token", async () => {
    const res = await request(app)
      .get("/api/diet/some-plan-id")
      .set("Authorization", "Bearer invalid.jwt.token");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid or expired token/i);
  });

  it("rejects refresh when no refresh cookie is present", async () => {
    const res = await request(app).get("/api/auth/refresh");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/refresh token not found/i);
  });
});
