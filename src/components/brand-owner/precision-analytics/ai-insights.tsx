"use client"

import { motion } from "framer-motion"
import { ArrowRight, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AIInsights({
    onClose }: { onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-2">
                    <div className="flex items-center gap-1 mb-1">
                        <div className="bg-purple-100 p-2 rounded-full">
                            <Brain className="h-6 w-6 text-purple-700" />
                        </div>
                        <h3 className="text-lg font-normal">AI Insight Detected</h3>
                    </div>

                    <p className="text-gray-700 mb-2 text-sm">
                        Our AI has detected an unusual pattern in your SKU velocity data. Premium Vodka 750ml is showing a 24%
                        increase in Nairobi but a 5% decrease in Nakuru over the same period.
                    </p>

                    <div className="bg-amber-50 border border-amber-100 rounded-md p-2 mb-2">
                        <p className="text-sm text-amber-800">
                            <strong>Potential Cause:</strong> Distribution leakage from Nakuru to Nairobi. Our analysis shows 3
                            unauthorized retailers in Nairobi selling this product below MSRP.
                        </p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-md p-3 mb-4">
                        <p className="text-sm text-emerald-800">
                            <strong>Recommended Action:</strong> Investigate the supply chain from Highland Distributors (Nakuru) and
                            implement stricter channel controls.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Dismiss
                        </Button>
                        <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                            View Detailed Analysis
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
