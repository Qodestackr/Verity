import { lastDayOfMonth, getDate, setDate, subMonths } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";
import isServer from "@/utils/is-server";
import prisma from "@/lib/prisma";

function ensureServer() {
  if (!isServer) {
    throw new Error("This module can only be executed on the server side");
  }
}

/**
 * Calculates invoice for an organization based on its subscription and member count
 */
export async function calculateInvoice(orgId: string) {
  ensureServer();

  const [subscription, userCount] = await Promise.all([
    prisma.subscription.findUnique({ where: { organizationId: orgId } }),
    prisma.member.count({ where: { organizationId: orgId } }),
  ]);

  if (!subscription) {
    throw new Error("No subscription found");
  }

  const subtotal = subscription.pricePerUser * userCount;
  const taxRate = 0.16; // 16% VAT
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;

  return { subtotal, tax, total };
}

/**
 * Returns the last day (number) of the current month
 */
export const getLastDayOfMonth = (): number => {
  ensureServer();
  const today = new Date();
  const last = lastDayOfMonth(today);
  return getDate(last);
};

/**
 * Adjusts billingCycleStart to the last day of month if it exceeds it
 */
export const getAdjustedBillingCycleStart = (
  billingCycleStart: number
): number => {
  ensureServer();
  const lastDay = getLastDayOfMonth();
  return billingCycleStart > lastDay ? lastDay : billingCycleStart;
};

/**
 * Computes the start date of the current billing period
 */
export const getBillingStartDate = (billingCycleStart: number): Date => {
  ensureServer();

  const today = new Date();
  const adjustedStart = getAdjustedBillingCycleStart(billingCycleStart);

  // If today is on or before the billing start day, go back one month
  if (getDate(today) <= adjustedStart) {
    const prevMonth = subMonths(today, 1);
    return setDate(prevMonth, adjustedStart);
  }

  return setDate(today, adjustedStart);
};
