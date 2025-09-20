"use client"

import { useState } from "react"
import { useCurrency } from "@/hooks/useCurrency";
import { useQuery } from "@tanstack/react-query"
import { format, subDays } from "date-fns"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    ArrowUp,
    ArrowDown,
    CalendarIcon,
    Search,
    Filter,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    Package,
    ShoppingCart,
    AlertCircle,
    SlidersHorizontal,
} from "lucide-react"

import type { DateRange } from "react-day-picker"
import { AuditSource } from "@prisma/client"
import { APP_BASE_API_URL } from "@/config/urls"

// Types for inventory changes
type ChangeType = "RECEIVE" | "SALE" | "ADJUSTMENT" | "TRANSFER" | "RETURN" | "LOSS"
type ChangeStatus = "COMPLETED" | "PENDING" | "CANCELLED"

interface InventoryChange {
    id: string
    timestamp: string
    type: ChangeType
    status: ChangeStatus
    reference: string
    sku: string
    productName: string
    variantName?: string
    previousStock: number
    quantityChange: number
    currentStock: number
    unitCost: number
    totalCost: number
    notes?: string
    userId: string
    warehouseId: string
    source: string
}

// Map UI filter values to Prisma enum values
const sourceFilterMap: Record<string, string> = {
    ALL: "",
    RECEIVE: AuditSource.RECEIVE,
    SALE: AuditSource.POS,
    ADJUSTMENT: AuditSource.ADJUSTMENT,
    TRANSFER: AuditSource.TRANSFER,
    RETURN: AuditSource.RETURN,
    LOSS: AuditSource.WEBHOOK, // Assuming LOSS maps to WEBHOOK in your case
}

// Map tab values to Prisma enum values
const tabSourceMap: Record<string, string> = {
    all: "",
    receive: AuditSource.RECEIVE,
    sales: AuditSource.POS,
    adjustments: AuditSource.ADJUSTMENT,
    transfers: AuditSource.TRANSFER,
    returns: AuditSource.RETURN,
}

export default function RealTimeAudit() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 7),
        to: new Date(),
    })
    const [expandedChange, setExpandedChange] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState<string>("ALL")
    const [activeTab, setActiveTab] = useState("all")

    // Format date range for API query
    const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined
    const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined

    // Fetch audit logs from API
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["auditLogs", startDate, endDate, typeFilter, searchQuery, activeTab],
        queryFn: async () => {
            // Build query parameters
            const params = new URLSearchParams()
            if (startDate) params.append("startDate", startDate)
            if (endDate) params.append("endDate", endDate)

            // Apply source filter from either the dropdown or the tab
            const sourceFilter = activeTab !== "all" ? tabSourceMap[activeTab] : sourceFilterMap[typeFilter]

            if (sourceFilter) {
                params.append("source", sourceFilter)
            }

            if (searchQuery) {
                if (searchQuery.includes("SKU:")) {
                    params.append("sku", searchQuery.replace("SKU:", "").trim())
                } else {
                    params.append("productName", searchQuery)
                }
            }

            const response = await fetch(`${APP_BASE_API_URL}/inventory/audit?${params.toString()}`)
            if (!response.ok) {
                throw new Error("Failed to fetch audit logs")
            }
            return response.json()
        },
        refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    })

    // Transform API data to component format
    const inventoryChanges: InventoryChange[] = data?.auditLogs || []
    const summary = data?.summary || {
        totalReceived: 0,
        totalSold: 0,
        totalAdjusted: 0,
        totalReceivedValue: 0,
        totalSoldValue: 0,
        totalAdjustedValue: 0,
        netQuantity: 0,
        netValue: 0,
    }

    // Toggle expanded state for a change
    const toggleExpandChange = (changeId: string) => {
        if (expandedChange === changeId) {
            setExpandedChange(null)
        } else {
            setExpandedChange(changeId)
        }
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return `{formatCurrency(amount)}`
    }

    // Map source to UI change type
    const mapSourceToChangeType = (source: string): ChangeType => {
        const sourceMap: Record<string, ChangeType> = {
            [AuditSource.RECEIVE]: "RECEIVE",
            [AuditSource.POS]: "SALE",
            [AuditSource.ADJUSTMENT]: "ADJUSTMENT",
            [AuditSource.TRANSFER]: "TRANSFER",
            [AuditSource.RETURN]: "RETURN",
            [AuditSource.WEBHOOK]: "LOSS",
            [AuditSource.MANUAL]: "ADJUSTMENT",
            //   [AuditSource.POS]: "SALE",
            [AuditSource.ONBOARDING]: "RECEIVE",
        }
        return sourceMap[source] || "ADJUSTMENT"
    }

    // Get badge color based on change type
    const getChangeBadge = (source: string) => {
        const type = mapSourceToChangeType(source)

        switch (type) {
            case "RECEIVE":
                return (
                    <Badge className="bg-green-500 hover:bg-green-600">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Receive
                    </Badge>
                )
            case "SALE":
                return (
                    <Badge className="bg-amber-500 hover:bg-amber-600">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Sale
                    </Badge>
                )
            case "ADJUSTMENT":
                return (
                    <Badge variant="outline" className="border-purple-500 text-purple-600">
                        <SlidersHorizontal className="h-3 w-3 mr-1" />
                        Adjustment
                    </Badge>
                )
            case "TRANSFER":
                return (
                    <Badge variant="outline" className="border-blue-500 text-blue-600">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Transfer
                    </Badge>
                )
            case "RETURN":
                return (
                    <Badge className="bg-blue-500 hover:bg-blue-600">
                        <ArrowDown className="h-3 w-3 mr-1" />
                        Return
                    </Badge>
                )
            case "LOSS":
                return (
                    <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Loss
                    </Badge>
                )
            default:
                return <Badge>{type}</Badge>
        }
    }

    const refreshData = () => {
        refetch()
        toast.success("Refreshing inventory data")
    }

    return (
        <div className="space-y-2 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-light">Real-Time Inventory Audit</h1>
                    <p className="text-xs text-muted-foreground">Live tracking of inventory changes with detailed history</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-9">
                                <CalendarIcon className="mr-2 h-4 w-4" />
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
                            <Calendar
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
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-1 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-green-800 dark:text-green-400">Stock Received</p>
                                <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{summary.totalReceived}</h3>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    {formatCurrency(summary.totalReceivedValue)}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                                <ArrowUp className="h-5 w-5 text-green-700 dark:text-green-300" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="p-1 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
                    <CardContent className="p-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Stock Sold</p>
                                <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">{summary.totalSold}</h3>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                    {formatCurrency(summary.totalSoldValue)}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="p-1 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-purple-800 dark:text-purple-400">Adjustments</p>
                                <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                                    {summary.totalAdjusted}
                                </h3>
                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                    {formatCurrency(summary.totalAdjustedValue)}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                                <SlidersHorizontal className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="p-1 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-400">Net Change</p>
                                <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{summary.netQuantity}</h3>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(summary.netValue)}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                                <Package className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-md">
                <CardHeader className="pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="font-light">Inventory Changes</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative w-full md:w-auto">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by product"
                                    className="pl-9 h-8 w-full md:w-[250px]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="h-8 w-[150px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Types</SelectItem>
                                    <SelectItem value="RECEIVE">Receive</SelectItem>
                                    <SelectItem value="SALE">Sale</SelectItem>
                                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                                    <SelectItem value="RETURN">Return</SelectItem>
                                    <SelectItem value="LOSS">Loss</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                        <TabsList className="grid grid-cols-6 h-9">
                            <TabsTrigger value="all" className="text-xs">
                                All
                            </TabsTrigger>
                            <TabsTrigger value="receive" className="text-xs">
                                Received
                            </TabsTrigger>
                            <TabsTrigger value="sales" className="text-xs">
                                Sales
                            </TabsTrigger>
                            <TabsTrigger value="adjustments" className="text-xs">
                                Adjustments
                            </TabsTrigger>
                            <TabsTrigger value="transfers" className="text-xs">
                                Transfers
                            </TabsTrigger>
                            <TabsTrigger value="returns" className="text-xs">
                                Returns
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>

                <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-60">
                                <div className="flex flex-col items-center">
                                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                    <p className="mt-2 text-sm text-muted-foreground">Loading inventory changes...</p>
                                </div>
                            </div>
                        ) : isError ? (
                            <div className="flex flex-col items-center justify-center h-60">
                                <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
                                <h3 className="text-lg font-medium">Error loading data</h3>
                                <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page</p>
                                <Button variant="outline" className="mt-4" onClick={refreshData}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Retry
                                </Button>
                            </div>
                        ) : inventoryChanges.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-60">
                                <Package className="h-12 w-12 text-muted-foreground mb-2" />
                                <h3 className="text-lg font-medium">No inventory changes found</h3>
                                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search query</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {inventoryChanges.map((change) => (
                                    <div key={change.id} className="transition-colors">
                                        <div
                                            className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 ${expandedChange === change.id ? "bg-slate-50 dark:bg-slate-900/50" : ""
                                                }`}
                                            onClick={() => toggleExpandChange(change.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0">
                                                    {expandedChange === change.id ? (
                                                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        {getChangeBadge(change.source)}
                                                        <span className="font-normal text-xs">{change.reference}</span>
                                                    </div>
                                                    <div className="mt-1">
                                                        <p className="text-sm font-medium">{change.productName}</p>
                                                        <p className="text-xs text-muted-foreground">SKU: {change.sku}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 ml-8 sm:ml-0">
                                                <div className="text-right">
                                                    <div className="text-sm font-medium">
                                                        {change.quantityChange > 0 ? "+" : ""}
                                                        {change.quantityChange} units
                                                    </div>
                                                    <div
                                                        className={`text-xs ${change.quantityChange < 0
                                                            ? "text-amber-600 dark:text-amber-400"
                                                            : "text-green-600 dark:text-green-400"
                                                            }`}
                                                    >
                                                        {formatCurrency(change.totalCost)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded details */}
                                        {expandedChange === change.id && (
                                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-dashed animate-in fade-in slide-in-from-top-1 duration-200">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                    <div>
                                                        <h4 className="text-sm font-medium mb-1">Transaction Details</h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            Date: {format(new Date(change.timestamp), "MMM d, yyyy h:mm a")}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">Reference: {change.reference}</p>
                                                        <p className="text-xs text-muted-foreground">Warehouse: {change.warehouseId}</p>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-medium mb-1">Stock Changes</h4>
                                                        <p className="text-xs text-muted-foreground">Previous: {change.previousStock} units</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Change: {change.quantityChange > 0 ? "+" : ""}
                                                            {change.quantityChange} units
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">Current: {change.currentStock} units</p>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-medium mb-1">Cost Information</h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            Unit Cost: {formatCurrency(Number(change.unitCost))}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Total Cost: {formatCurrency(Number(change.totalCost))}
                                                        </p>
                                                    </div>

                                                    {change.notes && (
                                                        <div className="md:col-span-3">
                                                            <h4 className="text-sm font-medium mb-1">Notes</h4>
                                                            <p className="text-sm">{change.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
