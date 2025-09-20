import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import { invoiceService } from "./invoice-service";
import { addDays, addMonths, addYears } from "date-fns";

/**
 * Service for managing subscriptions
 */
export const subscriptionService = {
  /**
   * Create a new subscription
   */
  async createSubscription(
    organizationId: string,
    planId: string,
    paymentMethodId?: string
  ) {
    // Get the subscription plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    // Calc trial end date if applicable
    const now = new Date();
    let trialEndDate = null;
    if (plan.trialPeriodDays && plan.trialPeriodDays > 0) {
      trialEndDate = addDays(now, plan.trialPeriodDays);
    }

    // Calc billing period end date
    let currentPeriodEnd;
    switch (plan.interval) {
      case "DAY":
        currentPeriodEnd = addDays(now, plan.intervalCount);
        break;
      case "WEEK":
        currentPeriodEnd = addDays(now, plan.intervalCount * 7);
        break;
      case "MONTH":
        currentPeriodEnd = addMonths(now, plan.intervalCount);
        break;
      case "YEAR":
        currentPeriodEnd = addYears(now, plan.intervalCount);
        break;
      default:
        currentPeriodEnd = addMonths(now, 1); // Default to 1 month
    }

    // Determine initial status
    const status = trialEndDate ? "TRIALING" : "ACTIVE";

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        organizationId,
        planId,
        status,
        startDate: now,
        trialEndDate,
        currentPeriodStart: now,
        currentPeriodEnd,
        nextBillingDate: trialEndDate || currentPeriodEnd,
        paymentMethodId,
      },
      include: {
        plan: true,
      },
    });

    // Create initial invoice if not in trial
    if (!trialEndDate && paymentMethodId) {
      await invoiceService.createInvoice(subscription.id);
    }

    // Update organization with subscription plan info
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionPlan: {
          connect: { id: planId }
        },
      },
    });

    return subscription;
  },

  /**
   * Change subscription plan
   */
  async changeSubscription(
    subscriptionId: string,
    newPlanId: string,
    paymentMethodId?: string
  ) {
    // Get current subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Get new plan
    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan) {
      throw new Error("Subscription plan not found");
    }

    // Handle upgrade/downgrade logic
    const isUpgrade = newPlan.price > subscription.plan.price;
    const now = new Date();

    // Calc new billing period end date
    let newPeriodEnd;
    switch (newPlan.interval) {
      case "DAY":
        newPeriodEnd = addDays(now, newPlan.intervalCount);
        break;
      case "WEEK":
        newPeriodEnd = addDays(now, newPlan.intervalCount * 7);
        break;
      case "MONTH":
        newPeriodEnd = addMonths(now, newPlan.intervalCount);
        break;
      case "YEAR":
        newPeriodEnd = addYears(now, newPlan.intervalCount);
        break;
      default:
        newPeriodEnd = addMonths(now, 1); // Default to 1 month
    }

    // If upgrading, charge immediately
    // If downgrading, change will take effect at the end of the current period
    const effectiveDate = isUpgrade ? now : subscription.currentPeriodEnd;

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        planId: newPlanId,
        currentPeriodStart: isUpgrade ? now : subscription.currentPeriodStart,
        currentPeriodEnd: isUpgrade
          ? newPeriodEnd
          : subscription.currentPeriodEnd,
        nextBillingDate: isUpgrade
          ? newPeriodEnd
          : subscription.currentPeriodEnd,
        paymentMethodId: paymentMethodId || subscription.paymentMethodId,
        cancelAtPeriodEnd: false, // Reset cancellation if it was set
      },
      include: {
        plan: true,
      },
    });

    // Create invoice for immediate payment if upgrading
    if (isUpgrade && (paymentMethodId || subscription.paymentMethodId)) {
      await invoiceService.createInvoice(subscriptionId);
    }

    // Update organization with subscription plan info
    await prisma.organization.update({
      where: { id: subscription.organizationId },
      data: {
        subscriptionPlan: {
          connect: { id: newPlanId }
        },
      },
    });

    return updatedSubscription;
  },

  /**
   * Update payment method for subscription
   */
  async updatePaymentMethod(subscriptionId: string, paymentMethodId: string) {
    // Verify payment method exists
    const paymentMethod = await prisma.paymentMethodDetails.findUnique({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod) {
      throw new Error("Payment method not found");
    }

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        paymentMethodId,
      },
      include: {
        plan: true,
      },
    });

    return updatedSubscription;
  },

  /**
   * Update cancellation status
   */
  async updateCancellation(subscriptionId: string, cancelAtPeriodEnd: boolean) {
    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd,
        canceledAt: cancelAtPeriodEnd ? new Date() : null,
      },
      include: {
        plan: true,
      },
    });

    return updatedSubscription;
  },

  /**
   * Cancel subscription immediately
   */
  async cancelSubscription(subscriptionId: string) {
    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Update subscription
    const canceledSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
        endDate: new Date(),
      },
      include: {
        plan: true,
      },
    });

    // Update organization to remove subscription plan
    await prisma.organization.update({
      where: { id: subscription.organizationId },
      data: {
        subscriptionPlan: {
          disconnect: true,
        },
      },
    });

    return canceledSubscription;
  },

  /**
   * Process subscription renewals
   * This should be called by a scheduled job
   */
  async processRenewals() {
    const now = new Date();

    // Find subscriptions due for renewal
    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        nextBillingDate: {
          lte: now,
        },
        status: {
          in: ["ACTIVE", "TRIALING"],
        },
        cancelAtPeriodEnd: false,
      },
      include: {
        plan: true,
      },
    });

    const results = [];

    for (const subscription of dueSubscriptions) {
      try {
        // Handle trial ending
        if (
          subscription.status === "TRIALING" &&
          subscription.trialEndDate &&
          subscription.trialEndDate <= now
        ) {
          // If no payment method, mark as incomplete
          if (!subscription.paymentMethodId) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: "INCOMPLETE",
              },
            });
            results.push({
              subscriptionId: subscription.id,
              status: "INCOMPLETE",
              message: "Trial ended but no payment method available",
            });
            continue;
          }

          // Create invoice for trial end
          await invoiceService.createInvoice(subscription.id);
        }

        // Calc new billing period
        let newPeriodEnd;
        switch (subscription.plan.interval) {
          case "DAY":
            newPeriodEnd = addDays(now, subscription.plan.intervalCount);
            break;
          case "WEEK":
            newPeriodEnd = addDays(now, subscription.plan.intervalCount * 7);
            break;
          case "MONTH":
            newPeriodEnd = addMonths(now, subscription.plan.intervalCount);
            break;
          case "YEAR":
            newPeriodEnd = addYears(now, subscription.plan.intervalCount);
            break;
          default:
            newPeriodEnd = addMonths(now, 1);
        }

        // Update subscription
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "ACTIVE", // Move from trial to active if applicable
            currentPeriodStart: now,
            currentPeriodEnd: newPeriodEnd,
            nextBillingDate: newPeriodEnd,
            lastPaymentDate: now,
          },
        });

        // Create invoice for the new period
        if (subscription.status === "ACTIVE") {
          await invoiceService.createInvoice(subscription.id);
        }

        results.push({
          subscriptionId: subscription.id,
          status: "RENEWED",
          message: "Subscription renewed successfully",
        });
      } catch (error) {
        console.error(`Error renewing subscription ${subscription.id}:`, error);
        results.push({
          subscriptionId: subscription.id,
          status: "ERROR",
          message: (error as any).message,
        });
      }
    }

    // Handle subscriptions marked for cancellation at period end
    const cancelingSubscriptions = await prisma.subscription.findMany({
      where: {
        currentPeriodEnd: {
          lte: now,
        },
        cancelAtPeriodEnd: true,
        status: "ACTIVE",
      },
    });

    for (const subscription of cancelingSubscriptions) {
      try {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "CANCELED",
            endDate: now,
          },
        });

        // Update organization to remove subscription plan
        await prisma.organization.update({
          where: { id: subscription.organizationId },
          data: {
            subscriptionPlan: {
              disconnect: true,
            },
          },
        });

        results.push({
          subscriptionId: subscription.id,
          status: "CANCELED",
          message: "Subscription canceled at period end",
        });
      } catch (error) {
        console.error(
          `Error canceling subscription ${subscription.id}:`,
          error
        );
        results.push({
          subscriptionId: subscription.id,
          status: "ERROR",
          message: (error as any).message,
        });
      }
    }

    return results;
  },
};
