"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Search, ShoppingBag } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShopOrderCard } from "@/components/orders/shop-order-card"

// Mock order data
const mockOrders = [
    {
        id: "ORD-12345",
        store: "KFC",
        location: "RXHC+Q26, Varsityville Estate",
        date: "Today, 18:17",
        items: [
            {
                name: "Nyama Nyama Burger Meal",
                quantity: 1,
                price: 1100,
            },
        ],
        total: 1139,
        status: "delivering" as const,
        estimatedDelivery: "18:40 - 18:50",
    },
    {
        id: "ORD-12344",
        store: "Brew Bistro",
        location: "RXHC+Q26, Varsityville Estate",
        date: "Yesterday, 20:30",
        items: [
            {
                name: "Jameson Irish Whiskey",
                quantity: 1,
                price: 2500,
            },
            {
                name: "Johnnie Walker Black Label",
                quantity: 1,
                price: 3200,
            },
        ],
        total: 5950,
        status: "delivered" as const,
    },
    {
        id: "ORD-12343",
        store: "Wine & Spirits",
        location: "RXHC+Q26, Varsityville Estate",
        date: "May 2, 19:15",
        items: [
            {
                name: "Hennessy VS",
                quantity: 1,
                price: 3500,
            },
        ],
        total: 3750,
        status: "delivered" as const,
    },
]

export default function OrdersPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("current")
    const [searchQuery, setSearchQuery] = useState("")

    const currentOrders = mockOrders.filter((order) => order.status !== "delivered")
    const pastOrders = mockOrders.filter((order) => order.status === "delivered")

    const filteredCurrentOrders = currentOrders.filter(
        (order) =>
            order.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const filteredPastOrders = pastOrders.filter(
        (order) =>
            order.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white border-b">
                <div className="flex items-center p-4">
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-medium">My Orders</h1>
                </div>
            </header>

            <main className="flex-1">
                {/* Search Bar */}
                <div className="p-4 bg-white">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search orders..."
                            className="pl-9 bg-gray-100 border-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="bg-white border-b">
                        <TabsList className="w-full justify-start p-0 h-auto bg-transparent">
                            <TabsTrigger
                                value="current"
                                className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none"
                            >
                                Current
                            </TabsTrigger>
                            <TabsTrigger
                                value="past"
                                className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none"
                            >
                                Past
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="current" className="mt-0">
                        {filteredCurrentOrders.length > 0 ? (
                            <div className="divide-y">
                                {filteredCurrentOrders.map((order) => (
                                    <ShopOrderCard key={order.id} order={order} onClick={() => router.push(`/order/status/${order.id}`)} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Clock className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">No current orders</h3>
                                <p className="text-gray-500 mb-6">You don't have any active orders at the moment</p>
                                <Button onClick={() => router.push("/shop")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                    Browse Shops
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="past" className="mt-0">
                        {filteredPastOrders.length > 0 ? (
                            <div className="divide-y">
                                {filteredPastOrders.map((order) => (
                                    <ShopOrderCard key={order.id} order={order} onClick={() => router.push(`/order/status/${order.id}`)} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">No past orders</h3>
                                <p className="text-gray-500 mb-6">You haven't placed any orders yet</p>
                                <Button onClick={() => router.push("/shop")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                    Browse Shops
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
