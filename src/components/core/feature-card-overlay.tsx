"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeatureCardOverlayProps {
    userRole: string
}

export default function FeatureCardOverlay({ userRole }: FeatureCardOverlayProps) {
    const router = useRouter()

    const handleGoToOnboarding = () => {
        router.push("/onboarding")
    }

    const getMessage = () => {
        switch (userRole) {
            case "retailer":
                return "Complete onboarding to set up your POS system and inventory."
            case "wholesaler":
                return "Complete onboarding to connect with retailers and manage your inventory."
            case "distributor":
                return "Complete onboarding to set up your distribution network and warehouses."
            default:
                return "Complete onboarding to access all features."
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-lg"
        >
            <div className="text-center p-4 max-w-xs">
                <AlertCircle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
                <h3 className="text-white font-medium text-lg mb-2">Onboarding Required</h3>
                <p className="text-gray-200 text-sm mb-4">{getMessage()}</p>
                <Button onClick={handleGoToOnboarding} className="bg-primary hover:bg-primary/90 w-full">
                    Complete Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    )
}
