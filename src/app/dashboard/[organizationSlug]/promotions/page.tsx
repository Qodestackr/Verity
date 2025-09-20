"use client";

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"
import {
    CalendarDays,
    CheckCircle2,
    Clock,
    Download,
    Filter,
    Gift,
    Globe,
    Info,
    LayoutGrid,
    LineChart,
    MoreHorizontal,
    Package,
    Percent,
    Plus,
    QrCode,
    RefreshCw,
    SearchIcon,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Smartphone,
    Store,
    Tag,
    Ticket,
    Trash2,
    Truck,
    UserPlus,
    Users,
    Wine
} from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
// import { QRCodeSVG } from 'qrcode.react'
import { cn } from "@/lib/utils"
// import { useStore } from "@/lib/store"

// Mock data for various promotion types
const recentPromotions = [
    {
        id: "PRO-1234",
        name: "Tusker Lager 20% Off",
        type: "percentage",
        status: "active",
        channels: ["nairobi-east", "nairobi-west", "kiambu"],
        startDate: "2025-03-10T00:00:00Z",
        endDate: "2025-03-24T23:59:59Z",
        discount: 20,
        conditions: "Minimum purchase of 6 crates",
        products: ["Tusker Lager"],
        usage: 432,
        limit: 1000,
        createdBy: "Jane Doe"
    },
    {
        id: "PRO-1235",
        name: "Buy 2 Crates Get 1 Free - White Cap",
        type: "freebie",
        status: "active",
        channels: ["all"],
        startDate: "2025-03-05T00:00:00Z",
        endDate: "2025-03-20T23:59:59Z",
        discount: null,
        conditions: "Buy 2 crates of White Cap, get 1 free",
        products: ["White Cap Lager"],
        usage: 89,
        limit: 200,
        createdBy: "John Smith"
    },
    {
        id: "PRO-1236",
        name: "Weekend Happy Hour",
        type: "percentage",
        status: "scheduled",
        channels: ["nairobi-cbd", "westlands"],
        startDate: "2025-03-17T00:00:00Z",
        endDate: "2025-03-30T23:59:59Z",
        discount: 15,
        conditions: "Friday & Saturday only, 5pm-8pm",
        products: ["All EABL Products"],
        usage: 0,
        limit: 500,
        createdBy: "Jane Doe"
    },
    {
        id: "PRO-1237",
        name: "Free Delivery on Ksh 30,000+",
        type: "shipping",
        status: "active",
        channels: ["all"],
        startDate: "2025-03-01T00:00:00Z",
        endDate: "2025-04-01T23:59:59Z",
        discount: null,
        conditions: "Orders above Ksh 30,000",
        products: ["All Products"],
        usage: 157,
        limit: null,
        createdBy: "John Smith"
    },
    {
        id: "PRO-1238",
        name: "New Release: Balozi Ice 10% Off",
        type: "percentage",
        status: "active",
        channels: ["nairobi-east", "mombasa"],
        startDate: "2025-03-08T00:00:00Z",
        endDate: "2025-03-22T23:59:59Z",
        discount: 10,
        conditions: "No minimum purchase",
        products: ["Balozi Ice"],
        usage: 275,
        limit: 500,
        createdBy: "Jane Doe"
    },
    {
        id: "PRO-1239",
        name: "Guinness Crate + Free Merchandise",
        type: "gift",
        status: "ended",
        channels: ["all"],
        startDate: "2025-02-15T00:00:00Z",
        endDate: "2025-03-01T23:59:59Z",
        discount: null,
        conditions: "Buy a crate of Guinness, get a free t-shirt",
        products: ["Guinness Stout"],
        usage: 342,
        limit: 350,
        createdBy: "John Smith"
    }
];

// Data for charts
const promotionPerformanceData = [
    { name: 'Tusker 20% Off', revenue: 324000, redemptions: 432, avgOrderValue: 750 },
    { name: 'White Cap B2G1', revenue: 156000, redemptions: 89, avgOrderValue: 1752 },
    { name: 'Free Delivery', revenue: 712000, redemptions: 157, avgOrderValue: 4535 },
    { name: 'Balozi Ice 10%', revenue: 186000, redemptions: 275, avgOrderValue: 676 },
    { name: 'Guinness + Merch', revenue: 427000, redemptions: 342, avgOrderValue: 1249 }
];

// Sample voucher codes
const voucherCodes = [
    { code: "MARCH20", used: 145, total: 200, status: "active" },
    { code: "NEWBEER10", used: 87, total: 100, status: "active" },
    { code: "WEEKEND15", used: 0, total: 500, status: "scheduled" },
    { code: "FREESHIP", used: 157, total: null, status: "active" },
    { code: "TUSKER2023", used: 350, total: 350, status: "ended" }
];

// Sample bundled products/promotions
const bundlePromotions = [
    {
        id: "BUN-001",
        name: "Party Pack Special",
        description: "1 crate Tusker + 1 crate Whitecap + 2 bottles vodka",
        price: 12500,
        originalPrice: 15000,
        image: "https://placehold.co/300x200",
        status: "active"
    },
    {
        id: "BUN-002",
        name: "Bar Starter Kit",
        description: "Mixed beer selection + spirits assortment",
        price: 45000,
        originalPrice: 52000,
        image: "https://placehold.co/300x200",
        status: "active"
    },
    {
        id: "BUN-003",
        name: "Corporate Event Package",
        description: "Premium selection for 100+ guests with branded items",
        price: 120000,
        originalPrice: 150000,
        image: "https://placehold.co/300x200",
        status: "active"
    }
];

// Retailer-specific promotions
const retailerPromotions = [
    {
        id: "RET-001",
        retailer: "Nairobi CBD Liquor Store",
        promotionId: "PRO-5432",
        name: "Exclusive: Johnnie Walker 15% Off",
        startDate: "2025-03-15T00:00:00Z",
        endDate: "2025-03-30T23:59:59Z",
        status: "active"
    },
    {
        id: "RET-002",
        retailer: "Westlands Wine & Spirits",
        promotionId: "PRO-5433",
        name: "Bulk Order Discount: 25% on 10+ crates",
        startDate: "2025-03-10T00:00:00Z",
        endDate: "2025-04-10T23:59:59Z",
        status: "active"
    },
    {
        id: "RET-003",
        retailer: "Kiambu Road Beers",
        promotionId: "PRO-5434",
        name: "Loyalty Reward: 5% on all purchases",
        startDate: "2025-03-01T00:00:00Z",
        endDate: "2025-06-01T23:59:59Z",
        status: "active"
    }
];

// QR code promotion campaign data
const qrPromotions = [
    {
        id: "QR-001",
        name: "Scan & Win - EABL Event",
        venue: "KICC Nairobi",
        date: "2025-03-25",
        scans: 245,
        url: "https://alcorabooks.com/promo/eabl-25",
        status: "active"
    },
    {
        id: "QR-002",
        name: "Tusker Football Promo",
        venue: "Multiple stadiums",
        date: "2025-04-05",
        scans: 0,
        url: "https://alcorabooks.com/promo/tuskerfootball",
        status: "scheduled"
    },
    {
        id: "QR-003",
        name: "Bar Tour Promo - Nairobi",
        venue: "15 bars in Nairobi",
        date: "2025-03-15",
        scans: 867,
        url: "https://alcorabooks.com/promo/bartour-nbo",
        status: "active"
    }
];

function TabsWithSearchParams({ children }: any) {
    const searchParams = useSearchParams()
    const activeTab = searchParams.get("tab") || "dashboard"

    return (
        <Tabs defaultValue={activeTab} className="space-y-4">
            {children}
        </Tabs>
    )
}


export default function PromotionsPage() {

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [channelFilter, setChannelFilter] = useState("all");

    // Sample filter function for the promotions list
    const filteredPromotions = recentPromotions.filter(promo => {
        const matchesSearch =
            promo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            promo.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || promo.status === statusFilter;

        const matchesChannel =
            channelFilter === "all" ||
            promo.channels.includes(channelFilter) ||
            promo.channels.includes("all");

        return matchesSearch && matchesStatus && matchesChannel;
    });

    // Format date helper
    const formatDate = (dateString: string | number | Date) => {
        return format(new Date(dateString), "MMM d, yyyy");
    };

    // Get status badge based on promotion status
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
            case "scheduled":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Scheduled</Badge>;
            case "ended":
                return <Badge variant="outline">Ended</Badge>;
            case "paused":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Paused</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
                    <p className="text-muted-foreground">
                        Create and manage marketing promotions, discounts, and special offers
                    </p>
                </div>
                <Button className="flex items-center gap-1 h-7 text-xs" size="sm">
                    <Plus className="h-4 w-4" />
                    <span>Create Promotion</span>
                </Button>
            </div>

            {/* Main Content with Tabs */}
            <Suspense fallback={<div>Loading tabs...</div>}>
                <TabsWithSearchParams className="space-y-4">
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                        <TabsTrigger value="dashboard" className="flex items-center gap-1.5">
                            <LayoutGrid className="h-4 w-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </TabsTrigger>
                        <TabsTrigger value="catalog" className="flex items-center gap-1.5">
                            <Tag className="h-4 w-4" />
                            <span className="hidden sm:inline">Catalog</span>
                        </TabsTrigger>
                        <TabsTrigger value="cart" className="flex items-center gap-1.5">
                            <ShoppingCart className="h-4 w-4" />
                            <span className="hidden sm:inline">Cart</span>
                        </TabsTrigger>
                        <TabsTrigger value="vouchers" className="flex items-center gap-1.5">
                            <Ticket className="h-4 w-4" />
                            <span className="hidden sm:inline">Vouchers</span>
                        </TabsTrigger>
                        <TabsTrigger value="bundles" className="flex items-center gap-1.5">
                            <Package className="h-4 w-4" />
                            <span className="hidden sm:inline">Bundles</span>
                        </TabsTrigger>
                        <TabsTrigger value="retailers" className="flex items-center gap-1.5">
                            <Store className="h-4 w-4" />
                            <span className="hidden sm:inline">Retailers</span>
                        </TabsTrigger>
                        <TabsTrigger value="qrcodes" className="flex items-center gap-1.5">
                            <QrCode className="h-4 w-4" />
                            <span className="hidden sm:inline">QR Codes</span>
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-1.5">
                            <LineChart className="h-4 w-4" />
                            <span className="hidden sm:inline">Analytics</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Dashboard Tab */}
                    <TabsContent value="dashboard" className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Active Promotions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center">
                                        <div className="text-2xl font-bold">12</div>
                                        <Badge className="bg-green-500 hover:bg-green-600">+3 this week</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Redemptions (This Month)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center">
                                        <div className="text-2xl font-bold">1,247</div>
                                        <Badge variant="outline" className="text-amber-500">+24%</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Promotional Revenue</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center">
                                        <div className="text-2xl font-bold">KES 1.8M</div>
                                        <Badge variant="outline" className="text-green-500">+32%</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Upcoming Promotions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* <div className="flex justify-between items-center">
                                    <div className="text-2xl font-bold">5</div>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                                        <Calendar className="h-3.5 w-3.5 mr-1" />
                                        View
                                    </Button>
                                </div> */}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Performing Promotions Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Performing Promotions</CardTitle>
                                <CardDescription>Based on total revenue and redemptions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer className='text-xs' width="100%" height="100%">
                                        <BarChart
                                            data={promotionPerformanceData}
                                            margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                                            <YAxis />
                                            <RechartsTooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
                                            <Bar dataKey="revenue" fill="#3498db" name="Revenue" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Promotions Table */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Recent Promotions</CardTitle>
                                    <CardDescription>View and manage your active and recent promotions</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="ghost">
                                        <Filter className="h-4 w-4 mr-1" />
                                        Filter
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <Download className="h-4 w-4 mr-1" />
                                        Export
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead>Usage</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentPromotions.slice(0, 5).map((promo) => (
                                                <TableRow key={promo.id}>
                                                    <TableCell className="font-medium">{promo.id}</TableCell>
                                                    <TableCell>{promo.name}</TableCell>
                                                    <TableCell className="capitalize">{promo.type}</TableCell>
                                                    <TableCell>{formatDate(promo.startDate)} - {formatDate(promo.endDate)}</TableCell>
                                                    <TableCell>{promo.usage} {promo.limit ? `/ ${promo.limit}` : ''}</TableCell>
                                                    <TableCell>{getStatusBadge(promo.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontalIcon className="h-4 w-4" />
                                                                    <span className="sr-only">Actions</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem>View details</DropdownMenuItem>
                                                                <DropdownMenuItem>Edit promotion</DropdownMenuItem>
                                                                <DropdownMenuItem>View analytics</DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {promo.status === "active" ? (
                                                                    <DropdownMenuItem className="text-amber-500">Pause promotion</DropdownMenuItem>
                                                                ) : promo.status === "paused" ? (
                                                                    <DropdownMenuItem className="text-green-500">Activate promotion</DropdownMenuItem>
                                                                ) : null}
                                                                <DropdownMenuItem className="text-red-500">Delete promotion</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                            <CardFooter className="justify-center">
                                <Button variant="outline" size="sm">View All Promotions</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Catalog Discounts Tab */}
                    <TabsContent value="catalog" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>Catalog Discounts</CardTitle>
                                        <CardDescription>Create product promotions for sales events using advanced rules</CardDescription>
                                    </div>
                                    <Button className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        <span>New Catalog Discount</span>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col md:flex-row gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search promotions..."
                                            className="pl-8"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <Filter className="mr-2 h-4 w-4" />
                                                <SelectValue placeholder="Filter by status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                                <SelectItem value="paused">Paused</SelectItem>
                                                <SelectItem value="ended">Ended</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={channelFilter} onValueChange={setChannelFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <Globe className="mr-2 h-4 w-4" />
                                                <SelectValue placeholder="Filter by channel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Channels</SelectItem>
                                                <SelectItem value="nairobi-east">Nairobi East</SelectItem>
                                                <SelectItem value="nairobi-west">Nairobi West</SelectItem>
                                                <SelectItem value="nairobi-cbd">Nairobi CBD</SelectItem>
                                                <SelectItem value="kiambu">Kiambu</SelectItem>
                                                <SelectItem value="mombasa">Mombasa</SelectItem>
                                                <SelectItem value="westlands">Westlands</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Discount</TableHead>
                                                <TableHead>Products</TableHead>
                                                <TableHead>Channels</TableHead>
                                                <TableHead>Period</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredPromotions.map((promo) => (
                                                <TableRow key={promo.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{promo.name}</div>
                                                        <div className="text-xs text-muted-foreground">{promo.id}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {promo.type === "percentage" ? (
                                                            <div className="flex items-center">
                                                                <Percent className="h-4 w-4 mr-1 text-blue-500" />
                                                                <span>{promo.discount}% off</span>
                                                            </div>
                                                        ) : promo.type === "freebie" ? (
                                                            <div className="flex items-center">
                                                                <Gift className="h-4 w-4 mr-1 text-purple-500" />
                                                                <span>Free product</span>
                                                            </div>
                                                        ) : promo.type === "shipping" ? (
                                                            <div className="flex items-center">
                                                                <Truck className="h-4 w-4 mr-1 text-green-500" />
                                                                <span>Free shipping</span>
                                                            </div>
                                                        ) : promo.type === "gift" ? (
                                                            <div className="flex items-center">
                                                                <Package className="h-4 w-4 mr-1 text-amber-500" />
                                                                <span>Free gift</span>
                                                            </div>
                                                        ) : (
                                                            <span>Custom</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {promo.products.map((product, index) => (
                                                                <Badge key={index} variant="outline" className="text-xs">
                                                                    {product}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {promo.channels.includes("all") ? (
                                                            <Badge variant="secondary">All Channels</Badge>
                                                        ) : (
                                                            <span>{promo.channels.length} channels</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs">{formatDate(promo.startDate)}</span>
                                                            <span className="text-xs">to {formatDate(promo.endDate)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(promo.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontalIcon className="h-4 w-4" />
                                                                    <span className="sr-only">Actions</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem>View details</DropdownMenuItem>
                                                                <DropdownMenuItem>Edit promotion</DropdownMenuItem>
                                                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {promo.status === "active" ? (
                                                                    <DropdownMenuItem className="text-amber-500">Pause promotion</DropdownMenuItem>
                                                                ) : promo.status === "paused" ? (
                                                                    <DropdownMenuItem className="text-green-500">Activate promotion</DropdownMenuItem>
                                                                ) : null}
                                                                <DropdownMenuItem className="text-red-500">Delete promotion</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {filteredPromotions.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                                        No promotions found matching your filters
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sample Category Promotion Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Promotion Templates</CardTitle>
                                <CardDescription>Common promotion types for quick setup</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Percentage Off</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            <p className="text-sm text-muted-foreground">Discount specific products or categories by a percentage</p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="outline" size="sm" className="w-full">Create</Button>
                                        </CardFooter>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Buy X Get Y Free</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            <p className="text-sm text-muted-foreground">Encourage larger purchases with free products</p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="outline" size="sm" className="w-full">Create</Button>
                                        </CardFooter>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Happy Hour Discount</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            <p className="text-sm text-muted-foreground">Time-specific discounts for weekends or evenings</p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="outline" size="sm" className="w-full">Create</Button>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Cart Discounts Tab */}
                    <TabsContent value="cart" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>Cart Discounts</CardTitle>
                                        <CardDescription>Create conditional promotions such as buy X get Y, free shipping, and minimum order discounts</CardDescription>
                                    </div>
                                    <Button className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        <span>New Cart Discount</span>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <Card className="bg-primary/5">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">Buy X Get Y Free</CardTitle>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="list-disc pl-5 text-sm space-y-1">
                                                <li>Buy 2+ crates, get 1 free</li>
                                                <li>Buy any spirit, get mixer free</li>
                                                <li>Buy premium, get standard free</li>
                                            </ul>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-primary/5">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">Free Shipping</CardTitle>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="list-disc pl-5 text-sm space-y-1">
                                                <li>Orders above a minimum amount</li>
                                                <li>Limited to specific areas/regions</li>
                                                <li>Time-limited free delivery</li>
                                            </ul>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-primary/5">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">Minimum Order Discount</CardTitle>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="list-disc pl-5 text-sm space-y-1">
                                                <li>5% off orders above Ksh 15,000</li>
                                                <li>10% off orders above Ksh 50,000</li>
                                                <li>15% off orders above Ksh 100,000</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="bg-muted/40 rounded-md p-4 mb-6">
                                    <h3 className="text-sm font-medium mb-2 flex items-center">
                                        <Info className="h-4 w-4 mr-2 text-blue-500" />
                                        Active Cart Discounts
                                    </h3>
                                    <ul className="space-y-2">
                                        <li className="flex items-center justify-between bg-card p-3 rounded-md border">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-green-500">Active</Badge>
                                                <span className="font-medium">Buy 2 Get 1 Free - White Cap</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm">Edit</Button>
                                                <Button variant="ghost" size="sm">Pause</Button>
                                            </div>
                                        </li>
                                        <li className="flex items-center justify-between bg-card p-3 rounded-md border">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-green-500">Active</Badge>
                                                <span className="font-medium">Free Delivery on Ksh 30,000+</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm">Edit</Button>
                                                <Button variant="ghost" size="sm">Pause</Button>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Create Advanced Cart Rules</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-muted/30 rounded-md p-4">
                                            <div className="flex flex-col space-y-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-medium">Rule Builder</span>
                                                    <Badge variant="outline" className="text-xs">Advanced</Badge>
                                                </div>

                                                <div className="bg-card p-3 rounded-md border">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium">Conditions (If)</span>
                                                        <Button variant="ghost" size="sm">
                                                            <Plus className="h-3 w-3 mr-1" />
                                                            Add
                                                        </Button>
                                                    </div>
                                                    <div className="pl-4 border-l-2 border-muted space-y-2">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Select defaultValue="cart_total">
                                                                <SelectTrigger className="h-8 w-[140px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="cart_total">Cart Total</SelectItem>
                                                                    <SelectItem value="item_count">Item Count</SelectItem>
                                                                    <SelectItem value="product_category">Product Category</SelectItem>
                                                                    <SelectItem value="customer_group">Customer Group</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <Select defaultValue="greater_than">
                                                                <SelectTrigger className="h-8 w-[120px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="greater_than">is greater than</SelectItem>
                                                                    <SelectItem value="less_than">is less than</SelectItem>
                                                                    <SelectItem value="equals">equals</SelectItem>
                                                                    <SelectItem value="contains">contains</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <Input
                                                                type="text"
                                                                placeholder="Value"
                                                                className="h-8 w-[120px]"
                                                                defaultValue="30000"
                                                            />
                                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-card p-3 rounded-md border">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium">Actions (Then)</span>
                                                        <Button variant="ghost" size="sm">
                                                            <Plus className="h-3 w-3 mr-1" />
                                                            Add
                                                        </Button>
                                                    </div>
                                                    <div className="pl-4 border-l-2 border-muted space-y-2">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Select defaultValue="free_shipping">
                                                                <SelectTrigger className="h-8 w-[140px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="percentage_discount">Percentage Discount</SelectItem>
                                                                    <SelectItem value="fixed_discount">Fixed Discount</SelectItem>
                                                                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                                                                    <SelectItem value="free_product">Free Product</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <Input
                                                                type="text"
                                                                placeholder="Value"
                                                                className="h-8 w-[120px]"
                                                                disabled
                                                            />
                                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline">Cancel</Button>
                                                    <Button>Save Rule</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Vouchers Tab */}
                    <TabsContent value="vouchers" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Voucher Campaigns</CardTitle>
                                    <CardDescription>Generate and manage voucher codes in bulk</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {voucherCodes.map((voucher, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                                                <div>
                                                    <div className="font-medium">{voucher.code}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                        <span>Used: {voucher.used}</span>
                                                        {voucher.total && <span>/ {voucher.total}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(voucher.status)}
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontalIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full">Generate New Codes</Button>
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Voucher Generator</CardTitle>
                                    <CardDescription>Create customized voucher codes</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="prefix">Prefix (Optional)</Label>
                                            <Input id="prefix" placeholder="e.g. MARCH25" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="count">Number of Codes</Label>
                                            <Input id="count" type="number" defaultValue="100" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="length">Code Length</Label>
                                            <Select defaultValue="8">
                                                <SelectTrigger id="length">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="6">6 characters</SelectItem>
                                                    <SelectItem value="8">8 characters</SelectItem>
                                                    <SelectItem value="10">10 characters</SelectItem>
                                                    <SelectItem value="12">12 characters</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="discount-type">Discount Type</Label>
                                            <Select defaultValue="percentage">
                                                <SelectTrigger id="discount-type">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="percentage">Percentage discount</SelectItem>
                                                    <SelectItem value="fixed">Fixed amount</SelectItem>
                                                    <SelectItem value="shipping">Free shipping</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="discount-value">Discount Value</Label>
                                            <div className="flex items-center">
                                                <Input id="discount-value" defaultValue="10" />
                                                <div className="ml-2">%</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="min-purchase">Minimum Purchase (Optional)</Label>
                                            <div className="flex items-center">
                                                <div className="mr-2">KES</div>
                                                <Input id="min-purchase" placeholder="e.g. 5000" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex gap-2">
                                    <Button variant="outline" className="flex-1">Preview</Button>
                                    <Button className="flex-1">Generate</Button>
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Voucher Distribution</CardTitle>
                                    <CardDescription>Share vouchers with customers</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-muted/30 rounded-md">
                                            <h3 className="font-medium text-sm mb-2">Email Distribution</h3>
                                            <p className="text-xs text-muted-foreground mb-3">Send voucher codes to customer segments</p>
                                            <Button size="sm" className="w-full">
                                                <Users className="h-4 w-4 mr-2" />
                                                Create Email Campaign
                                            </Button>
                                        </div>

                                        <div className="p-4 bg-muted/30 rounded-md">
                                            <h3 className="font-medium text-sm mb-2">SMS Distribution</h3>
                                            <p className="text-xs text-muted-foreground mb-3">Send voucher codes via SMS</p>
                                            <Button size="sm" variant="outline" className="w-full">
                                                <Smartphone className="h-4 w-4 mr-2" />
                                                Create SMS Campaign
                                            </Button>
                                        </div>

                                        <div className="p-4 bg-muted/30 rounded-md">
                                            <h3 className="font-medium text-sm mb-2">Export Codes</h3>
                                            <p className="text-xs text-muted-foreground mb-3">Download codes for external use</p>
                                            <Button size="sm" variant="outline" className="w-full">
                                                <Download className="h-4 w-4 mr-2" />
                                                Export to CSV
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Bundles Tab */}
                    <TabsContent value="bundles" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>Product Bundles</CardTitle>
                                        <CardDescription>Create special offers by bundling products together</CardDescription>
                                    </div>
                                    <Button className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        <span>Create Bundle</span>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {bundlePromotions.map((bundle) => (
                                        <Card key={bundle.id} className="overflow-hidden">
                                            <div className="aspect-video bg-muted relative">
                                                <div className="absolute top-2 right-2">
                                                    {bundle.status === "active" && (
                                                        <Badge className="bg-green-500">Active</Badge>
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Wine className="h-20 w-20 text-white opacity-50" />
                                                </div>
                                            </div>
                                            <CardHeader className="pb-2">
                                                <CardTitle>{bundle.name}</CardTitle>
                                                <CardDescription>{bundle.description}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="pb-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-lg font-bold">KES {bundle.price.toLocaleString()}</span>
                                                        <span className="text-sm text-muted-foreground line-through">KES {bundle.originalPrice.toLocaleString()}</span>
                                                    </div>
                                                    <Badge variant="outline" className="text-green-500">
                                                        Save {Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)}%
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex gap-2">
                                                <Button variant="outline" className="flex-1">Edit</Button>
                                                <Button className="flex-1">View Details</Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>

                                <div className="mt-6 p-4 border rounded-md">
                                    <h3 className="font-medium mb-4">Bundle Creation Tips</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Wine className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-medium">Complementary Products</span>
                                                <p className="text-muted-foreground">Bundle beer with snacks or spirits with mixers</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <UserPlus className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-medium">Target Occasions</span>
                                                <p className="text-muted-foreground">Create bundles for events, parties or office gatherings</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Percent className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-medium">Volume Based</span>
                                                <p className="text-muted-foreground">Offer greater discounts on larger bundles</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Retailers Tab */}
                    <TabsContent value="retailers" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>Retailer-Specific Promotions</CardTitle>
                                        <CardDescription>Create special offers for specific retailers</CardDescription>
                                    </div>
                                    <Button className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        <span>New Retailer Promotion</span>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Retailer</TableHead>
                                                <TableHead>Promotion</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {retailerPromotions.map((promo) => (
                                                <TableRow key={promo.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-primary/10">
                                                                    {promo.retailer.substring(0, 2)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{promo.retailer}</div>
                                                                <div className="text-xs text-muted-foreground">{promo.id}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{promo.name}</div>
                                                        <div className="text-xs text-muted-foreground">{promo.promotionId}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs">{formatDate(promo.startDate)}</span>
                                                            <span className="text-xs">to {formatDate(promo.endDate)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(promo.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm">
                                                            <Settings className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="mt-6">
                                    <h3 className="font-medium mb-4">Retailer Loyalty Tiers</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base">Silver</CardTitle>
                                                    <Badge variant="outline">Basic</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                                                    <li>3% discount on all orders</li>
                                                    <li>Free delivery on orders over KES 20,000</li>
                                                    <li>24-hour order fulfillment</li>
                                                </ul>
                                            </CardContent>
                                            <CardFooter>
                                                <div className="text-xs text-muted-foreground">For retailers with 5+ orders monthly</div>
                                            </CardFooter>
                                        </Card>

                                        <Card className="border-primary/50">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base">Gold</CardTitle>
                                                    <Badge>Popular</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                                                    <li>5% discount on all orders</li>
                                                    <li>Free delivery on orders over KES 15,000</li>
                                                    <li>Same-day order fulfillment</li>
                                                    <li>Exclusive product access</li>
                                                </ul>
                                            </CardContent>
                                            <CardFooter>
                                                <div className="text-xs text-muted-foreground">For retailers with 15+ orders monthly</div>
                                            </CardFooter>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base">Platinum</CardTitle>
                                                    <Badge variant="destructive">Premium</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                                                    <li>8% discount on all orders</li>
                                                    <li>Free delivery on all orders</li>
                                                    <li>Priority fulfillment</li>
                                                    <li>Dedicated account manager</li>
                                                    <li>Special event invitations</li>
                                                </ul>
                                            </CardContent>
                                            <CardFooter>
                                                <div className="text-xs text-muted-foreground">For retailers with 30+ orders monthly</div>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* QR Codes Tab */}
                    <TabsContent value="qrcodes" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>QR Code Promotions</CardTitle>
                                        <CardDescription>Create scannable promotions for in-store or event use</CardDescription>
                                    </div>
                                    <Button className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        <span>New QR Promotion</span>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {qrPromotions.map((qr) => (
                                        <Card key={qr.id}>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-base">{qr.name}</CardTitle>
                                                    {getStatusBadge(qr.status)}
                                                </div>
                                                <CardDescription>{qr.venue}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex justify-center py-4">
                                                QR CODE
                                                {/* <div className="border p-2 bg-white rounded-md">
                                                <QRCodeSVG
                                                    value={qr.url}
                                                    size={150}
                                                    level="M"
                                                    imageSettings={{
                                                        src: "https://placehold.co/80x80",
                                                        height: 24,
                                                        width: 24,
                                                        excavate: true,
                                                    }}
                                                />
                                            </div> */}
                                            </CardContent>
                                            <CardFooter className="flex flex-col items-stretch gap-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span>Event Date:</span>
                                                    <span className="font-medium">{qr.date}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span>Total Scans:</span>
                                                    <span className="font-medium">{qr.scans}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <Button variant="outline" size="sm">
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </Button>
                                                    <Button size="sm">
                                                        <Settings className="h-4 w-4 mr-2" />
                                                        Manage
                                                    </Button>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))}

                                    <Card className="border-dashed border-muted flex flex-col justify-center items-center p-6">
                                        <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground text-center mb-4">Create a new QR code for an event or in-store promotion</p>
                                        <Button>Create New QR Code</Button>
                                    </Card>
                                </div>

                                <div className="mt-6 p-4 border rounded-md">
                                    <h3 className="font-medium mb-4">QR Code Campaign Ideas</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-start gap-2">
                                            <ShoppingBag className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-medium">In-Store Scans</span>
                                                <p className="text-muted-foreground">Place QR codes at point of sale for instant discounts</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-medium">Event Promotion</span>
                                                <p className="text-muted-foreground">Special offers for sporting events, concerts, or festivals</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <RefreshCw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-medium">Loyalty Program</span>
                                                <p className="text-muted-foreground">QR codes that add points to customer loyalty accounts</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue from Promotions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">KES 2.4M</div>
                                    <Progress value={75} className="h-2 mt-2" />
                                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                        <span>0</span>
                                        <span>Goal: KES 3.2M</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Promotion Conversion Rate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">24.5%</div>
                                    <Progress value={65} className="h-2 mt-2" />
                                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                        <span>0%</span>
                                        <span>Goal: 35%</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">KES 18,500</div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Badge variant="outline" className="text-green-500">+12%</Badge>
                                        <span className="text-xs text-muted-foreground">vs last month</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Most Popular Promotion</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-base font-bold truncate">Tusker 20% Off</div>
                                    <div className="text-xs text-muted-foreground mt-1">432 redemptions</div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Badge variant="outline" className="text-amber-500">High performing</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Promotion Performance</CardTitle>
                                <CardDescription>Compare revenue and redemptions across promotions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px]">
                                    <ResponsiveContainer className='text-xs' width="100%" height="100%">
                                        <BarChart
                                            data={promotionPerformanceData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                            <RechartsTooltip />
                                            <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue (KES)" />
                                            <Bar yAxisId="right" dataKey="redemptions" fill="#82ca9d" name="Redemptions" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Promotion Insights</CardTitle>
                                    <CardDescription>Key metrics and observations</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-medium">Best Performing Category</span>
                                                <p className="text-sm text-muted-foreground">Beer promotions have 32% higher redemption rates than spirit promotions</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
                                            <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-medium">Best Time for Promotions</span>
                                                <p className="text-sm text-muted-foreground">Weekend promotions generate 45% more sales than weekday promotions</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
                                            <Users className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-medium">Customer Segment Analysis</span>
                                                <p className="text-sm text-muted-foreground">Bars and restaurants respond better to bundle promotions than retail stores</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Upcoming Scheduled Promotions</CardTitle>
                                    <CardDescription>View and manage future promotions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentPromotions
                                            .filter(p => p.status === "scheduled")
                                            .map((promo) => (
                                                <div key={promo.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                                                    <div>
                                                        <div className="font-medium">{promo.name}</div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Starts: {formatDate(promo.startDate)}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm">Edit</Button>
                                                        <Button size="sm">Activate Now</Button>
                                                    </div>
                                                </div>
                                            ))}

                                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                                            <div>
                                                <div className="font-medium">Easter Weekend Special</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Starts: Apr 10, 2025
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">Edit</Button>
                                                <Button size="sm">Activate Now</Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                                            <div>
                                                <div className="font-medium">Midweek Happy Hour</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Starts: Mar 18, 2025
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">Edit</Button>
                                                <Button size="sm">Activate Now</Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="w-full">
                                        <CalendarDays className="mr-2 h-4 w-4" />
                                        View Promotion Calendar
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </TabsContent>
                </TabsWithSearchParams>
            </Suspense>
        </div>
    )
}

// Helper icon component
function MoreHorizontalIcon(props: any) {
    return <MoreHorizontal {...props} />;
}