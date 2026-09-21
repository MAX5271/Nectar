import { describe, it, expect } from "vitest";
import {
  extractUserAllergenCategories,
  verifyAllergySafety,
  calculateBMI,
  validateCaloricSafety,
  validateAgeSafety,
  checkMedicalConditions,
} from "../../src/utils/safetyGuardrails.js";

describe("Safety Guardrails: Allergens", () => {
  it("extracts recognized allergen categories from free-text preferences", () => {
    const preferences = "Severe peanut allergy, lactose intolerant, no shrimp or shellfish";
    const categories = extractUserAllergenCategories(preferences);

    expect(categories).toContain("peanut");
    expect(categories).toContain("dairy");
    expect(categories).toContain("shellfish");
    expect(categories).not.toContain("fish");
  });

  it("detects allergen violations deterministically in generated meal names", () => {
    const meals = [
      { meal: "Oatmeal with Blueberries and Peanut Butter", portion: "1 bowl" },
      { meal: "Grilled Chicken Breast with Steamed Broccoli", portion: "200g" },
      { meal: "Greek Yogurt with Walnuts", portion: "1 cup" },
    ];

    const result = verifyAllergySafety(meals, "peanut allergy, treenut allergy");

    expect(result.safe).toBe(false);
    expect(result.violations.length).toBe(2);
    expect(result.violations[0].detectedIngredient).toBe("peanut butter");
    expect(result.violations[0].matchedAllergenCategory).toBe("peanut");
    expect(result.violations[1].detectedIngredient).toBe("walnuts");
    expect(result.violations[1].matchedAllergenCategory).toBe("treenut");
  });

  it("returns safe when meals do not contain any forbidden allergens", () => {
    const meals = [
      { meal: "Grilled Chicken Breast with White Rice", portion: "200g" },
      { meal: "Steamed Broccoli with Olive Oil", portion: "100g" },
      { meal: "Apple with Cinnamon", portion: "1 fruit" },
    ];

    const result = verifyAllergySafety(meals, "peanut, shellfish, dairy");

    expect(result.safe).toBe(true);
    expect(result.violations).toHaveLength(0);
  });
});

describe("Safety Guardrails: BMI, Eating Disorders & Caloric Floors", () => {
  it("calculates BMI correctly", () => {
    // 70 kg, 175 cm -> 70 / (1.75^2) = 22.86 -> 22.9
    const bmi = calculateBMI(70, 175);
    expect(bmi).toBe(22.9);
  });

  it("rejects severe underweight (BMI < 16.0) with eating disorder support resources", () => {
    // 38 kg, 170 cm -> BMI = 13.1
    const check = validateCaloricSafety({
      weightKg: 38,
      heightCm: 170,
      age: 25,
      bmr: 1100,
      targetCalories: 1300,
      goal: "RECOMP",
    });

    expect(check.allowed).toBe(false);
    expect(check.error).toMatch(/severe underweight detected/i);
    expect(check.error).toMatch(/National Eating Disorders Association/i);
  });

  it("prohibits cutting goal when user is underweight (BMI < 18.5)", () => {
    // 48 kg, 165 cm -> BMI = 17.6
    const check = validateCaloricSafety({
      weightKg: 48,
      heightCm: 165,
      age: 22,
      bmr: 1250,
      targetCalories: 1200,
      goal: "CUTTING",
    });

    expect(check.allowed).toBe(false);
    expect(check.error).toMatch(/underweight/i);
    expect(check.error).toMatch(/caloric restriction is medically contraindicated/i);
  });

  it("clamps target calories to adult safety floor (1200 kcal)", () => {
    const check = validateCaloricSafety({
      weightKg: 55,
      heightCm: 160,
      age: 30,
      bmr: 1250,
      targetCalories: 950, // unsafe deficit
      goal: "CUTTING",
    });

    expect(check.allowed).toBe(true);
    expect(check.clampedCalories).toBe(1200);
    expect(check.warning).toMatch(/clamped.*1200 kcal/i);
  });

  it("enforces higher safety floor for adolescents (1600 kcal for age < 18)", () => {
    const check = validateCaloricSafety({
      weightKg: 50,
      heightCm: 160,
      age: 15,
      bmr: 1350,
      targetCalories: 1400,
      goal: "CUTTING",
    });

    expect(check.allowed).toBe(true);
    expect(check.clampedCalories).toBe(1600);
  });

  it("clamps excessive caloric deficit (> 1000 kcal below TDEE)", () => {
    // TDEE = 2000 * 1.2 = 2400. Target = 1300 -> deficit = 1100 kcal (> 1000)
    const check = validateCaloricSafety({
      weightKg: 85,
      heightCm: 180,
      age: 28,
      bmr: 2000,
      targetCalories: 1300,
      goal: "CUTTING",
    });

    expect(check.allowed).toBe(true);
    expect(check.clampedCalories).toBe(1400); // 2400 - 1000
    expect(check.warning).toMatch(/excessive caloric deficit/i);
  });
});

describe("Safety Guardrails: Age & Medical Conditions", () => {
  it("rejects minors under 13 years old for COPPA compliance", () => {
    expect(validateAgeSafety(12).allowed).toBe(false);
    expect(validateAgeSafety(12).error).toMatch(/13 years old/i);
    expect(validateAgeSafety(13).allowed).toBe(true);
  });

  it("identifies high-risk medical conditions in user preferences", () => {
    const flags = checkMedicalConditions("Diagnosed with type 1 diabetes and mild hypertension");
    expect(flags).toContain("Type 1 Diabetes");

    const pregnancyFlags = checkMedicalConditions("Currently 6 months pregnant");
    expect(pregnancyFlags).toContain("Pregnancy");
  });
});
