import { describe, it, expect } from "vitest";
import {
  ACTIVITY_MULTIPLIERS,
  calculateBmr,
  explainPlan,
  geminiService,
} from "../../src/services/geminiService.js";
import { ActivityLevel, Gender, PlanType, UnitSystem } from "@prisma/client";

describe("Activity Level Multipliers & Plan Explanation", () => {
  const baseReq = {
    weight: 70, // kg
    height: 175, // cm
    age: 25,
    gender: Gender.MALE,
    planType: PlanType.RECOMP,
    unitSystem: UnitSystem.METRIC,
    preferences: "None",
  };

  it("applies the exact scientific multipliers across all 5 activity tiers", () => {
    const bmr = calculateBmr(baseReq); // 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75

    expect(ACTIVITY_MULTIPLIERS.SEDENTARY).toBe(1.2);
    expect(ACTIVITY_MULTIPLIERS.LIGHT).toBe(1.375);
    expect(ACTIVITY_MULTIPLIERS.MODERATE).toBe(1.55);
    expect(ACTIVITY_MULTIPLIERS.VERY_ACTIVE).toBe(1.725);
    expect(ACTIVITY_MULTIPLIERS.EXTRA_ACTIVE).toBe(1.9);

    const sedentaryTarget = geminiService.calculateTargetCalories({
      ...baseReq,
      activityLevel: ActivityLevel.SEDENTARY,
    });
    const extraActiveTarget = geminiService.calculateTargetCalories({
      ...baseReq,
      activityLevel: ActivityLevel.EXTRA_ACTIVE,
    });

    expect(sedentaryTarget).toBe(Math.round(bmr * 1.2)); // 2009
    expect(extraActiveTarget).toBe(Math.round(bmr * 1.9)); // 3180
    expect(extraActiveTarget).toBeGreaterThan(sedentaryTarget);
  });

  it("explains the plan with full breakdown of BMR, TDEE, goal adjustment, and macro splits", () => {
    const explanation = explainPlan({
      ...baseReq,
      activityLevel: ActivityLevel.MODERATE,
      planType: PlanType.CUTTING,
    });

    expect(explanation.bmr).toBe(1674);
    expect(explanation.activityMultiplier).toBe(1.55);
    expect(explanation.tdee).toBe(Math.round(1674 * 1.55));
    expect(explanation.goal).toBe("CUTTING");
    expect(explanation.goalAdjustment).toBe(-500);
    expect(explanation.targetCalories).toBe(explanation.tdee - 500);

    // Verify macro splits sum to targetCalories (with rounding tolerance)
    const { macroSplit } = explanation;
    expect(macroSplit.proteinPct).toBe(30);
    expect(macroSplit.carbsPct).toBe(40);
    expect(macroSplit.fatPct).toBe(30);
    expect(macroSplit.proteinGrams).toBe(Math.round((explanation.targetCalories * 0.3) / 4));
    expect(macroSplit.carbsGrams).toBe(Math.round((explanation.targetCalories * 0.4) / 4));
    expect(macroSplit.fatGrams).toBe(Math.round((explanation.targetCalories * 0.3) / 9));
  });
});
