"use client"

import { Suspense } from "react"
import { useCurrency } from "@/hooks/useCurrency";
import { SubscriptionPlans } from "@/components/subscriptions/subscription-plans"

interface SubscriptionPageProps {
    role?: "RETAILER" | "WHOLESALER" | "DISTRIBUTOR" | "BRAND_OWNER"
    onSubscriptionCreated?: () => void
}

export default function SubscriptionPage({ role = "RETAILER", onSubscriptionCreated }: SubscriptionPageProps) {
    return (
        <div className="max-w-4xl mx-auto py-6">
            <Suspense fallback={<div className="text-center">Loading plans...</div>}>
                <SubscriptionPlans businessType={role} onSubscriptionCreated={onSubscriptionCreated} />
            </Suspense>
        </div>
    )
}
