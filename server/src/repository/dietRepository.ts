import type { Prisma } from "@prisma/client";
import prisma from "../utils/db.js";

class DietRepository {
  async createPlan(data: Prisma.DietPlanUncheckedCreateInput) {
    return await prisma.dietPlan.create({ data, include: { diets: true } });
  }

  async findPlanByDate(userId: string, date: Date) {
    return await prisma.dietPlan.findFirst({ where: { userId, date } });
  }

  async getLatestDietPlan(userId: string) {
    return await prisma.dietPlan.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
      include: { diets: true },
    });
  }

  // Scoped by userId so one user can't read another's plan by guessing an id.
  async getDietPlanById(planId: string, userId: string) {
    return await prisma.dietPlan.findFirst({
      where: { id: planId, userId },
      include: { diets: true },
    });
  }

  async getDietPlanHistory(userId: string) {
    return await prisma.dietPlan.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 7,
      include: { diets: true },
    });
  }
}

export const dietRepository = new DietRepository();
