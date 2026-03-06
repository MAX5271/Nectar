import { dietService } from "../services/dietService.js";
import StatusCode from "../utils/statusCodes.js";
class DietController {
    async dietPlan(req, res) {
        try {
            const userId = req.id;
            const result = await dietService.dietResponse(userId);
            res.status(StatusCode.SUCCESS).json({
                result: result,
            });
        }
        catch (e) {
            console.log(e);
        }
    }
    async getLatestDietPlan(req, res) {
        try {
            const userId = req.id;
            const result = await dietService.getLatestDietPlan(userId);
            res.status(StatusCode.SUCCESS).json({
                result: result,
            });
        }
        catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                response: {},
            });
            console.log(error);
        }
    }
    async getDietPlanById(req, res) {
        try {
            const dietPlanId = req.params.id;
            const result = await dietService.getDietPlanById(dietPlanId);
            res.status(StatusCode.SUCCESS).json({
                result: result,
            });
        }
        catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                response: {},
            });
            console.log(error);
        }
    }
    async getDietPlanHistory(req, res) {
        try {
            const userId = req.id;
            const result = await dietService.getDietPlanHistory(userId);
            res.status(StatusCode.SUCCESS).json({
                result: result,
            });
        }
        catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                response: {},
            });
            console.log(error);
        }
    }
}
export const dietController = new DietController();
//# sourceMappingURL=dietController.js.map