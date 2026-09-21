import rateLimit from "express-rate-limit";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

// Benchmarks (docs/PERFORMANCE.md) disable limiting so they measure the app and
// not the limiter. The switch is ignored in production.
const disabled = config.RATE_LIMIT_DISABLED && config.NODE_ENV !== "production";

if (disabled) logger.warn("Rate limiting is DISABLED (benchmark mode).");

const skip = () => disabled;

export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, skip });

// Each generation is a paid Gemini call.
export const generateLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, skip });
