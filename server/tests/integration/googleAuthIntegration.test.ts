import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Google Auth Integration Tests", () => {
  it("rejects POST /api/auth/google with missing token with 400", async () => {
    const res = await request(app).post("/api/auth/google").send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects invalid Google token with 401", async () => {
    const res = await request(app)
      .post("/api/auth/google")
      .send({ idToken: "invalid-google-token" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
