"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, ChevronRight, X } from 'lucide-
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

interface OnboardingWidgetProps {
    completedSteps: number
    totalSteps: number
}

export default function OnboardingWidget({ completedSteps, totalSteps }: OnboardingWidgetProps) {
    const [isOpen, setIsOpen] = useState(true)
    const progress = (completedSteps / totalSteps) * 100
    const organizationSlug = useOrganizationSlug()

    if (!isOpen) {
        return (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="fixed top-20 right-4 z-50">
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full shadow-md bg-background"
                    onClick={() => setIsOpen(true)}
                >
                    <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                    Complete Setup
                </Button>
            </motion.div>
        )
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="fixed top-20 right-4 z-50 w-80 bg-background border rounded-lg shadow-lg overflow-hidden"
                >
                    <div className="p-4 flex items-center justify-between border-b">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">Complete Your Setup</h3>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </div>

                    <div className="p-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                                {completedSteps} of {totalSteps} steps completed
                            </span>
                            <span className="text-sm font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1 mb-2" />

                        <div className="space-y-2 mb-2">
                            <div className="flex items-start gap-2">
                                <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center ${completedSteps >= 1 ? "bg-primary" : "bg-muted"}`}
                                >
                                    {completedSteps >= 1 ? (
                                        <CheckCircle className="h-3 w-3 text-primary-foreground" />
                                    ) : (
                                        <span className="text-xs">1</span>
                                    )}
                                </div>
                                <div>
                                    <p
                                        className={`text-sm font-medium ${completedSteps >= 1 ? "text-muted-foreground line-through" : ""}`}
                                    >
                                        Business Profile
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center ${completedSteps >= 2 ? "bg-primary" : "bg-muted"}`}
                                >
                                    {completedSteps >= 2 ? (
                                        <CheckCircle className="h-3 w-3 text-primary-foreground" />
                                    ) : (
                                        <span className="text-xs">2</span>
                                    )}
                                </div>
                                <div>
                                    <p
                                        className={`text-sm font-medium ${completedSteps >= 2 ? "text-muted-foreground line-through" : ""}`}
                                    >
                                        Inventory Setup
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center ${completedSteps >= 3 ? "bg-primary" : "bg-muted"}`}
                                >
                                    {completedSteps >= 3 ? (
                                        <CheckCircle className="h-3 w-3 text-primary-foreground" />
                                    ) : (
                                        <span className="text-xs">3</span>
                                    )}
                                </div>
                                <div>
                                    <p
                                        className={`text-sm font-medium ${completedSteps >= 3 ? "text-muted-foreground line-through" : ""}`}
                                    >
                                        Payment Method
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center ${completedSteps >= 4 ? "bg-primary" : "bg-muted"}`}
                                >
                                    {completedSteps >= 4 ? (
                                        <CheckCircle className="h-3 w-3 text-primary-foreground" />
                                    ) : (
                                        <span className="text-xs">4</span>
                                    )}
                                </div>
                                <div>
                                    <p
                                        className={`text-sm font-medium ${completedSteps >= 4 ? "text-muted-foreground line-through" : ""}`}
                                    >
                                        Team Members
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button asChild className="w-full h-8 text-xs" size='sm'>
                            <Link href={`/dashboard/${organizationSlug}/onboarding`}>
                                Continue Setup
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}