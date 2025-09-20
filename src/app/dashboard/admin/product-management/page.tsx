import { useCurrency } from "@/hooks/useCurrency";
import { ProductTable } from "@/components/products/product-management-table";

export default function DashboardPage() {
    return (
        <div className="max-w-6xl mx-auto">
            <ProductTable />
        </div>
    )
}