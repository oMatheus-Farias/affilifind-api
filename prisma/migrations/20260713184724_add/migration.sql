/*
  Warnings:

  - Added the required column `category` to the `search_keywords` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "search_keywords" ADD COLUMN     "category" TEXT NOT NULL;
