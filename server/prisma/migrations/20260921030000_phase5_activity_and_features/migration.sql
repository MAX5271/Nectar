-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'VERY_ACTIVE', 'EXTRA_ACTIVE');

-- AlterTable: DietaryConstraint
ALTER TABLE "DietaryConstraint" ADD COLUMN "activityLevel" "ActivityLevel" NOT NULL DEFAULT 'SEDENTARY';
