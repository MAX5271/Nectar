import rateLimit from "express-rate-limit";

// Benchmarks (docs/PERFORMANCE.md) disable limiting so they measure the app and
// not the limiter. The switch is ignored in production.
const disabled =
  process.env.RATE_LIMIT_DISABLED === "true" &&
  process.env.NODE_ENV !== "production";

if (disabled) console.warn("[SERVER] Rate limiting is DISABLED (benchmark mode).");

const skip = () => disabled;

export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, skip });

// Each generation is a paid Gemini call.
export const generateLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, skip });
