"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, CheckCircle, Info, Sparkles, AlertTriangle } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

interface OnboardingBlockerProps {
    completedSteps: number
    totalSteps: number
    userRole?: string
}

export default function OnboardingBlocker({
    completedSteps,
    totalSteps,
    userRole = "retailer",
}: OnboardingBlockerProps) {
    const router = useRouter()
    const organizationSlug = useOrganizationSlug()

    const [dismissed, setDismissed] = useState(false)
    const [showWarning, setShowWarning] = useState(false)
    const progress = Math.round((completedSteps / totalSteps) * 100)

    useEffect(() => {
        const sessionDismissed = sessionStorage.getItem("onboardingDismissed")
        if (sessionDismissed === "true") {
            setDismissed(true)
        }
    }, [])

    useEffect(() => {
        if (!dismissed) {
            document.body.style.overflow = "hidden"
            const preventClick = (e: MouseEvent) => {
                const target = e.target as HTMLElement
                if (!target.closest('[data-onboarding-content="true"]')) {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowWarning(true)
                    setTimeout(() => setShowWarning(false), 3000)
                    return false
                }
            }

            document.addEventListener("click", preventClick, { capture: true })
            document.addEventListener("touchstart", preventClick as any, { capture: true })

            return () => {
                document.body.style.overflow = "auto"
                document.removeEventListener("click", preventClick, { capture: true })
                document.removeEventListener("touchstart", preventClick as any, { capture: true })
            }
        }
    }, [dismissed])

    const handleContinueSetup = () => {
        router.push(`/dashboard/${organizationSlug}/onboarding`)
    }

    const handleDismiss = () => {
        sessionStorage.setItem("onboardingDismissed", "true")
        setDismissed(true)
    }

    const getRoleMessage = () => {
        switch (userRole) {
            case "retailer":
                return "Your POS system and inventory management require proper setup."
            case "wholesaler":
                return "Your retailer management and inventory systems require proper setup."
            case "distributor":
                return "Your distribution network and warehouse management require proper setup."
            default:
                return "Your account requires proper setup to function correctly."
        }
    }

    if (dismissed) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Button onClick={() => setDismissed(false)} className="bg-emerald-700 hover:bg-emerald-900 shadow-lg">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Setup ({progress}%)
                </Button>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <AnimatePresence>
                {showWarning && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-[110]"
                    >
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Please complete onboarding to continue</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md mx-4 z-[101]"
                data-onboarding-content="true"
            >
                <Card className="border-2 border-primary/20 shadow-xl">
                    <CardContent className="p-2 space-y-2">
                        <div className="flex items-center gap-1.5">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-light">Complete Your Setup</h2>
                                <p className="text-xs text-muted-foreground">
                                    Your account needs to be configured before you can use the dashboard
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Onboarding Progress</span>
                                <span className="font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex gap-1 items-start">
                            <div className="bg-amber-100 p-1.5 rounded-full flex-shrink-0">
                                <Info className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-amber-800">Why this is important</h3>
                                <p className="text-xs text-amber-700">
                                    {getRoleMessage()} Without completing setup, key features won't work properly.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">You'll be able to:</h3>
                            <ul className="space-y-1.5">
                                <li className="text-sm flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Access all dashboard features</span>
                                </li>
                                <li className="text-sm flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Process orders and manage inventory</span>
                                </li>
                                <li className="text-sm flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>Connect with suppliers and customers</span>
                                </li>
                            </ul>
                        </div>

                        <div className="pt-2 flex flex-col gap-2">
                            <Button onClick={handleContinueSetup} size="sm" className="w-full h-7 text-xs bg-emerald-700 hover:bg-emerald-900">
                                Continue Setup
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={handleDismiss} size="sm" className="w-full h-7 text-xs">
                                I'll do this later (not recommended)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
