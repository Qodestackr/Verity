"use client"

import { useState, useEffect, useCallback } from "react"
import { format, subDays } from "date-fns"
import {
    Calendar,
    RefreshCw,
    TrendingUp,
    Wallet,
    BarChart3,
    ArrowUpDown,
    Percent,
    Search,
    Download,
    FileText,
    Printer,
    AlertCircle,
    Loader2,
} from "lucide-react"

import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { DateRange } from "react-day-picker"
import { APP_BASE_API_URL } from "@/config/urls"

// Types based on your actual API response
interface OrderItem {
    id: string
    productId: string
    quantity: number
    unitPrice: number
    totalPrice: number
    discount: number
}

interface Order {
    id: string
    orderNumber: string
    customerId: string | null
    customer?: {
        name: string
        phone: string
    }
    status: string
    totalAmount: number
    finalAmount: number
    paymentMethod: string
    paymentStatus: string
    orderDate: string
    items: OrderItem[]
}

interface ApiResponse {
    orders: Order[]
    pagination: {
        total: number
        pages: number
        page: number
        limit: number
    }
}

interface ProductSummary {
    productId: string
    name: string
    category: string
    quantity: number
    revenue: number
    profit: number
    profitMargin: number
}

interface SalesSummary {
    totalRevenue: number
    totalProfit: number
    totalQuantity: number
    averageOrderValue: number
    profitMargin: number
    totalOrders: number
}

interface CategorySummary {
    category: string
    quantity: number
    revenue: number
    profit: number
    productCount: number
}

// Product name mapping (in a real app, this would come from your product database)
const productNameMap: Record<string, { name: string; category: string; costPrice: number }> = {
    // This would be populated from your product database or API
    // For now, we'll use a small sample
    prod1: { name: "Tusker Lager 500ML", category: "Beer", costPrice: 180 },
    prod2: { name: "Johnnie Walker Black 700ML", category: "Whisky", costPrice: 3500 },
    prod3: { name: "Smirnoff Vodka 750ML", category: "Vodka", costPrice: 1400 },
    prod4: { name: "Heineken 500ML", category: "Beer", costPrice: 200 },
    prod5: { name: "Jameson 700ML", category: "Whisky", costPrice: 2800 },
    // In a real implementation, you would fetch this data or join it in the backend
}

export default function SalesSummaryDashboard() {
    // State
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 7),
        to: new Date(),
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [sortBy, setSortBy] = useState("revenue")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [activeTab, setActiveTab] = useState("products")
    const [productSummary, setProductSummary] = useState<ProductSummary[]>([])
    const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([])
    const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Fetch sales data from API
    const fetchSalesData = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Construct query parameters
            const params = new URLSearchParams()

            // Add organization ID (assuming it's available in your context)
            // In a real app, you'd get this from your auth context
            params.append("organizationId", "your-org-id")

            // Add date range filters
            if (dateRange?.from) {
                params.append("startDate", dateRange.from.toISOString())
            }
            if (dateRange?.to) {
                params.append("endDate", dateRange.to.toISOString())
            }

            // Add status filter - only completed orders
            params.append("status", "COMPLETED")

            // Add pagination
            params.append("page", "1")
            params.append("limit", "100") // Get a good sample size

            // Make the API call
            const response = await fetch(`${APP_BASE_API_URL}/accounting/sales/summary?${params.toString()}`)

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
            }

            const data: ApiResponse = await response.json()

            // Process the data
            processOrderData(data.orders)
        } catch (err) {
            console.error("Error fetching sales data:", err)
            setError("Failed to load sales data. Please try again.")
            toast.error("Error loading data", {
                description: "There was a problem fetching the sales data.",
            })
        } finally {
            setIsLoading(false)
        }
    }, [dateRange])

    // Process order data into summary formats
    const processOrderData = (orders: Order[]) => {
        if (!orders || orders.length === 0) {
            setProductSummary([])
            setCategorySummary([])
            setSalesSummary({
                totalRevenue: 0,
                totalProfit: 0,
                totalQuantity: 0,
                averageOrderValue: 0,
                profitMargin: 0,
                totalOrders: 0,
            })
            return
        }

        // Calculate total revenue and orders
        const totalRevenue = orders.reduce((sum, order) => sum + order.finalAmount, 0)
        const totalOrders = orders.length
        const averageOrderValue = totalRevenue / totalOrders

        // Process product data
        const productMap = new Map<string, ProductSummary>()
        const categoryMap = new Map<string, CategorySummary>()

        // Track total quantity for overall summary
        let totalQuantity = 0

        // Process each order and its items
        orders.forEach((order) => {
            order.items.forEach((item) => {
                totalQuantity += item.quantity

                // Get product details (in a real app, this would come from your product database)
                const productDetails = productNameMap[item.productId] || {
                    name: `Product ${item.productId}`,
                    category: "Unknown",
                    costPrice: item.unitPrice * 0.6, // Estimate cost as 60% of price if unknown
                }

                // Calculate profit
                const costPrice = productDetails.costPrice
                const revenue = item.totalPrice
                const profit = revenue - costPrice * item.quantity
                const profitMargin = (profit / revenue) * 100

                // Update product summary
                const existingProduct = productMap.get(item.productId)
                if (existingProduct) {
                    existingProduct.quantity += item.quantity
                    existingProduct.revenue += revenue
                    existingProduct.profit += profit
                    // Recalculate profit margin
                    existingProduct.profitMargin = (existingProduct.profit / existingProduct.revenue) * 100
                } else {
                    productMap.set(item.productId, {
                        productId: item.productId,
                        name: productDetails.name,
                        category: productDetails.category,
                        quantity: item.quantity,
                        revenue: revenue,
                        profit: profit,
                        profitMargin: profitMargin,
                    })
                }

                // Update category summary
                const category = productDetails.category
                const existingCategory = categoryMap.get(category)
                if (existingCategory) {
                    existingCategory.quantity += item.quantity
                    existingCategory.revenue += revenue
                    existingCategory.profit += profit
                    // Count unique products in category
                    if (!existingCategory.products.has(item.productId)) {
                        existingCategory.products.add(item.productId)
                        existingCategory.productCount = existingCategory.products.size
                    }
                } else {
                    const products = new Set<string>()
                    products.add(item.productId)
                    categoryMap.set(category, {
                        category,
                        quantity: item.quantity,
                        revenue: revenue,
                        profit: profit,
                        productCount: 1,
                        products: products,
                    })
                }
            })
        })

        // Calculate total profit and margin
        const totalProfit = Array.from(productMap.values()).reduce((sum, product) => sum + product.profit, 0)
        const profitMargin = (totalProfit / totalRevenue) * 100

        // Convert maps to arrays for state
        const productSummaryArray = Array.from(productMap.values())
        const categorySummaryArray = Array.from(categoryMap.values()).map(({ products, ...rest }) => rest)

        // Update state
        setProductSummary(productSummaryArray)
        setCategorySummary(categorySummaryArray)
        setSalesSummary({
            totalRevenue,
            totalProfit,
            totalQuantity,
            averageOrderValue,
            profitMargin,
            totalOrders,
        })
    }

    // Load initial data
    useEffect(() => {
        fetchSalesData()
    }, [fetchSalesData])

    // Filter and sort products
    const filteredProducts = productSummary
        .filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory =
                categoryFilter === "all" || product.category.toLowerCase() === categoryFilter.toLowerCase()
            return matchesSearch && matchesCategory
        })
        .sort((a, b) => {
            let comparison = 0

            if (sortBy === "revenue") {
                comparison = a.revenue - b.revenue
            } else if (sortBy === "quantity") {
                comparison = a.quantity - b.quantity
            } else if (sortBy === "profit") {
                comparison = a.profit - b.profit
            } else if (sortBy === "name") {
                comparison = a.name.localeCompare(b.name)
            }

            return sortOrder === "desc" ? -comparison : comparison
        })

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
        }).format(amount)
    }

    // Handle refresh
    const handleRefresh = () => {
        fetchSalesData()
        toast.success("Data refreshed", {
            description: "Sales summary has been updated with the latest data",
        })
    }

    // Handle export
    const handleExport = async (format: string) => {
        setIsExporting(true)

        try {
            // In a real implementation, you would call an API endpoint to generate the export
            // For now, we'll simulate it
            await new Promise((resolve) => setTimeout(resolve, 1500))

            toast.success(`Export completed`, {
                description: `Your sales summary has been exported as ${format}`,
            })
        } catch (err) {
            toast.error(`Export failed`, {
                description: `There was a problem generating your ${format} export.`,
            })
        } finally {
            setIsExporting(false)
        }
    }

    // Get unique categories
    const categories = ["all", ...new Set(productSummary.map((p) => p.category.toLowerCase()))]

    // Toggle sort
    const toggleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortBy(field)
            setSortOrder("desc")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-normal">Sales Summary</h1>
                    <p className="text-sm text-muted-foreground">
                        {dateRange?.from && dateRange?.to
                            ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`
                            : "All time"}
                    </p>
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
                                onSelect={(range) => {
                                    setDateRange(range)
                                    // Fetch new data when date range changes
                                    if (range?.from && range?.to) {
                                        fetchSalesData()
                                    }
                                }}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>

                    <Button variant="outline" size="icon" className="h-8 w-9" onClick={handleRefresh} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-8 text-xs" disabled={isExporting || isLoading}>
                                {isExporting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export
                                    </>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExport("CSV")}>
                                <FileText className="mr-2 h-4 w-4" />
                                Export to CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport("Excel")}>
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

            {/* Summary Cards */}
            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="p-1">
                            <CardContent className="p-1">
                                <Skeleton className="h-4 w-1/2 mb-2" />
                                <Skeleton className="h-8 w-3/4 mb-1" />
                                <Skeleton className="h-4 w-1/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : error ? (
                <Card className="p-6 bg-red-50 border-red-200">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">{error}</p>
                    </div>
                    <p className="mt-2 text-sm text-red-600">Please check your connection and try again.</p>
                    <Button
                        variant="outline"
                        className="mt-4 border-red-200 text-red-600 hover:bg-red-100"
                        onClick={handleRefresh}
                    >
                        Try Again
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-green-800">Total Revenue</p>
                                    <h3 className="text-lg font-normal text-green-700">
                                        {formatCurrency(salesSummary?.totalRevenue || 0)}
                                    </h3>
                                    <p className="text-xs text-green-600">{salesSummary?.totalOrders || 0} orders</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                                    <Wallet className="h-5 w-5 text-green-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="p-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Total Profit</p>
                                    <h3 className="text-lg font-normal text-blue-700">
                                        {formatCurrency(salesSummary?.totalProfit || 0)}
                                    </h3>
                                    <p className="text-xs text-blue-600">{salesSummary?.profitMargin.toFixed(1)}% margin</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-blue-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="p-1 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                        <CardContent className="p-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-amber-800">Avg Order Value</p>
                                    <h3 className="text-lg font-normal text-amber-700">
                                        {formatCurrency(salesSummary?.averageOrderValue || 0)}
                                    </h3>
                                    <p className="text-xs text-amber-600">Per transaction</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center">
                                    <BarChart3 className="h-5 w-5 text-amber-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="p-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-purple-800">Units Sold</p>
                                    <h3 className="text-lg font-normal text-purple-700">{salesSummary?.totalQuantity || 0}</h3>
                                    <p className="text-xs text-purple-600">Total quantity</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                                    <Percent className="h-5 w-5 text-purple-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-2">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                className="pl-9 h-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="h-9 w-[180px]">
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">
                                        <div className="flex items-center cursor-pointer" onClick={() => toggleSort("name")}>
                                            Product
                                            <ArrowUpDown className={`ml-1 h-3 w-3 ${sortBy === "name" ? "opacity-100" : "opacity-50"}`} />
                                        </div>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex items-center cursor-pointer" onClick={() => toggleSort("quantity")}>
                                            Quantity
                                            <ArrowUpDown className={`ml-1 h-3 w-3 ${sortBy === "quantity" ? "opacity-100" : "opacity-50"}`} />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <div className="flex items-center justify-end cursor-pointer" onClick={() => toggleSort("revenue")}>
                                            Revenue
                                            <ArrowUpDown className={`ml-1 h-3 w-3 ${sortBy === "revenue" ? "opacity-100" : "opacity-50"}`} />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <div className="flex items-center justify-end cursor-pointer" onClick={() => toggleSort("profit")}>
                                            Profit
                                            <ArrowUpDown className={`ml-1 h-3 w-3 ${sortBy === "profit" ? "opacity-100" : "opacity-50"}`} />
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={index} className="animate-pulse">
                                            <TableCell>
                                                <Skeleton className="h-4 w-32" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-16" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-20 ml-auto" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-20 ml-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <TableRow key={product.productId}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground">{product.category}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span>{product.quantity} units</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(product.revenue)}</TableCell>
                                            <TableCell className="text-right">
                                                <div>
                                                    <span className="font-medium text-green-600">{formatCurrency(product.profit)}</span>
                                                    <p className="text-xs text-muted-foreground">{product.profitMargin.toFixed(1)}% margin</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                                                <p className="text-muted-foreground">No products found</p>
                                                <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4">
                    {isLoading ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Products</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                        <TableHead className="text-right">Profit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <TableRow key={index} className="animate-pulse">
                                            <TableCell>
                                                <Skeleton className="h-4 w-24" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-12" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-16" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-20 ml-auto" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-20 ml-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : categorySummary.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Products</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                        <TableHead className="text-right">Profit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categorySummary
                                        .sort((a, b) => b.revenue - a.revenue)
                                        .map((category) => (
                                            <TableRow key={category.category}>
                                                <TableCell className="font-medium">{category.category}</TableCell>
                                                <TableCell>{category.productCount}</TableCell>
                                                <TableCell>{category.quantity} units</TableCell>
                                                <TableCell className="text-right">{formatCurrency(category.revenue)}</TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-medium text-green-600">{formatCurrency(category.profit)}</span>
                                                    <p className="text-xs text-muted-foreground">
                                                        {((category.profit / category.revenue) * 100).toFixed(1)}% margin
                                                    </p>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">No category data available</h3>
                                <p className="text-muted-foreground mt-2">Try selecting a different date range</p>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
