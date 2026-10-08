import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().url())
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  ACCESS_TOKEN_SECRET: z
    .string()
    .min(32, "ACCESS_TOKEN_SECRET must be at least 32 characters"),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),
  GEMINI_MODE: z.enum(["live", "stub"]).default("live"),
  GEMINI_STUB_DELAY_MS: z.coerce.number().default(0),
  SWAP_LIMIT_PER_HOUR: z.coerce.number().default(20),
  REFRESH_LIMIT_PER_15M: z.coerce.number().default(60),
  RATE_LIMIT_DISABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  GOOGLE_CLIENT_ID: z.string().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  GOOGLE_CLIENT_SECRET: z.string().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ FATAL: Invalid or missing environment configuration:\n",
    parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n"),
  );
  process.exit(1);
}

export const config = parsed.data;
export type Config = z.infer<typeof envSchema>;
