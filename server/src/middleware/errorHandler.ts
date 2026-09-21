import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";
import StatusCode from "../utils/statusCodes.js";
import { logger } from "../utils/logger.js";

// Express 5 forwards rejected promises from async handlers here.
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ success: false, message: error.message });
    return;
  }

  if (error instanceof ZodError) {
    const message = error.issues
      .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
      .join("; ");
    res.status(StatusCode.BAD_REQUEST).json({ success: false, message });
    return;
  }

  // Prisma unique constraint violation (e.g. duplicate email or daily plan race)
  if ((error as { code?: string })?.code === "P2002") {
    const target = String(
      (error as { meta?: { target?: unknown } })?.meta?.target ?? "",
    );
    let message = "A conflicting resource already exists.";
    if (target.includes("email")) {
      message = "Email already in use.";
    } else if (target.includes("date") || target.includes("userId")) {
      message = "You have already generated a plan today.";
    }
    res.status(StatusCode.CONFLICT).json({ success: false, message });
    return;
  }

  logger.error({ err: error }, "Unhandled server error");
  res
    .status(StatusCode.INTERNAL_SERVER_ERROR)
    .json({ success: false, message: "Internal server error" });
}
