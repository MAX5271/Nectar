import { dietService } from "../services/dietService.js";
import type { Response, Request } from "express";
import StatusCode from "../utils/statusCodes.js";

class DietController {
  async dietPlan(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.id;
      const result = await dietService.dietResponse(userId as string);
      res.status(StatusCode.SUCCESS).json({
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
      res.status(StatusCode.SUCCESS).json({
        result: result,
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
        response: {},
      });
      console.log(error);
    }
  }

  async getDietPlanById(req: Request, res: Response): Promise<void> {
    try {
      const dietPlanId = req.params.id;
      const result = await dietService.getDietPlanById(dietPlanId as string);
      res.status(StatusCode.SUCCESS).json({
        result: result,
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
        response: {},
      });
      console.log(error);
    }
  }

  async getDietPlanHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.id;
      const result = await dietService.getDietPlanHistory(userId as string);
      res.status(StatusCode.SUCCESS).json({
        result: result,
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
        response: {},
      });
      console.log(error);
    }
  }
}

export const dietController = new DietController();
