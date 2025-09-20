import { MapPin } from "lucide-react"

interface OrderItem {
    id: string
    name: string
    description: string
    price: number
    quantity: number
}

interface Order {
    id: string
    store: string
    location: string
    items: OrderItem[]
    total: number
    deliveryFee: number
    grandTotal: number
}

interface OrderDetailsProps {
    order: Order
}

export function OrderDetails({
    order }: OrderDetailsProps) {
    return (
        <div className="px-4 py-6">
            <h2 className="text-xl font-bold mb-4">Your order</h2>

            <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">
                    {order.items.length} product from {order.store}
                </p>

                {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start mb-2">
                        <div className="flex items-start">
                            <span className="text-gray-700 mr-2">{item.quantity}x</span>
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                        </div>
                        <span className="font-medium">KSh{item.price.toLocaleString()}</span>
                    </div>
                ))}
            </div>

            <h2 className="text-xl font-bold mb-4">Delivery details</h2>

            <div className="flex items-start">
                <div className="mr-3 mt-1">
                    <MapPin className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                    <p className="font-medium mb-1">Deliver from</p>
                    <p className="text-sm text-gray-600">{order.location}</p>
                </div>
            </div>
        </div>
    )
}
