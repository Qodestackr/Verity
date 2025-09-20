"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { TourOverlay } from "./tour-overlay"
import { TourButton } from "./tour-button"
import type { TourStep } from "./types"
import { ShoppingCart, Package, Truck, Bell, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

const NotificationsDemo = () => (
    <div className="space-y-3">
        <div className="flex gap-3 items-start">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
                <p className="text-sm font-medium">Order confirmations</p>
                <p className="text-xs text-muted-foreground">Get notified when your order is confirmed</p>
            </div>
        </div>

        <div className="flex gap-3 items-start">
            <Truck className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
                <p className="text-sm font-medium">Shipping updates</p>
                <p className="text-xs text-muted-foreground">Track your order every step of the way</p>
            </div>
        </div>

        <div className="flex gap-3 items-start">
            <Bell className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
                <p className="text-sm font-medium">Price alerts</p>
                <p className="text-xs text-muted-foreground">Be notified of price changes and promotions</p>
            </div>
        </div>
    </div>
)

const OrderTrackingDemo = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Order #1234</span>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                    Processing
                </Badge>
            </div>
            <Progress value={30} className="h-2" />
        </div>

        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Order #1233</span>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                    In Transit
                </Badge>
            </div>
            <Progress value={65} className="h-2" />
        </div>
    </div>
)

const AutoReorderingDemo = () => (
    <div className="space-y-3">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Premium Lager</span>
            <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Reorder at:</span>
                <Badge variant="outline">10 units</Badge>
            </div>
        </div>

        <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Craft IPA</span>
            <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Reorder at:</span>
                <Badge variant="outline">5 units</Badge>
            </div>
        </div>
    </div>
)

const MobileAccessDemo = () => (
    <div className="text-sm">
        <ul className="space-y-2">
            <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Place orders from anywhere</span>
            </li>
            <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Scan barcodes to reorder</span>
            </li>
            <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Push notifications</span>
            </li>
            <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Offline mode for remote areas</span>
            </li>
        </ul>
    </div>
)

const retailerTourSteps: TourStep[] = [
    {
        title: "Welcome to Alcorabooks",
        description:
            "This tour will guide you through the key features of Alcorabooks for retailers. Discover how our platform can streamline your alcohol ordering and inventory management.",
        image: "/logo.png",
        emoji: "🍻",
    },
    {
        title: "Smart Ordering",
        description:
            "Order from multiple wholesalers in one place. Compare prices, check availability, and place orders with just a few clicks.",
        image: "/retailer-order-management.webp",
        component: (
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-3">
                    <Package className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-center font-medium">10+ Wholesalers</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-3">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-center font-medium">1000+ Products</span>
                </div>
            </div>
        ),
        emoji: "🛒",
    },
    {
        title: "Order Tracking",
        description:
            "Get real-time updates on your deliveries. Track your orders from processing to delivery with accurate ETAs and SMS notifications.",
        image: "/retailer-order-management.webp",
        component: <OrderTrackingDemo />,
        emoji: "🚚",
    },
    {
        title: "Automated Reordering",
        description:
            "Never run out of stock again. Set minimum stock levels and let Alcorabooks automatically place orders when inventory runs low.",
        image: "/retailer-order-management.webp",
        component: <AutoReorderingDemo />,
        emoji: "🔄",
    },
    {
        title: "Smart Notifications",
        description:
            "Stay informed with timely alerts. Get notified about order confirmations, shipping updates, price changes, and more.",
        image: "/retailer-order-management.webp",
        component: <NotificationsDemo />,
        emoji: "🔔",
    },
    {
        title: "Mobile Access",
        description:
            "Manage your business on the go. Place orders, track deliveries, and receive notifications from anywhere using our mobile app.",
        image: "/retailer-order-management.webp",
        component: <MobileAccessDemo />,
        emoji: "📱",
    },
]

export function RetailerTour() {

    const pathname = usePathname()
    const [showTour, setShowTour] = useState(false)
    const organizationSlug = useOrganizationSlug()


    useEffect(() => {
        const hasSeenTour = localStorage.getItem("hasSeenRetailerTour")
        if (pathname === `/dashboard/${organizationSlug}/retailer` && !hasSeenTour) {
            setShowTour(true)
            localStorage.setItem("hasSeenRetailerTour", "true")
        }
    }, [pathname])

    return (
        <div>
            <TourButton onClick={() => setShowTour(true)}>Retailer Features Tour</TourButton>

            {showTour && <TourOverlay steps={retailerTourSteps} onClose={() => setShowTour(false)} role="retailer" />}
        </div>
    )
}
