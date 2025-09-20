"use client";
import { motion } from "framer-motion";

import {
    ShoppingCart,
    Warehouse,
    BellElectric,
    Brain,
    LineChart,
    DollarSignIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

export default function BrandOwnerDashboardPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <BrandOwnerFeatures />
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
                                                        badge === "New" ? "default" :
                                                            badge === "Pro" ? "destructive" :
                                                                badge === "Popular" ? "secondary" :
                                                                    badge === "Beta" ? "outline" : "outline"
                                                    }
                                                    className="flex-shrink-0 text-xs font-light h-4 px-1"
                                                >
                                                    {badge}
                                                </Badge>
                                            )}
                                        </div>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                    {description}
                                                </p>
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

function BrandOwnerFeatures() {
    return (
        <motion.div
            className="grid gap-2 grid-cols-2 sm:grid-cols-3"
            variants={container}
            initial="hidden"
            animate="show">
            <FeatureCard
                icon={BellElectric}
                title="Stockout Prediction"
                description="Predict and prevent stockouts"
                fullDescription="Leverage machine learning to anticipate product stockouts before they happen. Ensure shelf availability, reduce lost sales, and optimize your restocking decisions in real-time."
                iconColor="text-primary"
                bgColor="bg-green-600/10"
                badge="Popular"
                path="/dashboard/brand-portal/stockout-prediction"
            />

            <FeatureCard
                icon={LineChart}
                title="Price Compliance"
                description="Ensure consistent pricing across channels"
                fullDescription="Track retail prices in real time across multiple locations to maintain price integrity. Detect violations, monitor trends, and generate reports that support enforcement and negotiation strategies."
                iconColor="text-purple-600"
                bgColor="bg-violet-600/10"
                badge="Essential"
                path="/dashboard/brand-portal/price-compliance"
            />

            <FeatureCard
                icon={ShoppingCart}
                title="Distro Net Manager"
                description="Control your distribution network"
                fullDescription="Get visibility into your distributor relationships. Manage order flows, compare pricing, and optimize fulfillment routes to ensure your products reach the right shelves faster and cheaper."
                iconColor="text-primary"
                bgColor="bg-primary/10"
                badge="Popular"
                path="/dashboard/brand-portal/dnm"
            />

            <FeatureCard
                icon={Brain}
                title="Forward Promotion"
                description="Plan and push promos with precision"
                fullDescription="AI-driven promotion tools to activate retailers and drive volume. Run loyalty campaigns, schedule SMS blasts, and measure engagement – built for FMCG momentum, not just marketing theory."
                iconColor="text-purple-500"
                bgColor="bg-purple-500/10"
                path="/dashboard/brand-portal/promotion-impact"
            />
            <FeatureCard
                icon={Warehouse}
                title="Undercut Heatmaps"
                description="Expose pricing leaks in real time"
                fullDescription="Visualize where your products are being sold below recommended prices. Spot unauthorized discounts, grey-market competition, and geo-specific brand erosion — all on an actionable map."
                iconColor="text-red-600"
                bgColor="bg-red-600/10"
                badge="Beta"
                path="/dashboard/brand-portal/undercut-heatmap"
            />

            <FeatureCard
                icon={DollarSignIcon}
                title="Precision Analytics"
                description="Make data-backed brand decisions"
                fullDescription="Dive into product-level insights, campaign ROI, and retail dynamics. From spend tracking to market penetration, precision analytics equips brand teams with the tools to steer strategy."
                iconColor="text-emerald-700"
                bgColor="bg-emerald-100"
                badge="Popular"
                path="/dashboard/brand-portal/precision-analytics"
            />
        </motion.div>
    )
}
