"use client"

import { useState } from "react"
import { useCurrency } from "@/hooks/useCurrency";
import { ExpenseTable } from "@/components/expenses/expense-table"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { Button } from "@/components/ui/button"
import {
    PlusCircle,
    Receipt,
    FileBarChart,
    Car,
    Lightbulb,
    Home,
    Paperclip,
    Megaphone,
    Wrench,
    Users,
    Package,
    CircleDot,
    Repeat,
    AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ExpenseDrawer } from "@/components/expenses/expense-drawer"
import { useExpenses, useExpenseCategories } from "@/hooks/use-expenses"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

const categoryIcons: Record<string, any> = {
    transport: Car,
    utilities: Lightbulb,
    rent: Home,
    office_supplies: Paperclip,
    marketing: Megaphone,
    equipment_maintenance: Wrench,
    employee_wages: Users,
    stock_purchase: Package,
    other: CircleDot,
}

export default function ExpensesPage() {
    const [open, setOpen] = useState(false)
    const isMobile = useMediaQuery("(max-width: 768px)")

    const {
        data: expensesData,
        isLoading: expensesLoading,
        error: expensesError,
    } = useExpenses({
        organizationId: "",
        page: 1,
        limit: 50,
    })

    const {
        data: categories,
        isLoading: categoriesLoading,
        error: categoriesError,
    } = useExpenseCategories("organizationId")

    if (expensesError || categoriesError) {
        return (
            <div className="max-w-4xl mx-auto py-3">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Failed to load expenses data. Please try again.</AlertDescription>
                </Alert>
            </div>
        )
    }

    const expenses = expensesData?.expenses || []
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    // Get expenses by category
    const expensesByCategory = expenses.reduce(
        (acc, expense) => {
            const categoryName = expense.category.name
            acc[categoryName] = (acc[categoryName] || 0) + expense.amount
            return acc
        },
        {} as Record<string, number>,
    )

    return (
        <div className="max-w-4xl mx-auto py-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Expenses</h1>
                    <p className="text-muted-foreground">Track and manage your business expenses</p>
                </div>
                <Button
                    onClick={() => setOpen(true)}
                    className="w-1/3 bg-green-700 hover:bg-green-800 text-white"
                    disabled={categoriesLoading}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Expense
                </Button>
            </div>

            <Tabs defaultValue="all" className="mb-6">
                <TabsList>
                    <TabsTrigger value="all">All Expenses</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Recent Expenses</CardTitle>
                            <CardDescription>
                                {expensesLoading ? (
                                    <Skeleton className="h-4 w-64" />
                                ) : expenses.length > 0 ? (
                                    `You have ${expenses.length} recorded expenses totaling KES ${totalExpenses.toLocaleString()}`
                                ) : (
                                    "You haven't recorded any expenses yet"
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {expensesLoading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <ExpenseTable expenses={expenses} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="summary">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Total Expenses</CardTitle>
                                <CardDescription>All recorded expenses</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center">
                                    <Receipt className="h-5 w-5 text-green-700 mr-2" />
                                    {expensesLoading ? (
                                        <Skeleton className="h-8 w-32" />
                                    ) : (
                                        <span className="text-2xl font-bold">KES {totalExpenses.toLocaleString()}</span>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <p className="text-sm">Download expense reports</p>
                                    <Button variant="outline" className="my-1 w-full">
                                        <FileBarChart className="mr-2 h-4 w-4" />
                                        Generate Report
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Expense Breakdown</CardTitle>
                                <CardDescription>By category</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {expensesLoading ? (
                                    <div className="space-y-2">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <Skeleton key={i} className="h-8 w-full" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {Object.entries(expensesByCategory).map(([categoryName, amount]) => {
                                            const IconComponent = categoryIcons[categoryName.toLowerCase().replace(" ", "_")] || CircleDot

                                            return (
                                                <div
                                                    key={categoryName}
                                                    className="flex justify-between items-center p-1.5 rounded-md hover:bg-muted/50 group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <IconComponent className="h-4 w-4 text-blue-500" />
                                                        <span className="capitalize">{categoryName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">KES {amount.toLocaleString()}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Mark as recurring"
                                                            onClick={() => {
                                                                alert(`Set up ${categoryName} as a recurring expense`)
                                                            }}
                                                        >
                                                            <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {isMobile ? (
                <ExpenseDrawer open={open} onOpenChange={setOpen} categories={categories || []} />
            ) : (
                <ExpenseDialog open={open} onOpenChange={setOpen} categories={categories || []} />
            )}
        </div>
    )
}
