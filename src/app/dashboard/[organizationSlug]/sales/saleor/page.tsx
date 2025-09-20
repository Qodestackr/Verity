"use client"

import React from "react"

import { useState, useMemo } from "react"
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    getFilteredRowModel,
    type SortingState,
    type ColumnFiltersState,
} from "@tanstack/react-table"
import {
    ArrowUpDown,
    Download,
    FileText,
    Search,
    Calendar,
    Printer,
    RefreshCw,
    BarChart3,
    Wallet,
    TrendingUp,
    ShoppingCart,
    Percent,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Banknote,
    CreditCard,
    Smartphone,
    Layers,
    User,
    Receipt,
} from "lucide-react"
import { format, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"

import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Types
type PaymentMethod = "CASH" | "MPESA" | "CARD" | "BANK_TRANSFER" | "CREDIT" | "SPLIT"
type SaleStatus = "COMPLETED" | "PENDING" | "CANCELLED" | "REFUNDED" | "PARTIALLY_REFUNDED"
type DiscountType = "LOYALTY" | "PROMOTION" | "MANUAL" | "BULK" | "NONE"

interface SaleItem {
    id: string
    productId: string
    productName: string
    category: string
    quantity: number
    unitCostPrice: number
    unitSellingPrice: number
    totalCost: number
    totalPrice: number
    discount: number
    discountType: DiscountType
    profit: number
}

interface Sale {
    id: string
    reference: string
    timestamp: string
    status: SaleStatus
    items: SaleItem[]
    customer: {
        id: string
        name: string
        phone: string
        type: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR"
        isNew: boolean
    }
    paymentMethod: PaymentMethod
    subtotal: number
    discount: number
    tax: number
    total: number
    costOfGoods: number
    profit: number
    profitMargin: number
    location: string
    user: {
        id: string
        name: string
        role: string
        avatar?: string
    }
    notes?: string
}

// Mock data for sales
const mockUsers = [
    { id: "user1", name: "John Kamau", role: "Store Manager", avatar: "" },
    { id: "user2", name: "Mary Wanjiku", role: "Sales Associate", avatar: "" },
    { id: "user3", name: "David Ochieng", role: "Cashier", avatar: "" },
    { id: "user4", name: "Sarah Njeri", role: "Cashier", avatar: "" },
]

const generateMockSales = (): Sale[] => {
    const products = [
        { id: "prod1", name: "Tusker Lager 500ML", category: "Beer", costPrice: 180, sellingPrice: 250 },
        { id: "prod2", name: "Johnnie Walker Black 700ML", category: "Whisky", costPrice: 3500, sellingPrice: 4800 },
        { id: "prod3", name: "Smirnoff Vodka 750ML", category: "Vodka", costPrice: 1400, sellingPrice: 1800 },
        { id: "prod4", name: "Heineken 500ML", category: "Beer", costPrice: 200, sellingPrice: 280 },
        { id: "prod5", name: "Jameson 700ML", category: "Whisky", costPrice: 2800, sellingPrice: 3600 }
    ]

    const customers = [
        { id: "cust1", name: "Walk-in", phone: "", type: "RETAIL", isNew: false },
        { id: "cust2", name: "Online- WhatsApp", phone: "0712345678", type: "WHOLESALE", isNew: false },
        { id: "cust3", name: "Online- Alcora App", phone: "0723456789", type: "WHOLESALE", isNew: false }, // Walk-in Customer
        { id: "cust4", name: "Online- WhatsApp", phone: "0734567890", type: "RETAIL", isNew: true },
        { id: "cust5", name: "Walk-in", phone: "0745678901", type: "WHOLESALE", isNew: false }, //Two Rivers Mall Bar
    ]

    const locations = ["Main Store", "Westlands Branch", "Karen Branch"]
    const paymentMethods: PaymentMethod[] = ["CASH", "MPESA", "CARD", "BANK_TRANSFER", "CREDIT", "SPLIT"]
    const statuses: SaleStatus[] = ["COMPLETED", "PENDING", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"]
    const discountTypes: DiscountType[] = ["LOYALTY", "PROMOTION", "MANUAL", "BULK", "NONE"]

    const sales: Sale[] = []

    // Generate sales for the past 30 days
    for (let i = 0; i < 100; i++) {
        const daysAgo = Math.floor(Math.random() * 30)
        const hoursAgo = Math.floor(Math.random() * 24)
        const minutesAgo = Math.floor(Math.random() * 60)

        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        date.setHours(date.getHours() - hoursAgo)
        date.setMinutes(date.getMinutes() - minutesAgo)

        const customer = customers[Math.floor(Math.random() * customers.length)]
        const user = mockUsers[Math.floor(Math.random() * mockUsers.length)]
        const location = locations[Math.floor(Math.random() * locations.length)]
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
        const status = Math.random() > 0.2 ? "COMPLETED" : statuses[Math.floor(Math.random() * statuses.length)]

        // Generate 1-5 items for this sale
        const itemCount = Math.floor(Math.random() * 5) + 1
        const items: SaleItem[] = []

        let subtotal = 0
        let costOfGoods = 0

        for (let j = 0; j < itemCount; j++) {
            const product = products[Math.floor(Math.random() * products.length)]
            const quantity = Math.floor(Math.random() * 5) + 1
            const discountType =
                Math.random() > 0.7 ? discountTypes[Math.floor(Math.random() * discountTypes.length)] : "NONE"
            const discountPercent = discountType === "NONE" ? 0 : Math.floor(Math.random() * 15) + 5
            const discount = (product.sellingPrice * quantity * discountPercent) / 100

            const totalPrice = product.sellingPrice * quantity - discount
            const totalCost = product.costPrice * quantity
            const profit = totalPrice - totalCost

            items.push({
                id: `item-${i}-${j}`,
                productId: product.id,
                productName: product.name,
                category: product.category,
                quantity,
                unitCostPrice: product.costPrice,
                unitSellingPrice: product.sellingPrice,
                totalCost,
                totalPrice,
                discount,
                discountType,
                profit,
            })

            subtotal += product.sellingPrice * quantity
            costOfGoods += totalCost
        }

        const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0)
        const total = subtotal - totalDiscount
        const tax = Math.round(total * 0.16) // 16% VAT
        const profit = total - costOfGoods
        const profitMargin = (profit / total) * 100

        sales.push({
            id: `sale-${i}`,
            reference: `INV-${String(i).padStart(4, "0")}`,
            timestamp: date.toISOString(),
            status,
            items,
            customer,
            paymentMethod,
            subtotal,
            discount: totalDiscount,
            tax,
            total,
            costOfGoods,
            profit,
            profitMargin,
            location,
            user,
            notes: Math.random() > 0.8 ? "Customer requested delivery" : undefined,
        })
    }

    // Sort by timestamp, newest first
    return sales.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const mockSales = generateMockSales()

// Top products by sales
const getTopProducts = (sales: Sale[]) => {
    const productMap = new Map<
        string,
        { name: string; category: string; quantity: number; revenue: number; profit: number }
    >()

    sales.forEach((sale) => {
        if (sale.status === "COMPLETED" || sale.status === "PARTIALLY_REFUNDED") {
            sale.items.forEach((item) => {
                const existing = productMap.get(item.productId)
                if (existing) {
                    existing.quantity += item.quantity
                    existing.revenue += item.totalPrice
                    existing.profit += item.profit
                } else {
                    productMap.set(item.productId, {
                        name: item.productName,
                        category: item.category,
                        quantity: item.quantity,
                        revenue: item.totalPrice,
                        profit: item.profit,
                    })
                }
            })
        }
    })

    return Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
}

// Payment method breakdown
const getPaymentMethodBreakdown = (sales: Sale[]) => {
    const completedSales = sales.filter((sale) => sale.status === "COMPLETED")
    const total = completedSales.reduce((sum, sale) => sum + sale.total, 0)

    const methodMap = new Map<PaymentMethod, { count: number; amount: number }>()

    completedSales.forEach((sale) => {
        const existing = methodMap.get(sale.paymentMethod)
        if (existing) {
            existing.count += 1
            existing.amount += sale.total
        } else {
            methodMap.set(sale.paymentMethod, { count: 1, amount: sale.total })
        }
    })

    return Array.from(methodMap.entries()).map(([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount,
        percentage: (data.amount / total) * 100,
    }))
}

// Sales columns definition
const columns: ColumnDef<Sale>[] = [
    {
        accessorKey: "timestamp",
        header: ({ column }) => (
            <div className="flex items-center">
                Date
                <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <ArrowUpDown className="h-3 w-3" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("timestamp"))
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{format(date, "MMM dd, yyyy")}</span>
                    <span className="text-muted-foreground text-xs">{format(date, "h:mm a")}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "customer.name",
        header: "Customer",
        cell: ({ row }) => {
            const customer = row.original.customer
            return (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                        <span className="font-medium">{customer.name}</span>
                        {customer.isNew && (
                            <Badge variant="outline" className="text-xs h-4 font-light bg-blue-50 text-blue-600 border-blue-200">
                                New
                            </Badge>
                        )}
                    </div>
                    {customer.phone && <span className="text-muted-foreground text-xs">{customer.phone}</span>}
                </div>
            )
        },
    },
    {
        accessorKey: "total",
        header: ({ column }) => (
            <div className="flex items-center justify-end">
                Amount
                <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <ArrowUpDown className="h-3 w-3" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const amount = Number.parseFloat(row.getValue("total"))
            const formatted = new Intl.NumberFormat("en-KE", {
                style: "currency",
                currency: "KES",
            }).format(amount)

            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "profit",
        header: ({ column }) => (
            <div className="flex items-center justify-end">
                Profit
                <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <ArrowUpDown className="h-3 w-3" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const profit = Number.parseFloat(row.getValue("profit"))
            const formatted = new Intl.NumberFormat("en-KE", {
                style: "currency",
                currency: "KES",
            }).format(profit)

            return (
                <div className="text-right">
                    <span className={profit >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{formatted}</span>
                    <div className="text-xs text-muted-foreground">{row.original.profitMargin.toFixed(1)}% margin</div>
                </div>
            )
        },
    },
    {
        accessorKey: "paymentMethod",
        header: "Payment",
        cell: ({ row }) => {
            const method = row.getValue("paymentMethod") as PaymentMethod

            const methodConfig = {
                CASH: { icon: Banknote, color: "text-green-600 bg-green-50" },
                MPESA: { icon: Smartphone, color: "text-emerald-600 bg-emerald-50" },
                CARD: { icon: CreditCard, color: "text-blue-600 bg-blue-50" },
                BANK_TRANSFER: { icon: Wallet, color: "text-indigo-600 bg-indigo-50" },
                CREDIT: { icon: Clock, color: "text-amber-600 bg-amber-50" },
                SPLIT: { icon: Layers, color: "text-purple-600 bg-purple-50" },
            }

            const { icon: Icon, color } = methodConfig[method]

            return (
                <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-md ${color}`}>
                        <Icon className="h-3 w-3" />
                    </div>
                    <span>{method.replace("_", " ")}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as SaleStatus

            const statusConfig = {
                COMPLETED: { icon: CheckCircle, variant: "success", label: "Completed" },
                PENDING: { icon: Clock, variant: "outline", label: "Pending" },
                CANCELLED: { icon: XCircle, variant: "destructive", label: "Cancelled" },
                REFUNDED: { icon: RefreshCw, variant: "destructive", label: "" },
                PARTIALLY_REFUNDED: { icon: RefreshCw, variant: "outline", label: "" },
            }

            const { icon: Icon, variant, label } = statusConfig[status]

            return (
                <Badge variant={variant as any} className="flex h-4 text-xs font-light items-center gap-1">
                    <Icon className="h-3 w-3" />
                    <span>{label}</span>
                </Badge>
            )
        },
    },
]

export default function SalesAndReports() {
    // State
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 7),
        to: new Date(),
    })
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: "timestamp",
            desc: true,
        },
    ])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [paymentFilter, setPaymentFilter] = useState<string>("ALL")
    const [activeTab, setActiveTab] = useState("sales")
    const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [processingRefund, setProcessingRefund] = useState<string | null>(null)

    // Filter sales based on date range and other filters
    const filteredSales = useMemo(() => {
        return mockSales.filter((sale) => {
            const saleDate = new Date(sale.timestamp)

            // Date range filter
            const dateRangeMatch =
                (!dateRange?.from || saleDate >= dateRange.from) && (!dateRange?.to || saleDate <= dateRange.to)

            // Status filter
            const statusMatch = statusFilter === "ALL" || sale.status === statusFilter

            // Payment method filter
            const paymentMatch = paymentFilter === "ALL" || sale.paymentMethod === paymentFilter

            // Search query
            const searchMatch =
                !searchQuery ||
                sale.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sale.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sale.customer.phone.includes(searchQuery)

            return dateRangeMatch && statusMatch && paymentMatch && searchMatch
        })
    }, [mockSales, dateRange, statusFilter, paymentFilter, searchQuery])

    // Calc summary statistics
    const summary = useMemo(() => {
        const completedSales = filteredSales.filter((sale) => sale.status === "COMPLETED")

        const totalSales = completedSales.length
        const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.total, 0)
        const totalProfit = completedSales.reduce((sum, sale) => sum + sale.profit, 0)
        const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

        return {
            totalSales,
            totalRevenue,
            totalProfit,
            averageOrderValue,
            profitMargin,
        }
    }, [filteredSales])

    const topProducts = useMemo(() => getTopProducts(filteredSales), [filteredSales])

    // Get payment method breakdown
    const paymentBreakdown = useMemo(() => getPaymentMethodBreakdown(filteredSales), [filteredSales])

    const table = useReactTable({
        data: filteredSales,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
    })

    // Toggle expanded sale
    const toggleExpandSale = (saleId: string) => {
        if (expandedSaleId === saleId) {
            setExpandedSaleId(null)
        } else {
            setExpandedSaleId(saleId)
        }
    }

    const handleProcessRefund = (saleId: string) => {
        setProcessingRefund(saleId)
    }

    const cancelRefund = () => {
        setProcessingRefund(null)
    }

    const confirmRefund = () => {
        toast.success("Refund processed", {
            description: "The sale has been refunded successfully",
        })
        setProcessingRefund(null)
    }

    const refreshData = () => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            toast.success("Data refreshed", {
                description: "Sales data has been updated",
            })
        }, 800)
    }

    // Export data
    const exportData = (format: string) => {
        toast.success(`Export started`, {
            description: `Your sales report is being generated as ${format}`,
        })
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
        }).format(amount)
    }

    // Print receipt
    const printReceipt = (saleId: string) => {
        toast.success("Receipt printed", {
            description: "The receipt has been sent to the printer",
        })
    }

    return (
        <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-light">Sales & Reports</h1>
                    <p className="text-xs text-muted-foreground">Track your sales performance and financial metrics</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-8 text-xs">
                                <Calendar className="mr-1 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL d")} - {format(dateRange.to, "LLL d, yyyy")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL d, yyyy")
                                    )
                                ) : (
                                    "Select date range"
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <CalendarComponent
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>

                    <Button variant="outline" size="icon" className="h-8 w-9" onClick={refreshData}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-8 text-xs">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => exportData("CSV")}>
                                <FileText className="mr-2 h-4 w-4" />
                                Export to CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportData("Excel")}>
                                <FileText className="mr-2 h-4 w-4" />
                                Export to Excel
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Report
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                </TabsList>

                <TabsContent value="sales" className="space-y-2">
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        <Card className="p-1 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20 border-green-200 dark:border-green-800">
                            <CardContent className="p-1.5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-green-800 dark:text-green-400">Total Revenue</p>
                                        <h3 className="text-lg font-normal text-green-700 dark:text-green-300">
                                            {formatCurrency(summary.totalRevenue)}
                                        </h3>
                                        <p className="text-sm text-green-600 dark:text-green-400">{summary.totalSales} sales</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                                        <Wallet className="h-4 w-4 text-green-700 dark:text-green-300" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="p-1 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-1.5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-400">Total Profit</p>
                                        <h3 className="text-lg font-normal text-blue-700 dark:text-blue-300">
                                            {formatCurrency(summary.totalProfit)}
                                        </h3>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                            {summary.profitMargin.toFixed(1)}% margin
                                        </p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                                        <TrendingUp className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="p-1 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
                            <CardContent className="p-1.5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Avg Order</p>
                                        <h3 className="text-lg font-normal text-amber-700 dark:text-amber-300">
                                            {formatCurrency(summary.averageOrderValue)}
                                        </h3>
                                        <p className="text-sm text-amber-600 dark:text-amber-400">Per transaction</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                                        <ShoppingCart className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="p-1 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                            <CardContent className="p-1.5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-purple-800 dark:text-purple-400">Loyalty Impact</p>
                                        <h3 className="text-lg font-normal text-purple-700 dark:text-purple-300">
                                            {formatCurrency(filteredSales.reduce((sum, sale) => sum + sale.discount, 0))}
                                        </h3>
                                        <p className="text-sm text-purple-600 dark:text-purple-400">Total discounts</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                                        <Percent className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="border-0 shadow-md">
                        <CardHeader className="pb-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <CardTitle className="font-light">Sales Transactions</CardTitle>
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative w-full md:w-auto">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search customers, references..."
                                            className="pl-9 h-9 w-full md:w-[200px]"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="h-9 w-[180px]">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Statuses</SelectItem>
                                            <SelectItem value="COMPLETED">Completed</SelectItem>
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            <SelectItem value="REFUNDED">Refunded</SelectItem>
                                            <SelectItem value="PARTIALLY_REFUNDED">Partially Refunded</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                                        <SelectTrigger className="h-9 w-[180px]">
                                            <SelectValue placeholder="Filter by payment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Payment Methods</SelectItem>
                                            <SelectItem value="CASH">Cash</SelectItem>
                                            <SelectItem value="MPESA">M-Pesa</SelectItem>
                                            <SelectItem value="CARD">Card</SelectItem>
                                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                            <SelectItem value="CREDIT">Credit</SelectItem>
                                            <SelectItem value="SPLIT">Split Payment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map((header) => (
                                                    <TableHead key={header.id}>
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            Array.from({ length: 5 }).map((_, index) => (
                                                <TableRow key={index} className="animate-pulse">
                                                    <TableCell>
                                                        <Skeleton className="h-4 w-24" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4 w-32" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4 w-20" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4 w-20" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4 w-16" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4 w-16" />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : table.getRowModel().rows?.length ? (
                                            <>
                                                {table.getRowModel().rows.map((row) => (
                                                    <React.Fragment key={row.id}>
                                                        <TableRow
                                                            className={`cursor-pointer hover:bg-muted/50 ${expandedSaleId === row.original.id ? "bg-muted/50" : ""
                                                                }`}
                                                            onClick={() => toggleExpandSale(row.original.id)}
                                                        >
                                                            {row.getVisibleCells().map((cell) => (
                                                                <TableCell key={cell.id}>
                                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>

                                                        {/* Expanded Sale Details */}
                                                        {expandedSaleId === row.original.id && (
                                                            <TableRow>
                                                                <TableCell colSpan={columns.length} className="p-0 border-t-0">
                                                                    <div className="bg-muted/30 p-4 space-y-4">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                <Receipt className="h-4 w-4 text-muted-foreground" />
                                                                                <span className="font-medium">Invoice: {row.original.reference}</span>
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation()
                                                                                        printReceipt(row.original.id)
                                                                                    }}
                                                                                >
                                                                                    <Printer className="h-3.5 w-3.5 mr-1" />
                                                                                    Print Receipt
                                                                                </Button>
                                                                                {/* {(row.original.status === "COMPLETED" || row.original.status === "PENDING") && (
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation()
                                                                                            handleProcessRefund(row.original.id)
                                                                                        }}
                                                                                    >
                                                                                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                                                                        Process Refund
                                                                                    </Button>
                                                                                )} */}
                                                                            </div>
                                                                        </div>

                                                                        <Accordion type="single" collapsible className="w-full">
                                                                            <AccordionItem value="customer-info">
                                                                                <AccordionTrigger className="py-2 text-sm">
                                                                                    Customer & Payment Information
                                                                                </AccordionTrigger>
                                                                                <AccordionContent>
                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                        <div>
                                                                                            <h4 className="text-sm font-medium mb-1">Customer</h4>
                                                                                            <div className="p-2.5 border rounded-md">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <p className="font-medium">{row.original.customer.name}</p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div>
                                                                                            <h4 className="text-sm font-medium mb-1">Payment</h4>
                                                                                            <div className="p-3 border rounded-md">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    {row.original.paymentMethod === "CASH" && (
                                                                                                        <Banknote className="h-4 w-4 text-green-600" />
                                                                                                    )}
                                                                                                    {row.original.paymentMethod === "MPESA" && (
                                                                                                        <Smartphone className="h-4 w-4 text-emerald-600" />
                                                                                                    )}
                                                                                                    {row.original.paymentMethod === "CARD" && (
                                                                                                        <CreditCard className="h-4 w-4 text-blue-600" />
                                                                                                    )}
                                                                                                    {row.original.paymentMethod === "BANK_TRANSFER" && (
                                                                                                        <Wallet className="h-4 w-4 text-indigo-600" />
                                                                                                    )}
                                                                                                    {row.original.paymentMethod === "CREDIT" && (
                                                                                                        <Clock className="h-4 w-4 text-amber-600" />
                                                                                                    )}
                                                                                                    {row.original.paymentMethod === "SPLIT" && (
                                                                                                        <Layers className="h-4 w-4 text-purple-600" />
                                                                                                    )}
                                                                                                    <p className="font-medium">
                                                                                                        {row.original.paymentMethod.replace("_", " ")}
                                                                                                    </p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </AccordionContent>
                                                                            </AccordionItem>

                                                                            <AccordionItem value="items">
                                                                                <AccordionTrigger className="py-2 text-sm">
                                                                                    Items ({row.original.items.length})
                                                                                </AccordionTrigger>
                                                                                <AccordionContent>
                                                                                    <div className="border rounded-md overflow-hidden">
                                                                                        <Table>
                                                                                            <TableHeader>
                                                                                                <TableRow>
                                                                                                    <TableHead>Product</TableHead>
                                                                                                    <TableHead className="text-right">Quantity</TableHead>
                                                                                                    <TableHead className="text-right">Unit Price</TableHead>
                                                                                                    <TableHead className="text-right">Discount</TableHead>
                                                                                                    <TableHead className="text-right">Total</TableHead>
                                                                                                </TableRow>
                                                                                            </TableHeader>
                                                                                            <TableBody>
                                                                                                {row.original.items.map((item) => (
                                                                                                    <TableRow key={item.id}>
                                                                                                        <TableCell>
                                                                                                            <div>
                                                                                                                <p className="font-medium">{item.productName}</p>
                                                                                                                <p className="text-xs text-muted-foreground">{item.category}</p>
                                                                                                            </div>
                                                                                                        </TableCell>
                                                                                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                                                                                        <TableCell className="text-right">
                                                                                                            {formatCurrency(item.unitSellingPrice)}
                                                                                                        </TableCell>
                                                                                                        <TableCell className="text-right">
                                                                                                            {item.discount > 0 ? (
                                                                                                                <div>
                                                                                                                    <span className="text-red-600">
                                                                                                                        -{formatCurrency(item.discount)}
                                                                                                                    </span>
                                                                                                                    {item.discountType !== "NONE" && (
                                                                                                                        <Badge
                                                                                                                            variant="outline"
                                                                                                                            className="ml-1 font-light h-4 text-xs"
                                                                                                                        >
                                                                                                                            {item.discountType}
                                                                                                                        </Badge>
                                                                                                                    )}
                                                                                                                </div>
                                                                                                            ) : (
                                                                                                                "-"
                                                                                                            )}
                                                                                                        </TableCell>
                                                                                                        <TableCell className="text-right font-medium">
                                                                                                            {formatCurrency(item.totalPrice)}
                                                                                                        </TableCell>
                                                                                                    </TableRow>
                                                                                                ))}
                                                                                            </TableBody>
                                                                                        </Table>
                                                                                    </div>
                                                                                </AccordionContent>
                                                                            </AccordionItem>

                                                                            <AccordionItem value="summary">
                                                                                <AccordionTrigger className="py-2 text-sm">Sale Summary</AccordionTrigger>
                                                                                <AccordionContent>
                                                                                    <div className="border rounded-md p-3">
                                                                                        <div className="space-y-2">
                                                                                            <div className="flex justify-between text-sm">
                                                                                                <span className="text-muted-foreground">Subtotal:</span>
                                                                                                <span>{formatCurrency(row.original.subtotal)}</span>
                                                                                            </div>
                                                                                            <div className="flex justify-between text-sm">
                                                                                                <span className="text-muted-foreground">Discount:</span>
                                                                                                <span className="text-red-600">
                                                                                                    -{formatCurrency(row.original.discount)}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="flex justify-between text-sm">
                                                                                                <span className="text-muted-foreground">Tax (16%):</span>
                                                                                                <span>{formatCurrency(row.original.tax)}</span>
                                                                                            </div>
                                                                                            <Separator />
                                                                                            <div className="flex justify-between font-medium">
                                                                                                <span>Total:</span>
                                                                                                <span>{formatCurrency(row.original.total)}</span>
                                                                                            </div>
                                                                                            <div className="flex justify-between text-sm pt-2 mt-2 border-t">
                                                                                                <span className="text-muted-foreground">Cost of Goods:</span>
                                                                                                <span>{formatCurrency(row.original.costOfGoods)}</span>
                                                                                            </div>
                                                                                            <div className="flex justify-between text-green-600 font-medium">
                                                                                                <span>Profit:</span>
                                                                                                <span>
                                                                                                    {formatCurrency(row.original.profit)} (
                                                                                                    {row.original.profitMargin.toFixed(1)}%)
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </AccordionContent>
                                                                            </AccordionItem>

                                                                            <AccordionItem value="additional-info">
                                                                                <AccordionTrigger className="py-2 text-sm">
                                                                                    Additional Information
                                                                                </AccordionTrigger>
                                                                                <AccordionContent>
                                                                                    <div className="border rounded-md p-3">
                                                                                        <div className="space-y-2">
                                                                                            <div className="flex justify-between text-sm">
                                                                                                <span className="text-muted-foreground">Location:</span>
                                                                                                <span>{row.original.location}</span>
                                                                                            </div>
                                                                                            <div className="flex justify-between text-sm">
                                                                                                <span className="text-muted-foreground">Cashier:</span>
                                                                                                <span>{row.original.user.name}</span>
                                                                                            </div>
                                                                                            {row.original.notes && (
                                                                                                <div className="pt-2 mt-2 border-t">
                                                                                                    <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                                                                                                    <p className="text-sm">{row.original.notes}</p>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </AccordionContent>
                                                                            </AccordionItem>
                                                                        </Accordion>
                                                                        {/* {processingRefund === row.original.id && (
                                                                            <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-md">
                                                                                <h4 className="font-medium text-red-700 mb-2">Process Refund</h4>
                                                                                <p className="text-sm text-red-600 mb-4">
                                                                                    Are you sure you want to refund this sale? This action cannot be undone.
                                                                                </p>
                                                                                <div className="flex justify-end gap-2">
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation()
                                                                                            cancelRefund()
                                                                                        }}
                                                                                    >
                                                                                        Cancel
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="destructive"
                                                                                        size="sm"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation()
                                                                                            confirmRefund()
                                                                                        }}
                                                                                    >
                                                                                        Confirm Refund
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        )} */}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </>
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                                                        <p className="text-muted-foreground">No sales found</p>
                                                        <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex items-center justify-end space-x-2 p-4">
                                <div className="flex-1 text-sm text-muted-foreground">
                                    Showing {table.getRowModel().rows.length} of {filteredSales.length} sales
                                </div>
                                <div className="space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-0 shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Payment Methods</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex flex-wrap gap-2">
                                    {paymentBreakdown.map((item) => {
                                        // Define colors for each payment method
                                        const methodConfig = {
                                            CASH: {
                                                bgColor: "bg-green-100",
                                                textColor: "text-green-700",
                                                borderColor: "border-green-200",
                                                fillColor: "fill-green-500",
                                            },
                                            MPESA: {
                                                bgColor: "bg-emerald-100",
                                                textColor: "text-emerald-700",
                                                borderColor: "border-emerald-200",
                                                fillColor: "fill-emerald-500",
                                            },
                                            CARD: {
                                                bgColor: "bg-blue-100",
                                                textColor: "text-blue-700",
                                                borderColor: "border-blue-200",
                                                fillColor: "fill-blue-500",
                                            },
                                            BANK_TRANSFER: {
                                                bgColor: "bg-indigo-100",
                                                textColor: "text-indigo-700",
                                                borderColor: "border-indigo-200",
                                                fillColor: "fill-indigo-500",
                                            },
                                            CREDIT: {
                                                bgColor: "bg-amber-100",
                                                textColor: "text-amber-700",
                                                borderColor: "border-amber-200",
                                                fillColor: "fill-amber-500",
                                            },
                                            SPLIT: {
                                                bgColor: "bg-purple-100",
                                                textColor: "text-purple-700",
                                                borderColor: "border-purple-200",
                                                fillColor: "fill-purple-500",
                                            },
                                        }

                                        const { bgColor, textColor, borderColor, fillColor } = methodConfig[item.method]

                                        return (
                                            <div
                                                key={item.method}
                                                className={`relative flex-1 min-w-[140px] rounded-lg ${bgColor} ${borderColor} border p-3`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-1.5">
                                                        {item.method === "CASH" && <Banknote className={`h-3.5 w-3.5 ${textColor}`} />}
                                                        {item.method === "MPESA" && <Smartphone className={`h-3.5 w-3.5 ${textColor}`} />}
                                                        {item.method === "CARD" && <CreditCard className={`h-3.5 w-3.5 ${textColor}`} />}
                                                        {item.method === "BANK_TRANSFER" && <Wallet className={`h-3.5 w-3.5 ${textColor}`} />}
                                                        {item.method === "CREDIT" && <Clock className={`h-3.5 w-3.5 ${textColor}`} />}
                                                        {item.method === "SPLIT" && <Layers className={`h-3.5 w-3.5 ${textColor}`} />}
                                                        <span className={`text-xs font-medium ${textColor}`}>{item.method.replace("_", " ")}</span>
                                                    </div>
                                                    <span className={`text-xs font-medium ${textColor}`}>{item.percentage.toFixed(1)}%</span>
                                                </div>

                                                <div className="font-medium text-sm">{formatCurrency(item.amount)}</div>
                                                <div className="text-xs opacity-70">{item.count} sales</div>

                                                {/* Circular progress indicator */}
                                                <div className="absolute top-3 right-3 w-8 h-8">
                                                    <svg width="32" height="32" viewBox="0 0 32 32">
                                                        <circle
                                                            cx="16"
                                                            cy="16"
                                                            r="12"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeOpacity="0.2"
                                                            className={textColor}
                                                        />
                                                        <circle
                                                            cx="16"
                                                            cy="16"
                                                            r="12"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeDasharray={`${(2 * Math.PI * 12 * item.percentage) / 100} ${2 * Math.PI * 12}`}
                                                            strokeDashoffset="0"
                                                            className={textColor}
                                                            transform="rotate(-90 16 16)"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Products Card */}
                        <Card className="border-0 shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Top Selling Products</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid grid-cols-1 gap-2">
                                    {topProducts.map((product, index) => {
                                        // Calculate percentage of total revenue
                                        const totalRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0)
                                        const percentage = (product.revenue / totalRevenue) * 100

                                        // Different colors for different products
                                        const colors = [
                                            { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
                                            { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
                                            { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
                                            { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
                                            { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
                                        ]

                                        const { bg, text, border } = colors[index % colors.length]

                                        return (
                                            <div key={index} className={`relative rounded-lg ${bg} ${border} border p-3`}>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className={`flex items-center justify-center w-5 h-5 rounded-full ${text} bg-white text-xs font-medium`}
                                                            >
                                                                {index + 1}
                                                            </div>
                                                            <h4 className="font-medium text-sm truncate">{product.name}</h4>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <div className="text-xs opacity-70">{product.category}</div>
                                                            <div className="text-xs opacity-70">{product.quantity} units</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <div className="font-medium text-sm">{formatCurrency(product.revenue)}</div>
                                                        <div className={`text-xs ${product.profit > 0 ? "text-green-600" : "text-red-600"}`}>
                                                            {formatCurrency(product.profit)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="mt-2 w-full bg-white/50 rounded-full h-1.5 overflow-hidden">
                                                    <div className={`h-full ${text.replace("text", "bg")}`} style={{ width: `${percentage}%` }} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="products">
                    <Card className="border-0 shadow-md">
                        <CardHeader className="flex flex-col justify-center items-center">
                            <CardTitle>Product Performance</CardTitle>
                            <CardDescription>Detailed analysis of your product sales and profitability</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">Product Analytics</h3>
                                    <p className="text-muted-foreground mt-2">Detailed product performance metrics will appear here</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="customers">
                    <Card className="border-0 shadow-md">
                        <CardHeader className="flex flex-col justify-center items-center">
                            <CardTitle>Customer Insights</CardTitle>
                            <CardDescription>Understand your customer behavior and purchasing patterns</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">Customer Analytics</h3>
                                    <p className="text-muted-foreground mt-2">Detailed customer insights will appear here</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
