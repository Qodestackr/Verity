"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface BudgetComparisonChartProps {
    categories: Array<{
        name: string
        budgeted: number
        actual: number
    }>
}

export function BudgetComparisonChart({
    categories }: BudgetComparisonChartProps) {
    // Sort categories by budgeted amount
    const sortedCategories = [...categories].sort((a, b) => b.budgeted - a.budgeted)

    // top 6 categories for better visualization
    const displayCategories = sortedCategories.slice(0, 6).map((category) => ({
        name: category.name,
        Budget: category.budgeted,
        Actual: category.actual,
    }))

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={displayCategories}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `KES ${value.toLocaleString()}`} />
                <Tooltip formatter={(value: number) => [`KES ${value.toLocaleString()}`, undefined]} />
                <Legend />
                <Bar dataKey="Budget" fill="#22c55e" />
                <Bar dataKey="Actual" fill="#6366f1" />
            </BarChart>
        </ResponsiveContainer>
    )
}
