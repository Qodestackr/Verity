
import prisma from "@/lib/prisma"
import type {
    EventType,
    Event,
    Campaign,
    OfferType,
    CampaignType,
    CampaignStatus,
    TriggerType,
    Platform,
    ActionType
} from "@/types/campaign"

export class EventAutomation {
    // Create event and auto-schedule marketing
    async createEventWithMarketing(eventData: {
        name: string
        type: EventType
        scheduledFor: Date
        organizationId: string
        locationId?: string
        offerDetails: {
            requiredEmoji: string
            freeItem: string
            minQuantity: number
        }
    }) {
        // 1. Create the event
        const event = await prisma.event.create({
            data: {
                name: eventData.name,
                type: eventData.type,
                scheduledFor: eventData.scheduledFor,
                organizationId: eventData.organizationId,
                locationId: eventData.locationId,
                autoPromote: true,
                promoStartTime: 180, // 3 hours before
                offerType: "BUY_X_GET_FREE_ITEM" as OfferType,
                requiredEmoji: eventData.offerDetails.requiredEmoji,
                freeItem: eventData.offerDetails.freeItem,
                minQuantity: eventData.offerDetails.minQuantity,
            },
            include: {
                organization: true,
                location: true,
                campaigns: true
            }
        })

        // 2. Schedule marketing campaigns
        await this.scheduleEventCampaigns(event)

        // 3. Set up automation rules
        await this.createEventAutomationRules(event)

        return event
    }

    // Schedule multiple campaigns for an event
    private async scheduleEventCampaigns(event: Event) {
        const campaigns = [
            {
                name: `${event.name} - Early Bird`,
                scheduledFor: new Date(event.scheduledFor.getTime() - 24 * 60 * 60 * 1000), // 24h before
                message: `Tomorrow night! 🎉 ${event.name}. Pre-order now: 3 Tuskers + FREE ${event.freeItem} = ${event.requiredEmoji}`,
                platforms: ["FACEBOOK", "INSTAGRAM"],
            },
            {
                name: `${event.name} - Final Call`,
                scheduledFor: new Date(event.scheduledFor.getTime() - 3 * 60 * 60 * 1000), // 3h before
                message: `Starting soon! 🎵 ${event.name}. Last chance: ${event.requiredEmoji} = 3 Tuskers + FREE ${event.freeItem}!`,
                platforms: ["WHATSAPP"],
            },
            {
                name: `${event.name} - Live Now`,
                scheduledFor: event.scheduledFor,
                message: `We're LIVE! 🔥 ${event.name} in full swing. ${event.requiredEmoji} for instant delivery to your table!`,
                platforms: ["WHATSAPP"],
            },
        ]

        for (const campaignData of campaigns) {
            await prisma.campaign.create({
                data: {
                    name: campaignData.name,
                    scheduledFor: campaignData.scheduledFor,
                    message: campaignData.message,
                    platforms: campaignData.platforms as Platform[],
                    organizationId: event.organizationId,
                    eventId: event.id,
                    type: "EVENT_PROMOTION" as CampaignType,
                    status: "SCHEDULED" as CampaignStatus,
                    isAIGenerated: true,
                    aiConfidence: 85,
                    triggerType: "EVENT_APPROACHING" as TriggerType,
                    emoji: event.requiredEmoji,
                },
            })
        }
    }

    // Create automation rules for the event
    private async createEventAutomationRules(event: Event) {
        // Rule 1: Auto-respond to emoji replies
        await prisma.automationRule.create({
            data: {
                organizationId: event.organizationId,
                name: `Auto-respond to ${event.requiredEmoji} for ${event.name}`,
                triggerType: "CUSTOMER_BEHAVIOR" as TriggerType,
                actionType: "SEND_CAMPAIGN" as ActionType,
                conditions: {
                    emoji: event.requiredEmoji,
                    eventId: event.id,
                    platform: "WHATSAPP",
                },
                actionConfig: {
                    responseMessage: `Perfect! 🎯 3 Tuskers + FREE ${event.freeItem} confirmed. Delivery in 10 mins or pickup ready!`,
                    createOrder: true,
                    orderItems: [
                        { productSku: "TUSKER_500ML", quantity: 3 },
                        { productSku: event.freeItem, quantity: 1, price: 0 },
                    ],
                },
            },
        })

        // Rule 2: Send reminder if no response
        await prisma.automationRule.create({
            data: {
                organizationId: event.organizationId,
                name: `Reminder for ${event.name} non-responders`,
                triggerType: "EVENT_APPROACHING" as TriggerType,
                actionType: "SEND_CAMPAIGN" as ActionType,
                executeAt: new Date(event.scheduledFor.getTime() - 30 * 60 * 1000).toISOString(), // 30 min before
                conditions: {
                    eventId: event.id,
                    hasNotResponded: true,
                },
                actionConfig: {
                    message: `Don't miss out! 🏃‍♂️ ${event.name} starting in 30 mins. ${event.requiredEmoji} = instant order!`,
                    platforms: ["WHATSAPP"],
                },
            },
        })
    }
}

// TODO: To cron_jobs
export async function processScheduledCampaigns() {
    const now = new Date()

    // Find campaigns scheduled for now (within 5 minute window)
    const scheduledCampaigns = await prisma.campaign.findMany({
        where: {
            status: "SCHEDULED",
            scheduledFor: {
                gte: new Date(now.getTime() - 5 * 60 * 1000),
                lte: new Date(now.getTime() + 5 * 60 * 1000),
            },
        },
        include: {
            organization: true,
            event: true,
        },
    })

    for (const campaign of scheduledCampaigns) {
        try {
            // Execute the campaign
            await executeCampaign(campaign)

            // Update status
            await prisma.campaign.update({
                where: { id: campaign.id },
                data: { status: "ACTIVE" as CampaignStatus },
            })
        } catch (error) {
            console.error(`Failed to execute campaign ${campaign.id}:`, error)
        }
    }
}

async function executeCampaign(campaign: Campaign) {
    // This would integrate with WhatsApp Business API, Facebook Graph API, etc.
    console.log(`Executing campaign: ${campaign.name}`)
    console.log(`Message: ${campaign.message}`)
    console.log(`Platforms: ${campaign.platforms.join(", ")}`)

    // Update sent count
    await prisma.campaign.update({
        where: { id: campaign.id },
        data: { sent: { increment: 1 } },
    })
}

// create a quick event (for testing)
export async function createMugithiNight(organizationId: string, locationId?: string) {
    const automation = new EventAutomation()

    return await automation.createEventWithMarketing({
        name: "Mugithi Night Madness",
        type: "MUGITHI_NIGHT" as EventType,
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        organizationId,
        locationId,
        offerDetails: {
            requiredEmoji: "🍺",
            freeItem: "MUGITHI_MUG",
            minQuantity: 3
        }
    })
}

export async function createRhumbaEvening(organizationId: string, locationId?: string) {
    const automation = new EventAutomation()

    return await automation.createEventWithMarketing({
        name: "Rhumba Evening Vibes",
        type: "RHUMBA_EVENING" as EventType,
        scheduledFor: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
        organizationId,
        locationId,
        offerDetails: {
            requiredEmoji: "🎵",
            freeItem: "RHUMBA_COCKTAIL_MUG",
            minQuantity: 2
        }
    })
}


/*
import { EventAutomation, createMugithiNight } from './event-automation'
import { EventType } from './types'

const event = await createMugithiNight("org_123", "loc_456")

// Or create custom events
const automation = new EventAutomation()
const customEvent = await automation.createEventWithMarketing({
    name: "Saturday Karaoke Blast",
    type: "KARAOKE_NIGHT" as EventType,
    scheduledFor: new Date("2025-06-01T18:00:00"),
    organizationId: "org_123",
    offerDetails: {
        requiredEmoji: "🎤",
        freeItem: "KARAOKE_SNACK_PLATTER", 
        minQuantity: 5
    }
})
*/