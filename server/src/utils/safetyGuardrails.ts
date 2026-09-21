// ==========================================
// 1. ALLERGEN TAXONOMY & SYNONYM DICTIONARY
// ==========================================

export const ALLERGEN_TAXONOMY: Record<string, string[]> = {
  peanut: [
    "peanut",
    "peanuts",
    "peanut butter",
    "arachis",
    "groundnut",
    "groundnuts",
    "monkey nut",
    "beer nuts",
    "goober",
  ],
  treenut: [
    "treenut",
    "treenuts",
    "tree nut",
    "tree nuts",
    "nut",
    "nuts",
    "almond",
    "almonds",
    "walnut",
    "walnuts",
    "cashew",
    "cashews",
    "pecan",
    "pecans",
    "pistachio",
    "pistachios",
    "macadamia",
    "hazelnut",
    "hazelnuts",
    "brazil nut",
    "pine nut",
    "pine nuts",
    "praline",
    "marzipan",
    "nougat",
    "pesto",
    "chestnut",
  ],
  dairy: [
    "dairy",
    "milk",
    "cheese",
    "cheddar",
    "mozzarella",
    "parmesan",
    "feta",
    "gouda",
    "butter",
    "cream",
    "heavy cream",
    "yogurt",
    "yoghurt",
    "curd",
    "ghee",
    "casein",
    "whey",
    "lactose",
    "paneer",
    "custard",
    "buttermilk",
    "sour cream",
    "ricotta",
  ],
  egg: [
    "egg",
    "eggs",
    "egg white",
    "egg yolk",
    "mayonnaise",
    "meringue",
    "ovalbumin",
    "albumin",
    "scrambled egg",
    "omelette",
    "omelet",
  ],
  fish: [
    "fish",
    "salmon",
    "tuna",
    "cod",
    "tilapia",
    "mackerel",
    "bass",
    "trout",
    "anchovy",
    "anchovies",
    "halibut",
    "sardines",
    "sardine",
    "snapper",
    "haddock",
    "swordfish",
    "pollock",
  ],
  shellfish: [
    "shellfish",
    "shrimp",
    "shrimps",
    "prawn",
    "prawns",
    "crab",
    "lobster",
    "crawfish",
    "crayfish",
    "mussel",
    "mussels",
    "oyster",
    "oysters",
    "clam",
    "clams",
    "scallop",
    "scallops",
    "squid",
    "octopus",
    "calamari",
  ],
  wheat: [
    "wheat",
    "gluten",
    "barley",
    "rye",
    "semolina",
    "spelt",
    "flour",
    "bread",
    "pasta",
    "spaghetti",
    "macaroni",
    "couscous",
    "seitan",
    "bulgur",
    "farro",
    "wheatberry",
  ],
  soy: [
    "soy",
    "soya",
    "soybean",
    "soybeans",
    "tofu",
    "edamame",
    "miso",
    "tempeh",
    "tamari",
    "shoyu",
    "soy sauce",
    "soymilk",
    "soy milk",
  ],
  sesame: [
    "sesame",
    "sesame oil",
    "sesame seeds",
    "tahini",
    "halva",
    "benne",
    "gingelly",
  ],
};

export interface AllergyViolation {
  mealName: string;
  matchedAllergenCategory: string;
  detectedIngredient: string;
}

export interface AllergyVerificationResult {
  safe: boolean;
  violations: AllergyViolation[];
}

/**
 * Extract active allergen categories from user preferences or allergies list.
 */
export function extractUserAllergenCategories(allergyInput: string | string[]): string[] {
  const normalized = Array.isArray(allergyInput)
    ? allergyInput.join(" ").toLowerCase()
    : (allergyInput || "").toLowerCase();

  const categories: string[] = [];

  for (const [category, synonyms] of Object.entries(ALLERGEN_TAXONOMY)) {
    // Check if the user mentioned the category or any synonym as an allergen
    const matches = synonyms.some((term) => {
      const regex = new RegExp(`\\b${term}\\b`, "i");
      return regex.test(normalized);
    });
    if (matches) {
      categories.push(category);
    }
  }

  return categories;
}

/**
 * Deterministically verify that none of the generated meals contain forbidden allergens.
 */
export function verifyAllergySafety(
  meals: Array<{ meal: string; portion?: string }>,
  userAllergies: string | string[],
): AllergyVerificationResult {
  const activeCategories = extractUserAllergenCategories(userAllergies);

  if (activeCategories.length === 0) {
    return { safe: true, violations: [] };
  }

  const violations: AllergyViolation[] = [];

  for (const item of meals) {
    const textToScan = `${item.meal} ${item.portion || ""}`.toLowerCase();

    for (const category of activeCategories) {
      const synonyms = (ALLERGEN_TAXONOMY[category] || [])
        .slice()
        .sort((a, b) => b.length - a.length);
      for (const synonym of synonyms) {
        const wordRegex = new RegExp(`\\b${synonym}\\b`, "i");
        if (wordRegex.test(textToScan)) {
          violations.push({
            mealName: item.meal,
            matchedAllergenCategory: category,
            detectedIngredient: synonym,
          });
          break; // Avoid duplicate category entries for the same meal
        }
      }
    }
  }

  return {
    safe: violations.length === 0,
    violations,
  };
}

// ==========================================
// 2. EATING DISORDER & CALORIC SAFETY GUARDS
// ==========================================

export interface CaloricSafetyParams {
  weightKg: number;
  heightCm: number;
  age: number;
  bmr: number;
  targetCalories: number;
  goal: string;
}

export interface SafetyCheckResult {
  allowed: boolean;
  clampedCalories?: number;
  warning?: string;
  error?: string;
}

export const ED_SUPPORT_RESOURCES =
  "If you or someone you know is struggling with an eating disorder, please contact the National Eating Disorders Association (NEDA) helpline at 1-800-931-2237 or text 'NEDA' to 741741 for confidential support.";

/**
 * Compute BMI from metric units.
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Validate caloric and eating disorder safety thresholds.
 */
export function validateCaloricSafety(params: CaloricSafetyParams): SafetyCheckResult {
  const bmi = calculateBMI(params.weightKg, params.heightCm);

  // 1. Severe underweight BMI floor check
  if (bmi > 0 && bmi < 16.0) {
    return {
      allowed: false,
      error: `Severe underweight detected (BMI: ${bmi}). To protect your health, dietary restriction is prohibited. ${ED_SUPPORT_RESOURCES}`,
    };
  }

  // 2. Underweight cutting prevention
  if (bmi > 0 && bmi < 18.5 && params.goal.toUpperCase() === "CUTTING") {
    return {
      allowed: false,
      error: `Your BMI is ${bmi} (underweight). Caloric restriction is medically contraindicated. We recommend BULKING or RECOMP to build healthy lean tissue.`,
    };
  }

  // 3. Absolute minimum physiological calorie floors
  const isAdolescent = params.age < 18;
  const absoluteFloor = isAdolescent ? 1600 : 1200;

  if (params.targetCalories < absoluteFloor) {
    return {
      allowed: true,
      clampedCalories: absoluteFloor,
      warning: `Caloric target was clamped from ${params.targetCalories} kcal to the safety floor of ${absoluteFloor} kcal to prevent metabolic harm.`,
    };
  }

  // 4. Maximum caloric deficit safety limit (max 1000 kcal deficit below estimated TDEE)
  const estimatedTdee = params.bmr * 1.2;
  const maxDeficit = 1000;
  if (params.goal.toUpperCase() === "CUTTING" && estimatedTdee - params.targetCalories > maxDeficit) {
    const safeTarget = Math.max(absoluteFloor, Math.round(estimatedTdee - maxDeficit));
    return {
      allowed: true,
      clampedCalories: safeTarget,
      warning: `Excessive caloric deficit detected. Deficit was capped to ${maxDeficit} kcal/day (target: ${safeTarget} kcal) for sustainable and safe fat loss.`,
    };
  }

  return { allowed: true };
}

// ==========================================
// 3. AGE & MINOR SAFEGUARDS
// ==========================================

/**
 * Validate age compliance.
 */
export function validateAgeSafety(age: number): { allowed: boolean; error?: string } {
  if (age < 13) {
    return {
      allowed: false,
      error: "You must be at least 13 years old to use Nectar in compliance with COPPA regulations.",
    };
  }
  return { allowed: true };
}

// ==========================================
// 4. MEDICAL CONDITION SAFETY ADVISORIES
// ==========================================

const HIGH_RISK_CONDITIONS = [
  { term: "type 1 diabetes", label: "Type 1 Diabetes" },
  { term: "t1d", label: "Type 1 Diabetes" },
  { term: "diabetes", label: "Diabetes" },
  { term: "chronic kidney disease", label: "Chronic Kidney Disease" },
  { term: "ckd", label: "Kidney Disease" },
  { term: "renal", label: "Renal Condition" },
  { term: "pregnancy", label: "Pregnancy" },
  { term: "pregnant", label: "Pregnancy" },
  { term: "breastfeeding", label: "Lactation / Breastfeeding" },
];

export function checkMedicalConditions(preferences: string): string[] {
  const text = (preferences || "").toLowerCase();
  const detected: string[] = [];

  for (const { term, label } of HIGH_RISK_CONDITIONS) {
    const regex = new RegExp(`\\b${term}\\b`, "i");
    if (regex.test(text) && !detected.includes(label)) {
      detected.push(label);
    }
  }

  return detected;
}
