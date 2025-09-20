"use client"

import { useState, useMemo } from "react"
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
} from "@tanstack/react-table"
import { useCurrency } from "@/hooks/useCurrency";
import { useLogisticsStore, type OrderStatus, type Order } from "@/stores/logistics-store"
import { formatTime } from "@/utils/timezones"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Search,
    MapPin,
    Clock,
    User,
    Phone,
    MessageCircle,
    CheckCircle2,
    Truck,
    Package,
    AlertCircle,
    ChevronDown,
    Filter,
    MoreHorizontal,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function OrderTracking() {
    const { formatCurrency } = useCurrency();

    const { orders, setSelectedOrder, selectedOrder, assignRiderToOrder, updateOrderStatus, riders } = useLogisticsStore()
    const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

    const availableRiders = riders.filter((rider) => rider.status === "available")

    // Status helpers
    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case "new":
                return <Clock className="h-4 w-4 text-blue-500" />
            case "assigned":
                return <User className="h-4 w-4 text-amber-500" />
            case "picked_up":
                return <Package className="h-4 w-4 text-purple-500" />
            case "in_transit":
                return <Truck className="h-4 w-4 text-orange-500" />
            case "delivered":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case "cancelled":
                return <AlertCircle className="h-4 w-4 text-red-500" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    const getStatusBadge = (status: OrderStatus) => {
        const variants = {
            new: "bg-blue-500/10 text-blue-500 border-blue-200",
            assigned: "bg-amber-500/10 text-amber-500 border-amber-200",
            picked_up: "bg-purple-500/10 text-purple-500 border-purple-200",
            in_transit: "bg-orange-500/10 text-orange-500 border-orange-200",
            delivered: "bg-green-500/10 text-green-500 border-green-200",
            cancelled: "bg-red-500/10 text-red-500 border-red-200",
        }

        return (
            <Badge variant="outline" className={`text-xs h-5 ${variants[status]}`}>
                {status.replace("_", " ")}
            </Badge>
        )
    }

    // Filter orders based on status filter
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => statusFilter === "all" || order.status === statusFilter)
    }, [orders, statusFilter])

    // Table columns definition
    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: "id",
            header: "Order ID",
            cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
        },
        {
            accessorKey: "customer.name",
            header: "Customer",
            cell: ({ row }) => {
                const order = row.original
                return (
                    <div>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{order.customer.location}</span>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as OrderStatus
                return (
                    <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        {getStatusBadge(status)}
                    </div>
                )
            },
            filterFn: (row, id, value) => {
                return value === "all" || row.getValue(id) === value
            },
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => formatTime(row.getValue("date")),
        },
        {
            accessorKey: "total",
            header: "Total",
            cell: ({ row }) => formatCurrency(row.getValue("total")),
        },
        {
            accessorKey: "assignedRider",
            header: "Rider",
            cell: ({ row }) => {
                const rider = row.original.assignedRider
                if (!rider) return <span className="text-muted-foreground text-xs">Not assigned</span>

                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={rider.avatar || "/placeholder.svg"} alt={rider.name} />
                            <AvatarFallback className="text-xs">
                                {rider.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{rider.name}</span>
                    </div>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const order = row.original
                const isExpanded = expandedOrderId === order.id

                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        >
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedOrder(order)}>View Details</DropdownMenuItem>
                                {!order.assignedRider && availableRiders.length > 0 && (
                                    <DropdownMenuItem onClick={() => assignRiderToOrder(order.id, availableRiders[0].id)}>
                                        Assign Rider
                                    </DropdownMenuItem>
                                )}
                                {order.status === "new" && (
                                    <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "assigned")}>
                                        Mark Assigned
                                    </DropdownMenuItem>
                                )}
                                {order.status === "assigned" && (
                                    <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "picked_up")}>
                                        Mark Picked Up
                                    </DropdownMenuItem>
                                )}
                                {order.status === "picked_up" && (
                                    <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "in_transit")}>
                                        Mark In Transit
                                    </DropdownMenuItem>
                                )}
                                {order.status === "in_transit" && (
                                    <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "delivered")}>
                                        Mark Delivered
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ]

    // Initialize the table
    const table = useReactTable({
        data: filteredOrders,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    // Expanded row component
    const ExpandedRow = ({ order }: { order: Order }) => {
        return (
            <div className="p-4 bg-muted/30 rounded-md space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Order Items */}
                    <div>
                        <h4 className="font-medium mb-2 text-sm">Items ({order.products.length})</h4>
                        <div className="space-y-1">
                            {order.products.map((product) => (
                                <div key={product.id} className="flex justify-between text-sm">
                                    <span>
                                        {product.quantity}x {product.name}
                                    </span>
                                    <span>{formatCurrency(product.price * product.quantity)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                        <h4 className="font-medium mb-2 text-sm">Customer Details</h4>
                        <div className="space-y-1 text-sm">
                            <p>{order.customer.name}</p>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{order.customer.phone}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{order.customer.address}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tracking Updates */}
                {order.trackingUpdates.length > 0 && (
                    <div>
                        <h4 className="font-medium mb-2 text-sm">Tracking History</h4>
                        <div className="space-y-2">
                            {order.trackingUpdates.map((update) => (
                                <div key={update.id} className="flex items-start gap-2 text-sm">
                                    <div className="mt-1">{getStatusIcon(update.status)}</div>
                                    <div className="flex-1">
                                        <p>{update.message}</p>
                                        <p className="text-xs text-muted-foreground">{formatTime(update.timestamp)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    {!order.assignedRider && availableRiders.length > 0 && (
                        <Button size="sm" onClick={() => assignRiderToOrder(order.id, availableRiders[0].id)}>
                            Assign Rider
                        </Button>
                    )}
                    {order.status === "new" && (
                        <Button size="sm" onClick={() => updateOrderStatus(order.id, "assigned")}>
                            Mark Assigned
                        </Button>
                    )}
                    {order.status === "assigned" && (
                        <Button size="sm" onClick={() => updateOrderStatus(order.id, "picked_up")}>
                            Mark Picked Up
                        </Button>
                    )}
                    {order.status === "picked_up" && (
                        <Button size="sm" onClick={() => updateOrderStatus(order.id, "in_transit")}>
                            In Transit
                        </Button>
                    )}
                    {order.status === "in_transit" && (
                        <Button size="sm" onClick={() => updateOrderStatus(order.id, "delivered")}>
                            Mark Delivered
                        </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                        View Full Details
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="picked_up">Picked Up</SelectItem>
                            <SelectItem value="in_transit">In Transit</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                        <Filter className="h-4 w-4 mr-2" />
                        Advanced Filters
                    </Button>
                    <Button size="sm" className="whitespace-nowrap">
                        <Package className="h-4 w-4 mr-2" />
                        New Order
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Orders Table */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Orders ({filteredOrders.length})</CardTitle>
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
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <>
                                                <TableRow
                                                    key={row.id}
                                                    data-state={row.getIsSelected() && "selected"}
                                                    className={selectedOrder?.id === row.original.id ? "bg-primary/5" : ""}
                                                    onClick={() => setSelectedOrder(row.original)}
                                                >
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell key={cell.id}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                                {expandedOrderId === row.original.id && (
                                                    <TableRow>
                                                        <TableCell colSpan={columns.length} className="p-0">
                                                            <ExpandedRow order={row.original} />
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                No orders found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex items-center justify-between p-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {table.getFilteredRowModel().rows.length} of {orders.length} orders
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    Previous
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Details */}
                {selectedOrder && (
                    <Card className="md:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Order {selectedOrder.id}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Customer Info */}
                                <div>
                                    <h4 className="font-medium mb-2">Customer</h4>
                                    <div className="space-y-1 text-sm">
                                        <p>{selectedOrder.customer.name}</p>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Phone className="h-3 w-3" />
                                            <span>{selectedOrder.customer.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            <span>{selectedOrder.customer.address}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h4 className="font-medium mb-2">Items ({selectedOrder.products.length})</h4>
                                    <div className="space-y-2">
                                        {selectedOrder.products.map((product) => (
                                            <div key={product.id} className="flex justify-between text-sm">
                                                <span>
                                                    {product.quantity}x {product.name}
                                                </span>
                                                <span>{formatCurrency(product.price * product.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Assigned Rider */}
                                {selectedOrder.assignedRider ? (
                                    <div>
                                        <h4 className="font-medium mb-2">Assigned Rider</h4>
                                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                            <div>
                                                <p className="font-medium text-sm">{selectedOrder.assignedRider.name}</p>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Phone className="h-3 w-3" />
                                                    <span>{selectedOrder.assignedRider.phone}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="outline" className="h-8 w-8">
                                                    <Phone className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="outline" className="h-8 w-8">
                                                    <MessageCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h4 className="font-medium mb-2">Assign Rider</h4>
                                        <div className="space-y-2">
                                            {availableRiders.slice(0, 3).map((rider) => (
                                                <div
                                                    key={rider.id}
                                                    className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-muted/50"
                                                    onClick={() => assignRiderToOrder(selectedOrder.id, rider.id)}
                                                >
                                                    <div>
                                                        <p className="font-medium text-sm">{rider.name}</p>
                                                        <p className="text-xs text-muted-foreground">{rider.currentLocation}</p>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        {rider.vehicleType}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Status Actions */}
                                <div>
                                    <h4 className="font-medium mb-2">Update Status</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedOrder.status === "new" && (
                                            <Button size="sm" onClick={() => updateOrderStatus(selectedOrder.id, "assigned")}>
                                                Mark Assigned
                                            </Button>
                                        )}
                                        {selectedOrder.status === "assigned" && (
                                            <Button size="sm" onClick={() => updateOrderStatus(selectedOrder.id, "picked_up")}>
                                                Mark Picked Up
                                            </Button>
                                        )}
                                        {selectedOrder.status === "picked_up" && (
                                            <Button size="sm" onClick={() => updateOrderStatus(selectedOrder.id, "in_transit")}>
                                                In Transit
                                            </Button>
                                        )}
                                        {selectedOrder.status === "in_transit" && (
                                            <Button size="sm" onClick={() => updateOrderStatus(selectedOrder.id, "delivered")}>
                                                Mark Delivered
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Tracking History */}
                                <div>
                                    <h4 className="font-medium mb-2">Tracking History</h4>
                                    <div className="space-y-2">
                                        {selectedOrder.trackingUpdates.map((update) => (
                                            <div key={update.id} className="flex items-start gap-2 text-sm">
                                                <div className="mt-1">{getStatusIcon(update.status)}</div>
                                                <div className="flex-1">
                                                    <p>{update.message}</p>
                                                    <p className="text-xs text-muted-foreground">{formatTime(update.timestamp)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
