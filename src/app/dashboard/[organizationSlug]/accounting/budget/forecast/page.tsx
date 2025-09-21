"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { BudgetForecast } from "@/components/accounting/budget/budget-forecast"

export default function BudgetForecastPage() {
    const [organizationId, setOrganizationId] = useState<string | null>(null)
    const searchParams = useSearchParams()

    useEffect(() => {
        // from auth context
        // For now, we'll use a query param or a default value
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
        <div className="container py-6 max-w-6xl">
            <BudgetForecast organizationId={organizationId} />
        </div>
    )
}
