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

// Dietary Constraints DTO
export interface DietaryConstraintDTO {
  id?: string;
  planType: PlanType;
  gender: Gender;
  unitSystem: UnitSystem;
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
  constraints?: DietaryConstraintDTO[];
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
  type: string;
  portion: string;
  meal: string;
  calories: number;
  carb: number;
  protein: number;
  fat: number;
  date: string | Date;
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
