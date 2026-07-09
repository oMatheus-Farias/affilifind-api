/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `promotions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "affiliate_credentials" DROP CONSTRAINT "affiliate_credentials_user_id_fkey";

-- AlterTable
ALTER TABLE "promotions" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "original_price" DROP NOT NULL,
ALTER COLUMN "discount_percentage" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "promotions_external_id_key" ON "promotions"("external_id");

-- AddForeignKey
ALTER TABLE "affiliate_credentials" ADD CONSTRAINT "affiliate_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
