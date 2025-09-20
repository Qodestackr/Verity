"use client"

import { useState } from "react"
import {
    Truck,
    Search,
    MapPin,
    CheckCircle2,
    Clock,
    Phone,
    ArrowRight,
    Calendar,
    AlertCircle,
    Plus,
    Filter,
} from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

export default function FleetManagementPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("deliveries")
    const [searchQuery, setSearchQuery] = useState("")

    const organizationSlug = useOrganizationSlug()

    // Mock data for deliveries
    const deliveries = [
        {
            id: "DEL-001",
            orderNumber: "PO-2023-001",
            customer: {
                name: "Downtown Liquor Store",
                address: "123 Main St, Nairobi",
                phone: "+254712345678",
            },
            status: "pending",
            items: 2,
            total: 24600,
            assignedTo: {
                id: "driver-001",
                name: "John Kamau",
                avatar: "/placeholder.svg?height=32&width=32",
                phone: "+254712345678",
            },
            scheduledFor: "2023-11-27T10:00:00",
        },
        {
            id: "DEL-002",
            orderNumber: "PO-2023-002",
            customer: {
                name: "Westlands Wine & Spirits",
                address: "456 Westlands Rd, Nairobi",
                phone: "+254723456789",
            },
            status: "in-transit",
            items: 2,
            total: 35040,
            assignedTo: {
                id: "driver-002",
                name: "Peter Omondi",
                avatar: "/placeholder.svg?height=32&width=32",
                phone: "+254723456789",
            },
            scheduledFor: "2023-11-26T14:00:00",
        },
        {
            id: "DEL-003",
            orderNumber: "PO-2023-003",
            customer: {
                name: "Karen Wines & Spirits",
                address: "789 Karen Rd, Nairobi",
                phone: "+254734567890",
            },
            status: "delivered",
            items: 2,
            total: 69000,
            assignedTo: {
                id: "driver-001",
                name: "John Kamau",
                avatar: "/placeholder.svg?height=32&width=32",
                phone: "+254712345678",
            },
            scheduledFor: "2023-11-25T09:00:00",
            deliveredAt: "2023-11-25T09:45:00",
        },
        {
            id: "DEL-004",
            orderNumber: "PO-2023-004",
            customer: {
                name: "Eastleigh Beverages",
                address: "101 Eastleigh Ave, Nairobi",
                phone: "+254745678901",
            },
            status: "failed",
            items: 2,
            total: 29280,
            assignedTo: {
                id: "driver-003",
                name: "Mary Wanjiku",
                avatar: "/placeholder.svg?height=32&width=32",
                phone: "+254734567890",
            },
            scheduledFor: "2023-11-24T11:00:00",
            failureReason: "Customer not available",
        },
        {
            id: "DEL-005",
            orderNumber: "PO-2023-005",
            customer: {
                name: "Kilimani Liquor Store",
                address: "202 Kilimani Rd, Nairobi",
                phone: "+254756789012",
            },
            status: "pending",
            items: 2,
            total: 48600,
            assignedTo: null,
            scheduledFor: "2023-11-28T13:00:00",
        },
    ]

    // Mock data for drivers
    const drivers = [
        {
            id: "driver-001",
            name: "John Kamau",
            phone: "+254712345678",
            avatar: "/placeholder.svg?height=32&width=32",
            status: "active",
            currentLocation: "Westlands",
            deliveriesCompleted: 145,
            deliveriesToday: 2,
            vehicle: "KBZ 123X (Van)",
        },
        {
            id: "driver-002",
            name: "Peter Omondi",
            phone: "+254723456789",
            avatar: "/placeholder.svg?height=32&width=32",
            status: "on-delivery",
            currentLocation: "Kilimani",
            deliveriesCompleted: 98,
            deliveriesToday: 1,
            vehicle: "KCA 456Y (Van)",
        },
        {
            id: "driver-003",
            name: "Mary Wanjiku",
            phone: "+254734567890",
            avatar: "/placeholder.svg?height=32&width=32",
            status: "inactive",
            currentLocation: "CBD",
            deliveriesCompleted: 112,
            deliveriesToday: 0,
            vehicle: "KDG 789Z (Van)",
        },
    ]

    // Filter deliveries based on search query
    const filteredDeliveries = deliveries.filter(
        (delivery) =>
            delivery.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            delivery.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            delivery.customer.address.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Get status badge
    const getStatusBadge = (status: string) => {
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

    // Get driver status badge
    const getDriverStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                    </Badge>
                )
            case "on-delivery":
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        On Delivery
                    </Badge>
                )
            case "inactive":
                return (
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                        Inactive
                    </Badge>
                )
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    return (
        <div className="container max-w-6xl mx-auto py-3 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-light tracking-tight">Fleet Management</h1>
                    <p className="text-muted-foreground text-sm">Manage deliveries and drivers</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                    </Button>
                    <Button className="h-8 text-xs" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Driver
                    </Button>
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-2">
                    <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
                    <TabsTrigger value="drivers">Drivers</TabsTrigger>
                </TabsList>

                {/* Deliveries Tab */}
                <TabsContent value="deliveries" className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search deliveries..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                            <Button size="sm" className="h-8 text-xs">
                                <Plus className="h-4 w-4 mr-2" />
                                New Delivery
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredDeliveries.map((delivery) => (
                            <Card
                                key={delivery.id}
                                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => router.push(`/dashboard/${organizationSlug}/fleet-management/deliveries/${delivery.id}`)}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-1.5 gap-2">
                                    <div className="flex items-start gap-3">
                                        <div className="hidden sm:flex h-10 w-10 rounded-full bg-primary/10 items-center justify-center flex-shrink-0">
                                            <Truck className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{delivery.customer.name}</h3>
                                                {getStatusBadge(delivery.status)}
                                            </div>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                                <span className="truncate">{delivery.customer.address}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-muted-foreground">
                                                    {format(new Date(delivery.scheduledFor), "MMM d, h:mm a")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
                                        {delivery.assignedTo ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src={delivery.assignedTo.avatar || "/placeholder.svg"}
                                                        alt={delivery.assignedTo.name}
                                                    />
                                                    <AvatarFallback>{delivery.assignedTo.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-xs">
                                                    <div>{delivery.assignedTo.name}</div>
                                                    <div className="text-[11px] text-muted-foreground">(Assigned Driver)</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="outline">
                                                Assign Driver
                                            </Button>
                                        )}
                                        <ArrowRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Drivers Tab */}
                <TabsContent value="drivers" className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="search" placeholder="Search drivers..." className="pl-8" />
                        </div>
                        <Button size="sm" className="h-8 text-xs">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Driver
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {drivers.map((driver) => (
                            <Card key={driver.id} className="overflow-hidden">
                                <CardContent className="py-1.5">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={driver.avatar || ""} alt={driver.name} />
                                                <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium">{driver.name}</div>
                                        </div>
                                        {getDriverStatusBadge(driver.status)}
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center">
                                            <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                                            <span className="truncate max-w-32">{driver.currentLocation}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Today: </span>
                                            <span className="font-medium">{driver.deliveriesToday}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <Button size="sm" className="w-full h-7 text-xs py-0">
                                            <Phone className="h-3 w-3 mr-1" />
                                            Call
                                        </Button>
                                        <Button size="sm" variant="outline" className="w-full h-7 text-xs py-0">
                                            Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
