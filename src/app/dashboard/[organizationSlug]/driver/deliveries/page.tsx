"use client"

import { useState } from "react"
import { useParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, Package } from "lucide-react"
import { DeliveryCard } from "@/components/driver/delivery-card"
import { useDriverDeliveries } from "@/hooks/use-driver-queries"

// Mock driver data
const mockDriver = {
    id: "driver-123",
    name: "John Kamau",
}

function DriverDeliveriesContent() {
    const params = useParams()
    const [activeTab, setActiveTab] = useState("today")
    const [searchQuery, setSearchQuery] = useState("")

    // Mock organization ID
    const organizationId = "org-123"

    const { data: deliveries = [], isLoading } = useDriverDeliveries(organizationId, {
        driverId: mockDriver.id,
        search: searchQuery || undefined,
    })

    // Filter deliveries based on active tab and search query
    const filteredDeliveries = deliveries.filter((delivery) => {
        const matchesSearch =
            delivery.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            delivery.customerAddress.toLowerCase().includes(searchQuery.toLowerCase())

        if (activeTab === "today") {
            const today = new Date().toISOString().split("T")[0]
            const deliveryDate = new Date(delivery.scheduledFor).toISOString().split("T")[0]
            return deliveryDate === today && matchesSearch
        } else if (activeTab === "pending") {
            return (delivery.status === "PENDING" || delivery.status === "ASSIGNED") && matchesSearch
        } else if (activeTab === "in-transit") {
            return delivery.status === "IN_TRANSIT" && matchesSearch
        } else if (activeTab === "completed") {
            return (delivery.status === "DELIVERED" || delivery.status === "FAILED") && matchesSearch
        }

        return matchesSearch
    })

    return (
        <div className="container max-w-md mx-auto py-2 px-4 space-y-4">
            <div>
                <h1 className="text-xl font-light tracking-tight">My Deliveries</h1>
                <p className="text-sm text-muted-foreground">Manage your delivery tasks</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search deliveries..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Tabs */}
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="in-transit">Active</TabsTrigger>
                    <TabsTrigger value="completed">Done</TabsTrigger>
                </TabsList>

                {/* Tab Content */}
                <TabsContent value={activeTab} className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 bg-muted/50 rounded-md animate-pulse" />
                            ))}
                        </div>
                    ) : filteredDeliveries.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                            <h3 className="font-medium text-lg">No deliveries found</h3>
                            <p className="text-sm text-muted-foreground">
                                {activeTab === "today"
                                    ? "You have no deliveries scheduled for today."
                                    : `No ${activeTab} deliveries match your search.`}
                            </p>
                        </div>
                    ) : (
                        filteredDeliveries.map((delivery) => (
                            <DeliveryCard
                                key={delivery.id}
                                delivery={delivery}
                                onNavigate={() => {
                                    const address = encodeURIComponent(delivery.customerAddress)
                                    window.open(`https://maps.google.com/?q=${address}`, "_blank")
                                }}
                                onViewDetails={() => {
                                    // Navigate to delivery detail page
                                    window.location.href = `/dashboard/${params.organizationSlug}/driver/deliveries/${delivery.id}`
                                }}
                            />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default function DriverDeliveriesPage() {
    return (
        <DriverDeliveriesContent />
    )
}
