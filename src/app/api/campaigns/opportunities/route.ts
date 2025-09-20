import { type NextRequest, NextResponse } from "next/server"
import { useCurrency } from "@/hooks/useCurrency";
import { BaridiService } from "@/services/baridi-service"
import { redis } from "@/lib/redis"
import { auth } from "@/lib/auth"
import { getStandardHeaders } from "@/utils/headers"

// Get marketing opportunities
export async function GET(request: NextRequest) {
    try {
        const standardHeaders = await getStandardHeaders()
        const session = await auth.api.getSession({ headers: standardHeaders })

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const organizationId = searchParams.get("organizationId")

        if (!organizationId) {
            return NextResponse.json({ error: "Organization ID required" }, { status: 400 })
        }

        // Check cache first
        const cacheKey = `opportunities:${organizationId}`
        const cachedData = await redis.get(cacheKey)

        if (cachedData) {
            return NextResponse.json(JSON.parse(cachedData))
        }

        // Get dead hour opportunities
        const deadHourOpportunities = await BaridiService.detectDeadHourOpportunities(organizationId)

        // Get event promotions
        const eventPromotions = await BaridiService.getUpcomingEventPromotions(organizationId)

        const result = {
            deadHourOpportunities,
            eventPromotions,
            timestamp: new Date().toISOString(),
            isDeadHour: deadHourOpportunities.length > 0,
        }

        // Cache for 5 minutes
        await redis.set(cacheKey, JSON.stringify(result), "EX", 300)

        return NextResponse.json(result)
    } catch (error) {
        console.error("Error fetching opportunities:", error)
        return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 })
    }
}

// Execute marketing opportunity
export async function POST(request: NextRequest) {
    try {
        const standardHeaders = await getStandardHeaders()
        const session = await auth.api.getSession({ headers: standardHeaders })

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { organizationId, opportunityId, type } = body

        if (!organizationId || !opportunityId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const result = await BaridiService.executeOpportunity(organizationId, opportunityId, session.user.id)

        return NextResponse.json({
            success: true,
            campaign: result,
            message: "Opportunity executed successfully",
        })
    } catch (error) {
        console.error("Error executing opportunity:", error)
        return NextResponse.json({ error: "Failed to execute opportunity" }, { status: 500 })
    }
}
