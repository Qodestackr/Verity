import Link from "next/link"
import { PlusCircle } from "lucide-react"

import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { PricingRulesList } from "@/components/payments/pricing-rules-list"

export default async function Home({
    params,
}: {
    params: { organizationSlug: string }
}) {
    const { organizationSlug } = await params
    return (
        <div className="max-w-4xl mx-auto py-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-normal tracking-tight">Pricing Rules</h1>
                    <p className="text-muted-foreground mt-1">Configure tiered pricing and volume discounts for your products</p>
                </div>
                <Link href={`/dashboard/${organizationSlug}/promotions/pricing-rules/new`}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Rule
                    </Button>
                </Link>
            </div>

            <PricingRulesList />
        </div>
    )
}
