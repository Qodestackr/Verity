
import prisma from "@/lib/prisma"
import { redis } from "@/lib/redis"

export interface MarketingOpportunity {
    id: string
    type: "dead_hour" | "event_promo" | "weather_based" | "loyalty_nudge"
    title: string
    description: string
    message: string
    confidence: number
    expectedRevenue: number
    urgency: "high" | "medium" | "low"
    platforms: string[]
    targetCustomers: number
    emoji?: string
    estimatedTime: string
}

export interface EventPromotion {
    eventId: string
    eventName: string
    scheduledFor: Date
    message: string
    emoji: string
    freeItem: string
    minQuantity: number
}

export class BaridiService {
    /**
     * Detect marketing opportunities for dead hours
     */
    static async detectDeadHourOpportunities(organizationId: string): Promise<MarketingOpportunity[]> {
        const now = new Date()
        const hour = now.getHours()
        const dayOfWeek = now.getDay()

        // Check if it's a dead hour (11AM-2PM, 3PM-5PM on weekdays)
        const isDeadHour = dayOfWeek >= 1 && dayOfWeek <= 5 && ((hour >= 11 && hour <= 14) || (hour >= 15 && hour <= 17))

        if (!isDeadHour) {
            return []
        }

        // Get recent sales data to determine best opportunities
        const recentSales = await prisma.order.findMany({
            where: {
                organizationId,
                orderDate: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        })

        // Get low stock items
        const lowStockItems = await prisma.inventoryItem.findMany({
            where: {
                warehouse: {
                    organizationId,
                },
                quantity: {
                    lte: prisma.inventoryItem.fields.minStockLevel,
                },
            },
            include: {
                product: true,
            },
        })

        const opportunities: MarketingOpportunity[] = []

        // Lunch hour special
        if (hour >= 11 && hour <= 14) {
            opportunities.push({
                id: "lunch_special",
                type: "dead_hour",
                title: "Lunch Hour Flash Sale",
                description: "Target office workers with quick lunch combos",
                message: "Lunch break sorted! 🍻 Cold Tusker + samosa combo = KES 200. Reply 🍺 to order!",
                confidence: 87,
                expectedRevenue: 3200,
                urgency: "high",
                platforms: ["whatsapp"],
                targetCustomers: 45,
                emoji: "🍺",
                estimatedTime: "2 minutes",
            })
        }

        // Clear slow stock
        if (lowStockItems.length > 0) {
            const slowItem = lowStockItems[0]
            opportunities.push({
                id: "clear_stock",
                type: "dead_hour",
                title: "Clear Slow Stock",
                description: `Bundle ${slowItem.product.name} with popular items`,
                message: `Special combo! 🎯 ${slowItem.product.name} + Tusker = 20% off. Limited stock - reply 🍺!`,
                confidence: 72,
                expectedRevenue: 1800,
                urgency: "medium",
                platforms: ["whatsapp", "facebook"],
                targetCustomers: 23,
                emoji: "🍺",
                estimatedTime: "1 minute",
            })
        }

        return opportunities
    }

    /**
     * Get upcoming events that need promotion
     */
    static async getUpcomingEventPromotions(organizationId: string): Promise<EventPromotion[]> {
        const now = new Date()
        const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)

        const upcomingEvents = await prisma.event.findMany({
            where: {
                organizationId,
                scheduledFor: {
                    gte: now,
                    lte: next24Hours,
                },
                autoPromote: true,
            },
        })

        return upcomingEvents.map((event) => ({
            eventId: event.id,
            eventName: event.name,
            scheduledFor: event.scheduledFor,
            message: this.generateEventMessage(event),
            emoji: event.requiredEmoji || "🍺",
            freeItem: event.freeItem || "branded mug",
            minQuantity: event.minQuantity || 3,
        }))
    }

    /**
     * Execute a marketing opportunity
     */
    static async executeOpportunity(organizationId: string, opportunityId: string, userId: string) {
        // Create campaign record
        const campaign = await prisma.campaign.create({
            data: {
                organizationId,
                name: `Dead Hour Campaign - ${opportunityId}`,
                type: "DEAD_HOUR_BOOST",
                status: "ACTIVE",
                isAIGenerated: true,
                triggerType: "DEAD_HOUR_DETECTED",
                message: "Generated by Baridi AI",
                platforms: ["WHATSAPP"],
                sent: 0,
                delivered: 0,
                opened: 0,
                replied: 0,
                converted: 0,
                revenue: 0,
            },
        })

        // In a real implementation, this would:
        // 1. Send WhatsApp messages via Business API
        // 2. Post to Facebook/Instagram via Graph API
        // 3. Track delivery and responses
        // 4. Update campaign metrics

        // For now, simulate execution
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Update campaign with simulated results
        const updatedCampaign = await prisma.campaign.update({
            where: { id: campaign.id },
            data: {
                sent: 45,
                delivered: 42,
                status: "COMPLETED",
            },
        })

        // Clear cache
        await redis.del(`opportunities:${organizationId}`)

        return updatedCampaign
    }

    /**
     * Create event with auto-marketing
     */
    static async createEventWithMarketing(eventData: {
        organizationId: string
        name: string
        type: string
        scheduledFor: Date
        locationId?: string
        requiredEmoji: string
        freeItem: string
        minQuantity: number
    }) {
        const event = await prisma.event.create({
            data: {
                ...eventData,
                autoPromote: true,
                promoStartTime: 180, // 3 hours before
                offerType: "BUY_X_GET_FREE_ITEM",
            },
        })

        // Schedule promotion campaigns
        const campaigns = [
            {
                name: `${event.name} - Early Bird`,
                scheduledFor: new Date(event.scheduledFor.getTime() - 24 * 60 * 60 * 1000),
                message: `Tomorrow night! 🎉 ${event.name}. Pre-order: ${event.minQuantity} Tuskers + FREE ${event.freeItem} = ${event.requiredEmoji}`,
                platforms: ["FACEBOOK", "INSTAGRAM"],
            },
            {
                name: `${event.name} - Final Call`,
                scheduledFor: new Date(event.scheduledFor.getTime() - 3 * 60 * 60 * 1000),
                message: `Starting soon! 🎵 ${event.name}. Last chance: ${event.requiredEmoji} = ${event.minQuantity} Tuskers + FREE ${event.freeItem}!`,
                platforms: ["WHATSAPP"],
            },
        ]

        for (const campaignData of campaigns) {
            await prisma.campaign.create({
                data: {
                    ...campaignData,
                    organizationId: event.organizationId,
                    eventId: event.id,
                    type: "EVENT_PROMOTION",
                    status: "SCHEDULED",
                    isAIGenerated: true,
                    triggerType: "EVENT_APPROACHING",
                    emoji: event.requiredEmoji,
                },
            })
        }

        return event
    }

    /**
     * Handle customer response to campaign
     */
    static async handleCustomerResponse(campaignId: string, customerId: string, platform: string, message: string) {
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { event: true },
        })

        if (!campaign) {
            throw new Error("Campaign not found")
        }

        // Check if message contains required emoji
        const hasEmoji = campaign.emoji && message.includes(campaign.emoji)

        // Create response record
        const response = await prisma.campaignResponse.create({
            data: {
                campaignId,
                customerId,
                platform: platform.toUpperCase() as any,
                message,
                emoji: hasEmoji ? campaign.emoji : null,
                isConverted: hasEmoji,
                respondedAt: new Date(),
            },
        })

        // If converted, create order (simplified)
        if (hasEmoji && campaign.event) {
            // This would integrate with Saleor to create actual order
            const orderValue = 900 // 3 Tuskers @ KES 300 each

            await prisma.campaignResponse.update({
                where: { id: response.id },
                data: {
                    orderValue,
                    quantity: campaign.event.minQuantity,
                },
            })

            // Update campaign metrics
            await prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    converted: { increment: 1 },
                    revenue: { increment: orderValue },
                },
            })
        }

        return response
    }

    private static generateEventMessage(event: any): string {
        const timeUntilEvent = (event.scheduledFor.getTime() - Date.now()) / (1000 * 60) // minutes

        if (timeUntilEvent <= 120) {
            return `🎵 ${event.name} starting soon! Reply with ${event.requiredEmoji} to order ${event.minQuantity || 3} Tuskers + get a FREE ${event.freeItem}! Limited time!`
        } else if (timeUntilEvent <= 360) {
            return `Tonight's the night! 🎉 ${event.name} at 8PM. Pre-order ${event.minQuantity || 3} Tuskers with ${event.requiredEmoji} and get a FREE ${event.freeItem}!`
        } else {
            return `Mark your calendar! 📅 ${event.name} this weekend. Early bird: ${event.minQuantity || 3} Tuskers + FREE ${event.freeItem} = ${event.requiredEmoji}`
        }
    }
}
