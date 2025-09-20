import { Clock, CheckCircle, Package, Truck } from "lucide-react"

type OrderStatus = "received" | "preparing" | "ready" | "pickup" | "delivering" | "delivered"

interface OrderStatusIndicatorProps {
    status: OrderStatus
}

export function OrderStatusIndicator({    
 status }: OrderStatusIndicatorProps) {
    // Get the appropriate icon based on status
    const getStatusIcon = () => {
        switch (status) {
            case "received":
                return <CheckCircle className="h-8 w-8 text-emerald-500" />
            case "preparing":
                return <Clock className="h-8 w-8 text-amber-600" />
            case "ready":
            case "pickup":
                return <Package className="h-8 w-8 text-amber-600" />
            case "delivering":
            case "delivered":
                return <Truck className="h-8 w-8 text-emerald-500" />
            default:
                return <Clock className="h-8 w-8 text-amber-600" />
        }
    }

    return (
        <div className="flex justify-center">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center">{getStatusIcon()}</div>
        </div>
    )
}
