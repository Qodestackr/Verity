-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('B2C', 'B2B', 'POS');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "orderType" "public"."OrderType" NOT NULL DEFAULT 'B2C',
ADD COLUMN     "retailerOrgId" TEXT,
ADD COLUMN     "supplierOrgId" TEXT;
