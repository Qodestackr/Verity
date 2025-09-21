
import { PricingRuleForm } from "@/components/payments/pricing-rule-form";

export default function NewPricingRule() {
    return (
        <div className="max-w-4xl mx-auto py-5">
            <h1 className="text-xl font-normal tracking-tight mb-2">Create New Pricing Rule</h1>
            <PricingRuleForm />
        </div>
    )
}
