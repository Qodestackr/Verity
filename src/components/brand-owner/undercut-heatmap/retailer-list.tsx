"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, ChevronDown, ChevronUp, MapPin, Search, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RetailerList() {

    const [expandedRow, setExpandedRow] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("severity")

    const toggleRow = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id)
    }

    // Filter retailers based on search query
    const filteredRetailers = retailers.filter(
        (retailer) =>
            retailer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            retailer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            retailer.product.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Sort retailers based on selected sort option
    const sortedRetailers = [...filteredRetailers].sort((a, b) => {
        if (sortBy === "severity") {
            return b.priceDifference - a.priceDifference
        } else if (sortBy === "location") {
            return a.location.localeCompare(b.location)
        } else if (sortBy === "product") {
            return a.product.localeCompare(b.product)
        } else if (sortBy === "retailer") {
            return a.name.localeCompare(b.name)
        }
        return 0
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Search retailers, products, or locations..."
                        className="pl-9 bg-white border-gray-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-white border-gray-200">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="severity">Sort by Severity</SelectItem>
                        <SelectItem value="location">Sort by Location</SelectItem>
                        <SelectItem value="product">Sort by Product</SelectItem>
                        <SelectItem value="retailer">Sort by Retailer Name</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="bg-gray-50 p-2 rounded-md text-sm text-gray-500 flex items-center justify-between">
                <span>Showing {sortedRetailers.length} non-compliant retailers</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                        Severe: {retailers.filter((r) => r.priceDifference > 20).length}
                    </span>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Moderate: {retailers.filter((r) => r.priceDifference > 10 && r.priceDifference <= 20).length}
                    </span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        Mild: {retailers.filter((r) => r.priceDifference <= 10).length}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                {sortedRetailers.map((retailer) => (
                    <div key={retailer.id} className="space-y-2">
                        <div
                            className="flex items-center justify-between p-3 border border-gray-100 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleRow(retailer.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`${retailer.priceDifference > 20
                                        ? "bg-red-100 text-red-800"
                                        : retailer.priceDifference > 10
                                            ? "bg-amber-100 text-amber-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        } p-2 rounded-full`}
                                >
                                    <TrendingDown className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium">{retailer.name}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>{retailer.location}</span>
                                        </div>
                                        <span>•</span>
                                        <span>{retailer.product}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge
                                    className={`${retailer.priceDifference > 20
                                        ? "bg-red-100 text-red-800"
                                        : retailer.priceDifference > 10
                                            ? "bg-amber-100 text-amber-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}
                                >
                                    {retailer.priceDifference}% below MSRP
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleRow(retailer.id)
                                    }}
                                >
                                    {expandedRow === retailer.id ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {expandedRow === retailer.id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                transition={{ duration: 0.3 }}
                                className="bg-gray-50 rounded-md p-4 border border-gray-100 ml-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <h5 className="text-sm font-medium mb-2">Pricing Details</h5>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">MSRP</span>
                                                <span className="font-medium">KES {retailer.msrp.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Current Price</span>
                                                <span className="font-medium">KES {retailer.currentPrice.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Price Difference</span>
                                                <span className="font-medium text-red-600">
                                                    -KES {(retailer.msrp - retailer.currentPrice).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">First Detected</span>
                                                <span className="font-medium">{retailer.firstDetected}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-medium mb-2">Impact Assessment</h5>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Monthly Volume</span>
                                                <span className="font-medium">{retailer.monthlyVolume} units</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Est. Revenue Loss</span>
                                                <span className="font-medium">KES {retailer.revenueLoss.toLocaleString()}/mo</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Brand Impact</span>
                                                <span
                                                    className={`font-medium ${retailer.priceDifference > 20
                                                        ? "text-red-600"
                                                        : retailer.priceDifference > 10
                                                            ? "text-amber-600"
                                                            : "text-yellow-600"
                                                        }`}
                                                >
                                                    {retailer.priceDifference > 20
                                                        ? "Severe"
                                                        : retailer.priceDifference > 10
                                                            ? "Moderate"
                                                            : "Mild"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Compliance History</span>
                                                <span className="font-medium">{retailer.complianceHistory}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {retailer.priceDifference > 15 && (
                                    <div className="bg-amber-50 border border-amber-100 rounded-md p-3 text-sm text-amber-800 flex items-start gap-2 mb-4">
                                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Potential Grey Market Activity</p>
                                            <p>
                                                The pricing is significantly below sustainable levels, suggesting possible unauthorized
                                                distribution channels or grey market activity.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" className="text-xs h-8">
                                        View Location on Map
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-xs h-8">
                                        View History
                                    </Button>
                                    <Button size="sm" className="text-xs h-8 bg-emerald-700 hover:bg-emerald-800 text-white">
                                        Take Action
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

const retailers = [
    {
        id: 1,
        name: "Downtown Spirits",
        location: "Nairobi Central",
        product: "Premium Vodka 750ml",
        priceDifference: 25,
        msrp: 2500,
        currentPrice: 1875,
        firstDetected: "2 days ago",
        monthlyVolume: 120,
        revenueLoss: 75000,
        complianceHistory: "Previously Compliant",
    },
    {
        id: 2,
        name: "Westlands Liquor Store",
        location: "Nairobi",
        product: "Premium Vodka 750ml",
        priceDifference: 22,
        msrp: 2500,
        currentPrice: 1950,
        firstDetected: "3 days ago",
        monthlyVolume: 85,
        revenueLoss: 46750,
        complianceHistory: "First Violation",
    },
    {
        id: 3,
        name: "Coastal Beverages",
        location: "Mombasa",
        product: "Craft Gin 500ml",
        priceDifference: 22,
        msrp: 3200,
        currentPrice: 2496,
        firstDetected: "1 week ago",
        monthlyVolume: 65,
        revenueLoss: 45760,
        complianceHistory: "Repeat Offender",
    },
    {
        id: 4,
        name: "Mombasa Bay Spirits",
        location: "Mombasa",
        product: "Craft Gin 500ml",
        priceDifference: 20,
        msrp: 3200,
        currentPrice: 2560,
        firstDetected: "5 days ago",
        monthlyVolume: 55,
        revenueLoss: 35200,
        complianceHistory: "First Violation",
    },
    {
        id: 5,
        name: "Lakeside Beverages",
        location: "Kisumu",
        product: "Light Beer 6-pack",
        priceDifference: 18,
        msrp: 1200,
        currentPrice: 984,
        firstDetected: "2 weeks ago",
        monthlyVolume: 210,
        revenueLoss: 45360,
        complianceHistory: "Repeat Offender",
    },
    {
        id: 6,
        name: "Nakuru Spirits",
        location: "Nakuru",
        product: "Blended Whisky 1L",
        priceDifference: 15,
        msrp: 4500,
        currentPrice: 3825,
        firstDetected: "1 week ago",
        monthlyVolume: 40,
        revenueLoss: 27000,
        complianceHistory: "Previously Compliant",
    },
    {
        id: 7,
        name: "Highland Liquors",
        location: "Eldoret",
        product: "Premium Vodka 750ml",
        priceDifference: 12,
        msrp: 2500,
        currentPrice: 2200,
        firstDetected: "3 weeks ago",
        monthlyVolume: 65,
        revenueLoss: 19500,
        complianceHistory: "First Violation",
    },
    {
        id: 8,
        name: "Malindi Beach Bar",
        location: "Malindi",
        product: "Craft Gin 500ml",
        priceDifference: 8,
        msrp: 3200,
        currentPrice: 2944,
        firstDetected: "1 month ago",
        monthlyVolume: 35,
        revenueLoss: 8960,
        complianceHistory: "Previously Compliant",
    },
]
