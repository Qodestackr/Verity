import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type OrderStatus = "new" | "assigned" | "picked_up" | "in_transit" | "delivered" | "cancelled"
export type PaymentStatus = "paid" | "pending" | "not_paid"
export type PaymentMethod = "mpesa" | "credit" | "cash_on_delivery"
export type RiderStatus = "available" | "busy" | "offline"

export interface Product {
    id: string
    name: string
    quantity: number
    price: number
    unit: string
    category: string
}

export interface Customer {
    name: string
    phone: string
    location: string
    address: string
    coordinates: {
        lat: number
        lng: number
    }
}

export interface Rider {
    id: string
    name: string
    phone: string
    rating: number
    completedDeliveries: number
    currentLocation: string
    status: RiderStatus
    estimatedArrival: string
    vehicleType: "bike" | "car" | "scooter"
    avatar: string
}

export interface Order {
    id: string
    date: string
    customer: Customer
    products: Product[]
    total: number
    status: OrderStatus
    paymentStatus: PaymentStatus
    paymentMethod: PaymentMethod
    deliveryFee: number
    estimatedDelivery: string
    notes: string
    assignedRider?: Rider
    storeLocation: string
    trackingUpdates: TrackingUpdate[]
}

export interface TrackingUpdate {
    id: string
    timestamp: string
    status: OrderStatus
    message: string
    location?: string
}

export interface LogisticsMetrics {
    totalOrders: number
    activeDeliveries: number
    availableRiders: number
    avgDeliveryTime: number
    completionRate: number
    customerSatisfaction: number
}

interface LogisticsState {
    // Data
    orders: Order[]
    riders: Rider[]
    metrics: LogisticsMetrics

    // UI State
    selectedOrder: Order | null
    activeTab: 'overview' | 'orders' | 'riders' | 'analytics'
    isLoading: boolean

    // Actions
    setOrders: (orders: Order[]) => void
    setRiders: (riders: Rider[]) => void
    setMetrics: (metrics: LogisticsMetrics) => void
    setSelectedOrder: (order: Order | null) => void
    setActiveTab: (tab: 'overview' | 'orders' | 'riders' | 'analytics') => void
    assignRiderToOrder: (orderId: string, riderId: string) => void
    updateOrderStatus: (orderId: string, status: OrderStatus) => void
    addTrackingUpdate: (orderId: string, update: Omit<TrackingUpdate, 'id'>) => void
    updateRiderStatus: (riderId: string, status: RiderStatus) => void
}

export const useLogisticsStore = create<LogisticsState>()(
    devtools(
        (set, get) => ({
            // Initial state
            orders: [],
            riders: [],
            metrics: {
                totalOrders: 0,
                activeDeliveries: 0,
                availableRiders: 0,
                avgDeliveryTime: 0,
                completionRate: 0,
                customerSatisfaction: 0,
            },
            selectedOrder: null,
            activeTab: 'overview',
            isLoading: false,

            // Actions
            setOrders: (orders) => set({ orders }),
            setRiders: (riders) => set({ riders }),
            setMetrics: (metrics) => set({ metrics }),
            setSelectedOrder: (order) => set({ selectedOrder: order }),
            setActiveTab: (tab) => set({ activeTab: tab }),

            assignRiderToOrder: (orderId, riderId) => {
                const { orders, riders } = get()
                const rider = riders.find(r => r.id === riderId)
                if (!rider) return

                const updatedOrders = orders.map(order =>
                    order.id === orderId
                        ? {
                            ...order,
                            assignedRider: rider,
                            status: 'assigned' as OrderStatus,
                            trackingUpdates: [
                                ...order.trackingUpdates,
                                {
                                    id: `update_${Date.now()}`,
                                    timestamp: new Date().toISOString(),
                                    status: 'assigned' as OrderStatus,
                                    message: `Order assigned to ${rider.name}`,
                                }
                            ]
                        }
                        : order
                )

                const updatedRiders = riders.map(r =>
                    r.id === riderId
                        ? { ...r, status: 'busy' as RiderStatus }
                        : r
                )

                set({ orders: updatedOrders, riders: updatedRiders })
            },

            updateOrderStatus: (orderId, status) => {
                const { orders } = get()
                const updatedOrders = orders.map(order =>
                    order.id === orderId
                        ? {
                            ...order,
                            status,
                            trackingUpdates: [
                                ...order.trackingUpdates,
                                {
                                    id: `update_${Date.now()}`,
                                    timestamp: new Date().toISOString(),
                                    status,
                                    message: `Order status updated to ${status.replace('_', ' ')}`,
                                }
                            ]
                        }
                        : order
                )
                set({ orders: updatedOrders })
            },

            addTrackingUpdate: (orderId, update) => {
                const { orders } = get()
                const updatedOrders = orders.map(order =>
                    order.id === orderId
                        ? {
                            ...order,
                            trackingUpdates: [
                                ...order.trackingUpdates,
                                { ...update, id: `update_${Date.now()}` }
                            ]
                        }
                        : order
                )
                set({ orders: updatedOrders })
            },

            updateRiderStatus: (riderId, status) => {
                const { riders } = get()
                const updatedRiders = riders.map(rider =>
                    rider.id === riderId ? { ...rider, status } : rider
                )
                set({ riders: updatedRiders })
            },
        }),
        { name: 'logistics-store' }
    )
)
