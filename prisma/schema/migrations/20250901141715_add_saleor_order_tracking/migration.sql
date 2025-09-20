/*
  Warnings:

  - A unique constraint covering the columns `[saleorOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."OrderItem" ADD COLUMN     "costAtSale" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Order_saleorOrderId_key" ON "public"."Order"("saleorOrderId");

-- CreateIndex
CREATE INDEX "Order_saleorOrderId_idx" ON "public"."Order"("saleorOrderId");
