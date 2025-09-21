"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Filter,
    ArrowUpDown,
    MoreHorizontal,
    FileText,
    Truck,
    CheckCircle2,
    Clock,
    Package,
    AlertCircle,
    X,
    User,
    MapPin,
    Phone,
    Star,
    Bike,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    EyeOff,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/utils/currency"

type OrderStatus = "new" | "assigned" | "picked_up" | "in_transit" | "delivered" | "cancelled"
type PaymentStatus = "paid" | "pending" | "not_paid"
type PaymentMethod = "mpesa" | "credit" | "cash_on_delivery"

interface Product {
    id: string
    name: string
    quantity: number
    price: number
    unit: string
    category: string
}

interface Customer {
    name: string
    phone: string
    location: string
    address: string
    coordinates: {
        lat: number
        lng: number
    }
}

interface Rider {
    id: string
    name: string
    phone: string
    rating: number
    completedDeliveries: number
    currentLocation: string
    isOnline: boolean
    estimatedArrival: string
    vehicleType: "bike" | "car" | "scooter"
    avatar: string
}

interface Order {
    id: string
    date: string
    customer: Customer
    products: Product[]
    total: number
    status: OrderStatus
    paymentStatus: PaymentStatus
    paymentMethod: PaymentMethod
    deliveryFee: number
    estimatedDelivery: string
    notes: string
    assignedRider?: Rider
    storeLocation: string
}
interface BulkActionsProps {
    selectedCount: number
    onClearSelection: () => void
    onAssignRider: () => void
    onMarkAsReady: () => void
    onCancelOrders: () => void
}

function BulkActions({
    selectedCount,
    onClearSelection,
    onAssignRider,
    onMarkAsReady,
    onCancelOrders,
}: BulkActionsProps) {
    return (
        <Card className="py-0 p-1 bg-blue-50 border-blue-200">
            <CardContent className="p-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={onClearSelection} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-normal">{selectedCount} orders selected</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700 h-6 font-light text-xs"
                        onClick={onAssignRider}
                    >
                        <Truck className="h-4 w-4 " />
                        Assign Rider
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700 h-7 text-xs"
                        onClick={onMarkAsReady}
                    >
                        <Package className="h-4 w-4 " />
                        Mark Ready
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onCancelOrders}>
                        <AlertCircle className="h-4 w-4 " />
                        Cancel Orders
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// Rider Selection Dialog Component
interface RiderSelectionDialogProps {
    isOpen: boolean
    onClose: () => void
    onSelectRider: (rider: Rider) => void
    availableRiders: Rider[]
}

function RiderSelectionDialog({ isOpen, onClose, onSelectRider, availableRiders }: RiderSelectionDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Rider</DialogTitle>
                    <DialogDescription>Select a rider from the available queue to assign this order</DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[400px]">
                    <div className="space-y-3 mx-4">
                        {availableRiders.map((rider) => (
                            <div
                                key={rider.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                                onClick={() => onSelectRider(rider)}
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-normal">{rider.name}</span>
                                        <Badge variant="outline" className="text-xs h-4 font-light">
                                            <Bike className="h-3 w-3 " />
                                            {rider.vehicleType}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <span>{rider.rating}</span>
                                        <span>•</span>
                                        <span>{rider.completedDeliveries} deliveries</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span>{rider.currentLocation}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-normal text-green-600">ETA: {rider.estimatedArrival}</div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Phone className="h-3 w-3" />
                                        <span>{rider.phone}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function OrdersPage() {
    const [data, setData] = useState<Order[]>(mockOrders)
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [globalFilter, setGlobalFilter] = useState("")

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)
    const [isRiderSelectionOpen, setIsRiderSelectionOpen] = useState(false)
    const [orderToAssign, setOrderToAssign] = useState<Order | null>(null)


    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "MMM d, yyyy")
    }

    const formatTime = (dateString: string) => {
        return format(new Date(dateString), "h:mm a")
    }

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
                return <X className="h-4 w-4 text-red-500" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    const getStatusBadge = (status: OrderStatus) => {
        switch (status) {
            case "new":
                return (
                    <Badge variant="outline" className="text-xs h-4 font-light bg-blue-500/10 text-blue-500 border-blue-200">
                        New Order
                    </Badge>
                )
            case "assigned":
                return (
                    <Badge variant="outline" className="text-xs h-4 font-light bg-amber-500/10 text-amber-500 border-amber-200">
                        Assigned
                    </Badge>
                )
            case "picked_up":
                return (
                    <Badge variant="outline" className="text-xs h-4 font-light bg-purple-500/10 text-purple-500 border-purple-200">
                        Picked Up
                    </Badge>
                )
            case "in_transit":
                return (
                    <Badge variant="outline" className="text-xs h-4 font-light bg-orange-500/10 text-orange-500 border-orange-200">
                        In Transit
                    </Badge>
                )
            case "delivered":
                return (
                    <Badge variant="outline" className="text-xs h-4 font-light bg-green-500/10 text-green-500 border-green-200">
                        Delivered
                    </Badge>
                )
            case "cancelled":
                return (
                    <Badge variant="outline" className="text-xs h-4 font-light bg-red-500/10 text-red-500 border-red-200">
                        Cancelled
                    </Badge>
                )
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    const getPaymentStatusBadge = (status: PaymentStatus) => {
        switch (status) {
            case "paid":
                return (
                    <Badge variant="outline" className="text-xs h-4 font-light bg-green-500/10 text-green-500 border-green-200">
                        Paid
                    </Badge>
                )
            case "pending":
                return (
                    <Badge variant="outline" className="text-xs h-4 font-light bg-amber-500/10 text-amber-500 border-amber-200">
                        Pending
                    </Badge>
                )
            case "not_paid":
                return (
                    <Badge variant="outline" className="text-xs h-4 font-light bg-red-500/10 text-red-500 border-red-200">
                        Not Paid
                    </Badge>
                )
            default:
                return <Badge variant="outline" className="text-xs h-4 font-light">Unknown</Badge>
        }
    }

    const handleViewOrderDetails = (order: Order) => {
        setSelectedOrder(order)
        setIsOrderDetailsOpen(true)
    }

    const handleAssignRider = (order: Order) => {
        setOrderToAssign(order)
        setIsRiderSelectionOpen(true)
    }

    const handleRiderSelection = (rider: Rider) => {
        if (orderToAssign) {
            const updatedData = data.map((order) =>
                order.id === orderToAssign.id ? { ...order, assignedRider: rider, status: "assigned" as OrderStatus } : order,
            )
            setData(updatedData)
            setIsRiderSelectionOpen(false)
            setOrderToAssign(null)
        }
    }

    const handleBulkAssignRider = () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows
        if (selectedRows.length > 0) {
            const firstRider = availableRiders[0]
            if (firstRider) {
                const selectedIds = selectedRows.map((row) => row.original.id)
                const updatedData = data.map((order) =>
                    selectedIds.includes(order.id)
                        ? { ...order, assignedRider: firstRider, status: "assigned" as OrderStatus }
                        : order,
                )
                setData(updatedData)
                setRowSelection({})
            }
        }
    }

    const handleBulkMarkAsReady = () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows
        const selectedIds = selectedRows.map((row) => row.original.id)
        const updatedData = data.map((order) =>
            selectedIds.includes(order.id) && order.status === "new"
                ? { ...order, status: "assigned" as OrderStatus }
                : order,
        )
        setData(updatedData)
        setRowSelection({})
    }

    const handleBulkCancelOrders = () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows
        const selectedIds = selectedRows.map((row) => row.original.id)
        const updatedData = data.map((order) =>
            selectedIds.includes(order.id) ? { ...order, status: "cancelled" as OrderStatus } : order,
        )
        setData(updatedData)
        setRowSelection({})
    }

    const columns: ColumnDef<Order>[] = useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "id",
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="h-8 px-2"
                        >
                            Order ID
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    )
                },
                cell: ({ row }) => <div className="font-normal">{row.getValue("id")}</div>,
            },
            {
                accessorKey: "customer",
                header: "Customer",
                cell: ({ row }) => {
                    const customer = row.getValue("customer") as Customer
                    return (
                        <div>
                            <div className="font-normal">{customer.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {customer.location}
                            </div>
                        </div>
                    )
                },
                filterFn: (row, id, value) => {
                    const customer = row.getValue(id) as Customer
                    return (
                        customer.name.toLowerCase().includes(value.toLowerCase()) ||
                        customer.phone.includes(value) ||
                        customer.location.toLowerCase().includes(value.toLowerCase())
                    )
                },
            },
            {
                accessorKey: "products",
                header: "Items",
                cell: ({ row }) => {
                    const products = row.getValue("products") as Product[]
                    return (
                        <div>
                            <div className="text-sm">{products.length} items</div>
                            <div className="text-xs text-muted-foreground">
                                {products
                                    .slice(0, 2)
                                    .map((p) => p.name)
                                    .join(", ")}
                                {products.length > 2 && "..."}
                            </div>
                        </div>
                    )
                },
                enableSorting: false,
            },
            {
                accessorKey: "total",
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="h-8 px-2 ml-auto"
                        >
                            Total
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    )
                },
                cell: ({ row }) => {
                    const total = Number.parseFloat(row.getValue("total"))
                    const deliveryFee = row.original.deliveryFee
                    return (
                        <div className="text-right">
                            <div className="font-normal">{formatCurrency(total)}</div>
                            <div className="text-xs text-muted-foreground">+{formatCurrency(deliveryFee)} delivery</div>
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
                    return value.includes(row.getValue(id))
                },
            },
            {
                accessorKey: "paymentStatus",
                header: "Payment",
                cell: ({ row }) => {
                    const paymentStatus = row.getValue("paymentStatus") as PaymentStatus
                    const paymentMethod = row.original.paymentMethod
                    return (
                        <div>
                            {getPaymentStatusBadge(paymentStatus)}
                            <div className="text-xs text-muted-foreground">
                                {paymentMethod === "mpesa" ? "M-Pesa" : paymentMethod === "credit" ? "Credit" : "Cash on Delivery"}
                            </div>
                        </div>
                    )
                },
                filterFn: (row, id, value) => {
                    return value.includes(row.getValue(id))
                },
            },
            {
                accessorKey: "assignedRider",
                header: "Rider",
                cell: ({ row }) => {
                    const rider = row.getValue("assignedRider") as Rider | undefined
                    const order = row.original

                    if (rider) {
                        return (
                            <div className="text-x font-normal">{rider.name}</div>
                        )
                    }

                    return (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAssignRider(order)}
                            disabled={order.status === "delivered" || order.status === "cancelled"}
                            className="h-6 text-xs font-light"
                        >
                            <User className="h-2 w-2" />
                            Assign
                        </Button>
                    )
                },
                enableSorting: false,
            },
            {
                accessorKey: "date",
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="h-8 px-2"
                        >
                            Date
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    )
                },
                cell: ({ row }) => {
                    const date = row.getValue("date") as string
                    return (
                        <div>
                            <div className="text-sm">{formatDate(date)}</div>
                            <div className="text-xs text-muted-foreground">{formatTime(date)}</div>
                        </div>
                    )
                },
            },
            {
                id: "actions",
                enableHiding: false,
                cell: ({ row }) => {
                    const order = row.original

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewOrderDetails(order)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Details
                                </DropdownMenuItem>
                                {order.status === "new" && (
                                    <DropdownMenuItem onClick={() => handleAssignRider(order)}>
                                        <User className="mr-2 h-4 w-4" />
                                        Assign Rider
                                    </DropdownMenuItem>
                                )}
                                {(order.status === "assigned" || order.status === "picked_up") && (
                                    <DropdownMenuItem>
                                        <Truck className="mr-2 h-4 w-4" />
                                        Track Order
                                    </DropdownMenuItem>
                                )}
                                {order.status !== "delivered" && order.status !== "cancelled" && (
                                    <DropdownMenuItem className="text-red-600">
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel Order
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                },
            },
        ],
        [data],
    )

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    })

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-light">Manage Online/Arriving Orders</h1>
                    <p className="text-muted-foreground">Manage liquor delivery orders and assign riders</p>
                </div>
                {Object.keys(rowSelection).length > 0 && (
                    <BulkActions
                        selectedCount={Object.keys(rowSelection).length}
                        onClearSelection={() => setRowSelection({})}
                        onAssignRider={handleBulkAssignRider}
                        onMarkAsReady={handleBulkMarkAsReady}
                        onCancelOrders={handleBulkCancelOrders}
                    />
                )}
                <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-center space-x-2">
                        <Input
                            placeholder="Search orders..."
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(String(event.target.value))}
                            className="h-8 w-[150px] lg:w-[250px]"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Status
                                    {table.getColumn("status")?.getFilterValue() && (
                                        <Separator orientation="vertical" className="mx-2 h-4" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[200px]">
                                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {["new", "assigned", "picked_up", "in_transit", "delivered", "cancelled"].map((status) => (
                                    <DropdownMenuCheckboxItem
                                        key={status}
                                        className="capitalize"
                                        checked={(table.getColumn("status")?.getFilterValue() as string[])?.includes(status)}
                                        onCheckedChange={(value) => {
                                            const currentFilter = (table.getColumn("status")?.getFilterValue() as string[]) || []
                                            if (value) {
                                                table.getColumn("status")?.setFilterValue([...currentFilter, status])
                                            } else {
                                                table.getColumn("status")?.setFilterValue(currentFilter.filter((s) => s !== status))
                                            }
                                        }}
                                    >
                                        {status.replace("_", " ")}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Payment
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[200px]">
                                <DropdownMenuLabel>Filter by payment</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {["paid", "pending", "not_paid"].map((status) => (
                                    <DropdownMenuCheckboxItem
                                        key={status}
                                        className="capitalize"
                                        checked={(table.getColumn("paymentStatus")?.getFilterValue() as string[])?.includes(status)}
                                        onCheckedChange={(value) => {
                                            const currentFilter = (table.getColumn("paymentStatus")?.getFilterValue() as string[]) || []
                                            if (value) {
                                                table.getColumn("paymentStatus")?.setFilterValue([...currentFilter, status])
                                            } else {
                                                table.getColumn("paymentStatus")?.setFilterValue(currentFilter.filter((s) => s !== status))
                                            }
                                        }}
                                    >
                                        {status.replace("_", " ")}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="ml-auto h-8">
                                <EyeOff className="mr-2 h-4 w-4" />
                                View
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[150px]">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="rounded-md border">
                    <Table className="text-xs">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-between px-2">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                        selected.
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-normal">Rows per page</p>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value))
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-[100px] items-center justify-center text-sm font-normal">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Order Details</DialogTitle>
                            <DialogDescription>Complete information about this order</DialogDescription>
                        </DialogHeader>

                        {selectedOrder && (
                            <ScrollArea className="max-h-[60vh]">
                                <div className="space-y-3 mx-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold">{selectedOrder.id}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Placed on {formatDate(selectedOrder.date)} at {formatTime(selectedOrder.date)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {getStatusBadge(selectedOrder.status)}
                                            {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="text-sm font-normal mb-2">Customer Information</h4>
                                        <div className="space-y-2">
                                            <p>
                                                <span className="text-muted-foreground">Name:</span> {selectedOrder.customer.name}
                                            </p>
                                            <p>
                                                <span className="text-muted-foreground">Phone:</span> {selectedOrder.customer.phone}
                                            </p>
                                            <p>
                                                <span className="text-muted-foreground">Location:</span> {selectedOrder.customer.location}
                                            </p>
                                            <p>
                                                <span className="text-muted-foreground">Address:</span> {selectedOrder.customer.address}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedOrder.assignedRider && (
                                        <>
                                            <Separator />
                                            <div>
                                                <h4 className="text-sm font-normal mb-2">Assigned Rider</h4>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage
                                                            src={selectedOrder.assignedRider.avatar || "/placeholder.svg"}
                                                            alt={selectedOrder.assignedRider.name}
                                                        />
                                                        <AvatarFallback>
                                                            {selectedOrder.assignedRider.name
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-normal">{selectedOrder.assignedRider.name}</p>
                                                        <p className="text-sm text-muted-foreground">{selectedOrder.assignedRider.phone}</p>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span>{selectedOrder.assignedRider.rating}</span>
                                                            <span>•</span>
                                                            <span>{selectedOrder.assignedRider.completedDeliveries} deliveries</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <Separator />

                                    <div>
                                        <h4 className="text-sm font-normal mb-2">Order Items</h4>
                                        <div className="space-y-2">
                                            {selectedOrder.products.map((product) => (
                                                <div key={product.id} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                                                    <div>
                                                        <p className="font-normal">{product.name}</p>
                                                        <p className="text-sm text-muted-foreground">{product.category}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p>
                                                            {product.quantity} {product.unit}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatCurrency(product.price * product.quantity)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <div className="w-64 space-y-2">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span>{formatCurrency(selectedOrder.total - selectedOrder.deliveryFee)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Delivery Fee:</span>
                                                <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-normal">
                                                <span>Total:</span>
                                                <span>{formatCurrency(selectedOrder.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsOrderDetailsOpen(false)}>
                                Close
                            </Button>
                            {selectedOrder && !selectedOrder.assignedRider && selectedOrder.status === "new" && (
                                <Button
                                    onClick={() => {
                                        setIsOrderDetailsOpen(false)
                                        handleAssignRider(selectedOrder)
                                    }}
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Assign Rider
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <RiderSelectionDialog
                    isOpen={isRiderSelectionOpen}
                    onClose={() => setIsRiderSelectionOpen(false)}
                    onSelectRider={handleRiderSelection}
                    availableRiders={availableRiders}
                />
            </div>
        </div>
    )
}

const mockOrders: Order[] = [
    {
        id: "LIQ-2024-001",
        date: "2024-01-27T14:30:00Z",
        customer: {
            name: "John Omondi",
            phone: "+254712345678",
            location: "Westlands",
            address: "Westlands Shopping Mall, 2nd Floor",
            coordinates: { lat: -1.2676, lng: 36.8108 },
        },
        products: [
            { id: "P001", name: "Tusker Lager", quantity: 6, price: 250, unit: "bottles", category: "Beer" },
            { id: "P002", name: "Johnnie Walker Black", quantity: 1, price: 3500, unit: "bottle", category: "Whiskey" },
        ],
        total: 5000,
        status: "new",
        paymentStatus: "paid",
        paymentMethod: "mpesa",
        deliveryFee: 200,
        estimatedDelivery: "2024-01-27T16:00:00Z",
        notes: "Call when you arrive at the gate",
        storeLocation: "Westlands Liquor Store",
    },
    {
        id: "LIQ-2024-002",
        date: "2024-01-27T15:15:00Z",
        customer: {
            name: "Mary Wanjiku",
            phone: "+254723456789",
            location: "Karen",
            address: "Karen Shopping Centre, Ground Floor",
            coordinates: { lat: -1.3197, lng: 36.7085 },
        },
        products: [
            { id: "P003", name: "Heineken", quantity: 12, price: 300, unit: "bottles", category: "Beer" },
            { id: "P004", name: "Smirnoff Vodka", quantity: 1, price: 2800, unit: "bottle", category: "Vodka" },
        ],
        total: 6400,
        status: "assigned",
        paymentStatus: "paid",
        paymentMethod: "mpesa",
        deliveryFee: 300,
        estimatedDelivery: "2024-01-27T17:30:00Z",
        notes: "",
        storeLocation: "Karen Wines & Spirits",
        assignedRider: {
            id: "R001",
            name: "Peter Kimani",
            phone: "+254734567890",
            rating: 4.8,
            completedDeliveries: 156,
            currentLocation: "Karen Road",
            isOnline: true,
            estimatedArrival: "10 mins",
            vehicleType: "bike",
            avatar: "/placeholder.svg?height=40&width=40",
        },
    },
    {
        id: "LIQ-2024-003",
        date: "2024-01-27T13:45:00Z",
        customer: {
            name: "David Mwangi",
            phone: "+254745678901",
            location: "Kilimani",
            address: "Yaya Centre, 1st Floor",
            coordinates: { lat: -1.2921, lng: 36.7853 },
        },
        products: [
            { id: "P005", name: "Corona Extra", quantity: 8, price: 350, unit: "bottles", category: "Beer" },
            { id: "P006", name: "Jack Daniel's", quantity: 1, price: 4200, unit: "bottle", category: "Whiskey" },
        ],
        total: 7000,
        status: "in_transit",
        paymentStatus: "paid",
        paymentMethod: "cash_on_delivery",
        deliveryFee: 250,
        estimatedDelivery: "2024-01-27T15:30:00Z",
        notes: "Apartment 4B, ring the bell",
        storeLocation: "Kilimani Liquor Mart",
        assignedRider: {
            id: "R002",
            name: "Grace Achieng",
            phone: "+254756789012",
            rating: 4.9,
            completedDeliveries: 203,
            currentLocation: "Kilimani Road",
            isOnline: true,
            estimatedArrival: "5 mins",
            vehicleType: "scooter",
            avatar: "/placeholder.svg?height=40&width=40",
        },
    },
    {
        id: "LIQ-2024-004",
        date: "2024-01-27T12:20:00Z",
        customer: {
            name: "Sarah Njeri",
            phone: "+254767890123",
            location: "Parklands",
            address: "Parklands Road, House No. 45",
            coordinates: { lat: -1.263, lng: 36.8583 },
        },
        products: [
            { id: "P007", name: "Guinness Stout", quantity: 4, price: 280, unit: "bottles", category: "Beer" },
            { id: "P008", name: "Baileys Irish Cream", quantity: 1, price: 3200, unit: "bottle", category: "Liqueur" },
        ],
        total: 4320,
        status: "delivered",
        paymentStatus: "paid",
        paymentMethod: "mpesa",
        deliveryFee: 200,
        estimatedDelivery: "2024-01-27T14:00:00Z",
        notes: "",
        storeLocation: "Parklands Wine Shop",
    },
    {
        id: "LIQ-2024-005",
        date: "2024-01-27T16:00:00Z",
        customer: {
            name: "James Otieno",
            phone: "+254778901234",
            location: "Lavington",
            address: "Lavington Mall, 3rd Floor",
            coordinates: { lat: -1.2833, lng: 36.7667 },
        },
        products: [
            { id: "P009", name: "Chivas Regal", quantity: 1, price: 5500, unit: "bottle", category: "Whiskey" },
            { id: "P010", name: "Stella Artois", quantity: 6, price: 320, unit: "bottles", category: "Beer" },
        ],
        total: 7420,
        status: "new",
        paymentStatus: "pending",
        paymentMethod: "mpesa",
        deliveryFee: 300,
        estimatedDelivery: "2024-01-27T18:30:00Z",
        notes: "Office delivery, ask for James at reception",
        storeLocation: "Lavington Spirits",
    },
    {
        id: "LIQ-2024-006",
        date: "2024-01-27T11:00:00Z",
        customer: {
            name: "Agnes Mutindi",
            phone: "+254789012345",
            location: "Eastleigh",
            address: "Eastleigh Section 1, Building 12",
            coordinates: { lat: -1.2833, lng: 36.8667 },
        },
        products: [
            { id: "P011", name: "Tusker Malt", quantity: 4, price: 280, unit: "bottles", category: "Beer" },
            { id: "P012", name: "Jameson Irish Whiskey", quantity: 1, price: 4800, unit: "bottle", category: "Whiskey" },
        ],
        total: 5920,
        status: "picked_up",
        paymentStatus: "paid",
        paymentMethod: "mpesa",
        deliveryFee: 250,
        estimatedDelivery: "2024-01-27T13:30:00Z",
        notes: "Third floor, blue door",
        storeLocation: "Eastleigh Liquor Hub",
        assignedRider: {
            id: "R003",
            name: "Samuel Mutua",
            phone: "+254789012345",
            rating: 4.7,
            completedDeliveries: 134,
            currentLocation: "Eastleigh Road",
            isOnline: true,
            estimatedArrival: "2 mins",
            vehicleType: "bike",
            avatar: "/placeholder.svg?height=40&width=40",
        },
    },
]

const availableRiders: Rider[] = [
    {
        id: "R001",
        name: "Peter Kimani",
        phone: "+254734567890",
        rating: 4.8,
        completedDeliveries: 156,
        currentLocation: "Westlands",
        isOnline: true,
        estimatedArrival: "8 mins",
        vehicleType: "bike",
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        id: "R002",
        name: "Grace Achieng",
        phone: "+254756789012",
        rating: 4.9,
        completedDeliveries: 203,
        currentLocation: "Karen",
        isOnline: true,
        estimatedArrival: "12 mins",
        vehicleType: "scooter",
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        id: "R003",
        name: "Samuel Mutua",
        phone: "+254789012345",
        rating: 4.7,
        completedDeliveries: 134,
        currentLocation: "Kilimani",
        isOnline: true,
        estimatedArrival: "6 mins",
        vehicleType: "bike",
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        id: "R004",
        name: "Lucy Wambui",
        phone: "+254701234567",
        rating: 4.6,
        completedDeliveries: 98,
        currentLocation: "Parklands",
        isOnline: true,
        estimatedArrival: "15 mins",
        vehicleType: "car",
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        id: "R005",
        name: "Michael Ochieng",
        phone: "+254712345678",
        rating: 4.8,
        completedDeliveries: 187,
        currentLocation: "Lavington",
        isOnline: true,
        estimatedArrival: "10 mins",
        vehicleType: "scooter",
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        id: "R006",
        name: "Catherine Nyong'o",
        phone: "+254723456789",
        rating: 4.9,
        completedDeliveries: 245,
        currentLocation: "CBD",
        isOnline: true,
        estimatedArrival: "20 mins",
        vehicleType: "bike",
        avatar: "/placeholder.svg?height=40&width=40",
    },
]
