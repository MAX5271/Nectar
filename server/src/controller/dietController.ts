import { dietService } from "../services/dietService.js";
import type { Response, Request } from "express";

class DietController {
  async dietPlan(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.id;
      const result = await dietService.dietResponse(userId as string);
      res.status(200).json({
        result: result,
      });
    } catch (e) {
      console.log(e);
    }
  }
  async getLatestDietPlan(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.id;
      const result = await dietService.getLatestDietPlan(userId as string);
      res.status(200).json({
        result: result,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getDietPlanHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.id;
      const result = await dietService.getDietPlanHistory(userId as string);
      res.status(200).json({
        result: result,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export const dietController = new DietController();
