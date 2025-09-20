"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Building2, ArrowRight, Clock, } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ConnectionHub from "@/components/core/partnership/connection-hub"
import { client } from "@/lib/auth-client"

interface Permission {
    id: string
    relationshipId: string
    permissionType: string
    isGranted: boolean
    scope: string
    scopeIds: string[]
    createdAt: string
    updatedAt: string
}

interface Relationship {
    id: string
    partnerId: string
    partnerName: string
    partnerLogo: string | null
    partnerBusinessType: string
    partnerLocation: string | null
    status: string
    type: string
    direction: string
    createdAt: string
    updatedAt: string
    lastInteractionAt: string | null
    notes: string
    permissions: Permission[]
}

interface PlaceOrdersClientProps {
    organizationSlug: string
    relationships: Relationship[]
}

export function PlaceOrdersClient({
    organizationSlug, relationships }: PlaceOrdersClientProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const { data: activeOrganization, isPending, isRefetching } = client.useActiveOrganization()


    // Filter partners based on search query
    const filteredPartners = relationships.filter(
        (relationship) =>
            relationship.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (relationship.partnerLocation &&
                relationship.partnerLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
            relationship.partnerBusinessType.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const handlePartnerSelect = (partnerId: string) => {
        router.push(`/dashboard/${organizationSlug}/place-orders/${partnerId}`)
    }

    const getLeadTime = (businessType: string): string => {
        switch (businessType) {
            case "DISTRIBUTOR":
                return "1-6 hrs"
            case "WHOLESALER":
                return "2-3hrs"
            default:
                return "8hrs-1 day"
        }
    }

    return (
        <div className="mx-auto py-3 max-w-5xl">
            <div className="flex flex-col space-y-2">

                {
                    filteredPartners.length === 0 ? null : <>
                        <div className="flex flex-col space-y-2">
                            <p className="text-muted-foreground">Select a distributor to place your order</p>
                        </div>

                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search distributors by name, location or type..."
                                className="pl-10 h-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </>
                }


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredPartners.map((relationship) => (
                        <Card
                            key={relationship.id}
                            className="p-1.5 overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/20"
                            onClick={() => handlePartnerSelect(relationship.partnerId)}
                        >
                            <CardContent className="p-1.5 flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                                        {relationship.partnerLogo ? (
                                            <img
                                                src={relationship.partnerLogo || "/placeholder.svg"}
                                                alt={relationship.partnerName}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <Building2 className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-normal text-sm line-clamp-1">{relationship.partnerName}</h3>
                                        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                            <span className="truncate">{relationship.partnerLocation || "--"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3 mr-1" />
                                        <span>Lead time: {getLeadTime(relationship.partnerBusinessType)}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="cursor-pointer mt-2 w-full justify-between text-xs h-8">
                                    Place Order
                                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {filteredPartners.length === 0 && (
                    <ConnectionHub organizationId={`${activeOrganization?.id}`} />
                )}
            </div>
        </div>
    )
}
