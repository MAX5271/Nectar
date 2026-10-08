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

  async getDietPlanHistory(userId: string, limit = 7) {
    const plans = await prisma.dietPlan.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: limit,
      include: { diets: true },
    });
    return plans.map((p) => withDietCompat(p)!);
  }

  async findMealWithPlan(dietId: string) {
    return await prisma.diet.findUnique({
      where: { id: dietId },
      include: { dietPlan: true },
    });
  }

  async updateMealAndRecalculateTotals(
    dietId: string,
    planId: string,
    data: Prisma.DietUpdateInput,
  ) {
    // 1. Update the individual meal
    const updatedDiet = await prisma.diet.update({
      where: { id: dietId },
      data,
    });

    // 2. Fetch all meals for this plan to compute new exact totals
    const allMeals = await prisma.diet.findMany({
      where: { dietPlanId: planId },
    });

    const sum = (key: "calories" | "protein" | "carb" | "fat") =>
      Math.round(allMeals.reduce((acc, m) => acc + m[key], 0));

    // 3. Update parent DietPlan totals
    const updatedPlan = await prisma.dietPlan.update({
      where: { id: planId },
      data: {
        totalCalories: sum("calories"),
        totalProtein: sum("protein"),
        totalCarbs: sum("carb"),
        totalFat: sum("fat"),
      },
      include: { diets: true },
    });

    return {
      meal: { ...updatedDiet, type: updatedDiet.mealType },
      plan: withDietCompat(updatedPlan)!,
    };
  }
}

export const dietRepository = new DietRepository();

