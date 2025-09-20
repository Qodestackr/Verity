"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, ArrowRight, Brain, Check, ChevronRight, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function AIInsightPanel({
    onClose }: { onClose: () => void }) {
    const [currentInsight, setCurrentInsight] = useState(0)
    const [dismissedInsights, setDismissedInsights] = useState<number[]>([])

    const insights = [
        {
            id: 1,
            title: "Distribution Gap Opportunity",
            description:
                "There's a significant distribution gap in the Nakuru region. Adding 5 strategic retailers could increase your market penetration by 15% and generate an estimated KES 320,000 in monthly revenue.",
            impact: "Potential Gain: KES 320,000 in monthly revenue.",
            severity: "opportunity",
            action: "View Distribution Map",
        },
        {
            id: 3,
            title: "Retailer Trust Score Alert",
            description:
                "Three retailers in Mombasa have shown a significant drop in trust scores (>20%) in the past month due to price compliance issues and irregular stocking patterns.",
            impact: "Recommended Action: Schedule field team visit to these retailers.",
            severity: "warning",
            action: "View Retailer Details",
        },
    ]

    const filteredInsights = insights.filter((insight) => !dismissedInsights.includes(insight.id))

    const handleDismiss = (id: number) => {
        setDismissedInsights([...dismissedInsights, id])
        if (currentInsight >= filteredInsights.length - 1) {
            setCurrentInsight(0)
        }
    }

    const handleNext = () => {
        if (currentInsight < filteredInsights.length - 1) {
            setCurrentInsight(currentInsight + 1)
        } else {
            setCurrentInsight(0)
        }
    }

    if (filteredInsights.length === 0) {
        onClose()
        return null
    }

    const insight = filteredInsights[currentInsight]

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2 rounded-full ${insight.severity === "critical"
                                    ? "bg-red-100"
                                    : insight.severity === "warning"
                                        ? "bg-amber-100"
                                        : "bg-emerald-100"
                                    }`}
                            >
                                {insight.severity === "critical" ? (
                                    <AlertCircle
                                        className={`h-6 w-6 ${insight.severity === "critical"
                                            ? "text-red-700"
                                            : insight.severity === "warning"
                                                ? "text-amber-700"
                                                : "text-emerald-700"
                                            }`}
                                    />
                                ) : insight.severity === "warning" ? (
                                    <AlertCircle
                                        className={`h-6 w-6 ${insight.severity === "critical"
                                            ? "text-red-700"
                                            : insight.severity === "warning"
                                                ? "text-amber-700"
                                                : "text-emerald-700"
                                            }`}
                                    />
                                ) : (
                                    <Zap
                                        className={`h-6 w-6 ${insight.severity === "critical"
                                            ? "text-red-700"
                                            : insight.severity === "warning"
                                                ? "text-amber-700"
                                                : "text-emerald-700"
                                            }`}
                                    />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-medium">{insight.title}</h3>
                                    <Badge
                                        className={`${insight.severity === "critical"
                                            ? "bg-red-100 text-red-800"
                                            : insight.severity === "warning"
                                                ? "bg-amber-100 text-amber-800"
                                                : "bg-emerald-100 text-emerald-800"
                                            }`}
                                    >
                                        {insight.severity === "critical"
                                            ? "Critical"
                                            : insight.severity === "warning"
                                                ? "Warning"
                                                : "Opportunity"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Brain className="h-3 w-3" />
                                    <span>AI-generated insight</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <p className="text-gray-700 mb-4">{insight.description}</p>

                    <div
                        className={`${insight.severity === "critical"
                            ? "bg-red-50 border-red-100 text-red-800"
                            : insight.severity === "warning"
                                ? "bg-amber-50 border-amber-100 text-amber-800"
                                : "bg-emerald-50 border-emerald-100 text-emerald-800"
                            } border rounded-md p-3 mb-4`}
                    >
                        <p className="text-sm">
                            <strong>{insight.impact.split(":")[0]}:</strong>
                            {insight.impact.split(":")[1]}
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <span>{currentInsight + 1}</span>
                            <span>/</span>
                            <span>{filteredInsights.length}</span>
                            {filteredInsights.length > 1 && (
                                <Button variant="ghost" size="sm" className="h-8 ml-1" onClick={handleNext}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => handleDismiss(insight.id)}>
                                <Check className="mr-2 h-4 w-4" />
                                Dismiss
                            </Button>
                            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">
                                {insight.action}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
