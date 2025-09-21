"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
    AlertCircle,
    ArrowRight,
    BarChart3,
    Brain,
    Clock,
    LineChart,
    Maximize2,
    Minimize2,
    PieChart,
    Share2,
    TrendingDown,
    TrendingUp,
    Zap,
} from "lucide-react"


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { LeakageDetectionMap } from "@/components/brand-owner/precision-analytics/leakage-detection-map"
import { SKUVelocityChart } from "@/components/brand-owner/precision-analytics/sku-velocity-chart"
import { DemandForecastChart } from "@/components/brand-owner/precision-analytics/demand-forecast-chart"
import { ProductPerformanceTable } from "@/components/brand-owner/precision-analytics/product-performance-table"
import { AIInsights } from "@/components/brand-owner/precision-analytics/ai-insights"

export default function PrecisionAnalyticsPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState("all")
    const [expandedCard, setExpandedCard] = useState<string | null>(null)
    const [showAIInsight, setShowAIInsight] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 500)

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
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="flex items-center gap-2 justify-between">
                    <div>
                        <h1 className="text-xl font-medium text-gray-900">Precision Analytics</h1>
                        <p className="text-sm text-gray-500">Track SKU velocity, detect leakage points, and forecast demand</p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 h-4 text-xs font-light text-emerald-700 border-emerald-200">
                        Enterprise
                    </Badge>
                </div>
            </header>

            {/* Main Content */}
            <main className="py-1">
                {/* Analytics Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                    <AnalyticsCard
                        title="SKU Velocity"
                        value="42.8"
                        unit="units/day"
                        trend="+12%"
                        trendDirection="up"
                        icon={TrendingUp}
                        isLoading={isLoading}
                    />
                    <AnalyticsCard
                        title="Leakage Points"
                        value="3"
                        unit="detected"
                        trend="-2"
                        trendDirection="down"
                        icon={TrendingDown}
                        isLoading={isLoading}
                    />
                    <AnalyticsCard
                        title="Forecast Accuracy"
                        value="94.2%"
                        unit="last 30 days"
                        trend="+3.5%"
                        trendDirection="up"
                        icon={Brain}
                        isLoading={isLoading}
                    />
                    <AnalyticsCard
                        title="AI Insights"
                        value="5"
                        unit="new insights"
                        trend="+2"
                        trendDirection="up"
                        icon={Zap}
                        isLoading={isLoading}
                    />
                </div>

                {/* Main Analytics Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* SKU Velocity Card */}
                    <Card
                        className={`border-gray-200 transition-all duration-300 ${expandedCard === "sku-velocity" ? "lg:col-span-2" : ""
                            }`}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                                        SKU Velocity Analysis
                                    </CardTitle>
                                    <CardDescription>Track sales velocity across products and regions</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                        <SelectTrigger className="w-[160px] h-8">
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
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => toggleCardExpansion("sku-velocity")}
                                    >
                                        {expandedCard === "sku-velocity" ? (
                                            <Minimize2 className="h-4 w-4" />
                                        ) : (
                                            <Maximize2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="aspect-[2/1] bg-gray-100 animate-pulse rounded-md" />
                            ) : (
                                <SKUVelocityChart expanded={expandedCard === "sku-velocity"} />
                            )}
                        </CardContent>
                        <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
                            <div className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Last updated: Today, 10:45 AM
                            </div>
                            <Button variant="ghost" size="sm" className="h-8">
                                View Detailed Report
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Leakage Detection Card */}
                    <Card
                        className={`border-gray-200 transition-all duration-300 ${expandedCard === "leakage-detection" ? "lg:col-span-2" : ""
                            }`}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                                        <TrendingDown className="h-5 w-5 text-red-600" />
                                        Leakage Detection Map
                                    </CardTitle>
                                    <CardDescription>Identify potential distribution leakage points</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-red-100 text-red-800">3 Issues Detected</Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => toggleCardExpansion("leakage-detection")}
                                    >
                                        {expandedCard === "leakage-detection" ? (
                                            <Minimize2 className="h-4 w-4" />
                                        ) : (
                                            <Maximize2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="aspect-[2/1] bg-gray-100 animate-pulse rounded-md" />
                            ) : (
                                <LeakageDetectionMap expanded={expandedCard === "leakage-detection"} />
                            )}
                        </CardContent>
                        <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
                            <div className="text-sm text-gray-500 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Potential revenue loss: KES 450,000 per month
                            </div>
                            <Button variant="ghost" size="sm" className="h-8">
                                View Detailed Report
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Demand Forecast and Product Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Demand Forecast Card */}
                    <Card
                        className={`border-gray-200 transition-all duration-300 ${expandedCard === "demand-forecast" ? "lg:col-span-3" : "lg:col-span-2"
                            }`}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                                        <Brain className="h-5 w-5 text-purple-600" />
                                        AI-Powered Demand Forecast
                                    </CardTitle>
                                    <CardDescription>Predict future demand with 94.2% accuracy</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select defaultValue="30d">
                                        <SelectTrigger className="w-[120px] h-8">
                                            <SelectValue placeholder="Forecast" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="7d">7 Days</SelectItem>
                                            <SelectItem value="30d">30 Days</SelectItem>
                                            <SelectItem value="90d">90 Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => toggleCardExpansion("demand-forecast")}
                                    >
                                        {expandedCard === "demand-forecast" ? (
                                            <Minimize2 className="h-4 w-4" />
                                        ) : (
                                            <Maximize2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="aspect-[2/1] bg-gray-100 animate-pulse rounded-md" />
                            ) : (
                                <DemandForecastChart expanded={expandedCard === "demand-forecast"} />
                            )}
                        </CardContent>
                        <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
                            <div className="text-sm text-gray-500 flex items-center">
                                <Zap className="h-4 w-4 mr-1" />
                                AI model trained on 3+ years of historical data
                            </div>
                            <Button variant="ghost" size="sm" className="h-8">
                                View Forecast Details
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Product Performance Card */}
                    <Card
                        className={`border-gray-200 transition-all duration-300 ${expandedCard === "product-performance" ? "lg:col-span-3" : "lg:col-span-1"
                            }`}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        Product Performance
                                    </CardTitle>
                                    <CardDescription>Top and bottom performing products</CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => toggleCardExpansion("product-performance")}
                                >
                                    {expandedCard === "product-performance" ? (
                                        <Minimize2 className="h-4 w-4" />
                                    ) : (
                                        <Maximize2 className="h-4 w-4" />
                                    )}
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
                                <ProductPerformanceTable expanded={expandedCard === "product-performance"} />
                            )}
                        </CardContent>
                        <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
                            <div className="text-sm text-gray-500 flex items-center">
                                <PieChart className="h-4 w-4 mr-1" />
                                Based on last 30 days of sales data
                            </div>
                            <Button variant="ghost" size="sm" className="h-8">
                                View All Products
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Advanced Analytics Tabs */}
                <div className="mt-6">
                    <Card className="border-gray-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-medium">Advanced Analytics</CardTitle>
                                <Button variant="outline" size="sm" className="h-8">
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share Report
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="distribution" className="space-y-4">
                                <TabsList className="bg-gray-50 border border-gray-200">
                                    <TabsTrigger
                                        value="distribution"
                                        className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                                    >
                                        Distribution Analysis
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="pricing"
                                        className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                                    >
                                        Pricing Analysis
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="competitive"
                                        className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                                    >
                                        Competitive Analysis
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="consumer"
                                        className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                                    >
                                        Consumer Insights
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="distribution">
                                    <div className="bg-white p-4 rounded-md border border-gray-100">
                                        <h3 className="text-sm font-medium mb-2">Distribution Efficiency Score</h3>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="text-3xl font-medium text-emerald-700">78/100</div>
                                            <div className="text-sm text-gray-500">
                                                Your distribution network is performing well, but there are opportunities for improvement in the
                                                Nakuru region.
                                            </div>
                                        </div>

                                        <h4 className="text-xs font-medium text-gray-500 mb-1">EFFICIENCY BY REGION</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm">Nairobi</span>
                                                    <span className="text-sm font-medium">92%</span>
                                                </div>
                                                <Progress value={92} className="h-1.5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm">Mombasa</span>
                                                    <span className="text-sm font-medium">85%</span>
                                                </div>
                                                <Progress value={85} className="h-1.5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm">Kisumu</span>
                                                    <span className="text-sm font-medium">76%</span>
                                                </div>
                                                <Progress value={76} className="h-1.5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm">Nakuru</span>
                                                    <span className="text-sm font-medium">58%</span>
                                                </div>
                                                <Progress value={58} className="h-1.5" />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="pricing">
                                    <div className="bg-white p-4 rounded-md border border-gray-100 text-center py-12">
                                        <LineChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p className="text-gray-500">Pricing Analysis Content</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="competitive">
                                    <div className="bg-white p-4 rounded-md border border-gray-100 text-center py-12">
                                        <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p className="text-gray-500">Competitive Analysis Content</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="consumer">
                                    <div className="bg-white p-4 rounded-md border border-gray-100 text-center py-12">
                                        <PieChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p className="text-gray-500">Consumer Insights Content</p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* AI Insight Modal */}
            {showAIInsight && <AIInsights onClose={() => setShowAIInsight(false)} />}
        </div>
    )
}

function AnalyticsCard({
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
                        <Icon
                            className={`h-4 w-4 ${trendDirection === "up"
                                ? "text-emerald-600"
                                : trendDirection === "down"
                                    ? "text-red-600"
                                    : "text-blue-600"
                                }`}
                        />
                    </div>
                    <div
                        className={`text-xs font-medium ${trendDirection === "up"
                            ? "text-emerald-600"
                            : trendDirection === "down"
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                    >
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
