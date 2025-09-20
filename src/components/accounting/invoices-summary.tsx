"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const invoiceData = [
    { name: "Paid", value: 68, color: "#10b981" },
    { name: "Pending", value: 24, color: "#f59e0b" },
    { name: "Overdue", value: 8, color: "#ef4444" },
]

export function InvoicesSummary() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Invoice Status</CardTitle>
                <CardDescription>Overview of your invoice payment status</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[200px]">
                    <ResponsiveContainer className='text-xs' width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={invoiceData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                                {invoiceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [`${value}%`, "Percentage"]} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-6 space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link href="/accounting/invoices?status=pending">
                            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
                            View Pending Invoices (24)
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link href="/accounting/invoices?status=overdue">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                            View Overdue Invoices (8)
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}