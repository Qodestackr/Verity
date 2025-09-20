"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RatingPromptProps {
    onRate: (rating: number) => void
}

export function RatingPrompt({
    onRate }: RatingPromptProps) {
    const [rating, setRating] = useState(0)

    const handleRating = (value: number) => {
        setRating(value)
        onRate(value)
    }

    return (
        <div className="p-6 flex flex-col items-center">
            {/* Delivery Illustration */}
            <div className="h-32 w-32 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                <img src="/placeholder.svg?height=100&width=100" alt="Delivery complete" className="h-24 w-24" />
            </div>

            {/* Success Message */}
            <h2 className="text-xl font-bold mb-2">Order Delivered!</h2>
            <p className="text-center mb-8">Your order was delivered on time. Enjoy your drinks big Time!</p>

            {/* Rating */}
            <div className="mb-8 w-full">
                <p className="text-center font-medium mb-4">How was your experience?</p>
                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <Button
                            key={value}
                            variant="outline"
                            size="icon"
                            className={`h-12 w-12 rounded-full ${rating >= value ? "bg-amber-100 border-amber-400 text-amber-500" : ""
                                }`}
                            onClick={() => handleRating(value)}
                        >
                            <Star className={`h-6 w-6 ${rating >= value ? "fill-amber-500" : ""}`} />
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}
