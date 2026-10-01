-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "removal_reason" TEXT,
ADD COLUMN     "removed_at" TIMESTAMPTZ(6);
