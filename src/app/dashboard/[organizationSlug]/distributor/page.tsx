"use client"

import { useState } from "react"
import Link from "next/link"
import {
    Warehouse,
    Truck,
    CheckCircle2,
    BarChart3,
    Bell,
    ArrowRight,
    AlertCircle,
    FileText,
    MapPin,
} from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
        },
    },
}

export default function DistributorDashboard() {
    const [role, setRole] = useState<"retailer" | "wholesaler" | "distributor">("distributor")

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Distributor Dashboard</h1>
                <p className="text-muted-foreground">Manage your distribution operations efficiently</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">Overview</CardTitle>
                        <CardDescription>Today's summary</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-primary">12</span>
                                <span className="text-sm text-muted-foreground">New Orders</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-amber-500">8</span>
                                <span className="text-sm text-muted-foreground">Processing</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-green-500">15</span>
                                <span className="text-sm text-muted-foreground">Shipped</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-blue-500">5</span>
                                <span className="text-sm text-muted-foreground">Deliveries</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">Inventory Status</CardTitle>
                        <CardDescription>Warehouse levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Premium Lager</span>
                                    <span className="text-xs text-muted-foreground">78% full</span>
                                </div>
                                <Progress value={78} className="h-2" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Craft IPA</span>
                                    <span className="text-xs text-muted-foreground">45% full</span>
                                </div>
                                <Progress value={45} className="h-2" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Stout</span>
                                    <span className="text-xs text-amber-500 font-medium">32% full</span>
                                </div>
                                <Progress value={32} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                            <Link href="/inventory">
                                View Inventory
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">Fleet Status</CardTitle>
                        <CardDescription>Vehicle availability</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                                        Available
                                    </Badge>
                                    <span className="text-sm font-medium">12 vehicles</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                                        On Delivery
                                    </Badge>
                                    <span className="text-sm font-medium">8 vehicles</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                                        Maintenance
                                    </Badge>
                                    <span className="text-sm font-medium">2 vehicles</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                            <Link href="/fleet-management">
                                Manage Fleet
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Warehouse className="h-5 w-5" />
                            Recent Wholesaler Orders
                        </CardTitle>
                        <CardDescription>Latest orders from wholesalers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                    <div className="font-medium">Order #5678</div>
                                    <div className="text-xs text-muted-foreground">City Beverages Ltd.</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge>New</Badge>
                                    <Button size="sm">Process</Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                    <div className="font-medium">Order #5677</div>
                                    <div className="text-xs text-muted-foreground">Metro Wholesalers</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                                        Processing
                                    </Badge>
                                    <Button size="sm">Ship</Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                    <div className="font-medium">Order #5676</div>
                                    <div className="text-xs text-muted-foreground">Urban Drinks Co.</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                                        Shipped
                                    </Badge>
                                    <Button size="sm" variant="outline">
                                        Track
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" asChild>
                            <Link href="/wholesaler-orders">View All Wholesaler Orders</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Today's Deliveries
                        </CardTitle>
                        <CardDescription>Scheduled deliveries for today</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">City Beverages Ltd.</div>
                                        <div className="text-xs text-muted-foreground">Nairobi CBD, 10:30 AM</div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                                    On Time
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Metro Wholesalers</div>
                                        <div className="text-xs text-muted-foreground">Westlands, 1:15 PM</div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                                    Delayed
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Urban Drinks Co.</div>
                                        <div className="text-xs text-muted-foreground">Kilimani, 3:45 PM</div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                                    Scheduled
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" asChild>
                            <Link href="/shipments">View All Shipments</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Sales Performance
                        </CardTitle>
                        <CardDescription>Monthly sales overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] bg-muted/30 rounded-md flex items-center justify-center">
                            <span className="text-muted-foreground">Sales Chart Visualization</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/analytics">View Detailed Analytics</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Recent Notifications
                        </CardTitle>
                        <CardDescription>Latest updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-3 items-start">
                                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Low stock alert: Premium Lager</p>
                                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>

                            <div className="flex gap-3 items-start">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Order #5675 has been delivered</p>
                                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                                </div>
                            </div>

                            <div className="flex gap-3 items-start">
                                <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Monthly inventory report ready</p>
                                    <p className="text-xs text-muted-foreground">Yesterday</p>
                                </div>
                            </div>

                            <div className="flex gap-3 items-start">
                                <Truck className="h-5 w-5 text-red-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Vehicle KBZ 123X needs maintenance</p>
                                    <p className="text-xs text-muted-foreground">Yesterday</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">
                            View All Notifications
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}