/*
  Warnings:

  - Added the required column `Age` to the `DietaryConstraint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DietaryConstraint" ADD COLUMN     "Age" INTEGER NOT NULL;
