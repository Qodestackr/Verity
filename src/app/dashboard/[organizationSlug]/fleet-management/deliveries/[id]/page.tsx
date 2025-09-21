"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Truck,
    MapPin,
    CheckCircle2,
    Clock,
    User,
    Phone,
    Package,
    ArrowLeft,
    Calendar,
    AlertCircle,
    MessageSquare,
    Navigation,
    CheckCheck,
    X,
    Camera,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const mockDelivery = {
    id: "DEL-001",
    orderNumber: "PO-2023-001",
    customer: {
        name: "Downtown Liquor Store",
        address: "123 Main St, Nairobi",
        phone: "+254712345678",
        contactPerson: "James Mwangi",
    },
    status: "pending",
    items: [
        {
            id: "item-001",
            name: "Tusker Lager",
            sku: "TL-001",
            quantity: 24,
            price: 150,
            total: 3600,
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
    assignedTo: {
        id: "driver-001",
        name: "John Kamau",
        avatar: "/placeholder.svg?height=32&width=32",
        phone: "+254712345678",
    },
    scheduledFor: "2023-11-27T10:00:00",
    specialInstructions: "Please deliver before noon. Call when arriving.",
    paymentStatus: "unpaid",
    paymentMethod: "Cash on Delivery",
}

function DeliveryStatusBadge({ status }: { status: string }) {
    switch (status) {
        case "pending":
            return (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                </Badge>
            )
        case "in-transit":
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Truck className="h-3 w-3 mr-1" />
                    In Transit
                </Badge>
            )
        case "delivered":
            return (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Delivered
                </Badge>
            )
        case "failed":
            return (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Failed
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
            {status}
        </Badge>
    )
}

export default function DeliveryDetailPage() {
    const router = useRouter()
    const [delivery, setDelivery] = useState(mockDelivery)
    const [isProcessing, setIsProcessing] = useState(false)
    const [notes, setNotes] = useState("")

    const handleStatusUpdate = (newStatus: string) => {
        setIsProcessing(true)

        setTimeout(() => {
            setDelivery({
                ...delivery,
                status: newStatus,
            })

            toast.success(`Delivery status updated to ${newStatus}`)
            setIsProcessing(false)
        }, 1000)
    }

    const handleAssignDriver = () => {
        setIsProcessing(true)

        setTimeout(() => {
            setDelivery({
                ...delivery,
                assignedTo: {
                    id: "driver-001",
                    name: "John Kamau",
                    avatar: "/placeholder.svg?height=32&width=32",
                    phone: "+254712345678",
                },
            })

            toast.success("Driver assigned successfully")
            setIsProcessing(false)
        }, 1000)
    }

    return (
        <div className="container max-w-4xl mx-auto py-4 px-4 sm:px-6 space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                        Delivery {delivery.id}
                        <DeliveryStatusBadge status={delivery.status} />
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Order {delivery.orderNumber} • {format(new Date(delivery.scheduledFor), "MMM d, yyyy")}
                    </p>
                </div>
            </div>
            <Card className="overflow-hidden border-none shadow-lg">
                <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-medium">{delivery.customer.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">{delivery.customer.address}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {delivery.assignedTo ? (
                                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-full py-1 px-3 shadow-sm">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage
                                            src={delivery.assignedTo.avatar || "/placeholder.svg"}
                                            alt={delivery.assignedTo.name}
                                        />
                                        <AvatarFallback>{delivery.assignedTo.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium">{delivery.assignedTo.name}</span>
                                </div>
                            ) : (
                                <Button size="sm" onClick={handleAssignDriver} disabled={isProcessing}>
                                    <User className="h-4 w-4 mr-2" />
                                    Assign Driver
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {delivery.status === "pending" && (
                            <Button
                                onClick={() => handleStatusUpdate("in-transit")}
                                disabled={isProcessing}
                                className="flex-1 h-7 text-xs"
                                size="lg"
                            >
                                <Truck className="h-4 w-4 mr-2" />
                                Start Delivery
                            </Button>
                        )}

                        {delivery.status === "in-transit" && (
                            <>
                                <Button
                                    onClick={() => handleStatusUpdate("delivered")}
                                    disabled={isProcessing}
                                    className="flex-1"
                                    size="lg"
                                >
                                    <CheckCheck className="h-4 w-4 mr-2" />
                                    Mark as Delivered
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleStatusUpdate("failed")}
                                    disabled={isProcessing}
                                    className="flex-1"
                                    size="lg"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Failed Delivery
                                </Button>
                            </>
                        )}

                        {(delivery.status === "delivered" || delivery.status === "failed") && (
                            <Button
                                variant="outline"
                                onClick={() => handleStatusUpdate("pending")}
                                disabled={isProcessing}
                                className="flex-1"
                                size="lg"
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                Reschedule Delivery
                            </Button>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-3 divide-x border-t">
                    <Button
                        variant="ghost"
                        className="h-12 rounded-none"
                        onClick={() => {
                            window.open(`tel:${delivery.customer.phone}`, "_blank")
                        }}
                    >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Customer
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-12 rounded-none"
                        onClick={() => {
                            // Open in maps app
                            const address = encodeURIComponent(delivery.customer.address)
                            window.open(`https://maps.google.com/?q=${address}`, "_blank")
                        }}
                    >
                        <Navigation className="h-4 w-4 mr-2" />
                        Navigate
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-12 rounded-none"
                        onClick={() => {
                            toast.success("Proof of delivery requested")
                        }}
                    >
                        <Camera className="h-4 w-4 mr-2" />
                        Proof of Delivery
                    </Button>
                </div>
            </Card>
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Delivery Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Customer Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{delivery.customer.contactPerson}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{delivery.customer.phone}</span>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Delivery Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{format(new Date(delivery.scheduledFor), "MMMM d, yyyy 'at' h:mm a")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                <span>{delivery.paymentMethod}</span>
                            </div>
                        </div>
                    </div>

                    {delivery.specialInstructions && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">Special Instructions</h3>
                                <p className="text-sm bg-muted/30 p-3 rounded-md">{delivery.specialInstructions}</p>
                            </div>
                        </>
                    )}
                    <Separator />
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Order Items</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {delivery.items.map((item) => (
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
                        <div className="flex justify-between items-center pt-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Payment Status:</span>
                                <PaymentStatusBadge status={delivery.paymentStatus} />
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground">Total Amount</div>
                                <div className="font-medium">
                                    {new Intl.NumberFormat("en-KE", {
                                        style: "currency",
                                        currency: "KES",
                                    }).format(delivery.total)}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Delivery Notes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Add notes about this delivery..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[100px] mb-4"
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setNotes("")} size="sm">
                            Clear
                        </Button>
                        <Button onClick={() => toast.success("Notes saved successfully")} size="sm">
                            Save Notes
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
