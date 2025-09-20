"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MapPin, TrendingUp, AlertTriangle, Clock, Star, ArrowRight, Users, Package, Calendar } from "lucide-react"

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

interface DistributorGridProps {
    distributors: DistributorData[]
    onDistributorSelect: (distributorId: string) => void
}

export function DistributorGrid({
    distributors, onDistributorSelect }: DistributorGridProps) {
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
                return <AlertTriangle className="h-5 w-5 text-red-600" />
            case "warning":
                return <Clock className="h-5 w-5 text-amber-600" />
            case "opportunity":
                return <TrendingUp className="h-5 w-5 text-emerald-600" />
            case "optimal":
                return <Star className="h-5 w-5 text-blue-600" />
            default:
                return <MapPin className="h-5 w-5 text-gray-600" />
        }
    }

    const getUrgencyLevel = (stockDays: number) => {
        if (stockDays <= 3) return { level: "critical", color: "text-red-600", bg: "bg-red-100" }
        if (stockDays <= 7) return { level: "warning", color: "text-amber-600", bg: "bg-amber-100" }
        if (stockDays <= 14) return { level: "caution", color: "text-blue-600", bg: "bg-blue-100" }
        return { level: "good", color: "text-emerald-600", bg: "bg-emerald-100" }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Distribution Network ({distributors.length})</h3>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Package className="h-4 w-4" />
                    <span>Showing {distributors.length} distributors</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {distributors.map((distributor, index) => {
                    const urgency = getUrgencyLevel(distributor.stockDays)

                    return (
                        <motion.div
                            key={distributor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                className={`${getStatusColor(distributor.status)} border-2 hover:shadow-lg transition-all duration-200 cursor-pointer group`}
                            >
                                <CardContent className="p-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(distributor.status)}
                                            <div>
                                                <h4 className="font-semibold text-sm">{distributor.name}</h4>
                                                <p className="text-xs text-slate-600">{distributor.location}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {distributor.region}
                                        </Badge>
                                    </div>

                                    {/* Key Metrics */}
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="text-center p-2 bg-white rounded border">
                                            <p className="text-lg font-bold">{distributor.marketShare}%</p>
                                            <p className="text-xs text-slate-600">Market Share</p>
                                        </div>
                                        <div className="text-center p-2 bg-white rounded border">
                                            <p className="text-lg font-bold">{distributor.velocity}%</p>
                                            <p className="text-xs text-slate-600">Velocity</p>
                                        </div>
                                    </div>

                                    {/* Stock Days Alert */}
                                    <div className={`p-2 rounded-md mb-3 ${urgency.bg}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className={`h-4 w-4 ${urgency.color}`} />
                                                <span className={`text-sm font-medium ${urgency.color}`}>
                                                    {distributor.stockDays} days stock
                                                </span>
                                            </div>
                                            {distributor.stockDays <= 7 && (
                                                <Badge variant="destructive" className="text-xs">
                                                    Urgent
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Revenue Impact */}
                                    <div className="mb-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-slate-600">Revenue Impact</span>
                                            <span className="text-sm font-bold">
                                                KES {(distributor.revenueImpact / 1000).toLocaleString()}K
                                            </span>
                                        </div>
                                        <Progress value={Math.min((distributor.revenueImpact / 2000000) * 100, 100)} className="h-2" />
                                    </div>

                                    {/* Context Indicators */}
                                    <div className="flex items-center justify-between mb-3 text-xs">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3 text-slate-500" />
                                            <span className="text-slate-600">{distributor.nearbyVenues} venues</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-slate-500" />
                                            <span className="text-slate-600">Tourism: {distributor.tourismIndex}%</span>
                                        </div>
                                    </div>

                                    {/* Products Preview */}
                                    <div className="mb-3">
                                        <p className="text-xs text-slate-600 mb-1">{distributor.products.length} product lines</p>
                                        <div className="flex gap-1">
                                            {distributor.products.slice(0, 3).map((product, idx) => (
                                                <div key={idx} className="flex-1 h-1 bg-slate-200 rounded">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded"
                                                        style={{ width: `${Math.min((product.stock / product.demand) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full group-hover:bg-slate-100"
                                        onClick={() => onDistributorSelect(distributor.id)}
                                    >
                                        Deep Analysis
                                        <ArrowRight className="ml-2 h-3 w-3" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {distributors.length === 0 && (
                <div className="text-center py-12">
                    <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">No distributors found</h3>
                    <p className="text-slate-500">Try adjusting your search or filter criteria</p>
                </div>
            )}
        </div>
    )
}
