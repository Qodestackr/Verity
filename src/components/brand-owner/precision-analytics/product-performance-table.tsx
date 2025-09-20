"use client"

import { useState } from "react"
import { ArrowUpRight, ChevronDown, ChevronUp, TrendingDown, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function ProductPerformanceTable({
    expanded = false }: { expanded?: boolean }) {
    const [expandedRow, setExpandedRow] = useState<number | null>(null)

    const toggleRow = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id)
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Top Performers</h3>
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                    View All
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
            </div>

            {topProducts.map((product) => (
                <div key={product.id} className="space-y-2">
                    <div
                        className="flex items-center justify-between p-2 border border-gray-100 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleRow(product.id)}
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                                <h4 className="font-medium text-sm">{product.name}</h4>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-medium">{product.value}</span>
                                    <span className="text-xs text-emerald-600">{product.trend}</span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleRow(product.id)
                                }}
                            >
                                {expandedRow === product.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </Button>
                        </div>
                    </div>

                    {expandedRow === product.id && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                            className="bg-gray-50 rounded-md p-2 border border-gray-100 ml-6"
                        >
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <p className="text-gray-500">Region</p>
                                    <p className="font-medium">{product.region}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Distributor</p>
                                    <p className="font-medium">{product.distributor}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Velocity</p>
                                    <p className="font-medium">{product.velocity} units/day</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Margin</p>
                                    <p className="font-medium">{product.margin}%</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            ))}

            {expanded && (
                <>
                    <div className="flex items-center justify-between mt-4 mb-2">
                        <h3 className="text-sm font-medium">Needs Attention</h3>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                            View All
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Button>
                    </div>

                    {bottomProducts.map((product) => (
                        <div key={product.id} className="space-y-2">
                            <div
                                className="flex items-center justify-between p-2 border border-gray-100 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleRow(product.id)}
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                        <h4 className="font-medium text-sm">{product.name}</h4>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-medium">{product.value}</span>
                                            <span className="text-xs text-red-600">{product.trend}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleRow(product.id)
                                        }}
                                    >
                                        {expandedRow === product.id ? (
                                            <ChevronUp className="h-3 w-3" />
                                        ) : (
                                            <ChevronDown className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {expandedRow === product.id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-gray-50 rounded-md p-2 border border-gray-100 ml-6"
                                >
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <p className="text-gray-500">Region</p>
                                            <p className="font-medium">{product.region}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Distributor</p>
                                            <p className="font-medium">{product.distributor}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Velocity</p>
                                            <p className="font-medium">{product.velocity} units/day</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Margin</p>
                                            <p className="font-medium">{product.margin}%</p>
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

const topProducts = [
    {
        id: 1,
        name: "Premium Vodka 750ml",
        value: "12,458 units",
        trend: "+18%",
        region: "Nairobi",
        distributor: "Central Distributors Ltd",
        velocity: "42.8",
        margin: "32",
    },
    {
        id: 2,
        name: "Craft Gin 500ml",
        value: "8,245 units",
        trend: "+12%",
        region: "Mombasa",
        distributor: "Coastal Beverages",
        velocity: "28.6",
        margin: "38",
    },
    {
        id: 3,
        name: "Blended Whisky 1L",
        value: "6,872 units",
        trend: "+9%",
        region: "Kisumu",
        distributor: "Western Liquor Supply",
        velocity: "23.7",
        margin: "42",
    },
]

const bottomProducts = [
    {
        id: 4,
        name: "Light Beer 6-pack",
        value: "2,145 units",
        trend: "-8%",
        region: "Nairobi",
        distributor: "Central Distributors Ltd",
        velocity: "7.4",
        margin: "18",
    },
    {
        id: 5,
        name: "Flavored Rum 750ml",
        value: "1,872 units",
        trend: "-5%",
        region: "Nakuru",
        distributor: "Highland Distributors",
        velocity: "6.5",
        margin: "24",
    },
    {
        id: 6,
        name: "Cream Liqueur 500ml",
        value: "945 units",
        trend: "-15%",
        region: "Kisumu",
        distributor: "Western Liquor Supply",
        velocity: "3.3",
        margin: "28",
    },
]
