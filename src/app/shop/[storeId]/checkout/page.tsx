"use client"

import { useState } from "react"

import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, ChevronRight, Clock, CreditCard, Gift, MapPin, Phone } from "lucide-react"


import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import React from "react"

// from a context or state management
const mockCart = {
    items: [
        {
            id: "prod_1",
            name: "Jameson Irish Whiskey",
            price: 2500,
            quantity: 1,
        },
        {
            id: "prod_2",
            name: "Johnnie Walker Black Label",
            price: 3200,
            quantity: 1,
        },
    ],
    store: "Premium Liquor Shop",
    subtotal: 5700,
    deliveryFee: 250,
    total: 5950,
}

export default function CheckoutPage({ params }: { params: { storeId: string } }) {
    const { storeId } = React.use(params)
    const router = useRouter()
    const [isAgeVerified, setIsAgeVerified] = useState(false)
    const [selectedDeliveryOption, setSelectedDeliveryOption] = useState("standard")
    const [isProcessing, setIsProcessing] = useState(false)

    const handlePayment = () => {
        if (!isAgeVerified) {
            toast.error("Age verification required", {
                description: "You must verify that you are of legal age to purchase alcohol.",
            })
            return
        }

        setIsProcessing(true)

        setTimeout(() => {
            setIsProcessing(false)
            // toast.success("Order placed successfully!", {
            //     description: "Your order has been placed and will be delivered soon.",
            // })
            router.push(`/shop/${storeId}/checkout/payment`)
        }, 2000)
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white dark:bg-background border-b">
                <div className="flex items-center p-4">
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-normal">Checkout</h1>
                </div>
            </header>

            <div className="flex-1 pb-24">
                {/* Order Summary */}
                <div className="bg-white dark:bg-background p-3 mb-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-normal">Your order</h2>
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm">
                        {mockCart.items.length} {mockCart.items.length === 1 ? "product" : "products"} from {mockCart.store}
                    </p>
                </div>

                {/* Delivery Address */}
                <div className="bg-white dark:bg-background p-3 mb-2">
                    <h2 className="text-lg font-light mb-2">Delivery address</h2>

                    {/* Map placeholder */}
                    <div className="relative h-40 bg-gray-200 dark:bg-gray-500 rounded-lg mb-4 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-emerald-600" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-6"></div>
                    </div>

                    <div className="flex items-start mb-4">
                        <div className="mr-3 mt-1">
                            <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">RXV5+J3W, Ruiru, Kenya</p>
                            <p className="text-sm text-gray-500">Delivery location</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>

                    {/* Delivery options */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="mr-3">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Gift className="h-5 w-5 text-gray-600" />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium">Sending to someone else?</p>
                                    <p className="text-sm text-gray-500">Add their details to help the courier</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="mr-3">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Phone className="h-5 w-5 text-gray-600" />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium">Add your phone number</p>
                                    <p className="text-sm text-gray-500">We'll send you a message to validate it</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Delivery Options */}
                <div className="bg-white dark:bg-background p-2 mb-2">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-normal">Delivery options</h2>
                        <div className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center">
                            <span className="text-xs font-medium">i</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Card
                            className={`p-2 cursor-pointer border-2 ${selectedDeliveryOption === "standard" ? "border-emerald-600" : "border-gray-200"}`}
                            onClick={() => setSelectedDeliveryOption("standard")}
                        >
                            <div className="flex flex-col gap-2">
                                <p className="font-medium">Standard</p>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-3.5 w-3.5 mr-1" />
                                    40-50 min
                                </div>
                            </div>
                        </Card>

                        <Card className="p-2 cursor-not-allowed bg-gray-50 dark:bg-slate-950 border-gray-200 dark:border-gray-500">
                            <div className="flex flex-col gap-2">
                                <p className="font-medium text-gray-400">Schedule</p>
                                <p className="text-sm text-gray-400">Not available in this store</p>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white dark:bg-background p-2 mb-2">
                    <h2 className="text-lg font-normal mb-2">Payment method</h2>

                    <div className="flex items-center justify-between p-2 border rounded-lg mb-2">
                        <div className="flex items-center">
                            <CreditCard className="h-5 w-5 text-gray-500 mr-3" />
                            <span className="text-gray-500">Select a payment method</span>
                        </div>
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex items-center">
                            <Gift className="h-5 w-5 text-gray-500 mr-3" />
                            <span className="text-gray-500">Got a promo code?</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                </div>

                {/* Age Verification */}
                <div className="bg-white dark:bg-background p-2 mb-2">
                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="age-verification"
                            checked={isAgeVerified}
                            onCheckedChange={(checked) => setIsAgeVerified(checked as boolean)}
                        />
                        <label htmlFor="age-verification" className="text-sm leading-tight cursor-pointer">
                            I certify that I am of legal age and agree to provide proof of age upon request.
                        </label>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white dark:bg-background p-2">
                    <h2 className="text-lg font-normal mb-2">Order summary</h2>

                    <div className="space-y-2 mb-2">
                        {mockCart.items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                                <span className="text-sm">
                                    {item.quantity}x {item.name}
                                </span>
                                <span className="text-sm font-medium">KSh {item.price.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <Separator className="my-2" />

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Subtotal</span>
                            <span className="text-sm">KSh {mockCart.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Delivery fee</span>
                            <span className="text-sm">KSh {mockCart.deliveryFee.toLocaleString()}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>KSh {mockCart.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-2 bg-white dark:bg-background border-t">
                <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 text-base"
                    onClick={handlePayment}
                    disabled={isProcessing}
                >
                    {isProcessing ? "Processing..." : "Pay to order"}
                </Button>
            </div>
        </div>
    )
}
