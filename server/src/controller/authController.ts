import { authService } from "../services/authService.js";
import type { Request, Response } from "express";
import StatusCode from "../utils/statusCodes.js";
import { HttpError } from "../utils/httpError.js";
import { loginSchema } from "../utils/validation.js";
import {
  REFRESH_COOKIE,
  clearCookieOptions,
  refreshCookieOptions,
} from "../utils/cookie.js";

class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = loginSchema.parse(req.body);
    const { accessToken, refreshToken, username, id } =
      await authService.login({ email, password });

    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
    res.status(StatusCode.SUCCESS).json({
      success: true,
      message: "User logged in successfully",
      data: { id, username, email, accessToken },
    });
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      throw new HttpError(StatusCode.UNAUTHORIZED, "Refresh token not found");
    }
    const result = await authService.refreshToken(token);
    res.json({ success: true, ...result });
  }

  async logout(req: Request, res: Response): Promise<void> {
    await authService.logout(req.cookies?.[REFRESH_COOKIE]);
    res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
    res.status(StatusCode.SUCCESS).json({
      success: true,
      message: "User successfully logged out",
    });
  }
}

export const authController = new AuthController();
