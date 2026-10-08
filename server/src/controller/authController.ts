import { authService } from "../services/authService.js";
import type { Request, Response } from "express";
import StatusCode from "../utils/statusCodes.js";
import { HttpError } from "../utils/httpError.js";
import { loginSchema, googleLoginSchema } from "../utils/validation.js";
import {
  REFRESH_COOKIE,
  clearCookieOptions,
  refreshCookieOptions,
} from "../utils/cookie.js";

class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = loginSchema.parse(req.body);
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip || req.socket.remoteAddress;

    const { accessToken, refreshToken, username, id } =
      await authService.login({ email, password, userAgent, ipAddress });

    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
    res.status(StatusCode.SUCCESS).json({
      success: true,
      message: "User logged in successfully",
      data: { id, username, email, accessToken },
    });
  }

  async googleLogin(req: Request, res: Response): Promise<void> {
    const { idToken, profile } = googleLoginSchema.parse(req.body);
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip || req.socket.remoteAddress;

    const { accessToken, refreshToken, username, id, email } = await authService.loginWithGoogle(
      idToken,
      { userAgent, ipAddress },
      profile,
    );

    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
    res.status(StatusCode.SUCCESS).json({
      success: true,
      message: "Authenticated via Google",
      data: { id, username, email, accessToken },
    });
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      throw new HttpError(StatusCode.UNAUTHORIZED, "Refresh token not found");
    }
    const result = await authService.refreshToken(token);

    // Rotate refresh token cookie
    if (result.refreshToken) {
      res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions);
    }

    res.json({
      success: true,
      username: result.username,
      accessToken: result.accessToken,
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    await authService.logout(req.cookies?.[REFRESH_COOKIE]);
    res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
    res.status(StatusCode.SUCCESS).json({
      success: true,
      message: "User successfully logged out",
    });
  }

  async getSessions(req: Request, res: Response): Promise<void> {
    const userId = req.id as string;
    const currentToken = req.cookies?.[REFRESH_COOKIE];
    const sessions = await authService.getSessions(userId, currentToken);
    res.status(StatusCode.SUCCESS).json({
      success: true,
      data: sessions,
    });
  }

  async revokeSession(req: Request, res: Response): Promise<void> {
    const userId = req.id as string;
    const sessionId = req.params.id as string;
    await authService.revokeSession(userId, sessionId);
    res.status(StatusCode.SUCCESS).json({
      success: true,
      message: "Session successfully revoked",
    });
  }
}

export const authController = new AuthController();

