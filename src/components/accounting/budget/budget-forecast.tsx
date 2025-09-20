"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    ReferenceLine,
} from "recharts"
import { TrendingUp, TrendingDown, Info, Calendar, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { APP_BASE_API_URL } from "@/config/urls"

interface BudgetForecastProps {
    organizationId: string
}

export function BudgetForecast({
    organizationId }: BudgetForecastProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [forecastData, setForecastData] = useState<any>(null)
    const [forecastMonths, setForecastMonths] = useState(3)
    const [historyMonths, setHistoryMonths] = useState(6)
    const [chartView, setChartView] = useState<"expenses" | "revenue" | "profit">("expenses")

    useEffect(() => {
        const fetchForecastData = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(
                    `${APP_BASE_API_URL}/accounting/budgets/forecast?organizationId=${organizationId}&months=${forecastMonths}&historyMonths=${historyMonths}`,
                )
                const data = await response.json()
                setForecastData(data)
            } catch (error) {
                console.error("Error fetching forecast data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchForecastData()
    }, [organizationId, forecastMonths, historyMonths])

    const prepareChartData = () => {
        if (!forecastData) return []

        // Combine history and forecast data
        const historyData = forecastData.history.map((item: any) => ({
            ...item,
            month: formatMonthLabel(item.month),
            type: "Historical",
        }))

        const forecastData2 = forecastData.forecasts.map((item: any) => ({
            ...item,
            month: formatMonthLabel(item.month),
            type: "Forecast",
        }))

        // Return in chronological order
        return [...historyData.reverse(), ...forecastData2]
    }

    const formatMonthLabel = (monthStr: string) => {
        const [year, month] = monthStr.split("-")
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return `${monthNames[Number.parseInt(month) - 1]} ${year.substring(2)}`
    }

    const chartData = prepareChartData()

    const formatCurrency = (value: number) => {
        return `KES ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    }

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dataType = payload[0].payload.type

            return (
                <div className="bg-white p-3 border rounded shadow-sm">
                    <p className="font-medium">
                        {label} ({dataType})
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    // Get confidence level label
    const getConfidenceLabel = (score: number) => {
        if (score >= 80) return { label: "High", color: "text-green-600" }
        if (score >= 60) return { label: "Moderate", color: "text-amber-600" }
        return { label: "Low", color: "text-red-600" }
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Financial Forecast</h2>
                    <div className="animate-pulse h-8 w-32 bg-muted rounded"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="pb-2">
                                <div className="h-5 bg-muted rounded w-1/3 mb-1"></div>
                                <div className="h-4 bg-muted rounded w-1/2 opacity-70"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-muted rounded w-2/3 mb-4"></div>
                                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                                <div className="h-4 bg-muted rounded w-full opacity-70"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="animate-pulse">
                    <CardHeader>
                        <div className="h-5 bg-muted rounded w-1/4 mb-1"></div>
                        <div className="h-4 bg-muted rounded w-1/3 opacity-70"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 bg-muted rounded w-full"></div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!forecastData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Forecast Unavailable</CardTitle>
                    <CardDescription>We couldn't generate a forecast with the available data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Please ensure you have sufficient historical expense and revenue data.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Financial Forecast</h2>

                <div className="flex flex-wrap gap-2">
                    <Select value={historyMonths.toString()} onValueChange={(v) => setHistoryMonths(Number.parseInt(v))}>
                        <SelectTrigger className="w-[160px]">
                            <Calendar className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="History Months" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="3">3 Months History</SelectItem>
                            <SelectItem value="6">6 Months History</SelectItem>
                            <SelectItem value="12">12 Months History</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={forecastMonths.toString()} onValueChange={(v) => setForecastMonths(Number.parseInt(v))}>
                        <SelectTrigger className="w-[160px]">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Forecast Months" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="3">3 Month Forecast</SelectItem>
                            <SelectItem value="6">6 Month Forecast</SelectItem>
                            <SelectItem value="12">12 Month Forecast</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Forecast Confidence</CardTitle>
                        <CardDescription>Based on data consistency</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-bold">{forecastData.metrics.confidenceScore.toFixed(0)}%</span>
                            <Badge variant="outline" className={getConfidenceLabel(forecastData.metrics.confidenceScore).color}>
                                {getConfidenceLabel(forecastData.metrics.confidenceScore).label}
                            </Badge>
                        </div>
                        <Progress value={forecastData.metrics.confidenceScore} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-4">
                            {forecastData.metrics.confidenceScore >= 70
                                ? "Your business has consistent patterns, making forecasts more reliable."
                                : forecastData.metrics.confidenceScore >= 50
                                    ? "Moderate variability in your data affects forecast precision."
                                    : "High variability in your financial data reduces forecast reliability."}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Growth Trends</CardTitle>
                        <CardDescription>Monthly average change</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm">Revenue</span>
                                    <span
                                        className={`text-sm font-medium ${forecastData.metrics.avgRevenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {forecastData.metrics.avgRevenueGrowth >= 0 ? (
                                            <TrendingUp className="inline h-3 w-3 mr-1" />
                                        ) : (
                                            <TrendingDown className="inline h-3 w-3 mr-1" />
                                        )}
                                        {forecastData.metrics.avgRevenueGrowth.toFixed(1)}%
                                    </span>
                                </div>
                                <Progress
                                    value={50 + forecastData.metrics.avgRevenueGrowth}
                                    className="h-1.5"
                                    indicatorClassName={forecastData.metrics.avgRevenueGrowth >= 0 ? "bg-green-500" : "bg-red-500"}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm">Expenses</span>
                                    <span
                                        className={`text-sm font-medium ${forecastData.metrics.avgExpenseGrowth <= 0 ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {forecastData.metrics.avgExpenseGrowth <= 0 ? (
                                            <TrendingDown className="inline h-3 w-3 mr-1" />
                                        ) : (
                                            <TrendingUp className="inline h-3 w-3 mr-1" />
                                        )}
                                        {forecastData.metrics.avgExpenseGrowth.toFixed(1)}%
                                    </span>
                                </div>
                                <Progress
                                    value={50 + forecastData.metrics.avgExpenseGrowth}
                                    className="h-1.5"
                                    indicatorClassName={forecastData.metrics.avgExpenseGrowth <= 0 ? "bg-green-500" : "bg-red-500"}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm">Profit Margin</span>
                                    <span className="text-sm font-medium">{forecastData.metrics.avgProfitMargin.toFixed(1)}%</span>
                                </div>
                                <Progress
                                    value={forecastData.metrics.avgProfitMargin}
                                    className="h-1.5"
                                    indicatorClassName="bg-blue-500"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Next Month Forecast</CardTitle>
                        <CardDescription>{formatMonthLabel(forecastData.forecasts[0].month)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Revenue</span>
                                    <span className="font-medium">{formatCurrency(forecastData.forecasts[0].revenue)}</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Expenses</span>
                                    <span className="font-medium">{formatCurrency(forecastData.forecasts[0].expenses)}</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Profit</span>
                                    <span
                                        className={`font-medium ${forecastData.forecasts[0].profit >= 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                        {formatCurrency(forecastData.forecasts[0].profit)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="text-sm font-medium mb-1">Top Expense Categories</div>
                                {forecastData.forecasts[0].categories
                                    .sort((a: any, b: any) => b.amount - a.amount)
                                    .slice(0, 3)
                                    .map((category: any, index: number) => (
                                        <div key={category.id} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{category.name}</span>
                                            <span>{formatCurrency(category.amount)}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div>
                            <CardTitle>Financial Forecast</CardTitle>
                            <CardDescription>Historical data and future projections</CardDescription>
                        </div>
                        <div className="flex mt-2 sm:mt-0">
                            <Button
                                variant={chartView === "expenses" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setChartView("expenses")}
                                className="rounded-r-none"
                            >
                                Expenses
                            </Button>
                            <Button
                                variant={chartView === "revenue" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setChartView("revenue")}
                                className="rounded-none border-x-0"
                            >
                                Revenue
                            </Button>
                            <Button
                                variant={chartView === "profit" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setChartView("profit")}
                                className="rounded-l-none"
                            >
                                Profit
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={chartData}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(value) => `KES ${(value / 1000).toLocaleString()}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />

                                {chartView === "expenses" && (
                                    <>
                                        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" opacity={0.8} barSize={20} />
                                        <Line
                                            type="monotone"
                                            dataKey="expenses"
                                            name="Trend"
                                            stroke="#991b1b"
                                            dot={false}
                                            activeDot={false}
                                        />
                                    </>
                                )}

                                {chartView === "revenue" && (
                                    <>
                                        <Bar dataKey="revenue" name="Revenue" fill="#22c55e" opacity={0.8} barSize={20} />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            name="Trend"
                                            stroke="#15803d"
                                            dot={false}
                                            activeDot={false}
                                        />
                                    </>
                                )}

                                {chartView === "profit" && (
                                    <>
                                        <Bar dataKey="profit" name="Profit" fill="#6366f1" opacity={0.8} barSize={20} />
                                        <Line
                                            type="monotone"
                                            dataKey="profit"
                                            name="Trend"
                                            stroke="#4338ca"
                                            dot={false}
                                            activeDot={false}
                                        />
                                    </>
                                )}

                                {/* Adds a vertical line to separate history from forecast */}
                                <ReferenceLine
                                    x={
                                        chartData.findIndex((d: any) => d.type === "Forecast") > 0
                                            ? chartData[chartData.findIndex((d: any) => d.type === "Forecast")].month
                                            : ""
                                    }
                                    stroke="#888"
                                    strokeDasharray="3 3"
                                    label={{ value: "Forecast Start", position: "top", fill: "#888" }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">AI-Powered Insights</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {forecastData.insights.map((insight: any, index: number) => (
                        <Card key={index} variant={insight.type === "alert" ? "destructive" : "default"}>
                            <div className="flex items-start">
                                {insight.type === "alert" ? (
                                    <CardTitle className="h-4 w-4 mt-0.5 mr-2" />
                                ) : insight.type === "warning" ? (
                                    <AlertTriangle className="h-4 w-4 mt-0.5 mr-2 text-amber-500" />
                                ) : (
                                    <Info className="h-4 w-4 mt-0.5 mr-2 text-blue-500" />
                                )}
                                <div className="flex-1">
                                    <CardTitle>{insight.title}</CardTitle>
                                    <CardContent className="mt-1">
                                        <p>{insight.description}</p>
                                        <p className="text-sm font-medium mt-2">{insight.action}</p>
                                    </CardContent>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {forecastData.insights.length === 0 && (
                        <Card>
                            <Info className="h-4 w-4 mt-0.5 mr-2" />
                            <CardTitle>No Critical Insights</CardTitle>
                            <CardContent>
                                Your financial forecast looks stable. Continue monitoring your expenses and revenue.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
