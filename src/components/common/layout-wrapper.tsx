"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { AppHeader } from "@/components/common/app-header"

interface LayoutWrapperProps {
    children: React.ReactNode
    session: any | null
}

export function LayoutWrapper({
    children, session }: LayoutWrapperProps) {
    const [headerVisible, setHeaderVisible] = useState(true)
    const pathname = usePathname()

    const isDashboardPath = pathname.startsWith("/dashboard")

    // Set initial header visibility based on path
    useEffect(() => {
        setHeaderVisible(!isDashboardPath)
    }, [isDashboardPath])

    return (
        <>
            <AppHeader session={session} setHeaderVisible={setHeaderVisible} />
            <main className={headerVisible ? "pt-20" : ""}>{children}</main>
        </>
    )
}
