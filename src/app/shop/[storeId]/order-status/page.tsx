"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, HelpCircle, MessageCircle, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar } from "@/components/ui/avatar"
import { OrderStatusIndicator } from "@/components/orders/order-status-indicator"
import { OrderDetails } from "@/components/orders/shop-order-details"
import { PrimePromotion } from "@/components/orders/prime-promotion"
import { RatingPrompt } from "@/components/orders/rating-prompt"
import { toast } from "sonner"

// Order status types
type OrderStatus = "received" | "preparing" | "ready" | "pickup" | "delivering" | "delivered"

export default function OrderStatusPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [currentStatus, setCurrentStatus] = useState<OrderStatus>("received")
    const [estimatedTime, setEstimatedTime] = useState<string>("18:40 - 18:50")
    const [progress, setProgress] = useState(10)
    const [minutesLeft, setMinutesLeft] = useState<number | null>(null)
    const [showMap, setShowMap] = useState(false)
    const [showRating, setShowRating] = useState(false)

    // Mock order data
    const orderData = {
        id: params.id || "ORD-12345",
        store: "KFC",
        location: "RXHC+Q26, Varsityville Estate, Kenya",
        items: [
            {
                id: "item-1",
                name: "Nyama Nyama Burger Meal",
                description: "Spicy, Coke",
                price: 1100,
                quantity: 1,
            },
        ],
        total: 1100,
        deliveryFee: 39,
        grandTotal: 1139,
    }

    useEffect(() => {
        const statusSequence: OrderStatus[] = ["received", "preparing", "ready", "pickup", "delivering", "delivered"]
        const progressValues = [10, 30, 50, 70, 85, 100]

        let currentIndex = 0

        const interval = setInterval(() => {
            if (currentIndex < statusSequence.length - 1) {
                currentIndex++
                setCurrentStatus(statusSequence[currentIndex])
                setProgress(progressValues[currentIndex])

                // Show toast notification for status change
                toast.info(`Order status updated`, {
                    description: `Your order is now ${statusSequence[currentIndex]}`,
                })

                // When delivery starts, show map and set minutes left
                if (statusSequence[currentIndex] === "delivering") {
                    setShowMap(true)
                    setMinutesLeft(7)
                }

                // When delivered, show rating prompt
                if (statusSequence[currentIndex] === "delivered") {
                    setShowMap(false)
                    setShowRating(true)
                }
            } else {
                clearInterval(interval)
            }
        }, 8_000) // Update every 8 seconds for demo purposes

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (minutesLeft && minutesLeft > 0) {
            const timer = setTimeout(() => {
                setMinutesLeft(minutesLeft - 1)
            }, 60_000)

            return () => clearTimeout(timer)
        }
    }, [minutesLeft])

    // Helper function to get status text
    const getStatusText = () => {
        switch (currentStatus) {
            case "received":
                return "The Store received your order!"
            case "preparing":
                return "The Store is preparing your order"
            case "ready":
                return "Your order is ready for pickup"
            case "pickup":
                return "Courier is picking up your order"
            case "delivering":
                return "Your order is on the way"
            case "delivered":
                return "Your order has been delivered"
            default:
                return "Tracking your order..."
        }
    }

    const handleRating = (value: number) => {
        toast.success("Thanks for your feedback!", {
            description: "Your rating helps us improve our service.",
        })

        // Navigate to orders page after rating
        setTimeout(() => {
            router.push("/shop")
        }, 1500)
    }

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-amber-400 text-white">
                <div className="flex items-center justify-between p-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-amber-500"
                        onClick={() => router.push("/shop")}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-medium">Order Status</h1>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-amber-500">
                        <HelpCircle className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex flex-col">
                {/* Map View (Only shown during delivery) */}
                {showMap && (
                    <div className="relative h-[40vh] bg-gray-200">
                        {/* This would be replaced with an actual map component */}
                        <div className="h-full w-full flex items-center justify-center">
                            <span className="text-gray-400">Map View</span>
                        </div>

                        {/* Delivery Status Overlay */}
                        <div className="absolute top-4 left-4 right-4 bg-white dark:bg-background rounded-lg shadow-lg p-4 flex items-center">
                            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                                <img src="/placeholder.svg?height=40&width=40" alt="Delivery icon" className="h-8 w-8" />
                            </div>
                            <div className="flex-1">
                                <h2 className="font-bold">{minutesLeft} minutes left</h2>
                                <p className="text-sm">
                                    Your order is being <span className="font-medium">delivered!</span>
                                </p>
                            </div>
                        </div>

                        {/* Courier Info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-background p-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <Avatar className="h-10 w-10 mr-3">
                                    <img src="/placeholder.svg?height=40&width=40" alt="Courier" />
                                </Avatar>
                                <div>
                                    <p className="font-medium">Stephen</p>
                                    <p className="text-xs text-gray-500">Courier</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="rounded-full h-10 w-10 border-emerald-500 text-emerald-500"
                                >
                                    <Phone className="h-5 w-5" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="rounded-full h-10 w-10 border-emerald-500 text-emerald-500"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Section with Yellow Background (Hidden during map view) */}
                {!showMap && (
                    <div className="bg-amber-400 text-center px-4 pb-12 pt-4 relative">
                        <OrderStatusIndicator status={currentStatus} />

                        <h2 className="text-lg font-medium mt-4 mb-1">{getStatusText()}</h2>

                        {currentStatus === "preparing" && (
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <span className="text-sm font-medium bg-white/20 px-2 py-0.5 rounded">On time</span>
                                <span className="text-sm font-medium">{estimatedTime}</span>
                            </div>
                        )}

                        {/* Progress Bar */}
                        <div className="mt-6 px-4">
                            <Progress value={progress} className="h-2 bg-amber-300" indicatorClassName="bg-white" />

                            <div className="flex justify-between mt-2 text-xs">
                                <span className={`${progress >= 10 ? "font-medium" : ""}`}>In progress</span>
                                <span className={`${progress >= 50 ? "font-medium" : ""}`}>Pick up</span>
                                <span className={`${progress >= 85 ? "font-medium" : ""}`}>Delivery</span>
                            </div>
                        </div>

                        {/* Curved Bottom Edge */}
                        <div className="absolute -bottom-6 left-0 right-0 h-6 bg-white dark:bg-gray-950 rounded-t-[50%]"></div>
                    </div>
                )}

                {/* Rating Prompt (Only shown after delivery) */}
                {showRating && <RatingPrompt onRate={handleRating} />}

                {/* Prime Promotion (Hidden during rating) */}
                {!showRating && <PrimePromotion />}

                {/* Order Details (Hidden during rating) */}
                {!showRating && <OrderDetails order={orderData} />}
            </main>
        </div>
    )
}
