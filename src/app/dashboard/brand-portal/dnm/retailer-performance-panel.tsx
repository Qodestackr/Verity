"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, ChevronDown, ChevronUp, Info, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function RetailerPerformancePanel({
    expanded = false }: { expanded?: boolean }) {
    const [expandedRow, setExpandedRow] = useState<number | null>(null)

    const toggleRow = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id)
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">Top Performing Retailers</h3>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="cursor-pointer">
                                    <Info className="h-4 w-4 text-gray-400" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="max-w-xs">
                                    <p className="text-sm">
                                        Performance is calculated based on sales volume, stocking frequency, and product visibility.
                                    </p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                    View All
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
            </div>

            {retailers.map((retailer) => (
                <div key={retailer.id} className="space-y-2">
                    <div
                        className="flex items-center justify-between p-2 border border-gray-100 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleRow(retailer.id)}
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <Store className={`h-4 w-4 ${getPerformanceColor(retailer.performanceScore)}`} />
                                <h4 className="font-medium text-sm">{retailer.name}</h4>
                                <Badge
                                    className={`${retailer.performanceScore >= 90
                                        ? "bg-emerald-100 text-emerald-800"
                                        : retailer.performanceScore >= 75
                                            ? "bg-blue-100 text-blue-800"
                                            : retailer.performanceScore >= 60
                                                ? "bg-amber-100 text-amber-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {retailer.performanceScore}%
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="flex items-center gap-1">
                                    <span className="text-sm">{retailer.location}</span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleRow(retailer.id)
                                }}
                            >
                                {expandedRow === retailer.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </Button>
                        </div>
                    </div>

                    {expandedRow === retailer.id && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                            className="bg-gray-50 rounded-md p-3 border border-gray-100 ml-6"
                        >
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <p className="text-gray-500">Monthly Sales Volume</p>
                                        <p className="font-medium">{retailer.monthlySales}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Stocking Frequency</p>
                                        <p className="font-medium">{retailer.stockingFrequency}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Product Visibility</p>
                                        <p className="font-medium">{retailer.productVisibility}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Years as Partner</p>
                                        <p className="font-medium">{retailer.yearsAsPartner}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Performance Breakdown</p>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <div
                                                key={index}
                                                className={`w-1/5 h-1.5 rounded-full ${index < Math.floor(retailer.performanceScore / 20)
                                                    ? getPerformanceColor(retailer.performanceScore)
                                                    : "bg-gray-200"
                                                    }`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" className="text-xs h-7">
                                        View History
                                    </Button>
                                    <Button size="sm" className="text-xs h-7 bg-emerald-700 hover:bg-emerald-800 text-white">
                                        Contact Retailer
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            ))}

            {expanded && (
                <>
                    <div className="flex items-center justify-between mt-4 mb-2">
                        <h3 className="text-sm font-medium">Growth Opportunity Retailers</h3>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                            View All
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Button>
                    </div>

                    {growthRetailers.map((retailer) => (
                        <div key={retailer.id} className="space-y-2">
                            <div
                                className="flex items-center justify-between p-2 border border-gray-100 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleRow(retailer.id)}
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Store className={`h-4 w-4 ${getPerformanceColor(retailer.performanceScore)}`} />
                                        <h4 className="font-medium text-sm">{retailer.name}</h4>
                                        <Badge
                                            className={`${retailer.performanceScore >= 60 ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                                                }`}
                                        >
                                            {retailer.growthPotential}% Growth Potential
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm">{retailer.location}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleRow(retailer.id)
                                        }}
                                    >
                                        {expandedRow === retailer.id ? (
                                            <ChevronUp className="h-3 w-3" />
                                        ) : (
                                            <ChevronDown className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {expandedRow === retailer.id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-gray-50 rounded-md p-3 border border-gray-100 ml-6"
                                >
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <p className="text-gray-500">Current Monthly Sales</p>
                                                <p className="font-medium">{retailer.monthlySales}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Potential Monthly Sales</p>
                                                <p className="font-medium">{retailer.potentialSales}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Current Product Range</p>
                                                <p className="font-medium">{retailer.currentProductRange}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Recommended Products</p>
                                                <p className="font-medium">{retailer.recommendedProducts}</p>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-100 rounded-md p-2 text-xs text-blue-800 flex items-start gap-2">
                                            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium">Growth Opportunity</p>
                                                <p>{retailer.growthInsight}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" className="text-xs h-7">
                                                View Details
                                            </Button>
                                            <Button size="sm" className="text-xs h-7 bg-blue-600 hover:bg-blue-700 text-white">
                                                Create Growth Plan
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ))}
                </>
            )}
        </div>
    )
}

function getPerformanceColor(score: number): string {
    if (score >= 90) return "text-emerald-600"
    if (score >= 75) return "text-blue-600"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
}

const retailers = [
    {
        id: 1,
        name: "Downtown Spirits",
        location: "Nairobi",
        performanceScore: 96,
        monthlySales: "KES 1.2M",
        stockingFrequency: "Weekly",
        productVisibility: "Premium Placement",
        yearsAsPartner: 4,
    },
    {
        id: 2,
        name: "Westlands Wine & Spirits",
        location: "Nairobi",
        performanceScore: 92,
        monthlySales: "KES 980K",
        stockingFrequency: "Weekly",
        productVisibility: "Premium Placement",
        yearsAsPartner: 3,
    },
    {
        id: 3,
        name: "Coastal Liquor Store",
        location: "Mombasa",
        performanceScore: 88,
        monthlySales: "KES 750K",
        stockingFrequency: "Bi-weekly",
        productVisibility: "Standard Placement",
        yearsAsPartner: 2,
    },
    {
        id: 4,
        name: "Lakeside Beverages",
        location: "Kisumu",
        performanceScore: 82,
        monthlySales: "KES 620K",
        stockingFrequency: "Bi-weekly",
        productVisibility: "Standard Placement",
        yearsAsPartner: 2,
    },
]

const growthRetailers = [
    {
        id: 101,
        name: "Urban Liquor Mart",
        location: "Nairobi",
        performanceScore: 68,
        growthPotential: 35,
        monthlySales: "KES 320K",
        potentialSales: "KES 432K",
        currentProductRange: "3 SKUs",
        recommendedProducts: "Premium Vodka, Craft Gin",
        growthInsight: "High foot traffic location with potential for premium product placement and increased visibility.",
    },
    {
        id: 102,
        name: "Coastal Convenience",
        location: "Mombasa",
        performanceScore: 72,
        growthPotential: 28,
        monthlySales: "KES 280K",
        potentialSales: "KES 358K",
        currentProductRange: "2 SKUs",
        recommendedProducts: "Blended Whisky, Light Beer",
        growthInsight: "Tourist area with opportunity for seasonal promotions and expanded product range.",
    },
]
