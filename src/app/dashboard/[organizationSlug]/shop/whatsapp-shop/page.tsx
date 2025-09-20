import type { Metadata } from "next"
import { useCurrency } from "@/hooks/useCurrency";
import { WhatsAppShopSetup } from "@/components/core/online-shop/whatsapp/whatsapp-shop-setup"
import { TypingEffect } from "@/components/marketing/typing-effect"

export const metadata: Metadata = {
    title: "WhatsApp Shop Setup | Alcora",
    description: "Configure your WhatsApp shop to sell directly to customers through WhatsApp",
}

export default function WhatsAppShopPage() {
    return (
        <div className="max-w-4xl mx-auto py-3">
            <div className="max-w-3xl mx-auto mb-2">
                <TypingEffect
                    text={`alcorabooks.com/shop is ready! But...  
                    → WhatsApp needs kazi kidogo:  
                    1. Weka number yako (We connect to Meta)  
                    2. Sync catalog in 5 sec ⚡️ to WhatsApp business
                    ⚠️ Issue weekend orders? Hii integration itasaidia *kupunguza kelele*.  
                    Twaenda na pace? Get started here ↓`}
                    speed={10}
                />
            </div>
            <WhatsAppShopSetup />
        </div>
    )
}
