"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BarChart, LineChart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

export function PromotionImpactDashboard({
    fullSize = false }: { fullSize?: boolean }) {
    const [activeTab, setActiveTab] = useState("overview")
    const [isTyping, setIsTyping] = useState(true)
    const [typedText, setTypedText] = useState("")
    const fullText =
        "Measure the real impact of your promotions across your entire distribution network. Track sales uplift, ROI, and retailer engagement in real-time."

    useEffect(() => {
        if (!isTyping) return

        let currentIndex = 0
        const typingInterval = setInterval(() => {
            if (currentIndex < fullText.length) {
                setTypedText(fullText.substring(0, currentIndex + 1))
                currentIndex++
            } else {
                clearInterval(typingInterval)
                setIsTyping(false)
            }
        }, 30)

        return () => clearInterval(typingInterval)
    }, [isTyping, fullText])

    return (
        <div className={`${fullSize ? "h-[500px]" : "aspect-video"} bg-white rounded-md border border-gray-100 p-4`}>
            <div className="flex flex-col h-full">
                <div className="mb-4">
                    <h3 className="text-lg font-medium mb-1">Promotion Impact Measurement</h3>
                    <div className="h-6">
                        <p className="text-sm text-gray-600">{typedText}</p>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                    <TabsList className="bg-gray-50 border border-gray-200">
                        <TabsTrigger
                            value="overview"
                            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                            onClick={() => setActiveTab("overview")}
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="sales-uplift"
                            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                            onClick={() => setActiveTab("sales-uplift")}
                        >
                            Sales Uplift
                        </TabsTrigger>
                        <TabsTrigger
                            value="roi"
                            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                            onClick={() => setActiveTab("roi")}
                        >
                            ROI Analysis
                        </TabsTrigger>
                        <TabsTrigger
                            value="engagement"
                            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                            onClick={() => setActiveTab("engagement")}
                        >
                            Retailer Engagement
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="flex-1 mt-4">
                        <div className="grid grid-cols-2 gap-4 h-full">
                            <div className="flex flex-col gap-4">
                                <Card className="border-gray-200 flex-1">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-medium">Active Promotions Performance</h4>
                                            <BarChart className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <div className="h-full flex items-center justify-center">
                                            <div className="w-full">
                                                <div className="space-y-4">
                                                    <PromotionBar name="Holiday Special 2025" value={84} color="bg-emerald-500" trend="+24%" />
                                                    <PromotionBar name="Premium Vodka Push" value={72} color="bg-blue-500" trend="+18%" />
                                                    <PromotionBar name="Coastal Region Focus" value={58} color="bg-purple-500" trend="+12%" />
                                                    <PromotionBar name="Weekday Happy Hour" value={35} color="bg-amber-500" trend="+5%" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Card className="border-gray-200 flex-1">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-medium">Promotion ROI Comparison</h4>
                                            <LineChart className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <div className="h-full flex items-center justify-center">
                                            <div className="grid grid-cols-2 gap-4 w-full">
                                                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                                                    <p className="text-xs text-gray-500 mb-1">Holiday Special</p>
                                                    <p className="text-2xl font-medium text-emerald-700">5.8x</p>
                                                    <p className="text-xs text-emerald-600">ROI</p>
                                                </div>
                                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                                    <p className="text-xs text-gray-500 mb-1">Premium Vodka</p>
                                                    <p className="text-2xl font-medium text-blue-700">4.2x</p>
                                                    <p className="text-xs text-blue-600">ROI</p>
                                                </div>
                                                <div className="bg-purple-50 rounded-lg p-3 text-center">
                                                    <p className="text-xs text-gray-500 mb-1">Coastal Region</p>
                                                    <p className="text-2xl font-medium text-purple-700">3.5x</p>
                                                    <p className="text-xs text-purple-600">ROI</p>
                                                </div>
                                                <div className="bg-amber-50 rounded-lg p-3 text-center">
                                                    <p className="text-xs text-gray-500 mb-1">Happy Hour</p>
                                                    <p className="text-2xl font-medium text-amber-700">1.8x</p>
                                                    <p className="text-xs text-amber-600">ROI</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="sales-uplift" className="flex-1 mt-4">
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <LineChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>Sales Uplift Chart</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="roi" className="flex-1 mt-4">
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <BarChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>ROI Analysis Chart</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="engagement" className="flex-1 mt-4">
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <BarChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>Retailer Engagement Chart</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function PromotionBar({
    name,
    value,
    color,
    trend,
}: {
    name: string
    value: number
    color: string
    trend: string
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-sm">{name}</span>
                <span className="text-sm font-medium text-green-600">{trend}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
                <motion.div
                    className={`${color} h-2 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                ></motion.div>
            </div>
        </div>
    )
}
