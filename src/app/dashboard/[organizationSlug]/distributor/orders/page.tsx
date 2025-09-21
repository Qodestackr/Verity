"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
    ArrowUpDown,
    ChevronDown,
    Clock,
    Filter,
    Package,
    Search,
    Truck,
    CheckCircle2,
    AlertCircle,
    ClipboardList,
    RefreshCw,
    Eye,
} from "lucide-react"


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

// Mock data for orders
interface OrderItem {
    id: string
    name: string
    sku: string
    quantity: number
    price: number
    total: number
}

interface Order {
    id: string
    orderNumber: string
    retailer: {
        id: string
        name: string
        email: string
        phone: string
        address: string
    }
    date: string
    status: "pending" | "processing" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled"
    items: OrderItem[]
    total: number
    assignedTo?: {
        id: string
        name: string
        avatar: string
    }
    deliveryDate?: string
    specialInstructions?: string
    paymentStatus: "paid" | "unpaid"
    lastUpdated: string
}

// Mock data for staff
interface Staff {
    id: string
    name: string
    avatar: string
    role: string
    ordersProcessed: number
}

// Generate mock data
const mockOrders: Order[] = [
    {
        id: "ord-001",
        orderNumber: "PO-2023-001",
        retailer: {
            id: "ret-001",
            name: "Downtown Liquor Store",
            email: "downtown@example.com",
            phone: "+254712345678",
            address: "123 Main St, Nairobi",
        },
        date: "2023-11-25T10:30:00",
        status: "pending",
        items: [
            {
                id: "item-001",
                name: "Tusker Lager",
                sku: "TL-001",
                quantity: 24,
                price: 150,
                total: 360_0,
            },
            {
                id: "item-002",
                name: "Johnnie Walker Black Label",
                sku: "JW-001",
                quantity: 6,
                price: 3500,
                total: 21000,
            },
        ],
        total: 24600,
        deliveryDate: "2023-11-27",
        specialInstructions: "Please deliver before noon",
        paymentStatus: "unpaid",
        lastUpdated: "2023-11-25T10:30:00",
    },
    {
        id: "ord-002",
        orderNumber: "PO-2023-002",
        retailer: {
            id: "ret-002",
            name: "Westlands Wine & Spirits",
            email: "westlands@example.com",
            phone: "+254723456789",
            address: "456 Westlands Rd, Nairobi",
        },
        date: "2023-11-24T14:15:00",
        status: "confirmed",
        assignedTo: {
            id: "staff-001",
            name: "John Doe",
            avatar: "/placeholder.svg?height=32&width=32",
        },
        items: [
            {
                id: "item-003",
                name: "Heineken",
                sku: "HK-001",
                quantity: 48,
                price: 180,
                total: 8640,
            },
            {
                id: "item-004",
                name: "Absolut Vodka",
                sku: "AV-001",
                quantity: 12,
                price: 2200,
                total: 26400,
            },
        ],
        total: 35040,
        deliveryDate: "2023-11-26",
        paymentStatus: "paid",
        lastUpdated: "2023-11-24T16:45:00",
    },
    {
        id: "ord-003",
        orderNumber: "PO-2023-003",
        retailer: {
            id: "ret-003",
            name: "Karen Wines & Spirits",
            email: "karen@example.com",
            phone: "+254734567890",
            address: "789 Karen Rd, Nairobi",
        },
        date: "2023-11-23T09:45:00",
        status: "packed",
        assignedTo: {
            id: "staff-002",
            name: "Jane Smith",
            avatar: "/placeholder.svg?height=32&width=32",
        },
        items: [
            {
                id: "item-005",
                name: "Glenfiddich 12 Year",
                sku: "GF-001",
                quantity: 6,
                price: 4500,
                total: 27000,
            },
            {
                id: "item-006",
                name: "Moet & Chandon",
                sku: "MC-001",
                quantity: 6,
                price: 7000,
                total: 42000,
            },
        ],
        total: 69000,
        deliveryDate: "2023-11-25",
        specialInstructions: "Fragile items, handle with care",
        paymentStatus: "paid",
        lastUpdated: "2023-11-24T11:30:00",
    },
    {
        id: "ord-004",
        orderNumber: "PO-2023-004",
        retailer: {
            id: "ret-004",
            name: "Eastleigh Beverages",
            email: "eastleigh@example.com",
            phone: "+254745678901",
            address: "101 Eastleigh Ave, Nairobi",
        },
        date: "2023-11-22T16:20:00",
        status: "shipped",
        assignedTo: {
            id: "staff-003",
            name: "David Kamau",
            avatar: "/placeholder.svg?height=32&width=32",
        },
        items: [
            {
                id: "item-007",
                name: "White Cap Lager",
                sku: "WC-001",
                quantity: 48,
                price: 160,
                total: 7680,
            },
            {
                id: "item-008",
                name: "Smirnoff Vodka",
                sku: "SV-001",
                quantity: 12,
                price: 1800,
                total: 21600,
            },
        ],
        total: 29280,
        deliveryDate: "2023-11-24",
        paymentStatus: "paid",
        lastUpdated: "2023-11-23T10:15:00",
    },
    {
        id: "ord-005",
        orderNumber: "PO-2023-005",
        retailer: {
            id: "ret-005",
            name: "Kilimani Liquor Store",
            email: "kilimani@example.com",
            phone: "+254756789012",
            address: "202 Kilimani Rd, Nairobi",
        },
        date: "2023-11-21T11:10:00",
        status: "delivered",
        assignedTo: {
            id: "staff-001",
            name: "John Doe",
            avatar: "/placeholder.svg?height=32&width=32",
        },
        items: [
            {
                id: "item-009",
                name: "Jameson Irish Whiskey",
                sku: "JIW-001",
                quantity: 12,
                price: 2800,
                total: 3360_0,
            },
            {
                id: "item-010",
                name: "Baileys Original",
                sku: "BO-001",
                quantity: 6,
                price: 2500,
                total: 15000,
            },
        ],
        total: 48600,
        deliveryDate: "2023-11-23",
        paymentStatus: "paid",
        lastUpdated: "2023-11-23T15:45:00",
    },
]

function OrderStatusBadge({ status }: { status: Order["status"] }) {
    switch (status) {
        case "pending":
            return (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                </Badge>
            )
        case "processing":
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Processing
                </Badge>
            )
        case "confirmed":
            return (
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Confirmed
                </Badge>
            )
        case "packed":
            return (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    <Package className="h-3 w-3 mr-1" />
                    Packed
                </Badge>
            )
        case "shipped":
            return (
                <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                    <Truck className="h-3 w-3 mr-1" />
                    Shipped
                </Badge>
            )
        case "delivered":
            return (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Delivered
                </Badge>
            )
        case "cancelled":
            return (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Cancelled
                </Badge>
            )
        default:
            return <Badge variant="outline">Unknown</Badge>
    }
}

function PaymentStatusBadge({ status }: { status: "paid" | "unpaid" }) {
    return status === "paid" ? (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Paid
        </Badge>
    ) : (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Unpaid
        </Badge>
    )
}

export default function DistributorOrdersPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("all")
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [searchQuery, setSearchQuery] = useState("")

    const organizationSlug = useOrganizationSlug()

    const filteredOrders = mockOrders.filter((order) => {
        if (activeTab === "all") return true
        if (activeTab === "unassigned") return !order.assignedTo
        if (activeTab === "assigned") return !!order.assignedTo
        return order.status === activeTab
    })

    const columns: ColumnDef<Order>[] = [
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
                    onClick={(e) => e.stopPropagation()}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "orderNumber",
            header: "Order #",
            cell: ({ row }) => <div className="font-medium">{row.getValue("orderNumber")}</div>,
        },
        {
            accessorKey: "retailer.name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="p-0 hover:bg-transparent"
                    >
                        Retailer
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.retailer.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.retailer.phone}</span>
                </div>
            ),
        },
        {
            accessorKey: "date",
            header: "Order Date",
            cell: ({ row }) => {
                const date = new Date(row.getValue("date"))
                return <div>{format(date, "MMM d, yyyy")}</div>
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <OrderStatusBadge status={row.getValue("status")} />,
        },
        {
            accessorKey: "total",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="p-0 hover:bg-transparent"
                    >
                        Total
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const amount = Number.parseFloat(row.getValue("total"))
                const formatted = new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                }).format(amount)
                return <div className="font-medium">{formatted}</div>
            },
        },
        {
            accessorKey: "paymentStatus",
            header: "Payment",
            cell: ({ row }) => <PaymentStatusBadge status={row.getValue("paymentStatus")} />,
        },
        {
            accessorKey: "assignedTo",
            header: "Assigned To",
            cell: ({ row }) => {
                const assignedTo = row.original.assignedTo
                return assignedTo ? (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={assignedTo.avatar || "/placeholder.svg"} alt={assignedTo.name} />
                            <AvatarFallback>{assignedTo.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{assignedTo.name}</span>
                    </div>
                ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                        Unassigned
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const order = row.original

                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/dashboard/${organizationSlug}/distributor/orders/${order.id}`)
                            }}
                            title="View Details"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data: filteredOrders,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })


    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Order Management</h1>
                    <p className="text-muted-foreground">Process and manage retailer orders</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button size="sm">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Generate Report
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>Orders</CardTitle>
                            <CardDescription>Manage and process retailer orders</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search orders..."
                                    className="pl-8 h-9"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        table.setGlobalFilter(e.target.value)
                                    }}
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-9">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem
                                        checked={columnFilters.some((filter) => filter.id === "status" && filter.value === "pending")}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                table.getColumn("status")?.setFilterValue("pending")
                                            } else {
                                                table.getColumn("status")?.setFilterValue(null)
                                            }
                                        }}
                                    >
                                        Pending
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={columnFilters.some((filter) => filter.id === "status" && filter.value === "confirmed")}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                table.getColumn("status")?.setFilterValue("confirmed")
                                            } else {
                                                table.getColumn("status")?.setFilterValue(null)
                                            }
                                        }}
                                    >
                                        Confirmed
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={columnFilters.some((filter) => filter.id === "status" && filter.value === "shipped")}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                table.getColumn("status")?.setFilterValue("shipped")
                                            } else {
                                                table.getColumn("status")?.setFilterValue(null)
                                            }
                                        }}
                                    >
                                        Shipped
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Filter by Payment</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem
                                        checked={columnFilters.some((filter) => filter.id === "paymentStatus" && filter.value === "paid")}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                table.getColumn("paymentStatus")?.setFilterValue("paid")
                                            } else {
                                                table.getColumn("paymentStatus")?.setFilterValue(null)
                                            }
                                        }}
                                    >
                                        Paid
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={columnFilters.some((filter) => filter.id === "paymentStatus" && filter.value === "unpaid")}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                table.getColumn("paymentStatus")?.setFilterValue("unpaid")
                                            } else {
                                                table.getColumn("paymentStatus")?.setFilterValue(null)
                                            }
                                        }}
                                    >
                                        Unpaid
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">All Orders</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="processing">Processing</TabsTrigger>
                            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                            <TabsTrigger value="packed">Packed</TabsTrigger>
                            <TabsTrigger value="shipped">Shipped</TabsTrigger>
                            <TabsTrigger value="delivered">Delivered</TabsTrigger>
                            <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all">
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
                                                <TableRow
                                                    key={row.id}
                                                    data-state={row.getIsSelected() && "selected"}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => router.push(`/dashboard/${organizationSlug}/distributor/orders/${row.original.id}`)}
                                                >
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell key={cell.id}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
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
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <div className="text-sm text-muted-foreground">
                                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                                    selected.
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
                        </TabsContent>
                        {/* Other tab contents would be identical to the "all" tab but with filtered data */}
                        <TabsContent value="pending">{/* Same table structure as "all" tab */}</TabsContent>
                        <TabsContent value="processing">{/* Same table structure as "all" tab */}</TabsContent>
                        <TabsContent value="confirmed">{/* Same table structure as "all" tab */}</TabsContent>
                        <TabsContent value="packed">{/* Same table structure as "all" tab */}</TabsContent>
                        <TabsContent value="shipped">{/* Same table structure as "all" tab */}</TabsContent>
                        <TabsContent value="delivered">{/* Same table structure as "all" tab */}</TabsContent>
                        <TabsContent value="unassigned">{/* Same table structure as "all" tab */}</TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
