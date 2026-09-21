import { config } from "../config.js";

// Deterministic stand-in for Gemini, used by benchmarks (docs/PERFORMANCE.md).
// Enabled with GEMINI_MODE=stub. Never honoured in production.
export const geminiStubEnabled =
  config.GEMINI_MODE === "stub" && config.NODE_ENV !== "production";

const DELAY_MS = config.GEMINI_STUB_DELAY_MS;

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Snack"];

export async function stubMeals(targetCalories: number) {
  if (DELAY_MS > 0) await new Promise((r) => setTimeout(r, DELAY_MS));

  const base = Math.floor(targetCalories / 5);
  return MEAL_TYPES.map((mealType, i) => {
    // remainder goes on the first meal so the total is exactly the target
    const calories = i === 0 ? targetCalories - base * 4 : base;
    return {
      mealType,
      foodName: `Stub ${mealType}`,
      portion: "1 serving",
      calories,
      protein: Math.round((calories * 0.3) / 4),
      carbs: Math.round((calories * 0.4) / 4),
      fat: Math.round((calories * 0.3) / 9),
    };
  });
}
