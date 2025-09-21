import type { Metadata } from "next"

import { InvoiceDetails } from "@/components/accounting/invoice-details"

export const metadata: Metadata = {
    title: "Invoice Details | Alcorabooks Accounting",
    description: "View and manage invoice details",
}

export default function InvoiceDetailsPage({ params }: { params: { id: string } }) {
    return (
        <div className="container mx-auto px-4 py-6">
            <InvoiceDetails id={params.id} />
        </div>
    )
}