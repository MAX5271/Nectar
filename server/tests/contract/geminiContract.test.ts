import { describe, it, expect } from "vitest";
import { aiPlanSchema } from "../../src/services/geminiService.js";

describe("Gemini Plan Contract & Schema Verification", () => {
  const validMeal = {
    mealType: "Breakfast",
    foodName: "Scrambled Eggs with Avocado",
    portion: "2 eggs + 1/2 avocado",
    calories: 350,
    protein: 16,
    carbs: 6,
    fat: 28,
  };

  it("validates a strictly compliant 5-meal JSON payload", () => {
    const validPlan = {
      meals: [
        { ...validMeal, mealType: "Breakfast" },
        { ...validMeal, mealType: "Snack" },
        { ...validMeal, mealType: "Lunch" },
        { ...validMeal, mealType: "Snack" },
        { ...validMeal, mealType: "Dinner" },
      ],
    };

    const parsed = aiPlanSchema.safeParse(validPlan);
    expect(parsed.success).toBe(true);
  });

  it("rejects plans with fewer than 5 meals", () => {
    const shortPlan = {
      meals: [
        { ...validMeal, mealType: "Breakfast" },
        { ...validMeal, mealType: "Lunch" },
        { ...validMeal, mealType: "Dinner" },
      ],
    };

    const parsed = aiPlanSchema.safeParse(shortPlan);
    expect(parsed.success).toBe(false);
  });

  it("rejects plans with more than 5 meals", () => {
    const longPlan = {
      meals: Array(6).fill(validMeal),
    };

    const parsed = aiPlanSchema.safeParse(longPlan);
    expect(parsed.success).toBe(false);
  });

  it("rejects negative calories or negative macro targets", () => {
    const invalidPlan = {
      meals: [
        { ...validMeal, calories: -200 },
        validMeal,
        validMeal,
        validMeal,
        validMeal,
      ],
    };

    const parsed = aiPlanSchema.safeParse(invalidPlan);
    expect(parsed.success).toBe(false);
  });

  it("rejects meals with missing descriptions or empty names", () => {
    const missingNamePlan = {
      meals: [
        { ...validMeal, foodName: "" },
        validMeal,
        validMeal,
        validMeal,
        validMeal,
      ],
    };

    const parsed = aiPlanSchema.safeParse(missingNamePlan);
    expect(parsed.success).toBe(false);
  });
});
