// Debug endpoint checking what's in db
import { type NextRequest, NextResponse } from "next/server"
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        // Get all subscription plans
        const allPlans = await prisma.subscriptionPlan.findMany({
            orderBy: {
                price: "asc",
            },
        })

        // Get plans by business type
        const retailerPlans = await prisma.subscriptionPlan.findMany({
            where: {
                isActive: true,
                businessType: "RETAILER",
            },
        })

        const wholesalerPlans = await prisma.subscriptionPlan.findMany({
            where: {
                isActive: true,
                businessType: "WHOLESALER",
            },
        })

        const distributorPlans = await prisma.subscriptionPlan.findMany({
            where: {
                isActive: true,
                businessType: "DISTRIBUTOR",
            },
        })

        return NextResponse.json({
            debug: true,
            timestamp: new Date().toISOString(),
            counts: {
                total: allPlans.length,
                retailer: retailerPlans.length,
                wholesaler: wholesalerPlans.length,
                distributor: distributorPlans.length,
            },
            allPlans,
            plansByType: {
                retailer: retailerPlans,
                wholesaler: wholesalerPlans,
                distributor: distributorPlans,
            },
        })
    } catch (error) {
        console.error("Debug endpoint error:", error)
        return NextResponse.json({ error: "Failed to fetch debug info", details: error }, { status: 500 })
    }
}
