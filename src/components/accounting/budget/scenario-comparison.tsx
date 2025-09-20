"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { TrendingUp, TrendingDown, Info, Check, BarChart3, LineChart } from "lucide-react"
import { toast } from "sonner"
import { getFormattedMoney } from "@/utils/money"
import { APP_BASE_API_URL } from "@/config/urls"

interface ScenarioComparisonProps {
    organizationId: string
    budgetId: string
    scenarios: any[]
}

export function ScenarioComparison({
    organizationId, budgetId, scenarios }: ScenarioComparisonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [comparisonData, setComparisonData] = useState<any>(null)
    const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState("overview")
    const [chartView, setChartView] = useState<"categories" | "metrics">("categories")

    // Initialize selected scenarios with baseline and first non-baseline
    useEffect(() => {
        if (scenarios.length > 0) {
            const baselineScenario = scenarios.find((s) => s.isBaseline)
            const nonBaselineScenario = scenarios.find((s) => !s.isBaseline)

            const initialSelected = []
            if (baselineScenario) initialSelected.push(baselineScenario.id)
            if (nonBaselineScenario) initialSelected.push(nonBaselineScenario.id)

            setSelectedScenarios(initialSelected)
        }
    }, [scenarios])

    // Fetch comparison data when selected scenarios change
    useEffect(() => {
        const fetchComparisonData = async () => {
            if (selectedScenarios.length < 2) return

            setIsLoading(true)
            try {
                const response = await fetch(`${APP_BASE_API_URL}/accounting/budgets/scenarios/compare`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        scenarioIds: selectedScenarios,
                        organizationId,
                    }),
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch comparison data")
                }

                const data = await response.json()
                setComparisonData(data)
            } catch (error) {
                console.error("Error fetching comparison data:", error)
                toast.error("Error", {
                    description: "Failed to fetch comparison data. Please try again.",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchComparisonData()
    }, [selectedScenarios, organizationId])

    const toggleScenarioSelection = (scenarioId: string) => {
        // Always keep at least one scenario selected
        if (selectedScenarios.includes(scenarioId) && selectedScenarios.length <= 2) {
            return
        }

        setSelectedScenarios((prev) =>
            prev.includes(scenarioId) ? prev.filter((id) => id !== scenarioId) : [...prev, scenarioId],
        )
    }

    // Format currency
    const formatCurrency = (value: number) => {
        return `KES ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    }

    // Format percentage
    const formatPercentage = (value: number) => {
        return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
    }

    // Get color based on value
    const getValueColor = (value: number) => {
        if (value > 0) return "text-green-600"
        if (value < 0) return "text-red-600"
        return "text-gray-600"
    }

    // Prepare chart data
    const prepareChartData = () => {
        if (!comparisonData) return []

        if (chartView === "categories") {
            // Category comparison chart
            return comparisonData.categoryComparison
                .sort((a: any, b: any) => b.baselineAmount - a.baselineAmount)
                .slice(0, 8) // Show top 8 categories
                .map((category: any) => {
                    const result: any = {
                        name: category.categoryName,
                        Baseline: category.baselineAmount,
                    }

                    // Add data for each selected scenario
                    category.scenarioData.forEach((scenario: any) => {
                        if (scenario.scenarioId !== comparisonData.scenarios.find((s: any) => s.isBaseline).id) {
                            result[scenario.scenarioName] = scenario.amount
                        }
                    })

                    return result
                })
        } else {
            // Metrics comparison chart
            return comparisonData.metricsComparison.map((metric: any) => {
                const result: any = {
                    name: metric.metricName,
                    Baseline: metric.baselineValue,
                }

                // Add data for each selected scenario
                metric.scenarios.forEach((scenario: any) => {
                    if (scenario.scenarioId !== comparisonData.scenarios.find((s: any) => s.isBaseline).id) {
                        result[scenario.scenarioName] = scenario.value
                    }
                })

                return result
            })
        }
    }

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded shadow-sm">
                    <p className="font-medium">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {getFormattedMoney(entry.value)}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Scenario Comparison</h2>
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
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Scenario Comparison</h2>

                <div className="flex flex-wrap gap-2">
                    <Card className="p-2">
                        <div className="flex flex-wrap gap-2">
                            {scenarios.map((scenario) => (
                                <Badge
                                    key={scenario.id}
                                    variant={selectedScenarios.includes(scenario.id) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleScenarioSelection(scenario.id)}
                                >
                                    {selectedScenarios.includes(scenario.id) && <Check className="mr-1 h-3 w-3" />}
                                    {scenario.name}
                                    {scenario.isBaseline && " (Baseline)"}
                                </Badge>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {!comparisonData ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Select Scenarios to Compare</CardTitle>
                        <CardDescription>Select at least two scenarios to see a side-by-side comparison.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-center mb-6">
                            Choose scenarios from the list above to compare their impacts and outcomes.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                        <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
                        <TabsTrigger value="impacts">Impacts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Budget Comparison</CardTitle>
                                    <CardDescription>Total budget by scenario</CardDescription>
                                </CardHeader>
                                <CardContent className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={comparisonData.metricsComparison[0].scenarios.map((s: any) => ({
                                                name: s.scenarioName,
                                                value: s.value,
                                                isBaseline: comparisonData.scenarios.find((sc: any) => sc.id === s.scenarioId)?.isBaseline,
                                            }))}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                                            <YAxis tickFormatter={(value) => `KES ${(value / 1000).toLocaleString()}k`} />
                                            <Tooltip formatter={(value: any) => getFormattedMoney(value)} />
                                            <Bar dataKey="value" name="Budget Amount">
                                                {comparisonData.metricsComparison[0].scenarios.map((entry: any, index: number) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            comparisonData.scenarios.find((s: any) => s.id === entry.scenarioId)?.isBaseline
                                                                ? "#22c55e"
                                                                : "#6366f1"
                                                        }
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Key Metrics</CardTitle>
                                    <CardDescription>Comparison of financial outcomes</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-80 pr-4">
                                        <div className="space-y-6">
                                            {comparisonData.scenarios.map((scenario: any) => (
                                                <div key={scenario.id} className="space-y-2">
                                                    <h3 className="font-medium flex items-center">
                                                        {scenario.name}
                                                        {scenario.isBaseline && (
                                                            <Badge variant="outline" className="ml-2">
                                                                Baseline
                                                            </Badge>
                                                        )}
                                                    </h3>
                                                    <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-muted-foreground">Total Budget</span>
                                                            <span className="font-medium">{getFormattedMoney(scenario.totalAmount)}</span>
                                                        </div>

                                                        {!scenario.isBaseline &&
                                                            comparisonData.impactsComparison
                                                                .find((impact: any) => impact.scenarioId === scenario.id)
                                                                ?.impacts.map((impact: any) => (
                                                                    <div key={impact.metricName} className="flex justify-between">
                                                                        <span className="text-sm text-muted-foreground">
                                                                            {impact.metricName === "profit_margin" ? "Profit Margin" : "Cash Flow Impact"}
                                                                        </span>
                                                                        <span className={`font-medium ${getValueColor(impact.changePercent)}`}>
                                                                            {impact.metricName === "profit_margin"
                                                                                ? `${impact.scenarioValue.toFixed(1)}% (${formatPercentage(impact.changePercent)})`
                                                                                : `${formatCurrency(impact.scenarioValue)} (${formatPercentage(impact.changePercent)})`}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                    </div>
                                                    <Separator className="my-2" />
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Comparison Chart</CardTitle>
                                        <CardDescription>Visual comparison of scenarios</CardDescription>
                                    </div>
                                    <div className="flex mt-2 sm:mt-0">
                                        <Button
                                            variant={chartView === "categories" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setChartView("categories")}
                                            className="rounded-r-none"
                                        >
                                            <BarChart3 className="h-4 w-4 mr-2" />
                                            Categories
                                        </Button>
                                        <Button
                                            variant={chartView === "metrics" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setChartView("metrics")}
                                            className="rounded-l-none"
                                        >
                                            <LineChart className="h-4 w-4 mr-2" />
                                            Metrics
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={prepareChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                                        <YAxis tickFormatter={(value) => `KES ${(value / 1000).toLocaleString()}k`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="Baseline" fill="#22c55e" />
                                        {comparisonData.scenarios
                                            .filter((s: any) => !s.isBaseline && selectedScenarios.includes(s.id))
                                            .map((scenario: any, index: number) => (
                                                <Bar key={scenario.id} dataKey={scenario.name} fill="#6366f1" />
                                            ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="categories">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Category Breakdown</CardTitle>
                                <CardDescription>Detailed comparison by expense category</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 px-4">Category</th>
                                                <th className="text-right py-2 px-4">Baseline</th>
                                                {comparisonData.scenarios
                                                    .filter((s: any) => !s.isBaseline && selectedScenarios.includes(s.id))
                                                    .map((scenario: any) => (
                                                        <React.Fragment key={scenario.id}>
                                                            <th className="text-right py-2 px-4">{scenario.name}</th>
                                                            <th className="text-right py-2 px-4">Difference</th>
                                                        </React.Fragment>
                                                    ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisonData.categoryComparison.map((category: any) => (
                                                <tr key={category.categoryId} className="border-b hover:bg-muted/50">
                                                    <td className="py-2 px-4">{category.categoryName}</td>
                                                    <td className="text-right py-2 px-4">{getFormattedMoney(category.baselineAmount)}</td>
                                                    {comparisonData.scenarios
                                                        .filter((s: any) => !s.isBaseline && selectedScenarios.includes(s.id))
                                                        .map((scenario: any) => {
                                                            const scenarioData = category.scenarioData.find(
                                                                (sd: any) => sd.scenarioId === scenario.id,
                                                            )
                                                            return (
                                                                <React.Fragment key={scenario.id}>
                                                                    <td className="text-right py-2 px-4">{getFormattedMoney(scenarioData?.amount || 0)}</td>
                                                                    <td
                                                                        className={`text-right py-2 px-4 ${getValueColor(
                                                                            scenarioData?.percentChange || 0,
                                                                        )}`}
                                                                    >
                                                                        {formatPercentage(scenarioData?.percentChange || 0)}
                                                                    </td>
                                                                </React.Fragment>
                                                            )
                                                        })}
                                                </tr>
                                            ))}
                                            <tr className="font-medium bg-muted/30">
                                                <td className="py-2 px-4">Total</td>
                                                <td className="text-right py-2 px-4">
                                                    {getFormattedMoney(comparisonData.scenarios.find((s: any) => s.isBaseline).totalAmount)}
                                                </td>
                                                {comparisonData.scenarios
                                                    .filter((s: any) => !s.isBaseline && selectedScenarios.includes(s.id))
                                                    .map((scenario: any) => {
                                                        const baselineAmount = comparisonData.scenarios.find((s: any) => s.isBaseline).totalAmount
                                                        const difference = scenario.totalAmount - baselineAmount
                                                        const percentChange = (difference / baselineAmount) * 100
                                                        return (
                                                            <React.Fragment key={scenario.id}>
                                                                <td className="text-right py-2 px-4">{getFormattedMoney(scenario.totalAmount)}</td>
                                                                <td className={`text-right py-2 px-4 ${getValueColor(percentChange)}`}>
                                                                    {formatPercentage(percentChange)}
                                                                </td>
                                                            </React.Fragment>
                                                        )
                                                    })}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="assumptions">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {comparisonData.assumptionsComparison
                                .filter((item: any) => selectedScenarios.includes(item.scenarioId))
                                .map((item: any) => (
                                    <Card key={item.scenarioId}>
                                        <CardHeader>
                                            <CardTitle className="text-lg">
                                                {comparisonData.scenarios.find((s: any) => s.id === item.scenarioId)?.name}
                                            </CardTitle>
                                            <CardDescription>
                                                {item.assumptions.length === 0
                                                    ? "No assumptions defined"
                                                    : `${item.assumptions.length} assumption${item.assumptions.length !== 1 ? "s" : ""}`}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {item.assumptions.length === 0 ? (
                                                <div className="text-center py-4 text-muted-foreground">
                                                    <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                    <p>No assumptions have been defined for this scenario.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {item.assumptions.map((assumption: any) => (
                                                        <div key={assumption.id} className="border rounded-md p-3">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-medium">{assumption.name}</h4>
                                                                    <p className="text-sm text-muted-foreground">{assumption.description}</p>
                                                                </div>
                                                                <Badge variant="outline">
                                                                    {assumption.type.charAt(0).toUpperCase() + assumption.type.slice(1)}
                                                                </Badge>
                                                            </div>
                                                            <div className="mt-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span>Change:</span>
                                                                    <span className="font-medium">
                                                                        {assumption.changeType === "percentage"
                                                                            ? `${assumption.changeValue}%`
                                                                            : getFormattedMoney(assumption.changeValue)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Applied to:</span>
                                                                    <span className="font-medium">
                                                                        {assumption.appliedTo === "all"
                                                                            ? "All Categories"
                                                                            : comparisonData.categoryComparison.find(
                                                                                (c: any) => c.categoryId === assumption.appliedTo,
                                                                            )?.categoryName || "Unknown"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="impacts">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Financial Impacts</CardTitle>
                                    <CardDescription>Key financial metrics affected by each scenario</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-2 px-4">Scenario</th>
                                                    <th className="text-right py-2 px-4">Budget Change</th>
                                                    <th className="text-right py-2 px-4">Profit Margin</th>
                                                    <th className="text-right py-2 px-4">Cash Flow Impact</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {comparisonData.scenarios.map((scenario: any) => {
                                                    const baselineAmount = comparisonData.scenarios.find((s: any) => s.isBaseline).totalAmount
                                                    const budgetDiff = scenario.totalAmount - baselineAmount
                                                    const budgetPercent = (budgetDiff / baselineAmount) * 100

                                                    // Find impact data for this scenario
                                                    const impactData = comparisonData.impactsComparison.find(
                                                        (i: any) => i.scenarioId === scenario.id,
                                                    )

                                                    const profitMarginImpact = impactData?.impacts.find(
                                                        (i: any) => i.metricName === "profit_margin",
                                                    )

                                                    const cashFlowImpact = impactData?.impacts.find((i: any) => i.metricName === "cash_flow")

                                                    return (
                                                        <tr key={scenario.id} className="border-b hover:bg-muted/50">
                                                            <td className="py-2 px-4">
                                                                <div className="flex items-center">
                                                                    {scenario.name}
                                                                    {scenario.isBaseline && (
                                                                        <Badge variant="outline" className="ml-2">
                                                                            Baseline
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td
                                                                className={`text-right py-2 px-4 ${scenario.isBaseline ? "" : getValueColor(budgetPercent)
                                                                    }`}
                                                            >
                                                                {scenario.isBaseline
                                                                    ? "—"
                                                                    : `${formatCurrency(budgetDiff)} (${formatPercentage(budgetPercent)})`}
                                                            </td>
                                                            <td
                                                                className={`text-right py-2 px-4 ${scenario.isBaseline ? "" : getValueColor(profitMarginImpact?.changePercent || 0)
                                                                    }`}
                                                            >
                                                                {scenario.isBaseline
                                                                    ? `${profitMarginImpact?.baselineValue.toFixed(1) || "—"}%`
                                                                    : `${profitMarginImpact?.scenarioValue.toFixed(1) || "—"}% (${formatPercentage(
                                                                        profitMarginImpact?.changePercent || 0,
                                                                    )})`}
                                                            </td>
                                                            <td
                                                                className={`text-right py-2 px-4 ${scenario.isBaseline ? "" : getValueColor(cashFlowImpact?.changePercent || 0)
                                                                    }`}
                                                            >
                                                                {scenario.isBaseline
                                                                    ? "—"
                                                                    : `${formatCurrency(cashFlowImpact?.baselineValue - cashFlowImpact?.scenarioValue || 0)} (${formatPercentage(
                                                                        cashFlowImpact?.changePercent || 0,
                                                                    )})`}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {comparisonData.impactsComparison
                                    .filter((item: any) => selectedScenarios.includes(item.scenarioId))
                                    .map((item: any) => {
                                        const scenario = comparisonData.scenarios.find((s: any) => s.id === item.scenarioId)
                                        if (!scenario || scenario.isBaseline) return null

                                        return (
                                            <Card key={item.scenarioId}>
                                                <CardHeader>
                                                    <CardTitle className="text-lg">{scenario.name} - Key Insights</CardTitle>
                                                    <CardDescription>Financial impact analysis</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {item.impacts.map((impact: any) => {
                                                            const isPositive = impact.impact === "positive"
                                                            const isNegative = impact.impact === "negative"

                                                            return (
                                                                <Alert
                                                                    key={impact.metricName}
                                                                    variant={isPositive ? "default" : isNegative ? "destructive" : "outline"}
                                                                >
                                                                    <div className="flex items-start">
                                                                        {isPositive ? (
                                                                            <TrendingUp className="h-4 w-4 mt-0.5 mr-2" />
                                                                        ) : isNegative ? (
                                                                            <TrendingDown className="h-4 w-4 mt-0.5 mr-2" />
                                                                        ) : (
                                                                            <Info className="h-4 w-4 mt-0.5 mr-2" />
                                                                        )}
                                                                        <div>
                                                                            <AlertTitle>
                                                                                {impact.metricName === "profit_margin"
                                                                                    ? "Profit Margin Impact"
                                                                                    : "Cash Flow Impact"}
                                                                            </AlertTitle>
                                                                            <AlertDescription className="mt-1">
                                                                                {impact.metricName === "profit_margin" ? (
                                                                                    <p>
                                                                                        {isPositive
                                                                                            ? `This scenario improves profit margin by ${formatPercentage(
                                                                                                impact.changePercent,
                                                                                            )}, increasing from ${impact.baselineValue.toFixed(
                                                                                                1,
                                                                                            )}% to ${impact.scenarioValue.toFixed(1)}%.`
                                                                                            : isNegative
                                                                                                ? `This scenario reduces profit margin by ${formatPercentage(
                                                                                                    Math.abs(impact.changePercent),
                                                                                                )}, decreasing from ${impact.baselineValue.toFixed(
                                                                                                    1,
                                                                                                )}% to ${impact.scenarioValue.toFixed(1)}%.`
                                                                                                : `This scenario has minimal impact on profit margin.`}
                                                                                    </p>
                                                                                ) : (
                                                                                    <p>
                                                                                        {isPositive
                                                                                            ? `This scenario improves cash flow by ${formatCurrency(
                                                                                                impact.baselineValue - impact.scenarioValue,
                                                                                            )} (${formatPercentage(
                                                                                                impact.changePercent,
                                                                                            )}), reducing expenses compared to baseline.`
                                                                                            : isNegative
                                                                                                ? `This scenario worsens cash flow by ${formatCurrency(
                                                                                                    impact.scenarioValue - impact.baselineValue,
                                                                                                )} (${formatPercentage(
                                                                                                    impact.changePercent,
                                                                                                )}), increasing expenses compared to baseline.`
                                                                                                : `This scenario has minimal impact on cash flow.`}
                                                                                    </p>
                                                                                )}
                                                                            </AlertDescription>
                                                                        </div>
                                                                    </div>
                                                                </Alert>
                                                            )
                                                        })}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    )
}
