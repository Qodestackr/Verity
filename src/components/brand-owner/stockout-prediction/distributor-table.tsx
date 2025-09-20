"use client"

import { useMemo, useState } from "react"
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    type SortingState,
    type ColumnFiltersState,
} from "@tanstack/react-table"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MapPin,
    TrendingUp,
    AlertTriangle,
    Clock,
    Star,
    Users,
    Package,
    Calendar,
    Eye,
} from "lucide-react"

interface DistributorData {
    id: string
    name: string
    region: string
    location: string
    status: "critical" | "warning" | "opportunity" | "optimal"
    marketShare: number
    velocity: number
    revenueImpact: number
    stockDays: number
    nearbyVenues: number
    tourismIndex: number
    products: Array<{
        name: string
        stock: number
        demand: number
        velocity: number
        impact: number
    }>
}

interface DistributorTableProps {
    distributors: DistributorData[]
    onDistributorSelect: (distributorId: string) => void
}

export function DistributorTable({
    distributors, onDistributorSelect }: DistributorTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "critical":
                return "bg-red-100 text-red-800 border-red-200"
            case "warning":
                return "bg-amber-100 text-amber-800 border-amber-200"
            case "opportunity":
                return "bg-emerald-100 text-emerald-800 border-emerald-200"
            case "optimal":
                return "bg-blue-100 text-blue-800 border-blue-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "critical":
                return <AlertTriangle className="h-3 w-3" />
            case "warning":
                return <Clock className="h-3 w-3" />
            case "opportunity":
                return <TrendingUp className="h-3 w-3" />
            case "optimal":
                return <Star className="h-3 w-3" />
            default:
                return <MapPin className="h-3 w-3" />
        }
    }

    const getUrgencyLevel = (stockDays: number) => {
        if (stockDays <= 3) return { level: "critical", color: "text-red-600", bg: "bg-red-100" }
        if (stockDays <= 7) return { level: "warning", color: "text-amber-600", bg: "bg-amber-100" }
        if (stockDays <= 14) return { level: "caution", color: "text-blue-600", bg: "bg-blue-100" }
        return { level: "good", color: "text-emerald-600", bg: "bg-emerald-100" }
    }

    const columns = useMemo(
        () => [
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 lg:px-3"
                    >
                        Distributor
                        {column.getIsSorted() === "asc" ? (
                            <ArrowUp className="ml-2 h-4 w-4" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ArrowDown className="ml-2 h-4 w-4" />
                        ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                ),
                cell: ({ row }) => {
                    const distributor = row.original
                    return (
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex-shrink-0">{getStatusIcon(distributor.status)}</div>
                            <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">{distributor.name}</div>
                                <div className="text-xs text-slate-600 truncate">{distributor.location}</div>
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorKey: "region",
                header: "Region",
                cell: ({ row }) => (
                    <Badge variant="outline" className="text-xs">
                        {row.getValue("region")}
                    </Badge>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const status = row.getValue("status") as string
                    return (
                        <Badge className={`text-xs border ${getStatusColor(status)}`}>
                            <span className="flex items-center gap-1">
                                {getStatusIcon(status)}
                                <span className="capitalize">{status}</span>
                            </span>
                        </Badge>
                    )
                },
            },
            {
                accessorKey: "stockDays",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 lg:px-3"
                    >
                        Stock Days
                        {column.getIsSorted() === "asc" ? (
                            <ArrowUp className="ml-2 h-4 w-4" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ArrowDown className="ml-2 h-4 w-4" />
                        ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                ),
                cell: ({ row }) => {
                    const stockDays = row.getValue("stockDays") as number
                    const urgency = getUrgencyLevel(stockDays)
                    return (
                        <div className="flex items-center gap-2">
                            <span className={`font-medium ${urgency.color}`}>{stockDays}</span>
                            {stockDays <= 7 && (
                                <Badge variant="destructive" className="text-xs">
                                    Urgent
                                </Badge>
                            )}
                        </div>
                    )
                },
            },
            {
                accessorKey: "marketShare",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 lg:px-3"
                    >
                        Market Share
                        {column.getIsSorted() === "asc" ? (
                            <ArrowUp className="ml-2 h-4 w-4" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ArrowDown className="ml-2 h-4 w-4" />
                        ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                ),
                cell: ({ row }) => {
                    const marketShare = row.getValue("marketShare") as number
                    return (
                        <div className="w-20">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">{marketShare}%</span>
                            </div>
                            <Progress value={marketShare} className="h-2" />
                        </div>
                    )
                },
            },
            {
                accessorKey: "velocity",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 lg:px-3"
                    >
                        Velocity
                        {column.getIsSorted() === "asc" ? (
                            <ArrowUp className="ml-2 h-4 w-4" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ArrowDown className="ml-2 h-4 w-4" />
                        ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-600" />
                        <span className="font-medium">{row.getValue("velocity")}%</span>
                    </div>
                ),
            },
            {
                accessorKey: "revenueImpact",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 lg:px-3"
                    >
                        Revenue Impact
                        {column.getIsSorted() === "asc" ? (
                            <ArrowUp className="ml-2 h-4 w-4" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ArrowDown className="ml-2 h-4 w-4" />
                        ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                ),
                cell: ({ row }) => {
                    const impact = row.getValue("revenueImpact") as number
                    return <span className="font-bold">KES {(impact / 1000).toLocaleString()}K</span>
                },
            },
            {
                accessorKey: "context",
                header: "Context",
                cell: ({ row }) => {
                    const distributor = row.original
                    return (
                        <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-slate-500" />
                                <span>{distributor.nearbyVenues}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-slate-500" />
                                <span>{distributor.tourismIndex}%</span>
                            </div>
                        </div>
                    )
                },
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <Button variant="outline" size="sm" onClick={() => onDistributorSelect(row.original.id)} className="h-8">
                        <Eye className="mr-2 h-3 w-3" />
                        View
                    </Button>
                ),
            },
        ],
        [onDistributorSelect],
    )

    const table = useReactTable({
        data: distributors,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: 20,
            },
        },
    })

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Package className="h-6 w-6 text-slate-600" />
                        Distribution Network ({distributors.length} distributors)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Table */}
                    <div className="rounded-md border">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id} className="border-b bg-slate-50/50">
                                            {headerGroup.headers.map((header) => (
                                                <th key={header.id} className="h-12 px-4 text-left align-middle font-medium text-slate-600">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row, index) => (
                                            <motion.tr
                                                key={row.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                                className="border-b hover:bg-slate-50/50 cursor-pointer transition-colors"
                                                onClick={() => onDistributorSelect(row.original.id)}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <td key={cell.id} className="p-4 align-middle">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={columns.length} className="h-24 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Package className="h-8 w-8 text-slate-400 mb-2" />
                                                    <span className="text-slate-500">No distributors found</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm text-slate-600">
                                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                                {Math.min(
                                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                    table.getFilteredRowModel().rows.length,
                                )}{" "}
                                of {table.getFilteredRowModel().rows.length} distributors
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-slate-600">Page</span>
                                <span className="text-sm font-medium">
                                    {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                </span>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
