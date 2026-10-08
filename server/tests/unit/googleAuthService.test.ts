import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { googleAuthService } from "../../src/services/googleAuthService.js";
import { config } from "../../src/config.js";

describe("GoogleAuthService", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("throws BAD_REQUEST when idToken is empty", async () => {
    await expect(googleAuthService.verifyIdToken("")).rejects.toThrow("Missing Google ID token.");
  });

  it("successfully parses a valid Google token payload", async () => {
    const mockPayload = {
      iss: "https://accounts.google.com",
      sub: "123456789",
      email: "user@example.com",
      name: "Alex Nutrition",
      picture: "https://example.com/pic.jpg",
      email_verified: "true",
      aud: config.GOOGLE_CLIENT_ID || "mock-client-id",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    } as any);

    const identity = await googleAuthService.verifyIdToken("mock-valid-jwt");
    expect(identity.email).toBe("user@example.com");
    expect(identity.name).toBe("Alex Nutrition");
    expect(identity.sub).toBe("123456789");
    expect(identity.emailVerified).toBe(true);
  });

  it("rejects token with invalid issuer", async () => {
    const mockPayload = {
      iss: "https://malicious-issuer.com",
      sub: "123456789",
      email: "user@example.com",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    } as any);

    await expect(googleAuthService.verifyIdToken("mock-invalid-jwt")).rejects.toThrow(
      "Invalid Google token issuer."
    );
  });

  it("rejects when Google endpoint returns an error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error_description: "Invalid Value" }),
    } as any);

    await expect(googleAuthService.verifyIdToken("mock-bad-token")).rejects.toThrow(
      "Invalid Value"
    );
  });
});
