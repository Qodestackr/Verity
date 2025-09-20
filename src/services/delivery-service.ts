import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";

// Service for handling delivery-related business logic
export class DeliveryService {
  /**
   * Create a delivery from an order
   */
  static async createDeliveryFromOrder(orderId: string, driverId?: string) {
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const delivery = await prisma.delivery.create({
      data: {
        organizationId: order.organizationId,
        orderId: order.id,
        driverId: driverId,
        status: driverId ? "ASSIGNED" : "PENDING",
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
        customerName: order.customer?.name || "Customer",
        customerPhone: order.customer?.phone || "",
        customerAddress: "", // This would need to be populated from order shipping address
        priority: "MEDIUM",
        // Create standard checklist items
        checklistItems: {
          create: [
            { name: "Verify Order Items" },
            { name: "Obtain Customer Signature" },
            { name: "Capture Proof of Delivery" },
            { name: "Collect Payment (if applicable)" },
          ],
        },
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PROCESSING",
        fulfillmentStatus: "unfulfilled",
      },
    });

    return delivery;
  }

  /**
   * Assign a driver to multiple deliveries
   */
  static async assignDriverToDeliveries(
    driverId: string,
    deliveryIds: string[]
  ) {
    // Check if driver exists
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new Error("Driver not found");
    }

    // Update deliveries
    const result = await prisma.delivery.updateMany({
      where: {
        id: { in: deliveryIds },
        status: "PENDING", // Only update pending deliveries
      },
      data: {
        driverId,
        status: "ASSIGNED",
      },
    });

    return result;
  }

  /**
   * Get delivery statistics for an organization
   */
  static async getDeliveryStats(
    organizationId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    // Set default date range to last 30 days if not provided
    const end = endDate || new Date();
    const start =
      startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get delivery counts by status
    const statusCounts = await prisma.$queryRaw<
      Array<{ status: string; count: bigint }>
    >`
      SELECT status, COUNT(*) as count
      FROM "Delivery"
      WHERE "organizationId" = ${organizationId}
      AND "createdAt" BETWEEN ${start} AND ${end}
      GROUP BY status
    `;

    // Get delivery counts by priority
    const priorityCounts = await prisma.$queryRaw<
      Array<{ priority: string; count: bigint }>
    >`
      SELECT priority, COUNT(*) as count
      FROM "Delivery"
      WHERE "organizationId" = ${organizationId}
      AND "createdAt" BETWEEN ${start} AND ${end}
      GROUP BY priority
    `;

    // Get driver performance
    const driverPerformance = await prisma.$queryRaw<
      Array<{
        driverId: string;
        driverName: string;
        totalDeliveries: bigint;
        completedDeliveries: bigint;
        failedDeliveries: bigint;
        avgCompletionTime: number;
      }>
    >`
      SELECT 
        d."driverId",
        dr.name as "driverName",
        COUNT(*) as "totalDeliveries",
        SUM(CASE WHEN d.status = 'DELIVERED' THEN 1 ELSE 0 END) as "completedDeliveries",
        SUM(CASE WHEN d.status = 'FAILED' THEN 1 ELSE 0 END) as "failedDeliveries",
        AVG(EXTRACT(EPOCH FROM (d."completedAt" - d."scheduledFor")) / 3600) as "avgCompletionTime"
      FROM "Delivery" d
      JOIN "Driver" dr ON d."driverId" = dr.id
      WHERE d."organizationId" = ${organizationId}
      AND d."createdAt" BETWEEN ${start} AND ${end}
      AND d."driverId" IS NOT NULL
      GROUP BY d."driverId", dr.name
    `;

    return {
      statusCounts: statusCounts.map((item) => ({
        status: item.status,
        count: Number(item.count),
      })),
      priorityCounts: priorityCounts.map((item) => ({
        priority: item.priority,
        count: Number(item.count),
      })),
      driverPerformance: driverPerformance.map((item) => ({
        driverId: item.driverId,
        driverName: item.driverName,
        totalDeliveries: Number(item.totalDeliveries),
        completedDeliveries: Number(item.completedDeliveries),
        failedDeliveries: Number(item.failedDeliveries),
        avgCompletionTime: item.avgCompletionTime,
      })),
    };
  }
}
