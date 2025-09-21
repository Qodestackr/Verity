"use client"

import { useState, useEffect } from "react"
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    ChevronDown,
    Download,
    Filter,
    Info,
    MapPin,
    Share2,
    Shield,
    TrendingDown,
    Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { UndercutHeatmapView } from "./undercut-heatmap-view"
import { UndercutInsightPanel } from "./undercut-insight-panel"
import { RetailerList } from "./retailer-list"
import { UndercutTrends } from "./undercut-trends"

export default function UndercutHeatmapDash() {
    const [isLoading, setIsLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState("all")
    const [selectedRegion, setSelectedRegion] = useState("all")
    const [selectedSeverity, setSelectedSeverity] = useState("all")
    const [selectedTimeframe, setSelectedTimeframe] = useState("7d")
    const [showInsightPanel, setShowInsightPanel] = useState(false)
    const [activeTab, setActiveTab] = useState("map")

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    // Show insight panel after loading
    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                setShowInsightPanel(true)
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [isLoading])

    const impactMetrics = {
        totalLoss: "KES 1.2M",
        affectedProducts: 4,
        affectedRetailers: 86,
        hotspots: 12,
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-normal text-gray-900">Undercut Heatmap</h1>
                            <Badge className="bg-red-100 text-red-800">{impactMetrics.hotspots} Hotspots Detected</Badge>
                        </div>
                        <p className="text-sm text-gray-500">Know where your brand is being devalued — street by street</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1">
                            <Zap className="h-4 w-4" />
                            Take Action
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger className="w-[180px] bg-white border-gray-200">
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

                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger className="w-[160px] bg-white border-gray-200">
                            <SelectValue placeholder="All Regions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            <SelectItem value="nairobi">Nairobi</SelectItem>
                            <SelectItem value="mombasa">Mombasa</SelectItem>
                            <SelectItem value="kisumu">Kisumu</SelectItem>
                            <SelectItem value="nakuru">Nakuru</SelectItem>
                            <SelectItem value="eldoret">Eldoret</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                        <SelectTrigger className="w-[180px] bg-white border-gray-200">
                            <SelectValue placeholder="All Severities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Severities</SelectItem>
                            <SelectItem value="severe">Severe (&gt;20% below MSRP)</SelectItem>
                            <SelectItem value="moderate">Moderate (10-20% below MSRP)</SelectItem>
                            <SelectItem value="mild">Mild (5-10% below MSRP)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                        <SelectTrigger className="w-[160px] bg-white border-gray-200">
                            <SelectValue placeholder="Last 7 Days" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="90d">Last 90 Days</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                    </Select>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1">
                                <Filter className="h-4 w-4" />
                                More Filters
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-normal leading-none">Advanced Filters</h4>
                                    <p className="text-sm text-muted-foreground">Refine your heatmap view with additional filters</p>
                                </div>
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <label htmlFor="distributor" className="text-sm">
                                            Distributor
                                        </label>
                                        <Select>
                                            <SelectTrigger className="col-span-2 h-8">
                                                <SelectValue placeholder="All Distributors" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Distributors</SelectItem>
                                                <SelectItem value="central">Central Distributors</SelectItem>
                                                <SelectItem value="coastal">Coastal Beverages</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <label htmlFor="retailer-type" className="text-sm">
                                            Retailer Type
                                        </label>
                                        <Select>
                                            <SelectTrigger className="col-span-2 h-8">
                                                <SelectValue placeholder="All Types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="bars">Bars & Clubs</SelectItem>
                                                <SelectItem value="stores">Liquor Stores</SelectItem>
                                                <SelectItem value="supermarkets">Supermarkets</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <label htmlFor="detection-date" className="text-sm">
                                            First Detected
                                        </label>
                                        <Select>
                                            <SelectTrigger className="col-span-2 h-8">
                                                <SelectValue placeholder="Any Time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="any">Any Time</SelectItem>
                                                <SelectItem value="today">Today</SelectItem>
                                                <SelectItem value="week">This Week</SelectItem>
                                                <SelectItem value="month">This Month</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="ml-auto flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                        <Calendar className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Schedule regular reports</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>
                                        The Undercut Heatmap shows where your products are being sold below recommended prices. This helps
                                        identify unauthorized distribution, grey market activity, and non-compliant retailers.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </header>

            {/* Impact Metrics */}
            <div className="p-1">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="border-gray-200 p-1">
                        <CardContent className="p-1">
                            <div className="flex items-center justify-between mb-2">
                                <div className="bg-red-100 p-1.5 rounded-md">
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                </div>
                                <Badge className="bg-red-100 text-red-800">Critical</Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">Estimated Revenue Loss</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-normal">{impactMetrics.totalLoss}</span>
                                    <span className="text-xs text-gray-500">monthly</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 p-1">
                        <CardContent className="p-1">
                            <div className="flex items-center justify-between mb-2">
                                <div className="bg-amber-100 p-1.5 rounded-md">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                </div>
                                <Badge className="bg-amber-100 text-amber-800">{impactMetrics.hotspots}</Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">Undercut Hotspots</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-normal">{impactMetrics.hotspots}</span>
                                    <span className="text-xs text-gray-500">detected</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 p-1">
                        <CardContent className="p-1">
                            <div className="flex items-center justify-between mb-2">
                                <div className="bg-blue-100 p-1.5 rounded-md">
                                    <Shield className="h-4 w-4 text-blue-600" />
                                </div>
                                <Badge className="bg-blue-100 text-blue-800">{impactMetrics.affectedProducts}</Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">Affected Products</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-normal">{impactMetrics.affectedProducts}</span>
                                    <span className="text-xs text-gray-500">products</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 p-1">
                        <CardContent className="p-1">
                            <div className="flex items-center justify-between mb-2">
                                <div className="bg-purple-100 p-1.5 rounded-md">
                                    <MapPin className="h-4 w-4 text-purple-600" />
                                </div>
                                <Badge className="bg-purple-100 text-purple-800">{impactMetrics.affectedRetailers}</Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">Non-Compliant Retailers</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-normal">{impactMetrics.affectedRetailers}</span>
                                    <span className="text-xs text-gray-500">retailers</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="map" className="mb-6" onValueChange={setActiveTab}>
                    <TabsList className="bg-white border border-gray-200 p-1">
                        <TabsTrigger
                            value="map"
                            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 rounded-md"
                        >
                            Heatmap View
                        </TabsTrigger>
                        <TabsTrigger
                            value="retailers"
                            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 rounded-md"
                        >
                            Retailer List
                        </TabsTrigger>
                        <TabsTrigger
                            value="trends"
                            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 rounded-md"
                        >
                            Undercut Trends
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="map" className="mt-4">
                        <Card className="border-gray-200 p-1">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-normal flex items-center gap-2">
                                            <TrendingDown className="h-5 w-5 text-red-600" />
                                            Real-Time Undercut Heatmap
                                        </CardTitle>
                                        <CardDescription>
                                            Visualize where your products are being sold below recommended prices
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isLoading ? (
                                    <div className="h-[600px] bg-gray-100 animate-pulse rounded-md" />
                                ) : (
                                    <UndercutHeatmapView />
                                )}
                            </CardContent>
                            <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between p-4">
                                <div className="text-sm text-gray-500 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Potential revenue loss: KES 1.2M per month
                                </div>
                                <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                                    Deploy Field Team
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="retailers" className="mt-4">
                        <Card className="border-gray-200 p-1">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-normal flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-blue-600" />
                                            Non-Compliant Retailers
                                        </CardTitle>
                                        <CardDescription>Detailed list of retailers selling below recommended prices</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <div className="h-[500px] bg-gray-100 animate-pulse rounded-md" /> : <RetailerList />}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="trends" className="mt-4">
                        <Card className="border-gray-200 p-1">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-normal flex items-center gap-2">
                                            <TrendingDown className="h-5 w-5 text-purple-600" />
                                            Undercut Trends Analysis
                                        </CardTitle>
                                        <CardDescription>Track how pricing compliance changes over time</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? <div className="h-[500px] bg-gray-100 animate-pulse rounded-md" /> : <UndercutTrends />}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* AI Insight Panel */}
            {showInsightPanel && <UndercutInsightPanel onClose={() => setShowInsightPanel(false)} />}
        </div>
    )
}
