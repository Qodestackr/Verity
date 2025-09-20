import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, BadgeDollarSign, AlertCircle, Users } from 'lucide-react'
import { useCurrency } from "@/hooks/useCurrency";

interface RetailerStatsProps {
    analytics: {
        totalRevenue: number;
        regionPerformance: Array<{
            revenue: number;
            region: string;
        }>;
        overdueAmount: number;
        totalOrders: number;
        averageOrderValue: number;
        totalCustomers: number;
        totalRetailers: number;
        activeRetailers: number;
        inactiveRetailers: number;
    }
}

export function RetailerStats({ analytics }: RetailerStatsProps) {
    const { formatCurrency } = useCurrency();

    if (!analytics || !analytics.regionPerformance) return null;

    const formattedAnalytics = {
        totalRevenue: analytics.totalRevenue || 0,
        regionPerformance: analytics.regionPerformance.map(region => ({
            ...region,
            revenue: region.revenue || 0
        })),
        overdueAmount: analytics.overdueAmount || 0,
        totalOrders: analytics.totalOrders || 0,
        averageOrderValue: analytics.averageOrderValue || 0,
        totalCustomers: analytics.totalCustomers || 0,
        totalRetailers: analytics.totalRetailers || 0,
        activeRetailers: analytics.activeRetailers || 0,
        inactiveRetailers: analytics.inactiveRetailers || 0
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Retailers
                            </p>
                            <p className="text-2xl font-bold">
                                {analytics.totalRetailers}
                            </p>
                        </div>
                        <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex gap-2 items-center mt-2">
                        <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-500 border-green-200"
                        >
                            {analytics.activeRetailers} Active
                        </Badge>
                        {analytics.inactiveRetailers > 0 && (
                            <Badge
                                variant="outline"
                                className="bg-red-500/10 text-red-500 border-red-200"
                            >
                                {analytics.inactiveRetailers} Inactive
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Revenue
                            </p>
                            <p className="text-2xl font-bold">
                                {formatCurrency(analytics.totalRevenue)}
                            </p>
                        </div>
                        <BadgeDollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex gap-2 items-center mt-2">
                        <p className="text-xs text-muted-foreground">
                            From {analytics.totalRetailers} retailers
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Top Region
                            </p>
                            <p className="text-2xl font-bold">
                                {analytics.regionPerformance[0].region}
                            </p>
                        </div>
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex gap-2 items-center mt-2">
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(analytics.regionPerformance[0].revenue)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Overdue Amount
                            </p>
                            <p className="text-2xl font-bold text-red-500">
                                {formatCurrency(analytics.overdueAmount)}
                            </p>
                        </div>
                        <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="flex gap-2 items-center mt-2">
                        <Badge
                            variant="outline"
                            className="bg-red-500/10 text-red-500 border-red-200"
                        >
                            Requires Attention
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
