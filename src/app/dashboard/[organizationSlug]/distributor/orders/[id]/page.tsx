"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Package,
    Truck,
    CheckCircle2,
    AlertCircle,
    Clock,
    RefreshCw,
    User,
    CalendarClock,
    Loader2,
    ArrowLeft,
    Printer,
    FileText,
    Phone,
    MapPin,
    MessageSquare,
    Info,
} from "lucide-react"

import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock order data (would be fetched from API in real app)
const mockOrder = {
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
    status: "confirmed",
    items: [
        {
            id: "item-001",
            name: "Tusker Lager",
            sku: "sku",
            quantity: 24,
            price: 150,
            total: 360_0,
        },
        {
            id: "item-002",
            name: "Johnnie Walker Black Label",
            sku: "sku",
            quantity: 6,
            price: 3500,
            total: 21000,
        },
    ],
    total: 24600,
    assignedTo: {
        id: "staff-001",
        name: "John Doe",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    deliveryDate: "2023-11-27",
    specialInstructions: "Please deliver before noon",
    paymentStatus: "unpaid",
    lastUpdated: "2023-11-25T16:45:00",
    timeline: [
        {
            status: "pending",
            timestamp: "2023-11-25T10:30:00",
            user: "System",
        },
        {
            status: "processing",
            timestamp: "2023-11-25T11:15:00",
            user: "John Doe",
        },
        {
            status: "confirmed",
            timestamp: "2023-11-25T16:45:00",
            user: "John Doe",
        },
    ],
}

// Status badge component
function OrderStatusBadge({ status }: { status: string }) {
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

// Payment status badge component
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

export default function OrderDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [order, setOrder] = useState(mockOrder)
    const [isProcessing, setIsProcessing] = useState(false)
    const [notes, setNotes] = useState("")
    const [activeTab, setActiveTab] = useState("details")

    // fetch order data based on params.id
    useEffect(() => {
        console.log(`Fetching order with ID: ${params.id}`)
        // setOrder(fetchedOrder)
    }, [params.id])

    const handleStatusChange = (newStatus: string) => {
        setIsProcessing(true)

        setTimeout(() => {
            setOrder({
                ...order,
                status: newStatus,
                lastUpdated: new Date().toISOString(),
                timeline: [
                    ...order.timeline,
                    {
                        status: newStatus,
                        timestamp: new Date().toISOString(),
                        user: order.assignedTo?.name || "System",
                    },
                ],
            })

            toast.success(`Order status updated to ${newStatus}`)
            setIsProcessing(false)
        }, 1000)
    }

    const handleAssignOrder = () => {
        setIsProcessing(true)

        setTimeout(() => {
            setOrder({
                ...order,
                assignedTo: {
                    id: "staff-001",
                    name: "John Doe",
                    avatar: "/placeholder.svg?height=32&width=32",
                },
                status: order.status === "pending" ? "processing" : order.status,
                lastUpdated: new Date().toISOString(),
                timeline: [
                    ...order.timeline,
                    {
                        status: "assigned",
                        timestamp: new Date().toISOString(),
                        user: "John Doe",
                    },
                ],
            })

            toast.success("Order assigned to you")
            setIsProcessing(false)
        }, 1000)
    }

    // Get next status options based on current status
    const getNextStatusOptions = () => {
        switch (order.status) {
            case "pending":
                return [{ value: "confirmed", label: "Confirm Order" }]
            case "processing":
                return [{ value: "confirmed", label: "Confirm Order" }]
            case "confirmed":
                return [{ value: "packed", label: "Mark as Packed" }]
            case "packed":
                return [{ value: "shipped", label: "Mark as Shipped" }]
            case "shipped":
                return [{ value: "delivered", label: "Mark as Delivered" }]
            default:
                return []
        }
    }

    const nextStatusOptions = getNextStatusOptions()

    return (
        <div className="container max-w-4xl mx-auto py-4 px-4 sm:px-6 space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                        Order {order.orderNumber}
                        <OrderStatusBadge status={order.status} />
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(order.date), "MMM d, yyyy")} • {order.retailer.name}
                    </p>
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-lg">
                <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-medium">
                                {new Intl.NumberFormat("en-KE", {
                                    style: "currency",
                                    currency: "KES",
                                }).format(order.total)}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <PaymentStatusBadge status={order.paymentStatus} />
                                <span className="text-xs text-muted-foreground">
                                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {order.assignedTo ? (
                                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-full py-1 px-3 shadow-sm">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={order.assignedTo.avatar || "/placeholder.svg"} alt={order.assignedTo.name} />
                                        <AvatarFallback>{order.assignedTo.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium">{order.assignedTo.name}</span>
                                </div>
                            ) : (
                                <Button size="sm" onClick={handleAssignOrder} disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <User className="h-4 w-4 mr-2" />}
                                    Assign to Me
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="w-full flex justify-end">
                        <div className="flex flex-col md:flex-row gap-2">
                            {nextStatusOptions.map((option) => (
                                <Button
                                    key={option.value}
                                    onClick={() => handleStatusChange(option.value)}
                                    disabled={isProcessing}
                                    className="flex-1 h-8 text-xs"
                                >
                                    {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : option.label}
                                </Button>
                            ))}
                            {order.status !== "cancelled" && order.status !== "delivered" && (
                                <Button
                                    variant="outline"
                                    className=" text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleStatusChange("cancelled")}
                                    disabled={true /**isProcessing */}
                                >
                                    Cancel Order
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 divide-x border-t">
                    <Button
                        variant="ghost"
                        className="h-8 text-xs rounded-none"
                        size="sm"
                        onClick={() => router.push(`/distributor/orders/${params.id}/print`)}
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-8 text-xs rounded-none"
                        size="sm"
                        onClick={() => {
                            toast.success("Retailer has been notified")
                        }}
                    >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs rounded-none">
                        <FileText className="h-4 w-4 mr-2" />
                        Invoice
                    </Button>
                </div>
            </Card>

            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-2">
                    <Card>
                        <CardContent className="p-0">
                            <div className="p-4 border-b bg-muted/30">
                                <h3 className="font-medium flex items-center">
                                    <Package className="h-4 w-4 mr-2" />
                                    Order Items
                                </h3>
                            </div>
                            <Table className="text-xs">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-xs text-muted-foreground">{item.sku}</div>
                                            </TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">
                                                {new Intl.NumberFormat("en-KE", {
                                                    style: "currency",
                                                    currency: "KES",
                                                }).format(item.price)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {new Intl.NumberFormat("en-KE", {
                                                    style: "currency",
                                                    currency: "KES",
                                                }).format(item.total)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="p-4 border-t bg-muted/30">
                                <div className="flex justify-between">
                                    <span className="font-medium">Total</span>
                                    <span className="font-medium">
                                        {new Intl.NumberFormat("en-KE", {
                                            style: "currency",
                                            currency: "KES",
                                        }).format(order.total)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-0">
                            <div className="p-4 border-b bg-muted/30">
                                <h3 className="font-medium flex items-center">
                                    <Truck className="h-4 w-4 mr-2" />
                                    Delivery Information
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">{order.retailer.name}</p>
                                        <p className="text-sm">{order.retailer.address}</p>
                                        <div className="mt-1 text-sm">
                                            <span className="text-muted-foreground">{order.retailer.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-3">
                                    <CalendarClock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Delivery Date</p>
                                        <p className="text-sm">
                                            {order.deliveryDate ? format(new Date(order.deliveryDate), "MMMM d, yyyy") : "Not specified"}
                                        </p>
                                    </div>
                                </div>

                                {order.specialInstructions && (
                                    <>
                                        <Separator />
                                        <div className="flex items-start gap-3">
                                            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="font-medium">Special Instructions</p>
                                                <p className="text-sm">{order.specialInstructions}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timeline">
                    <Card>
                        <CardContent className="p-0">
                            <div className="p-4 border-b bg-muted/30">
                                <h3 className="font-medium flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Order Timeline
                                </h3>
                            </div>
                            <div className="p-4">
                                <div className="space-y-6">
                                    {order.timeline.map((event, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                    {event.status === "pending" && <Clock className="h-4 w-4 text-yellow-600" />}
                                                    {event.status === "processing" && <RefreshCw className="h-4 w-4 text-blue-600" />}
                                                    {event.status === "confirmed" && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                                                    {event.status === "packed" && <Package className="h-4 w-4 text-purple-600" />}
                                                    {event.status === "shipped" && <Truck className="h-4 w-4 text-cyan-600" />}
                                                    {event.status === "delivered" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                                    {event.status === "cancelled" && <AlertCircle className="h-4 w-4 text-red-600" />}
                                                    {event.status === "assigned" && <User className="h-4 w-4 text-blue-600" />}
                                                </div>
                                                {index < order.timeline.length - 1 && <div className="h-full w-0.5 bg-muted"></div>}
                                            </div>
                                            <div className="pb-6">
                                                <div className="font-medium">
                                                    {event.status === "pending" && "Order Placed"}
                                                    {event.status === "processing" && "Processing Started"}
                                                    {event.status === "confirmed" && "Order Confirmed"}
                                                    {event.status === "packed" && "Order Packed"}
                                                    {event.status === "shipped" && "Order Shipped"}
                                                    {event.status === "delivered" && "Order Delivered"}
                                                    {event.status === "cancelled" && "Order Cancelled"}
                                                    {event.status === "assigned" && "Order Assigned"}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {format(new Date(event.timestamp), "MMM d, yyyy 'at' h:mm a")}
                                                </div>
                                                <div className="text-sm mt-1">
                                                    {event.user === "System" ? "Automatic update" : `Updated by ${event.user}`}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="notes">
                    <Card>
                        <CardContent className="p-0">
                            <div className="p-4 border-b bg-muted/30">
                                <h3 className="font-medium flex items-center">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Order Notes
                                </h3>
                            </div>
                            <div className="p-4">
                                <Textarea
                                    placeholder="Add notes about this order..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-[150px] mb-4"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setNotes("")} size="sm">
                                        Clear
                                    </Button>
                                    <Button onClick={() => toast.success("Notes saved successfully")} size="sm">
                                        Save Notes
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
