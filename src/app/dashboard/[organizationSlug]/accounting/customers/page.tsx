import type { Metadata } from "next"
import { useCurrency } from "@/hooks/useCurrency";
import { CustomersList } from "@/components/accounting/customers-list"

export const metadata: Metadata = {
    title: "Customers | Alcorabooks Accounting",
    description: "Manage customer accounts and credit",
}

export default function CustomersPage() {
    return (
        <div className="container mx-auto px-4 py-6">
            <CustomersList />
        </div>
    )
}