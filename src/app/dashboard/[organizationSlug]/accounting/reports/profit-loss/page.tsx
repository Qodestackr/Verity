"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Receipt,
    PieChart,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
} from "lucide-react"
import { useProfitLossReport } from "@/hooks/use-reports"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { client } from "@/lib/auth-client"
import { useCurrency } from "@/hooks/useCurrency"

export default function ProfitLossPage() {
    const [period, setPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly")
    const [year, setYear] = useState(new Date().getFullYear())
    const [month, setMonth] = useState<number | undefined>(new Date().getMonth() + 1)

    const { data: activeOrganization, isPending, isRefetching } = client.useActiveOrganization()

    if (isPending) {
        console.log('Org Pending...Skeletons')
    }

    const {
        data: report,
        isLoading,
        error,
    } = useProfitLossReport({
        organizationId: `${activeOrganization?.id}`,
        period,
        year,
        month: period === "monthly" ? month : undefined,
    })

    if (error) {
        return (
            <div className="max-w-6xl mx-auto py-6">
                <Alert variant="destructive">
                    <AlertDescription>Failed to load profit & loss report. Please try again.</AlertDescription>
                </Alert>
            </div>
        )
    }

    const { formatCurrency } = useCurrency();

    const formatPercentage = (percentage: number) => `${percentage.toFixed(1)}%`

    const getProfitIcon = (profit: number) => {
        if (profit > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />
        if (profit < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />
        return <Minus className="h-4 w-4 text-gray-600" />
    }

    const getProfitColor = (profit: number) => {
        if (profit > 0) return "text-green-600"
        if (profit < 0) return "text-red-600"
        return "text-gray-600"
    }

    const getMarginBadge = (margin: number) => {
        if (margin >= 20) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
        if (margin >= 10) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
        if (margin >= 5) return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
        if (margin >= 0) return <Badge className="bg-orange-100 text-orange-800">Poor</Badge>
        return <Badge className="bg-red-100 text-red-800">Loss</Badge>
    }

    return (
        <div className="max-w-6xl mx-auto py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Profit & Loss Report</h1>
                    <p className="text-muted-foreground">Track your business profitability and financial performance</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={year.toString()} onValueChange={(value) => setYear(Number.parseInt(value))}>
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                <SelectItem key={y} value={y.toString()}>
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {period === "monthly" && (
                        <Select
                            value={month?.toString() || "all"}
                            onValueChange={(value) => setMonth(value ? Number.parseInt(value) : undefined)}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="All months" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All months</SelectItem>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <SelectItem key={m} value={m.toString()}>
                                        {new Date(2024, m - 1).toLocaleString("default", { month: "long" })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(report?.summary.totalRevenue || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">From sales and services</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-red-600">
                                    {formatCurrency(report?.summary.totalExpenses || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">Operating costs</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div
                                    className={`text-2xl font-bold flex items-center gap-2 ${getProfitColor(report?.summary.totalProfit || 0)}`}
                                >
                                    {getProfitIcon(report?.summary.totalProfit || 0)}
                                    {formatCurrency(report?.summary.totalProfit || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">Revenue minus expenses</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold flex items-center gap-2">
                                    {formatPercentage(report?.summary.overallMargin || 0)}
                                    {getMarginBadge(report?.summary.overallMargin || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">Profitability ratio</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Report Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Period-by-Period Breakdown
                    </CardTitle>
                    <CardDescription>Detailed profit and loss analysis for each {period.slice(0, -2)} period</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Period</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                        <TableHead className="text-right">Expenses</TableHead>
                                        <TableHead className="text-right">Net Profit</TableHead>
                                        <TableHead className="text-right">Margin</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report?.profitLossByPeriod.map((periodData) => (
                                        <TableRow key={periodData.period}>
                                            <TableCell className="font-medium">{periodData.period}</TableCell>
                                            <TableCell className="text-right text-green-600 font-medium">
                                                {formatCurrency(periodData.revenue)}
                                            </TableCell>
                                            <TableCell className="text-right text-red-600 font-medium">
                                                {formatCurrency(periodData.expenses)}
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${getProfitColor(periodData.profit)}`}>
                                                <div className="flex items-center justify-end gap-1">
                                                    {getProfitIcon(periodData.profit)}
                                                    {formatCurrency(periodData.profit)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{formatPercentage(periodData.margin)}</TableCell>
                                            {/* <TableCell className="text-right">{getMarginBadge(periodData.margin)}</TableCell> */}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Insights and Recommendations */}
            {!isLoading && report && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Financial Insights</CardTitle>
                        <CardDescription>Key observations and recommendations based on your profit & loss data</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Performance Summary</h4>
                                <ul className="text-sm space-y-1">
                                    {report.summary.totalProfit > 0 ? (
                                        <li className="flex items-center gap-2 text-green-600">
                                            <TrendingUp className="h-3 w-3" />
                                            Your business is profitable this period
                                        </li>
                                    ) : (
                                        <li className="flex items-center gap-2 text-red-600">
                                            <TrendingDown className="h-3 w-3" />
                                            Your business had a loss this period
                                        </li>
                                    )}
                                    <li className="text-muted-foreground">
                                        Profit margin: {formatPercentage(report.summary.overallMargin)}
                                    </li>
                                    <li className="text-muted-foreground">
                                        Revenue to expense ratio:{" "}
                                        {report.summary.totalExpenses > 0
                                            ? (report.summary.totalRevenue / report.summary.totalExpenses).toFixed(2)
                                            : "N/A"}
                                        :1
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Recommendations</h4>
                                <ul className="text-sm space-y-1">
                                    {report.summary.overallMargin < 10 && (
                                        <li className="text-amber-600">• Consider reviewing expenses to improve margins</li>
                                    )}
                                    {report.summary.totalRevenue < report.summary.totalExpenses && (
                                        <li className="text-red-600">• Focus on increasing revenue or reducing costs</li>
                                    )}
                                    {report.summary.overallMargin > 20 && (
                                        <li className="text-green-600">• Excellent margins! Consider reinvesting in growth</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
