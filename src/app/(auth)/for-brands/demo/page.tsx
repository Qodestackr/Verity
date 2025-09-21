"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, CheckCircle, Clock, Loader2 } from "lucide-react"


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { format, addDays, setHours, setMinutes } from "date-fns"

export default function ScheduleDemoPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [step, setStep] = useState(1)
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    // Generate available dates (next 5 business days)
    const today = new Date()
    const availableDates = Array.from({ length: 10 }, (_, i) => {
        const date = addDays(today, i + 1)
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) return null
        return date
    }).filter(Boolean) as Date[]

    // Generate available times (9 AM to 5 PM, 1-hour slots)
    const generateTimes = (date: Date) => {
        return Array.from({ length: 8 }, (_, i) => {
            const time = setHours(setMinutes(date, 0), i + 9)
            return format(time, "h:mm a")
        })
    }

    const availableTimes = selectedDate ? generateTimes(new Date(selectedDate)) : []

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedDate || !selectedTime) {
            toast.error("Please select both a date and time")
            return
        }

        setIsSubmitting(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setStep(2) // Move to success step

        toast.success("Your demo has been scheduled", {
            description: `We'll see you on ${format(new Date(selectedDate), "MMMM d, yyyy")} at ${selectedTime}.`,
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                <Card className="border-gray-200 shadow-lg">
                    <CardHeader className="border-b border-gray-100 bg-gray-50">
                        <CardTitle className="text-2xl font-light text-emerald-800">Schedule a Demo</CardTitle>
                        <CardDescription>
                            Select a date and time for a personalized walkthrough of Verity's Brand Command Center
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {step === 1 && (
                            <motion.form
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                <div className="space-y-3">
                                    <Label className="text-base">Select a Date</Label>
                                    <RadioGroup
                                        value={selectedDate || ""}
                                        onValueChange={setSelectedDate}
                                        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                                    >
                                        {availableDates.map((date, i) => (
                                            <div
                                                key={i}
                                                className={`border rounded-md p-3 cursor-pointer transition-all ${selectedDate === date.toISOString()
                                                    ? "border-emerald-600 bg-emerald-50"
                                                    : "hover:border-emerald-200 hover:bg-gray-50"
                                                    }`}
                                                onClick={() => setSelectedDate(date.toISOString())}
                                            >
                                                <RadioGroupItem value={date.toISOString()} id={`date-${i}`} className="sr-only" />
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm text-gray-500">{format(date, "EEE")}</span>
                                                    <span className="text-xl font-medium">{format(date, "d")}</span>
                                                    <span className="text-sm">{format(date, "MMM")}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                {selectedDate && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-3"
                                    >
                                        <Label className="text-base">Select a Time</Label>
                                        <RadioGroup
                                            value={selectedTime || ""}
                                            onValueChange={setSelectedTime}
                                            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                                        >
                                            {availableTimes.map((time, i) => (
                                                <div
                                                    key={i}
                                                    className={`border rounded-md p-3 cursor-pointer transition-all ${selectedTime === time
                                                        ? "border-emerald-600 bg-emerald-50"
                                                        : "hover:border-emerald-200 hover:bg-gray-50"
                                                        }`}
                                                    onClick={() => setSelectedTime(time)}
                                                >
                                                    <RadioGroupItem value={time} id={`time-${i}`} className="sr-only" />
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Clock className="h-4 w-4 text-gray-500" />
                                                        <span>{time}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </motion.div>
                                )}

                                <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-sm text-blue-800">
                                    <p className="flex items-start">
                                        <Calendar className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Your demo will include a personalized walkthrough of our Brand Command Center, tailored to your
                                            specific distribution challenges.
                                        </span>
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                                    disabled={!selectedDate || !selectedTime || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Scheduling...
                                        </>
                                    ) : (
                                        "Schedule Demo"
                                    )}
                                </Button>
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="py-8 text-center"
                            >
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                                </div>

                                <h3 className="text-2xl font-medium text-gray-900 mb-2">Demo Scheduled</h3>
                                <p className="text-gray-600 mb-2">Your demo has been confirmed for:</p>

                                <div className="bg-gray-50 rounded-lg p-4 mb-6 inline-block">
                                    <p className="font-medium text-gray-900">
                                        {selectedDate && format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
                                    </p>
                                    <p className="text-emerald-700">{selectedTime}</p>
                                </div>

                                <p className="text-gray-600 mb-6">
                                    We've sent a calendar invitation to your email. Our team is looking forward to showing you how Verity
                                    can transform your distribution visibility.
                                </p>

                                <Button
                                    onClick={() => router.push("/for-brands")}
                                    className="bg-emerald-700 hover:bg-emerald-800 text-white">
                                    Go To Demo
                                </Button>
                            </motion.div>
                        )}
                    </CardContent>

                    {step === 1 && (
                        <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
                            <div className="text-sm text-gray-500">All times are in your local timezone</div>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    )
}
