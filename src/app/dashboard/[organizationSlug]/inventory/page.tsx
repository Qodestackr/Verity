"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery } from "urql"
import { useCurrency } from "@/hooks/useCurrency";
import { GetInventoryDocument } from "@/gql/graphql"
import { motion } from "framer-motion"
import {
    Package,
    Search,
    Filter,
    ArrowUpDown,
    MoreHorizontal,
    FileText,
    Truck,
    AlertCircle,
    Plus,
    RefreshCw,
    CheckCircle2,
    Clock,
    Beer,
    Wine,
    X,
    ChevronLeft,
    ChevronRight,
    PackageCheckIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
} from "@tanstack/react-table"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState("all")
    const [activeWarehouse, setActiveWarehouse] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const organizationSlug = useOrganizationSlug()

    // Pagination state
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 100,
    })
    const [cursor, setCursor] = useState<string | null>(null)
    const [allCursors, setAllCursors] = useState<(string | null)[]>([null])
    const [hasNextPage, setHasNextPage] = useState(false)
    const [totalCount, setTotalCount] = useState(0)

    // Fetch data using urql and GetInventoryDocument with pagination
    const [result] = useQuery({
        query: GetInventoryDocument,
        variables: {
            channel: "century-consults",
            first: pagination.pageSize,
            after: cursor,
        },
    })

    const { data, fetching, error } = result

    // Extract and process data when it arrives
    useEffect(() => {
        if (data?.products) {
            if (data.products.pageInfo) {
                setHasNextPage(data.products.pageInfo.hasNextPage)

                // Store the endCursor for next page navigation
                if (data.products.pageInfo.endCursor && data.products.pageInfo.hasNextPage) {
                    // Only add the cursor if we're at the end of our known cursors
                    if (pagination.pageIndex === allCursors.length - 1) {
                        setAllCursors((prev) => [...prev, data.products.pageInfo.endCursor])
                    }
                }
            }
        }
    }, [data, pagination.pageIndex, allCursors.length])

    // Handle page changes
    useEffect(() => {
        // When page changes, update the cursor
        setCursor(allCursors[pagination.pageIndex] || null)
    }, [pagination.pageIndex, allCursors])

    // Transform the GraphQL data into a simpler format for the UI
    const inventory = useMemo(() => {
        if (!data?.products?.edges) return []

        return data.products.edges.map(({ node }: any) => {
            const variants = node.variants || []

            // Calc total stock across all variants and warehouses
            let totalStock = 0
            let stockStatus = "out-of-stock"

            variants.forEach((variant: any) => {
                const variantStock = variant.stocks?.reduce((acc: number, stock: any) => acc + (stock.quantity || 0), 0) || 0
                totalStock += variantStock
            })

            if (totalStock > 0) {
                // Arbitrary thresholds - can be adjusted based on business logic
                stockStatus = totalStock < 5 ? "low-stock" : "in-stock"
            }

            // Get warehouses from the first variant's stocks
            const warehouses = variants[0]?.stocks?.map((stock: any) => stock.warehouse?.name) || []
            const primaryWarehouse = warehouses[0] || "Unknown"

            return {
                id: node.id,
                name: node.name,
                variants: variants.map((v: any) => ({
                    id: v.id,
                    name: v.name,
                    quantityAvailable: v.quantityAvailable || 0,
                    quantityOrdered: v.quantityOrdered || 0,
                    margin: v.margin || 0,
                    stocks: v.stocks || [],
                })),
                stock: totalStock,
                stockStatus,
                category: variants[0]?.name?.includes("Beer")
                    ? "Beer"
                    : variants[0]?.name?.includes("Wine")
                        ? "Wine"
                        : variants[0]?.name?.includes("Vodka")
                            ? "Vodka"
                            : variants[0]?.name?.includes("Gin")
                                ? "Gin"
                                : variants[0]?.name?.includes("Whisky")
                                    ? "Whisky"
                                    : "--",
                warehouse: primaryWarehouse,
                packaging: `${variants.length} variants`,
                reorderLevel: Math.max(5, Math.floor(totalStock * 0.3)), // Arbitrary reorder level
                lastUpdated: new Date().toISOString().split("T")[0], // Current date as placeholder
            }
        })
    }, [data])

    // Extract all unique warehouses for the filter dropdown
    const warehouses = useMemo(() => {
        return Array.from(
            new Set(
                inventory?.flatMap((item) =>
                    item?.variants?.flatMap((v: any) => v.stocks?.map((s: any) => s.warehouse?.name)).filter(Boolean),
                ),
            ),
        )
    }, [inventory])

    // Filter inventory based on status and warehouse
    const filteredInventory = useMemo(() => {
        return (
            inventory?.filter((item) => {
                if (!item) return false

                // Status filter
                const matchesStatus = activeTab === "all" || item.stockStatus === activeTab

                // Warehouse filter
                const matchesWarehouse = activeWarehouse === "all" || item.warehouse === activeWarehouse

                return matchesStatus && matchesWarehouse
            }) || []
        )
    }, [inventory, activeTab, activeWarehouse])

    // Column definitions for TanStack Table
    const columnHelper = createColumnHelper<any>()

    const columns = useMemo(
        () => [
            columnHelper.accessor("name", {
                header: "Product",
                cell: (info) => (
                    <div className="flex items-center gap-3">
                        <div className="bg-muted rounded-md p-1 hidden sm:block">{getCategoryIcon(info.row.original.category)}</div>
                        <span>{info.getValue()}</span>
                    </div>
                ),
            }),
            columnHelper.accessor("stock", {
                header: "Stock",
                cell: (info) => (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">{info.getValue()} units</span>
                            <span className="text-xs text-muted-foreground">Min: {info.row.original.reorderLevel}</span>
                        </div>
                        <Progress value={getStockPercentage(info.getValue(), info.row.original.reorderLevel)} className="h-1.5" />
                    </div>
                ),
            }),
            columnHelper.accessor("stockStatus", {
                header: "Status",
                cell: (info) => (
                    <div className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                            {getStockStatusIcon(info.getValue())}
                            <span>{getStockStatusBadge(info.getValue())}</span>
                        </div>
                    </div>
                ),
            }),
            columnHelper.accessor("warehouse", {
                header: "Warehouse",
                cell: (info) => <div className="hidden md:table-cell">{info.getValue()}</div>,
            }),
            columnHelper.accessor("id", {
                header: "",
                cell: (info) => (
                    <div className="flex justify-end">
                        {/* View Details Button */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedProduct(info.row.original)}
                                    className="h-8 text-xs px-2 lg:px-3"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span className="sr-only lg:not-sr-only lg:ml-2">Details</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-lg p-0">
                                <div className="flex justify-between items-center px-6 py-2 border-b">
                                    <div>
                                        <h2 className="text-lg font-semibold">Product Details</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Detailed information for {info.row.original.name}
                                            {console.log(info, "...")}
                                        </p>
                                    </div>
                                    <SheetClose className="rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                        <span className="sr-only">Close</span>
                                    </SheetClose>
                                </div>

                                <ScrollArea className="h-[calc(100vh-140px)]">
                                    <div className="px-6 py-4 space-y-4">
                                        {/* Product Info */}
                                        <div className="flex items-center gap-4">
                                            <div className="bg-muted rounded-md h-12 w-12 flex items-center justify-center">
                                                {getCategoryIcon(info.row.original.category)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{info.row.original.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>{info.row.original.id.split(":")[1]}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badges */}
                                        <div className="flex flex-wrap gap-2">{getStockStatusBadge(info.row.original.stockStatus)}</div>

                                        {/* Stock Information */}
                                        <div className="space-y-1">
                                            <h4 className="text-base font-medium">Stock Information</h4>
                                            <Separator className="my-1" />
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Current Stock</p>
                                                    <p className="text-sm font-medium">{info.row.original.stock} units</p>
                                                </div>
                                            </div>

                                            <div className="mt-1">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">Stock Level</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {info.row.original.stock} of {info.row.original.reorderLevel * 2} target
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={getStockPercentage(info.row.original.stock, info.row.original.reorderLevel)}
                                                        className="h-1.5"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Variant Details */}
                                        <div className="space-y-2">
                                            <h4 className="text-base font-medium">Variant Details</h4>
                                            <Separator className="my-1" />
                                            <div className="space-y-3">
                                                {info.row.original.variants.map((variant: any, index: number) => (
                                                    <div key={variant.id} className="p-3 bg-muted/50 rounded-md">
                                                        <p className="font-medium mb-1">{variant.name}</p>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div>
                                                                <p className="text-muted-foreground">Available:</p>
                                                                <p>{variant.quantityAvailable} units</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground">Ordered:</p>
                                                                <p>{variant.quantityOrdered} units</p>
                                                            </div>
                                                            {variant.margin > 0 && (
                                                                <div className="col-span-2">
                                                                    <p className="text-muted-foreground">Margin:</p>
                                                                    <p>{(variant.margin * 100).toFixed(1)}%</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {variant.stocks?.length > 0 && (
                                                            <div className="mt-2">
                                                                <p className="text-sm font-medium mb-1">Warehouse Stock:</p>
                                                                <div className="space-y-1">
                                                                    {variant.stocks.map((stock: any, idx: number) => (
                                                                        <div key={idx} className="flex justify-between text-sm">
                                                                            <span>{stock.warehouse?.name || "Unknown"}</span>
                                                                            <span>{stock.quantity || 0} units</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </SheetContent>
                        </Sheet>

                        {/* Other Actions Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 text-xs w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedProduct(info.row.original)
                                        setIsEditing(true)
                                    }}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Update Stock & Price
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Truck className="mr-2 h-4 w-4" />
                                    Transfer Stock
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            }),
        ],
        [selectedProduct, isEditing, result],
    )

    // Initialize TanStack Table
    const table = useReactTable({
        data: filteredInventory,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter: searchQuery,
            pagination,
        },
        onGlobalFilterChange: setSearchQuery,
        globalFilterFn: "includesString",
        manualPagination: true,
        pageCount: Math.ceil(totalCount / pagination.pageSize) || -1,
        onPaginationChange: setPagination,
    })

    // Utility functions
    const getStockStatusBadge = (status: string) => {
        switch (status) {
            case "in-stock":
                return (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        In Stock
                    </Badge>
                )
            case "low-stock":
                return (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                        Low Stock
                    </Badge>
                )
            case "out-of-stock":
                return (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500">
                        Out of Stock
                    </Badge>
                )
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    const getStockStatusIcon = (status: string) => {
        switch (status) {
            case "in-stock":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case "low-stock":
                return <AlertCircle className="h-4 w-4 text-amber-500" />
            case "out-of-stock":
                return <AlertCircle className="h-4 w-4 text-red-500" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    const getStockPercentage = (stock: number, reorderLevel: number) => {
        if (stock === 0) return 0
        const percentage = (stock / (reorderLevel * 2)) * 100
        return Math.min(percentage, 100)
    }

    const getCategoryIcon = (category: string) => {
        switch (category?.toLowerCase()) {
            case "beer":
                return <Beer className="h-4 w-4 text-amber-500" />
            case "wine":
                return <Wine className="h-4 w-4 text-red-500" />
            case "spirits":
            case "vodka":
            case "gin":
            case "whisky":
                return <Wine className="h-4 w-4 text-blue-500" />
            default:
                return <Package className="h-4 w-4" />
        }
    }

    if (error) {
        return (
            <div className="p-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Failed to load inventory data: {error.message}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col md:flex-row justify-between gap-2 items-start md:items-center">
                <div>
                    <h1 className="text-xl font-light tracking-tight">Manage Your Stock</h1>
                    <p className="text-muted-foreground text-xs">Track and manage your inventory across warehouses</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button className="text-xs h-7 bg-teal-600 hover:bg-teal-700" size="sm">
                        <Link className="flex justify-center items-center gap-1" href={`/dashboard/${organizationSlug}/inventory/update`}>
                            <Plus className="mr-1 h-4 w-4" />
                            Update Stock
                        </Link>
                    </Button>
                    <Button className="text-xs h-7 bg-teal-600 hover:bg-teal-700" size="sm">
                        <Link className="flex justify-center items-center gap-1" href={`/dashboard/${organizationSlug}/inventory/audit`}>
                            <Plus className="mr-1 h-4 w-4" />
                            Realtime Inventory Audit
                        </Link>
                    </Button>

                    <Button className="text-xs h-7 bg-teal-600 hover:bg-teal-700" size="sm">
                        <Link className="flex justify-center items-center gap-1" href={`/dashboard/${organizationSlug}/inventory/add-new`}>
                            <PackageCheckIcon className="mr-1 h-4 w-4" />
                            Add New Product
                            {/* BARCODE SCANS? */}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Scanning Alert */}
            {isScanning && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Barcode Scanning Mode</AlertTitle>
                    <AlertDescription>Scan a barcode or enter the barcode number manually in the search box.</AlertDescription>
                </Alert>
            )}

            {/* Controls Section */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Search and Filters */}
                    <div className="flex flex-wrap w-full sm:w-auto gap-2">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder={isScanning ? "Scan or enter barcode..." : "Search products..."}
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Warehouse Selector */}
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select value={activeWarehouse} onValueChange={setActiveWarehouse}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Select Warehouse" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Warehouses</SelectItem>
                                {warehouses.map((warehouse, index) => (
                                    <SelectItem key={index} value={warehouse as string}>
                                        {warehouse}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Status Tabs */}
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="all">All Items</TabsTrigger>
                        <TabsTrigger value="in-stock">In Stock</TabsTrigger>
                        <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                        <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">{/* Content will be shown in the table below */}</TabsContent>
                    <TabsContent value="in-stock">{/* Content will be shown in the table below */}</TabsContent>
                    <TabsContent value="low-stock">{/* Content will be shown in the table below */}</TabsContent>
                    <TabsContent value="out-of-stock">{/* Content will be shown in the table below */}</TabsContent>
                </Tabs>

                {fetching && (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                )}

                {/* Inventory Table View with TanStack Table */}
                {!fetching && (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="rounded-md border overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <Table className="text-xs">
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
                                    {table.getRowModel().rows.length > 0 ? (
                                        table.getRowModel().rows.map((row) => (
                                            <motion.tr key={row.id} variants={item} className="hover:bg-muted/50 group">
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                                                No matching products found. Try adjusting your filters.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </motion.div>
                )}

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-muted-foreground">
                        Page {pagination.pageIndex + 1} of {Math.max(1, allCursors.length)}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
                            disabled={pagination.pageIndex === 0 || fetching}
                            className="h-8 text-xs"
                        >
                            First
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                            disabled={pagination.pageIndex === 0 || fetching}
                            className="h-8 text-xs"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                            disabled={!hasNextPage || fetching}
                            className="h-8 text-xs"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/*  
            STATS CARDS:
            1. Total Stock: Units across all warehouses ({inventory.reduce((sum, item) => sum + item.stock, 0)})
            2. Warehouses: Active storage locations ({warehouses.length})
            3. Low Stock: Items below reorder level ({inventory.filter((item) => item.stockStatus === "low-stock").length})
            4. Total Products: {fetching ? "Loading..." : "All inventory items"} ({inventory.length}+)
            */}
        </div>
    )
}