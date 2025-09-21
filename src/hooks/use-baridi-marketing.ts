
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/auth-client"
import { toast } from "sonner"

interface MarketingOpportunity {
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

interface EventPromotion {
    eventId: string
    eventName: string
    scheduledFor: string
    message: string
    emoji: string
    freeItem: string
    minQuantity: number
}

interface CampaignStats {
    overview: {
        totalCampaigns: number
        totalSent: number
        totalDelivered: number
        totalOpened: number
        totalReplied: number
        totalConverted: number
        totalRevenue: number
        deliveryRate: number
        openRate: number
        responseRate: number
        conversionRate: number
    }
    platformStats: Array<{
        platform: string
        responses: number
        conversions: number
        conversionRate: number
    }>
    topCampaigns: Array<{
        id: string
        name: string
        type: string
        conversionRate: number
        revenue: number
        roi: number
    }>
}

interface CreateEventData {
    organizationId: string
    name: string
    type: string
    scheduledFor: string
    locationId?: string
    requiredEmoji: string
    freeItem: string
    minQuantity: number
}

const getCurrentOrgId = () => {
    const { data: activeOrganization } = client.useActiveOrganization()
    return activeOrganization?.id || ""
}

const fetchOpportunities = async (organizationId: string) => {
    const response = await fetch(`/api/campaigns/opportunities?organizationId=${organizationId}`)
    if (!response.ok) throw new Error("Failed to fetch opportunities")
    return response.json()
}

const executeOpportunity = async (data: { organizationId: string; opportunityId: string; type: string }) => {
    const response = await fetch("/api/campaigns/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to execute opportunity")
    return response.json()
}

const fetchCampaignStats = async (organizationId: string, days: number = 30) => {
    const response = await fetch(`/api/campaigns/stats?organizationId=${organizationId}&days=${days}`)
    if (!response.ok) throw new Error("Failed to fetch campaign stats")
    return response.json()
}

const createEvent = async (data: CreateEventData) => {
    const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create event")
    return response.json()
}

const fetchEvents = async (organizationId: string, upcoming: boolean = true) => {
    const response = await fetch(`/api/events?organizationId=${organizationId}&upcoming=${upcoming}`)
    if (!response.ok) throw new Error("Failed to fetch events")
    return response.json()
}

// Custom hooks
export const useBaridiOpportunities = () => {
    const orgId = getCurrentOrgId()

    return useQuery({
        queryKey: ["baridi-opportunities", orgId],
        queryFn: () => fetchOpportunities(orgId),
        enabled: !!orgId,
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

export const useExecuteOpportunity = () => {
    const queryClient = useQueryClient()
    const orgId = getCurrentOrgId()

    return useMutation({
        mutationFn: executeOpportunity,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["baridi-opportunities"] })
            queryClient.invalidateQueries({ queryKey: ["campaign-stats"] })

            toast.success("Baridi AI Activated! 🤖", {
                description: `Campaign launched successfully - Expected revenue: KES ${data.campaign?.revenue || 0}`,
            })
        },
        onError: (error: any) => {
            toast.error("Execution failed", {
                description: error.message || "Please try again",
            })
        },
    })
}

export const useCampaignStats = (days: number = 30) => {
    const orgId = getCurrentOrgId()

    return useQuery({
        queryKey: ["campaign-stats", orgId, days],
        queryFn: () => fetchCampaignStats(orgId, days),
        enabled: !!orgId,
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}

export const useCreateEvent = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createEvent,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["events"] })
            queryClient.invalidateQueries({ queryKey: ["baridi-opportunities"] })

            toast.success("Event Created! 🎉", {
                description: `${data.name} scheduled with auto-marketing campaigns`,
            })
        },
        onError: (error: any) => {
            toast.error("Failed to create event", {
                description: error.message || "Please try again",
            })
        },
    })
}

export const useEvents = (upcoming: boolean = true) => {
    const orgId = getCurrentOrgId()

    return useQuery({
        queryKey: ["events", orgId, upcoming],
        queryFn: () => fetchEvents(orgId, upcoming),
        enabled: !!orgId,
        staleTime: 5 * 60 * 1000,
    })
}

// Real-time dead hour detection
export const useDeadHourDetection = () => {
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay()

    // Dead hours: 11AM-2PM and 3PM-5PM on weekdays
    const isDeadHour = dayOfWeek >= 1 && dayOfWeek <= 5 && ((hour >= 11 && hour <= 14) || (hour >= 15 && hour <= 17))

    return { isDeadHour, currentHour: hour, dayOfWeek }
}
