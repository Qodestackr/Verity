"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Info, MapPin, Zap } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function UndercutHeatmapView() {

    const mapRef = useRef<HTMLDivElement>(null)
    const [selectedHotspot, setSelectedHotspot] = useState<number | null>(null)
    const [mapZoom, setMapZoom] = useState(1)
    const [mapLoaded, setMapLoaded] = useState(false)

    // Simulate map loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setMapLoaded(true)
        }, 500)

        return () => clearTimeout(timer)
    }, [])

    // This would normally use a proper mapping library like Mapbox, Leaflet, or Google Maps
    // For this demo, we'll create a simplified visualization

    return (
        <div className="h-[600px] bg-white rounded-md border border-gray-100 relative">
            <div className="absolute inset-0">
                <div className="relative w-full h-full" ref={mapRef}>
                    {/* Kenya Map Background - simplified for demo */}
                    <div className="absolute inset-0 bg-gray-100">
                        <svg
                            viewBox="0 0 800 600"
                            className="w-full h-full"
                            style={{ filter: "drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.1))" }}
                        >
                            <path
                                d="M400,100 C550,150 700,300 650,450 C600,600 400,550 250,500 C100,450 150,250 250,150 C350,50 350,80 400,100 Z"
                                fill="#e5e7eb"
                                stroke="#d1d5db"
                                strokeWidth="2"
                            />
                        </svg>
                    </div>

                    {/* Heatmap Overlay */}
                    <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full">
                        {/* Heatmap gradients */}
                        <defs>
                            <radialGradient id="hotspot-severe" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
                                <stop offset="0%" stopColor="rgba(220, 38, 38, 0.8)" />
                                <stop offset="100%" stopColor="rgba(220, 38, 38, 0)" />
                            </radialGradient>
                            <radialGradient id="hotspot-moderate" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
                                <stop offset="0%" stopColor="rgba(234, 88, 12, 0.7)" />
                                <stop offset="100%" stopColor="rgba(234, 88, 12, 0)" />
                            </radialGradient>
                            <radialGradient id="hotspot-mild" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
                                <stop offset="0%" stopColor="rgba(245, 158, 11, 0.6)" />
                                <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
                            </radialGradient>
                        </defs>

                        {/* Severe hotspots */}
                        <motion.circle
                            cx="400"
                            cy="180"
                            r="60"
                            fill="url(#hotspot-severe)"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: mapLoaded ? 1 : 0, scale: mapLoaded ? 1 : 0.5 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        />
                        <motion.circle
                            cx="560"
                            cy="300"
                            r="50"
                            fill="url(#hotspot-severe)"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: mapLoaded ? 1 : 0, scale: mapLoaded ? 1 : 0.5 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        />

                        {/* Moderate hotspots */}
                        <motion.circle
                            cx="300"
                            cy="250"
                            r="70"
                            fill="url(#hotspot-moderate)"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: mapLoaded ? 1 : 0, scale: mapLoaded ? 1 : 0.5 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        />
                        <motion.circle
                            cx="500"
                            cy="450"
                            r="60"
                            fill="url(#hotspot-moderate)"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: mapLoaded ? 1 : 0, scale: mapLoaded ? 1 : 0.5 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        />
                        <motion.circle
                            cx="200"
                            cy="350"
                            r="55"
                            fill="url(#hotspot-moderate)"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: mapLoaded ? 1 : 0, scale: mapLoaded ? 1 : 0.5 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        />

                        {/* Mild hotspots */}
                        <motion.circle
                            cx="350"
                            cy="400"
                            r="80"
                            fill="url(#hotspot-mild)"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: mapLoaded ? 1 : 0, scale: mapLoaded ? 1 : 0.5 }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                        />
                        <motion.circle
                            cx="450"
                            cy="320"
                            r="65"
                            fill="url(#hotspot-mild)"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: mapLoaded ? 1 : 0, scale: mapLoaded ? 1 : 0.5 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                        />
                        <motion.circle
                            cx="250"
                            cy="180"
                            r="50"
                            fill="url(#hotspot-mild)"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: mapLoaded ? 1 : 0, scale: mapLoaded ? 1 : 0.5 }}
                            transition={{ delay: 0.9, duration: 0.8 }}
                        />
                    </svg>

                    {/* Hotspot Markers */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: mapLoaded ? 1 : 0.8, opacity: mapLoaded ? 1 : 0 }}
                                    transition={{ delay: 1.0 }}
                                    className="absolute left-[50%] top-[30%] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                    onClick={() => setSelectedHotspot(1)}
                                >
                                    <div
                                        className={`${selectedHotspot === 1 ? "bg-red-600 ring-4 ring-red-200" : "bg-red-600"
                                            } text-white rounded-full p-1 shadow-lg ${selectedHotspot === 1 ? "" : "animate-pulse"}`}
                                    >
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-red-600"></div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-medium">Nairobi Central</p>
                                    <p className="text-xs text-red-600 font-medium">Severe Price Undercutting</p>
                                    <p className="text-xs">Premium Vodka: 25% below MSRP</p>
                                    <p className="text-xs">12 retailers affected</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: mapLoaded ? 1 : 0.8, opacity: mapLoaded ? 1 : 0 }}
                                    transition={{ delay: 1.1 }}
                                    className="absolute left-[70%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                    onClick={() => setSelectedHotspot(2)}
                                >
                                    <div
                                        className={`${selectedHotspot === 2 ? "bg-red-600 ring-4 ring-red-200" : "bg-red-600"
                                            } text-white rounded-full p-1 shadow-lg ${selectedHotspot === 2 ? "" : "animate-pulse"}`}
                                    >
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-red-600"></div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-medium">Mombasa</p>
                                    <p className="text-xs text-red-600 font-medium">Severe Price Undercutting</p>
                                    <p className="text-xs">Craft Gin: 22% below MSRP</p>
                                    <p className="text-xs">8 retailers affected</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: mapLoaded ? 1 : 0.8, opacity: mapLoaded ? 1 : 0 }}
                                    transition={{ delay: 1.2 }}
                                    className="absolute left-[38%] top-[42%] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                    onClick={() => setSelectedHotspot(3)}
                                >
                                    <div
                                        className={`${selectedHotspot === 3 ? "bg-amber-600 ring-4 ring-amber-200" : "bg-amber-600"
                                            } text-white rounded-full p-1 shadow-lg ${selectedHotspot === 3 ? "" : "animate-pulse"}`}
                                    >
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-amber-600"></div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-medium">Nakuru</p>
                                    <p className="text-xs text-amber-600 font-medium">Moderate Price Undercutting</p>
                                    <p className="text-xs">Blended Whisky: 15% below MSRP</p>
                                    <p className="text-xs">6 retailers affected</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: mapLoaded ? 1 : 0.8, opacity: mapLoaded ? 1 : 0 }}
                                    transition={{ delay: 1.3 }}
                                    className="absolute left-[25%] top-[58%] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                    onClick={() => setSelectedHotspot(4)}
                                >
                                    <div
                                        className={`${selectedHotspot === 4 ? "bg-amber-600 ring-4 ring-amber-200" : "bg-amber-600"
                                            } text-white rounded-full p-1 shadow-lg ${selectedHotspot === 4 ? "" : "animate-pulse"}`}
                                    >
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-amber-600"></div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-medium">Kisumu</p>
                                    <p className="text-xs text-amber-600 font-medium">Moderate Price Undercutting</p>
                                    <p className="text-xs">Light Beer: 18% below MSRP</p>
                                    <p className="text-xs">9 retailers affected</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: mapLoaded ? 1 : 0.8, opacity: mapLoaded ? 1 : 0 }}
                                    transition={{ delay: 1.4 }}
                                    className="absolute left-[62%] top-[75%] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                    onClick={() => setSelectedHotspot(5)}
                                >
                                    <div
                                        className={`${selectedHotspot === 5 ? "bg-yellow-500 ring-4 ring-yellow-200" : "bg-yellow-500"
                                            } text-white rounded-full p-1 shadow-lg ${selectedHotspot === 5 ? "" : "animate-pulse"}`}
                                    >
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-yellow-500"></div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-medium">Malindi</p>
                                    <p className="text-xs text-yellow-600 font-medium">Mild Price Undercutting</p>
                                    <p className="text-xs">Craft Gin: 8% below MSRP</p>
                                    <p className="text-xs">4 retailers affected</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Selected Hotspot Detail Panel */}
            {selectedHotspot && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-md p-4 shadow-lg"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-medium">
                                {selectedHotspot === 1
                                    ? "Nairobi Central"
                                    : selectedHotspot === 2
                                        ? "Mombasa"
                                        : selectedHotspot === 3
                                            ? "Nakuru"
                                            : selectedHotspot === 4
                                                ? "Kisumu"
                                                : "Malindi"}{" "}
                                Hotspot
                            </h3>
                            <p className="text-sm text-gray-500">
                                {selectedHotspot === 1 || selectedHotspot === 2
                                    ? "Severe price undercutting detected"
                                    : selectedHotspot === 3 || selectedHotspot === 4
                                        ? "Moderate price undercutting detected"
                                        : "Mild price undercutting detected"}
                            </p>
                        </div>
                        <Button variant="outline" className="h-6 border-orange-900 text-xs font-normal" size="sm" onClick={() => setSelectedHotspot(null)}>
                            Close
                        </Button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-gray-200">
                            <CardContent className="p-2">
                                <h4 className="text-sm font-medium mb-2">Affected Products</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">
                                            {selectedHotspot === 1
                                                ? "Premium Vodka 750ml"
                                                : selectedHotspot === 2
                                                    ? "Craft Gin 500ml"
                                                    : selectedHotspot === 3
                                                        ? "Blended Whisky 1L"
                                                        : selectedHotspot === 4
                                                            ? "Light Beer 6-pack"
                                                            : "Craft Gin 500ml"}
                                        </span>
                                        <Badge
                                            className={`${selectedHotspot === 1 || selectedHotspot === 2
                                                ? "bg-red-100 text-red-800"
                                                : selectedHotspot === 3 || selectedHotspot === 4
                                                    ? "bg-amber-100 text-amber-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            {selectedHotspot === 1
                                                ? "25% below MSRP"
                                                : selectedHotspot === 2
                                                    ? "22% below MSRP"
                                                    : selectedHotspot === 3
                                                        ? "15% below MSRP"
                                                        : selectedHotspot === 4
                                                            ? "18% below MSRP"
                                                            : "8% below MSRP"}
                                        </Badge>
                                    </div>
                                    {selectedHotspot === 1 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Light Beer 6-pack</span>
                                            <Badge className="bg-amber-100 text-amber-800">12% below MSRP</Badge>
                                        </div>
                                    )}
                                    {selectedHotspot === 2 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Blended Whisky 1L</span>
                                            <Badge className="bg-amber-100 text-amber-800">14% below MSRP</Badge>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200">
                            <CardContent className="p-3">
                                <h4 className="text-sm font-medium mb-2">Potential Impact</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Revenue Loss</span>
                                        <span className="text-sm font-medium">
                                            {selectedHotspot === 1
                                                ? "KES 180,000/mo"
                                                : selectedHotspot === 2
                                                    ? "KES 120,000/mo"
                                                    : selectedHotspot === 3
                                                        ? "KES 85,000/mo"
                                                        : selectedHotspot === 4
                                                            ? "KES 95,000/mo"
                                                            : "KES 45,000/mo"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Affected Retailers</span>
                                        <span className="text-sm font-medium">
                                            {selectedHotspot === 1
                                                ? "12"
                                                : selectedHotspot === 2
                                                    ? "8"
                                                    : selectedHotspot === 3
                                                        ? "6"
                                                        : selectedHotspot === 4
                                                            ? "9"
                                                            : "4"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Brand Equity Impact</span>
                                        <span className="text-sm font-medium">
                                            {selectedHotspot === 1 || selectedHotspot === 2
                                                ? "High"
                                                : selectedHotspot === 3 || selectedHotspot === 4
                                                    ? "Medium"
                                                    : "Low"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200">
                            <CardContent className="p-3">
                                <h4 className="text-sm font-medium mb-2">Recommended Action</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <Zap className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">
                                            {selectedHotspot === 1
                                                ? "Deploy field team to investigate unauthorized distribution channels"
                                                : selectedHotspot === 2
                                                    ? "Contact regional distributor to enforce pricing policy"
                                                    : selectedHotspot === 3
                                                        ? "Send price compliance reminder to retailers"
                                                        : selectedHotspot === 4
                                                            ? "Schedule field team visit to key retailers"
                                                            : "Monitor situation for changes"}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span>Action Priority</span>
                                            <span className="font-medium">
                                                {selectedHotspot === 1 || selectedHotspot === 2
                                                    ? "Critical"
                                                    : selectedHotspot === 3 || selectedHotspot === 4
                                                        ? "High"
                                                        : "Medium"}
                                            </span>
                                        </div>
                                        <Progress
                                            value={
                                                selectedHotspot === 1
                                                    ? 100
                                                    : selectedHotspot === 2
                                                        ? 90
                                                        : selectedHotspot === 3
                                                            ? 75
                                                            : selectedHotspot === 4
                                                                ? 70
                                                                : 50
                                            }
                                            className={`h-1.5 ${selectedHotspot === 1 || selectedHotspot === 2
                                                ? "bg-gray-100 [&>div]:bg-red-600"
                                                : selectedHotspot === 3 || selectedHotspot === 4
                                                    ? "bg-gray-100 [&>div]:bg-amber-600"
                                                    : "bg-gray-100 [&>div]:bg-yellow-500"
                                                }`}
                                        />
                                    </div>

                                    <Button size="sm" className="w-full h-7 bg-emerald-700 hover:bg-emerald-800 text-white">
                                        Take Action
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            )}

            {/* Legend */}
            <div className="absolute top-3 right-3 bg-white border border-gray-200 rounded-md p-2 shadow-sm">
                <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-600"></div>
                        <span>Severe &gt;20% below MSRP</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                        <span>Moderate 10-20% below MSRP</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Mild 5-10% below MSRP</span>
                    </div>
                </div>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-3 right-3 bg-white border border-gray-200 rounded-md shadow-sm flex flex-col">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-none rounded-t-md border-b border-gray-200"
                    onClick={() => setMapZoom(Math.min(mapZoom + 0.2, 2))}
                >
                    +
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-none rounded-b-md"
                    onClick={() => setMapZoom(Math.max(mapZoom - 0.2, 0.5))}
                >
                    -
                </Button>
            </div>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute left-3 top-3 cursor-pointer"
                        >
                            <div className="bg-blue-100 text-blue-600 rounded-full p-1">
                                <Info className="h-4 w-4" />
                            </div>
                        </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <div className="max-w-xs">
                            <p className="font-medium mb-1">About Undercut Heatmap</p>
                            <p className="text-sm">
                                This map shows areas where your products are being sold below recommended prices. Hotspots indicate
                                potential unauthorized distribution, grey market activity, or non-compliant retailers. Click on markers
                                to see detailed information and recommended actions.
                            </p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* Alert for critical hotspots */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 rounded-md p-2 shadow-md flex items-center gap-2"
            >
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800 font-medium">2 Critical Hotspots Detected</span>
            </motion.div>
        </div>
    )
}
