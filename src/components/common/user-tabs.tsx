"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import {
    Wine,
    ShoppingCart,
    MessageSquareText,
    User,
    MapPin,
    TrendingUp,
    Gift,
    Music,
    PartyPopper,
    Truck,
} from "lucide-react"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

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
        scale: 1.05,
        transition: {
            duration: 0.2,
            type: "tween",
            ease: "easeOut",
        },
    },
}

export default function UserTabs() {
    const pathname = usePathname()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("")
    const organizationSlug = useOrganizationSlug()

    useEffect(() => {
        // Set active tab based on current path
        if (pathname.includes(`/dashboard/${organizationSlug}/shop/baridi`)) {
            setActiveTab("baridi")
        } else if (pathname.includes("/shop")) {
            setActiveTab("shop")
        } else if (pathname.includes(`/dashboard/${organizationSlug}`)) {
            setActiveTab("events")
        } else if (pathname.includes(`/dashboard/${organizationSlug}/profile`)) {
            setActiveTab("profile")
        }
    }, [pathname])

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t pb-safe-area-inset-bottom">
            <div className="container max-w-md mx-auto">
                <div className="flex justify-between items-center py-2">
                    <TabButton
                        icon={MessageSquareText}
                        label="Baridi AI"
                        isActive={activeTab === "baridi"}
                        onClick={() => router.push(`/dashboard/${organizationSlug}/shop/baridi`)}
                    />
                    <TabButton
                        icon={ShoppingCart}
                        label="Shop"
                        isActive={activeTab === "shop"}
                        onClick={() => router.push("/shop")}
                    />
                    <TabButton
                        icon={PartyPopper}
                        label="Events"
                        isActive={activeTab === "events"}
                        onClick={() => router.push(`/dashboard/${organizationSlug}/shop/baridi`)}
                    />
                    <TabButton
                        icon={User}
                        label="Profile"
                        isActive={activeTab === "profile"}
                        onClick={() => router.push("/profile")}
                    />
                </div>
            </div>
        </div>
    )
}

function TabButton({ icon: Icon, label, isActive, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-colors ${isActive ? "text-primary" : "text-muted-foreground"
                }`}
        >
            <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-xs mt-1">{label}</span>
        </button>
    )
}

export function UserDashFeatureCards() {

    const organizationSlug = useOrganizationSlug()
    return (
        <motion.div className="grid gap-3 grid-cols-2 sm:grid-cols-2" variants={container} initial="hidden" animate="show">
            <FeatureCard
                icon={Wine}
                title="Baridi AI"
                description="Your personal bartender"
                bgColor="bg-emerald-600/10"
                iconColor="text-emerald-600"
                badge="Popular"
                path="/shop/baridi"
            />

            <FeatureCard
                icon={PartyPopper}
                title="Event Planning"
                description="Plan your perfect event"
                bgColor="bg-blue-600/10"
                iconColor="text-blue-600"
                badge="New"
                path={`/dashboard/${organizationSlug}`}
            />

            <FeatureCard
                icon={Music}
                title="Request Ngoma"
                description="Request your favorite songs"
                bgColor="bg-purple-600/10"
                iconColor="text-purple-600"
                path="/shop/baridi?action=music"
            />

            <FeatureCard
                icon={TrendingUp}
                title="Match Updates"
                description="Live sports scores & updates"
                bgColor="bg-amber-600/10"
                iconColor="text-amber-600"
                path="/shop/baridi?action=sports"
            />

            {/* REORDERS COMMON PRODUCTS FROM THEIR ORDER HISTORY */}
            <FeatureCard
                icon={ShoppingCart}
                title="Quick Order"
                description="Reorder your favorites"
                bgColor="bg-primary/10"
                iconColor="text-primary"
                path="/shop"
                badge={""}
            />

            <FeatureCard
                icon={Truck}
                title="Fast Delivery"
                description="Track your order in real-time"
                bgColor="bg-indigo-600/10"
                iconColor="text-indigo-600"
                badge="30 min"
                path="/shop"
            />

            <FeatureCard
                icon={MapPin}
                title="Nearby Spots"
                description="Discover bars & clubs"
                bgColor="bg-red-600/10"
                iconColor="text-red-600"
                path={`/dashboard/${organizationSlug}`}
                badge={""}
            />

            <FeatureCard
                icon={Gift}
                title="Profile"
                description="Manage acct & track rewards with every order"
                bgColor="bg-yellow-600/10"
                iconColor="text-yellow-600"
                badge="125 pts"
                path={`/dashboard/${organizationSlug}/profile`}
            />
        </motion.div>
    )
}

function FeatureCard({
    icon: Icon,
    title,
    description,
    iconColor = "text-primary",
    bgColor = "bg-primary/10",
    badge,
    path = "#",
}: any) {
    return (
        <motion.div variants={item} whileHover="hover" initial="rest" animate="rest">
            <motion.div variants={hoverEffect}>
                <a href={path} className="block h-full">
                    <div className="rounded-xl overflow-hidden h-full border hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer bg-background">
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <div className={`${bgColor} p-3 rounded-lg`}>
                                    <Icon className={`h-5 w-5 ${iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-medium text-base">{title}</h3>
                                        {badge && (
                                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ml-1">
                                                {badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            </motion.div>
        </motion.div>
    )
}
