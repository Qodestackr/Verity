"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { TourOverlay } from "./tour-overlay"
import { TourButton } from "./tour-button"
import type { TourStep } from "./types"
import { Badge } from "@/components/ui/badge"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

const WholesalerOrderDemo = () => (
    <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1 justify-center rounded-md border p-2">
                <div className="text-lg font-semibold text-blue-500">12</div>
                <div className="text-xs text-center">New</div>
            </div>
            <div className="flex items-center gap-1 justify-center rounded-md border p-2">
                <div className="text-lg font-semibold text-amber-500">8</div>
                <div className="text-xs text-center">Processing</div>
            </div>
            <div className="flex items-center gap-1 justify-center rounded-md border p-2">
                <div className="text-lg font-semibold text-green-500">15</div>
                <div className="text-xs text-center">Shipped</div>
            </div>
        </div>

        <div className="rounded-md border p-2">
            <div className="flex items-center gap-1 justify-between">
                <div>
                    <div className="font-medium">Order #5678</div>
                    <div className="text-xs text-muted-foreground">City Beverages Ltd.</div>
                </div>
                <Badge>New</Badge>
            </div>
        </div>
    </div>
)

// Multi-Warehouse Demo
const WarehouseDemo = () => (
    <div className="space-y-2">
        <div className="flex items-center gap-1 justify-between">
            <span className="text-sm">Central Warehouse</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
                92% Full
            </Badge>
        </div>
        <div className="flex items-center gap-1 justify-between">
            <span className="text-sm">North Warehouse</span>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                78% Full
            </Badge>
        </div>
        <div className="flex items-center gap-1 justify-between">
            <span className="text-sm">South Warehouse</span>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                65% Full
            </Badge>
        </div>
    </div>
)

const FleetDemo = () => (
    <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center justify-center rounded-md border p-2">
                <div className="text-lg font-semibold text-blue-500">24</div>
                <div className="text-xs text-center">Vehicles</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-md border p-2">
                <div className="text-lg font-semibold text-amber-500">18</div>
                <div className="text-xs text-center">Active</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-md border p-2">
                <div className="text-lg font-semibold text-green-500">6</div>
                <div className="text-xs text-center">Idle</div>
            </div>
        </div>
    </div>
)

const RouteDemo = () => (
    <div className="space-y-2">
        <div className="flex items-center gap-1 justify-between">
            <span className="text-sm">Today's Deliveries</span>
            <Badge variant="outline">48 stops</Badge>
        </div>
        <div className="flex items-center gap-1 justify-between">
            <span className="text-sm">Average Delivery Time</span>
            <span className="text-sm font-medium">18 min</span>
        </div>
        <div className="flex items-center gap-1 justify-between">
            <span className="text-sm">Fuel Savings</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
                12%
            </Badge>
        </div>
    </div>
)

const FinancialDemo = () => (
    <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border p-2">
            <div className="text-sm font-normal text-green-500">+8%</div>
            <div className="text-xs text-muted-foreground">Monthly Growth</div>
        </div>
        <div className="rounded-md border p-2">
            <div className="text-sm font-normal text-primary">$248K</div>
            <div className="text-xs text-muted-foreground">Monthly Revenue</div>
        </div>
    </div>
)

const distributorTourSteps: TourStep[] = [
    {
        title: "Welcome to Alcora for Distributors",
        description:
            "This tour will guide you through the key features of Alcora for distributors. Discover how our platform can optimize your distribution network and maximize efficiency.",
        image: "/logo.png",
        emoji: "🏭",
    },
    {
        title: "Wholesaler Order Management",
        description:
            "Streamline order fulfillment for wholesalers with automated processing, batch management, and priority handling.",
        image: "/retailer-order-management.webp",
        component: <WholesalerOrderDemo />,
        emoji: "🏪",
    },
    {
        title: "Multi-Warehouse Management",
        description:
            "Coordinate operations across multiple warehouses with centralized inventory visibility and automated stock transfers.",
        image: "/retailer-order-management.webp",
        component: <WarehouseDemo />,
        emoji: "🏢",
    },
    {
        title: "Inventory Management",
        description:
            "Track stock across all warehouses with real-time updates, automated alerts, and predictive analytics.",
        image: "/retailer-order-management.webp",
        component: (
            <div className="space-y-3">
                <div className="flex items-center gap-1 justify-between">
                    <span className="text-sm font-medium">Total Products</span>
                    <span className="font-semibold">1,248</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md border p-2">
                        <div className="text-lg font-semibold text-amber-500">15</div>
                        <div className="text-xs text-muted-foreground">Low Stock</div>
                    </div>
                    <div className="rounded-md border p-2">
                        <div className="text-lg font-semibold text-red-500">3</div>
                        <div className="text-xs text-muted-foreground">Out of Stock</div>
                    </div>
                </div>
            </div>
        ),
        emoji: "📦",
    },
    {
        title: "Fleet Management",
        description:
            "Optimize your delivery fleet with real-time tracking, maintenance scheduling, and driver performance analytics.",
        image: "/retailer-order-management.webp",
        component: <FleetDemo />,
        emoji: "🚚",
    },
    {
        title: "Route Optimization",
        description:
            "Plan efficient delivery routes to minimize fuel costs, reduce delivery times, and maximize driver productivity.",
        image: "/retailer-order-management.webp",
        component: <RouteDemo />,
        emoji: "🗺️",
    },
    {
        title: "Financial Analytics",
        description:
            "Track revenue, profitability, and growth metrics across your entire distribution network with customizable reports.",
        image: "/retailer-order-management.webp",
        component: <FinancialDemo />,
        emoji: "📊",
    },
]

export function DistributorTour() {

    const pathname = usePathname()
    const [showTour, setShowTour] = useState(false)
    const organizationSlug = useOrganizationSlug()


    useEffect(() => {
        const hasSeenTour = localStorage.getItem("hasSeenDistributorTour")
        if (pathname === `/dashboard/${organizationSlug}/distributor` && !hasSeenTour) {
            setShowTour(true)
            localStorage.setItem("hasSeenDistributorTour", "true")
        }
    }, [pathname])

    return (
        <>
            <TourButton onClick={() => setShowTour(true)}>Distributor Features Tour</TourButton>

            {showTour && <TourOverlay steps={distributorTourSteps} onClose={() => setShowTour(false)} role="distributor" />}
        </>
    )
}