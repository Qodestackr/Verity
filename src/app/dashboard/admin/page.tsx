import { useCurrency } from "@/hooks/useCurrency";
import AdminFeatureCards from "@/components/admin/admin-feature-cards"

export default function AdminDashboardPage() {
    return (
        <div className="container py-10">
            <AdminFeatureCards />
        </div>
    )
}