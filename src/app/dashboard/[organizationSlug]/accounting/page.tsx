"use client";
import { useCurrency } from "@/hooks/useCurrency";
import { AccountingOverview } from "@/components/accounting/accounting-overview"
import { Construction, PercentDiamond, User2Icon, WeightIcon } from "lucide-react"
import { FeatureCard } from "../page-client";
import { useOrganizationSlug } from "@/hooks/use-organization-slug";

export default async function AccountingPage() {
    const organizationSlug = useOrganizationSlug()

    console.log("ORG SLUF", organizationSlug)
    return (
        <div className="max-w-4xl mx-auto px-2 py-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <FeatureCard
                    icon={Construction}
                    title="Expenses"
                    description="Record basic expenses"
                    fullDescription=""
                    iconColor="text-gray-400"
                    bgColor="bg-gray-400/10"
                    path={`/dashboard/${organizationSlug}/accounting/expenses`}
                />

                <FeatureCard
                    icon={WeightIcon}
                    title="Reconciliation"
                    description="Automatic reconciliation"
                    fullDescription=""
                    iconColor="text-slate-400"
                    bgColor="bg-slate-400/10"
                    path={`/dashboard/${organizationSlug}/accounting/reconciliation`}
                />

                <FeatureCard
                    icon={User2Icon}
                    title="Customers"
                    description="Customers & Loyalty Accounts"
                    fullDescription=""
                    iconColor="text-blue-400"
                    bgColor="bg-blue-400/10"
                    path={`/dashboard/${organizationSlug}/accounting/customers`}
                />

                <FeatureCard
                    icon={PercentDiamond}
                    title="Budgets"
                    description="Budgets & Scenarios"
                    fullDescription=""
                    iconColor="text-orange-400"
                    bgColor="bg-orange-400/10"
                    path={`/dashboard/${organizationSlug}/accounting/budget`}
                />

            </div>
        </div>
    )
}