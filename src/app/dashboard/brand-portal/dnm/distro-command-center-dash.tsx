"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
    ArrowRight,
    BarChart3,
    Brain,
    Clock,
    Compass,
    Eye,
    MapPin,
    PieChart,
    Search,
    Shield,
    Truck,
    Warehouse,
} from "lucide-react"


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { DistributionNetworkMap } from "./distribution-network-map"
import { RetailerPerformancePanel } from "./retailer-performance-panel"
import { MarketPenetrationChart } from "./market-penetration-chart"
import { DistributorPerformanceTable } from "./distributor-performance-table"
import { AIInsightPanel } from "./ai-insight-panel"

export default function DistributionCommandCenterDash() {
    const [isLoading, setIsLoading] = useState(true)
    const [selectedRegion, setSelectedRegion] = useState("all")
    const [selectedProduct, setSelectedProduct] = useState("all")
    const [expandedCard, setExpandedCard] = useState<string | null>(null)
    const [showAIInsight, setShowAIInsight] = useState(false)
    const [activeTab, setActiveTab] = useState("overview")

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    // Show AI insight after loading
    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                setShowAIInsight(true)
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [isLoading])

    const toggleCardExpansion = (cardId: string) => {
        setExpandedCard(expandedCard === cardId ? null : cardId)
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-medium text-gray-900">Distribution Command Center</h1>
                        <p className="text-sm text-gray-500">Comprehensive control over your distribution network</p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-xs font-light text-emerald-700 border-emerald-200">
                        Enterprise
                    </Badge>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search distributors, retailers, or regions..."
                            className="pl-9 bg-gray-50 border-gray-200"
                        />
                    </div>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="All Regions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            <SelectItem value="nairobi">Nairobi</SelectItem>
                            <SelectItem value="mombasa">Mombasa</SelectItem>
                            <SelectItem value="kisumu">Kisumu</SelectItem>
                            <SelectItem value="nakuru">Nakuru</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Products" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Products</SelectItem>
                            <SelectItem value="premium-vodka">Premium Vodka 750ml</SelectItem>
                            <SelectItem value="craft-gin">Craft Gin 500ml</SelectItem>
                            <SelectItem value="blended-whisky">Blended Whisky 1L</SelectItem>
                            <SelectItem value="light-beer">Light Beer 6-pack</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-4">
                {/* Command Center Tabs */}
                <Tabs defaultValue="overview" className="mb-6" onValueChange={setActiveTab}>
                    <TabsList className="bg-white border border-gray-200 p-1">
                        <TabsTrigger
                            value="overview"
                            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 rounded-md"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="distribution"
                            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 rounded-md"
                        >
                            Distribution Network
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab Content */}
                    <TabsContent value="overview" className="mt-0">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <KpiCard
                                title="Distribution Reach"
                                value="87.4%"
                                unit="of target market"
                                trend="+3.2%"
                                trendDirection="up"
                                icon={Compass}
                                isLoading={isLoading}
                            />
                            <KpiCard
                                title="Active Retailers"
                                value="4,218"
                                unit="outlets"
                                trend="+124"
                                trendDirection="up"
                                icon={Warehouse}
                                isLoading={isLoading}
                            />
                            <KpiCard
                                title="Market Penetration"
                                value="42.3%"
                                unit="in category"
                                trend="+1.8%"
                                trendDirection="up"
                                icon={PieChart}
                                isLoading={isLoading}
                            />
                            <KpiCard
                                title="Delivery Efficiency"
                                value="92.6%"
                                unit="on-time rate"
                                trend="+4.5%"
                                trendDirection="up"
                                icon={Truck}
                                isLoading={isLoading}
                            />
                        </div>

                        {/* Distribution Network Map */}
                        <Card
                            className={`border-gray-200 transition-all duration-300 ${expandedCard === "distribution-network" ? "col-span-2" : ""
                                } mb-6`}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-emerald-600" />
                                            Distribution Network Map
                                        </CardTitle>
                                        <CardDescription>Real-time view of your entire distribution network</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-emerald-100 text-emerald-800">0 Active Retailers</Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => toggleCardExpansion("distribution-network")}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="aspect-[2/1] bg-gray-100 animate-pulse rounded-md" />
                                ) : (
                                    <DistributionNetworkMap expanded={expandedCard === "distribution-network"} />
                                )}
                            </CardContent>
                            <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
                                <div className="text-sm text-gray-500 flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    Last updated: Today, 10:45 AM
                                </div>
                                <Button variant="ghost" size="sm" className="h-8">
                                    Optimize Routes
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Secondary Dashboard Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Distribution Partners */}
                            <Card className="lg:col-span-2 border-gray-200">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                                <Truck className="h-5 w-5 text-blue-600" />
                                                Distribution Partners
                                            </CardTitle>
                                            <CardDescription>Performance metrics for your key distribution partners</CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => toggleCardExpansion("distribution-partners")}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="space-y-3">
                                            <div className="h-16 bg-gray-100 animate-pulse rounded-md" />
                                            <div className="h-16 bg-gray-100 animate-pulse rounded-md" />
                                            <div className="h-16 bg-gray-100 animate-pulse rounded-md" />
                                        </div>
                                    ) : (
                                        <DistributorPerformanceTable detailed={expandedCard === "distribution-partners"} />
                                    )}
                                </CardContent>
                                <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
                                    <div className="text-sm text-gray-500 flex items-center">
                                        <Truck className="h-4 w-4 mr-1" />
                                        Based on delivery efficiency, stock levels, and order fulfillment
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8">
                                        View All Partners
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Retailer Performance */}
                            <Card className="border-gray-200">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-purple-600" />
                                                Retailer Performance
                                            </CardTitle>
                                            <CardDescription>Top performing retail partners</CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => toggleCardExpansion("retailer-performance")}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="space-y-3">
                                            <div className="h-12 bg-gray-100 animate-pulse rounded-md" />
                                            <div className="h-12 bg-gray-100 animate-pulse rounded-md" />
                                            <div className="h-12 bg-gray-100 animate-pulse rounded-md" />
                                        </div>
                                    ) : (
                                        <RetailerPerformancePanel expanded={expandedCard === "retailer-performance"} />
                                    )}
                                </CardContent>
                                <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
                                    <div className="text-sm text-gray-500 flex items-center">
                                        <Shield className="h-4 w-4 mr-1" />
                                        Based on sales volume and stocking consistency
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8">
                                        View All Retailers
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="mt-6">
                            <Card className="border-gray-200">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                                <BarChart3 className="h-5 w-5 text-amber-600" />
                                                Market Penetration Analysis
                                            </CardTitle>
                                            <CardDescription>Track your reach across regions and product categories</CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => toggleCardExpansion("market-penetration")}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="aspect-[2/1] bg-gray-100 animate-pulse rounded-md" />
                                    ) : (
                                        <MarketPenetrationChart expanded={expandedCard === "market-penetration"} />
                                    )}
                                </CardContent>
                                <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
                                    <div className="text-sm text-gray-500 flex items-center">
                                        <Brain className="h-4 w-4 mr-1" />
                                        AI-powered analysis of market coverage and opportunities
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8">
                                        View Opportunities
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="distribution" className="mt-0">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center py-12">
                            <Truck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-gray-500">Distribution Network Dashboard</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            {/* AI Insight Panel */}
            {showAIInsight && <AIInsightPanel onClose={() => setShowAIInsight(false)} />}
        </div>
    )
}

function KpiCard({
    title,
    value,
    unit,
    trend,
    trendDirection,
    icon: Icon,
    isLoading,
}: {
    title: string
    value: string
    unit: string
    trend: string
    trendDirection: "up" | "down"
    icon: React.ElementType
    isLoading: boolean
}) {
    if (isLoading) {
        return <div className="bg-gray-100 animate-pulse h-24 rounded-lg" />
    }

    return (
        <Card className="border-gray-200 p-1">
            <CardContent className="p-1">
                <div className="flex items-center justify-between mb-2">
                    <div className="bg-gray-100 p-1.5 rounded-md">
                        <Icon className={`h-4 w-4 ${trendDirection === "up" ? "text-emerald-600" : "text-red-600"}`} />
                    </div>
                    <div className={`text-xs font-medium ${trendDirection === "up" ? "text-emerald-600" : "text-red-600"}`}>
                        {trend}
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-gray-500">{title}</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-medium">{value}</span>
                        <span className="text-xs text-gray-500">{unit}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
