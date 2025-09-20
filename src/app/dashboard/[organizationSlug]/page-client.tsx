"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

import { useSettings } from "@/hooks/use-app-settings";

import {
    ShoppingCart,
    Package,
    Truck,
    TrendingUp,
    CheckCircle2,
    Store,
    Warehouse,
    Building2,
    BarChart3,
    Bell,
    Layers,
    DollarSign,
    Percent,
    Map,
    AlertCircle,
    User,
    Contact,
    BellElectric,
    Brain,
    Megaphone,
    Wine,
    Globe,
    LineChart,
    Users,
    ClipboardCheck,
    UserCheck,
    DollarSignIcon,
    MessageCircleHeartIcon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { client, useSession } from "@/lib/auth-client"
import { DistributorTour, RetailerTour, WholesalerTour } from "@/components/core/tour"
import { UserDashFeatureCards } from "@/components/common/user-tabs"
import { defaultOrgSettings } from "@/lib/app-settings/default";

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

const hoverEffect = {
    rest: { scale: 1 },
    hover: {
        scale: 1.03,
        transition: {
            duration: 0.2,
            type: "tween",
            ease: "easeOut",
        },
    },
}

export function FeatureCards({
    organizationSlug }: { organizationSlug: string }) {
    const { data: session } = useSession()
    const [userRole, setUserRole] = useState<"user" | "retailer" | "wholesaler" | "distributor" | "admin" | "driver">(
        "retailer",
    )

    const mergedSettings = useSettings()?.mergedSettings ?? defaultOrgSettings;
    // const { mergedSettings } = useSettings()!;
    const posMode = mergedSettings?.posMode;

    const { data: activeOrganization, isPending, isRefetching } = client.useActiveOrganization()

    useEffect(() => {
        if (session?.user?.role) {
            const role = session.user.role
            if (["user", "retailer", "wholesaler", "distributor"].includes(role)) {
                setUserRole(role as "retailer" | "wholesaler" | "distributor" | "user" | "driver")
            } else {
                // having default until we fix ability to move from "user" to "retailer"
                setUserRole("retailer")
            }
        }
    }, [session])

    if (!userRole) {
        return (
            <div className="flex items-center justify-center w-full h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Loading features...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            Current POS Mode: {posMode}
            <div className="my-2">
                {userRole === "retailer" && <RetailerTour />}
                {userRole === "distributor" && <DistributorTour />}
                {userRole === "wholesaler" && <WholesalerTour />}
            </div>

            <div className="flex flex-col w-full">
                {userRole === "retailer" && <RetailerFeatures organizationSlug={organizationSlug} />}
                {userRole === "wholesaler" && <WholesalerFeatures organizationSlug={organizationSlug} />}
                {userRole === "distributor" && <DistributorFeatures organizationSlug={organizationSlug} />}
                <div className="max-w-3xl mx-auto">
                    {userRole === "driver" && (
                        <>
                            <p className="text-muted-foreground">Manage your deliveries, route, and tasks — all in one place.</p>
                            <DriverFeatures organizationSlug={organizationSlug} />
                        </>
                    )}
                </div>

                {userRole === "user" && <UserFeatureCards />}
            </div>
        </div>
    )
}

export function FeatureCard({
    icon: Icon,
    title,
    description,
    fullDescription,
    iconColor = "text-primary",
    bgColor = "bg-primary/10",
    badge,
    path = "#",
}: {
    icon: any
    title: string
    description: string
    fullDescription?: string
    iconColor?: string
    bgColor?: string
    badge?: string
    path?: string
}) {
    return (
        <TooltipProvider>
            <motion.div variants={item} whileHover="hover" initial="rest" animate="rest">
                <motion.div variants={hoverEffect}>
                    <a href={path} className="block h-full">
                        <Card className="p-2 overflow-hidden h-full border hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer">
                            <CardContent className="p-2">
                                <div className="flex items-center gap-2">
                                    <div className={`${bgColor} p-2 rounded-md flex-shrink-0`}>
                                        <Icon className={`h-4 w-4 ${iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-1.5">
                                            <h3 className="font-normal text-sm truncate">{title}</h3>
                                            {badge && (
                                                <Badge
                                                    variant={
                                                        badge === "New"
                                                            ? "default"
                                                            : badge === "Pro"
                                                                ? "destructive"
                                                                : badge === "Popular"
                                                                    ? "secondary"
                                                                    : badge === "Beta"
                                                                        ? "outline"
                                                                        : "outline"
                                                    }
                                                    className="flex-shrink-0 text-xs font-light h-4 px-1"
                                                >
                                                    {badge}
                                                </Badge>
                                            )}
                                        </div>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" className="max-w-xs">
                                                <p>{fullDescription || description}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </a>
                </motion.div>
            </motion.div>
        </TooltipProvider>
    )
}

function RetailerFeatures({ organizationSlug }: { organizationSlug: string }) {
    return (
        <motion.div
            className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
            variants={container}
            initial="hidden"
            animate="show"
        >

            <FeatureCard
                icon={BellElectric}
                title="POS"
                description="Seamless sales management"
                fullDescription="Process transactions quickly, manage inventory in real-time, and access detailed sales reports all from one intuitive interface."
                iconColor="text-primary"
                bgColor="bg-green-600/10"
                badge="Popular"
                path={`/dashboard/${organizationSlug}/pos`}
            />

            <FeatureCard
                icon={LineChart}
                title="Sales"
                description="Track, Trend, Win"
                fullDescription="Monitor real-time sales metrics, track trends, and gain insights with detailed reports. Analyze conversion rates and popular products."
                iconColor="text-purple-600"
                bgColor="bg-violet-600/10"
                badge="Essential"
                path={`/dashboard/${organizationSlug}/sales`}
            />

            <FeatureCard
                icon={ShoppingCart}
                title="Place Orders"
                description="Order Smart, Sell Fast."
                fullDescription="Compare prices across wholesalers, view real-time inventory, and place orders with just a few clicks."
                iconColor="text-primary"
                bgColor="bg-primary/10"
                badge="Popular"
                path={`/dashboard/${organizationSlug}/place-orders`}
            />

            <FeatureCard
                icon={Warehouse}
                title="Manage Stock"
                description="Update Stock levels"
                fullDescription="Never run out of stock again: Set minimum levels and let Alcorabooks automatically place orders when inventory runs low."
                iconColor="text-green-500"
                bgColor="bg-green-500/10"
                path={`/dashboard/${organizationSlug}/inventory`}
            />

            <FeatureCard
                icon={MessageCircleHeartIcon}
                title="Shop & WhatsApp Wiz"
                description="Order. Chat. Profit."
                fullDescription="Turn your WhatsApp into a 24/7 liquor store. Auto-reply menus, M-Pesa confirmations, customer tracking – we tinker until your *orders flow like Nile Special*. Scale till your phone vibrates."
                iconColor="text-green-500"
                bgColor="bg-green-500/10"
                path={`/dashboard/${organizationSlug}/shop/whatsapp-shop`}
            />

            <FeatureCard
                icon={Brain}
                title="Marketing Plus"
                description="Stock. Sell. Repeat."
                fullDescription="AI-powered micro-tools to turn your *daily grind* into cashflow. SMS loyalty blasts, birthday shoutouts, surveys – tunatoa solutions kama spirits."
                iconColor="text-purple-500"
                bgColor="bg-purple-500/10"
                path={`/dashboard/${organizationSlug}/marketing`}
            />

            <FeatureCard
                icon={DollarSignIcon}
                title="Accounting"
                description="Budgets, Books, Expenses"
                fullDescription="Compare prices across wholesalers, view real-time inventory, and place orders with just a few clicks."
                iconColor="text-emerald-700"
                bgColor="bg-emerald-100"
                badge="Popular"
                path={`/dashboard/${organizationSlug}/accounting`}
            />

            <FeatureCard
                icon={Truck}
                title="Logistics Tools"
                description="Real-time delivery updates"
                fullDescription="Get SMS notifications and track your orders from processing to delivery with accurate ETAs."
                iconColor="text-blue-500"
                bgColor="bg-blue-500/10"
                path={`/dashboard/${organizationSlug}/logistics`}
            />

            <FeatureCard
                icon={BarChart3}
                title="Analytics"
                description="Insights won't lie"
                fullDescription="Track your sales performance, inventory turnover, and profitability with easy-to-understand reports."
                iconColor="text-amber-500"
                bgColor="bg-amber-500/10"
                path={`/dashboard/${organizationSlug}/analytics`}
            />

            <FeatureCard
                icon={Bell}
                title="Notifications"
                description="No Missed Wins"
                fullDescription="Stay informed with real-time notifications about price changes, stock availability, and order status."
                iconColor="text-purple-500"
                bgColor="bg-purple-500/10"
                path={`/dashboard/${organizationSlug}/notifications`}
            />

            <FeatureCard
                icon={User}
                title="Boss Profile"
                description="Manage Your Account"
                fullDescription="Manage Account. Create business units, and handle billing and extra features"
                iconColor="text-gray-500"
                bgColor="bg-slate-500/10"
                path={`/dashboard/${organizationSlug}/profile`}
            />
        </motion.div>
    )
}

function WholesalerFeatures({ organizationSlug }: { organizationSlug: string }) {
    return (
        <motion.div className="grid gap-3 grid-cols-2 sm:grid-cols-3" variants={container} initial="hidden" animate="show">
            <FeatureCard
                icon={Store}
                title="Retailer Portal"
                description="Manage all customers"
                fullDescription="A centralized hub to manage all your retailers, process orders efficiently, and track customer relationships."
                iconColor="text-primary"
                bgColor="bg-primary/10"
                badge="12"
                path={`/dashboard/${organizationSlug}/biz-partners`}
            />

            <FeatureCard
                icon={Building2}
                title="Distributor Orders"
                description="Efficient restocking"
                fullDescription="Place bulk orders with distributors while tracking prices, promotions, and order status in one place."
                iconColor="text-blue-500"
                bgColor="bg-blue-500/10"
                path={`/dashboard/${organizationSlug}/orders`}
            />

            <FeatureCard
                icon={Package}
                title="Inventory"
                description="Smart stock control"
                fullDescription="Track and manage inventory across locations with real-time updates, alerts, and forecasting tools."
                iconColor="text-green-500"
                bgColor="bg-green-500/10"
                path={`/dashboard/${organizationSlug}/inventory`}
            />

            <FeatureCard
                icon={Truck}
                title="Logistics Tools"
                description="Optimize deliveries"
                fullDescription="Plan efficient delivery routes, manage your fleet, and provide accurate ETAs to retailers."
                iconColor="text-purple-500"
                bgColor="bg-purple-500/10"
                badge="New"
                path={`/dashboard/${organizationSlug}/logistics`}
            />

            <FeatureCard
                icon={BarChart3}
                title="Sales Analytics"
                description="Insightful metrics"
                fullDescription="Comprehensive dashboards showing sales trends, product performance, and retailer buying patterns."
                iconColor="text-amber-500"
                bgColor="bg-amber-500/10"
                path={`/dashboard/${organizationSlug}/analytics`}
            />

            <FeatureCard
                icon={DollarSign}
                title="Dynamic Pricing"
                description="Optimize revenue"
                fullDescription="Set volume-based pricing, special customer rates, and temporary price adjustments to optimize your profit margins."
                iconColor="text-green-600"
                bgColor="bg-green-600/10"
                path={`/dashboard/${organizationSlug}/analytics`}
            />

            <FeatureCard
                icon={Megaphone}
                title="Campaigns"
                description="Targeted retailer outreach"
                fullDescription="Create and manage email, SMS, and notification campaigns to promote new products and special offers to your retailers."
                iconColor="text-orange-500"
                bgColor="bg-orange-500/10"
                badge="Beta"
                path={`/dashboard/${organizationSlug}/analytics`}
            />
            <FeatureCard
                icon={AlertCircle}
                title="Stock Alerts"
                description="Prevent stockouts"
                fullDescription="Receive automatic notifications when stock levels are low or demand spikes for certain products."
                iconColor="text-red-500"
                bgColor="bg-red-500/10"
                path={`/dashboard/${organizationSlug}/notifications`}
            />

            <FeatureCard
                icon={Percent}
                title="Promotions"
                description="Special offers"
                fullDescription="Create, manage and track the performance of promotions and special pricing for retailers."
                iconColor="text-pink-500"
                bgColor="bg-pink-500/10"
                path={`/dashboard/${organizationSlug}/promotions`}
            />

            <FeatureCard
                icon={Contact}
                title="Import Leads"
                description="Import & Invite Customers"
                fullDescription="Platform is Visibility Only"
                iconColor="text-teal-500"
                bgColor="bg-teal-500/10"
                badge="Beta"
                path={`/dashboard/${organizationSlug}/customer-import`}
            />
            <FeatureCard
                icon={User}
                title="Profile"
                description="Manage Account"
                fullDescription="Manage Account. Create business units, and handle billing and extra features"
                iconColor="text-gray-500"
                bgColor="bg-slate-500/10"
                path={`/dashboard/${organizationSlug}/profile`}
            />
        </motion.div>
    )
}

function DistributorFeatures({ organizationSlug }: { organizationSlug: string }) {
    return (
        <motion.div className="grid gap-2 grid-cols-2 md:grid-cols-4" variants={container} initial="hidden" animate="show">
            <FeatureCard
                icon={Warehouse}
                title="Manage Customers"
                description="Supply chain hub"
                fullDescription="Manage all your wholesaler relationships, track orders, and streamline the fulfillment process."
                iconColor="text-primary"
                bgColor="bg-primary/10"
                badge="12"
                path={`/dashboard/${organizationSlug}/biz-partners`}
            />

            <FeatureCard
                icon={Layers}
                title="Multi-Warehouse"
                description="Location control"
                fullDescription="Coordinate inventory across multiple warehouses with transfer tracking and optimization tools."
                iconColor="text-blue-500"
                bgColor="bg-blue-500/10"
                path={`/dashboard/${organizationSlug}`}
            />

            <FeatureCard
                icon={Package}
                title="Inventory"
                description="Enterprise stock"
                fullDescription="Track large-scale inventory with batch tracking, expiry management, and automated replenishment."
                iconColor="text-green-500"
                bgColor="bg-green-500/10"
                path={`/dashboard/${organizationSlug}/inventory`}
            />

            <FeatureCard
                icon={Wine}
                title="Brand Portal"
                description="Manage brand relationships"
                fullDescription="Coordinate with brand representatives, manage promotions, and track brand performance across your distribution network."
                iconColor="text-purple-600"
                bgColor="bg-purple-600/10"
                path={`/dashboard/${organizationSlug}`}
            />

            <FeatureCard
                icon={Truck}
                title="Fleet"
                description="Vehicle management"
                fullDescription="Track and optimize your delivery fleet with maintenance scheduling, driver assignments, and cost analysis."
                iconColor="text-purple-500"
                bgColor="bg-purple-500/10"
                path={`/dashboard/${organizationSlug}/fleet-management`}
            />

            <FeatureCard
                icon={Map}
                title="Routes"
                description="Delivery planning"
                fullDescription="Optimize delivery routes to reduce costs, save time, and improve efficiency across your distribution network."
                iconColor="text-amber-500"
                bgColor="bg-amber-500/10"
                badge="New"
                path={`/dashboard/${organizationSlug}/routes`}
            />

            <FeatureCard
                icon={DollarSign}
                title="Financials"
                description="Revenue tracking"
                fullDescription="Track revenue, profit margins, and financial performance across your entire distribution network."
                iconColor="text-indigo-500"
                bgColor="bg-indigo-500/10"
                path={`/dashboard/${organizationSlug}`}
            />

            <FeatureCard
                icon={TrendingUp}
                title="Market Insights"
                description="Demand forecasting"
                fullDescription="Predict market trends, analyze demand patterns, and make data-driven inventory decisions."
                iconColor="text-teal-500"
                bgColor="bg-teal-500/10"
                path={`/dashboard/${organizationSlug}/analytics`}
            />

            <FeatureCard
                icon={CheckCircle2}
                title="Quality Control"
                description="Product standards"
                fullDescription="Ensure consistent product quality with inspection tracking, compliance monitoring, and supplier management."
                iconColor="text-emerald-500"
                bgColor="bg-emerald-500/10"
                badge="Pro"
                path={`/dashboard/${organizationSlug}`} //quality-control
            />

            <FeatureCard
                icon={Globe}
                title="Territory Growth"
                description="Expand your footprint"
                fullDescription="Identify untapped markets, analyze potential growth areas, and develop strategies to expand your distribution network."
                iconColor="text-teal-600"
                bgColor="bg-teal-600/10"
                badge="Pro"
                path={`/dashboard/${organizationSlug}`} //quality-control
            />

            <FeatureCard
                icon={Contact}
                title="Import Leads"
                description="Import & Invite Customers"
                fullDescription="Platform is Visibility Only"
                iconColor="text-teal-500"
                bgColor="bg-teal-500/10"
                badge="Beta"
                path={`/dashboard/${organizationSlug}/customer-import`}
            />

            <FeatureCard
                icon={User}
                title="Profile"
                description="Manage Account"
                fullDescription="Manage Account. Create business units, and handle billing and extra features"
                iconColor="text-gray-500"
                bgColor="bg-slate-500/10"
                path={`/dashboard/${organizationSlug}/profile`}
            />
        </motion.div>
    )
}

function DriverFeatures({ organizationSlug }: { organizationSlug: string }) {
    return (
        <motion.div className="grid gap-2 grid-cols-2 md:grid-cols-3" variants={container} initial="hidden" animate="show">
            <FeatureCard
                icon={Package}
                title="My Deliveries"
                description="Live delivery summary"
                fullDescription="See total deliveries, completion status, and your next stop with real-time ETA."
                iconColor="text-primary"
                bgColor="bg-primary/10"
                badge="5 Left"
                path={`/dashboard/${organizationSlug}/driver/deliveries`}
            />

            <FeatureCard
                icon={Map}
                title="Your Route"
                description="Simplified route view"
                fullDescription="Visualize your current route, completion progress, and stop order with optimized path."
                iconColor="text-green-500"
                bgColor="bg-green-500/10"
                path={`/dashboard/${organizationSlug}/driver/route`}
            />

            {/* GPS POWERED CHECK-IN */}
            <FeatureCard
                icon={UserCheck}
                title="Check-In & Availability"
                description="Quick status toggle"
                fullDescription="Mark yourself as available, en route, or off duty. Track working hours and breaks."
                iconColor="text-blue-500"
                bgColor="bg-blue-500/10"
                path={`/dashboard/${organizationSlug}/driver/checkin`}
            />

            <FeatureCard
                icon={ClipboardCheck}
                title="Delivery Checklist"
                description="Past Proof & notes"
                fullDescription="Capture proof of delivery, add notes, flag issues, and complete checklist for each stop."
                iconColor="text-amber-600"
                bgColor="bg-amber-600/10"
                path={`/dashboard/${organizationSlug}/driver/checklist`}
            />

            <FeatureCard
                icon={Users}
                title="Assigned Orders"
                description="Who's handling what"
                fullDescription="See your assigned deliveries, grouped by customer, outlet, or urgency. Stay accountable."
                iconColor="text-purple-600"
                bgColor="bg-purple-600/10"
                path={`/dashboard/${organizationSlug}/driver/assigned-orders`}
            />
            <FeatureCard
                icon={User}
                title="Profile"
                description="Manage Account"
                fullDescription="Manage Account"
                iconColor="text-gray-500"
                bgColor="bg-slate-500/10"
                path={`/dashboard/${organizationSlug}/profile`}
            />
        </motion.div>
    )
}

function UserFeatureCards() {
    return (
        <div className="container mx-auto py-4 px-4">
            <div className="mb-2">
                <UserDashFeatureCards />
            </div>

            <div className="mt-3">
                <h2 className="text-xl font-semibold mb-3">Today's Specials</h2>
                <div className="rounded-lg overflow-hidden border">
                    <img src="/placeholder.svg?height=200&width=400" alt="Special offers" className="w-full h-40 object-cover" />
                    <div className="p-4">
                        <h3 className="font-medium">Weekend Football Special</h3>
                        <p className="text-sm text-muted-foreground">Buy 5 Tusker Lagers, get 1 free during any match</p>
                        <button className="mt-2 text-sm font-medium text-primary">View Details</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
