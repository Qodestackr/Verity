"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Truck,
    Search,
    Filter,
    ArrowUpDown,
    MoreHorizontal,
    FileText,
    MapPin,
    CheckCircle2,
    Clock,
    Calendar,
    AlertCircle,
    User,
    Navigation,
    MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

export default function ShipmentsPage() {
    const [role, setRole] = useState<"retailer" | "wholesaler" | "distributor">("distributor")
    const [activeTab, setActiveTab] = useState("all")

    const shipments = [
        {
            id: "SHP-1234",
            date: "2023-06-15",
            wholesaler: "City Beverages Ltd.",
            driver: "John Kamau",
            vehicle: "KBZ 123X",
            location: "Nairobi CBD",
            deliveryTime: "10:30 AM",
            status: "delivered",
            items: 12,
        },
        {
            id: "SHP-1235",
            date: "2023-06-18",
            wholesaler: "Metro Wholesalers",
            driver: "Peter Omondi",
            vehicle: "KCA 456Y",
            location: "Westlands",
            deliveryTime: "1:15 PM",
            status: "in-transit",
            items: 24,
        },
        {
            id: "SHP-1236",
            date: "2023-06-20",
            wholesaler: "Urban Drinks Co.",
            driver: "Mary Wanjiku",
            vehicle: "KDG 789Z",
            location: "Kilimani",
            deliveryTime: "3:45 PM",
            status: "scheduled",
            items: 8,
        },
        {
            id: "SHP-1237",
            date: "2023-06-22",
            wholesaler: "Premium Distributors",
            driver: "James Otieno",
            vehicle: "KBZ 234X",
            location: "Karen",
            deliveryTime: "11:00 AM",
            status: "scheduled",
            items: 15,
        },
        {
            id: "SHP-1238",
            date: "2023-06-25",
            wholesaler: "City Beverages Ltd.",
            driver: "John Kamau",
            vehicle: "KBZ 123X",
            location: "Nairobi CBD",
            deliveryTime: "9:30 AM",
            status: "delayed",
            items: 6,
        },
        {
            id: "SHP-1239",
            date: "2023-06-28",
            wholesaler: "Metro Wholesalers",
            driver: "Peter Omondi",
            vehicle: "KCA 456Y",
            location: "Westlands",
            deliveryTime: "2:00 PM",
            status: "in-transit",
            items: 28,
        },
    ]

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "scheduled":
                return <Calendar className="h-4 w-4 text-blue-500" />
            case "in-transit":
                return <Truck className="h-4 w-4 text-amber-500" />
            case "delayed":
                return <AlertCircle className="h-4 w-4 text-red-500" />
            case "delivered":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "scheduled":
                return (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                        Scheduled
                    </Badge>
                )
            case "in-transit":
                return (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                        In Transit
                    </Badge>
                )
            case "delayed":
                return (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500">
                        Delayed
                    </Badge>
                )
            case "delivered":
                return (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        Delivered
                    </Badge>
                )
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    const filteredShipments =
        activeTab === "all" ? shipments : shipments.filter((shipment) => shipment.status === activeTab)

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-light tracking-tight">Shipments</h1>
                <p className="text-muted-foreground">Track and manage your deliveries</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                    { icon: Calendar, count: 12, label: "Scheduled", color: "text-blue-500 bg-blue-500/10" },
                    { icon: Truck, count: 8, label: "In Transit", color: "text-amber-500 bg-amber-500/10" },
                    { icon: AlertCircle, count: 2, label: "Delayed", color: "text-red-500 bg-red-500/10" },
                    { icon: CheckCircle2, count: 24, label: "Delivered", color: "text-green-500 bg-green-500/10" },
                ].map(({ icon: Icon, count, label, color }, idx) => (
                    <Card key={idx} className={`p-1.5 ${color} flex flex-row items-center justify-between`}>
                        <Icon className="h-5 w-5" />
                        <div className="text-right">
                            <div className="text-lg font-bold">{count}</div>
                            <div className="text-xs text-muted-foreground">{label}</div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                    <div className="flex w-full sm:w-auto gap-2">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="search" placeholder="Search shipments..." className="pl-8" />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                    <span className="sr-only">Filter</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                                <DropdownMenuLabel>Filter by Wholesaler</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>All Wholesalers</DropdownMenuItem>
                                <DropdownMenuItem>City Beverages Ltd.</DropdownMenuItem>
                                <DropdownMenuItem>Metro Wholesalers</DropdownMenuItem>
                                <DropdownMenuItem>Urban Drinks Co.</DropdownMenuItem>
                                <DropdownMenuItem>Premium Distributors</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <ArrowUpDown className="h-4 w-4" />
                                    <span className="sr-only">Sort</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Newest First</DropdownMenuItem>
                                <DropdownMenuItem>Oldest First</DropdownMenuItem>
                                <DropdownMenuItem>Delivery Time</DropdownMenuItem>
                                <DropdownMenuItem>Status</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Button className="w-full h-8 text-xs sm:w-auto">
                        <Calendar className="mr-1 h-4 w-4" />
                        Schedule New Delivery
                    </Button>
                </div>

                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-5 w-full">
                        <TabsTrigger value="all">All Shipments</TabsTrigger>
                        <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                        <TabsTrigger value="in-transit">In Transit</TabsTrigger>
                        <TabsTrigger value="delayed">Delayed</TabsTrigger>
                        <TabsTrigger value="delivered">Delivered</TabsTrigger>
                    </TabsList>
                </Tabs>

                <motion.div variants={container} initial="hidden" animate="show" className="rounded-md border">
                    <Table className='text-xs'>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Shipment ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="hidden md:table-cell">Wholesaler</TableHead>
                                <TableHead className="hidden lg:table-cell">Driver</TableHead>
                                <TableHead className="hidden sm:table-cell">Location</TableHead>
                                <TableHead>Delivery Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredShipments.map((shipment) => (
                                <motion.tr key={shipment.id} variants={item} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{shipment.id}</TableCell>
                                    <TableCell>{shipment.date}</TableCell>
                                    <TableCell className="hidden md:table-cell">{shipment.wholesaler}</TableCell>
                                    <TableCell className="hidden lg:table-cell">{shipment.driver}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{shipment.location}</TableCell>
                                    <TableCell>{shipment.deliveryTime}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(shipment.status)}
                                            <span className="hidden sm:inline">{getStatusBadge(shipment.status)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Actions</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Navigation className="mr-2 h-4 w-4" />
                                                    Track Location
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    Contact Driver
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <User className="mr-2 h-4 w-4" />
                                                    Contact Wholesaler
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </TableBody>
                    </Table>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Delivery Map
                        </CardTitle>
                        <CardDescription>Real-time location of deliveries</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] bg-muted/30 rounded-md flex items-center justify-center">
                            <span className="text-muted-foreground">Delivery Map Visualization</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="h-8 text-xs w-full">
                            Open Full Map View
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Fleet Status
                        </CardTitle>
                        <CardDescription>Vehicle availability and assignments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-md border p-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-md bg-green-500/10 flex items-center justify-center">
                                        <Truck className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">KBZ 123X</div>
                                        <div className="text-xs text-muted-foreground">Driver: John Kamau</div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                                    Available
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between rounded-md border p-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-md bg-amber-500/10 flex items-center justify-center">
                                        <Truck className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">KCA 456Y</div>
                                        <div className="text-xs text-muted-foreground">Driver: Peter Omondi</div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                                    On Delivery
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between rounded-md border p-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-md bg-red-500/10 flex items-center justify-center">
                                        <Truck className="h-5 w-5 text-red-500" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">KDG 789Z</div>
                                        <div className="text-xs text-muted-foreground">Driver: Mary Wanjiku</div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="bg-red-500/10 text-red-500">
                                    Maintenance
                                </Badge>
                            </div>
                        </div>
                        <Button className="mt-1.5 w-full h-8 text-xs" asChild>
                            <Link href="/dashboard/fleet-management">Manage Fleet</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}