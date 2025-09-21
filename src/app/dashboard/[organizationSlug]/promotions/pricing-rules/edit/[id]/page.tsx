
import { PricingRuleForm } from "@/components/payments/pricing-rule-form";

export default function EditPricingRule({ params }: { params: { id: string } }) {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Edit Pricing Rule</h1>
            <PricingRuleForm editId={params.id} />
        </div>
    )
}
