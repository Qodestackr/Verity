import { Suspense } from "react"
import type { Metadata } from "next"
import { useCurrency } from "@/hooks/useCurrency";
import { BaridiMarketingDashboard } from "@/components/marketing/baridi-marketing-dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export const metadata: Metadata = {
    title: "Baridi Sales Agent | ALCORA",
    description: "AI-powered marketing automation for hyperlocal liquor commerce",
}

function MarketingDashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function MarketingPage() {
    return (
        <div className="max-w-4xl mx-auto py-3 space-y-3">
            <div className="border-b pb-3">
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-light tracking-tight">Marketing Hub</h1>
                    <p className="text-muted-foreground">
                        Hyperlocal AI-powered marketing intelligence for the Kenyan liquor market
                    </p>
                </div>
            </div>

            <Suspense fallback={<MarketingDashboardSkeleton />}>
                <BaridiMarketingDashboard />
            </Suspense>
        </div>
    )
}
