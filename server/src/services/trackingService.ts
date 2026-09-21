import { trackingRepository } from "../repository/trackingRepository.js";
import { userRepository } from "../repository/userRepository.js";
import type { LogWeightInput, LogMealInput } from "../utils/validation.js";

class TrackingService {
  async logWeight(userId: string, input: LogWeightInput) {
    const entry = await trackingRepository.createWeightEntry({
      userId,
      weight: input.weight,
      date: input.date,
      note: input.note,
    });

    // Keep user's active constraint weight synchronized with their latest weigh-in
    await userRepository.updateUserProfile(userId, { weight: input.weight });

    return entry;
  }

  async getWeightTrend(userId: string, days = 60) {
    const entries = await trackingRepository.getWeightEntries(userId, days);

    if (entries.length === 0) {
      return {
        history: [],
        currentWeight: null,
        latestMovingAverage: null,
        weeklyChangeKg: null,
        direction: "INSUFFICIENT_DATA" as const,
      };
    }

    // Compute 7-day Simple Moving Average (SMA) for each point
    const history = entries.map((entry, idx) => {
      const entryTime = new Date(entry.date).getTime();
      const sevenDaysAgo = entryTime - 7 * 24 * 60 * 60 * 1000;

      // Filter entries within the 7-day window up to this point
      const windowEntries = entries
        .slice(0, idx + 1)
        .filter((e) => new Date(e.date).getTime() >= sevenDaysAgo);

      const sum = windowEntries.reduce((acc, e) => acc + e.weight, 0);
      const sma = Math.round((sum / windowEntries.length) * 10) / 10;

      return {
        id: entry.id,
        date: entry.date.toISOString(),
        weight: entry.weight,
        movingAverage7Day: sma,
        note: entry.note,
      };
    });

    const currentWeight = entries[entries.length - 1]?.weight ?? null;
    const latestMovingAverage = history[history.length - 1]?.movingAverage7Day ?? null;

    const lastEntry = entries[entries.length - 1];
    let weeklyChangeKg: number | null = null;
    let direction: "LOSING" | "GAINING" | "MAINTAINING" | "INSUFFICIENT_DATA" =
      "INSUFFICIENT_DATA";

    if (history.length >= 2 && latestMovingAverage !== null && lastEntry) {
      // Find moving average from roughly ~7 days ago or earliest available point
      const targetTime =
        new Date(lastEntry.date).getTime() - 7 * 24 * 60 * 60 * 1000;
      let referencePoint = history[0];
      for (const pt of history) {
        if (new Date(pt.date).getTime() <= targetTime) {
          referencePoint = pt;
        } else {
          break;
        }
      }

      if (referencePoint) {
        weeklyChangeKg =
          Math.round(
            (latestMovingAverage - referencePoint.movingAverage7Day) * 10,
          ) / 10;

        if (weeklyChangeKg < -0.2) {
          direction = "LOSING";
        } else if (weeklyChangeKg > 0.2) {
          direction = "GAINING";
        } else {
          direction = "MAINTAINING";
        }
      }
    }

    return {
      history,
      currentWeight,
      latestMovingAverage,
      weeklyChangeKg,
      direction,
    };
  }

  async logMeal(userId: string, input: LogMealInput) {
    return await trackingRepository.createMealLog({
      userId,
      name: input.name,
      mealType: input.mealType,
      calories: input.calories,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
      adhered: input.adhered,
      date: input.date,
      dietPlanId: input.dietPlanId,
    });
  }

  async getDailyMealLogs(userId: string, dateStr?: string) {
    const target = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate(), 23, 59, 59, 999));

    const logs = await trackingRepository.getMealLogsByDateRange(userId, startOfDay, endOfDay);

    const sum = (key: "calories" | "protein" | "carbs" | "fat") =>
      Math.round(logs.reduce((acc, m) => acc + m[key], 0));

    const totalLoggedCalories = sum("calories");
    const totalLoggedProtein = sum("protein");
    const totalLoggedCarbs = sum("carbs");
    const totalLoggedFat = sum("fat");

    const adheredCount = logs.filter((l) => l.adhered).length;
    const adherenceRate = logs.length > 0 ? Math.round((adheredCount / logs.length) * 100) : 100;

    return {
      date: startOfDay.toISOString(),
      logs,
      totals: {
        calories: totalLoggedCalories,
        protein: totalLoggedProtein,
        carbs: totalLoggedCarbs,
        fat: totalLoggedFat,
      },
      summary: {
        totalLoggedMeals: logs.length,
        adheredMeals: adheredCount,
        adherenceRatePercent: adherenceRate,
      },
    };
  }
}

export const trackingService = new TrackingService();
