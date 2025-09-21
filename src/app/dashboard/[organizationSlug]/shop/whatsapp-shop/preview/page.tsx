import type { Metadata } from "next"

import { ShopPreview } from "@/components/core/online-shop/whatsapp/shop-preview"

export const metadata: Metadata = {
    title: "WhatsApp Shop Preview | Alcora",
    description: "Preview how your WhatsApp shop will appear to customers",
}

export default function WhatsAppShopPreviewPage() {
    return (
        <div className="max-w-4xl mx-auto py-2">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-normal tracking-tight mb-2 text-center">WhatsApp Shop Preview</h1>
                <ShopPreview />
                <p className="text-center text-sm text-muted-foreground mt-3">
                    This is a preview of how your WhatsApp shop will appear to customers.
                </p>
            </div>
        </div>
    )
}
