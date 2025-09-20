import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, MessageSquare, Facebook, Instagram, Sparkles } from "lucide-react"
import { Loader2 } from "lucide-react"

interface LiveInsightsProps {
    stats: any
    isLoading: boolean
}

export function LiveInsights({    
 stats, isLoading }: LiveInsightsProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!stats || stats.overview.totalCampaigns === 0) {
        return (
            <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="rounded-full bg-orange-100 p-2 mb-2">
                        <TrendingUp className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No Insights Available Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Launch your first campaign to unlock powerful business insights and real-time performance analytics.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center p-3 bg-emerald-50 rounded-lg">
                            <div className="font-medium text-emerald-600">Response Rate</div>
                            <p className="text-xs text-muted-foreground">Track engagement</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="font-medium text-blue-600">Revenue</div>
                            <p className="text-xs text-muted-foreground">Monitor earnings</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="font-medium text-purple-600">Platform Performance</div>
                            <p className="text-xs text-muted-foreground">Compare channels</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="font-medium text-orange-600">Best Times</div>
                            <p className="text-xs text-muted-foreground">Optimize timing</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
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
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{stats.overview.responseRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Campaign response rate</p>
                        <Progress value={stats.overview.responseRate} className="h-2 mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.overview.conversionRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Response to order rate</p>
                        <Progress value={stats.overview.conversionRate} className="h-2 mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            KES {stats.overview.totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">From campaigns</p>
                        <div className="flex items-center mt-2 text-xs text-emerald-600">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {stats.period.days} days
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.overview.totalCampaigns}</div>
                        <p className="text-xs text-muted-foreground">Campaigns launched</p>
                        <div className="flex items-center mt-2 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {stats.overview.totalSent} messages sent
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Platform Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Platform Performance</CardTitle>
                    <CardDescription>How each platform is performing</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.platformStats.map((platform: any) => (
                            <div key={platform.platform} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    {getPlatformIcon(platform.platform)}
                                    <div>
                                        <p className="font-medium capitalize">{platform.platform}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {platform.responses} responses • {platform.conversions} conversions
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{platform.conversionRate.toFixed(1)}%</p>
                                    <p className="text-sm text-muted-foreground">conversion rate</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Top Campaigns */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Campaigns</CardTitle>
                    <CardDescription>Your best campaigns by conversion rate</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {stats.topCampaigns.map((campaign: any, index: number) => (
                            <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline">#{index + 1}</Badge>
                                    <div>
                                        <p className="font-medium">{campaign.name}</p>
                                        <p className="text-sm text-muted-foreground capitalize">{campaign.type.replace("_", " ")}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-emerald-600">{campaign.conversionRate.toFixed(1)}%</p>
                                    <p className="text-sm text-muted-foreground">KES {campaign.revenue.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
