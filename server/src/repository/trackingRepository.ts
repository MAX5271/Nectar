import type { MealType } from "@prisma/client";
import prisma from "../utils/db.js";

export interface CreateWeightInput {
  userId: string;
  weight: number;
  date?: Date | undefined;
  note?: string | undefined;
}

export interface CreateMealLogInput {
  userId: string;
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  adhered?: boolean | undefined;
  date?: Date | undefined;
  dietPlanId?: string | undefined;
}

class TrackingRepository {
  async createWeightEntry(data: CreateWeightInput) {
    return await prisma.weightEntry.create({
      data: {
        userId: data.userId,
        weight: data.weight,
        date: data.date ?? new Date(),
        note: data.note ?? null,
      },
    });
  }

  async getWeightEntries(userId: string, limitDays = 90) {
    const since = new Date();
    since.setDate(since.getDate() - limitDays);

    return await prisma.weightEntry.findMany({
      where: {
        userId,
        date: { gte: since },
      },
      orderBy: { date: "asc" },
    });
  }

  async createMealLog(data: CreateMealLogInput) {
    return await prisma.mealLog.create({
      data: {
        userId: data.userId,
        name: data.name,
        mealType: data.mealType,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        adhered: data.adhered ?? true,
        date: data.date ?? new Date(),
        dietPlanId: data.dietPlanId ?? null,
      },
    });
  }

  async getMealLogsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return await prisma.mealLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });
  }
}

export const trackingRepository = new TrackingRepository();
