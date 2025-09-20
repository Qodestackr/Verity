-- CreateEnum
CREATE TYPE "public"."ReconciliationType" AS ENUM ('B2B_ORDER_DELIVERY', 'B2C_PAYMENT', 'CASH_SHIFT', 'BANK_RECONCILIATION', 'INVENTORY_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "public"."ReconciliationStatus" AS ENUM ('PENDING', 'PARTIALLY_RECONCILED', 'FULLY_RECONCILED', 'DISPUTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "public"."DisputeCategory" AS ENUM ('QUANTITY_MISMATCH', 'PRICE_DISCREPANCY', 'QUALITY_ISSUE', 'MISSING_ITEMS', 'WRONG_ITEMS', 'PAYMENT_ISSUE', 'CUSTOMER_DISPUTE', 'STAFF_ERROR', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ItemReconciliationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'ADJUSTED', 'DISPUTED', 'RESOLVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."FinancialEntry" ADD COLUMN     "disputeAmount" DOUBLE PRECISION,
ADD COLUMN     "isDisputed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reconciliationId" TEXT;

-- CreateTable
CREATE TABLE "public"."ReconciliationEntry" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "public"."ReconciliationType" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "expectedAmount" DECIMAL(10,2),
    "actualAmount" DECIMAL(10,2),
    "varianceAmount" DECIMAL(10,2),
    "status" "public"."ReconciliationStatus" NOT NULL DEFAULT 'PENDING',
    "isDisputed" BOOLEAN NOT NULL DEFAULT false,
    "disputeReason" TEXT,
    "disputeCategory" "public"."DisputeCategory",
    "disputedBy" TEXT,
    "disputedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notes" JSONB,

    CONSTRAINT "ReconciliationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReconciliationItem" (
    "id" TEXT NOT NULL,
    "reconciliationId" TEXT NOT NULL,
    "productSku" TEXT,
    "productName" TEXT,
    "variantId" TEXT,
    "saleorVariantId" TEXT,
    "expectedQuantity" INTEGER,
    "actualQuantity" INTEGER,
    "quantityVariance" INTEGER,
    "expectedPrice" DECIMAL(10,2),
    "actualPrice" DECIMAL(10,2),
    "priceVariance" DECIMAL(10,2),
    "status" "public"."ItemReconciliationStatus" NOT NULL DEFAULT 'PENDING',
    "disputeReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReconciliationItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReconciliationEntry_organizationId_idx" ON "public"."ReconciliationEntry"("organizationId");

-- CreateIndex
CREATE INDEX "ReconciliationEntry_type_idx" ON "public"."ReconciliationEntry"("type");

-- CreateIndex
CREATE INDEX "ReconciliationEntry_status_idx" ON "public"."ReconciliationEntry"("status");

-- CreateIndex
CREATE INDEX "ReconciliationEntry_isDisputed_idx" ON "public"."ReconciliationEntry"("isDisputed");

-- CreateIndex
CREATE INDEX "ReconciliationEntry_entityType_entityId_idx" ON "public"."ReconciliationEntry"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ReconciliationEntry_createdAt_idx" ON "public"."ReconciliationEntry"("createdAt");

-- CreateIndex
CREATE INDEX "ReconciliationItem_reconciliationId_idx" ON "public"."ReconciliationItem"("reconciliationId");

-- CreateIndex
CREATE INDEX "ReconciliationItem_productSku_idx" ON "public"."ReconciliationItem"("productSku");

-- CreateIndex
CREATE INDEX "ReconciliationItem_status_idx" ON "public"."ReconciliationItem"("status");

-- CreateIndex
CREATE INDEX "FinancialEntry_reconciliationId_idx" ON "public"."FinancialEntry"("reconciliationId");

-- CreateIndex
CREATE INDEX "FinancialEntry_isDisputed_idx" ON "public"."FinancialEntry"("isDisputed");

-- AddForeignKey
ALTER TABLE "public"."FinancialEntry" ADD CONSTRAINT "FinancialEntry_reconciliationId_fkey" FOREIGN KEY ("reconciliationId") REFERENCES "public"."ReconciliationEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReconciliationEntry" ADD CONSTRAINT "ReconciliationEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReconciliationEntry" ADD CONSTRAINT "ReconciliationEntry_disputedBy_fkey" FOREIGN KEY ("disputedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReconciliationEntry" ADD CONSTRAINT "ReconciliationEntry_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReconciliationItem" ADD CONSTRAINT "ReconciliationItem_reconciliationId_fkey" FOREIGN KEY ("reconciliationId") REFERENCES "public"."ReconciliationEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
