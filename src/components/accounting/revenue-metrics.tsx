"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const revenueData = {
    weekly: [
        { name: "Mon", revenue: 420000 },
        { name: "Tue", revenue: 380000 },
        { name: "Wed", revenue: 520000 },
        { name: "Thu", revenue: 490000 },
        { name: "Fri", revenue: 780000 },
        { name: "Sat", revenue: 890000 },
        { name: "Sun", revenue: 320000 },
    ],
    monthly: [
        { name: "Jan", revenue: 3200000 },
        { name: "Feb", revenue: 3600_000 },
        { name: "Mar", revenue: 3800000 },
        { name: "Apr", revenue: 4200000 },
        { name: "May", revenue: 3900000 },
        { name: "Jun", revenue: 4100000 },
        { name: "Jul", revenue: 4500000 },
        { name: "Aug", revenue: 4700000 },
        { name: "Sep", revenue: 4300000 },
        { name: "Oct", revenue: 4600000 },
        { name: "Nov", revenue: 4800000 },
        { name: "Dec", revenue: 5200000 },
    ],
}

export function RevenueMetrics() {
    const [period, setPeriod] = useState("weekly")

    const data = period === "weekly" ? revenueData.weekly : revenueData.monthly

    const formatCurrency = (value: number) => {
        return `KSh ${(value / 1000).toFixed(0)}K`
    }

    return (
        <Card className="col-span-2">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Track your sales performance over time</CardDescription>
                    </div>
                    <Tabs defaultValue="weekly" value={period} onValueChange={setPeriod}>
                        <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
                            <TabsTrigger value="weekly">Weekly</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer className='text-xs' width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={formatCurrency} />
                            <Tooltip
                                formatter={(value: number) => [`{formatCurrency(value)}`, "Revenue"]}
                                labelFormatter={(label) => `${label} ${period === "weekly" ? "(This Week)" : "(This Year)"}`}
                            />
                            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}