"use client"

import { useState } from "react"
import {
    Calendar,
    Download,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    Smartphone,
    Banknote,
    ShoppingBag,
    Package,
    BadgeDollarSign,
    ChevronRight,
    ChevronDown,
    Search
} from "lucide-react"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts"
import React from "react"

// Types
interface Transaction {
    id: string
    timestamp: string
    type: "SALE" | "PURCHASE" | "EXPENSE" | "OTHER"
    category: string
    amount: number
    paymentMethod: "CASH" | "MPESA" | "CARD"
    reference: string
    notes?: string
    items?: TransactionItem[]
}

interface TransactionItem {
    id: string
    productId: string
    productName: string
    category: string
    quantity: number
    unitPrice: number
    total: number
}

// Mock data for the report
const MOCK_DATE = "2025-03-21"

const mockTransactions: Transaction[] = [
    {
        id: "tr_1",
        timestamp: `${MOCK_DATE}T09:15:00Z`,
        type: "SALE",
        category: "POS Sale",
        amount: 1250,
        paymentMethod: "CASH",
        reference: "ORD-2103-001",
        items: [
            {
                id: "item_1",
                productId: "prod_1",
                productName: "Tusker Lager",
                category: "Beer",
                quantity: 5,
                unitPrice: 250,
                total: 1250
            }
        ]
    },
    {
        id: "tr_2",
        timestamp: `${MOCK_DATE}T10:30:00Z`,
        type: "PURCHASE",
        category: "Stock Purchase",
        amount: -25440,
        paymentMethod: "MPESA",
        reference: "PO-2503-001",
        notes: "Restocking from supplier",
        items: [
            {
                id: "item_2_1",
                productId: "prod_1",
                productName: "Tusker Lager",
                category: "Beer",
                quantity: 48,
                unitPrice: 180,
                total: 8640
            },
            {
                id: "item_2_2",
                productId: "prod_2",
                productName: "Johnnie Walker Black",
                category: "Whisky",
                quantity: 6,
                unitPrice: 2800,
                total: 16800
            }
        ]
    },
    {
        id: "tr_3",
        timestamp: `${MOCK_DATE}T11:45:00Z`,
        type: "EXPENSE",
        category: "Utilities",
        amount: -2500,
        paymentMethod: "MPESA",
        reference: "EXP-210325-1",
        notes: "Electricity bill"
    },
    {
        id: "tr_4",
        timestamp: `${MOCK_DATE}T13:20:00Z`,
        type: "SALE",
        category: "POS Sale",
        amount: 3500,
        paymentMethod: "CARD",
        reference: "ORD-2103-005",
        items: [
            {
                id: "item_4",
                productId: "prod_2",
                productName: "Johnnie Walker Black",
                category: "Whisky",
                quantity: 1,
                unitPrice: 3500,
                total: 3500
            }
        ]
    },
    {
        id: "tr_5",
        timestamp: `${MOCK_DATE}T14:30:00Z`,
        type: "EXPENSE",
        category: "Transport",
        amount: -800,
        paymentMethod: "CASH",
        reference: "EXP-210325-2",
        notes: "Fuel for delivery"
    },
    {
        id: "tr_6",
        timestamp: `${MOCK_DATE}T16:15:00Z`,
        type: "SALE",
        category: "POS Sale",
        amount: 5700,
        paymentMethod: "MPESA",
        reference: "ORD-2103-008",
        items: [
            {
                id: "item_6_1",
                productId: "prod_1",
                productName: "Tusker Lager",
                category: "Beer",
                quantity: 12,
                unitPrice: 250,
                total: 3000
            },
            {
                id: "item_6_2",
                productId: "prod_3",
                productName: "Gilbey's Gin",
                category: "Gin",
                quantity: 2,
                unitPrice: 1350,
                total: 2700
            }
        ]
    },
    {
        id: "tr_7",
        timestamp: `${MOCK_DATE}T17:00:00Z`,
        type: "EXPENSE",
        category: "Wages",
        amount: -1500,
        paymentMethod: "CASH",
        reference: "EXP-210325-3",
        notes: "Daily wage for part-time staff"
    },
    {
        id: "tr_8",
        timestamp: `${MOCK_DATE}T18:30:00Z`,
        type: "SALE",
        category: "POS Sale",
        amount: 9200,
        paymentMethod: "MPESA",
        reference: "ORD-2103-012",
        items: [
            {
                id: "item_8_1",
                productId: "prod_1",
                productName: "Tusker Lager",
                category: "Beer",
                quantity: 8,
                unitPrice: 250,
                total: 2000
            },
            {
                id: "item_8_2",
                productId: "prod_2",
                productName: "Johnnie Walker Black",
                category: "Whisky",
                quantity: 2,
                unitPrice: 3500,
                total: 7000
            },
            {
                id: "item_8_3",
                productId: "prod_4",
                productName: "White Cap",
                category: "Beer",
                quantity: 1,
                unitPrice: 200,
                total: 200
            }
        ]
    }
]

export default function DailyCashFlowPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date(MOCK_DATE))
    const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null)
    const [filter, setFilter] = useState<string>("")
    const [typeFilter, setTypeFilter] = useState<string>("ALL")

    // Filter transactions
    const filteredTransactions = mockTransactions.filter(tx => {
        // Text search
        const textMatch = filter === "" ||
            tx.reference.toLowerCase().includes(filter.toLowerCase()) ||
            tx.notes?.toLowerCase().includes(filter.toLowerCase()) ||
            tx.items?.some(item => item.productName.toLowerCase().includes(filter.toLowerCase()))

        // Type filter
        const typeMatch = typeFilter === "ALL" || tx.type === typeFilter

        return textMatch && typeMatch
    })

    // Calc summary statistics
    const calculateSummary = () => {
        // Initialize values
        let totalIncome = 0
        let totalExpense = 0
        let cashIncome = 0
        let mpesaIncome = 0
        let cardIncome = 0
        let cashExpense = 0
        let mpesaExpense = 0
        let cardExpense = 0

        // Process each transaction
        filteredTransactions.forEach(tx => {
            if (tx.amount > 0) {
                totalIncome += tx.amount
                if (tx.paymentMethod === "CASH") cashIncome += tx.amount
                if (tx.paymentMethod === "MPESA") mpesaIncome += tx.amount
                if (tx.paymentMethod === "CARD") cardIncome += tx.amount
            } else {
                totalExpense += Math.abs(tx.amount)
                if (tx.paymentMethod === "CASH") cashExpense += Math.abs(tx.amount)
                if (tx.paymentMethod === "MPESA") mpesaExpense += Math.abs(tx.amount)
                if (tx.paymentMethod === "CARD") cardExpense += Math.abs(tx.amount)
            }
        })

        return {
            totalIncome,
            totalExpense,
            netCashFlow: totalIncome - totalExpense,
            cashIncome,
            mpesaIncome,
            cardIncome,
            cashExpense,
            mpesaExpense,
            cardExpense,
            cashNet: cashIncome - cashExpense,
            mpesaNet: mpesaIncome - mpesaExpense,
            cardNet: cardIncome - cardExpense
        }
    }

    const summary = calculateSummary()

    // Data for payment method charts
    const paymentMethodData = [
        { name: 'Cash', income: summary.cashIncome, expense: summary.cashExpense },
        { name: 'M-Pesa', income: summary.mpesaIncome, expense: summary.mpesaExpense },
        { name: 'Card', income: summary.cardIncome, expense: summary.cardExpense }
    ]

    // Data for transaction type pie chart
    const getPieChartData = () => {
        const typeMap = new Map<string, number>()

        // Count by transaction type
        filteredTransactions.forEach(tx => {
            if (tx.amount > 0) { // Income only
                const category = tx.category
                typeMap.set(category, (typeMap.get(category) || 0) + tx.amount)
            }
        })

        // Convert to array
        return Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }))
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

    return (
        <div className="max-w-4xl mx-auto py-3 space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-light">Daily Cash Flow</h1>
                    <p className="text-muted-foreground">
                        Financial snapshot of your business day
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                <Calendar className="mr-2 h-4 w-4" />
                                {format(selectedDate, "MMMM d, yyyy")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            {/* Calendar component would go here */}
                            <div className="p-4">
                                <p className="text-center text-sm text-muted-foreground">
                                    This is a demo with fixed data for March 21, 2025
                                </p>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Card className="flex flex-col justify-center items-center">
                    <div>
                        <CardTitle>Cash In</CardTitle>
                        <CardDescription>Total revenue for the day</CardDescription>
                    </div>
                    <CardContent>
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                <ArrowUpRight className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-lg font-normal text-green-600">
                                    {summary.totalIncome.toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    From {filteredTransactions.filter(tx => tx.amount > 0).length} transactions
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col justify-center items-center">
                    <div>
                        <CardTitle>Cash Out</CardTitle>
                        <CardDescription>Total expenses for the day</CardDescription>
                    </div>
                    <CardContent>
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-2">
                                <ArrowDownRight className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-lg font-normal text-red-600">
                                    {summary.totalExpense.toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    From {filteredTransactions.filter(tx => tx.amount < 0).length} transactions
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col justify-center items-center">
                    <div>
                        <CardTitle>Net Cash Flow</CardTitle>
                        <CardDescription>Daily bottom line</CardDescription>
                    </div>
                    <CardContent>
                        <div className="flex items-center">
                            <div className={`h-10 w-10 rounded-full ${summary.netCashFlow >= 0 ? 'bg-blue-100' : 'bg-amber-100'} flex items-center justify-center mr-2`}>
                                <Wallet className={`h-6 w-6 ${summary.netCashFlow >= 0 ? 'text-blue-600' : 'text-amber-600'}`} />
                            </div>
                            <div>
                                <p className={`text-lg font-normal ${summary.netCashFlow >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                                    {Math.abs(summary.netCashFlow).toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {summary.netCashFlow >= 0 ? 'Net Positive' : 'Net Negative'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Method Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Method Breakdown</CardTitle>
                    <CardDescription>Cash flow by payment method</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                        <div className="lg:col-span-3 h-[300px]">
                            <ResponsiveContainer className='text-xs' width="100%" height="100%">
                                <BarChart
                                    data={paymentMethodData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `{formatCurrency(value)}`} />
                                    <Legend />
                                    <Bar dataKey="income" name="Cash In" fill="#10b981" />
                                    <Bar dataKey="expense" name="Cash Out" fill="#ef4444" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center p-2 border rounded-md">
                                <Banknote className="h-8 w-8 text-green-600 mr-3" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Cash Balance</p>
                                    <p className={`text-sm font-normal ${summary.cashNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {summary.cashNet >= 0 ? '+' : '-'} {Math.abs(summary.cashNet).toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <span>In: {summary.cashIncome.toLocaleString()}</span>
                                        <span>Out: {summary.cashExpense.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center p-2 border rounded-md">
                                <Smartphone className="h-8 w-8 text-indigo-600 mr-3" />
                                <div>
                                    <p className="text-sm text-muted-foreground">M-Pesa Balance</p>
                                    <p className={`text-sm font-normal ${summary.mpesaNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {summary.mpesaNet >= 0 ? '+' : '-'}{Math.abs(summary.mpesaNet).toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <span>In: {summary.mpesaIncome.toLocaleString()}</span>
                                        <span>Out: {summary.mpesaExpense.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center p-2 border rounded-md">
                                <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Card Balance</p>
                                    <p className={`text-sm font-normal ${summary.cardNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {summary.cardNet >= 0 ? '+' : '-'}{Math.abs(summary.cardNet).toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <span>In:  {summary.cardIncome.toLocaleString()}</span>
                                        <span>Out:  {summary.cardExpense.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Income Sources */}
            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle>Income Sources</CardTitle>
                    <CardDescription>Breakdown of today's revenue</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer className='text-xs' width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={getPieChartData()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {getPieChartData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => `KSh ${Number(value).toLocaleString()}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Top Selling Items</h3>

                                {/* Get top selling items */}
                                {(() => {
                                    // Extract all items from transactions
                                    const allItems: TransactionItem[] = []
                                    filteredTransactions.forEach(tx => {
                                        if (tx.items && tx.amount > 0) {
                                            allItems.push(...tx.items)
                                        }
                                    })

                                    // Group by product and sum quantities
                                    const productMap = new Map<string, { name: string, category: string, quantity: number, total: number }>()
                                    allItems.forEach(item => {
                                        const existing = productMap.get(item.productId)
                                        if (existing) {
                                            existing.quantity += item.quantity
                                            existing.total += item.total
                                        } else {
                                            productMap.set(item.productId, {
                                                name: item.productName,
                                                category: item.category,
                                                quantity: item.quantity,
                                                total: item.total
                                            })
                                        }
                                    })

                                    // Convert to array and sort by total
                                    const topProducts = Array.from(productMap.values())
                                        .sort((a, b) => b.total - a.total)
                                        .slice(0, 5)

                                    return (
                                        <div className="space-y-2">
                                            {topProducts.map((product, index) => (
                                                <div key={index} className="flex items-center p-2 border rounded-md">
                                                    <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center mr-3 text-sm font-medium">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <p className="font-medium">{product.name}</p>
                                                                <p className="text-xs text-muted-foreground">{product.category}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold"> {product.total.toLocaleString()}</p>
                                                                <p className="text-xs text-muted-foreground">{product.quantity} units</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* Transaction List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Transactions</CardTitle>
                            <CardDescription>
                                Complete list of today&apos;s financial activities
                            </CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative w-60">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search transactions..."
                                    className="pl-10"
                                    value={filter}
                                    onChange={e => setFilter(e.target.value)}
                                />
                            </div>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Types</SelectItem>
                                    <SelectItem value="SALE">Sales</SelectItem>
                                    <SelectItem value="PURCHASE">Purchases</SelectItem>
                                    <SelectItem value="EXPENSE">Expenses</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="relative overflow-x-auto border rounded-md">
                        <table className="w-full text-xs">
                            <thead className="text-xs uppercase bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left w-[12%]">Time</th>
                                    <th className="px-4 py-3 text-left w-[18%]">Type</th>
                                    <th className="px-4 py-3 text-left w-[25%]">Reference</th>
                                    <th className="px-4 py-3 text-left w-[15%]">Payment</th>
                                    <th className="px-4 py-3 text-right w-[20%]">Amount</th>
                                    <th className="px-4 py-3 text-right w-[10%]">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredTransactions.map(tx => (
                                    <React.Fragment key={tx.id}>
                                        {/* Main Transaction Row */}
                                        <tr
                                            className={`hover:bg-muted/30 cursor-pointer transition-colors ${expandedTransaction === tx.id ? 'bg-muted/20' : ''}`}
                                            onClick={() => setExpandedTransaction(expandedTransaction === tx.id ? null : tx.id)}
                                        >
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                {format(new Date(tx.timestamp), "hh:mm a")}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    {tx.type === "SALE" && (
                                                        <ShoppingBag className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                                    )}
                                                    {tx.type === "PURCHASE" && (
                                                        <Package className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                                                    )}
                                                    {tx.type === "EXPENSE" && (
                                                        <BadgeDollarSign className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
                                                    )}
                                                    <span className="truncate">{tx.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 truncate">{tx.reference}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    {tx.paymentMethod === "CASH" && (
                                                        <Banknote className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                                    )}
                                                    {tx.paymentMethod === "MPESA" && (
                                                        <Smartphone className="h-4 w-4 text-indigo-600 mr-2 flex-shrink-0" />
                                                    )}
                                                    {tx.paymentMethod === "CARD" && (
                                                        <CreditCard className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                                                    )}
                                                    <span>{tx.paymentMethod}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                                                <span className={tx.amount >= 0 ? "text-green-600" : "text-red-600"}>
                                                    {tx.amount >= 0 ? "+" : "-"} {Math.abs(tx.amount).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {expandedTransaction === tx.id ? (
                                                    <ChevronDown className="h-4 w-4 ml-auto inline-block" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 ml-auto inline-block" />
                                                )}
                                            </td>
                                        </tr>

                                        {/* Expanded Details Row - Only visible when expanded */}
                                        {expandedTransaction === tx.id && (
                                            <tr className="bg-muted/10">
                                                <td colSpan={6} className="p-0">
                                                    <div className="px-4 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                        {tx.notes && (
                                                            <div className="mb-3">
                                                                <p className="text-sm font-medium">Notes:</p>
                                                                <p className="text-sm text-muted-foreground">{tx.notes}</p>
                                                            </div>
                                                        )}

                                                        {tx.items && tx.items.length > 0 && (
                                                            <div>
                                                                <p className="text-sm font-medium mb-2">Items:</p>
                                                                <div className="overflow-x-auto rounded-md border">
                                                                    <table className="w-full">
                                                                        <thead className="bg-muted/30 text-xs">
                                                                            <tr>
                                                                                <th className="px-3 py-2 text-left">Product</th>
                                                                                <th className="px-3 py-2 text-right">Quantity</th>
                                                                                <th className="px-3 py-2 text-right">Unit Price</th>
                                                                                <th className="px-3 py-2 text-right">Total</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y">
                                                                            {tx.items.map(item => (
                                                                                <tr key={item.id} className="hover:bg-muted/20">
                                                                                    <td className="px-3 py-2">
                                                                                        <div>
                                                                                            <p>{item.productName}</p>
                                                                                            <p className="text-xs text-muted-foreground">{item.category}</p>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                                                                                    <td className="px-3 py-2 text-right"> {item.unitPrice.toLocaleString()}</td>
                                                                                    <td className="px-3 py-2 text-right font-medium"> {item.total.toLocaleString()}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}