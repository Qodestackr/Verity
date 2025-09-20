-- AlterTable
ALTER TABLE "public"."SubscriptionPlan" ADD COLUMN     "additionalSeatPrice" DOUBLE PRECISION,
ADD COLUMN     "includedSeats" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxSeats" INTEGER,
ADD COLUMN     "seatBillingInterval" "public"."BillingInterval";
