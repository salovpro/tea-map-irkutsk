-- AlterTable
ALTER TABLE "places" ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "places_sort_order_idx" ON "places"("sort_order");
