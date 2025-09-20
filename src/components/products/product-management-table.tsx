"use client"

import { useEffect, useState, useMemo } from "react"
import {
    Plus,
    Search,
    Filter,
    Download,
    Upload,
    MoreHorizontal,
    Edit,
    Trash,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { AddProductDialog } from "@/components/products/add-product-dialog"

import { useQuery } from "urql"
import { ProductListPaginatedDocument } from "@/gql/graphql"

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"

export function ProductTable() {

    const [isAddProductOpen, setIsAddProductOpen] = useState(false)
    const [selectedChannel, setSelectedChannel] = useState("century-consults")
    const channelOptions = ["century-consults"]

    // Pagination state
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 100,
    })
    const [cursor, setCursor] = useState<string | null>(null)
    const [totalCount, setTotalCount] = useState(0)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [hasPreviousPage, setHasPreviousPage] = useState(false)
    const [allCursors, setAllCursors] = useState<(string | null)[]>([null])

    // Search state
    const [globalFilter, setGlobalFilter] = useState("")

    // Fetch products from Saleor using urql with pagination
    const [result] = useQuery({
        query: ProductListPaginatedDocument,
        variables: {
            channel: selectedChannel,
            first: pagination.pageSize,
            after: cursor,
        },
    })

    const { data, fetching, error } = result

    // Extract and process data when it arrives
    useEffect(() => {
        if (data?.products) {
            if (data.products.totalCount) {
                setTotalCount(data.products.totalCount)
            }

            if (data.products.pageInfo) {
                setHasNextPage(data.products.pageInfo.hasNextPage)

                // Store the endCursor for next page navigation
                if (data.products.pageInfo.endCursor && hasNextPage) {
                    // Only add the cursor if we're at the end of our known cursors
                    if (pagination.pageIndex === allCursors.length - 1) {
                        setAllCursors((prev) => [...prev, data.products.pageInfo.endCursor])
                    }
                }
            }
        }
    }, [data, pagination.pageIndex, allCursors.length, hasNextPage])

    // Extract products from GraphQL result
    const products = useMemo(() => {
        if (!data?.products?.edges) return []
        return data.products.edges.map(({ node }: { node: any }) => node)
    }, [data])

    // Filter products based on search term
    const filteredProducts = useMemo(() => {
        if (!globalFilter) return products

        return products.filter(
            (product) =>
                product.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
                (product.slug && product.slug.toLowerCase().includes(globalFilter.toLowerCase())),
        )
    }, [products, globalFilter])

    // Column definitions for TanStack Table
    const columnHelper = createColumnHelper<any>()

    const columns = useMemo(
        () => [
            columnHelper.accessor(
                (row) => {
                    // Safely access the SKU
                    return row.variants?.[0]?.sku || "N/A"
                },
                {
                    id: "sku",
                    header: "SKU",
                },
            ),
            columnHelper.accessor("name", {
                header: "Name",
            }),
            columnHelper.accessor("category.name", {
                header: "Category",
                cell: (info) => info.getValue() || "N/A",
            }),
            columnHelper.accessor(
                (row) => {
                    // Safely access the variant name
                    return row.variants?.[0]?.name || "Default"
                },
                {
                    id: "variantName",
                    header: "Variant",
                },
            ),
            columnHelper.accessor(
                (row) => {
                    // Safely access the price
                    if (row.variants?.[0]?.pricing?.price?.gross?.amount) {
                        return row.variants[0].pricing.price.gross.amount
                    }
                    if (row.pricing?.priceRange?.start?.gross?.amount) {
                        return row.pricing.priceRange.start.gross.amount
                    }
                    return null
                },
                {
                    id: "price",
                    header: "Price (KES)",
                    cell: (info) => {
                        const value = info.getValue()
                        return value ? value.toLocaleString() : "N/A"
                    },
                },
            ),
            columnHelper.accessor(
                (row) => {
                    // Safely access the quantity
                    return row.variants?.[0]?.quantityAvailable || 0
                },
                {
                    id: "stock",
                    header: "Stock",
                },
            ),
            columnHelper.accessor("isAvailableForPurchase", {
                header: "Status",
                cell: (info) => (
                    <Badge
                        variant="outline"
                        className={`${info.getValue() !== false
                            ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                            : "bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700"
                            }`}
                    >
                        {info.getValue() !== false ? "Active" : "Inactive"}
                    </Badge>
                ),
            }),
            columnHelper.accessor("id", {
                header: "",
                cell: (info) => (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            }),
        ],
        [],
    )

    // Initialize TanStack Table
    const table = useReactTable({
        data: filteredProducts,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            pagination,
            globalFilter,
        },
        manualPagination: true,
        pageCount: Math.ceil(totalCount / pagination.pageSize),
        onPaginationChange: setPagination,
    })

    // Handle page changes
    useEffect(() => {
        // When page changes, update the cursor
        setCursor(allCursors[pagination.pageIndex] || null)
    }, [pagination.pageIndex, allCursors])

    // Reset pagination when channel changes
    const handleChannelChange = (channel: string) => {
        setSelectedChannel(channel)
        setPagination({ pageIndex: 0, pageSize: pagination.pageSize })
        setCursor(null)
        setAllCursors([null])
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full items-center gap-2 sm:w-auto">
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search products..."
                            className="w-full pl-6"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                        <span className="sr-only">Filter</span>
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="text-xs h-8" variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button className="text-xs h-8" variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Import
                    </Button>
                    <Button className="text-xs h-8 cursor-pointer" size="sm" onClick={() => setIsAddProductOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Channel selector */}
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <span className="text-sm">Channel:</span>
                <select
                    value={selectedChannel}
                    onChange={(e) => handleChannelChange(e.target.value)}
                    className="text-sm p-1 border rounded"
                >
                    {channelOptions.map((channel) => (
                        <option key={channel} value={channel}>
                            {channel}
                        </option>
                    ))}
                </select>
                <span className="text-xs text-muted-foreground ml-2">
                    {fetching
                        ? "Loading..."
                        : filteredProducts.length > 0
                            ? `${filteredProducts.length} products found`
                            : "No products found"}
                </span>
            </div>

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <Table className="text-xs">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {fetching ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                            <span className="ml-2">Loading products...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-destructive">
                                        Error loading products: {error.message}
                                    </TableCell>
                                </TableRow>
                            ) : filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <div className="space-y-2">
                                            <p>
                                                No products found with the current channel: <strong>{selectedChannel}</strong>
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                    Page {pagination.pageIndex + 1} of {Math.max(1, Math.ceil(totalCount / pagination.pageSize))} ({totalCount}{" "}
                    total products)
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage() || fetching}
                    >
                        First
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage() || fetching || pagination.pageIndex === 0}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!hasNextPage || fetching}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <AddProductDialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen} onAddProduct={() => { }} />
        </div>
    )
}