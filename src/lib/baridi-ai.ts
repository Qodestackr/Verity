// Baridi AI Engine - The Brain Behind Micro Marketing
interface EventContext {
    weather: string
    temperature: number
    dayOfWeek: number
    hour: number
    nearbyEvents: string[]
    competitorActivity: string[]
    customerMood: "high" | "medium" | "low"
}

interface MarketingOpportunity {
    type: "event_promo" | "dead_hour" | "weather_based" | "competitor_response"
    confidence: number
    expectedRevenue: number
    urgency: "high" | "medium" | "low"
    message: string
    emoji?: string
    platforms: string[] // Declare Platform as string[]
    targetCustomers: string[]
}

interface Event {
    name: string
    scheduledFor: Date
    freeItem: string
    autoPromote: boolean
}

export class BaridiAI {
    // Core intelligence: Detect marketing opportunities
    async detectOpportunities(organizationId: string, context: EventContext): Promise<MarketingOpportunity[]> {
        const opportunities: MarketingOpportunity[] = []

        // 1. Dead Hour Detection
        if (this.isDeadHour(context)) {
            opportunities.push(await this.generateDeadHourCampaign(organizationId, context))
        }

        // 2. Event-Based Opportunities
        const upcomingEvents = await this.getUpcomingEvents(organizationId)
        for (const event of upcomingEvents) {
            if (this.shouldPromoteEvent(event, context)) {
                opportunities.push(await this.generateEventCampaign(event, context))
            }
        }

        // 3. Weather-Based Opportunities
        if (context.weather === "hot" && context.temperature > 28) {
            opportunities.push(await this.generateWeatherCampaign(organizationId, "hot"))
        }

        // 4. Competitor Response
        if (context.competitorActivity.length > 0) {
            opportunities.push(await this.generateCompetitorResponse(organizationId, context))
        }

        return opportunities.sort((a, b) => b.confidence - a.confidence)
    }

    // Generate event promotion (Mugithi night example)
    private async generateEventCampaign(event: Event, context: EventContext): Promise<MarketingOpportunity> {
        const timeUntilEvent = (event.scheduledFor.getTime() - Date.now()) / (1000 * 60) // minutes

        // Different messages based on timing
        let message = ""
        let urgency: "high" | "medium" | "low" = "medium"

        if (timeUntilEvent <= 120) {
            // 2 hours before
            message = `🎵 ${event.name} starting soon! Reply with 🍺 to order 3 Tuskers + get a FREE ${event.freeItem}! Limited time!`
            urgency = "high"
        } else if (timeUntilEvent <= 360) {
            // 6 hours before
            message = `Tonight's the night! 🎉 ${event.name} at 8PM. Pre-order 3 Tuskers with 🍺 and get a FREE ${event.freeItem}!`
            urgency = "medium"
        } else {
            message = `Mark your calendar! 📅 ${event.name} this ${this.getDayName(event.scheduledFor)}. Early bird: 3 Tuskers + FREE ${event.freeItem} = 🍺`
            urgency = "low"
        }

        return {
            type: "event_promo",
            confidence: 85 + (urgency === "high" ? 10 : 0),
            expectedRevenue: this.calculateEventRevenue(event, timeUntilEvent),
            urgency,
            message,
            emoji: "🍺",
            platforms: ["whatsapp", "facebook"], // WhatsApp for direct orders, Facebook for awareness
            targetCustomers: await this.getEventTargetCustomers(event),
        }
    }

    // Dead hour campaign generation
    private async generateDeadHourCampaign(organizationId: string, context: EventContext): Promise<MarketingOpportunity> {
        const deadHourMessages = [
            "Lunch break sorted! 🍻 Cold Tusker + samosa combo = KES 200. Reply 🍺 to order!",
            "Beat the 3PM slump! ☀️ Ice-cold beer delivery in 15 mins. Reply 🍺 for instant refresh!",
            "Office stress? 😅 Quick beer break - Tusker 500ml = KES 150. Reply 🍺 for pickup!",
        ]

        return {
            type: "dead_hour",
            confidence: 72,
            expectedRevenue: 1500,
            urgency: "high",
            message: deadHourMessages[Math.floor(Math.random() * deadHourMessages.length)],
            emoji: "🍺",
            platforms: ["whatsapp"], // WhatsApp best for urgent offers
            targetCustomers: await this.getNearbyCustomers(organizationId, 2), // 2km radius
        }
    }

    // Smart timing: When to send campaigns
    getOptimalSendTime(campaignType: string, eventTime?: Date): Date {
        const now = new Date()

        switch (campaignType) {
            case "event_promo":
                if (eventTime) {
                    // Send 3 hours before event for maximum impact
                    return new Date(eventTime.getTime() - 3 * 60 * 60 * 1000)
                }
                break

            case "dead_hour":
                // Send immediately during dead hours
                return now

            case "weather_based":
                // Send when weather peaks (hottest part of day)
                const optimal = new Date(now)
                optimal.setHours(15, 0, 0, 0) // 3 PM
                return optimal
        }

        return now
    }

    // Helper methods
    private isDeadHour(context: EventContext): boolean {
        const { hour, dayOfWeek } = context

        // Weekday dead hours: 11AM-2PM, 3PM-5PM
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            return (hour >= 11 && hour <= 14) || (hour >= 15 && hour <= 17)
        }

        return false
    }

    private shouldPromoteEvent(event: Event, context: EventContext): boolean {
        const timeUntilEvent = (event.scheduledFor.getTime() - Date.now()) / (1000 * 60 * 60) // hours

        // Promote events 1-24 hours before
        return timeUntilEvent > 1 && timeUntilEvent <= 24 && event.autoPromote
    }

    private calculateEventRevenue(event: Event, timeUntilEvent: number): number {
        // Closer to event = higher expected revenue
        const urgencyMultiplier = timeUntilEvent <= 120 ? 1.5 : 1.0
        const baseRevenue = 2500 // Base expected revenue per event campaign

        return Math.floor(baseRevenue * urgencyMultiplier)
    }

    private getDayName(date: Date): string {
        return date.toLocaleDateString("en-US", { weekday: "long" })
    }

    // These would connect to your actual customer/location data
    private async getEventTargetCustomers(event: Event): Promise<string[]> {
        // Logic to find customers who:
        // 1. Are within radius of event location
        // 2. Have attended similar events before
        // 3. Are active on the target platforms
        return [] // Placeholder
    }

    private async getNearbyCustomers(organizationId: string, radiusKm: number): Promise<string[]> {
        // Logic to find customers within radius during dead hours
        return [] // Placeholder
    }

    private async getUpcomingEvents(organizationId: string): Promise<Event[]> {
        // Get events in next 24 hours
        return [] // Placeholder
    }

    private async generateWeatherCampaign(organizationId: string, weather: string): Promise<MarketingOpportunity> {
        // Generate weather-appropriate campaigns
        return {
            type: "weather_based",
            confidence: 78,
            expectedRevenue: 1200,
            urgency: "medium",
            message: "Hot day alert! 🌡️ Ice-cold beer delivery = instant relief. Reply 🍺 for the coldest Tusker in town!",
            emoji: "🍺",
            platforms: ["whatsapp", "instagram"],
            targetCustomers: [],
        }
    }

    private async generateCompetitorResponse(
        organizationId: string,
        context: EventContext,
    ): Promise<MarketingOpportunity> {
        // Generate campaigns to counter competitor activity
        return {
            type: "competitor_response",
            confidence: 65,
            expectedRevenue: 1800,
            urgency: "high",
            message: "Better deal alert! 💪 Same beer, better price + FREE delivery. Reply 🍺 to switch & save!",
            emoji: "🍺",
            platforms: ["whatsapp"],
            targetCustomers: [],
        }
    }
}
