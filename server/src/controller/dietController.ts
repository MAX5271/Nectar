import { dietService } from "../services/dietService.js";
import type { Response, Request } from "express";
import StatusCode from "../utils/statusCodes.js";

class DietController {
  async dietPlan(req: Request, res: Response): Promise<void> {
    const result = await dietService.generateDailyPlan(req.id as string);
    res.status(StatusCode.CREATED).json({ result });
  }

  async getLatestDietPlan(req: Request, res: Response): Promise<void> {
    const result = await dietService.getLatestDietPlan(req.id as string);
    res.status(StatusCode.SUCCESS).json({ result });
  }

  async getDietPlanById(req: Request, res: Response): Promise<void> {
    const result = await dietService.getDietPlanById(
      req.params.id as string,
      req.id as string,
    );
    res.status(StatusCode.SUCCESS).json({ result });
  }

  async getDietPlanHistory(req: Request, res: Response): Promise<void> {
    const result = await dietService.getDietPlanHistory(req.id as string);
    res.status(StatusCode.SUCCESS).json({ result });
  }
}

export const dietController = new DietController();
