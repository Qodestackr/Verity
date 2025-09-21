import { type NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { auth } from "@/lib/auth"
import { getStandardHeaders } from "@/utils/headers"

// Get campaign performance statistics
export async function GET(request: NextRequest) {
    try {
        const standardHeaders = await getStandardHeaders()
        const session = await auth.api.getSession({ headers: standardHeaders })

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const organizationId = searchParams.get("organizationId")
        const days = Number.parseInt(searchParams.get("days") || "30")

        if (!organizationId) {
            return NextResponse.json({ error: "Organization ID required" }, { status: 400 })
        }

        const cacheKey = `campaign-stats:${organizationId}:${days}`
        const cachedData = await redis.get(cacheKey)

        if (cachedData) {
            return NextResponse.json(JSON.parse(cachedData))
        }

        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

        // Get campaign performance
        const campaigns = await prisma.campaign.findMany({
            where: {
                organizationId,
                createdAt: { gte: startDate },
            },
            include: {
                responses: true,
                event: {
                    select: { name: true, type: true },
                },
            },
        })

        // Calculate metrics
        const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0)
        const totalDelivered = campaigns.reduce((sum, c) => sum + c.delivered, 0)
        const totalOpened = campaigns.reduce((sum, c) => sum + c.opened, 0)
        const totalReplied = campaigns.reduce((sum, c) => sum + c.replied, 0)
        const totalConverted = campaigns.reduce((sum, c) => sum + c.converted, 0)
        const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0)

        // Platform performance
        const platformStats = await prisma.$queryRaw<Array<{ platform: string; responses: bigint; conversions: bigint }>>`
      SELECT 
        platform,
        COUNT(*) as responses,
        SUM(CASE WHEN "isConverted" = true THEN 1 ELSE 0 END) as conversions
      FROM "CampaignResponse" cr
      JOIN "Campaign" c ON cr."campaignId" = c.id
      WHERE c."organizationId" = ${organizationId}
      AND cr."respondedAt" >= ${startDate}
      GROUP BY platform
    `

        // Best performing campaigns
        const topCampaigns = campaigns
            .filter((c) => c.sent > 0)
            .map((c) => ({
                id: c.id,
                name: c.name,
                type: c.type,
                conversionRate: c.sent > 0 ? (c.converted / c.sent) * 100 : 0,
                revenue: c.revenue,
                roi: c.revenue > 0 ? ((c.revenue - 100) / 100) * 100 : 0, // Assuming KES 100 cost per campaign
            }))
            .sort((a, b) => b.conversionRate - a.conversionRate)
            .slice(0, 5)

        const result = {
            overview: {
                totalCampaigns: campaigns.length,
                totalSent,
                totalDelivered,
                totalOpened,
                totalReplied,
                totalConverted,
                totalRevenue,
                deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
                openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
                responseRate: totalOpened > 0 ? (totalReplied / totalOpened) * 100 : 0,
                conversionRate: totalReplied > 0 ? (totalConverted / totalReplied) * 100 : 0,
            },
            platformStats: platformStats.map((p) => ({
                platform: p.platform,
                responses: Number(p.responses),
                conversions: Number(p.conversions),
                conversionRate: Number(p.responses) > 0 ? (Number(p.conversions) / Number(p.responses)) * 100 : 0,
            })),
            topCampaigns,
            period: { days, startDate, endDate: new Date() },
        }

        // Cache for 1 hour
        await redis.set(cacheKey, JSON.stringify(result), "EX", 3600)

        return NextResponse.json(result)
    } catch (error) {
        console.error("Error fetching campaign stats:", error)
        return NextResponse.json({ error: "Failed to fetch campaign stats" }, { status: 500 })
    }
}
