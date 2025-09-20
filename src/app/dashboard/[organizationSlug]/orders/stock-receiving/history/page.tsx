"use client"

import { useState } from "react"
import {
    Package,
    Search,
    Calendar,
    Truck,
    FileText,
    ChevronDown,
    Eye,
    Download,
    Filter,
    ArrowUpDown,
} from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

interface StockReceipt {
    id: string
    receiptNumber: string
    supplier: {
        name: string
        id: string
    }
    deliveryDate: Date
    totalItems: number
    totalQuantity: number
    totalValue: number
    paymentStatus: "paid" | "unpaid" | "partial"
    createdBy: string
    items: Array<{
        id: string
        productName: string
        variant: string
        receivedQuantity: number
        costPrice: number
    }>
}

export default function StockReceivingHistory() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedReceipt, setSelectedReceipt] = useState<StockReceipt | null>(null)
    const [showReceiptDetails, setShowReceiptDetails] = useState(false)
    const [sortField, setSortField] = useState<"date" | "supplier" | "value">("date")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "unpaid" | "partial">("all")

    const organizationSlug = useOrganizationSlug()

    const mockReceipts: StockReceipt[] = [
        {
            id: "rec_1",
            receiptNumber: "GRN-123456",
            supplier: {
                name: "Premium Beverages Ltd",
                id: "sup_1",
            },
            deliveryDate: new Date(2023, 5, 15),
            totalItems: 5,
            totalQuantity: 120,
            totalValue: 45000,
            paymentStatus: "paid",
            createdBy: "John Doe",
            items: [
                {
                    id: "item_1",
                    productName: "4TH STREET SWEET RED WINE",
                    variant: "750ML",
                    receivedQuantity: 24,
                    costPrice: 400,
                },
                {
                    id: "item_2",
                    productName: "AMARULA CREAM",
                    variant: "750ML",
                    receivedQuantity: 12,
                    costPrice: 1500,
                },
                {
                    id: "item_3",
                    productName: "BAILEYS ORIGINAL IRISH CREAM",
                    variant: "750ML",
                    receivedQuantity: 6,
                    costPrice: 2200,
                },
            ],
        },
        {
            id: "rec_2",
            receiptNumber: "GRN-123457",
            supplier: {
                name: "Global Spirits Distributors",
                id: "sup_2",
            },
            deliveryDate: new Date(2023, 5, 18),
            totalItems: 3,
            totalQuantity: 36,
            totalValue: 28000,
            paymentStatus: "unpaid",
            createdBy: "Sarah Johnson",
            items: [
                {
                    id: "item_4",
                    productName: "ABSOLUT VODKA",
                    variant: "750ML",
                    receivedQuantity: 12,
                    costPrice: 1800,
                },
                {
                    id: "item_5",
                    productName: "8PM GRAIN BLENDED WHISKEY",
                    variant: "750ML",
                    receivedQuantity: 24,
                    costPrice: 500,
                },
            ],
        },
        {
            id: "rec_3",
            receiptNumber: "GRN-123458",
            supplier: {
                name: "Vintage Wine Imports",
                id: "sup_3",
            },
            deliveryDate: new Date(2023, 5, 20),
            totalItems: 2,
            totalQuantity: 24,
            totalValue: 18000,
            paymentStatus: "partial",
            createdBy: "Michael Brown",
            items: [
                {
                    id: "item_6",
                    productName: "BALBI SOPRANI",
                    variant: "750ML",
                    receivedQuantity: 12,
                    costPrice: 900,
                },
                {
                    id: "item_7",
                    productName: "ALTAR WINE",
                    variant: "750ML",
                    receivedQuantity: 12,
                    costPrice: 600,
                },
            ],
        },
    ]

    // Filter receipts based on search query and filter status
    const filteredReceipts = mockReceipts.filter((receipt) => {
        const matchesSearch =
            receipt.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            receipt.supplier.name.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = filterStatus === "all" || receipt.paymentStatus === filterStatus

        return matchesSearch && matchesStatus
    })

    // Sort receipts
    const sortedReceipts = [...filteredReceipts].sort((a, b) => {
        if (sortField === "date") {
            return sortDirection === "asc"
                ? a.deliveryDate.getTime() - b.deliveryDate.getTime()
                : b.deliveryDate.getTime() - a.deliveryDate.getTime()
        } else if (sortField === "supplier") {
            return sortDirection === "asc"
                ? a.supplier.name.localeCompare(b.supplier.name)
                : b.supplier.name.localeCompare(a.supplier.name)
        } else if (sortField === "value") {
            return sortDirection === "asc" ? a.totalValue - b.totalValue : b.totalValue - a.totalValue
        }
        return 0
    })

    // View receipt details
    const viewReceiptDetails = (receipt: StockReceipt) => {
        setSelectedReceipt(receipt)
        setShowReceiptDetails(true)
    }

    // Toggle sort direction
    const toggleSort = (field: "date" | "supplier" | "value") => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    return (
        <div className="mx-auto py-4 max-w-5xl">
            <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <FileText className="h-5 w-5 text-green-800" />
                                Stock Receiving History
                            </CardTitle>
                            <CardDescription>View and manage past stock receipts</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => (window.location.href = `/dashboard/${organizationSlug}/orders/stock-receiving`)}
                            >
                                <Package className="mr-2 h-3.5 w-3.5" />
                                New Receipt
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by receipt number or supplier..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10">
                                    <Filter className="h-4 w-4 mr-2" />
                                    {filterStatus === "all"
                                        ? "All Statuses"
                                        : filterStatus === "paid"
                                            ? "Paid"
                                            : filterStatus === "unpaid"
                                                ? "Unpaid"
                                                : "Partial"}
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Statuses</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterStatus("paid")}>Paid</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterStatus("unpaid")}>Unpaid</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterStatus("partial")}>Partial</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">Receipt #</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-0 font-medium text-xs flex items-center"
                                            onClick={() => toggleSort("supplier")}
                                        >
                                            Supplier
                                            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-0 font-medium text-xs flex items-center"
                                            onClick={() => toggleSort("date")}
                                        >
                                            Date
                                            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-right">Items</TableHead>
                                    <TableHead className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-0 font-medium text-xs flex items-center ml-auto"
                                            onClick={() => toggleSort("value")}
                                        >
                                            Value
                                            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedReceipts.length > 0 ? (
                                    sortedReceipts.map((receipt) => (
                                        <TableRow key={receipt.id}>
                                            <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Truck className="h-4 w-4 text-muted-foreground" />
                                                    <span>{receipt.supplier.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span>{format(receipt.deliveryDate, "MMM d, yyyy")}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="text-sm">
                                                    <span className="font-medium">{receipt.totalItems}</span>
                                                    <span className="text-muted-foreground ml-1">({receipt.totalQuantity} units)</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                KES {receipt.totalValue.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        receipt.paymentStatus === "paid"
                                                            ? "success"
                                                            : receipt.paymentStatus === "unpaid"
                                                                ? "destructive"
                                                                : "warning"
                                                    }
                                                    className={
                                                        receipt.paymentStatus === "paid"
                                                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                            : receipt.paymentStatus === "unpaid"
                                                                ? "bg-red-100 text-red-800 hover:bg-red-100"
                                                                : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                                    }
                                                >
                                                    {receipt.paymentStatus === "paid"
                                                        ? "Paid"
                                                        : receipt.paymentStatus === "unpaid"
                                                            ? "Unpaid"
                                                            : "Partial"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => viewReceiptDetails(receipt)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                            No receipts found matching your search criteria
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showReceiptDetails} onOpenChange={setShowReceiptDetails}>
                <DialogContent className="w-full">
                    <DialogHeader>
                        <DialogTitle>Receipt Details</DialogTitle>
                        <DialogDescription>
                            {selectedReceipt?.receiptNumber} • {selectedReceipt?.supplier.name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReceipt && (
                        <Tabs defaultValue="summary">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="summary">Summary</TabsTrigger>
                                <TabsTrigger value="items">Items ({selectedReceipt.items.length})</TabsTrigger>
                            </TabsList>

                            <TabsContent value="summary" className="space-y-2 pt-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Receipt Number</p>
                                        <p>{selectedReceipt.receiptNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Delivery Date</p>
                                        <p>{format(selectedReceipt.deliveryDate, "MMMM d, yyyy")}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Supplier</p>
                                        <p>{selectedReceipt.supplier.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Created By</p>
                                        <p>{selectedReceipt.createdBy}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Payment Status</p>
                                        <Badge
                                            variant={
                                                selectedReceipt.paymentStatus === "paid"
                                                    ? "success"
                                                    : selectedReceipt.paymentStatus === "unpaid"
                                                        ? "destructive"
                                                        : "warning"
                                            }
                                            className={
                                                selectedReceipt.paymentStatus === "paid"
                                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                    : selectedReceipt.paymentStatus === "unpaid"
                                                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                                                        : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                            }
                                        >
                                            {selectedReceipt.paymentStatus === "paid"
                                                ? "Paid"
                                                : selectedReceipt.paymentStatus === "unpaid"
                                                    ? "Unpaid"
                                                    : "Partial"}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="pt-2 border-t">
                                    <h3 className="font-medium mb-2">Receipt Summary</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                            <p className="text-sm text-muted-foreground">Total Items</p>
                                            <p className="text-lg font-normal">{selectedReceipt.totalItems}</p>
                                        </div>
                                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                            <p className="text-sm text-muted-foreground">Total Quantity</p>
                                            <p className="text-lg font-normal">{selectedReceipt.totalQuantity}</p>
                                        </div>
                                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                            <p className="text-sm text-muted-foreground">Total Value</p>
                                            <p className="text-lg font-normal">KES {selectedReceipt.totalValue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="items" className="pt-4">
                                <ScrollArea className="h-[300px]">
                                    <Table className="text-xs">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Variant</TableHead>
                                                <TableHead className="text-right">Quantity</TableHead>
                                                <TableHead className="text-right">Cost Price (KES)</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedReceipt.items.map((item, index) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.productName}</TableCell>
                                                    <TableCell>{item.variant}</TableCell>
                                                    <TableCell className="text-right">{item.receivedQuantity}</TableCell>
                                                    <TableCell className="text-right">{item.costPrice.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {(item.receivedQuantity * item.costPrice).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
