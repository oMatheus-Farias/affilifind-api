-- AlterTable
ALTER TABLE "promotions" ADD COLUMN     "commission_amount" DOUBLE PRECISION,
ADD COLUMN     "max_price" DOUBLE PRECISION,
ADD COLUMN     "original_product_url" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
ADD COLUMN     "sales_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shop_name" TEXT;
