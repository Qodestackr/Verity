"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { UserCheck, UserX, Truck, Coffee, MapPin, Loader2 } from "lucide-react"
import { useUpdateDriverStatus } from "@/hooks/use-driver-queries"

interface DriverStatusCardProps {
    driver: {
        id: string
        name: string
        status: "AVAILABLE" | "ON_DELIVERY" | "ON_BREAK" | "OFFLINE"
        currentLocation?: {
            latitude: number
            longitude: number
        }
    }
}

const statusOptions = [
    {
        value: "AVAILABLE",
        label: "Available",
        description: "Ready for deliveries",
        icon: UserCheck,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
    },
    {
        value: "ON_DELIVERY",
        label: "On Delivery",
        description: "Currently delivering orders",
        icon: Truck,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    {
        value: "ON_BREAK",
        label: "On Break",
        description: "Taking a break",
        icon: Coffee,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
    },
    {
        value: "OFFLINE",
        label: "Off Duty",
        description: "Shift complete",
        icon: UserX,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
    },
] as const

export function DriverStatusCard({
    driver }: DriverStatusCardProps) {
    const [selectedStatus, setSelectedStatus] = useState(driver.status)
    const [notes, setNotes] = useState("")
    const [open, setOpen] = useState(false)

    const updateStatus = useUpdateDriverStatus()

    const currentStatusOption = statusOptions.find((opt) => opt.value === driver.status)
    const StatusIcon = currentStatusOption?.icon || UserCheck

    const handleStatusUpdate = async () => {
        if (selectedStatus === driver.status) {
            setOpen(false)
            return
        }

        try {
            await updateStatus.mutateAsync({
                driverId: driver.id,
                status: selectedStatus as any,
                location: driver.currentLocation,
                notes: notes || undefined,
            })
            setOpen(false)
            setNotes("")
        } catch (error) {
            // Error handled by mutation
        }
    }

    const getStatusBadge = (status: string) => {
        const option = statusOptions.find((opt) => opt.value === status)
        return <Badge className={`${option?.bgColor} ${option?.color}`}>{option?.label}</Badge>
    }

    return (
        <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Driver Status</CardTitle>
                    {getStatusBadge(driver.status)}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full ${currentStatusOption?.bgColor} flex items-center justify-center`}>
                        <StatusIcon className={`h-6 w-6 ${currentStatusOption?.color}`} />
                    </div>
                    <div className="flex-1">
                        <div className="font-medium">{currentStatusOption?.label}</div>
                        <div className="text-sm text-muted-foreground">{currentStatusOption?.description}</div>
                    </div>
                    <div className="text-right text-sm">
                        <div className="font-medium">
                            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="text-muted-foreground">{new Date().toLocaleDateString([], { weekday: "short" })}</div>
                    </div>
                </div>

                {driver.currentLocation && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Location tracking active</span>
                    </div>
                )}

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full">Update Status</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Driver Status</DialogTitle>
                            <DialogDescription>Change your availability status for dispatch and route assignments.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus} className="space-y-3">
                                {statusOptions.map((option) => (
                                    <Label
                                        key={option.value}
                                        htmlFor={option.value}
                                        className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer ${selectedStatus === option.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                                            }`}
                                    >
                                        <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                                        <div className={`h-8 w-8 rounded-full ${option.bgColor} flex items-center justify-center`}>
                                            <option.icon className={`h-4 w-4 ${option.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{option.label}</div>
                                            <div className="text-sm text-muted-foreground">{option.description}</div>
                                        </div>
                                    </Label>
                                ))}
                            </RadioGroup>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any notes about your status change..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleStatusUpdate} disabled={updateStatus.isPending}>
                                {updateStatus.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Status"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
