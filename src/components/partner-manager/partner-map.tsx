"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface PartnersMapProps {
    partners: any[]
    onPartnerClick: (partner: any) => void
}

export function PartnersMap({
    partners, onPartnerClick }: PartnersMapProps) {
    const [mapLoaded, setMapLoaded] = useState(false)

    useEffect(() => {
        // In a real implementation, this would load a map library like Google Maps or Mapbox
        // For this demo, we'll just simulate a loading delay
        const timer = setTimeout(() => {
            setMapLoaded(true)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const getTierColor = (tier: string) => {
        switch (tier) {
            case "Platinum":
                return "#0d9488" // teal-600
            case "Gold":
                return "#f59e0b" // amber-500
            case "Silver":
                return "#64748b" // slate-500
            default:
                return "#64748b" // slate-500
        }
    }

    return (
        <Card className="h-[600px] py-0 relative overflow-hidden">
            <CardContent className="p-0 py-0 h-full">
                {!mapLoaded ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                ) : (
                    <div className="relative h-full bg-slate-100">
                        {/* This would be replaced with an actual map component */}
                        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-cover bg-center opacity-50"></div>

                        {/* Partners pins */}
                        {partners.map((partner) => (
                            <div
                                key={partner.id}
                                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:z-10 hover:scale-110"
                                style={{
                                    left: `${((partner.longitude - 36.7) / 0.3) * 100}%`,
                                    top: `${((partner.latitude + 1.4) / 0.3) * 100}%`,
                                }}
                                onClick={() => onPartnerClick(partner)}
                            >
                                <div className="flex flex-col items-center">
                                    <MapPin
                                        className="h-8 w-8"
                                        style={{ color: getTierColor(partner.tier) }}
                                        fill={partner.status === "Active" ? getTierColor(partner.tier) : "transparent"}
                                    />
                                    <div className="bg-white px-2 py-1 rounded-md shadow-md text-xs font-medium mt-1 whitespace-nowrap">
                                        {partner.name}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Map legend */}
                        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-md">
                            <h4 className="text-sm font-medium mb-2">Legend</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-teal-600" fill="#0d9488" />
                                    <span className="text-xs">Platinum</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-amber-500" fill="#f59e0b" />
                                    <span className="text-xs">Gold</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-500" fill="#64748b" />
                                    <span className="text-xs">Silver</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-500" />
                                    <span className="text-xs">Inactive</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
