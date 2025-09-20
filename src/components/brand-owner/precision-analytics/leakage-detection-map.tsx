"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Info, MapPin } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

export function LeakageDetectionMap({
    expanded = false }: { expanded?: boolean }) {
    const mapRef = useRef<HTMLDivElement>(null)

    // This would normally use a proper mapping library like Mapbox, Leaflet, or Google Maps
    // For this demo, we'll create a simplified visualization

    return (
        <div className={`${expanded ? "h-[500px]" : "aspect-[2/1]"} bg-white rounded-md border border-gray-100 relative`}>
            <div className="absolute inset-0 p-4">
                <div className="relative w-full h-full" ref={mapRef}>
                    {/* Kenya Map Background - simplified for demo */}
                    <div className="absolute inset-0 bg-gray-100 rounded-md">
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

                    {/* Distribution Network Overlay */}
                    <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full">
                        {/* Main distribution routes */}
                        <path
                            d="M400,180 L560,300 L500,450 L300,480 L200,300 Z"
                            fill="none"
                            stroke="#047857"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.6"
                        />
                        <path
                            d="M400,180 L300,480"
                            fill="none"
                            stroke="#047857"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.6"
                        />
                        <path
                            d="M400,180 L200,300"
                            fill="none"
                            stroke="#047857"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.6"
                        />
                        <path
                            d="M560,300 L300,480"
                            fill="none"
                            stroke="#047857"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.6"
                        />
                    </svg>

                    {/* City Markers */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="absolute left-[50%] top-[30%] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                >
                                    <div className="bg-emerald-700 text-white rounded-full p-1 shadow-lg">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-emerald-700"></div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-medium">Nairobi</p>
                                    <p className="text-xs">Distribution Hub</p>
                                    <p className="text-xs">No leakage detected</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="absolute left-[70%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                >
                                    <div className="bg-red-600 text-white rounded-full p-1 shadow-lg animate-pulse">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-red-600"></div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-medium">Mombasa</p>
                                    <p className="text-xs text-red-600 font-medium">Leakage Detected</p>
                                    <p className="text-xs">Premium Vodka found in unauthorized channels</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="absolute left-[25%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                >
                                    <div className="bg-red-600 text-white rounded-full p-1 shadow-lg animate-pulse">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-red-600"></div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-medium">Kisumu</p>
                                    <p className="text-xs text-red-600 font-medium">Leakage Detected</p>
                                    <p className="text-xs">Craft Gin selling below MSRP</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="absolute left-[38%] top-[80%] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                >
                                    <div className="bg-red-600 text-white rounded-full p-1 shadow-lg animate-pulse">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-red-600"></div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-medium">Nakuru</p>
                                    <p className="text-xs text-red-600 font-medium">Leakage Detected</p>
                                    <p className="text-xs">Blended Whisky found in unauthorized outlet</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white border border-gray-200 rounded-md p-2 shadow-sm">
                <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-emerald-700"></div>
                        <span>Authorized Distribution</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-600"></div>
                        <span>Leakage Detected</span>
                    </div>
                </div>
            </div>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute right-3 top-3 cursor-pointer"
                        >
                            <div className="bg-blue-100 text-blue-600 rounded-full p-1">
                                <Info className="h-4 w-4" />
                            </div>
                        </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="max-w-xs">
                            <p className="font-medium mb-1">About Leakage Detection</p>
                            <p className="text-sm">
                                Our AI algorithms detect potential distribution leakage by analyzing pricing anomalies, unauthorized
                                sales channels, and product authenticity verification.
                            </p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <div className="absolute top-4 left-4">
                <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />3 Leakage Points Detected
                </Badge>
            </div>
        </div>
    )
}
