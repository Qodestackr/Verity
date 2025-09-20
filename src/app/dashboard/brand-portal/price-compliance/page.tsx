"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { PriceComplianceMonitor } from "@/components/brand-owner/price-compliance-monitor"

export default function BrandDashboardPage() {
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1500)

        return () => clearTimeout(timer)
    }, [])


    return (
        <div className="flex h-screen bg-gray-50">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-medium">Price Compliance Monitor</h2>
                    <div className="flex items-center gap-3">
                        <Button variant="outline">Export Report</Button>
                        <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">Update Price Guidelines</Button>
                    </div>
                </div>

                <div>
                    <p>Price Compliance Overview</p>
                    <p>Monitor adherence to recommended pricing across your network</p>
                    {isLoading ? (
                        <div className="aspect-[2/1] bg-gray-100 animate-pulse rounded-md" />
                    ) : (
                        <PriceComplianceMonitor fullSize />
                    )}
                </div>
            </div>
        </div>
    )
}
