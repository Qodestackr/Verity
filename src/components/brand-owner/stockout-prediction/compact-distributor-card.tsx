"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    ArrowLeft,
    ArrowRight,
    MapPin,
    TrendingUp,
    Users,
    Package,
    AlertTriangle,
    Calendar,
    Clock,
    Star,
    Target,
    Zap,
    BarChart3,
    Truck,
} from "lucide-react"

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

interface CompactDistributorCardProps {
    distributor: DistributorData
    onBack: () => void
    onDetailedView: () => void
}

export function CompactDistributorCard({
    distributor, onBack, onDetailedView }: CompactDistributorCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "critical":
                return "border-red-500 bg-red-50"
            case "warning":
                return "border-amber-500 bg-amber-50"
            case "opportunity":
                return "border-emerald-500 bg-emerald-50"
            case "optimal":
                return "border-blue-500 bg-blue-50"
            default:
                return "border-gray-300 bg-gray-50"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "critical":
                return <AlertTriangle className="h-6 w-6 text-red-600" />
            case "warning":
                return <Clock className="h-6 w-6 text-amber-600" />
            case "opportunity":
                return <TrendingUp className="h-6 w-6 text-emerald-600" />
            case "optimal":
                return <Star className="h-6 w-6 text-blue-600" />
            default:
                return <MapPin className="h-6 w-6 text-gray-600" />
        }
    }

    const getUrgencyLevel = (stockDays: number) => {
        if (stockDays <= 3) return { level: "critical", color: "text-red-600", bg: "bg-red-100" }
        if (stockDays <= 7) return { level: "warning", color: "text-amber-600", bg: "bg-amber-100" }
        if (stockDays <= 14) return { level: "caution", color: "text-blue-600", bg: "bg-blue-100" }
        return { level: "good", color: "text-emerald-600", bg: "bg-emerald-100" }
    }

    const urgency = getUrgencyLevel(distributor.stockDays)

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={onBack} size="lg">
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back to Table
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{distributor.name}</h1>
                            <p className="text-slate-600">
                                {distributor.location} • {distributor.region}
                            </p>
                        </div>
                    </div>
                    <Button
                        size="lg"
                        onClick={onDetailedView}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                    >
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Deep Analysis
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </motion.div>

                {/* Status Overview Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className={`border-2 ${getStatusColor(distributor.status)}`}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {getStatusIcon(distributor.status)}
                                    <div>
                                        <h2 className="text-xl font-semibold capitalize">{distributor.status} Status</h2>
                                        <p className="text-slate-600">
                                            {distributor.status === "critical" && "Immediate action required"}
                                            {distributor.status === "warning" && "Monitor closely"}
                                            {distributor.status === "opportunity" && "Growth potential identified"}
                                            {distributor.status === "optimal" && "Performing excellently"}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">KES {(distributor.revenueImpact / 1000).toLocaleString()}K</p>
                                    <p className="text-slate-600">Revenue Impact</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Key Metrics Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                            <p className="text-2xl font-bold">{distributor.marketShare}%</p>
                            <p className="text-sm text-slate-600">Market Share</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
                            <p className="text-2xl font-bold">{distributor.velocity}%</p>
                            <p className="text-sm text-slate-600">Velocity</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                            <p className="text-2xl font-bold">{distributor.nearbyVenues}</p>
                            <p className="text-sm text-slate-600">Nearby Venues</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Calendar className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                            <p className="text-2xl font-bold">{distributor.tourismIndex}%</p>
                            <p className="text-sm text-slate-600">Tourism Index</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stock Alert */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className={`border-2 ${urgency.bg.replace("bg-", "border-").replace("-100", "-200")}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className={`h-6 w-6 ${urgency.color}`} />
                                    <div>
                                        <h3 className="font-semibold">Stock Status</h3>
                                        <p className={`text-sm ${urgency.color}`}>{distributor.stockDays} days of inventory remaining</p>
                                    </div>
                                </div>
                                {distributor.stockDays <= 7 && (
                                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                                        <Truck className="mr-2 h-4 w-4" />
                                        Order Now
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Product Performance Preview */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-5 w-5 text-slate-600" />
                                Product Performance Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {distributor.products.slice(0, 3).map((product, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="border rounded-lg p-3 bg-white"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium text-sm">{product.name}</h4>
                                        <Badge variant="outline" className="text-xs">
                                            {product.velocity}% velocity
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span>Stock: {product.stock} units</span>
                                            <span>Demand: {product.demand} units</span>
                                        </div>
                                        <Progress value={(product.stock / product.demand) * 100} className="h-2" />
                                        <div className="text-right">
                                            <span className="text-xs font-medium">
                                                KES {(product.impact / 1000).toLocaleString()}K impact
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {distributor.products.length > 3 && (
                                <div className="text-center pt-2">
                                    <Button variant="outline" onClick={onDetailedView}>
                                        View All {distributor.products.length} Products
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-2 gap-4"
                >
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Zap className="h-5 w-5 text-emerald-600" />
                                <h3 className="font-medium">AI Recommendation</h3>
                            </div>
                            <p className="text-sm text-slate-700 mb-3">
                                Increase premium vodka inventory by 40% before weekend surge
                            </p>
                            <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                Apply Recommendation
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Target className="h-5 w-5 text-blue-600" />
                                <h3 className="font-medium">Market Opportunity</h3>
                            </div>
                            <p className="text-sm text-slate-700 mb-3">3 nearby hotels show demand for premium champagne</p>
                            <Button size="sm" variant="outline" className="w-full">
                                Explore Opportunity
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
