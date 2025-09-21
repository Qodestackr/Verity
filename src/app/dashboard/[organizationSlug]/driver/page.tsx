"use client"

import { useState } from "react"
import { useParams } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Clock, Star, TrendingUp, Calendar, Navigation, CheckCircle2 } from "lucide-react"
import { DriverStatusCard } from "@/components/driver/driver-status-card"
import { RouteProgressCard } from "@/components/driver/route-progress-card"
import { DeliveryCard } from "@/components/driver/delivery-card"
import { useDriverDeliveries, useDriverRoutes } from "@/hooks/use-driver-queries"


// Mock driver data - in real app, get from session/auth
const mockDriver = {
    id: "driver-123",
    name: "John Kamau",
    status: "AVAILABLE" as const,
    currentLocation: {
        latitude: -1.2921,
        longitude: 36.8219,
    },
}

function DriverDashboardContent() {
    const params = useParams()
    const organizationSlug = params.organizationSlug as string
    const [activeTab, setActiveTab] = useState("overview")

    // Mock organization ID - in real app, get from organization slug
    const organizationId = "org-123"

    const { data: deliveries = [], isLoading: deliveriesLoading } = useDriverDeliveries(organizationId, {
        driverId: mockDriver.id,
    })

    const { data: routes = [], isLoading: routesLoading } = useDriverRoutes(organizationId, {
        driverId: mockDriver.id,
        date: new Date().toISOString().split("T")[0],
    })

    const todayRoute = routes.find((r) => r.status === "PLANNED" || r.status === "IN_PROGRESS")
    const todayDeliveries = deliveries.filter((d) => {
        const deliveryDate = new Date(d.scheduledFor).toDateString()
        const today = new Date().toDateString()
        return deliveryDate === today
    })

    const pendingDeliveries = todayDeliveries.filter((d) => d.status === "PENDING" || d.status === "ASSIGNED")
    const inTransitDeliveries = todayDeliveries.filter((d) => d.status === "IN_TRANSIT")
    const completedDeliveries = todayDeliveries.filter((d) => d.status === "DELIVERED")

    // Mock performance data
    const performanceData = {
        onTimeDeliveries: 98,
        customerSatisfaction: 4.9,
        routeEfficiency: 92,
        totalDeliveries: 156,
        successfulDeliveries: 152,
        weeklyEarnings: 45600,
    }

    return (
        <div className="container max-w-md mx-auto py-4 px-4 space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-light tracking-tight">Driver Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {mockDriver.name}</p>
            </div>

            <DriverStatusCard driver={mockDriver} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {todayRoute && <RouteProgressCard route={todayRoute} />}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">{pendingDeliveries.length}</div>
                                <div className="text-xs text-muted-foreground">Pending</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{completedDeliveries.length}</div>
                                <div className="text-xs text-muted-foreground">Completed</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Next Deliveries */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Next Deliveries
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {pendingDeliveries.slice(0, 3).map((delivery) => (
                                <div key={delivery.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                    <div>
                                        <div className="font-medium text-sm">{delivery.customerName}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(delivery.scheduledFor).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline">
                                        <Navigation className="h-3 w-3 mr-1" />
                                        Navigate
                                    </Button>
                                </div>
                            ))}
                            {pendingDeliveries.length === 0 && (
                                <div className="text-center py-4 text-muted-foreground">
                                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No pending deliveries</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Today's Summary */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Today's Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Total Deliveries</span>
                                <span className="font-medium">{todayDeliveries.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Completed</span>
                                <span className="font-medium text-green-600">{completedDeliveries.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>In Transit</span>
                                <span className="font-medium text-blue-600">{inTransitDeliveries.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Pending</span>
                                <span className="font-medium text-amber-600">{pendingDeliveries.length}</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="deliveries" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Today's Deliveries</h3>
                        <Badge variant="outline">{todayDeliveries.length} total</Badge>
                    </div>

                    {deliveriesLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 bg-muted/50 rounded-md animate-pulse" />
                            ))}
                        </div>
                    ) : todayDeliveries.length > 0 ? (
                        <div className="space-y-4">
                            {todayDeliveries.map((delivery) => (
                                <DeliveryCard key={delivery.id} delivery={delivery} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                            <h3 className="font-medium text-lg">No deliveries today</h3>
                            <p className="text-sm text-muted-foreground">Check back later for new assignments</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Performance Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm">On-time deliveries</div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{performanceData.onTimeDeliveries}%</span>
                                    <Badge className="bg-green-500/10 text-green-500">+2%</Badge>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm">Customer satisfaction</div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{performanceData.customerSatisfaction}/5</span>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className="h-3 w-3 text-amber-500"
                                                fill={star <= Math.floor(performanceData.customerSatisfaction) ? "#f59e0b" : "none"}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm">Route efficiency</div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{performanceData.routeEfficiency}%</span>
                                    <Badge className="bg-green-500/10 text-green-500">Top 10%</Badge>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm">Total deliveries</div>
                                <span className="font-medium">{performanceData.totalDeliveries}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm">Success rate</div>
                                <span className="font-medium">
                                    {Math.round((performanceData.successfulDeliveries / performanceData.totalDeliveries) * 100)}%
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Weekly Earnings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald-600">
                                    KES {performanceData.weeklyEarnings.toLocaleString()}
                                </div>
                                <div className="text-sm text-muted-foreground">This week</div>
                                <Badge className="mt-2 bg-emerald-500/10 text-emerald-500">+12% from last week</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-blue-50 rounded-md p-4 flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="font-medium text-blue-500">Excellent Performance!</p>
                            <p className="text-blue-700">
                                Your performance qualifies you for premium routes and bonus opportunities.
                            </p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default function DriverDashboardPage() {
    return (
        <DriverDashboardContent />
    )
}
