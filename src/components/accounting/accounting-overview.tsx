"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, DollarSign, Users, Package, CreditCard, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RevenueMetrics } from "@/components/accounting/revenue-metrics"
import { InvoicesSummary } from "@/components/accounting/invoices-summary"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

export function AccountingOverview() {
    const [activeTab, setActiveTab] = useState("overview")
    const organizationSlug = useOrganizationSlug()

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Accounting</h1>
                    <p className="text-muted-foreground">Manage your finances and track business performance</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href={`/dashboard/${organizationSlug}/accounting/invoices/new`}>Create Invoice</Link>
                    </Button>
                    <Button variant="outline">Export Reports</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium">Outstanding Invoices</CardTitle>
                        <CardDescription>Total amount pending payment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KSh 1,245,780</div>
                        <div className="text-xs text-muted-foreground mt-1">+12.5% from last month</div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                            <Link href={`/dashboard/${organizationSlug}/accounting/invoices?status=pending`}>View all pending invoices</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium">Revenue This Month</CardTitle>
                        <CardDescription>Total revenue collected</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KSh 3,567,900</div>
                        <div className="text-xs text-muted-foreground mt-1">+8.3% from last month</div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                            <Link href={`/dashboard/${organizationSlug}/accounting/revenue`}>View revenue details</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium">Inventory Value</CardTitle>
                        <CardDescription>Current inventory valuation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KSh 8,932,450</div>
                        <div className="text-xs text-muted-foreground mt-1">Based on FIFO valuation</div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                            <Link href={`/dashboard/${organizationSlug}/accounting/inventory`}>View inventory details</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueMetrics />
                </div>
                <div>
                    <InvoicesSummary />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href={`/dashboard/${organizationSlug}/accounting/invoices`} className="group">
                    <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
                        <CardHeader>
                            <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            <CardTitle className="text-base mt-4">Invoicing</CardTitle>
                            <CardDescription>Create, manage and track invoices</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href={`/dashboard/${organizationSlug}/accounting/revenue`} className="group">
                    <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
                        <CardHeader>
                            <DollarSign className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            <CardTitle className="text-base mt-4">Revenue</CardTitle>
                            <CardDescription>Track sales and revenue performance</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href={`/dashboard/${organizationSlug}/accounting/customers`} className="group">
                    <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
                        <CardHeader>
                            <Users className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            <CardTitle className="text-base mt-4">Customer Accounts</CardTitle>
                            <CardDescription>Manage customer ledgers and credit</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href={`/dashboard/${organizationSlug}/accounting/inventory`} className="group">
                    <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
                        <CardHeader>
                            <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            <CardTitle className="text-base mt-4">Inventory Value</CardTitle>
                            <CardDescription>Track COGS and inventory valuation</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Recent Transactions</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/${organizationSlug}/accounting/transactions`}>View all</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { id: 1, customer: "Nairobi Wholesalers", amount: 245600, date: "Mar 10, 2025", status: "completed" },
                                { id: 2, customer: "Mombasa Distributors", amount: 189300, date: "Mar 8, 2025", status: "completed" },
                                { id: 3, customer: "Kisumu Retailers Ltd", amount: 78500, date: "Mar 7, 2025", status: "pending" },
                                { id: 4, customer: "Nakuru Liquor Store", amount: 42800, date: "Mar 5, 2025", status: "completed" },
                            ].map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-2 h-2 rounded-full ${transaction.status === "completed" ? "bg-green-500" : "bg-amber-500"}`}
                                        />
                                        <div>
                                            <div className="font-medium">{transaction.customer}</div>
                                            <div className="text-sm text-muted-foreground">{transaction.date}</div>
                                        </div>
                                    </div>
                                    <div className="font-medium">KSh {transaction.amount.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Action Items</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/${organizationSlug}/accounting/tasks`}>View all</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                                <div>
                                    <div className="font-medium">5 invoices overdue</div>
                                    <div className="text-sm text-muted-foreground">Total value: KSh 345,600</div>
                                    <Button variant="link" size="sm" className="h-8 px-0 text-xs" asChild>
                                        <Link href={`/dashboard/${organizationSlug}/accounting/invoices?status=overdue`}>Send reminders</Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                                <div>
                                    <div className="font-medium">3 customers approaching credit limit</div>
                                    <div className="text-sm text-muted-foreground">Review credit status</div>
                                    <Button variant="link" size="sm" className="h-8 px-0 text-xs" asChild>
                                        <Link href={`/dashboard/${organizationSlug}/accounting/customers?filter=credit-limit`}>Review customers</Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <CreditCard className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div>
                                    <div className="font-medium">Monthly tax report due</div>
                                    <div className="text-sm text-muted-foreground">Due on March 20, 2025</div>
                                    <Button variant="link" size="sm" className="h-8 px-0 text-xs" asChild>
                                        <Link href={`/dashboard/${organizationSlug}/accounting/taxes`}>Generate report</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}