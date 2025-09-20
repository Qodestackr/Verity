"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Building2, MapPin, Users, Plus } from "lucide-react"
import { usePartnerStore } from "@/stores/use-partner-store"
import { useCreateRelationship } from "@/hooks/use-partners-api"

interface Organization {
    id: string
    name: string
    businessType: string
    city?: string
    description?: string
    logo?: string
    visibilitySettings?: {
        showContactInfo: boolean
        showProducts: boolean
    }
}

interface PartnerDiscoveryTableProps {
    organizations: Organization[]
    isLoading?: boolean
    onConnect: (organizationId: string) => void
}

export function PartnerDiscoveryTable({
    organizations, isLoading = false, onConnect }: PartnerDiscoveryTableProps) {
    const { selectedPartners, togglePartnerSelection } = usePartnerStore()
    const createRelationship = useCreateRelationship()

    const getBusinessTypeBadge = (type: string) => {
        const colors = {
            DISTRIBUTOR: "bg-blue-50 text-blue-700 border-blue-200",
            WHOLESALER: "bg-green-50 text-green-700 border-green-200",
            RETAILER: "bg-purple-50 text-purple-700 border-purple-200",
            BRAND_OWNER: "bg-orange-50 text-orange-700 border-orange-200",
            OTHER: "bg-gray-50 text-gray-700 border-gray-200",
        }

        return (
            <Badge variant="outline" className={colors[type as keyof typeof colors] || colors.OTHER}>
                {type.replace("_", " ")}
            </Badge>
        )
    }

    const handleConnect = async (targetId: string, targetName: string) => {
        const relationshipData = {
            organizationId: "cmb8b9yty000bjz1p3sp30d8d", // Replace with actual org ID
            targetId,
            type: "GENERAL",
            permissions: [
                {
                    permissionType: "VIEW_PRODUCTS",
                    isGranted: true,
                    scope: "ALL",
                },
                {
                    permissionType: "VIEW_PRICES",
                    isGranted: false,
                    scope: "NONE",
                },
            ],
            notes: `Connection request to ${targetName}`,
        }

        createRelationship.mutate(relationshipData)
        onConnect(targetId)
    }

    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Organization</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Visibility</TableHead>
                            <TableHead className="w-[100px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">
                            <Checkbox
                                checked={selectedPartners.length === organizations.length && organizations.length > 0}
                                onCheckedChange={() => {
                                    if (selectedPartners.length === organizations.length) {
                                        usePartnerStore.getState().clearSelection()
                                    } else {
                                        usePartnerStore.getState().setSelectedPartners(organizations.map((org) => org.id))
                                    }
                                }}
                            />
                        </TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {organizations.map((org) => (
                        <TableRow key={org.id} className="hover:bg-muted/50">
                            <TableCell>
                                <Checkbox
                                    checked={selectedPartners.includes(org.id)}
                                    onCheckedChange={() => togglePartnerSelection(org.id)}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        {org.logo ? (
                                            <img
                                                src={org.logo || "/placeholder.svg"}
                                                alt={org.name}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                                                <Building2 className="h-4 w-4 text-teal-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium">{org.name}</div>
                                        {org.description && (
                                            <div className="text-sm text-muted-foreground line-clamp-1">{org.description}</div>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{getBusinessTypeBadge(org.businessType)}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {org.city || "Not specified"}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {org.visibilitySettings?.showProducts && (
                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                            Products
                                        </Badge>
                                    )}
                                    {org.visibilitySettings?.showContactInfo && (
                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                            Contact
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Button
                                    size="sm"
                                    onClick={() => handleConnect(org.id, org.name)}
                                    disabled={createRelationship.isPending}
                                    className="bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                    {createRelationship.isPending ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <>
                                            <Plus className="h-3 w-3 mr-1" />
                                            Connect
                                        </>
                                    )}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}

                    {organizations.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <Users className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-muted-foreground">No organizations found</p>
                                    <p className="text-sm text-muted-foreground">Try adjusting your search filters</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
