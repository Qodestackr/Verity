import { useCurrency } from "@/hooks/useCurrency";
import SalesSummaryDashboard from "@/components/accounting/sales/sales-summary-dashboard"

export default function SalesSummaryPage() {
    return (
        <div className="max-w-4xl mx-auto py-3">
            <SalesSummaryDashboard />
        </div>
    )
}
