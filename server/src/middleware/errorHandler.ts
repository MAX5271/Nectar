import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";
import StatusCode from "../utils/statusCodes.js";

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

  // Prisma unique constraint violation (e.g. duplicate email under a race)
  if ((error as { code?: string })?.code === "P2002") {
    res
      .status(StatusCode.CONFLICT)
      .json({ success: false, message: "Email already in use." });
    return;
  }

  console.error("[SERVER] Unhandled error:", error);
  res
    .status(StatusCode.INTERNAL_SERVER_ERROR)
    .json({ success: false, message: "Internal server error" });
}
