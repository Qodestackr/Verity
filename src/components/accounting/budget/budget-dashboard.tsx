"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingUp, TrendingDown, Plus, Calendar, ArrowRight, Wallet, DollarSign } from "lucide-react"
import { BudgetCreateDialog } from "@/components/accounting/budget/budget-create-dialog"
import { BudgetCategoryCard } from "@/components/accounting/budget/budget-category-card"
import { BudgetComparisonChart } from "@/components/accounting/budget/budget-comparison-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"
import { APP_BASE_API_URL } from "@/config/urls"

interface BudgetDashboardProps {
    organizationId: string
}

export function BudgetDashboard({
    organizationId }: BudgetDashboardProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [budgetData, setBudgetData] = useState<any>(null)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    const organizationSlug = useOrganizationSlug()

    useEffect(() => {
        const fetchBudgetData = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(
                    `${APP_BASE_API_URL}/accounting/budgets?organizationId=${organizationId}&year=${selectedYear}&month=${selectedMonth}`,
                )
                const data = await response.json()
                setBudgetData(data)
            } catch (error) {
                console.error("Error fetching budget data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBudgetData()
    }, [organizationId, selectedMonth, selectedYear])

    const handleCreateBudget = async (budgetData: any) => {
        try {
            const response = await fetch(`${APP_BASE_API_URL}/accounting/budgets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...budgetData,
                    organizationId,
                }),
            })

            if (response.ok) {
                // Refresh budget data
                const updatedResponse = await fetch(
                    `${APP_BASE_API_URL}/accounting/budgets?organizationId=${organizationId}&year=${selectedYear}&month=${selectedMonth}`,
                )
                const updatedData = await updatedResponse.json()
                setBudgetData(updatedData)
                setCreateDialogOpen(false)
            } else {
                console.error("Failed to create budget")
            }
        } catch (error) {
            console.error("Error creating budget:", error)
        }
    }

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    const years = Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i)

    // Calc overall budget status
    const getBudgetStatus = () => {
        if (!budgetData || !budgetData.comparison) return { status: "neutral", message: "No budget data" }

        const { percentUsed } = budgetData.comparison.totals

        if (percentUsed > 100) {
            return { status: "danger", message: "Over budget" }
        } else if (percentUsed > 90) {
            return { status: "warning", message: "Near limit" }
        } else if (percentUsed > 70) {
            return { status: "caution", message: "On track" }
        } else {
            return { status: "good", message: "Under budget" }
        }
    }

    const budgetStatus = getBudgetStatus()

    return (
        <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-light">Budget Management</h1>
                    <p className="text-xs text-muted-foreground">Track, plan, and optimize your business spending</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex gap-2">
                        <Select
                            value={selectedMonth.toString()}
                            onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
                        >
                            <SelectTrigger className="w-[130px]">
                                <Calendar className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month, index) => (
                                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                                        {month}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={() => setCreateDialogOpen(true)} className="bg-green-700 hover:bg-green-800 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Budget
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => (window.location.href = `/dashboard/${organizationSlug}/accounting/budget/forecast?organizationId=${organizationId}`)}
                    >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        View Forecast
                    </Button>
                </div>
            </div>

            {isLoading ? (
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
            ) : (
                <>
                    {!budgetData?.budget ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-normal">No Budget Found</CardTitle>
                                <CardDescription className="text-xs">
                                    You don't have a budget set up for {months[selectedMonth - 1]} {selectedYear}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-3">
                                <Wallet className="h-12 w-12 text-muted-foreground mb-2" />
                                <p className="text-center mb-3 text-sm">
                                    Create a budget to track your expenses and stay on top of your financial goals.
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setCreateDialogOpen(true)}
                                        className="bg-green-700 hover:bg-green-800 text-white"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create New Budget
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Tabs defaultValue="overview" className="space-y-2">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="categories">Categories</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card
                                        className={`border-l-4 ${budgetStatus.status === "danger"
                                            ? "border-l-red-500"
                                            : budgetStatus.status === "warning"
                                                ? "border-l-amber-500"
                                                : budgetStatus.status === "caution"
                                                    ? "border-l-yellow-500"
                                                    : "border-l-green-500"
                                            }`}
                                    >
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">Budget Status</CardTitle>
                                            <CardDescription>
                                                {months[selectedMonth - 1]} {selectedYear}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-2xl font-bold">
                                                    {budgetData.comparison.totals.percentUsed.toFixed(1)}%
                                                </span>
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-medium ${budgetStatus.status === "danger"
                                                        ? "bg-red-100 text-red-800"
                                                        : budgetStatus.status === "warning"
                                                            ? "bg-amber-100 text-amber-800"
                                                            : budgetStatus.status === "caution"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-green-100 text-green-800"
                                                        }`}
                                                >
                                                    {budgetStatus.message}
                                                </span>
                                            </div>
                                            <Progress
                                                value={Math.min(budgetData.comparison.totals.percentUsed, 100)}
                                                className={`h-2 ${budgetStatus.status === "danger"
                                                    ? "bg-red-100"
                                                    : budgetStatus.status === "warning"
                                                        ? "bg-amber-100"
                                                        : budgetStatus.status === "caution"
                                                            ? "bg-yellow-100"
                                                            : "bg-green-100"
                                                    }`}
                                                indicatorClassName={
                                                    budgetStatus.status === "danger"
                                                        ? "bg-red-500"
                                                        : budgetStatus.status === "warning"
                                                            ? "bg-amber-500"
                                                            : budgetStatus.status === "caution"
                                                                ? "bg-yellow-500"
                                                                : "bg-green-500"
                                                }
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                <span>0%</span>
                                                <span>50%</span>
                                                <span>100%</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">Total Budget</CardTitle>
                                            <CardDescription>Allocated vs Spent</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold mb-2">
                                                KES {budgetData.comparison.totals.budgeted.toLocaleString()}
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Spent: KES {budgetData.comparison.totals.actual.toLocaleString()}</span>
                                                <span
                                                    className={`${budgetData.comparison.totals.variance >= 0 ? "text-green-600" : "text-red-600"
                                                        }`}
                                                >
                                                    {budgetData.comparison.totals.variance >= 0 ? (
                                                        <TrendingDown className="inline h-4 w-4 mr-1" />
                                                    ) : (
                                                        <TrendingUp className="inline h-4 w-4 mr-1" />
                                                    )}
                                                    KES {Math.abs(budgetData.comparison.totals.variance).toLocaleString()}
                                                    {budgetData.comparison.totals.variance >= 0 ? " remaining" : " over"}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">Budget Insights</CardTitle>
                                            <CardDescription>Top spending categories</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {budgetData.comparison.byCategory
                                                    .sort((a: any, b: any) => b.actual - a.actual)
                                                    .slice(0, 3)
                                                    .map((category: any) => (
                                                        <div key={category.categoryId} className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                                                <span className="text-sm">{category.categoryName}</span>
                                                            </div>
                                                            <span className="text-sm font-medium">KES {category.actual.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                            <Button variant="link" className="p-0 h-auto mt-2 text-green-700">
                                                View all categories <ArrowRight className="h-3 w-3 ml-1" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Budget vs. Actual</CardTitle>
                                        <CardDescription>Comparison by category</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-80">
                                        <BudgetComparisonChart
                                            categories={budgetData.comparison.byCategory.map((c: any) => ({
                                                name: c.categoryName,
                                                budgeted: c.budgeted,
                                                actual: c.actual,
                                            }))}
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Spending Alerts</CardTitle>
                                        <CardDescription>Categories exceeding budget</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {budgetData.comparison.byCategory
                                                .filter((c: any) => c.percentUsed > 90 && c.budgeted > 0)
                                                .sort((a: any, b: any) => b.percentUsed - a.percentUsed)
                                                .slice(0, 4)
                                                .map((category: any) => (
                                                    <div key={category.categoryId} className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                {category.percentUsed > 100 ? (
                                                                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                                                                ) : (
                                                                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                                                                )}
                                                                <span>{category.categoryName}</span>
                                                            </div>
                                                            <span
                                                                className={`text-sm font-medium ${category.percentUsed > 100 ? "text-red-600" : "text-amber-600"
                                                                    }`}
                                                            >
                                                                {category.percentUsed.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={Math.min(category.percentUsed, 100)}
                                                            className="h-1.5"
                                                            indicatorClassName={category.percentUsed > 100 ? "bg-red-500" : "bg-amber-500"}
                                                        />
                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                            <span>Budget: KES {category.budgeted.toLocaleString()}</span>
                                                            <span>Spent: KES {category.actual.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))}

                                            {budgetData.comparison.byCategory.filter((c: any) => c.percentUsed > 90 && c.budgeted > 0)
                                                .length === 0 && (
                                                    <div className="flex flex-col items-center justify-center py-6 text-center">
                                                        <DollarSign className="h-12 w-12 text-green-500 mb-2" />
                                                        <p className="font-medium text-green-700">No overspending detected</p>
                                                        <p className="text-sm text-muted-foreground">All categories are within budget limits</p>
                                                    </div>
                                                )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="categories">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {budgetData.comparison.byCategory.map((category: any) => (
                                        <BudgetCategoryCard key={category.categoryId} category={category} />
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </>
            )}

            <BudgetCreateDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSubmit={handleCreateBudget}
                organizationId={organizationId}
            />
        </div>
    )
}
