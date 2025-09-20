"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { usePathname, useRouter, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Store,
    Warehouse,
    Building2,
    Package,
    ShoppingCart,
    Truck,
    Bell,
    BarChart3,
    User,
    Settings,
    LogOut,
    Menu,
    ChevronLeft,
    Home,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { client, useSession } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AlcorabooksSidebarProps {
    children: React.ReactNode
}

export function AlcorabooksSidebar({
    children }: AlcorabooksSidebarProps) {
    const { data: session } = useSession()
    const [userRole, setUserRole] = useState<"retailer" | "wholesaler" | "distributor" | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const params = useParams()

    const organizationSlug = params.organizationSlug as string

    // Initialize sidebar state based on window size
    useEffect(() => {
        // Initialize from localStorage on first load to prevent flashing
        const storedSidebarState = localStorage.getItem("sidebarOpen")
        const storedIsMobile = localStorage.getItem("isMobile")

        if (storedIsMobile !== null) {
            setIsMobile(storedIsMobile === "true")
        }

        if (storedSidebarState !== null) {
            setSidebarOpen(storedSidebarState === "true")
        }

        const checkIfMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)

            // Only update sidebar state if the device type changes
            // or if we haven't set it from localStorage yet
            if (mobile !== (storedIsMobile === "true") || storedSidebarState === null) {
                const newSidebarState = !mobile
                setSidebarOpen(newSidebarState)
                localStorage.setItem("sidebarOpen", newSidebarState.toString())
            }

            localStorage.setItem("isMobile", mobile.toString())
        }

        // Run immediately
        checkIfMobile()

        // Setup event listener
        window.addEventListener("resize", checkIfMobile)
        return () => window.removeEventListener("resize", checkIfMobile)
    }, [])

    // Update localStorage when sidebar state changes
    useEffect(() => {
        localStorage.setItem("sidebarOpen", sidebarOpen.toString())
    }, [sidebarOpen])

    // Listen for route changes to close the sidebar on mobile
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false)
        }
    }, [pathname, isMobile])

    // Set the role from the session
    useEffect(() => {
        if (session?.user?.role) {
            // Make sure it's one of our expected roles
            const role = session.user.role
            if (["retailer", "wholesaler", "distributor"].includes(role)) {
                setUserRole(role as "retailer" | "wholesaler" | "distributor")
            } else {
                // Default to retailer if role is not recognized
                setUserRole("retailer")
            }
        } else {
            // Default for development/testing
            setUserRole("retailer")
        }
    }, [session])

    // Define navigation links based on role
    const getLinks = () => {
        const retailerLinks = [
            { href: `/dashboard/${organizationSlug}`, label: "Dashboard", icon: Home },
            { href: `/dashboard/${organizationSlug}/orders`, label: "My Orders", icon: ShoppingCart },
            { href: `/dashboard/${organizationSlug}/place-orders`, label: "Place Orders", icon: Package },
            { href: `/dashboard/${organizationSlug}/notifications`, label: "Notifications", icon: Bell },
            { href: `/dashboard/${organizationSlug}/profile`, label: "Profile", icon: User },
        ]

        const wholesalerLinks = [
            { href: `/dashboard/${organizationSlug}`, label: "Dashboard", icon: Home },
            { href: `/dashboard/${organizationSlug}/orders`, label: "Retailer Orders", icon: ShoppingCart },
            { href: `/dashboard/${organizationSlug}/orders`, label: "Order from Distributors", icon: Package },
            { href: `/dashboard/${organizationSlug}/inventory`, label: "Inventory", icon: Package },
            { href: `/dashboard/${organizationSlug}/shipments`, label: "Shipments", icon: Truck },
            { href: `/dashboard/${organizationSlug}/analytics`, label: "Analytics", icon: BarChart3 },
            { href: `/dashboard/${organizationSlug}/notifications`, label: "Notifications", icon: Bell },
            { href: `/dashboard/${organizationSlug}/profile`, label: "Profile", icon: User },
        ]

        const distributorLinks = [
            { href: `/dashboard/${organizationSlug}`, label: "Dashboard", icon: Home },
            { href: `/dashboard/${organizationSlug}/orders`, label: "Wholesaler Orders", icon: ShoppingCart },
            { href: `/dashboard/${organizationSlug}/inventory`, label: "Inventory Management", icon: Package },
            { href: `/dashboard/${organizationSlug}/shipments`, label: "Shipments", icon: Truck },
            { href: `/dashboard/${organizationSlug}/analytics`, label: "Analytics", icon: BarChart3 },
            { href: `/dashboard/${organizationSlug}/notifications`, label: "Notifications", icon: Bell },
            { href: `/dashboard/${organizationSlug}/profile`, label: "Profile", icon: User },
        ]

        return userRole === "retailer"
            ? retailerLinks
            : userRole === "wholesaler"
                ? wholesalerLinks
                : distributorLinks || retailerLinks
    }

    const links = getLinks()

    const roleIcon = userRole === "retailer" ? Store : userRole === "wholesaler" ? Warehouse : Building2

    const RoleIcon = roleIcon

    // Handle clicking a link to ensure proper sidebar behavior on navigation
    const handleLinkClick = () => {
        if (isMobile) {
            setSidebarOpen(false)
        }
    }

    // Display loading/fallback until session is loaded
    if (!userRole) {
        return (
            <div className="flex min-h-screen">
                <div className="fixed inset-y-0 left-0 z-30 w-64 border-r bg-background" />
                <main className="flex-1 pl-64">
                    <div className="p-4 md:p-8">{children}</div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b bg-background">
                <div className="flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-1">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        <Link href={`/dashboard/${organizationSlug}`} className="flex items-center gap-1">
                            <RoleIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-light">Alcorabooks</span>
                        </Link>
                        <Badge
                            variant="outline"
                            className="h-4 text-xs font-light hidden md:flex capitalize bg-primary/5 text-primary border-primary/20"
                        >
                            {userRole}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild className="cursor-pointer">
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                                        <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {session?.user?.name || session?.user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/${organizationSlug}/profile`} className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/${organizationSlug}/profile`} className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <div
                                        onClick={() =>
                                            client.signOut({
                                                fetchOptions: {
                                                    onSuccess: () => {
                                                        toast.success("Successfully signed out!")
                                                        router.push("/")
                                                    },
                                                },
                                            })
                                        }
                                        className="cursor-pointer text-destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <AnimatePresence initial={false} mode="wait">
                    {sidebarOpen && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 240, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                opacity: { duration: 0.2 },
                            }}
                            className="fixed inset-y-0 left-0 z-30 mt-14 bg-background border-r"
                            style={{ overflowX: "hidden" }}
                        >
                            <div className="h-full flex flex-col pt-2">
                                <nav className="flex-1 overflow-y-auto px-2 py-2">
                                    <ul className="space-y-1">
                                        {links.map((link) => {
                                            const isActive = pathname === link.href
                                            return (
                                                <li key={link.href}>
                                                    <Link
                                                        href={link.href}
                                                        className={cn(
                                                            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                                            isActive
                                                                ? "bg-primary/10 text-primary"
                                                                : "hover:bg-muted text-foreground/80 hover:text-foreground",
                                                        )}
                                                        onClick={handleLinkClick}
                                                    >
                                                        <link.icon className="h-4 w-4" />
                                                        <span>{link.label}</span>
                                                        {isActive && (
                                                            <motion.div
                                                                layoutId="active-indicator"
                                                                className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                            />
                                                        )}
                                                    </Link>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </nav>

                                <div className="mt-auto px-2 py-2 border-t">
                                    <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-muted/80">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {userRole.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium">Alcorabooks</span>
                                            <span className="text-xs text-muted-foreground capitalize">{userRole} dash</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSidebarOpen(false)}
                                            className="ml-auto h-7 w-7"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile sidebar overlay */}
                <AnimatePresence>
                    {isMobile && sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-20 bg-black"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                <main className={cn("flex-1 transition-all duration-300 ease-in-out", sidebarOpen ? "md:ml-60" : "ml-0")}>
                    <div className="p-4 md:p-6">{children}</div>
                </main>
            </div>
        </div>
    )
}
