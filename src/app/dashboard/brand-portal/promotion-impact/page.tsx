"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    AlertCircle,
    ArrowUpRight,
} from "lucide-react"

import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PromotionImpactDashboard } from "@/components/brand-owner/promotion-impact-dashboard"
import { PromotionVerification } from "@/components/brand-owner/promotion-verification"

export default function BrandDashboardPage() {
    const [activeTab, setActiveTab] = useState("overview")
    const [isLoading, setIsLoading] = useState(true)
    const [showInsightModal, setShowInsightModal] = useState(false)

    // Simulate loading state
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1500)

        return () => clearTimeout(timer)
    }, [])

    // Show insight modal after loading
    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                setShowInsightModal(true)
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [isLoading])

    return (
        <div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-normal">Promotion Verification</h2>
                    <div className="flex items-center gap-3">
                        <Button className="h-8 text-xs" variant="outline">View Archive</Button>
                        <Button className="h-8 text-xs bg-emerald-700 hover:bg-emerald-800 text-white">Create Promotion</Button>
                    </div>
                </div>

                <Card className="border-gray-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-normal">Promotion Execution Verification</CardTitle>
                        <CardDescription>Visual proof of promotion implementation across outlets</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="aspect-[2/1] bg-gray-100 animate-pulse rounded-md" />
                        ) : (
                            <PromotionVerification fullSize />
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 border-gray-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-normal">Promotion Impact Dashboard</CardTitle>
                            <CardDescription>Real-time impact measurement of your active promotions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="aspect-video bg-gray-100 animate-pulse rounded-md" />
                            ) : (
                                <PromotionImpactDashboard />
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-normal">Promotion Insights</CardTitle>
                            <CardDescription>Key metrics and ROI analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    <div className="h-40 bg-gray-100 animate-pulse rounded-md" />
                                    <div className="h-40 bg-gray-100 animate-pulse rounded-md" />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-normal mb-1">Promotion ROI</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                <p className="text-xs text-gray-500">Avg. ROI</p>
                                                <p className="text-xl font-normal text-emerald-600">3.2x</p>
                                                <p className="text-xs text-emerald-600">+0.4x vs last period</p>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                <p className="text-xs text-gray-500">Top ROI</p>
                                                <p className="text-xl font-normal text-emerald-600">5.8x</p>
                                                <p className="text-xs text-gray-500">Holiday Special</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-normal mb-3">Execution Quality</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Holiday Special 2025</span>
                                                <span className="text-sm font-normal text-green-600">92%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }}></div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Premium Vodka Push</span>
                                                <span className="text-sm font-normal text-green-600">85%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Coastal Region Focus</span>
                                                <span className="text-sm font-normal text-amber-600">68%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "68%" }}></div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Weekday Happy Hour</span>
                                                <span className="text-sm font-normal text-red-600">45%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div className="bg-red-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {showInsightModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                    onClick={() => setShowInsightModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-emerald-100 p-2 rounded-full">
                                    <AlertCircle className="h-6 w-6 text-emerald-700" />
                                </div>
                                <h3 className="text-lg font-normal">Critical Insight Detected</h3>
                            </div>

                            <p className="text-gray-700 mb-4">
                                Our AI has detected a potential revenue leakage in the Nairobi region. 3 retailers are selling Premium
                                Vodka below MSRP, potentially undercutting other retailers and reducing your margins.
                            </p>

                            <div className="bg-amber-50 border border-amber-100 rounded-md p-3 mb-4">
                                <p className="text-sm text-amber-800">
                                    <strong>Estimated Impact:</strong> KES 450,000 in lost margin over the next 30 days if not addressed.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowInsightModal(false)}>
                                    Dismiss
                                </Button>
                                <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">
                                    View Details
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    )
}
