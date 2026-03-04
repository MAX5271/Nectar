/*
  Warnings:

  - Added the required column `portion` to the `Diet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Diet" ADD COLUMN     "portion" TEXT NOT NULL;
