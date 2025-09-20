"use client"

import { Clock, ChevronRight } from "lucide-react"

type OrderStatus = "received" | "preparing" | "ready" | "pickup" | "delivering" | "delivered"

interface OrderItem {
    name: string
    quantity: number
    price: number
}

interface Order {
    id: string
    store: string
    location: string
    date: string
    items: OrderItem[]
    total: number
    status: OrderStatus
    estimatedDelivery?: string
}

interface OrderCardProps {
    order: Order
    onClick: () => void
}

export function ShopOrderCard({
    order, onClick }: OrderCardProps) {
    // Helper function to get status text
    const getStatusText = () => {
        switch (order.status) {
            case "received":
                return "Order received"
            case "preparing":
                return "Preparing"
            case "ready":
                return "Ready for pickup"
            case "pickup":
                return "Being picked up"
            case "delivering":
                return "On the way"
            case "delivered":
                return "Delivered"
            default:
                return "Processing"
        }
    }

    // Helper function to get status color
    const getStatusColor = () => {
        switch (order.status) {
            case "delivered":
                return "bg-gray-100 text-gray-700"
            default:
                return "bg-emerald-100 text-emerald-700"
        }
    }

    return (
        <div className="p-4 bg-white cursor-pointer hover:bg-gray-50" onClick={onClick}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-medium">{order.store}</h3>
                    <p className="text-xs text-gray-500">{order.date}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor()}`}>{getStatusText()}</span>
            </div>

            <div className="mb-3">
                {order.items.map((item, index) => (
                    <div key={index} className="flex text-sm">
                        <span className="text-gray-700 mr-1">{item.quantity}x</span>
                        <span className="text-gray-700">{item.name}</span>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    {order.status !== "delivered" && order.estimatedDelivery && (
                        <>
                            <Clock className="h-4 w-4 text-emerald-600 mr-1" />
                            <span className="text-xs font-medium text-emerald-600">{order.estimatedDelivery}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center">
                    <span className="font-medium mr-2">KSh {order.total.toLocaleString()}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
            </div>
        </div>
    )
}
