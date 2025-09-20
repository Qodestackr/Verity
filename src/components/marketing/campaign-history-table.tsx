import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Facebook, Instagram, Loader2, History } from "lucide-react"
import { useCampaignStats } from "@/hooks/use-baridi-marketing"
import { cn } from "@/lib/utils"

export function CampaignHistoryTable() {

    const { data: stats, isLoading } = useCampaignStats()

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

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8">
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Campaign History</CardTitle>
                <CardDescription>Track performance of your past marketing efforts</CardDescription>
            </CardHeader>
            <CardContent>
                {stats?.topCampaigns?.length > 0 ? (
                    <div className="space-y-4">
                        {stats.topCampaigns.map((campaign: any) => (
                            <div
                                key={campaign.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        {getPlatformIcon("whatsapp")}
                                        <div>
                                            <h3 className="font-medium">{campaign.name}</h3>
                                            <p className="text-sm text-muted-foreground capitalize">{campaign.type.replace("_", " ")}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-sm">
                                    <div className="text-center">
                                        <p className="font-medium">{campaign.conversionRate.toFixed(1)}%</p>
                                        <p className="text-muted-foreground">Conversion</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium text-emerald-600">KES {campaign.revenue.toLocaleString()}</p>
                                        <p className="text-muted-foreground">Revenue</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium">{campaign.roi.toFixed(1)}%</p>
                                        <p className="text-muted-foreground">ROI</p>
                                    </div>
                                    <Badge
                                        className={cn(
                                            "text-xs",
                                            campaign.conversionRate > 10 && "bg-emerald-100 text-emerald-800",
                                            campaign.conversionRate <= 10 && campaign.conversionRate > 5 && "bg-blue-100 text-blue-800",
                                            campaign.conversionRate <= 5 && "bg-amber-100 text-amber-800",
                                        )}
                                    >
                                        {campaign.conversionRate > 10 ? "Excellent" : campaign.conversionRate > 5 ? "Good" : "Average"}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-purple-100 p-3 mb-4">
                            <History className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Campaign History</h3>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            Your campaign performance will appear here once you launch your first marketing campaign with Baridi AI.
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="text-center">
                                <div className="font-medium text-emerald-600">📈</div>
                                <p>Track Performance</p>
                            </div>
                            <div className="text-center">
                                <div className="font-medium text-blue-600">💰</div>
                                <p>Monitor Revenue</p>
                            </div>
                            <div className="text-center">
                                <div className="font-medium text-purple-600">🎯</div>
                                <p>Optimize ROI</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
