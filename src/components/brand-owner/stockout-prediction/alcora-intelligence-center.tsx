"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, Filter, TrendingUp, AlertTriangle, Zap, Target, BarChart3, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { SeasonalPulse } from "./seasonal-pulse"
import { AIInsights } from "./ai-insights"
import { DetailedDistributorView } from "./detailed-distributor-view"
import { DistributorTable } from "./distributor-table"
import { CompactDistributorCard } from "./compact-distributor-card"

interface RegionData {
    id: string
    name: string
    status: "critical" | "warning" | "opportunity" | "optimal"
    distributors: number
    revenueAtRisk: number
    opportunityValue: number
    marketShare: number
    velocity: number
    seasonalFactor: string
    aiConfidence: number
    coordinates: { x: number; y: number }
}

interface DistributorData {
    id: string
    name: string
    region: string
    location: string
    status: "critical" | "warning" | "opportunity" | "optimal"
    marketShare: number
    velocity: number
    revenueImpact: number
    stockDays: number
    nearbyVenues: number
    tourismIndex: number
    products: Array<{
        name: string
        stock: number
        demand: number
        velocity: number
        impact: number
    }>
}

const regionsData: RegionData[] = [
    {
        id: "coast",
        name: "Coast Region",
        status: "opportunity",
        distributors: 23,
        revenueAtRisk: 890000,
        opportunityValue: 2400000,
        marketShare: 34,
        velocity: 145,
        seasonalFactor: "European Tourism Peak",
        aiConfidence: 94,
        coordinates: { x: 85, y: 70 },
    },
    {
        id: "central",
        name: "Central Kenya",
        status: "critical",
        distributors: 67,
        revenueAtRisk: 3200000,
        opportunityValue: 450000,
        marketShare: 42,
        velocity: 89,
        seasonalFactor: "Corporate Events",
        aiConfidence: 97,
        coordinates: { x: 50, y: 45 },
    },
    {
        id: "mara",
        name: "Maasai Mara",
        status: "warning",
        distributors: 8,
        revenueAtRisk: 1200000,
        opportunityValue: 1800000,
        marketShare: 28,
        velocity: 234,
        seasonalFactor: "Migration Season",
        aiConfidence: 91,
        coordinates: { x: 35, y: 65 },
    },
    {
        id: "naivasha",
        name: "Naivasha Region",
        status: "opportunity",
        distributors: 12,
        revenueAtRisk: 340000,
        opportunityValue: 920000,
        marketShare: 31,
        velocity: 178,
        seasonalFactor: "Safari Rally Prep",
        aiConfidence: 89,
        coordinates: { x: 40, y: 35 },
    },
]

const distributorsData: DistributorData[] = [
    {
        id: "mombasa-premium",
        name: "Mombasa Premium Distributors",
        region: "Coast Region",
        location: "Mombasa Island",
        status: "opportunity",
        marketShare: 38,
        velocity: 234,
        revenueImpact: 890000,
        stockDays: 12,
        nearbyVenues: 23,
        tourismIndex: 95,
        products: [
            { name: "Grey Goose Vodka 750ml", stock: 45, demand: 180, velocity: 234, impact: 890000 },
            { name: "Johnnie Walker Blue 750ml", stock: 23, demand: 89, velocity: 156, impact: 450000 },
        ],
    },
    {
        id: "diani-coastal",
        name: "Diani Coastal Distributors",
        region: "Coast Region",
        location: "Diani Beach",
        status: "critical",
        marketShare: 28,
        velocity: 290,
        revenueImpact: 1200000,
        stockDays: 3,
        nearbyVenues: 45,
        tourismIndex: 98,
        products: [
            { name: "Dom Pérignon Champagne", stock: 12, demand: 67, velocity: 290, impact: 1200000 },
            { name: "Hennessy XO Cognac", stock: 8, demand: 34, velocity: 178, impact: 680000 },
        ],
    },
]

export function AlcoraIntelligenceCenter() {

    const [view, setView] = useState<"overview" | "table" | "card" | "detailed">("overview")
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
    const [selectedDistributor, setSelectedDistributor] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<string>("all")

    const filteredDistributors = useMemo(() => {
        return distributorsData.filter((d) => {
            const matchesSearch =
                d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.location.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesFilter = filterStatus === "all" || d.status === filterStatus
            const matchesRegion = !selectedRegion || d.region === selectedRegion
            return matchesSearch && matchesFilter && matchesRegion
        })
    }, [searchQuery, filterStatus, selectedRegion])

    const totalOpportunity = regionsData.reduce((sum, r) => sum + r.opportunityValue, 0)
    const totalRisk = regionsData.reduce((sum, r) => sum + r.revenueAtRisk, 0)
    const avgConfidence = regionsData.reduce((sum, r) => sum + r.aiConfidence, 0) / regionsData.length

    if (view === "detailed" && selectedDistributor) {
        const distributor = distributorsData.find((d) => d.id === selectedDistributor)
        if (distributor) {
            return (
                <DetailedDistributorView
                    distributor={distributor}
                    onBack={() => {
                        setView("card")
                    }}
                />
            )
        }
    }

    if (view === "card" && selectedDistributor) {
        const distributor = distributorsData.find((d) => d.id === selectedDistributor)
        if (distributor) {
            return (
                <CompactDistributorCard
                    distributor={distributor}
                    onBack={() => {
                        setView("overview")
                        setSelectedDistributor(null)
                    }}
                    onDetailedView={() => setView("detailed")}
                />
            )
        }
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                            Alcora Intelligence
                        </h1>
                        <p className="text-slate-600 mt-1 text-lg">AI-powered distribution optimization across Kenya</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="lg" className="border-slate-300 hover:bg-slate-50">
                            <BarChart3 className="mr-2 h-5 w-5" />
                            Analytics
                        </Button>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg"
                        >
                            <Zap className="mr-2 h-5 w-5" />
                            AI Optimize
                        </Button>
                    </div>
                </motion.div>

                {/* Intelligence KPIs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-4 gap-6"
                >
                    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-600 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-emerald-700">KES {(totalOpportunity / 1000000).toFixed(1)}M</p>
                                    <p className="text-emerald-600 text-sm font-medium">Opportunity Value</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-600 rounded-lg">
                                    <AlertTriangle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-700">KES {(totalRisk / 1000000).toFixed(1)}M</p>
                                    <p className="text-red-600 text-sm font-medium">Revenue at Risk</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Target className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-blue-700">{avgConfidence.toFixed(0)}%</p>
                                    <p className="text-blue-600 text-sm font-medium">AI Confidence</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-600 rounded-lg">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-purple-700">
                                        {regionsData.reduce((sum, r) => sum + r.distributors, 0)}
                                    </p>
                                    <p className="text-purple-600 text-sm font-medium">Active Distributors</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <div>
                    <SeasonalPulse />
                    <AIInsights />
                </div>
                {/* Search and Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search distributors, locations, or products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 border-slate-300 focus:border-emerald-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="critical">Critical</option>
                            <option value="warning">Warning</option>
                            <option value="opportunity">Opportunity</option>
                            <option value="optimal">Optimal</option>
                        </select>
                    </div>
                    {selectedRegion && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSelectedRegion(null)
                                setView("overview")
                            }}
                        >
                            Clear Region Filter
                        </Button>
                    )}
                </motion.div>

                {/* Distributor Grid */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <DistributorTable
                        distributors={filteredDistributors}
                        onDistributorSelect={(distributorId) => {
                            setSelectedDistributor(distributorId)
                            setView("card")
                        }}
                    />
                </motion.div>
            </div>
        </div>
    )
}
