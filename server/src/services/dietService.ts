import { dietRepository } from "../repository/dietRepository.js";
import { dietHelper } from "../utils/dietHelper.js";
import { geminiService } from "./geminiService.js";
import { Gender, PlanType, UnitSystem } from "@prisma/client";

class DietService {
  async dietPlan(userId: string) {
    const result = await geminiService.generateAIPDietPlan({
      weight: 88,
      height: 188,
      age: 22,
      preferences: [],
      gender: Gender.MALE,
      unitSystem: UnitSystem.METRIC,
      planType: PlanType.CUTTING,
    });
    const date = new Date();
    const formattedDate = dietHelper.dateFormat(date);
    const prismaDate = dietHelper.dateFormatPrisma(formattedDate);
    const dietResponse = {
      date: prismaDate,
      totalCalories: result.targetCalories,
      totalProtein: result.totalProtein,
      totalFat: result.totalFats,
      totalCarbs: result.totalCarbs,
      userId: userId,
      diets: {
        create: [
          dietHelper.dietFormater(result.meals[0]),
          dietHelper.dietFormater(result.meals[1]),
          dietHelper.dietFormater(result.meals[2]),
          dietHelper.dietFormater(result.meals[3]),
          dietHelper.dietFormater(result.meals[4]),
        ],
      },
    };
    return dietResponse;
  }

  async dietResponse(userId: string) {
    const response = await dietRepository.dietPlan(userId);
    return response;
  }

  async getLatestDietPlan(userId: string) {
    const plan = await dietRepository.getLatestDietPlan(userId);
    return plan || null;
  }

  async getDietPlanHistory(userId: string) {
    const plan = await dietRepository.getDietPlanHistory(userId);
    return plan || null;
  }

}

export const dietService = new DietService();
