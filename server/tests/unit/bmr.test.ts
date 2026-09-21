import { describe, it, expect } from "vitest";
import {
  calculateBmr,
  geminiService,
  GOAL_MODIFIER,
  BMR_FLOOR_CALORIES,
  type DietPlanReq,
} from "../../src/services/geminiService.js";

describe("BMR and TDEE Calculations (Mifflin-St Jeor)", () => {
  it("calculates accurate BMR for metric male", () => {
    const user: DietPlanReq = {
      weight: 80, // kg
      height: 180, // cm
      age: 25,
      gender: "MALE",
      planType: "RECOMP",
      unitSystem: "METRIC",
      preferences: "None",
    };

    // base = 10 * 80 + 6.25 * 180 - 5 * 25 = 800 + 1125 - 125 = 1800
    // male offset = +5
    expect(calculateBmr(user)).toBe(1805);
  });

  it("calculates accurate BMR for metric female", () => {
    const user: DietPlanReq = {
      weight: 60, // kg
      height: 165, // cm
      age: 30,
      gender: "FEMALE",
      planType: "RECOMP",
      unitSystem: "METRIC",
      preferences: "None",
    };

    // base = 10 * 60 + 6.25 * 165 - 5 * 30 = 600 + 1031.25 - 150 = 1481.25
    // female offset = -161 => 1320.25
    expect(calculateBmr(user)).toBeCloseTo(1320.25, 2);
  });

  it("calculates BMR with imperial units correctly", () => {
    const userImperial: DietPlanReq = {
      weight: 176.37, // ~80 kg in lbs
      height: 70.87, // ~180 cm in inches
      age: 25,
      gender: "MALE",
      planType: "RECOMP",
      unitSystem: "IMPERIAL",
      preferences: "None",
    };

    const bmr = calculateBmr(userImperial);
    expect(bmr).toBeGreaterThan(1795);
    expect(bmr).toBeLessThan(1815);
  });

  it("applies goal modifiers properly", () => {
    expect(GOAL_MODIFIER.CUTTING).toBe(-500);
    expect(GOAL_MODIFIER.BULKING).toBe(300);
    expect(GOAL_MODIFIER.RECOMP).toBe(0);
  });

  it("calculates target calories with activity multiplier and goal adjustments", () => {
    const user: DietPlanReq = {
      weight: 80,
      height: 180,
      age: 25,
      gender: "MALE",
      planType: "CUTTING",
      unitSystem: "METRIC",
      preferences: "None",
    };

    // BMR = 1805
    // Target = round(1805 * 1.2 - 500) = round(2166 - 500) = 1666
    const target = geminiService.calculateTargetCalories(user);
    expect(target).toBe(1666);
  });

  it("enforces safety floor of 1200 kcal for extreme deficits", () => {
    const user: DietPlanReq = {
      weight: 40,
      height: 140,
      age: 60,
      gender: "FEMALE",
      planType: "CUTTING",
      unitSystem: "METRIC",
      preferences: "None",
    };

    const target = geminiService.calculateTargetCalories(user);
    expect(target).toBe(BMR_FLOOR_CALORIES);
  });
});
