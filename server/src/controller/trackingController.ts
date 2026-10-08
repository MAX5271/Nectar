import type { Request, Response } from "express";
import { trackingService } from "../services/trackingService.js";
import { logWeightSchema, logMealSchema, trendQuerySchema } from "../utils/validation.js";
import StatusCode from "../utils/statusCodes.js";

class TrackingController {
  async logWeight(req: Request, res: Response): Promise<void> {
    const input = logWeightSchema.parse(req.body);
    const result = await trackingService.logWeight(req.id as string, input);

    res.status(StatusCode.CREATED).json({
      success: true,
      message: "Weight logged successfully",
      data: result,
    });
  }

  async getWeightTrend(req: Request, res: Response): Promise<void> {
    const { days } = trendQuerySchema.parse(req.query);
    const result = await trackingService.getWeightTrend(req.id as string, days ?? 60);

    res.status(StatusCode.SUCCESS).json({
      success: true,
      data: result,
    });
  }

  async logMeal(req: Request, res: Response): Promise<void> {
    const input = logMealSchema.parse(req.body);
    const result = await trackingService.logMeal(req.id as string, input);

    res.status(StatusCode.CREATED).json({
      success: true,
      message: "Meal logged successfully",
      data: result,
    });
  }

  async getDailyMealLogs(req: Request, res: Response): Promise<void> {
    const dateStr = req.query.date as string | undefined;
    const result = await trackingService.getDailyMealLogs(req.id as string, dateStr);

    res.status(StatusCode.SUCCESS).json({
      success: true,
      data: result,
    });
  }

  async getMealAdherenceTrend(req: Request, res: Response): Promise<void> {
    const { days } = trendQuerySchema.parse(req.query);
    const result = await trackingService.getMealAdherenceTrend(req.id as string, days ?? 30);

    res.status(StatusCode.SUCCESS).json({
      success: true,
      data: result,
    });
  }
}

export const trackingController = new TrackingController();
