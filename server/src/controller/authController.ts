import { authService } from "../services/authService.js";
import type { Request, Response } from "express";

class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    {
      try {
        const { email, password } = req.body;
        const { accessToken, refreshToken, username, id } =
          await authService.login({ email, password });
        if (!id) {
          res.status(403).json({
            message: "Invalid email or password.",
            response: {},
          });
          return;
        }
        res.cookie("jwt", refreshToken, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: "strict",
          httpOnly: true,
          secure: true,
        });
        res.status(200).json({
          message: "User successfully logged-in",
          response: {
            accessToken,
            username,
            email,
            id,
          },
        });
      } catch (error) {
        res.status(404).json({
          message: "Internal server error",
          response: {},
        });
      }
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const cookie = req.cookies;
      if (!cookie?.jwt) {
        res.status(403).json({
          message: "Refresh Token not found",
          response: {},
        });
        return;
      }

      const result = await authService.refreshToken(cookie.jwt);
      res.json(result);
    } catch (error) {
      res.status(404).json({
        message: "Internal server error",
        response: {},
      });
    }
  }
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.id as string;
      await authService.logout(userId);
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });
      res.status(200).json({
        message: "User successfully logged out",
        response: {},
      });
    } catch (error) {
      res.status(404).json({
        message: "Internal server error",
        response: {},
      });
    }
  }
}

export const authController = new AuthController();
