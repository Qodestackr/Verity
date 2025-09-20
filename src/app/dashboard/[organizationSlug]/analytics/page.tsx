"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BarChart3, LineChart, PieChart, Download, Calendar, ArrowUpDown, Filter, RefreshCw, TrendingUp, TrendingDown, DollarSign, Package, Truck, Users, Clock, ArrowRight } from 'lucide-react'
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
        }
    },
}

export default function AnalyticsPage() {
    const [role, setRole] = useState<"retailer" | "wholesaler" | "distributor">("distributor")
    const [timeRange, setTimeRange] = useState("month")

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-light tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Track performance metrics and business insights</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="w-full sm:w-auto">
                    <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <TabsTrigger value="quarter">Quarter</TabsTrigger>
                        <TabsTrigger value="year">Year</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="icon">
                        <Calendar className="h-4 w-4" />
                        <span className="sr-only">Date Range</span>
                    </Button>
                    <Button variant="outline" size="icon">
                        <RefreshCw className="h-4 w-4" />
                        <span className="sr-only">Refresh</span>
                    </Button>
                    <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                    </Button>
                </div>
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={item}>
                    <Card className="p-1.5">
                        <CardContent className="p-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                                    <span className="text-2xl font-bold">KSh 2.4M</span>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                                    <TrendingUp className="mr-1 h-3 w-3" />
                                    +12.5%
                                </Badge>
                                <span className="text-xs text-muted-foreground">vs. last {timeRange}</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="p-1.5">
                        <CardContent className="p-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-muted-foreground">Total Orders</span>
                                    <span className="text-xl font-bold">248</span>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Package className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                                    <TrendingUp className="mr-1 h-3 w-3" />
                                    +8.2%
                                </Badge>
                                <span className="text-xs text-muted-foreground">vs. last {timeRange}</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="p-1.5">
                        <CardContent className="p-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-muted-foreground">Delivery Efficiency</span>
                                    <span className="text-2xl font-bold">94.8%</span>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Truck className="h-6 w-6 text-green-500" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                                    <TrendingUp className="mr-1 h-3 w-3" />
                                    +2.3%
                                </Badge>
                                <span className="text-xs text-muted-foreground">vs. last {timeRange}</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="p-1.5">
                        <CardContent className="p-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-muted-foreground">Active Wholesalers</span>
                                    <span className="text-xl font-bold">42</span>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-amber-500" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                                    <TrendingUp className="mr-1 h-3 w-3" />
                                    +4.1%
                                </Badge>
                                <span className="text-xs text-muted-foreground">vs. last {timeRange}</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <Card className="p-1.5">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Revenue Trends</CardTitle>
                            <CardDescription>Monthly revenue breakdown</CardDescription>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Filter className="h-4 w-4" />
                                    <span className="sr-only">Filter</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>View By</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>All Revenue</DropdownMenuItem>
                                <DropdownMenuItem>By Wholesaler</DropdownMenuItem>
                                <DropdownMenuItem>By Product Category</DropdownMenuItem>
                                <DropdownMenuItem>By Region</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent className="text-xs p-1.5">
                        <div className="h-[200px] bg-muted/30 rounded-md flex items-center justify-center">
                            <LineChart className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <span className="text-sm text-muted-foreground">This {timeRange}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                            <span className="text-sm text-muted-foreground">Last {timeRange}</span>
                        </div>
                    </CardFooter>
                </Card>

                <Card className="p-1.5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Order Distribution</CardTitle>
                            <CardDescription>Orders by wholesaler</CardDescription>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <ArrowUpDown className="h-4 w-4" />
                                    <span className="sr-only">Sort</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Highest Value</DropdownMenuItem>
                                <DropdownMenuItem>Lowest Value</DropdownMenuItem>
                                <DropdownMenuItem>Alphabetical</DropdownMenuItem>
                                <DropdownMenuItem>Most Orders</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent className="p-1.5">
                        <div className="h-[200px] bg-muted/30 rounded-md flex items-center justify-center">
                            <PieChart className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="w-full grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-xs text-muted-foreground">City Beverages (28%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-xs text-muted-foreground">Metro Wholesalers (24%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span className="text-xs text-muted-foreground">Urban Drinks Co. (22%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                <span className="text-xs text-muted-foreground">Others (26%)</span>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <Card className="p-1.5">
                    <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                        <CardDescription>Best selling products by volume</CardDescription>
                    </CardHeader>
                    <CardContent className="p-1.5">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                        <Package className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Premium Lager</div>
                                        <div className="text-xs text-muted-foreground">24 x 330ml bottles</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">1,240 units</div>
                                    <div className="text-xs text-green-500">+12%</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                        <Package className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Craft IPA</div>
                                        <div className="text-xs text-muted-foreground">12 x 330ml bottles</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">980 units</div>
                                    <div className="text-xs text-green-500">+8%</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                        <Package className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Stout</div>
                                        <div className="text-xs text-muted-foreground">6 x 440ml cans</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">745 units</div>
                                    <div className="text-xs text-green-500">+5%</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                        <Package className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Red Wine</div>
                                        <div className="text-xs text-muted-foreground">750ml bottle</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">620 units</div>
                                    <div className="text-xs text-red-500">-2%</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="ghost" size="sm" className="h-8 text-xs w-full">
                            View All Products
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="p-1.5">
                    <CardHeader>
                        <CardTitle>Delivery Performance</CardTitle>
                        <CardDescription>On-time delivery metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="p-1.5">
                        <div className="h-[200px] bg-muted/30 rounded-md flex items-center justify-center mb-6">
                            <BarChart3 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">On-Time</div>
                                <div className="text-xl font-bold text-green-500">94.8%</div>
                            </div>
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">Delayed</div>
                                <div className="text-xl font-bold text-amber-500">4.2%</div>
                            </div>
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">Avg. Delivery Time</div>
                                <div className="text-xl font-bold">18 min</div>
                            </div>
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">Satisfaction</div>
                                <div className="text-xl font-bold text-green-500">4.8/5</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="p-1.5">
                    <CardHeader>
                        <CardTitle>Inventory Turnover</CardTitle>
                        <CardDescription>Stock movement analysis</CardDescription>
                    </CardHeader>
                    <CardContent className="p-1.5">
                        <div className="h-[200px] bg-muted/30 rounded-md flex items-center justify-center mb-6">
                            <LineChart className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Beer</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">24 days</span>
                                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                                        Fast
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Wine</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">32 days</span>
                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                                        Normal
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Spirits</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">45 days</span>
                                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                                        Slow
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
