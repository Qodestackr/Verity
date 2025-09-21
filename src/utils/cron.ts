import prisma from "@/lib/prisma";
import cron from "node-cron";
import { SubscriptionStatus } from "@prisma/client";

cron.schedule("0 0 * * *", async () => {
  const expiringTrials = await prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.TRIALING,
      trialEndDate: { lte: new Date() },
    },
  });

  expiringTrials.forEach(async (sub) => {
    // Trigger payment
    const amount = 0; //sub.pricePerUser * (await getOrgUserCount(sub.organizationId));

    // await chargeMpesa(sub.organization.mpesaNumber, amount);
    // If payment fails:
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: SubscriptionStatus.UNPAID },
    });
  });
});
