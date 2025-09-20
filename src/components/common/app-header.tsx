"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { usePathname } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import type { Session } from "@/lib/auth-types"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { BrandLogo } from "./brand-logo"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

interface AppHeaderProps {
    session: Session | null
    setHeaderVisible?: (visible: boolean) => void
}

export function AppHeader({
    session, setHeaderVisible }: AppHeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false)
    const pathname = usePathname()

    const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up"
    const router = useRouter()

    const organizationSlug = useOrganizationSlug()
    const isDashboardPath = pathname.startsWith("/dashboard")

    useEffect(() => {
        if (setHeaderVisible) {
            setHeaderVisible(!isDashboardPath)
        }
    }, [isDashboardPath, setHeaderVisible])

    // Scroll effect for header
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleSignOut = async () => {
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        toast?.success?.("Successfully signed out!")
                        router.push("/")
                    },
                },
            })
        } catch (error) {
            console.error("Error signing out:", error)
        }
    }

    const navItems = [
        { name: "Features", path: "/#features" },
        { name: "Solutions", path: "/#solutions" },
        { name: "Pricing", path: "/#pricing" },
        { name: "Resources", path: "/#resources" },
        { name: "Shop", path: "/shop" },
        { name: "For Brands", path: "/for-brands" }
    ]

    return isDashboardPath ? null : (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/90 backdrop-blur-md border-b shadow-sm" : "bg-transparent border-transparent"}`}
        >
            <div className="container flex h-16 items-center justify-between">
                <BrandLogo showText={false} />

                <nav className="hidden lg:flex items-center space-x-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.path}
                            className="text-sm font-medium hover:text-primary transition-colors relative group"
                        >
                            {item.name}
                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full" />
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    {!isAuthPage && (
                        <>
                            {session ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="cursor-pointer relative h-9 w-9 rounded-full">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage
                                                    src={session?.user?.image || "/placeholder.svg"}
                                                    alt={session?.user?.name || "User"}
                                                />
                                                <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{session?.user?.name || "User Name"}</p>
                                                <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href={`/dashboard/${organizationSlug}`} className="cursor-pointer w-full">
                                                <BrandLogo showText={false} />
                                                <span className="ml-2">Dashboard</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/dashboard/${organizationSlug}/profile`} className="cursor-pointer">
                                                <User className="mr-2 h-4 w-4" />
                                                <span>Profile</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="space-x-3 flex justify-baseline items-center gap-2 mr-2 sm:mr-1">
                                    <Link
                                        href="/sign-in"
                                        className="text-sm font-medium hover:text-primary transition-colors hidden sm:block"
                                    >
                                        Sign In
                                    </Link>
                                    <Link href="/sign-up">
                                        <Button size="lg" className="rounded-full px-6 shadow-lg hover:shadow-primary/20 group">
                                            <span className="group-hover:translate-x-0.5 transition-transform">Get Started</span>
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}