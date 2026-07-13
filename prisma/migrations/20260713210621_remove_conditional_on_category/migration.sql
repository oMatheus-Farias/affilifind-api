/*
  Warnings:

  - Made the column `category` on table `promotions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "promotions" ALTER COLUMN "category" SET NOT NULL;
