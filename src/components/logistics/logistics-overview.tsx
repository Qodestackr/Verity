"use client"

import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Truck, Users, ArrowRight, MapPin } from "lucide-react"
import { useLogisticsStore } from "@/stores/logistics-store"

export function LogisticsOverview() {
    const { formatCurrency } = useCurrency();

    const { orders, riders, setActiveTab, setSelectedOrder } = useLogisticsStore()

    const activeOrders = orders.filter((order) => ["assigned", "picked_up", "in_transit"].includes(order.status))
    const newOrders = orders.filter((order) => order.status === "new")
    const availableRiders = riders.filter((rider) => rider.status === "available")
    const busyRiders = riders.filter((rider) => rider.status === "busy")

    const urgentOrders = activeOrders.filter((order) => {
        const scheduledTime = new Date(order.estimatedDelivery).getTime()
        const now = new Date().getTime()
        return scheduledTime - now < 30 * 60 * 1000 // Less than 30 minutes
    })

    return (
        <div className="space-y-4">
            {/* Quick Stats - Large, Touch-Friendly */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="p-0 overflow-hidden">
                    <CardContent className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                        <div className="text-3xl font-bold text-blue-600">{activeOrders.length}</div>
                        <div className="text-sm text-blue-700">Active Deliveries</div>
                        {urgentOrders.length > 0 && (
                            <Badge className="mt-1 bg-red-500 text-white text-xs">{urgentOrders.length} urgent</Badge>
                        )}
                    </CardContent>
                </Card>

                <Card className="p-0 overflow-hidden">
                    <CardContent className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                        <div className="text-3xl font-bold text-green-600">{availableRiders.length}</div>
                        <div className="text-sm text-green-700">Available Riders</div>
                        {busyRiders.length > 0 && (
                            <Badge className="mt-1 bg-amber-500 text-white text-xs">{busyRiders.length} busy</Badge>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* New Orders Alert */}
            {newOrders.length > 0 && (
                <Card className="border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-orange-800 dark:text-orange-200">{newOrders.length} New Orders</h3>
                                <p className="text-sm text-orange-600 dark:text-orange-400">Need rider assignment</p>
                            </div>
                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => setActiveTab("orders")}>
                                Assign Now
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Active Deliveries - Simplified Cards */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Truck className="h-5 w-5 text-blue-600" />
                            Live Deliveries
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")}>
                            View All
                            <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {activeOrders.slice(0, 4).map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => setSelectedOrder(order)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm truncate">{order.customer.name}</span>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs h-4 ${order.status === "in_transit"
                                                ? "bg-blue-500/10 text-blue-600"
                                                : order.status === "picked_up"
                                                    ? "bg-purple-500/10 text-purple-600"
                                                    : "bg-amber-500/10 text-amber-600"
                                                }`}
                                        >
                                            {order.status === "in_transit" ? "En Route" : order.status.replace("_", " ")}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate">{order.customer.location}</span>
                                    </div>
                                </div>

                                <div className="text-right ml-2">
                                    <div className="text-sm font-medium">{formatCurrency(order.total)}</div>
                                    {order.assignedRider && (
                                        <div className="text-xs text-muted-foreground">{order.assignedRider.name}</div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {activeOrders.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No active deliveries</p>
                                <p className="text-xs">Orders will appear here when assigned</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
                <Button
                    size="lg"
                    className="h-16 flex-col gap-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => setActiveTab("orders")}
                >
                    <Truck className="h-5 w-5" />
                    <span className="text-sm">Manage Orders</span>
                </Button>

                <Button size="lg" variant="outline" className="h-16 flex-col gap-1" onClick={() => setActiveTab("riders")}>
                    <Users className="h-5 w-5" />
                    <span className="text-sm">Manage Riders</span>
                </Button>
            </div>
        </div>
    )
}
