
import { APP_BASE_API_URL } from "@/config/urls"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Types based on your API structure
interface Driver {
    id: string
    name: string
    phone: string
    email?: string
    licenseNumber?: string
    licenseExpiry?: string
    vehicleType: "PERSONAL" | "VAN" | "TRUCK" | "MOTORBIKE"
    vehicleDetails?: {
        registration?: string
        model?: string
        color?: string
        year?: number
    }
    status: "AVAILABLE" | "ON_DELIVERY" | "ON_BREAK" | "OFFLINE"
    isActive: boolean
    currentLocation?: {
        latitude: number
        longitude: number
        accuracy?: number
    }
    rating?: number
    totalDeliveries?: number
    successfulDeliveries?: number
    failedDeliveries?: number
    organizationId: string
}

interface Delivery {
    id: string
    orderId?: string
    driverId?: string
    organizationId: string
    status: "PENDING" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED" | "FAILED" | "RESCHEDULED"
    scheduledFor: string
    customerName: string
    customerPhone: string
    customerAddress: string
    deliveryNotes?: string
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
    proofOfDelivery?: {
        images?: string[]
        signature?: string
        notes?: string
    }
    receivedBy?: string
    failureReason?: string
    completedAt?: string
    checklistItems?: DeliveryChecklistItem[]
    issues?: DeliveryIssue[]
    order?: {
        id: string
        orderNumber: string
        totalAmount: number
        paymentMethod: string
        paymentStatus: string
        items: OrderItem[]
    }
}

interface DeliveryChecklistItem {
    id: string
    deliveryId: string
    name: string
    isCompleted: boolean
    notes?: string
    completedAt?: string
}

interface DeliveryIssue {
    id: string
    deliveryId: string
    issueType: "STOCK_SHORTAGE" | "VEHICLE_BREAKDOWN" | "CUSTOMER_UNAVAILABLE" | "WRONG_ADDRESS" | "PAYMENT_ISSUE" | "OTHER"
    description: string
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
    reportedBy: string
    resolution?: string
    createdAt: string
}

interface DeliveryRoute {
    id: string
    organizationId: string
    driverId: string
    name: string
    date: string
    stops: string[] // Array of delivery IDs
    status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
    optimizationScore?: number
    totalDistance?: number
    estimatedDuration?: number
    actualDuration?: number
    startedAt?: string
    completedAt?: string
    driver?: Driver
    deliveries?: Delivery[]
}

interface OrderItem {
    id: string
    productId: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

// Driver Profile Query
export const useDriverProfile = (driverId?: string) => {
    return useQuery({
        queryKey: ["driver-profile", driverId],
        queryFn: async () => {
            if (!driverId) throw new Error("Driver ID required")

            const response = await fetch(`${APP_BASE_API_URL}/drivers/${driverId}`)
            if (!response.ok) {
                throw new Error("Failed to fetch driver profile")
            }
            return response.json() as Promise<Driver>
        },
        enabled: !!driverId,
    })
}

// Driver Deliveries Query
export const useDriverDeliveries = (organizationId: string, filters?: {
    status?: string
    driverId?: string
    date?: string
    search?: string
}) => {
    return useQuery({
        queryKey: ["driver-deliveries", organizationId, filters],
        queryFn: async () => {
            const params = new URLSearchParams({
                organizationId,
                ...(filters?.status && { status: filters.status }),
                ...(filters?.driverId && { driverId: filters.driverId }),
                ...(filters?.date && { date: filters.date }),
                ...(filters?.search && { search: filters.search }),
            })

            const response = await fetch(`${APP_BASE_API_URL}/deliveries?${params}`)
            if (!response.ok) {
                throw new Error("Failed to fetch deliveries")
            }
            return response.json() as Promise<Delivery[]>
        },
    })
}

// Single Delivery Query
export const useDelivery = (deliveryId: string) => {
    return useQuery({
        queryKey: ["delivery", deliveryId],
        queryFn: async () => {
            const response = await fetch(`${APP_BASE_API_URL}/deliveries/${deliveryId}`)
            if (!response.ok) {
                throw new Error("Failed to fetch delivery")
            }
            return response.json() as Promise<Delivery>
        },
        enabled: !!deliveryId,
    })
}

// Driver Routes Query
export const useDriverRoutes = (organizationId: string, filters?: {
    driverId?: string
    date?: string
    status?: string
}) => {
    return useQuery({
        queryKey: ["driver-routes", organizationId, filters],
        queryFn: async () => {
            const params = new URLSearchParams({
                organizationId,
                ...(filters?.driverId && { driverId: filters.driverId }),
                ...(filters?.date && { date: filters.date }),
                ...(filters?.status && { status: filters.status }),
            })

            const response = await fetch(`${APP_BASE_API_URL}/routes?${params}`)
            if (!response.ok) {
                throw new Error("Failed to fetch routes")
            }
            return response.json() as Promise<DeliveryRoute[]>
        },
    })
}

// Single Route Query
export const useRoute = (routeId: string) => {
    return useQuery({
        queryKey: ["route", routeId],
        queryFn: async () => {
            const response = await fetch(`${APP_BASE_API_URL}/routes/${routeId}`)
            if (!response.ok) {
                throw new Error("Failed to fetch route")
            }
            return response.json() as Promise<DeliveryRoute & { deliveries: Delivery[] }>
        },
        enabled: !!routeId,
    })
}

// Delivery Checklist Query
export const useDeliveryChecklist = (deliveryId: string) => {
    return useQuery({
        queryKey: ["delivery-checklist", deliveryId],
        queryFn: async () => {
            const response = await fetch(`${APP_BASE_API_URL}/deliveries/${deliveryId}/checklist`)
            if (!response.ok) {
                throw new Error("Failed to fetch checklist")
            }
            return response.json() as Promise<DeliveryChecklistItem[]>
        },
        enabled: !!deliveryId,
    })
}

// Update Driver Status Mutation
export const useUpdateDriverStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            driverId,
            status,
            location,
            notes,
        }: {
            driverId: string
            status: "AVAILABLE" | "ON_DELIVERY" | "ON_BREAK" | "OFFLINE"
            location?: {
                latitude: number
                longitude: number
                accuracy?: number
            }
            notes?: string
        }) => {
            const response = await fetch(`${APP_BASE_API_URL}/drivers/${driverId}/status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status, location, notes }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to update driver status")
            }

            return response.json()
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["driver-profile", variables.driverId] })
            toast.success("Status updated successfully!")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update status")
        },
    })
}

// Update Delivery Status Mutation
export const useUpdateDeliveryStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            deliveryId,
            status,
            proofOfDelivery,
            receivedBy,
            failureReason,
            completedAt,
        }: {
            deliveryId: string
            status: "PENDING" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED" | "FAILED" | "RESCHEDULED"
            proofOfDelivery?: {
                images?: string[]
                signature?: string
                notes?: string
            }
            receivedBy?: string
            failureReason?: string
            completedAt?: string
        }) => {
            const response = await fetch(`${APP_BASE_API_URL}/deliveries/${deliveryId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status,
                    proofOfDelivery,
                    receivedBy,
                    failureReason,
                    completedAt,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to update delivery status")
            }

            return response.json()
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["delivery", variables.deliveryId] })
            queryClient.invalidateQueries({ queryKey: ["driver-deliveries"] })
            toast.success("Delivery status updated!")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update delivery")
        },
    })
}

// Update Route Status Mutation
export const useUpdateRouteStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            routeId,
            status,
            startedAt,
            completedAt,
            actualDuration,
        }: {
            routeId: string
            status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
            startedAt?: string
            completedAt?: string
            actualDuration?: number
        }) => {
            const response = await fetch(`${APP_BASE_API_URL}/routes/${routeId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status,
                    startedAt,
                    completedAt,
                    actualDuration,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to update route status")
            }

            return response.json()
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["route", variables.routeId] })
            queryClient.invalidateQueries({ queryKey: ["driver-routes"] })
            toast.success("Route status updated!")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update route")
        },
    })
}

// Update Checklist Items Mutation
export const useUpdateChecklistItems = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            deliveryId,
            items,
        }: {
            deliveryId: string
            items: Array<{
                id: string
                isCompleted: boolean
                notes?: string
            }>
        }) => {
            const response = await fetch(`${APP_BASE_API_URL}/deliveries/${deliveryId}/checklist`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(items),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to update checklist")
            }

            return response.json()
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["delivery-checklist", variables.deliveryId] })
            toast.success("Checklist updated!")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update checklist")
        },
    })
}

// Report Delivery Issue Mutation
export const useReportDeliveryIssue = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            deliveryId,
            issueType,
            description,
        }: {
            deliveryId: string
            issueType: "STOCK_SHORTAGE" | "VEHICLE_BREAKDOWN" | "CUSTOMER_UNAVAILABLE" | "WRONG_ADDRESS" | "PAYMENT_ISSUE" | "OTHER"
            description: string
        }) => {
            const response = await fetch(`${APP_BASE_API_URL}/deliveries/${deliveryId}/issues`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    issueType,
                    description,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to report issue")
            }

            return response.json()
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["delivery", variables.deliveryId] })
            queryClient.invalidateQueries({ queryKey: ["driver-deliveries"] })
            toast.success("Issue reported successfully!")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to report issue")
        },
    })
}
