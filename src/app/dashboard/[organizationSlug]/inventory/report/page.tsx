"use client"

import { useState } from "react"
import {
    Package,
    Search,
    Filter,
    Download,
    Calendar,
    ArrowUpDown,
    ChevronDown,
    BarChart3,
    Layers,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    FileText,
    Printer,
    RefreshCw,
    ArrowRight,
    ShoppingCart,
    Clock,
    CheckCircle2,
    XCircle,
    Info,
} from "lucide-react"

import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { getFormattedMoney } from "@/utils/money"

// Types for inventory data
interface InventoryProduct {
    id: string
    name: string
    sku: string
    category: string
    currentStock: number
    reorderLevel: number
    costPrice: number
    sellingPrice: number
    totalValue: number
    lastRestocked: string
    location: string
    supplier: string
    status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "OVERSTOCKED"
    movement: "HIGH" | "MEDIUM" | "LOW" | "NONE"
    profitMargin: number
    daysToSellOut?: number
}

// Mock data for inventory products
const mockInventoryProducts: InventoryProduct[] = [
    {
        id: "prod-001",
        name: "Tusker Lager",
        sku: "TL-001",
        category: "Beer",
        currentStock: 72,
        reorderLevel: 30,
        costPrice: 150,
        sellingPrice: 180,
        totalValue: 10800,
        lastRestocked: "2025-04-19T09:30:00Z",
        location: "Main Storage",
        supplier: "Kenya Breweries Ltd",
        status: "IN_STOCK",
        movement: "HIGH",
        profitMargin: 20,
        daysToSellOut: 12,
    },
    {
        id: "prod-002",
        name: "Johnnie Walker Black",
        sku: "JW-001",
        category: "Whisky",
        currentStock: 17,
        reorderLevel: 10,
        costPrice: 3000,
        sellingPrice: 3500,
        totalValue: 51000,
        lastRestocked: "2025-04-19T09:30:00Z",
        location: "Secure Cabinet",
        supplier: "Diageo Kenya",
        status: "IN_STOCK",
        movement: "MEDIUM",
        profitMargin: 16.7,
        daysToSellOut: 28,
    },
    {
        id: "prod-003",
        name: "Smirnoff Vodka",
        sku: "SV-001",
        category: "Vodka",
        currentStock: 13,
        reorderLevel: 15,
        costPrice: 1200,
        sellingPrice: 1400,
        totalValue: 15600,
        lastRestocked: "2025-04-15T10:15:00Z",
        location: "Main Storage",
        supplier: "Diageo Kenya",
        status: "LOW_STOCK",
        movement: "MEDIUM",
        profitMargin: 16.7,
        daysToSellOut: 18,
    },
    {
        id: "prod-004",
        name: "Heineken",
        sku: "HK-001",
        category: "Beer",
        currentStock: 25,
        reorderLevel: 20,
        costPrice: 170,
        sellingPrice: 200,
        totalValue: 4250,
        lastRestocked: "2025-04-17T14:20:00Z",
        location: "Main Storage",
        supplier: "Premium Distributors",
        status: "IN_STOCK",
        movement: "MEDIUM",
        profitMargin: 17.6,
        daysToSellOut: 14,
    },
    {
        id: "prod-005",
        name: "Absolut Vodka",
        sku: "AV-001",
        category: "Vodka",
        currentStock: 20,
        reorderLevel: 8,
        costPrice: 1800,
        sellingPrice: 2200,
        totalValue: 360_00,
        lastRestocked: "2025-04-18T10:15:00Z",
        location: "Main Storage",
        supplier: "Premium Spirits Distributors",
        status: "OVERSTOCKED",
        movement: "LOW",
        profitMargin: 22.2,
        daysToSellOut: 45,
    },
    {
        id: "prod-006",
        name: "Guinness",
        sku: "GN-001",
        category: "Beer",
        currentStock: 24,
        reorderLevel: 25,
        costPrice: 180,
        sellingPrice: 220,
        totalValue: 4320,
        lastRestocked: "2025-04-16T09:10:00Z",
        location: "Main Storage",
        supplier: "Kenya Breweries Ltd",
        status: "LOW_STOCK",
        movement: "HIGH",
        profitMargin: 22.2,
        daysToSellOut: 8,
    },
    {
        id: "prod-007",
        name: "Jameson",
        sku: "JM-001",
        category: "Whisky",
        currentStock: 9,
        reorderLevel: 8,
        costPrice: 2500,
        sellingPrice: 2800,
        totalValue: 22500,
        lastRestocked: "2025-04-14T11:30:00Z",
        location: "Secure Cabinet",
        supplier: "Pernod Ricard Kenya",
        status: "IN_STOCK",
        movement: "MEDIUM",
        profitMargin: 12,
        daysToSellOut: 21,
    },
    {
        id: "prod-008",
        name: "Jack Daniel's",
        sku: "JD-001",
        category: "Whisky",
        currentStock: 10,
        reorderLevel: 6,
        costPrice: 2800,
        sellingPrice: 3200,
        totalValue: 28000,
        lastRestocked: "2025-04-12T14:45:00Z",
        location: "Secure Cabinet",
        supplier: "Premium Spirits Distributors",
        status: "IN_STOCK",
        movement: "LOW",
        profitMargin: 14.3,
        daysToSellOut: 35,
    },
    {
        id: "prod-009",
        name: "Bombay Sapphire Gin",
        sku: "BS-001",
        category: "Gin",
        currentStock: 7,
        reorderLevel: 5,
        costPrice: 2200,
        sellingPrice: 2500,
        totalValue: 15400,
        lastRestocked: "2025-04-10T09:20:00Z",
        location: "Main Storage",
        supplier: "Premium Spirits Distributors",
        status: "IN_STOCK",
        movement: "LOW",
        profitMargin: 13.6,
        daysToSellOut: 28,
    },
    {
        id: "prod-010",
        name: "Bacardi White Rum",
        sku: "BR-001",
        category: "Rum",
        currentStock: 9,
        reorderLevel: 10,
        costPrice: 1500,
        sellingPrice: 1800,
        totalValue: 13500,
        lastRestocked: "2025-04-11T10:30:00Z",
        location: "Main Storage",
        supplier: "Premium Spirits Distributors",
        status: "LOW_STOCK",
        movement: "LOW",
        profitMargin: 20,
        daysToSellOut: 32,
    },
    {
        id: "prod-011",
        name: "Gilbey's Gin",
        sku: "GG-001",
        category: "Gin",
        currentStock: 0,
        reorderLevel: 12,
        costPrice: 1100,
        sellingPrice: 1300,
        totalValue: 0,
        lastRestocked: "2025-04-05T11:15:00Z",
        location: "Main Storage",
        supplier: "Kenya Wine Agencies",
        status: "OUT_OF_STOCK",
        movement: "MEDIUM",
        profitMargin: 18.2,
    },
    {
        id: "prod-012",
        name: "Chrome Vodka",
        sku: "CV-001",
        category: "Vodka",
        currentStock: 5,
        reorderLevel: 15,
        costPrice: 900,
        sellingPrice: 1100,
        totalValue: 4500,
        lastRestocked: "2025-04-08T09:45:00Z",
        location: "Main Storage",
        supplier: "Kenya Wine Agencies",
        status: "LOW_STOCK",
        movement: "HIGH",
        profitMargin: 22.2,
        daysToSellOut: 4,
    },
]

// Category summary data
const categorySummary = [
    { name: "Beer", count: 3, value: 19370, percentage: 9.6 },
    { name: "Whisky", count: 3, value: 101500, percentage: 50.3 },
    { name: "Vodka", count: 3, value: 56100, percentage: 27.8 },
    { name: "Gin", count: 2, value: 15400, percentage: 7.6 },
    { name: "Rum", count: 1, value: 13500, percentage: 6.7 },
]

// Status summary data
const statusSummary = {
    inStock: { count: 6, value: 131950, percentage: 65.4 },
    lowStock: { count: 4, value: 37920, percentage: 18.8 },
    outOfStock: { count: 1, value: 0, percentage: 0 },
    overstocked: { count: 1, value: 360_00, percentage: 17.8 },
}

export default function InventoryReport() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    })
    const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>(mockInventoryProducts)
    const [searchQuery, setSearchQuery] = useState("")
    const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [sortField, setSortField] = useState<string>("name")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("all")

    // Calc total inventory value
    const totalInventoryValue = inventoryProducts.reduce((sum, product) => sum + product.totalValue, 0)
    const totalProducts = inventoryProducts.length
    const totalUnits = inventoryProducts.reduce((sum, product) => sum + product.currentStock, 0)

    // Filter inventory products based on selected filters
    const filteredProducts = inventoryProducts.filter((product) => {
        // Text search filter
        const textMatch =
            searchQuery === "" ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.supplier.toLowerCase().includes(searchQuery.toLowerCase())

        // Category filter
        const categoryMatch = categoryFilter === "ALL" || product.category === categoryFilter

        // Status filter
        const statusMatch = statusFilter === "ALL" || product.status === statusFilter

        // Tab filter
        const tabMatch =
            activeTab === "all" ||
            (activeTab === "low_stock" && product.status === "LOW_STOCK") ||
            (activeTab === "out_of_stock" && product.status === "OUT_OF_STOCK") ||
            (activeTab === "overstocked" && product.status === "OVERSTOCKED") ||
            (activeTab === "in_stock" && product.status === "IN_STOCK")

        return textMatch && categoryMatch && statusMatch && tabMatch
    })

    // Sort filtered products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        let comparison = 0

        switch (sortField) {
            case "name":
                comparison = a.name.localeCompare(b.name)
                break
            case "category":
                comparison = a.category.localeCompare(b.category)
                break
            case "currentStock":
                comparison = a.currentStock - b.currentStock
                break
            case "totalValue":
                comparison = a.totalValue - b.totalValue
                break
            case "movement":
                const movementOrder = { HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 }
                comparison = movementOrder[a.movement] - movementOrder[b.movement]
                break
            case "status":
                const statusOrder = { OUT_OF_STOCK: 3, LOW_STOCK: 2, IN_STOCK: 1, OVERSTOCKED: 0 }
                comparison = statusOrder[a.status] - statusOrder[b.status]
                break
            default:
                comparison = 0
        }

        return sortDirection === "asc" ? comparison : -comparison
    })

    // Format currency
    const formatCurrency = (amount: number) => {
        return `{formatCurrency(amount)}`
    }

    // Handle sort
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    // Get status badge
    const getStatusBadge = (status: InventoryProduct["status"]) => {
        switch (status) {
            case "IN_STOCK":
                return (
                    <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        In Stock
                    </Badge>
                )
            case "LOW_STOCK":
                return (
                    <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/20">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Low Stock
                    </Badge>
                )
            case "OUT_OF_STOCK":
                return (
                    <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50 dark:bg-red-950/20">
                        <XCircle className="h-3 w-3 mr-1" />
                        Out of Stock
                    </Badge>
                )
            case "OVERSTOCKED":
                return (
                    <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/20">
                        <Info className="h-3 w-3 mr-1" />
                        Overstocked
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    // Get movement indicator
    const getMovementIndicator = (movement: InventoryProduct["movement"]) => {
        switch (movement) {
            case "HIGH":
                return (
                    <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-green-600">High</span>
                    </div>
                )
            case "MEDIUM":
                return (
                    <div className="flex items-center">
                        <ArrowRight className="h-4 w-4 text-blue-600 mr-1" />
                        <span className="text-blue-600">Medium</span>
                    </div>
                )
            case "LOW":
                return (
                    <div className="flex items-center">
                        <TrendingDown className="h-4 w-4 text-amber-600 mr-1" />
                        <span className="text-amber-600">Low</span>
                    </div>
                )
            case "NONE":
                return (
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 text-slate-400 mr-1" />
                        <span className="text-slate-400">None</span>
                    </div>
                )
            default:
                return <span>{movement}</span>
        }
    }

    const refreshData = () => {
        setIsLoading(true)
        setTimeout(() => {
            setInventoryProducts(mockInventoryProducts)
            setIsLoading(false)
            toast.success("Inventory data refreshed", {
                description: "Latest inventory data has been loaded",
            })
        }, 800)
    }

    const exportData = (format: string) => {
        // generate a CSV or PDF
        toast.success(`Export started`, {
            description: `Your inventory report is being generated in ${format} format`,
        })
    }

    // Print report
    const printReport = () => {
        // open a print dialog
        window.print()
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Inventory Report</h1>
                    <p className="text-muted-foreground">Complete overview of your current inventory status</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-9">
                                <Calendar className="mr-2 h-4 w-4" />
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

                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={refreshData}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-9">
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
                            <DropdownMenuItem onClick={printReport}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Report
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div> 
                                <p className="text-sm font-medium text-purple-800 dark:text-purple-400">Total Inventory Value</p>
                                <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                                    {formatCurrency(totalInventoryValue)}
                                </h3>
                                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                                    {totalProducts} products • {totalUnits} units
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                                <Package className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium">Inventory Status</p>
                                <div className="flex gap-2 mt-2">
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                                            {statusSummary.inStock.count}
                                        </div>
                                        <div className="text-xs text-muted-foreground">In Stock</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                                            {statusSummary.lowStock.count}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Low Stock</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                                            {statusSummary.outOfStock.count}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Out of Stock</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                            {statusSummary.overstocked.count}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Overstocked</div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Layers className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="w-full">
                                <p className="text-sm font-medium">Category Breakdown</p>
                                <div className="mt-2 space-y-2 w-full">
                                    {categorySummary.slice(0, 3).map((category) => (
                                        <div key={category.name} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>{category.name}</span>
                                                <span className="font-medium">{formatCurrency(category.value)}</span>
                                            </div>
                                            <Progress value={category.percentage} className="h-1.5" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-md">
                <CardHeader className="pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle>Inventory Items</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative w-full md:w-auto">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
                                    className="pl-9 h-9 w-full md:w-[200px]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filters
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px]">
                                    <div className="p-2">
                                        <p className="text-sm font-medium mb-2">Category</p>
                                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">All Categories</SelectItem>
                                                <SelectItem value="Beer">Beer</SelectItem>
                                                <SelectItem value="Whisky">Whisky</SelectItem>
                                                <SelectItem value="Vodka">Vodka</SelectItem>
                                                <SelectItem value="Gin">Gin</SelectItem>
                                                <SelectItem value="Rum">Rum</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <div className="p-2">
                                        <p className="text-sm font-medium mb-2">Status</p>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">All Statuses</SelectItem>
                                                <SelectItem value="IN_STOCK">In Stock</SelectItem>
                                                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                                                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                                                <SelectItem value="OVERSTOCKED">Overstocked</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                        <TabsList className="grid grid-cols-5 h-9">
                            <TabsTrigger value="all" className="text-xs">
                                All Items
                            </TabsTrigger>
                            <TabsTrigger value="low_stock" className="text-xs">
                                Low Stock
                            </TabsTrigger>
                            <TabsTrigger value="out_of_stock" className="text-xs">
                                Out of Stock
                            </TabsTrigger>
                            <TabsTrigger value="overstocked" className="text-xs">
                                Overstocked
                            </TabsTrigger>
                            <TabsTrigger value="in_stock" className="text-xs">
                                In Stock
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>

                <CardContent className="p-0 mt-4">
                    <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-60">
                                <div className="flex flex-col items-center">
                                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                    <p className="mt-2 text-sm text-muted-foreground">Loading inventory data...</p>
                                </div>
                            </div>
                        ) : sortedProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-60">
                                <Package className="h-12 w-12 text-muted-foreground mb-2" />
                                <h3 className="text-lg font-medium">No inventory items found</h3>
                                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search query</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/50">
                                            <th
                                                className="px-4 py-3 text-left text-xs font-medium cursor-pointer"
                                                onClick={() => handleSort("name")}
                                            >
                                                <div className="flex items-center">
                                                    Product
                                                    {sortField === "name" && (
                                                        <ArrowUpDown
                                                            className={`ml-1 h-3.5 w-3.5 ${sortDirection === "desc" ? "rotate-180" : ""}`}
                                                        />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                className="px-4 py-3 text-left text-xs font-medium cursor-pointer"
                                                onClick={() => handleSort("category")}
                                            >
                                                <div className="flex items-center">
                                                    Category
                                                    {sortField === "category" && (
                                                        <ArrowUpDown
                                                            className={`ml-1 h-3.5 w-3.5 ${sortDirection === "desc" ? "rotate-180" : ""}`}
                                                        />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                className="px-4 py-3 text-right text-xs font-medium cursor-pointer"
                                                onClick={() => handleSort("currentStock")}
                                            >
                                                <div className="flex items-center justify-end">
                                                    Stock
                                                    {sortField === "currentStock" && (
                                                        <ArrowUpDown
                                                            className={`ml-1 h-3.5 w-3.5 ${sortDirection === "desc" ? "rotate-180" : ""}`}
                                                        />
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium">Cost Price</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium">Selling Price</th>
                                            <th
                                                className="px-4 py-3 text-right text-xs font-medium cursor-pointer"
                                                onClick={() => handleSort("totalValue")}
                                            >
                                                <div className="flex items-center justify-end">
                                                    Total Value
                                                    {sortField === "totalValue" && (
                                                        <ArrowUpDown
                                                            className={`ml-1 h-3.5 w-3.5 ${sortDirection === "desc" ? "rotate-180" : ""}`}
                                                        />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                className="px-4 py-3 text-left text-xs font-medium cursor-pointer"
                                                onClick={() => handleSort("status")}
                                            >
                                                <div className="flex items-center">
                                                    Status
                                                    {sortField === "status" && (
                                                        <ArrowUpDown
                                                            className={`ml-1 h-3.5 w-3.5 ${sortDirection === "desc" ? "rotate-180" : ""}`}
                                                        />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                className="px-4 py-3 text-left text-xs font-medium cursor-pointer"
                                                onClick={() => handleSort("movement")}
                                            >
                                                <div className="flex items-center">
                                                    Movement
                                                    {sortField === "movement" && (
                                                        <ArrowUpDown
                                                            className={`ml-1 h-3.5 w-3.5 ${sortDirection === "desc" ? "rotate-180" : ""}`}
                                                        />
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {sortedProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-muted/20">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline" className="font-normal">
                                                        {product.category}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-medium">{product.currentStock}</span>
                                                        <span className="text-xs text-muted-foreground">Min: {product.reorderLevel}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(product.costPrice)}</td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(product.sellingPrice)}</td>
                                                <td className="px-4 py-3 text-right font-medium">{formatCurrency(product.totalValue)}</td>
                                                <td className="px-4 py-3">{getStatusBadge(product.status)}</td>
                                                <td className="px-4 py-3">{getMovementIndicator(product.movement)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <ChevronDown className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                                            <DropdownMenuItem>Update Stock</DropdownMenuItem>
                                                            <DropdownMenuItem>Price History</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>Order More</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>

                <CardFooter className="flex justify-between py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        Showing {sortedProducts.length} of {inventoryProducts.length} products
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8">
                            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                            Order Products
                        </Button>
                        <Button variant="outline" size="sm" className="h-8">
                            <Printer className="h-3.5 w-3.5 mr-1" />
                            Print List
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-base">Products Requiring Attention</CardTitle>
                        <CardDescription>Items that need immediate action</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {mockInventoryProducts
                                .filter((p) => p.status === "LOW_STOCK" || p.status === "OUT_OF_STOCK")
                                .slice(0, 5)
                                .map((product) => (
                                    <div key={product.id} className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`h-8 w-8 rounded-full flex items-center justify-center ${product.status === "OUT_OF_STOCK"
                                                    ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                                    : "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                                                    }`}
                                            >
                                                {product.status === "OUT_OF_STOCK" ? (
                                                    <XCircle className="h-4 w-4" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.status === "OUT_OF_STOCK"
                                                        ? "Out of stock since " + format(new Date(product.lastRestocked), "MMM d")
                                                        : product.daysToSellOut
                                                            ? `${product.daysToSellOut} days until stockout`
                                                            : "Low stock"}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-8">
                                            Order
                                        </Button>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-base">Inventory Value by Category</CardTitle>
                        <CardDescription>Distribution of inventory across categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {categorySummary.map((category) => (
                                <div key={category.name} className="space-y-2">
                                    <div className="flex justify-between">
                                        <div>
                                            <span className="font-medium">{category.name}</span>
                                            <span className="text-xs text-muted-foreground ml-2">{category.count} products</span>
                                        </div>
                                        <span className="font-medium">{formatCurrency(category.value)}</span>
                                    </div>
                                    <div className="relative pt-1">
                                        <div className="flex mb-2 items-center justify-between">
                                            <div>
                                                <span className="text-xs font-semibold inline-block text-purple-600">
                                                    {category.percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                        {/* <Progress/> */}
                                        <div className="flex h-1.5 overflow-hidden rounded bg-purple-200 dark:bg-purple-900/20">
                                            <div
                                                style={{ width: `${category.percentage}%` }}
                                                className="bg-purple-600 dark:bg-purple-500"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
