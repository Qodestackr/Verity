"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Building2, ChevronRight, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function DistributorPerformanceTable({
    detailed = false }: { detailed?: boolean }) {
    const [expandedRow, setExpandedRow] = useState<number | null>(null)

    const toggleRow = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id)
    }

    return (
        <div className="space-y-3">
            {distributors.map((distributor) => (
                <div key={distributor.id} className="space-y-2">
                    <div
                        className="flex items-center justify-between p-3 border border-gray-100 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleRow(distributor.id)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-full">
                                <Building2 className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                                <h4 className="font-normal text-sm">{distributor.name}</h4>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <span>{distributor.type}</span>
                                    <span>•</span>
                                    <div className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-0.5" />
                                        {distributor.location}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className={`${statusColors[distributor.status]} h-4 text-xs font-normal`}>
                                {distributor.status}
                            </Badge>
                            <div className="text-sm">
                                Stock: <span className="font-normal">{distributor.stockLevel}</span>
                            </div>
                            {detailed && (
                                <div className="text-sm">
                                    Coverage: <span className="font-normal">{distributor.coverage}</span>
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleRow(distributor.id)
                                }}
                            >
                                <ChevronRight
                                    className={`h-4 w-4 transition-transform ${expandedRow === distributor.id ? "rotate-90" : ""}`}
                                />
                            </Button>
                        </div>
                    </div>

                    {expandedRow === distributor.id && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                            className="bg-gray-50 rounded-md p-3 border border-gray-100 ml-10"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Sales Performance</p>
                                    <p className="text-sm font-normal">{distributor.salesPerformance}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Order Fulfillment</p>
                                    <p className="text-sm font-normal">{distributor.orderFulfillment}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Outlets Served</p>
                                    <p className="text-sm font-normal">{distributor.outletsServed}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Last Order</p>
                                    <p className="text-sm font-normal">{distributor.lastOrder}</p>
                                </div>
                            </div>

                            {detailed && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h5 className="text-sm font-normal mb-2">Top Products</h5>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {distributor.topProducts.map((product, index) => (
                                            <div key={index} className="bg-white p-2 rounded border border-gray-100 text-sm">
                                                {product}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            ))}
        </div>
    )
}

const statusColors = {
    Active: "bg-green-100 text-green-800",
    Warning: "bg-amber-100 text-amber-800",
    Inactive: "bg-red-100 text-red-800",
}

const distributors = [
    {
        id: 1,
        name: "Central Distributors Ltd",
        type: "Primary Distributor",
        location: "Nairobi",
        status: "Active",
        stockLevel: "94%",
        coverage: "85%",
        salesPerformance: "+12% vs target",
        orderFulfillment: "98%",
        outletsServed: "320+",
        lastOrder: "Today",
        topProducts: ["Premium Vodka 750ml", "Craft Gin 500ml", "Blended Whisky 1L"],
    },
    {
        id: 2,
        name: "Coastal Beverages",
        type: "Regional Distributor",
        location: "Mombasa",
        status: "Active",
        stockLevel: "87%",
        coverage: "78%",
        salesPerformance: "+8% vs target",
        orderFulfillment: "95%",
        outletsServed: "180+",
        lastOrder: "Yesterday",
        topProducts: ["Light Beer 6-pack", "Premium Vodka 750ml", "Flavored Rum 750ml"],
    },
    {
        id: 3,
        name: "Western Liquor Supply",
        type: "Regional Distributor",
        location: "Kisumu",
        status: "Active",
        stockLevel: "92%",
        coverage: "82%",
        salesPerformance: "+15% vs target",
        orderFulfillment: "97%",
        outletsServed: "210+",
        lastOrder: "Today",
        topProducts: ["Blended Whisky 1L", "Premium Vodka 750ml", "Craft Gin 500ml"],
    },
    {
        id: 4,
        name: "Highland Distributors",
        type: "Regional Distributor",
        location: "Nakuru",
        status: "Warning",
        stockLevel: "68%",
        coverage: "65%",
        salesPerformance: "-5% vs target",
        orderFulfillment: "85%",
        outletsServed: "120+",
        lastOrder: "3 days ago",
        topProducts: ["Light Beer 6-pack", "Cream Liqueur 500ml", "Blended Whisky 1L"],
    },
]
