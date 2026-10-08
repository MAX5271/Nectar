// Unified API Response Envelope
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// Domain Enums
export type PlanType = "CUTTING" | "BULKING" | "RECOMP";
export type Gender = "MALE" | "FEMALE";
export type UnitSystem = "METRIC" | "IMPERIAL";
export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
export type ActivityLevel =
  | "SEDENTARY"
  | "LIGHT"
  | "MODERATE"
  | "VERY_ACTIVE"
  | "EXTRA_ACTIVE";

// Dietary Constraints DTO
export interface DietaryConstraintDTO {
  id?: string;
  planType: PlanType;
  gender: Gender;
  unitSystem: UnitSystem;
  activityLevel?: ActivityLevel;
  height: number;
  weight: number;
  age: number;
  preferences: string;
  userId?: string;
}

// User Profile DTO
export interface UserProfileDTO {
  id: string;
  username: string | null;
  email: string;
  constraint?: DietaryConstraintDTO;
  constraints?: DietaryConstraintDTO[]; // backwards compatibility
}

// Auth Response DTO
export interface AuthDataDTO {
  id: string;
  username: string | null;
  email: string;
  accessToken: string;
}

// Diet Meal DTO
export interface DietMealDTO {
  id: string;
  type?: string;
  mealType: MealType | string;
  portion: string;
  meal: string;
  calories: number;
  carb: number;
  protein: number;
  fat: number;
  date?: string | Date;
  dietPlanId?: string;
}

// Diet Plan DTO
export interface DietPlanDTO {
  id: string;
  date: string | Date;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  userId: string;
  diets?: DietMealDTO[];
}

// Weight Tracking DTO
export interface WeightEntryDTO {
  id: string;
  weight: number;
  date: string | Date;
  note?: string | null;
  userId: string;
}

// Meal Log DTO
export interface MealLogDTO {
  id: string;
  date: string | Date;
  mealType: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  adhered: boolean;
  dietPlanId?: string | null;
  userId: string;
}

// Body Measurement DTO
export interface MeasurementDTO {
  id: string;
  date: string | Date;
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  arms?: number | null;
  thighs?: number | null;
  userId: string;
}

// Meal Feedback / Preferences DTO
export interface MealFeedbackDTO {
  id: string;
  foodName: string;
  rating: number;
  reason?: string | null;
  isBlocked: boolean;
  userId: string;
}

// Profile Update DTO
export interface UpdateProfileDTO {
  username?: string;
  email?: string;
  planType?: PlanType;
  gender?: Gender;
  unitSystem?: UnitSystem;
  activityLevel?: ActivityLevel;
  height?: number;
  weight?: number;
  age?: number;
  preferences?: string;
}

// Meal Swap DTO
export interface MealSwapRequestDTO {
  dietId: string;
  reason?: string;
}

// Weight Trend Analysis DTO
export interface WeightTrendPointDTO {
  id: string;
  date: string;
  weight: number;
  movingAverage7Day: number;
  note?: string | null;
}

export interface WeightTrendDTO {
  history: WeightTrendPointDTO[];
  currentWeight: number | null;
  latestMovingAverage: number | null;
  weeklyChangeKg: number | null;
  direction: "LOSING" | "GAINING" | "MAINTAINING" | "INSUFFICIENT_DATA";
}

// Meal Adherence Trend DTO
export interface MealAdherenceTrendPointDTO {
  date: string;
  totalLoggedMeals: number;
  adheredMeals: number;
  adherenceRatePercent: number | null;
}

export interface MealAdherenceTrendDTO {
  days: number;
  points: MealAdherenceTrendPointDTO[];
  averageAdherenceRatePercent: number | null;
  totalLoggedMeals: number;
  daysWithLogs: number;
}

// Plan Explanation DTO
export interface PlanExplanationDTO {
  bmr: number;
  activityLevel: ActivityLevel;
  activityMultiplier: number;
  tdee: number;
  goal: PlanType;
  goalAdjustment: number;
  targetCalories: number;
  clampedCalories?: number;
  macroSplit: {
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    proteinCalories: number;
    carbsCalories: number;
    fatCalories: number;
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
  };
  safetyFloorApplied: boolean;
  medicalAdvisories: string[];
}

// Session DTO
export interface SessionDTO {
  id: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  isCurrent: boolean;
}

