import { dietService } from "../services/dietService.js";
import type { Response, Request } from "express";
import StatusCode from "../utils/statusCodes.js";
import { mealSwapSchema, trendQuerySchema } from "../utils/validation.js";

class DietController {
  async dietPlan(req: Request, res: Response): Promise<void> {
    const result = await dietService.generateDailyPlan(req.id as string);
    res.status(StatusCode.CREATED).json({
      success: true,
      data: result,
      result, // backwards compatibility
    });
  }

  async getLatestDietPlan(req: Request, res: Response): Promise<void> {
    const result = await dietService.getLatestDietPlan(req.id as string);
    res.status(StatusCode.SUCCESS).json({
      success: true,
      data: result,
      result, // backwards compatibility
    });
  }

  async getDietPlanById(req: Request, res: Response): Promise<void> {
    const result = await dietService.getDietPlanById(
      req.params.id as string,
      req.id as string,
    );
    res.status(StatusCode.SUCCESS).json({
      success: true,
      data: result,
      result, // backwards compatibility
    });
  }

  async getDietPlanHistory(req: Request, res: Response): Promise<void> {
    // "days" here means "most recent N plans" (matches the existing behavior), not a calendar-day window —
    // a user can skip days without generating a plan, so it's a row limit, not a date filter.
    const { days } = trendQuerySchema.parse(req.query);
    const result = await dietService.getDietPlanHistory(req.id as string, days);
    res.status(StatusCode.SUCCESS).json({
      success: true,
      data: result,
      result, // backwards compatibility
    });
  }

  async explainPlan(req: Request, res: Response): Promise<void> {
    const result = await dietService.explainPlan(req.id as string);
    res.status(StatusCode.SUCCESS).json({
      success: true,
      data: result,
    });
  }

  async swapMeal(req: Request, res: Response): Promise<void> {
    const { dietId, reason } = mealSwapSchema.parse(req.body);
    const result = await dietService.swapMeal(req.id as string, dietId, reason);
    res.status(StatusCode.SUCCESS).json({
      success: true,
      message: "Meal successfully swapped",
      data: result,
    });
  }
}

export const dietController = new DietController();

