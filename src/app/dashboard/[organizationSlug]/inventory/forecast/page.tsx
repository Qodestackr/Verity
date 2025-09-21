
import { SmartForecasting } from "@/components/inventory/smart-forecasting"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Smart Inventory Forecasting | Alcora",
    description: "AI-powered inventory forecasting with event correlation",
}

export default function ForecastPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-3 p-2">
            <div>
                <h1 className="text-xl font-light tracking-tight">Smart Inventory Forecasting</h1>
                <p className="text-xs text-muted-foreground">Never run out of stock during critical sales periods</p>
            </div>

            <SmartForecasting />
        </div>
    )
}
