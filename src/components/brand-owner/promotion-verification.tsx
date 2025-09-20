"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, ChevronDown, ChevronUp, Clock, ImageIcon, MapPin, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function PromotionVerification({
    fullSize = false }: { fullSize?: boolean }) {
    const [expandedRow, setExpandedRow] = useState<number | null>(null)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const toggleRow = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id)
    }

    return (
        <div
            className={`${fullSize ? "h-[500px]" : "aspect-video"} bg-white rounded-md border border-gray-100 p-4 overflow-auto`}
        >
            <div className="flex flex-col h-full">
                <div className="mb-4">
                    <h3 className="text-lg font-medium mb-1">Promotion Execution Verification</h3>
                    <p className="text-sm text-gray-600">Visual proof of promotion implementation across outlets</p>
                </div>

                <div className="space-y-3">
                    {promotionVerifications.map((verification) => (
                        <Card
                            key={verification.id}
                            className={`border-${verification.status === "Verified" ? "green" : verification.status === "Failed" ? "red" : "amber"}-100`}
                        >
                            <CardContent className="p-0">
                                <div
                                    className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleRow(verification.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {verification.status === "Verified" ? (
                                                    <Check className="h-4 w-4 text-green-600" />
                                                ) : verification.status === "Failed" ? (
                                                    <X className="h-4 w-4 text-red-600" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-amber-600" />
                                                )}
                                                <h4 className="font-medium text-sm">{verification.retailer}</h4>
                                                <Badge
                                                    className={`bg-${verification.status === "Verified"
                                                        ? "green"
                                                        : verification.status === "Failed"
                                                            ? "red"
                                                            : "amber"
                                                        }-100 text-${verification.status === "Verified"
                                                            ? "green"
                                                            : verification.status === "Failed"
                                                                ? "red"
                                                                : "amber"
                                                        }-800`}
                                                >
                                                    {verification.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                <span className="flex items-center">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {verification.location}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm">{verification.promotion}</span>
                                                </div>
                                                <p className="text-xs text-gray-500">Verified {verification.verificationTime}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleRow(verification.id)
                                                }}
                                            >
                                                {expandedRow === verification.id ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {expandedRow === verification.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            transition={{ duration: 0.3 }}
                                            className="mt-3 pt-3 border-t border-gray-100"
                                        >
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Verified By</p>
                                                    <p className="text-sm font-medium">{verification.verifiedBy}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Verification Method</p>
                                                    <p className="text-sm">{verification.verificationMethod}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Distributor</p>
                                                    <p className="text-sm">{verification.distributor}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                                                    <p className="text-sm">{verification.notes}</p>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <p className="text-xs text-gray-500 mb-2">Verification Photos</p>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {verification.photos.map((photo, index) => (
                                                        <div
                                                            key={index}
                                                            className="aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer relative"
                                                            onClick={() => setSelectedImage(photo)}
                                                        >
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <ImageIcon className="h-6 w-6 text-gray-400" />
                                                            </div>
                                                            <img
                                                                src={photo || "/placeholder.svg"}
                                                                alt={`Verification ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {verification.status === "Failed" && (
                                                <div className="mt-3 bg-red-50 border border-red-100 rounded-md p-3">
                                                    <p className="text-sm text-red-800">
                                                        <strong>Failure Reason:</strong> {verification.failureReason}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-3 flex justify-end gap-2">
                                                <Button variant="outline" size="sm">
                                                    Dispute
                                                </Button>
                                                <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                                                    Take Action
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Image Preview Modal */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="max-w-3xl max-h-[80vh] relative">
                            <img
                                src={selectedImage || "/placeholder.svg"}
                                alt="Verification"
                                className="max-w-full max-h-[80vh] object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                                onClick={() => setSelectedImage(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const promotionVerifications = [
    {
        id: 1,
        retailer: "Downtown Spirits",
        location: "Nairobi",
        promotion: "Holiday Special 2025",
        status: "Verified",
        verificationTime: "2 hours ago",
        verifiedBy: "Field Agent #42",
        verificationMethod: "In-store visit with photo evidence",
        distributor: "Central Distributors Ltd",
        notes: "Promotion materials properly displayed at entrance and near product",
        photos: [
            "/placeholder.svg?height=200&width=200",
            "/placeholder.svg?height=200&width=200",
            "/placeholder.svg?height=200&width=200",
        ],
    },
    {
        id: 2,
        retailer: "Westlands Wine & Spirits",
        location: "Nairobi",
        promotion: "Premium Vodka Push",
        status: "Failed",
        verificationTime: "5 hours ago",
        verifiedBy: "Field Agent #28",
        verificationMethod: "In-store visit with photo evidence",
        distributor: "Central Distributors Ltd",
        notes: "Promotion materials not displayed properly",
        failureReason: "Promotional materials were not displayed. Competitor materials in prime position.",
        photos: ["/placeholder.svg?height=200&width=200", "/placeholder.svg?height=200&width=200"],
    },
    {
        id: 3,
        retailer: "Coastal Liquor Store",
        location: "Mombasa",
        promotion: "Coastal Region Focus",
        status: "Pending",
        verificationTime: "Scheduled for tomorrow",
        verifiedBy: "Not yet verified",
        verificationMethod: "Scheduled in-store visit",
        distributor: "Coastal Beverages",
        notes: "First verification for this promotion",
        photos: [],
    },
]
