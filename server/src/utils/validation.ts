import { Gender, PlanType, UnitSystem } from "@prisma/client";
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
  preferences: z.string().trim().max(200).default(""),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
