import { userService } from "../services/userService.js";
import type { Request, Response } from "express";

class UserController {
  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password } = req.body;
      const result = await userService.signUp({ email, username, password });
       if(!result) {
            res.status(401).json({
                success: false,
                data: {},
                message: "User already exists"
            });
        }
      res.status(200).json({
        message: "User created successfully",
        response: {
          username: result.username,
          email:result.email,
          id:result.id
        },
      });
    } catch (error) {
      res.status(402).json({
        message: error,
      });
    }
  }
}

export const userController = new UserController();
