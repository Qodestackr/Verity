"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
    href?: string
    size?: "sm" | "md" | "lg"
    showText?: boolean
    className?: string
}

export function BrandLogo({

    href = "/",
    size = "md",
    showText = true,
    className
}: BrandLogoProps) {
    const logoSizes = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-10 w-10"
    }

    const textSizes = {
        sm: "text-sm",
        md: "text-lg",
        lg: "text-xl"
    }

    const Logo = (
        <div className={cn("flex items-center group", showText ? "space-x-2" : "", className)}>
            <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className={cn("relative", logoSizes[size])}
            >
                <Image
                    src="/logo.png"
                    alt="Alcorabooks Logo"
                    fill
                    className="object-contain"
                    priority={size !== "sm"}
                />
            </motion.div>
            {showText && (
                <span className={cn(
                    textSizes[size],
                    "font-light tracking-tighter bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
                )}>
                    Alcorabooks
                </span>
            )}
        </div>
    )

    if (href) {
        return <Link href={href}>{Logo}</Link>
    }

    return Logo
}
