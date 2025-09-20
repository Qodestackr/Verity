"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    ArrowLeft,
    MapPin,
    Phone,
    Package,
    Receipt,
    Camera,
    User,
    CreditCard,
    MessageSquare,
    AlertCircle,
    Clipboard,
    Navigation,
    CheckCircle2,
    Clock,
    Truck,
    X,
    Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
    useDelivery,
    useDeliveryChecklist,
    useUpdateDeliveryStatus,
    useUpdateChecklistItems,
    useReportDeliveryIssue,
} from "@/hooks/use-driver-queries"

function DeliveryDetailContent() {
    const params = useParams()
    const router = useRouter()
    const deliveryId = params.id as string

    const [notes, setNotes] = useState("")
    const [showProofDialog, setShowProofDialog] = useState(false)
    const [showPaymentDialog, setShowPaymentDialog] = useState(false)
    const [showFailureDialog, setShowFailureDialog] = useState(false)
    const [receivedBy, setReceivedBy] = useState("")
    const [paymentAmount, setPaymentAmount] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("cash")
    const [failureReason, setFailureReason] = useState("")
    const [signature, setSignature] = useState<string | null>(null)

    const { data: delivery, isLoading } = useDelivery(deliveryId)
    const { data: checklistItems = [] } = useDeliveryChecklist(deliveryId)
    const updateDeliveryStatus = useUpdateDeliveryStatus()
    const updateChecklistItems = useUpdateChecklistItems()
    const reportIssue = useReportDeliveryIssue()

    const [localChecklistItems, setLocalChecklistItems] = useState<
        Array<{
            id: string
            name: string
            isCompleted: boolean
            notes?: string
        }>
    >([])

    // Initialize checklist items when data loads
    useState(() => {
        if (checklistItems.length > 0) {
            setLocalChecklistItems(
                checklistItems.map((item) => ({
                    id: item.id,
                    name: item.name,
                    isCompleted: item.isCompleted,
                    notes: item.notes,
                })),
            )
        } else if (delivery) {
            // Default checklist items
            setLocalChecklistItems([
                { id: "check1", name: "Verified all items are in good condition", isCompleted: false },
                { id: "check2", name: "Confirmed delivery with customer", isCompleted: false },
                { id: "check3", name: "Collected payment (if applicable)", isCompleted: false },
                { id: "check4", name: "Obtained proof of delivery", isCompleted: false },
            ])
        }
    }, [checklistItems, delivery])

    if (isLoading) {
        return (
            <div className="container max-w-md mx-auto py-4 px-4">
                <div className="space-y-4">
                    <div className="h-8 bg-muted/50 rounded animate-pulse" />
                    <div className="h-48 bg-muted/50 rounded animate-pulse" />
                    <div className="h-32 bg-muted/50 rounded animate-pulse" />
                </div>
            </div>
        )
    }

    if (!delivery) {
        return (
            <div className="container max-w-md mx-auto py-4 px-4 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Delivery not found</h3>
                <p className="text-muted-foreground mb-4">The delivery you're looking for doesn't exist.</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
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
                            signature: signature || undefined,
                            notes: notes || undefined,
                        }
                        : undefined,
            })

            if (newStatus === "DELIVERED") {
                setShowPaymentDialog(delivery.order?.paymentStatus === "unpaid")
            }
        } catch (error) {
            // Error handled by mutation
        }
    }

    const handleFailedDelivery = async () => {
        if (!failureReason.trim()) {
            toast.error("Please provide a reason for failed delivery")
            return
        }

        try {
            await reportIssue.mutateAsync({
                deliveryId: delivery.id,
                issueType: "OTHER",
                description: failureReason,
            })
            setShowFailureDialog(false)
            setFailureReason("")
        } catch (error) {
            // Error handled by mutation
        }
    }

    const handleChecklistUpdate = (itemId: string, isCompleted: boolean) => {
        setLocalChecklistItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, isCompleted } : item)))
    }

    const saveChecklist = async () => {
        try {
            await updateChecklistItems.mutateAsync({
                deliveryId: delivery.id,
                items: localChecklistItems.map((item) => ({
                    id: item.id,
                    isCompleted: item.isCompleted,
                    notes: item.notes,
                })),
            })
        } catch (error) {
            // Error handled by mutation
        }
    }

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

    return (
        <div className="container max-w-md mx-auto py-4 px-4 space-y-4">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                        {delivery.customerName}
                        {getStatusBadge(delivery.status)}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        {delivery.order?.orderNumber && `Order #${delivery.order.orderNumber} • `}
                        {format(new Date(delivery.scheduledFor), "MMM d, h:mm a")}
                    </p>
                </div>
            </div>

            {/* Main Action Card */}
            <Card className="overflow-hidden border-none p-0 shadow-lg">
                <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Delivery Location</span>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => {
                                const address = encodeURIComponent(delivery.customerAddress)
                                window.open(`https://maps.google.com/?q=${address}`, "_blank")
                            }}
                        >
                            <Navigation className="h-3.5 w-3.5 mr-1.5" />
                            Navigate
                        </Button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-md p-3 mb-4 shadow-sm">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">{delivery.customerAddress}</p>
                                <div className="flex items-center gap-2 mt-1 text-sm">
                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>{delivery.customerName}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {(delivery.status === "PENDING" || delivery.status === "ASSIGNED") && (
                            <Button
                                onClick={() => handleStatusUpdate("IN_TRANSIT")}
                                disabled={updateDeliveryStatus.isPending}
                                className="w-full h-9 text-sm"
                            >
                                {updateDeliveryStatus.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Truck className="h-4 w-4 mr-2" />
                                )}
                                Start Delivery
                            </Button>
                        )}

                        {delivery.status === "IN_TRANSIT" && (
                            <>
                                <Button
                                    onClick={() => handleStatusUpdate("DELIVERED")}
                                    disabled={updateDeliveryStatus.isPending}
                                    className="w-full"
                                    size="lg"
                                >
                                    {updateDeliveryStatus.isPending ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                    )}
                                    Mark as Delivered
                                </Button>

                                <Button variant="outline" className="w-full" size="lg" onClick={() => setShowFailureDialog(true)}>
                                    <X className="h-4 w-4 mr-2" />
                                    Failed Delivery
                                </Button>
                            </>
                        )}

                        {(delivery.status === "DELIVERED" || delivery.status === "FAILED") && (
                            <Button
                                variant="outline"
                                onClick={() => handleStatusUpdate("IN_TRANSIT")}
                                disabled={updateDeliveryStatus.isPending}
                                className="w-full"
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
                        onClick={() => window.open(`tel:${delivery.customerPhone}`, "_blank")}
                    >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                    </Button>
                    <Button variant="ghost" className="h-12 rounded-none" onClick={() => setShowProofDialog(true)}>
                        <Camera className="h-4 w-4 mr-2" />
                        Proof
                    </Button>
                    <Button variant="ghost" className="h-12 rounded-none" onClick={() => setShowPaymentDialog(true)}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payment
                    </Button>
                </div>
            </Card>

            {/* Order Items */}
            {delivery.order && (
                <Card className="p-0">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium flex items-center">
                                <Package className="h-4 w-4 mr-2" />
                                Order Items
                            </h3>
                            <Badge variant="outline" className="text-xs">
                                {delivery.order.items.length} items
                            </Badge>
                        </div>
                        <div className="space-y-3">
                            {delivery.order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium">Item #{item.id}</p>
                                        <p className="text-xs text-muted-foreground">Product ID: {item.productId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{item.quantity} units</p>
                                        <p className="text-xs text-muted-foreground">KES {item.unitPrice.toLocaleString()} each</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Separator className="my-3" />
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Total</span>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">KES {delivery.order.totalAmount.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">{delivery.order.paymentMethod}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Special Instructions */}
            {delivery.deliveryNotes && (
                <Card className="p-0">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <h3 className="font-medium">Special Instructions</h3>
                        </div>
                        <p className="text-sm bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md text-amber-800 dark:text-amber-200">
                            {delivery.deliveryNotes}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Delivery Notes */}
            <Card className="p-0">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">Delivery Notes</h3>
                    </div>
                    <Textarea
                        placeholder="Add notes about this delivery..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[80px] mb-3"
                    />
                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            onClick={() => {
                                toast.success("Notes saved")
                                setNotes("")
                            }}
                        >
                            Save Notes
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Delivery Checklist */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Clipboard className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">Delivery Checklist</h3>
                    </div>
                    <div className="space-y-3">
                        {localChecklistItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                                <Checkbox
                                    id={item.id}
                                    checked={item.isCompleted}
                                    onCheckedChange={(checked) => handleChecklistUpdate(item.id, checked as boolean)}
                                />
                                <label htmlFor={item.id} className="text-sm flex-1">
                                    {item.name}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button size="sm" onClick={saveChecklist} disabled={updateChecklistItems.isPending}>
                            {updateChecklistItems.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            Save Checklist
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Proof of Delivery Dialog */}
            <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Capture Proof of Delivery</DialogTitle>
                        <DialogDescription>Take photos and capture signature for delivery confirmation.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="h-[200px] bg-muted rounded-md flex items-center justify-center">
                            <div className="text-center">
                                <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground mb-2">Camera Preview</p>
                                <Button size="sm">
                                    <Camera className="h-4 w-4 mr-2" />
                                    Take Photo
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="signature">Customer Signature</Label>
                            <div className="h-[100px] bg-muted rounded-md flex items-center justify-center">
                                {signature ? (
                                    <p className="text-muted-foreground">Signature Captured</p>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSignature("captured")
                                            toast.success("Signature captured")
                                        }}
                                    >
                                        Capture Signature
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="receivedBy">Received By</Label>
                            <Input
                                id="receivedBy"
                                placeholder="Name of person who received delivery"
                                value={receivedBy}
                                onChange={(e) => setReceivedBy(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowProofDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                toast.success("Proof of delivery saved")
                                setShowProofDialog(false)
                            }}
                        >
                            Save Proof
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                        <DialogDescription>Record payment collection for this delivery.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount Collected (KES)</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder={delivery.order?.totalAmount.toString()}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <select
                                id="paymentMethod"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="cash">Cash</option>
                                <option value="mpesa">M-Pesa</option>
                                <option value="card">Card</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                toast.success("Payment recorded successfully")
                                setShowPaymentDialog(false)
                            }}
                        >
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Failed Delivery Dialog */}
            <Dialog open={showFailureDialog} onOpenChange={setShowFailureDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Report Failed Delivery</DialogTitle>
                        <DialogDescription>Please provide details about why the delivery failed.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Failed Delivery</Label>
                            <Textarea
                                id="reason"
                                placeholder="Enter the reason for failed delivery..."
                                value={failureReason}
                                onChange={(e) => setFailureReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFailureDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleFailedDelivery} disabled={reportIssue.isPending || !failureReason.trim()}>
                            {reportIssue.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            Submit Report
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function DeliveryDetailPage() {
    return (
        <DeliveryDetailContent />
    )
}
