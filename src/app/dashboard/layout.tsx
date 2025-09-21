"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname, useParams } from "next/navigation"

import OnboardingWidget from "@/components/core/onboarding-widget"
import OnboardingBlocker from "@/components/core/onboarding-blocker"
import { AlcorabooksSidebar } from "@/components/common/sidebar"

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayoutClient({ children }: DashboardLayoutProps) {
    const pathname = usePathname()
    const params = useParams()
    const organizationSlug = params.organizationSlug as string

    const [completedSteps, setCompletedSteps] = useState(4)
    const [userRole, setUserRole] = useState("retailer")
    const totalSteps = 4
    const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false)

    // Don't show the onboarding widget on the onboarding page itself
    const isOnboardingPage = pathname === `/dashboard/${organizationSlug}/onboarding`
    const showOnboardingWidget = pathname !== `/dashboard/${organizationSlug}/onboarding`

    // This would normally be fetched from an API or local storage
    useEffect(() => {
        // Fetch onboarding progress from localStorage
        const savedProgress = localStorage.getItem("onboardingProgress")
        if (savedProgress) {
            setCompletedSteps(Number.parseInt(savedProgress))
        }

        // Get user role from localStorage or session
        const savedRole = localStorage.getItem("userRole")
        if (savedRole) {
            setUserRole(savedRole)
        }

        setHasCheckedOnboarding(true)
    }, [])

    if (isOnboardingPage) {
        return <AlcorabooksSidebar>{children}</AlcorabooksSidebar>
    }

    return (
        <AlcorabooksSidebar>
            {/* Main content */}
            <div className="relative">
                {children}

                {/* Show the onboarding widget for partially completed onboarding */}
                {showOnboardingWidget && completedSteps > 0 && completedSteps < totalSteps && (
                    <OnboardingWidget completedSteps={completedSteps} totalSteps={totalSteps} />
                )}

                {/* Show the full-screen blocker if onboarding is not complete */}
                {hasCheckedOnboarding && completedSteps < totalSteps && (
                    <OnboardingBlocker completedSteps={completedSteps} totalSteps={totalSteps} userRole={userRole} />
                )}
            </div>
        </AlcorabooksSidebar>
    )
}
