"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { BudgetDashboard } from "@/components/accounting/budget/budget-dashboard"

export default function BudgetPage() {
    const [organizationId, setOrganizationId] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        // TODO: auth context
        const orgId = searchParams.get("organizationId") || "org_default"
        setOrganizationId(orgId)
    }, [searchParams])

    if (!organizationId) {
        return (
            <div className="container py-6 max-w-6xl">
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-4"></div>
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl py-4 mx-auto">
            <BudgetDashboard organizationId={organizationId} />
        </div>
    )
}
