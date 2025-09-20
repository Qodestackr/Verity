"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowRight, Check, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PriceComplianceMonitor({
    fullSize = false }: { fullSize?: boolean }) {
    const [expandedRow, setExpandedRow] = useState<number | null>(null)

    const toggleRow = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id)
    }

    return (
        <div
            className={`${fullSize ? "h-[500px]" : "aspect-video"} bg-white rounded-md border border-gray-100 p-4 overflow-auto`}
        >
            <div className="flex flex-col h-full py-4">
                <Tabs defaultValue="violations" className="flex-1 flex flex-col">
                    <TabsList>
                        <TabsTrigger value="violations" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                            Violations (12)
                        </TabsTrigger>
                        <TabsTrigger
                            value="compliant"
                            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                        >
                            Compliant (1,242)
                        </TabsTrigger>
                        <TabsTrigger value="trends" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            Pricing Trends
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="violations" className="flex-1 mt-4 space-y-3">
                        {priceViolations.map((violation) => (
                            <Card key={violation.id} className="border-red-100">
                                <CardContent className="p-0">
                                    <div
                                        className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => toggleRow(violation.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                                    <h4 className="font-medium text-sm">{violation.retailer}</h4>
                                                    <Badge className="bg-red-100 text-red-800">{violation.type}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {violation.location} • Reported {violation.reportedTime}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm font-medium">KES {violation.actualPrice}</span>
                                                        <span className="text-xs text-red-600">
                                                            {violation.priceDifference < 0 ? "" : "+"}
                                                            {violation.priceDifference}%
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">vs MSRP KES {violation.msrp}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleRow(violation.id)
                                                    }}
                                                >
                                                    {expandedRow === violation.id ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        {expandedRow === violation.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                transition={{ duration: 0.3 }}
                                                className="mt-3 pt-3 border-t border-gray-100"
                                            >
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Product</p>
                                                        <p className="text-sm font-medium">{violation.product}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Distributor</p>
                                                        <p className="text-sm">{violation.distributor}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Verified By</p>
                                                        <p className="text-sm">{violation.verifiedBy}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Verification Method</p>
                                                        <p className="text-sm">{violation.verificationMethod}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex justify-end gap-2">
                                                    <Button variant="outline" size="sm">
                                                        Ignore
                                                    </Button>
                                                    <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                                                        Take Action
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="compliant" className="flex-1 mt-4">
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                    <Check className="h-6 w-6 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">All Compliant Retailers</h3>
                                <p className="text-gray-500 max-w-md">
                                    1,242 retailers are currently selling your products at or above the recommended price points.
                                </p>
                                <Button className="mt-4 bg-emerald-700 hover:bg-emerald-800 text-white">View Detailed Report</Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="trends" className="flex-1 mt-4">
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                    <ChevronUp className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Pricing Trends</h3>
                                <p className="text-gray-500 max-w-md">
                                    Overall price compliance has improved by 8% in the last 30 days. Nairobi region shows the highest
                                    improvement.
                                </p>
                                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">View Trend Analysis</Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

const priceViolations = [
    {
        id: 1,
        retailer: "Downtown Spirits",
        location: "Nairobi",
        type: "Underpricing",
        product: "Premium Vodka 750ml",
        msrp: 1200,
        actualPrice: 950,
        priceDifference: -21,
        reportedTime: "10 min ago",
        distributor: "Central Distributors Ltd",
        verifiedBy: "POS Tx", // could be a Field Agent too
        verificationMethod: "Stock snapshots and recent POS sales", //In-store visit with photo evidence
    },
    {
        id: 2,
        retailer: "Westlands Wine & Spirits",
        location: "Nairobi",
        type: "Underpricing",
        product: "Premium Vodka 750ml",
        msrp: 1200,
        actualPrice: 999,
        priceDifference: -17,
        reportedTime: "2 hours ago",
        distributor: "Central Distributors Ltd",
        verifiedBy: "POS Tx",
        verificationMethod: "Stock snapshots and recent POS sales",
    },
    {
        id: 3,
        retailer: "Coastal Liquor Store",
        location: "Mombasa",
        type: "Underpricing",
        product: "Craft Gin 500ml",
        msrp: 1800,
        actualPrice: 1600,
        priceDifference: -11,
        reportedTime: "5 hours ago",
        distributor: "Coastal Beverages",
        verifiedBy: "POS Tx",
        verificationMethod: "Stock snapshots and recent POS sales",
    },
]
