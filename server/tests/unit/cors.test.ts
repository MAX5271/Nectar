import { describe, it, expect } from "vitest";
import express from "express";
import cors from "cors";
import request from "supertest";
import { getAllowedOrigins } from "../../src/app.js";

describe("CORS Origin Resolution & Security", () => {
  it("restricts production origins exclusively to configured CLIENT_URL", () => {
    const prodOrigins = getAllowedOrigins("production", "https://nectar.app");
    expect(prodOrigins).toEqual(["https://nectar.app"]);
    expect(prodOrigins).not.toContain("http://localhost:5173");
  });

  it("returns empty array in production if CLIENT_URL is undefined", () => {
    const prodOrigins = getAllowedOrigins("production", undefined);
    expect(prodOrigins).toEqual([]);
    expect(prodOrigins).not.toContain("http://localhost:5173");
  });

  it("permits localhost:5173 in development mode", () => {
    const devOrigins = getAllowedOrigins("development", undefined);
    expect(devOrigins).toContain("http://localhost:5173");
  });

  it("allows both configured origin and localhost in development", () => {
    const devOrigins = getAllowedOrigins("development", "https://dev.nectar.app");
    expect(devOrigins).toEqual(["https://dev.nectar.app", "http://localhost:5173"]);
  });

  describe("CORS HTTP Header Enforcement", () => {
    const prodApp = express();
    prodApp.use(
      cors({
        origin: getAllowedOrigins("production", "https://nectar.app"),
        credentials: true,
      }),
    );
    prodApp.get("/test", (_req, res) => {
      res.json({ ok: true });
    });

    it("allows configured production origin with credentials header", async () => {
      const res = await request(prodApp)
        .get("/test")
        .set("Origin", "https://nectar.app");

      expect(res.status).toBe(200);
      expect(res.headers["access-control-allow-origin"]).toBe("https://nectar.app");
      expect(res.headers["access-control-allow-credentials"]).toBe("true");
    });

    it("rejects localhost:5173 in production by omitting Access-Control-Allow-Origin", async () => {
      const res = await request(prodApp)
        .get("/test")
        .set("Origin", "http://localhost:5173");

      expect(res.status).toBe(200);
      expect(res.headers["access-control-allow-origin"]).toBeUndefined();
    });

    it("rejects untrusted third-party origins in production", async () => {
      const res = await request(prodApp)
        .get("/test")
        .set("Origin", "https://evil-attacker.com");

      expect(res.status).toBe(200);
      expect(res.headers["access-control-allow-origin"]).toBeUndefined();
    });
  });
});
