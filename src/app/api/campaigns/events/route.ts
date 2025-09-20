import { type NextRequest, NextResponse } from "next/server"
import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { auth } from "@/lib/auth"
import { getStandardHeaders } from "@/utils/headers"
import { BaridiService } from "@/services/baridi-service"

// Get events with pagination
export async function GET(request: NextRequest) {
    try {
        const standardHeaders = await getStandardHeaders()
        const session = await auth.api.getSession({ headers: standardHeaders })

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const organizationId = searchParams.get("organizationId")
        const upcoming = searchParams.get("upcoming") === "true"
        const page = Number.parseInt(searchParams.get("page") || "1")
        const limit = Number.parseInt(searchParams.get("limit") || "10")
        const skip = (page - 1) * limit

        if (!organizationId) {
            return NextResponse.json({ error: "Organization ID required" }, { status: 400 })
        }

        const cacheKey = `events:${organizationId}:${upcoming}:${page}:${limit}`
        const cachedData = await redis.get(cacheKey)

        if (cachedData) {
            return NextResponse.json(JSON.parse(cachedData))
        }

        const where: any = { organizationId }

        if (upcoming) {
            where.scheduledFor = {
                gte: new Date(),
            }
        }

        const [events, total] = await Promise.all([
            prisma.event.findMany({
                where,
                include: {
                    location: true,
                    campaigns: {
                        select: {
                            id: true,
                            name: true,
                            status: true,
                            sent: true,
                            converted: true,
                            revenue: true,
                        },
                    },
                },
                orderBy: {
                    scheduledFor: upcoming ? "asc" : "desc",
                },
                skip,
                take: limit,
            }),
            prisma.event.count({ where }),
        ])

        const result = {
            events,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        }

        // Cache for 10 minutes
        await redis.set(cacheKey, JSON.stringify(result), "EX", 600)

        return NextResponse.json(result)
    } catch (error) {
        console.error("Error fetching events:", error)
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
    }
}

// Create new event with auto-marketing
export async function POST(request: NextRequest) {
    try {
        const standardHeaders = await getStandardHeaders()
        const session = await auth.api.getSession({ headers: standardHeaders })

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { organizationId, name, type, scheduledFor, locationId, requiredEmoji, freeItem, minQuantity, autoPromote } =
            body

        if (!organizationId || !name || !type || !scheduledFor || !requiredEmoji) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const event = await BaridiService.createEventWithMarketing({
            organizationId,
            name,
            type,
            scheduledFor: new Date(scheduledFor),
            locationId,
            requiredEmoji,
            freeItem: freeItem || "branded mug",
            minQuantity: minQuantity || 3,
        })

        // Clear cache
        const cachePattern = `events:${organizationId}:*`
        const keys = await redis.keys(cachePattern)
        if (keys.length > 0) {
            await redis.del(keys)
        }

        return NextResponse.json(event, { status: 201 })
    } catch (error) {
        console.error("Error creating event:", error)
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
    }
}
