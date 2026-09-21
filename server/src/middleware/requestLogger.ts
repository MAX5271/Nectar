import { pinoHttp } from "pino-http";
import crypto from "node:crypto";
import { logger } from "../utils/logger.js";

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existing = req.headers["x-request-id"];
    const id =
      (Array.isArray(existing) ? existing[0] : existing) || crypto.randomUUID();
    res.setHeader("X-Request-ID", id);
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req, res, responseTime) => {
    return `${req.method} ${req.url} -> ${res.statusCode} (${responseTime.toFixed(1)}ms)`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} -> ${res.statusCode} (${err.message})`;
  },
  autoLogging: {
    ignore: (req) => req.url === "/health" || req.url === "/health/",
  },
});
