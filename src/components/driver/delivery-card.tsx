"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Truck,
    MapPin,
    CheckCircle2,
    Clock,
    Navigation,
    Package,
    Phone,
    Camera,
    AlertCircle,
    Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { useUpdateDeliveryStatus, useReportDeliveryIssue } from "@/hooks/use-driver-queries"
import { toast } from "sonner"

interface DeliveryCardProps {
    delivery: {
        id: string
        orderNumber?: string
        customerName: string
        customerAddress: string
        customerPhone: string
        status: "PENDING" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED" | "FAILED" | "RESCHEDULED"
        scheduledFor: string
        priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
        order?: {
            items: Array<{
                id: string
                quantity: number
                unitPrice: number
                totalPrice: number
            }>
            totalAmount: number
            paymentMethod: string
            paymentStatus: string
        }
        deliveryNotes?: string
    }
    onNavigate?: () => void
    onViewDetails?: () => void
}

export function DeliveryCard({
    delivery, onNavigate, onViewDetails }: DeliveryCardProps) {
    const [showStatusDialog, setShowStatusDialog] = useState(false)
    const [showIssueDialog, setShowIssueDialog] = useState(false)
    const [receivedBy, setReceivedBy] = useState("")
    const [deliveryNotes, setDeliveryNotes] = useState("")
    const [issueType, setIssueType] = useState<
        "STOCK_SHORTAGE" | "VEHICLE_BREAKDOWN" | "CUSTOMER_UNAVAILABLE" | "WRONG_ADDRESS" | "PAYMENT_ISSUE" | "OTHER"
    >("OTHER")
    const [issueDescription, setIssueDescription] = useState("")

    const updateDeliveryStatus = useUpdateDeliveryStatus()
    const reportIssue = useReportDeliveryIssue()

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                )
            case "ASSIGNED":
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Package className="h-3 w-3 mr-1" />
                        Assigned
                    </Badge>
                )
            case "IN_TRANSIT":
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        <Truck className="h-3 w-3 mr-1" />
                        In Transit
                    </Badge>
                )
            case "DELIVERED":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Delivered
                    </Badge>
                )
            case "FAILED":
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

    const getPriorityBadge = (priority?: string) => {
        if (!priority) return null

        switch (priority) {
            case "URGENT":
                return <Badge className="bg-red-500/10 text-red-500">Urgent</Badge>
            case "HIGH":
                return <Badge className="bg-amber-500/10 text-amber-500">High</Badge>
            case "MEDIUM":
                return <Badge className="bg-blue-500/10 text-blue-500">Medium</Badge>
            case "LOW":
                return <Badge className="bg-green-500/10 text-green-500">Low</Badge>
            default:
                return null
        }
    }

    const handleStatusUpdate = async (newStatus: "IN_TRANSIT" | "DELIVERED") => {
        try {
            await updateDeliveryStatus.mutateAsync({
                deliveryId: delivery.id,
                status: newStatus,
                receivedBy: newStatus === "DELIVERED" ? receivedBy : undefined,
                completedAt: newStatus === "DELIVERED" ? new Date().toISOString() : undefined,
                proofOfDelivery:
                    newStatus === "DELIVERED"
                        ? {
                            notes: deliveryNotes || undefined,
                        }
                        : undefined,
            })
            setShowStatusDialog(false)
            setReceivedBy("")
            setDeliveryNotes("")
        } catch (error) {
            // Error handled by mutation
        }
    }

    const handleReportIssue = async () => {
        if (!issueDescription.trim()) {
            toast.error("Please provide an issue description")
            return
        }

        try {
            await reportIssue.mutateAsync({
                deliveryId: delivery.id,
                issueType,
                description: issueDescription,
            })
            setShowIssueDialog(false)
            setIssueDescription("")
        } catch (error) {
            // Error handled by mutation
        }
    }

    const canStartDelivery = delivery.status === "PENDING" || delivery.status === "ASSIGNED"
    const canCompleteDelivery = delivery.status === "IN_TRANSIT"
    const isCompleted = delivery.status === "DELIVERED" || delivery.status === "FAILED"

    return (
        <>
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                    <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Truck className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium">{delivery.customerName}</h3>
                                <div className="text-xs text-muted-foreground">
                                    {format(new Date(delivery.scheduledFor), "h:mm a")}
                                    {delivery.orderNumber && ` • ${delivery.orderNumber}`}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {getPriorityBadge(delivery.priority)}
                            {getStatusBadge(delivery.status)}
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{delivery.customerAddress}</span>
                        </div>

                        {delivery.order && (
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <span>{delivery.order.items.length} items</span>
                                </div>
                                <div className="font-medium">KES {delivery.order.totalAmount.toLocaleString()}</div>
                            </div>
                        )}

                        {delivery.deliveryNotes && (
                            <div className="text-xs bg-amber-50 p-2 rounded border border-amber-200">
                                <AlertCircle className="h-3 w-3 inline mr-1 text-amber-600" />
                                {delivery.deliveryNotes}
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                            {canStartDelivery && (
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleStatusUpdate("IN_TRANSIT")}
                                    disabled={updateDeliveryStatus.isPending}
                                >
                                    {updateDeliveryStatus.isPending ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Truck className="h-4 w-4 mr-2" />
                                    )}
                                    Start Delivery
                                </Button>
                            )}

                            {canCompleteDelivery && (
                                <Button size="sm" className="flex-1" onClick={() => setShowStatusDialog(true)}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Complete
                                </Button>
                            )}

                            {!isCompleted && (
                                <Button size="sm" variant="outline" onClick={() => setShowIssueDialog(true)}>
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Report Issue
                                </Button>
                            )}

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    const address = encodeURIComponent(delivery.customerAddress)
                                    window.open(`https://maps.google.com/?q=${address}`, "_blank")
                                }}
                            >
                                <Navigation className="h-4 w-4 mr-2" />
                                Navigate
                            </Button>

                            <Button size="sm" variant="ghost" onClick={() => window.open(`tel:${delivery.customerPhone}`, "_blank")}>
                                <Phone className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Complete Delivery Dialog */}
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Delivery</DialogTitle>
                        <DialogDescription>
                            Mark this delivery as completed and provide delivery confirmation details.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="receivedBy">Received By</Label>
                            <Input
                                id="receivedBy"
                                placeholder="Name of person who received the delivery"
                                value={receivedBy}
                                onChange={(e) => setReceivedBy(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
                            <Textarea
                                id="deliveryNotes"
                                placeholder="Any additional notes about the delivery..."
                                value={deliveryNotes}
                                onChange={(e) => setDeliveryNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                            <Camera className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Proof of delivery photos can be added after completion
                            </span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleStatusUpdate("DELIVERED")}
                            disabled={updateDeliveryStatus.isPending || !receivedBy.trim()}
                        >
                            {updateDeliveryStatus.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Completing...
                                </>
                            ) : (
                                "Complete Delivery"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Report Issue Dialog */}
            <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Report Delivery Issue</DialogTitle>
                        <DialogDescription>Report any problems encountered during this delivery.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="issueType">Issue Type</Label>
                            <select
                                id="issueType"
                                value={issueType}
                                onChange={(e) => setIssueType(e.target.value as any)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="CUSTOMER_UNAVAILABLE">Customer Unavailable</option>
                                <option value="WRONG_ADDRESS">Wrong Address</option>
                                <option value="PAYMENT_ISSUE">Payment Issue</option>
                                <option value="STOCK_SHORTAGE">Stock Shortage</option>
                                <option value="VEHICLE_BREAKDOWN">Vehicle Breakdown</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="issueDescription">Description</Label>
                            <Textarea
                                id="issueDescription"
                                placeholder="Describe the issue in detail..."
                                value={issueDescription}
                                onChange={(e) => setIssueDescription(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowIssueDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleReportIssue} disabled={reportIssue.isPending || !issueDescription.trim()}>
                            {reportIssue.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Reporting...
                                </>
                            ) : (
                                "Report Issue"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
