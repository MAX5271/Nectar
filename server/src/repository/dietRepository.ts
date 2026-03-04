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

async getLatestDietPlan(userId: string) {
  return await prisma.dietPlan.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
    include: { diets: true }
  });
}

async getDietPlanHistory(userId: string) {
  return await prisma.dietPlan.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 7,
    include: { diets: true }
  });
}

}

export const dietRepository = new DietRepository();
