import { userService } from "../services/userService.js";
import type { Request, Response } from "express";
import StatusCode from "../utils/statusCodes.js";
import { signUpSchema } from "../utils/validation.js";
import { REFRESH_COOKIE, refreshCookieOptions } from "../utils/cookie.js";

class UserController {
  async signUp(req: Request, res: Response): Promise<void> {
    const input = signUpSchema.parse(req.body);
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip || req.socket.remoteAddress;
    const result = await userService.signUp(input, { userAgent, ipAddress });

    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions);
    res.status(StatusCode.CREATED).json({
      success: true,
      message: "User created successfully",
      data: {
        id: result.id,
        username: result.username,
        email: result.email,
        accessToken: result.accessToken,
      },
    });
  }

  async getUserProfile(req: Request, res: Response): Promise<void> {
    const result = await userService.getUserProfile(req.id as string);
    res.status(StatusCode.SUCCESS).json({ success: true, data: result });
  }
}

export const userController = new UserController();
