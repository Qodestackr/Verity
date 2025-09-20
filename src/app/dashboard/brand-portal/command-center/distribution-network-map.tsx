"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { Info, Truck, User, Warehouse } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DistributionNetworkMap({
    expanded = false }: { expanded?: boolean }) {
    const mapRef = useRef<HTMLDivElement>(null)
    const [selectedNode, setSelectedNode] = useState<number | null>(null)
    const [selectedLayer, setSelectedLayer] = useState("all")
    const [selectedRegion, setSelectedRegion] = useState("all")

    return (
        <div className={`${expanded ? "h-[600px]" : "aspect-[2/1]"} bg-white rounded-md border border-gray-100 relative`}>
            <div className="absolute top-3 left-3 z-10 flex gap-2">
                <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                    <SelectTrigger className="w-[180px] bg-white border-gray-200">
                        <SelectValue placeholder="All Layers" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Layers</SelectItem>
                        <SelectItem value="distributors">Distributors</SelectItem>
                        <SelectItem value="wholesalers">Wholesalers</SelectItem>
                        <SelectItem value="retailers">Retailers</SelectItem>
                        <SelectItem value="routes">Distribution Routes</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="w-[180px] bg-white border-gray-200">
                        <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        <SelectItem value="nairobi">Nairobi</SelectItem>
                        <SelectItem value="mombasa">Mombasa</SelectItem>
                        <SelectItem value="kisumu">Kisumu</SelectItem>
                        <SelectItem value="nakuru">Nakuru</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="absolute inset-0 p-4 pt-16">
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
                            strokeWidth="3"
                            strokeDasharray="5,5"
                            opacity="0.6"
                        />
                        <path
                            d="M400,180 L300,480"
                            fill="none"
                            stroke="#047857"
                            strokeWidth="3"
                            strokeDasharray="5,5"
                            opacity="0.6"
                        />
                        <path
                            d="M400,180 L200,300"
                            fill="none"
                            stroke="#047857"
                            strokeWidth="3"
                            strokeDasharray="5,5"
                            opacity="0.6"
                        />
                        <path
                            d="M560,300 L300,480"
                            fill="none"
                            stroke="#047857"
                            strokeWidth="3"
                            strokeDasharray="5,5"
                            opacity="0.6"
                        />

                        {/* Secondary distribution routes */}
                        <path
                            d="M400,180 L450,250 L500,220"
                            fill="none"
                            stroke="#047857"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.4"
                        />
                        <path
                            d="M200,300 L250,350 L300,320"
                            fill="none"
                            stroke="#047857"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.4"
                        />
                        <path
                            d="M300,480 L350,420 L400,450"
                            fill="none"
                            stroke="#047857"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.4"
                        />
                    </svg>

                    {/* Distribution Nodes */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="absolute left-[50%] top-[30%] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                    onClick={() => setSelectedNode(1)}
                                >
                                    <div
                                        className={`${selectedNode === 1 ? "bg-emerald-700 ring-4 ring-emerald-200" : "bg-emerald-700"
                                            } text-white rounded-full p-2 shadow-lg`}
                                    >
                                        <Warehouse className="h-6 w-6" />
                                    </div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-medium">Nairobi Distribution Center</p>
                                    <p className="text-xs">Primary Hub</p>
                                    <p className="text-xs text-emerald-600">100% Stock Levels</p>
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
                                    onClick={() => setSelectedNode(2)}
                                >
                                    <div
                                        className={`${selectedNode === 2 ? "bg-blue-600 ring-4 ring-blue-200" : "bg-blue-600"
                                            } text-white rounded-full p-2 shadow-lg`}
                                    >
                                        <Truck className="h-5 w-5" />
                                    </div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-medium">Mombasa Distributor</p>
                                    <p className="text-xs">Regional Distributor</p>
                                    <p className="text-xs text-amber-600">78% Stock Levels</p>
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
                                    onClick={() => setSelectedNode(3)}
                                >
                                    <div
                                        className={`${selectedNode === 3 ? "bg-blue-600 ring-4 ring-blue-200" : "bg-blue-600"
                                            } text-white rounded-full p-2 shadow-lg`}
                                    >
                                        <Truck className="h-5 w-5" />
                                    </div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-medium">Kisumu Distributor</p>
                                    <p className="text-xs">Regional Distributor</p>
                                    <p className="text-xs text-emerald-600">92% Stock Levels</p>
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
                                    onClick={() => setSelectedNode(4)}
                                >
                                    <div
                                        className={`${selectedNode === 4 ? "bg-purple-600 ring-4 ring-purple-200" : "bg-purple-600"
                                            } text-white rounded-full p-2 shadow-lg`}
                                    >
                                        <User className="h-5 w-5" />
                                    </div>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-medium">Nakuru Wholesaler Hub</p>
                                    <p className="text-xs">12 Active Wholesalers</p>
                                    <p className="text-xs text-red-600">58% Stock Levels</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Retailer clusters - simplified for demo */}
                    <div className="absolute left-[45%] top-[35%] transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-gray-600/20 rounded-full w-16 h-16 flex items-center justify-center">
                            <Badge className="bg-gray-100 text-gray-800">842</Badge>
                        </div>
                    </div>

                    <div className="absolute left-[65%] top-[55%] transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-gray-600/20 rounded-full w-14 h-14 flex items-center justify-center">
                            <Badge className="bg-gray-100 text-gray-800">624</Badge>
                        </div>
                    </div>

                    <div className="absolute left-[30%] top-[60%] transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-gray-600/20 rounded-full w-12 h-12 flex items-center justify-center">
                            <Badge className="bg-gray-100 text-gray-800">518</Badge>
                        </div>
                    </div>

                    <div className="absolute left-[20%] top-[40%] transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-gray-600/20 rounded-full w-10 h-10 flex items-center justify-center">
                            <Badge className="bg-gray-100 text-gray-800">412</Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected Node Detail Panel */}
            {selectedNode && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-md p-4 shadow-lg"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-medium">
                                {selectedNode === 1
                                    ? "Nairobi Distribution Center"
                                    : selectedNode === 2
                                        ? "Mombasa Distributor"
                                        : selectedNode === 3
                                            ? "Kisumu Distributor"
                                            : "Nakuru Wholesaler Hub"}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {selectedNode === 1
                                    ? "Primary Distribution Hub"
                                    : selectedNode === 2 || selectedNode === 3
                                        ? "Regional Distributor"
                                        : "Wholesaler Network"}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSelectedNode(null)}>
                            Close
                        </Button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-gray-200">
                            <CardContent className="p-3">
                                <h4 className="text-sm font-medium mb-2">Inventory Status</h4>
                                <div className="space-y-2">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm">Premium Vodka 750ml</span>
                                            <span className="text-sm font-medium">
                                                {selectedNode === 1
                                                    ? "2,450 units"
                                                    : selectedNode === 2
                                                        ? "860 units"
                                                        : selectedNode === 3
                                                            ? "1,240 units"
                                                            : "320 units"}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div
                                                className={`${selectedNode === 1 || selectedNode === 3
                                                    ? "bg-emerald-500"
                                                    : selectedNode === 2
                                                        ? "bg-amber-500"
                                                        : "bg-red-500"
                                                    } h-1.5 rounded-full`}
                                                style={{
                                                    width: `${selectedNode === 1 ? "100" : selectedNode === 2 ? "78" : selectedNode === 3 ? "92" : "58"
                                                        }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm">Craft Gin 500ml</span>
                                            <span className="text-sm font-medium">
                                                {selectedNode === 1
                                                    ? "1,850 units"
                                                    : selectedNode === 2
                                                        ? "720 units"
                                                        : selectedNode === 3
                                                            ? "980 units"
                                                            : "280 units"}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div
                                                className={`${selectedNode === 1 || selectedNode === 3
                                                    ? "bg-emerald-500"
                                                    : selectedNode === 2
                                                        ? "bg-amber-500"
                                                        : "bg-red-500"
                                                    } h-1.5 rounded-full`}
                                                style={{
                                                    width: `${selectedNode === 1 ? "100" : selectedNode === 2 ? "78" : selectedNode === 3 ? "92" : "58"
                                                        }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200">
                            <CardContent className="p-3">
                                <h4 className="text-sm font-medium mb-2">Network Status</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Connected Outlets</span>
                                        <span className="text-sm font-medium">
                                            {selectedNode === 1 ? "1,842" : selectedNode === 2 ? "624" : selectedNode === 3 ? "518" : "412"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Active Today</span>
                                        <span className="text-sm font-medium">
                                            {selectedNode === 1 ? "842" : selectedNode === 2 ? "312" : selectedNode === 3 ? "286" : "184"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Delivery Efficiency</span>
                                        <span
                                            className={`text-sm font-medium ${selectedNode === 1 || selectedNode === 3
                                                ? "text-emerald-600"
                                                : selectedNode === 2
                                                    ? "text-amber-600"
                                                    : "text-red-600"
                                                }`}
                                        >
                                            {selectedNode === 1 ? "96%" : selectedNode === 2 ? "82%" : selectedNode === 3 ? "94%" : "68%"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200">
                            <CardContent className="p-3">
                                <h4 className="text-sm font-medium mb-2">Actions</h4>
                                <div className="space-y-3">
                                    <Button size="sm" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
                                        {selectedNode === 4 ? "Restock Inventory" : "View Detailed Report"}
                                    </Button>
                                    <Button size="sm" variant="outline" className="w-full">
                                        {selectedNode === 1
                                            ? "Manage Distribution"
                                            : selectedNode === 2 || selectedNode === 3
                                                ? "Contact Distributor"
                                                : "Optimize Routes"}
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
                        <div className="w-3 h-3 rounded-full bg-emerald-700"></div>
                        <span>Distribution Centers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        <span>Regional Distributors</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                        <span>Wholesaler Hubs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                        <span>Retailer Clusters</span>
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
                            className="absolute right-3 top-20 cursor-pointer"
                        >
                            <div className="bg-blue-100 text-blue-600 rounded-full p-1">
                                <Info className="h-4 w-4" />
                            </div>
                        </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="max-w-xs">
                            <p className="font-medium mb-1">About Distribution Network Map</p>
                            <p className="text-sm">
                                This map shows your entire distribution network from warehouses to retailers. Monitor inventory levels,
                                track deliveries, and identify optimization opportunities across your supply chain.
                            </p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
