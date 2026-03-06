import { access } from "node:fs";
import { userService } from "../services/userService.js";
import type { Request, Response } from "express";

class UserController {
  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const { 
        email, username, password, authProvider, height, weight, 
        age, gender, planType, unitSystem, preferences 
      } = req.body;

      const result = await userService.signUp({ 
        email, username, password, authProvider, height, weight, 
        age, gender, planType, unitSystem, preferences 
      });

      res.cookie("jwt", result.refreshToken, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: "strict",
          httpOnly: true,
          secure: true,
        });

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          id: result.id,
          username: result.username,
          email: result.email,
          accessToken: result.accessToken,
        },
      });
    } catch (error: any) {
      const status = error.message === "Email already in use." ? 409 : 400;
      res.status(status).json({
        success: false,
        message: error.message || "An unexpected error occurred",
      });
    }
  }

  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.id as string;
      const result = await userService.getUserProfile(userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : "User not found",
      });
    }
  }
}

export const userController = new UserController();