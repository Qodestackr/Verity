"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useCurrency } from "@/hooks/useCurrency";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Truck, Users, Settings, RefreshCw } from "lucide-react"
import { useLogisticsStore } from "@/stores/logistics-store"
import { LogisticsOverview } from "@/components/logistics/logistics-overview"
import { OrderTracking } from "@/components/logistics/order-tracking"
import { RiderManagement } from "@/components/logistics/rider-management"
import { LogisticsAnalytics } from "@/components/logistics/logistics-analytics"
import { mockOrders, mockRiders, mockMetrics } from "@/data/logistics-mock-data"

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
        },
    },
}

export default function LogisticsPage() {
    const { activeTab, setActiveTab, setOrders, setRiders, setMetrics, orders, riders, isLoading } = useLogisticsStore()

    const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

    useEffect(() => {
        // Initialize with mock data
        setOrders(mockOrders)
        setRiders(mockRiders)
        setMetrics(mockMetrics)
    }, [setOrders, setRiders, setMetrics])

    const handleRefresh = () => {
        // In a real app, this would fetch fresh data
        setLastRefresh(new Date())
        // Simulate data refresh
        setOrders([...mockOrders])
        setRiders([...mockRiders])
        setMetrics({ ...mockMetrics })
    }

    const activeOrders = orders.filter((order) => ["assigned", "picked_up", "in_transit"].includes(order.status))

    const availableRiders = riders.filter((rider) => rider.status === "available")

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <motion.div className="flex flex-col gap-6" variants={container} initial="hidden" animate="show">
                {/* Header */}
                <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Logistics Control</h1>
                        <p className="text-muted-foreground">
                            Manage deliveries, track orders, and optimize your logistics operations
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                <Truck className="h-3 w-3 mr-1" />
                                {activeOrders.length} active
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                {availableRiders.length} available
                            </Badge>
                        </div>

                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>

                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div variants={item}>
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="orders" className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                <span className="hidden sm:inline">Orders</span>
                            </TabsTrigger>
                            <TabsTrigger value="riders" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span className="hidden sm:inline">Riders</span>
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                <span className="hidden sm:inline">Analytics</span>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="orders" className="mt-6">
                            <OrderTracking />
                        </TabsContent>

                        <TabsContent value="riders" className="mt-6">
                            <RiderManagement />
                        </TabsContent>

                        <TabsContent value="analytics" className="mt-6">
                            <LogisticsAnalytics />
                        </TabsContent>
                    </Tabs>
                </motion.div>

                {/* Quick Stats Footer */}
                <motion.div variants={item} className="text-center text-xs text-muted-foreground">
                    Last updated: {lastRefresh.toLocaleTimeString()} •{orders.length} total orders •{riders.length} total riders
                </motion.div>
            </motion.div>
        </div>
    )
}
