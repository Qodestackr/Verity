"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Phone, MessageCircle, Star, MapPin, Bike, Car, Truck, Circle, Users, Plus } from "lucide-react"
import { useLogisticsStore, type RiderStatus } from "@/stores/logistics-store"

export function RiderManagement() {

    const { riders, updateRiderStatus, orders } = useLogisticsStore()
    const [searchQuery, setSearchQuery] = useState("")

    const filteredRiders = riders.filter(
        (rider) =>
            rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rider.currentLocation.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const availableRiders = filteredRiders.filter((rider) => rider.status === "available")
    const busyRiders = filteredRiders.filter((rider) => rider.status === "busy")
    const offlineRiders = filteredRiders.filter((rider) => rider.status === "offline")

    const getStatusIcon = (status: RiderStatus) => {
        switch (status) {
            case "available":
                return <Circle className="h-3 w-3 fill-green-500 text-green-500" />
            case "busy":
                return <Circle className="h-3 w-3 fill-amber-500 text-amber-500" />
            case "offline":
                return <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
        }
    }

    const getVehicleIcon = (vehicleType: string) => {
        switch (vehicleType) {
            case "bike":
                return <Bike className="h-4 w-4" />
            case "car":
                return <Car className="h-4 w-4" />
            case "scooter":
                return <Truck className="h-4 w-4" />
            default:
                return <Bike className="h-4 w-4" />
        }
    }

    const getRiderActiveOrder = (riderId: string) => {
        return orders.find(
            (order) => order.assignedRider?.id === riderId && ["assigned", "picked_up", "in_transit"].includes(order.status),
        )
    }

    const RiderCard = ({ rider }: { rider: any }) => {
        const activeOrder = getRiderActiveOrder(rider.id)

        return (
            <Card className="overflow-hidden">
                <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={rider.avatar || "/placeholder.svg"} alt={rider.name} />
                                    <AvatarFallback>
                                        {rider.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1">{getStatusIcon(rider.status)}</div>
                            </div>
                            <div>
                                <h3 className="font-medium">{rider.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{rider.rating}</span>
                                    <span>•</span>
                                    <span>{rider.completedDeliveries} trips</span>
                                </div>
                            </div>
                        </div>
                        <Badge
                            variant="outline"
                            className={`text-xs ${rider.status === "available"
                                ? "bg-green-500/10 text-green-600"
                                : rider.status === "busy"
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-gray-500/10 text-gray-600"
                                }`}
                        >
                            {rider.status}
                        </Badge>
                    </div>

                    {/* Location & Vehicle */}
                    <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{rider.currentLocation}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            {getVehicleIcon(rider.vehicleType)}
                            <span className="capitalize">{rider.vehicleType}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">ETA: {rider.estimatedArrival}</span>
                        </div>
                    </div>

                    {/* Active Order */}
                    {activeOrder && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg mb-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Truck className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Active Delivery</span>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400">{activeOrder.customer.name}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">{activeOrder.customer.location}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-2">
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                            <Phone className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                            <MessageCircle className="h-3 w-3" />
                        </Button>
                        <Button
                            size="sm"
                            variant={rider.status === "available" ? "destructive" : "default"}
                            className="h-8 text-xs"
                            onClick={() => {
                                const newStatus = rider.status === "available" ? "offline" : "available"
                                updateRiderStatus(rider.id, newStatus)
                            }}
                        >
                            {rider.status === "available" ? "Offline" : "Online"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header with Search */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search riders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10"
                    />
                </div>
                <Button size="sm" className="h-10 px-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rider
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="p-0">
                    <CardContent className="p-3 text-center bg-green-50 dark:bg-green-950/20">
                        <div className="text-2xl font-bold text-green-600">{availableRiders.length}</div>
                        <div className="text-xs text-green-700">Available</div>
                    </CardContent>
                </Card>
                <Card className="p-0">
                    <CardContent className="p-3 text-center bg-amber-50 dark:bg-amber-950/20">
                        <div className="text-2xl font-bold text-amber-600">{busyRiders.length}</div>
                        <div className="text-xs text-amber-700">Busy</div>
                    </CardContent>
                </Card>
                <Card className="p-0">
                    <CardContent className="p-3 text-center bg-gray-50 dark:bg-gray-950/20">
                        <div className="text-2xl font-bold text-gray-600">{offlineRiders.length}</div>
                        <div className="text-xs text-gray-700">Offline</div>
                    </CardContent>
                </Card>
            </div>

            {/* Available Riders First */}
            {availableRiders.length > 0 && (
                <div>
                    <h3 className="font-medium text-green-600 mb-3 flex items-center gap-2">
                        <Circle className="h-4 w-4 fill-green-500 text-green-500" />
                        Available Riders ({availableRiders.length})
                    </h3>
                    <div className="grid gap-3">
                        {availableRiders.map((rider) => (
                            <RiderCard key={rider.id} rider={rider} />
                        ))}
                    </div>
                </div>
            )}

            {/* Busy Riders */}
            {busyRiders.length > 0 && (
                <div>
                    <h3 className="font-medium text-amber-600 mb-3 flex items-center gap-2">
                        <Circle className="h-4 w-4 fill-amber-500 text-amber-500" />
                        Busy Riders ({busyRiders.length})
                    </h3>
                    <div className="grid gap-3">
                        {busyRiders.map((rider) => (
                            <RiderCard key={rider.id} rider={rider} />
                        ))}
                    </div>
                </div>
            )}

            {/* Offline Riders */}
            {offlineRiders.length > 0 && (
                <div>
                    <h3 className="font-medium text-gray-600 mb-3 flex items-center gap-2">
                        <Circle className="h-4 w-4 fill-gray-400 text-gray-400" />
                        Offline Riders ({offlineRiders.length})
                    </h3>
                    <div className="grid gap-3">
                        {offlineRiders.map((rider) => (
                            <RiderCard key={rider.id} rider={rider} />
                        ))}
                    </div>
                </div>
            )}

            {filteredRiders.length === 0 && (
                <Card>
                    <CardContent className="text-center py-12">
                        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="font-medium text-lg mb-2">No riders found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {searchQuery ? "Try adjusting your search" : "Add riders to start managing deliveries"}
                        </p>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Rider
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
