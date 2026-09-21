import { MealType } from "@prisma/client";

export interface MealInput {
  mealType: string;
  foodName: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

class DietHelper {
  // All plan dates are UTC midnight so "today" means the same thing everywhere.
  todayUTC(): Date {
    const now = new Date();
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  }

  dietFormater({
    mealType,
    foodName,
    portion,
    calories,
    protein,
    carbs,
    fat,
  }: MealInput) {
    const upper = mealType.toUpperCase();
    const normalizedType: MealType = Object.values(MealType).includes(upper as MealType)
      ? (upper as MealType)
      : MealType.BREAKFAST;

    return {
      mealType: normalizedType,
      meal: foodName,
      portion,
      calories: Math.round(calories),
      protein: Math.round(protein),
      carb: Math.round(carbs),
      fat: Math.round(fat),
    };
  }
}

export const dietHelper = new DietHelper();
