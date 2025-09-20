"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Brain, Target, TrendingUp, AlertTriangle } from "lucide-react"

const aiInsights = [
    {
        id: "competitive-gap",
        type: "opportunity",
        title: "Competitive Gap Detected",
        description: "EABL has limited presence in Maasai Mara safari lodges during migration season",
        impact: "KES 1.8M opportunity",
        confidence: 94,
        action: "Launch Safari Lodge Campaign",
    },
    {
        id: "inventory-optimization",
        type: "critical",
        title: "Inventory Rebalancing",
        description: "Transfer 80 units Premium Vodka from Central to Coast Region",
        impact: "Prevent KES 450K loss",
        confidence: 97,
        action: "Execute Transfer",
    },
    {
        id: "demand-prediction",
        type: "insight",
        title: "Demand Surge Predicted",
        description: "Valentine's Day approaching - champagne demand will spike 280% in Nairobi",
        impact: "KES 680K potential",
        confidence: 91,
        action: "Pre-position Stock",
    },
]

export function AIInsights() {

    const getInsightColor = (type: string) => {
        switch (type) {
            case "critical":
                return "border-red-200 bg-red-50"
            case "opportunity":
                return "border-emerald-200 bg-emerald-50"
            case "insight":
                return "border-blue-200 bg-blue-50"
            default:
                return "border-gray-200 bg-gray-50"
        }
    }

    const getInsightIcon = (type: string) => {
        switch (type) {
            case "critical":
                return <AlertTriangle className="h-4 w-4 text-red-600" />
            case "opportunity":
                return <TrendingUp className="h-4 w-4 text-emerald-600" />
            case "insight":
                return <Brain className="h-4 w-4 text-blue-600" />
            default:
                return <Target className="h-4 w-4 text-gray-600" />
        }
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-slate-600" />
                    AI Intelligence
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {aiInsights.map((insight, idx) => (
                    <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
                    >
                        <div className="flex items-start gap-2 mb-2">
                            {getInsightIcon(insight.type)}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium text-sm">{insight.title}</h4>
                                    <Badge variant="outline" className="text-xs">
                                        {insight.confidence}% confidence
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-700 mb-2">{insight.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-900">{insight.impact}</span>
                                    <Button variant="outline" size="sm" className="text-xs h-6">
                                        {insight.action}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* AI Performance Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-200"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-900">AI Performance</span>
                        </div>
                        <Badge className="bg-purple-600 text-white text-xs">94% Accuracy</Badge>
                    </div>
                    <p className="text-xs text-purple-800">Last 30 days: 47 predictions made, 44 accurate outcomes</p>
                </motion.div>

                {/* Quick Action */}
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                    <Zap className="mr-2 h-4 w-4" />
                    Run Full AI Analysis
                </Button>
            </CardContent>
        </Card>
    )
}
