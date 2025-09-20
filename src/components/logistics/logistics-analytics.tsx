import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Clock, CheckCircle2, Star, Calendar, DollarSign } from "lucide-react"
import { useLogisticsStore } from "@/stores/logistics-store"

export function LogisticsAnalytics() {
    const { formatCurrency } = useCurrency();

    const { orders, riders, metrics } = useLogisticsStore()

    // Calculate analytics
    const today = new Date().toDateString()
    const todayOrders = orders.filter((order) => new Date(order.date).toDateString() === today)
    const deliveredToday = todayOrders.filter((order) => order.status === "delivered")
    const totalRevenue = deliveredToday.reduce((sum, order) => sum + order.total, 0)

    const avgRating = riders.reduce((sum, rider) => sum + rider.rating, 0) / riders.length || 0
    const topPerformers = riders
        .filter((rider) => rider.completedDeliveries > 0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3)

    const statusDistribution = orders.reduce(
        (acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1
            return acc
        },
        {} as Record<string, number>,
    )

    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        const hourOrders = orders.filter((order) => {
            const orderHour = new Date(order.date).getHours()
            return orderHour === hour
        })
        return {
            hour,
            orders: hourOrders.length,
            revenue: hourOrders.reduce((sum, order) => sum + order.total, 0),
        }
    })

    const peakHour = hourlyData.reduce((peak, current) => (current.orders > peak.orders ? current : peak))

    return (
        <div className="space-y-6">
            {/* Today's Performance */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Today's Orders</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{todayOrders.length}</span>
                            <Badge variant="outline" className="text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +12%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Delivered</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{deliveredToday.length}</span>
                            <Badge variant="outline" className="text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +8%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{formatCurrency(totalRevenue)}</span>
                            <Badge variant="outline" className="text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +15%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium">Avg Time</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{metrics.avgDeliveryTime}m</span>
                            <Badge variant="outline" className="text-xs">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                -3m
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Order Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Order Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(statusDistribution).map(([status, count]) => {
                            const percentage = (count / orders.length) * 100
                            const colors = {
                                new: "bg-blue-500",
                                assigned: "bg-amber-500",
                                picked_up: "bg-purple-500",
                                in_transit: "bg-orange-500",
                                delivered: "bg-green-500",
                                cancelled: "bg-red-500",
                            }

                            return (
                                <div key={status} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="capitalize">{status.replace("_", " ")}</span>
                                        <span>
                                            {count} ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <Progress
                                        value={percentage}
                                        className="h-2"
                                        indicatorClassName={colors[status as keyof typeof colors]}
                                    />
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>

                {/* Top Performers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Top Performers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {topPerformers.map((rider, index) => (
                            <div key={rider.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium">#{index + 1}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{rider.name}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            <span>{rider.rating}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">{rider.completedDeliveries}</p>
                                    <p className="text-xs text-muted-foreground">deliveries</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Peak Hours Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Peak Hours Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-12 gap-1 mb-4">
                        {hourlyData.map((data) => (
                            <div key={data.hour} className="text-center">
                                <div
                                    className="bg-primary/20 rounded-sm mb-1 transition-all hover:bg-primary/40"
                                    style={{
                                        height: `${Math.max(4, (data.orders / Math.max(...hourlyData.map((h) => h.orders))) * 60)}px`,
                                    }}
                                />
                                <span className="text-xs text-muted-foreground">{data.hour.toString().padStart(2, "0")}</span>
                            </div>
                        ))}
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                        Peak hour: {peakHour.hour}:00 with {peakHour.orders} orders
                    </div>
                </CardContent>
            </Card>

            {/* Key Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Key Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm text-green-800 dark:text-green-200">Delivery efficiency improved</p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                Average delivery time decreased by 3 minutes this week
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <Star className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm text-blue-800 dark:text-blue-200">High customer satisfaction</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                Average rider rating is {avgRating.toFixed(1)}/5.0
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                        <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm text-amber-800 dark:text-amber-200">Peak demand identified</p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                Most orders come in around {peakHour.hour}:00. Consider adding more riders during this time.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
