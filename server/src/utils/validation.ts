import { ActivityLevel, Gender, MealType, PlanType, UnitSystem } from "@prisma/client";
import { z } from "zod";

const upper = (v: unknown) => (typeof v === "string" ? v.trim().toUpperCase() : v);
const positive = (max: number) => z.coerce.number().positive().max(max);

export const signUpSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  username: z.string().trim().min(1).max(50),
  password: z.string().min(8, "must be at least 8 characters").max(72),
  age: z.coerce
    .number()
    .int()
    .min(13, "You must be at least 13 years old to use Nectar.")
    .max(120),
  height: positive(300),
  weight: positive(700),
  gender: z.preprocess(upper, z.nativeEnum(Gender)),
  planType: z.preprocess(upper, z.nativeEnum(PlanType)),
  unitSystem: z.preprocess(upper, z.nativeEnum(UnitSystem)),
  activityLevel: z
    .preprocess(upper, z.nativeEnum(ActivityLevel))
    .default(ActivityLevel.SEDENTARY),
  preferences: z.string().trim().max(200).default(""),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  username: z.string().trim().min(1).max(50).optional(),
  email: z.string().trim().toLowerCase().email().max(254).optional(),
  age: z.coerce.number().int().min(13).max(120).optional(),
  height: positive(300).optional(),
  weight: positive(700).optional(),
  gender: z.preprocess(upper, z.nativeEnum(Gender)).optional(),
  planType: z.preprocess(upper, z.nativeEnum(PlanType)).optional(),
  unitSystem: z.preprocess(upper, z.nativeEnum(UnitSystem)).optional(),
  activityLevel: z.preprocess(upper, z.nativeEnum(ActivityLevel)).optional(),
  preferences: z.string().trim().max(200).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const mealSwapSchema = z.object({
  dietId: z.string().min(1, "dietId is required"),
  reason: z.string().trim().max(200).optional(),
});

export type MealSwapInput = z.infer<typeof mealSwapSchema>;

export const logWeightSchema = z.object({
  weight: positive(700),
  date: z.coerce.date().optional(),
  note: z.string().trim().max(200).optional(),
});

export type LogWeightInput = z.infer<typeof logWeightSchema>;

export const logMealSchema = z.object({
  name: z.string().trim().min(1).max(100),
  mealType: z.preprocess(upper, z.nativeEnum(MealType)),
  calories: z.coerce.number().nonnegative(),
  protein: z.coerce.number().nonnegative(),
  carbs: z.coerce.number().nonnegative(),
  fat: z.coerce.number().nonnegative(),
  adhered: z.boolean().default(true),
  date: z.coerce.date().optional(),
  dietPlanId: z.string().optional(),
});

export type LogMealInput = z.infer<typeof logMealSchema>;

export const trendQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).optional(),
});

export type TrendQueryInput = z.infer<typeof trendQuerySchema>;

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required"),
  profile: z
    .object({
      age: z.coerce.number().int().min(13).max(120).optional(),
      gender: z.enum(["MALE", "FEMALE"]).optional(),
      height: z.coerce.number().positive().optional(),
      weight: z.coerce.number().positive().optional(),
      unitSystem: z.enum(["METRIC", "IMPERIAL"]).optional(),
      planType: z.enum(["CUTTING", "BULKING", "RECOMP"]).optional(),
      activityLevel: z
        .enum(["SEDENTARY", "LIGHT", "MODERATE", "VERY_ACTIVE", "EXTRA_ACTIVE"])
        .optional(),
      preferences: z.string().optional(),
    })
    .optional(),
});

export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;


