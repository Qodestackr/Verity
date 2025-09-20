'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import React from 'react'

export default function CashConfirmationPage({ params }: { params: { storeId: string } }) {
    const { storeId } = React.use(params)
    const router = useRouter()
    const [hasExactAmount, setHasExactAmount] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)

    const orderAmount = 1139.00
    const orderId = "ORD-12345"

    const handleConfirm = () => {
        setIsConfirming(true)

        setTimeout(() => {
            setIsConfirming(false)
            // orderId/status
            router.push(`/shop/${storeId}/order-status`)
            toast.success('Payment method confirmed', {
                description: 'Your order has been placed successfully!'
            })
        }, 1000)
    }

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-background">
            <header className="sticky top-0 z-10 bg-white dark:bg-background border-b">
                <div className="flex items-center p-4">
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-light">Cash Payment</h1>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center px-4 pt-8 pb-24">
                <div className="w-20 h-20 bg-amber-100 dark:bg-gray-950 rounded-full flex items-center justify-center mb-2">
                    <Wallet className="h-10 w-10 text-amber-500" />
                </div>
                <h2 className="text-xl font-semibold text-center mb-2">How much cash will you use?</h2>
                <p className="text-gray-500 text-center text-sm mb-8">
                    We'll let the courier know so they can bring the right change
                </p>
                <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-lg p-4 flex justify-between items-center mb-2">
                    <span className="text-xl font-semibold">{orderAmount.toFixed(2)}</span>
                    <span className="text-lg font-medium">KSh</span>
                </div>
                <div className="w-full flex items-center space-x-3 mb-12">
                    <Checkbox
                        id="exact-amount"
                        checked={hasExactAmount}
                        onCheckedChange={(checked) => setHasExactAmount(checked as boolean)}
                        className="h-5 w-5 border-emerald-500 data-[state=checked]:bg-emerald-500"
                    />
                    <label htmlFor="exact-amount" className="text-base cursor-pointer">
                        I have exactly KSh{orderAmount.toFixed(2)}
                    </label>
                </div>
            </main>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base rounded-full"
                    onClick={handleConfirm}
                    disabled={isConfirming}
                >
                    {isConfirming ? "Processing..." : "Confirm"}
                </Button>
            </div>
        </div>
    )
}
