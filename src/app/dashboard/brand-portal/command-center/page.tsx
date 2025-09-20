"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
    ArrowRight,
    BarChart3,
    Brain,
    Clock,
    Eye,
    MapPin,
    Shield,
} from "lucide-react"

import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DistributionNetworkMap } from "./distribution-network-map"
import { RetailerTrustScores } from "./retailer-trust-scores"
import { MarketPenetrationChart } from "./market-penetration-chart"
import { AIInsightPanel } from "./ai-insight-panel"

export default function CommandCenterPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [expandedCard, setExpandedCard] = useState<string | null>(null)
    const [showAIInsight, setShowAIInsight] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    // Show AI insight after loading
    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                setShowAIInsight(true)
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [isLoading])

    const toggleCardExpansion = (cardId: string) => {
        setExpandedCard(expandedCard === cardId ? null : cardId)
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 p-1">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-medium text-gray-900">Brand Command Center</h1>
                        <p className="text-sm text-gray-500">Comprehensive control over your distribution network</p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-xs font-light text-emerald-700 border-emerald-200">
                        Enterprise
                    </Badge>
                </div>
            </header>

            <main className="p-4">
                {/* KPI: DISTRIBUTION REACH OF TARGET MARKETS AND MARKET SHARE WITH INSIGHTS GAPS. This is where you see spatial territories as is */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <Card
                        className={`border-gray-200 transition-all duration-300 ${expandedCard === "distribution-network" ? "lg:col-span-2" : ""
                            }`}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-emerald-600" />
                                        Distribution Network Map
                                    </CardTitle>
                                    <CardDescription>Real-time view of your entire distribution network</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-emerald-100 text-emerald-800">0 Active Retailers</Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => toggleCardExpansion("distribution-network")}
                                    >
                                        {expandedCard === "distribution-network" ? (
                                            <Eye className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="aspect-[2/1] bg-gray-100 animate-pulse rounded-md" />
                            ) : (
                                <DistributionNetworkMap expanded={expandedCard === "distribution-network"} />
                            )}
                        </CardContent>
                        <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
                            <div className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Last updated: Today, 10:45 AM
                            </div>
                            <Button variant="ghost" size="sm" className="h-8">
                                Optimize Routes
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Secondary Dashboard Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Retailer Trust Scores */}
                    <Card
                        className={`border-gray-200 transition-all duration-300 ${expandedCard === "retailer-trust" ? "lg:col-span-3" : ""
                            }`}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        Retailer Trust Scores
                                    </CardTitle>
                                    <CardDescription>Identify your most reliable retail partners</CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => toggleCardExpansion("retailer-trust")}
                                >
                                    {expandedCard === "retailer-trust" ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-3">
                                    <div className="h-12 bg-gray-100 animate-pulse rounded-md" />
                                    <div className="h-12 bg-gray-100 animate-pulse rounded-md" />
                                    <div className="h-12 bg-gray-100 animate-pulse rounded-md" />
                                </div>
                            ) : (
                                <RetailerTrustScores expanded={expandedCard === "retailer-trust"} />
                            )}
                        </CardContent>
                        <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
                            <div className="text-sm text-gray-500 flex items-center">
                                <Shield className="h-4 w-4 mr-1" />
                                Based on price compliance, stocking frequency, and sales data
                            </div>
                            <Button variant="ghost" size="sm" className="h-8">
                                View All Retailers
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Market Penetration Chart */}
                    <Card
                        className={`border-gray-200 transition-all duration-300 ${expandedCard === "market-penetration" ? "lg:col-span-2" : "lg:col-span-2"
                            }`}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-purple-600" />
                                        Market Penetration Analysis
                                    </CardTitle>
                                    <CardDescription>Track your reach across regions and product categories</CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => toggleCardExpansion("market-penetration")}
                                >
                                    {expandedCard === "market-penetration" ? (
                                        <Eye className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="aspect-[2/1] bg-gray-100 animate-pulse rounded-md" />
                            ) : (
                                <MarketPenetrationChart expanded={expandedCard === "market-penetration"} />
                            )}
                        </CardContent>
                        <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
                            <div className="text-sm text-gray-500 flex items-center">
                                <Brain className="h-4 w-4 mr-1" />
                                AI-powered analysis of market coverage and opportunities
                            </div>
                            <Button variant="ghost" size="sm" className="h-8">
                                View Opportunities
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>

            {/* AI Insight Panel */}
            {showAIInsight && <AIInsightPanel onClose={() => setShowAIInsight(false)} />}
        </div>
    )
}
