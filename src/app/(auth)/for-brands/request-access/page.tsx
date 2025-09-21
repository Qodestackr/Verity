"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, CheckCircle, Loader2, Mail, Phone, User } from "lucide-react"


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"

export default function RequestAccessPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        role: "",
        teamSize: "10-50",
        message: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleRadioChange = (value: string) => {
        setFormData((prev) => ({ ...prev, teamSize: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setStep(3) // Move to success step

        toast.success("Your request has been submitted", {
            description: "Our enterprise team will contact you within 24 hours.",
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
                        <CardTitle className="text-2xl font-light text-emerald-800">Get Enterprise Access</CardTitle>
                        <CardDescription>Complete this form to request VIP access to Verity's Brand Command Center</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {step === 1 && (
                            <motion.form
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="John"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Work Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="pl-10"
                                            placeholder="you@company.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="pl-10"
                                            placeholder="+254 712 345 678"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company">Company Name</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            className="pl-10"
                                            placeholder="EABL, KWAL, etc."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Your Role</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="pl-10"
                                            placeholder="Route-to-Market Manager, Sales Director, etc."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="button"
                                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                                        onClick={() => setStep(2)}
                                    >
                                        Continue
                                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                                    </Button>
                                </div>
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.form
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label>Team Size</Label>
                                    <RadioGroup
                                        value={formData.teamSize}
                                        onValueChange={handleRadioChange}
                                        className="grid grid-cols-2 gap-2"
                                    >
                                        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                                            <RadioGroupItem value="1-10" id="team-1-10" />
                                            <Label htmlFor="team-1-10" className="cursor-pointer">
                                                1-10 employees
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                                            <RadioGroupItem value="10-50" id="team-10-50" />
                                            <Label htmlFor="team-10-50" className="cursor-pointer">
                                                10-50 employees
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                                            <RadioGroupItem value="50-200" id="team-50-200" />
                                            <Label htmlFor="team-50-200" className="cursor-pointer">
                                                50-200 employees
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                                            <RadioGroupItem value="200+" id="team-200+" />
                                            <Label htmlFor="team-200+" className="cursor-pointer">
                                                200+ employees
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">How can we help your brand?</Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Tell us about your distribution challenges and what you're looking to achieve..."
                                        rows={4}
                                    />
                                </div>

                                <div className="bg-amber-50 border border-amber-100 rounded-md p-4 text-sm text-amber-800">
                                    <p>
                                        <strong>Note:</strong> This request is for the VIP Brand Owner access. Our enterprise team will
                                        contact you within 24 hours to discuss your specific needs.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                                        Back
                                    </Button>

                                    <Button
                                        type="submit"
                                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Request"
                                        )}
                                    </Button>
                                </div>
                            </motion.form>
                        )}

                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="py-8 text-center"
                            >
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                                </div>

                                <h3 className="text-2xl font-medium text-gray-900 mb-2">Request Received</h3>
                                <p className="text-gray-600 mb-6">
                                    Thank you for your interest in Verity's Brand Command Center. Our enterprise team will contact you
                                    within 24 hours.
                                </p>

                                <Button
                                    onClick={() => router.push("/for-brands")}
                                    className="bg-emerald-700 hover:bg-emerald-800 text-white">
                                    Go To Demo
                                </Button>
                            </motion.div>
                        )}
                    </CardContent>

                    {(step === 1 || step === 2) && (
                        <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
                            <div className="text-sm text-gray-500">Step {step} of 2</div>
                            <div className="text-sm text-gray-500">All information is kept confidential</div>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    )
}
