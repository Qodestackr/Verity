"use client"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { TourOverlay } from "./tour-overlay"
import { TourButton } from "./tour-button"
import type { TourStep } from "./types"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

const RetailerOrderDemo = () => (
    <div className="space-y-2">
        <div className="grid grid-cols-2 gap-1">
            <div className="flex flex-col items-center justify-center rounded-md border p-1">
                <div className="text-lg font-bold text-blue-500">12</div>
                <div className="text-xs text-center">New</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-md border p-1">
                <div className="text-lg font-bold text-amber-500">8</div>
                <div className="text-xs text-center">Processing</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-md border p-1">
                <div className="text-lg font-bold text-green-500">15</div>
                <div className="text-xs text-center">Shipped</div>
            </div>
        </div>
    </div>
)

const InventoryDemo = () => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Products</span>
            <span className="font-bold">248</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border p-1">
                <div className="text-lg font-bold text-amber-500">18</div>
                <div className="text-xs text-muted-foreground">Low Stock</div>
            </div>
            <div className="rounded-md border p-1">
                <div className="text-lg font-bold text-red-500">3</div>
                <div className="text-xs text-muted-foreground">Out of Stock</div>
            </div>
        </div>
    </div>
)

const LogisticsDemo = () => (
    <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center justify-center rounded-md border p-1">
                <div className="text-lg font-bold text-blue-500">12</div>
                <div className="text-xs text-center">Pending</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-md border p-1">
                <div className="text-lg font-bold text-amber-500">8</div>
                <div className="text-xs text-center">In Transit</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-md border p-1">
                <div className="text-lg font-bold text-green-500">15</div>
                <div className="text-xs text-center">Delivered</div>
            </div>
        </div>
    </div>
)

const CustomerDemo = () => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <span className="text-sm">Active Accounts</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
                98
            </Badge>
        </div>
        <div className="flex items-center justify-between">
            <span className="text-sm">New This Month</span>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                12
            </Badge>
        </div>
        <div className="flex items-center justify-between">
            <span className="text-sm">Pending Approval</span>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                5
            </Badge>
        </div>
    </div>
)

const wholesalerTourSteps: TourStep[] = [
    {
        title: "Welcome to Alcorabooks for Wholesalers",
        description:
            "This tour will guide you through the key features of Alcorabooks for wholesalers. Discover how our platform can streamline your distribution operations and grow your business.",
        image: "/logo.png",
        emoji: "🏭",
    },
    {
        title: "Retailer Order Management",
        description: "Efficiently manage retailer orders with automated workflows and batch processing capabilities.",
        image: "/retailer-order-management.webp",
        component: <RetailerOrderDemo />,
        emoji: "🏪",
    },
    {
        title: "Distributor Ordering",
        description: "Place orders to multiple distributors with smart inventory forecasting and order optimization.",
        image: "/distribution-warehouse.webp",
        component: (
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Low stock items</span>
                    <Badge variant="destructive">18 items</Badge>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                        <span>Premium Lager (24 pack)</span>
                        <span className="font-medium text-destructive">5 left</span>
                    </div>
                    <Progress value={10} className="h-1.5" />
                </div>
            </div>
        ),
        emoji: "🏢",
    },
    {
        title: "Inventory Management",
        description: "Track inventory across multiple locations with barcode scanning and automated stock alerts.",
        image: "/inventory-management.webp",
        component: <InventoryDemo />,
        emoji: "📦",
    },
    {
        title: "Logistics & Delivery",
        description: "Optimize delivery routes, manage your fleet, and provide real-time tracking to your customers.",
        image: "/real-time-logistics.webp",
        component: <LogisticsDemo />,
        emoji: "🚚",
    },
    {
        title: "Customer Management",
        description:
            "Build stronger relationships with your retailers through customer profiles, order history, and communication tools.",
        image: "/retailer-order-management.webp",
        component: <CustomerDemo />,
        emoji: "👥",
    },
]

export function WholesalerTour() {

    const pathname = usePathname()
    const [showTour, setShowTour] = useState(false)
    const organizationSlug = useOrganizationSlug()

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("hasSeenWholesalerTour")
        if (pathname === `/dashboard/${organizationSlug}/wholesaler` && !hasSeenTour) {
            setShowTour(true)
            localStorage.setItem("hasSeenWholesalerTour", "true")
        }
    }, [pathname])

    return (
        <>
            <TourButton onClick={() => setShowTour(true)}>Wholesaler Features Tour</TourButton>

            {showTour && <TourOverlay steps={wholesalerTourSteps} onClose={() => setShowTour(false)} role="wholesaler" />}
        </>
    )
}