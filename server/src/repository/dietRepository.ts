import type { Prisma } from "@prisma/client";
import prisma from "../utils/db.js";

function withDietCompat<T extends { diets: Array<{ mealType: string }> }>(plan: T | null): T | null {
  if (!plan) return null;
  return {
    ...plan,
    diets: plan.diets.map((d) => ({
      ...d,
      type: d.mealType,
    })),
  };
}

class DietRepository {
  async createPlan(data: Prisma.DietPlanUncheckedCreateInput) {
    const plan = await prisma.dietPlan.create({ data, include: { diets: true } });
    return withDietCompat(plan);
  }

  async findPlanByDate(userId: string, date: Date) {
    return await prisma.dietPlan.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });
  }

  async getLatestDietPlan(userId: string) {
    const plan = await prisma.dietPlan.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
      include: { diets: true },
    });
    return withDietCompat(plan);
  }

  // Scoped by userId so one user can't read another's plan by guessing an id.
  async getDietPlanById(planId: string, userId: string) {
    const plan = await prisma.dietPlan.findFirst({
      where: { id: planId, userId },
      include: { diets: true },
    });
    return withDietCompat(plan);
  }

  async getDietPlanHistory(userId: string) {
    const plans = await prisma.dietPlan.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 7,
      include: { diets: true },
    });
    return plans.map((p) => withDietCompat(p)!);
  }
}

export const dietRepository = new DietRepository();
