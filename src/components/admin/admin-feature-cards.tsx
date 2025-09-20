"use client"

import { motion } from "framer-motion"
import {
    Users,
    ShieldCheck,
    BarChart4,
    Settings,
    Package,
    AlertTriangle,
    FileText,
    Bell,
    Building,
    Wallet,
    UserCheck,
    MessageSquare,
} from "lucide-react"

import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

export default function AdminFeatureCards() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col w-full">
                <div className="flex flex-col gap-2 mb-2">
                    Manage your platform, users, and business operations from one central location
                </div>

                <motion.div
                    className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    <FeatureCard
                        icon={UserCheck}
                        title="User Approvals"
                        description="Review and approve new users"
                        fullDescription="Review retailer applications, verify business credentials, and approve or reject new user registrations."
                        iconColor="text-green-600"
                        bgColor="bg-green-600/10"
                        badge="12"
                        path="/dashboard/admin/users/approval"
                    />

                    <FeatureCard
                        icon={Users}
                        title="User Management"
                        description="Manage all platform users"
                        fullDescription="View, edit, and manage all users across different roles. Update permissions, reset passwords, and handle account issues."
                        iconColor="text-blue-500"
                        bgColor="bg-blue-500/10"
                        path="/dashboard/admin/users"
                    />

                    <FeatureCard
                        icon={ShieldCheck}
                        title="Role Management"
                        description="Configure user permissions"
                        fullDescription="Define and assign roles with specific permissions to control access to platform features and data."
                        iconColor="text-purple-500"
                        bgColor="bg-purple-500/10"
                        path="/dashboard/admin/roles"
                    />

                    <FeatureCard
                        icon={BarChart4}
                        title="Analytics Dashboard"
                        description="Platform performance metrics"
                        fullDescription="View comprehensive analytics on sales, user activity, inventory movement, and other key performance indicators."
                        iconColor="text-amber-500"
                        bgColor="bg-amber-500/10"
                        badge="New"
                        path="/dashboard/admin/analytics"
                    />

                    <FeatureCard
                        icon={Package}
                        title="Product Management"
                        description="Manage product catalog"
                        fullDescription="Add, edit, and organize products in the catalog. Set pricing tiers, manage categories, and control product visibility."
                        iconColor="text-indigo-500"
                        bgColor="bg-indigo-500/10"
                        path="/dashboard/admin/product-management"
                    />

                    <FeatureCard
                        icon={AlertTriangle}
                        title="Compliance Monitoring"
                        description="Regulatory adherence"
                        fullDescription="Monitor and enforce compliance with liquor distribution regulations, age verification, and licensing requirements."
                        iconColor="text-red-500"
                        bgColor="bg-red-500/10"
                        badge="Critical"
                        path="/dashboard/admin/compliance"
                    />

                    <FeatureCard
                        icon={FileText}
                        title="Reports"
                        description="Generate business reports"
                        fullDescription="Create and export detailed reports on sales, inventory, user activity, and financial performance."
                        iconColor="text-teal-500"
                        bgColor="bg-teal-500/10"
                        path="/dashboard/admin/reports"
                    />

                    <FeatureCard
                        icon={Bell}
                        title="Notifications"
                        description="System-wide alerts"
                        fullDescription="Configure and send notifications to users. Manage alert preferences and communication templates."
                        iconColor="text-orange-500"
                        bgColor="bg-orange-500/10"
                        path="/dashboard/admin/notifications"
                    />

                    {/* TODO: ONLY BRAND OWNER */}
                    {/* <FeatureCard
                        icon={Truck}
                        title="Logistics Overview"
                        description="Monitor delivery operations"
                        fullDescription="Track delivery performance, resolve logistics issues, and optimize distribution operations across the network."
                        iconColor="text-emerald-500"
                        bgColor="bg-emerald-500/10"
                        path="/dashboard/admin/logistics"
                    /> */}

                    <FeatureCard
                        icon={Building}
                        title="Business Verification"
                        description="Validate business credentials"
                        fullDescription="Review and verify business licenses, tax documents, and other credentials required for platform participation."
                        iconColor="text-violet-500"
                        bgColor="bg-violet-500/10"
                        path="/dashboard/admin/verification"
                    />

                    <FeatureCard
                        icon={Wallet}
                        title="Billing & Payments"
                        description="Manage financial operations"
                        fullDescription="Monitor transactions, handle payment disputes, and manage subscription billing for premium features."
                        iconColor="text-cyan-500"
                        bgColor="bg-cyan-500/10"
                        path="/dashboard/admin/billing"
                    />

                    {/* <FeatureCard
                        icon={Percent}
                        title="Promotions & Discounts"
                        description="Create special offers"
                        fullDescription="Create and manage platform-wide promotions, discount codes, and special pricing events."
                        iconColor="text-pink-500"
                        bgColor="bg-pink-500/10"
                        path="/dashboard/admin/promotions"
                    /> */}

                    {/* <FeatureCard
                        icon={Boxes}
                        title="Inventory Oversight"
                        description="Stock level monitoring"
                        fullDescription="Monitor inventory levels across the distribution network, identify potential stockouts, and optimize inventory allocation."
                        iconColor="text-yellow-500"
                        bgColor="bg-yellow-500/10"
                        path="/dashboard/admin/inventory"
                    /> */}

                    {/* <FeatureCard
                        icon={Map}
                        title="Territory Management"
                        description="Geographic distribution"
                        fullDescription="Define and manage distribution territories, assign retailers to wholesalers, and optimize regional coverage."
                        iconColor="text-lime-500"
                        bgColor="bg-lime-500/10"
                        badge="Beta"
                        path="/dashboard/admin/territories"
                    /> */}

                    <FeatureCard
                        icon={MessageSquare}
                        title="Support Tickets"
                        description="Handle user inquiries"
                        fullDescription="Manage support requests from users, track issue resolution, and maintain communication with platform users."
                        iconColor="text-sky-500"
                        bgColor="bg-sky-500/10"
                        path="/dashboard/admin/support"
                    />

                    <FeatureCard
                        icon={Settings}
                        title="Platform Settings"
                        description="Configure system parameters"
                        fullDescription="Manage global platform settings, feature toggles, API configurations, and integration parameters."
                        iconColor="text-gray-500"
                        bgColor="bg-slate-500/10"
                        path="/dashboard/admin/settings"
                    />
                </motion.div>
            </div>
        </div>
    )
}

function FeatureCard({
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
                        <Card className="overflow-hidden h-full border hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer">
                            <CardContent className="p-2">
                                <div className="flex items-center gap-2">
                                    <div className={`${bgColor} p-2 rounded-md flex-shrink-0`}>
                                        <Icon className={`h-4 w-4 ${iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-1.5">
                                            <h3 className="font-medium text-sm truncate">{title}</h3>
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
                                                                        : badge === "Critical"
                                                                            ? "destructive"
                                                                            : "outline"
                                                    }
                                                    className="flex-shrink-0 text-xs h-5 px-1.5"
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