-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('CUTTING', 'BULKING', 'RECOMP');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "UnitSystem" AS ENUM ('METRIC', 'IMPERIAL');

-- CreateTable
CREATE TABLE "DietaryConstraint" (
    "id" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL,
    "gender" "Gender" NOT NULL,
    "unitSystem" "UnitSystem" NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "preferences" TEXT[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "DietaryConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "DietaryConstraint" ADD CONSTRAINT "DietaryConstraint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
