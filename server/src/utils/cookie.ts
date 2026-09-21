const isProd = process.env.NODE_ENV === "production";

export const REFRESH_COOKIE = "jwt";

// In production the client and API live on different sites (Vercel vs. API host),
// so the cookie must be SameSite=None (which requires Secure).
const base = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
};

export const refreshCookieOptions = {
  ...base,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const clearCookieOptions = base;
