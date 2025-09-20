"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, TrendingUp, Users, ArrowRight, Waves, Mountain, Plane } from "lucide-react"

const seasonalEvents = [
    {
        id: "diani-season",
        name: "European Tourism Peak",
        region: "Coast Region",
        period: "Active Now",
        impact: "High",
        uplift: 340,
        icon: <Plane className="h-4 w-4" />,
        color: "bg-blue-500",
        description: "Premium spirits demand surge in coastal hotels",
    },
    {
        id: "migration",
        name: "Wildlife Migration",
        region: "Maasai Mara",
        period: "July - Sept",
        impact: "High",
        uplift: 290,
        icon: <Mountain className="h-4 w-4" />,
        color: "bg-emerald-500",
        description: "Safari lodge premium beverage demand",
    },
    {
        id: "rally",
        name: "Safari Rally",
        region: "Naivasha",
        period: "March",
        impact: "Medium",
        uplift: 180,
        icon: <Waves className="h-4 w-4" />,
        color: "bg-amber-500",
        description: "Celebratory beverages and event catering",
    },
]

export function SeasonalPulse() {

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-600" />
                    Seasonal Pulse
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Active Event Highlight */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                            className="p-1 bg-blue-600 rounded-full"
                        >
                            <Plane className="h-4 w-4 text-white" />
                        </motion.div>
                        <Badge className="bg-blue-600 text-white text-xs">Live</Badge>
                    </div>
                    <h4 className="font-semibold text-blue-900">European Tourism Peak</h4>
                    <p className="text-sm text-blue-700 mb-3">Coast Region experiencing 340% uplift in premium spirits</p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Optimize Coast Stock
                        <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                </motion.div>

                {/* Upcoming Events */}
                <div>
                    <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Upcoming Opportunities
                    </h4>
                    <div className="space-y-3">
                        {seasonalEvents.slice(1).map((event, idx) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="border rounded-lg p-3 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1 ${event.color} rounded`}>{event.icon}</div>
                                        <div>
                                            <h5 className="font-medium text-sm">{event.name}</h5>
                                            <p className="text-xs text-slate-600">
                                                {event.region} • {event.period}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={event.impact === "High" ? "default" : "secondary"} className="text-xs">
                                        {event.impact}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-700 mb-2">{event.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-emerald-600">+{event.uplift}% demand</span>
                                    <Button variant="outline" size="sm" className="text-xs h-6">
                                        Prepare
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* AI Seasonal Insight */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-emerald-50 p-3 rounded-lg border border-emerald-200"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-emerald-600" />
                        <h4 className="font-medium text-emerald-900 text-sm">AI Seasonal Insight</h4>
                    </div>
                    <p className="text-xs text-emerald-800">
                        Historical patterns suggest increasing vodka inventory by 60% in Coast Region before February 15th could
                        capture KES 2.4M additional revenue.
                    </p>
                </motion.div>
            </CardContent>
        </Card>
    )
}
