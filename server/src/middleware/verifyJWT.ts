import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

import { config } from "../config.js";

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

interface TokenPayload {
  id: string;
}

class VerifyJWT {
  verifyJWT(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization failed" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Token missing" });
    }

    try {
      const payload = jwt.verify(
        token,
        config.ACCESS_TOKEN_SECRET,
      ) as TokenPayload;
      req.id = payload.id;
      next();
    } catch {
      // 401 (not 403) so the client knows to try a refresh
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }
  }
}

export const verifyJWT = new VerifyJWT();
