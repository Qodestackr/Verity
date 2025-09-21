import { Organization } from "@prisma/client"

export enum EventType {
    MUGITHI_NIGHT = "MUGITHI_NIGHT",
    RHUMBA_EVENING = "RHUMBA_EVENING",
    KARAOKE_NIGHT = "KARAOKE_NIGHT",
    LIVE_BAND = "LIVE_BAND",
    DJ_NIGHT = "DJ_NIGHT",
    SPORTS_VIEWING = "SPORTS_VIEWING",
    HAPPY_HOUR = "HAPPY_HOUR",
    CULTURAL_EVENT = "CULTURAL_EVENT",
    PRIVATE_PARTY = "PRIVATE_PARTY",
    CORPORATE_EVENT = "CORPORATE_EVENT"
}

export enum OfferType {
    BUY_X_GET_FREE_ITEM = "BUY_X_GET_FREE_ITEM",
    PERCENTAGE_DISCOUNT = "PERCENTAGE_DISCOUNT",
    FIXED_DISCOUNT = "FIXED_DISCOUNT",
    BUNDLE_DEAL = "BUNDLE_DEAL",
    LOYALTY_POINTS = "LOYALTY_POINTS"
}

export enum CampaignType {
    EVENT_PROMOTION = "EVENT_PROMOTION",
    DEAD_HOUR_BOOST = "DEAD_HOUR_BOOST",
    LOYALTY_NUDGE = "LOYALTY_NUDGE",
    RESTOCK_ALERT = "RESTOCK_ALERT",
    FLASH_SALE = "FLASH_SALE",
    SEASONAL_PUSH = "SEASONAL_PUSH"
}

export enum CampaignStatus {
    DRAFT = "DRAFT",
    SCHEDULED = "SCHEDULED",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export enum TriggerType {
    DEAD_HOUR_DETECTED = "DEAD_HOUR_DETECTED",
    EVENT_APPROACHING = "EVENT_APPROACHING",
    LOW_STOCK = "LOW_STOCK",
    WEATHER_CHANGE = "WEATHER_CHANGE",
    COMPETITOR_ACTIVITY = "COMPETITOR_ACTIVITY",
    CUSTOMER_BEHAVIOR = "CUSTOMER_BEHAVIOR",
    MANUAL = "MANUAL"
}

export enum Platform {
    WHATSAPP = "WHATSAPP",
    FACEBOOK = "FACEBOOK",
    INSTAGRAM = "INSTAGRAM",
    SMS = "SMS"
}

export enum ActionType {
    SEND_CAMPAIGN = "SEND_CAMPAIGN",
    CREATE_EVENT = "CREATE_EVENT",
    ADJUST_PRICING = "ADJUST_PRICING",
    NOTIFY_STAFF = "NOTIFY_STAFF",
    UPDATE_INVENTORY = "UPDATE_INVENTORY",
    SCHEDULE_DELIVERY = "SCHEDULE_DELIVERY"
}

// Main types that match your Prisma models
export interface Event {
    id: string
    organizationId: string
    name: string
    type: EventType
    locationId?: string
    location?: GeoLocation
    radius?: number
    scheduledFor: Date
    duration?: number
    autoPromote: boolean
    promoStartTime: number
    offerType?: OfferType
    offerValue?: number
    requiredEmoji?: string
    freeItem?: string
    minQuantity?: number
    organization: Organization
    campaigns: Campaign[]
}

export interface Campaign {
    id: string
    organizationId: string
    eventId?: string
    name: string
    type: CampaignType
    status: CampaignStatus
    isAIGenerated: boolean
    aiConfidence?: number
    triggerType?: TriggerType
    locationId?: string
    location?: GeoLocation
    targetRadius?: number
    scheduledFor?: Date
    autoSendAt?: Date
    message: string
    emoji?: string
    platforms: Platform[]
    sent: number
    delivered: number
    opened: number
    replied: number
    converted: number
    revenue: number
    organization: Organization
    event?: Event
    responses: CampaignResponse[]
}

export interface GeoLocation {
    id: string
    latitude: number
    longitude: number
    geohash: string
    address?: string
    city?: string
    region?: string
    organizations: Organization[]
    outlets: Outlet[]
    events: Event[]
    campaigns: Campaign[]
}

export interface Outlet {
    id: string
    organizationId: string
    name: string
    locationId: string
    location: GeoLocation
    avgFootfall: number
    peakHours?: any // JSON field
    competitorCount: number
    organization: Organization
}

export interface CampaignResponse {
    id: string
    campaignId: string
    customerId: string
    platform: Platform
    message: string
    emoji?: string
    quantity?: number
    isConverted: boolean
    orderValue?: number
    respondedAt: Date
    campaign: Campaign
}

export interface AutomationRule {
    id: string
    organizationId: string
    name: string
    isActive: boolean
    triggerType: TriggerType
    conditions: any // JSON field
    actionType: ActionType
    actionConfig: any // JSON field
    executeAt?: string
    cooldownMinutes: number
    timesTriggered: number
    successRate: number
    avgRevenue: number
    createdAt: Date
    updatedAt: Date
}

export interface DeadHourPattern {
    id: string
    organizationId: string
    dayOfWeek: number
    hourStart: number
    hourEnd: number
    severity: number
    bestAction: ActionType
    avgLift: number
    confidence: number
    lastUpdated: Date
}