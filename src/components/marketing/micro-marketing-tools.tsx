"use client"

import { useState, useEffect } from "react"
import {
    Brain,
    Zap,
    MessageSquare,
    TrendingUp,
    ShoppingBag,
    Send,
    Loader2,
    CheckCircle,
    AlertCircle,
    Calendar,
    Sparkles,
    Info,
    Target,
    History,
    Instagram,
    Facebook,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Types
interface DeadHourSuggestion {
    id: string
    title: string
    description: string
    action: string
    urgency: "high" | "medium" | "low"
    estimatedRevenue: number
    timeToExecute: string
    reasoning: string
    confidence: number
}

interface QuickCampaign {
    id: string
    name: string
    message: string
    targetCustomers: number
    estimatedResponse: number
    type: "flash_sale" | "restock" | "event" | "loyalty"
    platforms: ("whatsapp" | "facebook" | "instagram")[]
    confidence: number
}

interface PastCampaign {
    id: string
    name: string
    platform: "whatsapp" | "facebook" | "instagram"
    sent: number
    opened: number
    replied: number
    revenue: number
    status: "completed" | "active" | "failed"
    timestamp: Date
}

interface Customer {
    id: string
    name: string
    avatar: string
    type: "regular" | "vip" | "new"
    lastOrder: string
}

export function MicroMarketingTools() {

    const [currentTime, setCurrentTime] = useState(new Date())
    const [isDeadHour, setIsDeadHour] = useState(false)
    const [activeCampaigns, setActiveCampaigns] = useState(2)
    const [todayRevenue, setTodayRevenue] = useState(12450)
    const [isLaunching, setIsLaunching] = useState<string | null>(null)
    const [showAudiencePreview, setShowAudiencePreview] = useState(false)
    const [selectedCampaign, setSelectedCampaign] = useState<QuickCampaign | null>(null)

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date()
            setCurrentTime(now)

            // Dead hours: 11AM-2PM and 3PM-5PM on weekdays
            const hour = now.getHours()
            const isWeekday = now.getDay() >= 1 && now.getDay() <= 5
            setIsDeadHour(isWeekday && ((hour >= 11 && hour <= 14) || (hour >= 15 && hour <= 17)))
        }, 60000)

        return () => clearInterval(timer)
    }, [])

    // Past campaigns data
    const pastCampaigns: PastCampaign[] = [
        {
            id: "1",
            name: "Weekend Prep",
            platform: "whatsapp",
            sent: 67,
            opened: 45,
            replied: 15,
            revenue: 4200,
            status: "completed",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            id: "2",
            name: "Flash Gin Sale",
            platform: "instagram",
            sent: 234,
            opened: 156,
            replied: 23,
            revenue: 6800,
            status: "completed",
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
            id: "3",
            name: "Loyalty Reminder",
            platform: "facebook",
            sent: 89,
            opened: 67,
            replied: 12,
            revenue: 2100,
            status: "completed",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
    ]

    // Sample customers for audience preview
    const sampleCustomers: Customer[] = [
        {
            id: "1",
            name: "John K.",
            avatar: "/placeholder.svg?height=40&width=40",
            type: "regular",
            lastOrder: "2 days ago",
        },
        { id: "2", name: "Mary W.", avatar: "/placeholder.svg?height=40&width=40", type: "vip", lastOrder: "1 week ago" },
        { id: "3", name: "David O.", avatar: "/placeholder.svg?height=40&width=40", type: "new", lastOrder: "Never" },
        {
            id: "4",
            name: "Sarah A.",
            avatar: "/placeholder.svg?height=40&width=40",
            type: "regular",
            lastOrder: "5 days ago",
        },
        { id: "5", name: "Mike M.", avatar: "/placeholder.svg?height=40&width=40", type: "vip", lastOrder: "Yesterday" },
    ]

    // Dead hour suggestions from Baridi AI
    const deadHourSuggestions: DeadHourSuggestion[] = [
        {
            id: "lunch_special",
            title: "Lunch Hour Flash Sale",
            description: "Push 250ml bottles for office workers nearby",
            action: "Send to 45 customers within 2km",
            urgency: "high",
            estimatedRevenue: 3200,
            timeToExecute: "2 minutes",
            reasoning: "Sunny weather + lunch break + CBD location = thirsty office workers",
            confidence: 87,
        },
        {
            id: "restock_push",
            title: "Clear Slow Stock",
            description: "Bundle slow-moving wine with popular beer",
            action: "Create combo offer",
            urgency: "medium",
            estimatedRevenue: 1800,
            timeToExecute: "1 minute",
            reasoning: "Wine inventory at 85% capacity, beer moving fast this week",
            confidence: 72,
        },
        {
            id: "loyalty_nudge",
            title: "Loyalty Points Reminder",
            description: "Remind customers with 100+ points",
            action: "Send to 23 loyal customers",
            urgency: "low",
            estimatedRevenue: 2100,
            timeToExecute: "30 seconds",
            reasoning: "23 customers have unused points, average redemption = KES 91",
            confidence: 94,
        },
    ]

    // Quick campaign templates
    const quickCampaigns: QuickCampaign[] = [
        {
            id: "weekend_prep",
            name: "Weekend Prep Special",
            message: "Uko ready for weekend? 🍻 Tusker 6-pack + free ice = KES 900. Order now, pickup later!",
            targetCustomers: 67,
            estimatedResponse: 15,
            type: "flash_sale",
            platforms: ["whatsapp", "instagram"],
            confidence: 78,
        },
        {
            id: "payday_offer",
            name: "Payday Celebration",
            message: "Payday vibes! 💰 Any premium spirit + mixer = 10% off. Valid today only. Celebrate smart! 🥃",
            targetCustomers: 89,
            estimatedResponse: 22,
            type: "event",
            platforms: ["whatsapp", "facebook"],
            confidence: 85,
        },
        {
            id: "restock_alert",
            name: "Back in Stock",
            message: "Good news! Jameson is back 🥃 Limited stock - 12 bottles only. Reserve yours now!",
            targetCustomers: 34,
            estimatedResponse: 18,
            type: "restock",
            platforms: ["whatsapp"],
            confidence: 92,
        },
    ]

    const handleBestMove = async () => {
        setIsLaunching("best_move")

        try {
            await new Promise((resolve) => setTimeout(resolve, 2500))

            // Find the highest confidence suggestion
            const bestSuggestion = deadHourSuggestions.reduce((prev, current) =>
                prev.confidence > current.confidence ? prev : current,
            )

            toast.success("Best Move Executed! 🎯", {
                description: `${bestSuggestion.title} launched - Expected: KES ${bestSuggestion.estimatedRevenue}`,
            })

            setTodayRevenue((prev) => prev + Math.floor(bestSuggestion.estimatedRevenue * 0.4))
            setActiveCampaigns((prev) => prev + 1)
        } catch (error) {
            toast.error("Best move failed", {
                description: "Please try again",
            })
        } finally {
            setIsLaunching(null)
        }
    }

    const handleLaunchCampaign = async (campaignId: string) => {
        setIsLaunching(campaignId)

        try {
            await new Promise((resolve) => setTimeout(resolve, 2000))

            const campaign = quickCampaigns.find((c) => c.id === campaignId)
            if (campaign) {
                const platformNames = campaign.platforms
                    .map((p) => (p === "whatsapp" ? "WhatsApp" : p === "facebook" ? "Facebook" : "Instagram"))
                    .join(" + ")

                toast.success("Campaign Launched! 🚀", {
                    description: `Sent to ${campaign.targetCustomers} customers via ${platformNames}`,
                })
                setActiveCampaigns((prev) => prev + 1)
            }
        } catch (error) {
            toast.error("Launch failed", {
                description: "Please try again",
            })
        } finally {
            setIsLaunching(null)
        }
    }

    const handleExecuteSuggestion = async (suggestionId: string) => {
        setIsLaunching(suggestionId)

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500))

            const suggestion = deadHourSuggestions.find((s) => s.id === suggestionId)
            if (suggestion) {
                toast.success("Baridi AI Activated! 🤖", {
                    description: `${suggestion.action} - Expected revenue: KES ${suggestion.estimatedRevenue}`,
                })
                setTodayRevenue((prev) => prev + Math.floor(suggestion.estimatedRevenue * 0.3))
            }
        } catch (error) {
            toast.error("Execution failed", {
                description: "Please try again",
            })
        } finally {
            setIsLaunching(null)
        }
    }

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case "high":
                return "text-red-600 bg-red-50 border-red-200"
            case "medium":
                return "text-amber-600 bg-amber-50 border-amber-200"
            case "low":
                return "text-emerald-600 bg-emerald-50 border-emerald-200"
            default:
                return "text-slate-600 bg-slate-50 border-slate-200"
        }
    }

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case "whatsapp":
                return <MessageSquare className="h-4 w-4 text-green-600" />
            case "facebook":
                return <Facebook className="h-4 w-4 text-blue-600" />
            case "instagram":
                return <Instagram className="h-4 w-4 text-pink-600" />
            default:
                return <MessageSquare className="h-4 w-4" />
        }
    }

    const getCustomerTypeColor = (type: string) => {
        switch (type) {
            case "vip":
                return "bg-purple-100 text-purple-800 border-purple-200"
            case "regular":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "new":
                return "bg-green-100 text-green-800 border-green-200"
            default:
                return "bg-slate-100 text-slate-800 border-slate-200"
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                    <h1 className="text-xl font-normal tracking-tight">Baridi Sales Agent</h1>
                    <p className="text-muted-foreground">
                        {isDeadHour ? "🔥 Dead hour detected - Time to hustle!" : "💪 Keep the momentum going"}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleBestMove}
                        disabled={isLaunching === "best_move"}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-normal px-6"
                        size="lg"
                    >
                        {isLaunching === "best_move" ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Executing...
                            </>
                        ) : (
                            <>
                                <Target className="h-5 w-5 mr-2" />
                                Trigger Best Move
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Dead Hour Alert */}
            {isDeadHour && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <CardTitle className="text-amber-800 dark:text-amber-200">Dead Hour Detected</CardTitle>
                        </div>
                        <CardDescription className="text-amber-700 dark:text-amber-300">
                            Low foot traffic period. Baridi AI suggests these actions to boost sales:
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {deadHourSuggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-normal">{suggestion.title}</h3>
                                        <Badge className={cn("text-xs", getUrgencyColor(suggestion.urgency))}>{suggestion.urgency}</Badge>
                                        <HoverCard>
                                            <HoverCardTrigger>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                            </HoverCardTrigger>
                                            <HoverCardContent className="w-80">
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold">Why this suggestion?</h4>
                                                    <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">Confidence:</span>
                                                        <Progress value={suggestion.confidence} className="flex-1 h-2" />
                                                        <span className="text-xs font-normal">{suggestion.confidence}%</span>
                                                    </div>
                                                </div>
                                            </HoverCardContent>
                                        </HoverCard>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>💰 +KES {suggestion.estimatedRevenue}</span>
                                        <span>⏱️ {suggestion.timeToExecute}</span>
                                        <span>🎯 {suggestion.confidence}% confident</span>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleExecuteSuggestion(suggestion.id)}
                                    disabled={isLaunching === suggestion.id}
                                    className="ml-4 bg-amber-600 hover:bg-amber-700"
                                >
                                    {isLaunching === suggestion.id ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Executing...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="h-4 w-4 mr-2" />
                                            Execute
                                        </>
                                    )}
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="campaigns" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="campaigns">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Quick Campaigns
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History className="h-4 w-4 mr-2" />
                        Past Campaigns
                    </TabsTrigger>
                    <TabsTrigger value="insights">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Live Insights
                    </TabsTrigger>
                    <TabsTrigger value="automation">
                        <Brain className="h-4 w-4 mr-2" />
                        AI Automation
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="campaigns" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {quickCampaigns.map((campaign) => (
                            <Card key={campaign.id} className="border-emerald-100 dark:border-emerald-900/30">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{campaign.name}</CardTitle>
                                        <Badge variant="outline" className="text-xs">
                                            {campaign.type.replace("_", " ")}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {campaign.platforms.map((platform) => (
                                            <div key={platform} className="flex items-center">
                                                {getPlatformIcon(platform)}
                                            </div>
                                        ))}
                                        <span className="text-xs text-muted-foreground ml-2">
                                            {campaign.platforms.length} platform{campaign.platforms.length > 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                                        <p className="text-sm">{campaign.message}</p>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Target:</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 text-emerald-600 hover:text-emerald-700"
                                            onClick={() => {
                                                setSelectedCampaign(campaign)
                                                setShowAudiencePreview(true)
                                            }}
                                        >
                                            {campaign.targetCustomers} customers
                                        </Button>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Expected response:</span>
                                        <span className="font-normal text-emerald-600">{campaign.estimatedResponse} orders</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Confidence:</span>
                                        <Progress value={campaign.confidence} className="flex-1 h-2" />
                                        <span className="text-xs font-normal">{campaign.confidence}%</span>
                                    </div>

                                    <Button
                                        onClick={() => handleLaunchCampaign(campaign.id)}
                                        disabled={isLaunching === campaign.id}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {isLaunching === campaign.id ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Launching...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Launch Campaign
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card className="p-1">
                        <CardHeader>
                            <CardTitle>Campaign History</CardTitle>
                            <CardDescription>Track performance of your past marketing efforts</CardDescription>
                        </CardHeader>
                        <CardContent className="p-1">
                            <div className="space-y-4">
                                {pastCampaigns.map((campaign) => (
                                    <div
                                        key={campaign.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                {getPlatformIcon(campaign.platform)}
                                                <div>
                                                    <h3 className="font-normal">{campaign.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{campaign.timestamp.toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="text-center">
                                                <p className="font-normal">{campaign.sent}</p>
                                                <p className="text-muted-foreground">Sent</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-normal">{campaign.opened}</p>
                                                <p className="text-muted-foreground">Opened</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-normal">{campaign.replied}</p>
                                                <p className="text-muted-foreground">Replied</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-normal text-emerald-600">KES {campaign.revenue.toLocaleString()}</p>
                                                <p className="text-muted-foreground">Revenue</p>
                                            </div>
                                            <Badge
                                                className={cn(
                                                    "text-xs",
                                                    campaign.status === "completed" && "bg-emerald-100 text-emerald-800",
                                                    campaign.status === "active" && "bg-blue-100 text-blue-800",
                                                    campaign.status === "failed" && "bg-red-100 text-red-800",
                                                )}
                                            >
                                                {campaign.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="insights" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="p-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-normal">Today's Performance</CardTitle>
                            </CardHeader>
                            <CardContent className="p-1">
                                <div className="text-2xl font-medium text-emerald-600">67%</div>
                                <p className="text-xs text-muted-foreground">Campaign response rate</p>
                                <Progress value={67} className="h-1.5" />
                            </CardContent>
                        </Card>

                        <Card className="p-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-normal">Peak Hours</CardTitle>
                            </CardHeader>
                            <CardContent className="p-1">
                                <div className="text-xl font-medium">6-8 PM</div>
                                <p className="text-xs text-muted-foreground">Best conversion time</p>
                                <div className="flex items-center h-1.5 text-xs text-emerald-600">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    +23% vs yesterday
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="p-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-normal">Top Product</CardTitle>
                            </CardHeader>
                            <CardContent className="p-1">
                                <div className="text-xl font-medium">Tusker</div>
                                <p className="text-xs text-muted-foreground">Most requested today</p>
                                <div className="flex items-center h-1.5 text-xs">
                                    <ShoppingBag className="h-3 w-3 mr-1" />
                                    34 orders
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="p-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-normal">Best Platform</CardTitle>
                            </CardHeader>
                            <CardContent className="p-1">
                                <div className="text-xl flex items-center gap-2">
                                    <MessageSquare className="h-6 w-6 text-green-600" />
                                    WhatsApp
                                </div>
                                <p className="text-xs text-muted-foreground">Highest conversion</p>
                                <div className="flex items-center h-1.5 text-xs text-emerald-600">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    85% response rate
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="p-1">
                        <CardHeader>
                            <CardTitle>Live Customer Activity</CardTitle>
                            <CardDescription>Real-time engagement across Meta platforms</CardDescription>
                        </CardHeader>
                        <CardContent className="p-1">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <MessageSquare className="h-4 w-4 text-green-600" />
                                        <span className="font-normal">John K.</span>
                                        <span className="text-sm text-muted-foreground">just ordered 6 Tusker Lagers</span>
                                    </div>
                                    <Badge className="bg-emerald-100 text-emerald-800">+KES 900</Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <Facebook className="h-4 w-4 text-blue-600" />
                                        <span className="font-normal">Mary W.</span>
                                        <span className="text-sm text-muted-foreground">asking about wine selection</span>
                                    </div>
                                    <Badge variant="outline">Potential sale</Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 bg-pink-500 rounded-full"></div>
                                        <Instagram className="h-4 w-4 text-pink-600" />
                                        <span className="font-normal">David O.</span>
                                        <span className="text-sm text-muted-foreground">viewed weekend special story</span>
                                    </div>
                                    <Badge variant="outline">Browsing</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="automation" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="p-1 border-purple-100 dark:border-purple-900/30">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-purple-600" />
                                    <CardTitle>Baridi AI Autopilot</CardTitle>
                                </div>
                                <CardDescription>Let AI handle routine marketing tasks across Meta platforms</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 p-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-normal">Auto-respond to inquiries</p>
                                        <p className="text-sm text-muted-foreground">Handle basic questions instantly</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm text-emerald-600">Active</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-normal">Dead hour campaigns</p>
                                        <p className="text-sm text-muted-foreground">Auto-launch during slow periods</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm text-emerald-600">Active</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-normal">Cross-platform optimization</p>
                                        <p className="text-sm text-muted-foreground">Auto-choose best platform per customer</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm text-emerald-600">Active</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-normal">Event-based promotions</p>
                                        <p className="text-sm text-muted-foreground">Football matches, holidays, etc.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm text-blue-600">Next: Friday</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>AI Performance</CardTitle>
                                <CardDescription>How Baridi is performing across all platforms</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Messages handled automatically</span>
                                        <span className="font-normal">89%</span>
                                    </div>
                                    <Progress value={89} />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Customer satisfaction</span>
                                        <span className="font-normal">94%</span>
                                    </div>
                                    <Progress value={94} />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Revenue from AI campaigns</span>
                                        <span className="font-normal">KES 45,200</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">This month</div>
                                </div>

                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="h-4 w-4 text-emerald-600" />
                                        <span className="font-normal text-emerald-800 dark:text-emerald-200">AI Insight</span>
                                    </div>
                                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                        WhatsApp performs best for urgent offers, Instagram for lifestyle products, and Facebook for events.
                                        Baridi optimizes platform selection automatically.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Audience Preview Modal */}
            <Dialog open={showAudiencePreview} onOpenChange={setShowAudiencePreview}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Campaign Audience Preview</DialogTitle>
                        <DialogDescription>
                            {selectedCampaign
                                ? `${selectedCampaign.targetCustomers} customers will receive "${selectedCampaign.name}"`
                                : ""}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        {sampleCustomers.slice(0, selectedCampaign?.targetCustomers || 5).map((customer) => (
                            <div key={customer.id} className="flex items-center gap-3 p-2 rounded-lg border">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={customer.avatar || "/placeholder.svg"} alt={customer.name} />
                                    <AvatarFallback>{customer.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-normal text-sm">{customer.name}</p>
                                    <p className="text-xs text-muted-foreground">Last order: {customer.lastOrder}</p>
                                </div>
                                <Badge className={cn("text-xs", getCustomerTypeColor(customer.type))}>{customer.type}</Badge>
                            </div>
                        ))}
                        {(selectedCampaign?.targetCustomers || 0) > 5 && (
                            <div className="text-center text-sm text-muted-foreground">
                                + {(selectedCampaign?.targetCustomers || 0) - 5} more customers
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
