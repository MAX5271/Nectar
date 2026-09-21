import { dietRepository } from "../repository/dietRepository.js";
import { userRepository } from "../repository/userRepository.js";
import { dietHelper } from "../utils/dietHelper.js";
import { geminiService } from "./geminiService.js";
import { HttpError } from "../utils/httpError.js";
import StatusCode from "../utils/statusCodes.js";

class DietService {
  async generateDailyPlan(userId: string) {
    const today = dietHelper.todayUTC();

    if (await dietRepository.findPlanByDate(userId, today)) {
      throw new HttpError(
        StatusCode.CONFLICT,
        "You have already generated a plan today.",
      );
    }

    const constraints = await userRepository.getConstraints(userId);
    if (!constraints) {
      throw new HttpError(
        StatusCode.BAD_REQUEST,
        "No biometric profile found for this user.",
      );
    }

    const result = await geminiService.generateAIPDietPlan(constraints);
    return await dietRepository.createPlan({
      date: today,
      totalCalories: result.totalCalories,
      totalProtein: result.totalProtein,
      totalFat: result.totalFats,
      totalCarbs: result.totalCarbs,
      userId,
      diets: {
        create: result.meals.map((m) => dietHelper.dietFormater(m)),
      },
    });
  }

  async getDietPlanById(planId: string, userId: string) {
    const plan = await dietRepository.getDietPlanById(planId, userId);
    if (!plan) throw new HttpError(StatusCode.NOT_FOUND, "Diet plan not found.");
    return plan;
  }

  getLatestDietPlan(userId: string) {
    return dietRepository.getLatestDietPlan(userId);
  }

  getDietPlanHistory(userId: string) {
    return dietRepository.getDietPlanHistory(userId);
  }
}

export const dietService = new DietService();
