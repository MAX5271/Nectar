import type { Response, Request } from "express";
declare class DietController {
    dietPlan(req: Request, res: Response): Promise<void>;
    getLatestDietPlan(req: Request, res: Response): Promise<void>;
    getDietPlanById(req: Request, res: Response): Promise<void>;
    getDietPlanHistory(req: Request, res: Response): Promise<void>;
}
export declare const dietController: DietController;
export {};
//# sourceMappingURL=dietController.d.ts.map