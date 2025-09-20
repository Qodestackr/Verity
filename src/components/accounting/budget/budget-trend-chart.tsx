"use client"

import { APP_BASE_API_URL } from "@/config/urls"
import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface BudgetTrendChartProps {
    organizationId: string
    year: number
}

export function BudgetTrendChart({
    organizationId, year }: BudgetTrendChartProps) {
    const [chartData, setChartData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(
                    `${APP_BASE_API_URL}/accounting/reports/budget-variance?organizationId=${organizationId}&period=monthly&year=${year}&projections=true`,
                )
                const data = await response.json()

                if (data.variance) {
                    // Process data for chart
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

                    const processedData = months.map((month, index) => {
                        const monthKey = `${year}-${String(index + 1).padStart(2, "0")}`
                        const periodData = data.variance.find((p: any) => p.period === monthKey)

                        return {
                            name: month,
                            Budget: periodData ? periodData.totalBudgeted : 0,
                            Actual: periodData ? periodData.totalActual : 0,
                            isProjected: periodData ? periodData.isProjected : false,
                        }
                    })

                    setChartData(processedData)
                }
            } catch (error) {
                console.error("Error fetching budget trend data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [organizationId, year])

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const isProjected = payload[0]?.payload?.isProjected

            return (
                <div className="bg-white p-3 border rounded shadow-sm">
                    <p className="font-medium">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: KES {entry.value.toLocaleString()}
                        </p>
                    ))}
                    {isProjected && <p className="text-xs text-muted-foreground mt-1">(Projected)</p>}
                </div>
            )
        }
        return null
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p>Loading budget trends...</p>
                </div>
            </div>
        )
    }

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>No budget data available for {year}</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={chartData}
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
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="Budget" stroke="#22c55e" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Actual" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    )
}
