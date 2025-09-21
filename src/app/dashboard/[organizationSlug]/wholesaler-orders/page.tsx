"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Search,
    Filter,
    ArrowUpDown,
    MoreHorizontal,
    FileText,
    Truck,
    CheckCircle2,
    Clock,
    Package,
    Calendar,
    User,
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
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function WholesalerOrdersPage() {
    const [role, setRole] = useState<"retailer" | "wholesaler" | "distributor">("distributor")
    const [activeTab, setActiveTab] = useState("all")

    const orders = [
        {
            id: "ORD-5678",
            date: "2023-06-15",
            wholesaler: "City Beverages Ltd.",
            contact: "James Mwangi",
            phone: "+254 712 345 678",
            location: "Nairobi CBD",
            total: "KSh 240,500",
            status: "new",
            items: 12,
        },
        {
            id: "ORD-5677",
            date: "2023-06-18",
            wholesaler: "Metro Wholesalers",
            contact: "Wanjiku Kamau",
            phone: "+254 723 456 789",
            location: "Westlands",
            total: "KSh 350,750",
            status: "processing",
            items: 24,
        },
        {
            id: "ORD-5676",
            date: "2023-06-20",
            wholesaler: "Urban Drinks Co.",
            contact: "David Ochieng",
            phone: "+254 734 567 890",
            location: "Kilimani",
            total: "KSh 180,250",
            status: "shipped",
            items: 8,
        },
        {
            id: "ORD-5675",
            date: "2023-06-22",
            wholesaler: "Premium Distributors",
            contact: "Sarah Njeri",
            phone: "+254 745 678 901",
            location: "Karen",
            total: "KSh 475,000",
            status: "delivered",
            items: 15,
        },
        {
            id: "ORD-5674",
            date: "2023-06-25",
            wholesaler: "City Beverages Ltd.",
            contact: "James Mwangi",
            phone: "+254 712 345 678",
            location: "Nairobi CBD",
            total: "KSh 150,500",
            status: "processing",
            items: 6,
        },
        {
            id: "ORD-5673",
            date: "2023-06-28",
            wholesaler: "Metro Wholesalers",
            contact: "Wanjiku Kamau",
            phone: "+254 723 456 789",
            location: "Westlands",
            total: "KSh 320,750",
            status: "new",
            items: 28,
        },
    ]

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "new":
                return <Clock className="h-4 w-4 text-blue-500" />
            case "processing":
                return <Package className="h-4 w-4 text-amber-500" />
            case "shipped":
                return <Truck className="h-4 w-4 text-purple-500" />
            case "delivered":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "new":
                return (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                        New
                    </Badge>
                )
            case "processing":
                return (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                        Processing
                    </Badge>
                )
            case "shipped":
                return (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
                        Shipped
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

    const filteredOrders = activeTab === "all" ? orders : orders.filter((order) => order.status === activeTab)

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Wholesaler Orders</h1>
                <p className="text-muted-foreground">Manage and process orders from wholesalers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-500/10">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Clock className="h-8 w-8 text-blue-500 mb-2" />
                        <div className="text-2xl font-bold">12</div>
                        <div className="text-sm text-muted-foreground">New Orders</div>
                    </CardContent>
                </Card>
                <Card className="bg-amber-500/10">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Package className="h-8 w-8 text-amber-500 mb-2" />
                        <div className="text-2xl font-bold">8</div>
                        <div className="text-sm text-muted-foreground">Processing</div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-500/10">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Truck className="h-8 w-8 text-purple-500 mb-2" />
                        <div className="text-2xl font-bold">15</div>
                        <div className="text-sm text-muted-foreground">Shipped</div>
                    </CardContent>
                </Card>
                <Card className="bg-green-500/10">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                        <div className="text-2xl font-bold">24</div>
                        <div className="text-sm text-muted-foreground">Delivered</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex w-full sm:w-auto gap-2">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="search" placeholder="Search orders..." className="pl-8" />
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
                                <DropdownMenuItem>Total: High to Low</DropdownMenuItem>
                                <DropdownMenuItem>Total: Low to High</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Button className="w-full sm:w-auto">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Deliveries
                    </Button>
                </div>

                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-5 w-full">
                        <TabsTrigger value="all">All Orders</TabsTrigger>
                        <TabsTrigger value="new">New</TabsTrigger>
                        <TabsTrigger value="processing">Processing</TabsTrigger>
                        <TabsTrigger value="shipped">Shipped</TabsTrigger>
                        <TabsTrigger value="delivered">Delivered</TabsTrigger>
                    </TabsList>
                </Tabs>

                <motion.div variants={container} initial="hidden" animate="show" className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="hidden md:table-cell">Wholesaler</TableHead>
                                <TableHead className="hidden lg:table-cell">Location</TableHead>
                                <TableHead className="hidden sm:table-cell">Items</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order) => (
                                <motion.tr key={order.id} variants={item} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.date}</TableCell>
                                    <TableCell className="hidden md:table-cell">{order.wholesaler}</TableCell>
                                    <TableCell className="hidden lg:table-cell">{order.location}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{order.items}</TableCell>
                                    <TableCell className="text-right">{order.total}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(order.status)}
                                            <span className="hidden sm:inline">{getStatusBadge(order.status)}</span>
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
                                                    <Package className="mr-2 h-4 w-4" />
                                                    Process Order
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Truck className="mr-2 h-4 w-4" />
                                                    Ship Order
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
        </div>
    )
}