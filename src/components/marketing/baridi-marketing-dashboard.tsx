"use client"

import { useState } from "react"
import {
    Zap,
    MessageSquare,
    TrendingUp,
    Send,
    Loader2,
    AlertCircle,
    Target,
    History,
    Instagram,
    Facebook,
    Plus,
} from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    useBaridiOpportunities,
    useExecuteOpportunity,
    useCampaignStats,
    useDeadHourDetection,
    useEvents,
} from "@/hooks/use-baridi-marketing"
import { CreateEventDialog } from "./create-event-dialog"
import { OpportunityCard } from "./opportunity-card"
import { CampaignHistoryTable } from "./campaign-history-table"
import { LiveInsights } from "./live-insights"

export function BaridiMarketingDashboard() {
    const { formatCurrency } = useCurrency();

    const [showCreateEvent, setShowCreateEvent] = useState(false)
    const { isDeadHour } = useDeadHourDetection()

    const { data: opportunities, isLoading: opportunitiesLoading } = useBaridiOpportunities()
    const { data: stats, isLoading: statsLoading } = useCampaignStats()
    const { data: eventsData } = useEvents()

    const executeOpportunity = useExecuteOpportunity()

    const handleBestMove = async () => {
        if (!opportunities?.deadHourOpportunities?.length) return

        // Find highest confidence opportunity
        const bestOpportunity = opportunities.deadHourOpportunities.reduce((prev: any, current: any) =>
            prev.confidence > current.confidence ? prev : current,
        )

        await executeOpportunity.mutateAsync({
            organizationId: opportunities.organizationId || "",
            opportunityId: bestOpportunity.id,
            type: bestOpportunity.type,
        })
    }

    const getPlatformIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="text-muted-foreground">
                        {isDeadHour ? "🔥 Dead hour detected - Time to hustle!" : "💪 Keep the momentum going"}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setShowCreateEvent(true)}
                        variant="outline"
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                    </Button>

                    <Button
                        onClick={handleBestMove}
                        disabled={executeOpportunity.isPending || !opportunities?.deadHourOpportunities?.length}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        size="lg"
                    >
                        {executeOpportunity.isPending ? (
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
            {isDeadHour && opportunities?.deadHourOpportunities?.length > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <CardTitle className="text-amber-800">Dead Hour Detected</CardTitle>
                        </div>
                        <CardDescription className="text-amber-700">
                            Low foot traffic period. Baridi AI suggests these actions to boost sales:
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {opportunities.deadHourOpportunities.map((opportunity: any) => (
                            <OpportunityCard
                                key={opportunity.id}
                                opportunity={opportunity}
                                onExecute={(id) =>
                                    executeOpportunity.mutate({
                                        organizationId: opportunities.organizationId || "",
                                        opportunityId: id,
                                        type: opportunity.type,
                                    })
                                }
                                isExecuting={executeOpportunity.isPending}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="opportunities" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="opportunities">
                        <Zap className="h-4 w-4 mr-2" />
                        Opportunities
                    </TabsTrigger>
                    <TabsTrigger value="events">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Events
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History className="h-4 w-4 mr-2" />
                        Campaign History
                    </TabsTrigger>
                    <TabsTrigger value="insights">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Live Insights
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="opportunities" className="space-y-4">
                    {opportunitiesLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : opportunities?.eventPromotions?.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {opportunities.eventPromotions.map((event: any) => (
                                <Card key={event.eventId} className="border-emerald-100">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">{event.eventName}</CardTitle>
                                            <Badge variant="outline" className="text-xs">
                                                Event Promo
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{new Date(event.scheduledFor).toLocaleDateString()}</p>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="bg-slate-50 p-3 rounded-md">
                                            <p className="text-sm">{event.message}</p>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Free item:</span>
                                            <span className="font-medium">{event.freeItem}</span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Min quantity:</span>
                                            <span className="font-medium">{event.minQuantity}</span>
                                        </div>

                                        <Button
                                            onClick={() =>
                                                executeOpportunity.mutate({
                                                    organizationId: opportunities.organizationId || "",
                                                    opportunityId: event.eventId,
                                                    type: "event_promo",
                                                })
                                            }
                                            disabled={executeOpportunity.isPending}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            {executeOpportunity.isPending ? (
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
                    ) : (
                        <Card className="border-dashed border-2 border-gray-200">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-emerald-100 p-3 mb-4">
                                    <Zap className="h-8 w-8 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No Marketing Opportunities Yet</h3>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    Baridi AI is analyzing your business patterns. Create your first event to unlock powerful marketing
                                    automation!
                                </p>
                                <div className="flex gap-3">
                                    <Button onClick={() => setShowCreateEvent(true)} className="bg-emerald-600 hover:bg-emerald-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Event
                                    </Button>
                                    <Button variant="outline">
                                        <Target className="h-4 w-4 mr-2" />
                                        Learn About Baridi AI
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="events" className="space-y-4">
                    {eventsData?.events?.length > 0 ? (
                        <div className="grid gap-4">
                            {eventsData.events.map((event: any) => (
                                <Card key={event.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>{event.name}</CardTitle>
                                            <Badge variant={event.autoPromote ? "default" : "secondary"}>
                                                {event.autoPromote ? "Auto Marketing" : "Manual"}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            {new Date(event.scheduledFor).toLocaleString()} • {event.type}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Required Emoji</p>
                                                <p className="font-medium text-lg">{event.requiredEmoji}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Free Item</p>
                                                <p className="font-medium">{event.freeItem}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Min Quantity</p>
                                                <p className="font-medium">{event.minQuantity}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Campaigns</p>
                                                <p className="font-medium">{event.campaigns?.length || 0}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed border-2 border-gray-200">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-blue-100 p-3 mb-4">
                                    <MessageSquare className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No Events Scheduled</h3>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    Create your first event and watch Baridi AI automatically generate marketing campaigns to fill your
                                    venue!
                                </p>
                                <div className="space-y-3">
                                    <Button onClick={() => setShowCreateEvent(true)} className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Schedule Your First Event
                                    </Button>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>🎵 Mugithi Nights</span>
                                        <span>🕺 Rhumba Evenings</span>
                                        <span>🎤 Karaoke</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <CampaignHistoryTable />
                </TabsContent>

                <TabsContent value="insights">
                    <LiveInsights stats={stats} isLoading={statsLoading} />
                </TabsContent>
            </Tabs>

            <CreateEventDialog open={showCreateEvent} onOpenChange={setShowCreateEvent} />
        </div>
    )
}
