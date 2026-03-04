import prisma from "../utils/db.js";
import { dietService } from "../services/dietService.js";

class DietRepository {
  async dietPlan(id: string) {
    const response = await dietService.dietPlan(id);
    const newPlanWithMeal = await prisma.dietPlan.create({
      data: response
    });
    return newPlanWithMeal;
  }
}

export const dietRepository = new DietRepository();
