"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    ArrowLeft,
    MapPin,
    TrendingUp,
    Users,
    Package,
    AlertTriangle,
    Calendar,
    Clock,
    Star,
    Truck,
    BarChart3,
    Target,
    Zap,
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

interface DetailedDistributorViewProps {
    distributor: DistributorData
    onBack: () => void
}

export function DetailedDistributorView({
    distributor, onBack }: DetailedDistributorViewProps) {
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

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={onBack} size="lg">
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back to Overview
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{distributor.name}</h1>
                            <p className="text-slate-600 text-lg">
                                {distributor.location} • {distributor.region}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="lg">
                            <BarChart3 className="mr-2 h-5 w-5" />
                            Historical Data
                        </Button>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                        >
                            <Zap className="mr-2 h-5 w-5" />
                            AI Optimize
                        </Button>
                    </div>
                </motion.div>

                {/* Status Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`p-6 rounded-lg border-2 ${getStatusColor(distributor.status)}`}
                >
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
                </motion.div>

                {/* Key Metrics Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-5 gap-4"
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
                            <Clock className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                            <p className="text-2xl font-bold">{distributor.stockDays}</p>
                            <p className="text-sm text-slate-600">Days Stock</p>
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

                {/* Product Performance Analysis */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Package className="h-6 w-6 text-slate-600" />
                                Product Performance Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {distributor.products.map((product, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-semibold">{product.name}</h4>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-sm text-slate-600">{product.stock} units in stock</span>
                                                <Badge variant="outline" className="text-xs">
                                                    Velocity: {product.velocity}%
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">KES {(product.impact / 1000).toLocaleString()}K</p>
                                            <p className="text-xs text-slate-500">potential impact</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Stock vs Demand</span>
                                                <span>
                                                    {product.stock} / {product.demand} units
                                                </span>
                                            </div>
                                            <Progress value={(product.stock / product.demand) * 100} className="h-3" />
                                        </div>

                                        {product.stock < product.demand * 0.3 && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex items-center gap-2 p-3 bg-red-50 rounded border border-red-200"
                                            >
                                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-red-700">Critical Stock Level</p>
                                                    <p className="text-xs text-red-600">
                                                        Order {product.demand - product.stock} units immediately to prevent stockout
                                                    </p>
                                                </div>
                                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                                    <Truck className="mr-2 h-4 w-4" />
                                                    Order Now
                                                </Button>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* AI Recommendations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 gap-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="h-5 w-5 text-slate-600" />
                                AI Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                                <h4 className="font-medium text-emerald-900 mb-1">Inventory Optimization</h4>
                                <p className="text-sm text-emerald-800 mb-2">
                                    Increase Grey Goose inventory by 40% before weekend surge
                                </p>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    Apply Recommendation
                                </Button>
                            </div>
                            <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                <h4 className="font-medium text-blue-900 mb-1">Market Expansion</h4>
                                <p className="text-sm text-blue-800 mb-2">Target 3 nearby hotels with premium champagne offerings</p>
                                <Button size="sm" variant="outline">
                                    View Strategy
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-slate-600" />
                                Performance Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                                <span className="text-sm">vs Regional Average</span>
                                <Badge className="bg-emerald-600">+23% better</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                                <span className="text-sm">Growth Trajectory</span>
                                <Badge variant="outline">Accelerating</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                                <span className="text-sm">Risk Assessment</span>
                                <Badge variant="secondary">Low Risk</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
