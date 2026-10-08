import { config } from "../config.js";
import { HttpError } from "../utils/httpError.js";
import StatusCode from "../utils/statusCodes.js";

export interface GoogleIdentity {
  email: string;
  name?: string | null;
  sub: string;
  picture?: string | null;
  emailVerified: boolean;
}

class GoogleAuthService {
  /**
   * Verifies a Google ID token directly against Google's public tokeninfo endpoint.
   */
  async verifyIdToken(idToken: string): Promise<GoogleIdentity> {
    if (!idToken) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Missing Google ID token.");
    }

    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new HttpError(
          StatusCode.UNAUTHORIZED,
          (errorData as any)?.error_description || "Invalid or expired Google token."
        );
      }

      const payload = (await response.json()) as Record<string, any>;

      // Verify issuer
      const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
      if (!validIssuers.includes(payload.iss)) {
        throw new HttpError(StatusCode.UNAUTHORIZED, "Invalid Google token issuer.");
      }

      // Verify audience if configured in server environment
      if (config.GOOGLE_CLIENT_ID && payload.aud !== config.GOOGLE_CLIENT_ID) {
        throw new HttpError(StatusCode.UNAUTHORIZED, "Google token audience mismatch.");
      }

      const email = payload.email;
      if (!email) {
        throw new HttpError(StatusCode.BAD_REQUEST, "Google account does not have an email associated.");
      }

      return {
        email,
        name: payload.name || payload.given_name || null,
        sub: payload.sub,
        picture: payload.picture || null,
        emailVerified: payload.email_verified === "true" || payload.email_verified === true,
      };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(StatusCode.UNAUTHORIZED, err?.message || "Google authentication failed.");
    }
  }

  /**
   * Verifies a Google access token against Google's userinfo endpoint.
   */
  async verifyAccessToken(accessToken: string): Promise<GoogleIdentity> {
    if (!accessToken) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Missing Google access token.");
    }

    try {
      const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new HttpError(StatusCode.UNAUTHORIZED, "Invalid or expired Google access token.");
      }

      const payload = (await response.json()) as Record<string, any>;
      const email = payload.email;
      if (!email) {
        throw new HttpError(StatusCode.BAD_REQUEST, "Google account does not have an email associated.");
      }

      return {
        email,
        name: payload.name || payload.given_name || null,
        sub: payload.sub,
        picture: payload.picture || null,
        emailVerified: payload.email_verified === "true" || payload.email_verified === true,
      };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(StatusCode.UNAUTHORIZED, err?.message || "Google authentication failed.");
    }
  }

  /**
   * Automatically detects token type (JWT ID token vs OAuth access token) and verifies it.
   */
  async verifyToken(token: string): Promise<GoogleIdentity> {
    if (token.split(".").length === 3) {
      return this.verifyIdToken(token);
    }
    return this.verifyAccessToken(token);
  }
}

export const googleAuthService = new GoogleAuthService();
