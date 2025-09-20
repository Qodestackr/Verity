"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts"
import { ShoppingBag, Users, DollarSign, Clock } from "lucide-react"

export default function WhatsAppShopAnalyticsPage() {
    // Sample data for charts
    const salesData = [
        { name: "Mon", sales: 4000 },
        { name: "Tue", sales: 3000 },
        { name: "Wed", sales: 5000 },
        { name: "Thu", sales: 2780 },
        { name: "Fri", sales: 7800 },
        { name: "Sat", sales: 9000 },
        { name: "Sun", sales: 6300 },
    ]

    const productData = [
        { name: "Beer", value: 45 },
        { name: "Spirits", value: 25 },
        { name: "Wine", value: 15 },
        { name: "Whisky", value: 15 },
    ]

    const COLORS = ["#047857", "#0e9f6e", "#34d399", "#6ee7b7"]

    return (
        <div>
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">WhatsApp Shop Analytics</h1>
                        <p className="text-muted-foreground">Track performance and insights from your WhatsApp shop</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">127</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-emerald-600">+12%</span> from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES 156,290</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-emerald-600">+18%</span> from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Customers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">84</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-emerald-600">+5%</span> from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">8 min</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-emerald-600">-2 min</span> from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="sales" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="sales">Sales</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="customers">Customers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="sales" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Weekly Sales</CardTitle>
                                <CardDescription>Sales through WhatsApp shop for the past week</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={salesData}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="sales" fill="#047857" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="products" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Categories</CardTitle>
                                <CardDescription>Sales distribution by product category</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={productData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {productData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Legend />
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Top Selling Products</CardTitle>
                                <CardDescription>Most popular products in your WhatsApp shop</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium">Tusker Lager</div>
                                            <div className="text-xs text-muted-foreground">Beer • KES 180</div>
                                        </div>
                                        <div className="text-sm font-medium">243 units</div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium">Johnnie Walker Black</div>
                                            <div className="text-xs text-muted-foreground">Whisky • KES 3,500</div>
                                        </div>
                                        <div className="text-sm font-medium">128 units</div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium">Gilbeys Gin</div>
                                            <div className="text-xs text-muted-foreground">Spirits • KES 1,200</div>
                                        </div>
                                        <div className="text-sm font-medium">96 units</div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium">Four Cousins Wine</div>
                                            <div className="text-xs text-muted-foreground">Wine • KES 950</div>
                                        </div>
                                        <div className="text-sm font-medium">72 units</div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium">Heineken</div>
                                            <div className="text-xs text-muted-foreground">Beer • KES 200</div>
                                        </div>
                                        <div className="text-sm font-medium">65 units</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="customers" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Insights</CardTitle>
                                <CardDescription>Data about your WhatsApp shop customers</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">New vs Returning Customers</h4>
                                        <div className="flex items-center gap-4">
                                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                                <div className="bg-emerald-700 h-2.5 rounded-full" style={{ width: "65%" }}></div>
                                            </div>
                                            <div className="text-sm whitespace-nowrap">65% New</div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                                <div className="bg-emerald-400 h-2.5 rounded-full" style={{ width: "35%" }}></div>
                                            </div>
                                            <div className="text-sm whitespace-nowrap">35% Returning</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Order Frequency</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground">Weekly</div>
                                                <div className="text-sm font-medium">28%</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground">Bi-weekly</div>
                                                <div className="text-sm font-medium">42%</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground">Monthly</div>
                                                <div className="text-sm font-medium">22%</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground">Occasional</div>
                                                <div className="text-sm font-medium">8%</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Top Customer Locations</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm">Kamakis</div>
                                                <div className="text-sm font-medium">32%</div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm">Ruiru</div>
                                                <div className="text-sm font-medium">24%</div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm">Kahawa Sukari</div>
                                                <div className="text-sm font-medium">18%</div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm">Thome</div>
                                                <div className="text-sm font-medium">14%</div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm">Other</div>
                                                <div className="text-sm font-medium">12%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
