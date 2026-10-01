-- CreateEnum
CREATE TYPE "product_review_status" AS ENUM ('PENDING', 'APPROVED');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "removal_reason" TEXT,
ADD COLUMN     "review_status" "product_review_status" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "reviewed_at" TIMESTAMPTZ(6),
ADD COLUMN     "reviewed_by_id" UUID;

-- CreateIndex
CREATE INDEX "products_status_review_status_idx" ON "products"("status", "review_status");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Listings that existed before the review step were curated by hand, so they start as checked.
UPDATE "products" SET "review_status" = 'APPROVED', "reviewed_at" = now();
