import rateLimit from "express-rate-limit";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

// Benchmarks (docs/PERFORMANCE.md) disable limiting so they measure the app and
// not the limiter. The switch is ignored in production.
const disabled = config.RATE_LIMIT_DISABLED && config.NODE_ENV !== "production";

if (disabled) logger.warn("Rate limiting is DISABLED (benchmark mode).");

const skip = () => disabled;

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts, please try again later." },
  skip,
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.REFRESH_LIMIT_PER_15M,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many token refresh attempts, please try again later." },
  skip,
});

// Each generation is a paid Gemini call (full day plan).
export const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Plan generation limit reached (10 per hour). Please try again later." },
  skip,
});

// Single-meal swap calls Gemini (1 replacement meal).
export const swapLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: config.SWAP_LIMIT_PER_HOUR,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Meal swap limit reached for this hour. Please try again later." },
  skip,
});
