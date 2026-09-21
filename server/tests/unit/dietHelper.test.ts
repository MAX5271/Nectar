import { describe, it, expect } from "vitest";
import { dietHelper } from "../../src/utils/dietHelper.js";

describe("dietHelper Utilities", () => {
  it("generates a date normalized to UTC midnight", () => {
    const today = dietHelper.todayUTC();
    expect(today.getUTCHours()).toBe(0);
    expect(today.getUTCMinutes()).toBe(0);
    expect(today.getUTCSeconds()).toBe(0);
    expect(today.getUTCMilliseconds()).toBe(0);
  });

  it("formats meal items and rounds all numeric macros", () => {
    const rawMeal = {
      mealType: "Breakfast",
      foodName: "Oatmeal with Blueberries",
      portion: "1 bowl (250g)",
      calories: 350.6,
      protein: 12.4,
      carbs: 58.8,
      fat: 6.2,
    };

    const formatted = dietHelper.dietFormater(rawMeal);

    expect(formatted).toEqual({
      mealType: "BREAKFAST",
      meal: "Oatmeal with Blueberries",
      portion: "1 bowl (250g)",
      calories: 351,
      protein: 12,
      carb: 59,
      fat: 6,
    });
  });
});
