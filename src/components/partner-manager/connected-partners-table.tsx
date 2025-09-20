"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { MoreHorizontal, Building2, Calendar, CheckCircle, Clock, XCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useUpdateRelationshipStatus } from "@/hooks/use-partners-api"

interface Relationship {
    id: string
    partnerId: string
    partnerName: string
    partnerLogo?: string
    partnerBusinessType: string
    partnerLocation?: string
    status: "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED" | "ARCHIVED"
    type: string
    direction: "incoming" | "outgoing"
    permissions: Array<{
        id: string
        permissionType: string
        isGranted: boolean
        scope: string
    }>
    createdAt: string
    updatedAt: string
    notes?: string
}

interface ConnectedPartnersTableProps {
    relationships: Relationship[]
    isLoading?: boolean
    onViewDetails: (relationship: Relationship) => void
}

export function ConnectedPartnersTable({

    relationships,
    isLoading = false,
    onViewDetails,
}: ConnectedPartnersTableProps) {
    const updateStatus = useUpdateRelationshipStatus()

    const getStatusBadge = (status: string, direction: string) => {
        const statusConfig = {
            PENDING: {
                color: "bg-yellow-50 text-yellow-700 border-yellow-200",
                icon: Clock,
                text: direction === "outgoing" ? "Sent" : "Pending",
            },
            ACTIVE: {
                color: "bg-green-50 text-green-700 border-green-200",
                icon: CheckCircle,
                text: "Connected",
            },
            REJECTED: {
                color: "bg-red-50 text-red-700 border-red-200",
                icon: XCircle,
                text: "Rejected",
            },
            BLOCKED: {
                color: "bg-red-50 text-red-700 border-red-200",
                icon: XCircle,
                text: "Blocked",
            },
            ARCHIVED: {
                color: "bg-gray-50 text-gray-700 border-gray-200",
                icon: XCircle,
                text: "Archived",
            },
        }

        const config = statusConfig[status as keyof typeof statusConfig]
        const Icon = config.icon

        return (
            <Badge variant="outline" className={config.color}>
                <Icon className="h-3 w-3 mr-1" />
                {config.text}
            </Badge>
        )
    }

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

    const getPermission = (permissions: any[], type: string) => {
        return permissions.find((p) => p.permissionType === type)
    }

    const handleAcceptRequest = (relationshipId: string) => {
        updateStatus.mutate({
            id: relationshipId,
            organizationId: "cmb8b9yty000bjz1p3sp30d8d", // Replace with actual org ID
            status: "ACTIVE",
            notes: "Connection accepted",
        })
    }

    const handleRejectRequest = (relationshipId: string) => {
        updateStatus.mutate({
            id: relationshipId,
            organizationId: "cmb8b9yty000bjz1p3sp30d8d", // Replace with actual org ID
            status: "REJECTED",
            notes: "Connection rejected",
        })
    }

    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Partner</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Prices</TableHead>
                            <TableHead>Connected</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
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
                        <TableHead>Partner</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Products</TableHead>
                        <TableHead className="text-center">Prices</TableHead>
                        <TableHead>Connected</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {relationships.map((relationship) => {
                        const viewProductsPermission = getPermission(relationship.permissions, "VIEW_PRODUCTS")
                        const viewPricesPermission = getPermission(relationship.permissions, "VIEW_PRICES")

                        return (
                            <TableRow
                                key={relationship.id}
                                className="hover:bg-muted/50 cursor-pointer"
                                onClick={() => onViewDetails(relationship)}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                            {relationship.partnerLogo ? (
                                                <img
                                                    src={relationship.partnerLogo || "/placeholder.svg"}
                                                    alt={relationship.partnerName}
                                                    className="h-8 w-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                                                    <Building2 className="h-4 w-4 text-teal-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">{relationship.partnerName}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {relationship.partnerLocation || "Location not specified"}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{getBusinessTypeBadge(relationship.partnerBusinessType)}</TableCell>
                                <TableCell>{getStatusBadge(relationship.status, relationship.direction)}</TableCell>
                                <TableCell className="text-center">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <Switch
                                                        checked={viewProductsPermission?.isGranted || false}
                                                        disabled={relationship.status !== "ACTIVE"}
                                                        className="data-[state=checked]:bg-teal-600"
                                                    />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{viewProductsPermission?.isGranted ? "Can view products" : "Cannot view products"}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                                <TableCell className="text-center">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <Switch
                                                        checked={viewPricesPermission?.isGranted || false}
                                                        disabled={relationship.status !== "ACTIVE"}
                                                        className="data-[state=checked]:bg-teal-600"
                                                    />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{viewPricesPermission?.isGranted ? "Can view prices" : "Cannot view prices"}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(relationship.createdAt).toLocaleDateString()}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onViewDetails(relationship)}>View Details</DropdownMenuItem>
                                            {relationship.status === "PENDING" && relationship.direction === "incoming" && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() => handleAcceptRequest(relationship.id)}
                                                        className="text-green-600"
                                                    >
                                                        Accept Request
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleRejectRequest(relationship.id)}
                                                        className="text-red-600"
                                                    >
                                                        Reject Request
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            <DropdownMenuItem>Manage Permissions</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600">Disconnect</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}

                    {relationships.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <Building2 className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-muted-foreground">No connected partners yet</p>
                                    <p className="text-sm text-muted-foreground">
                                        Start by discovering and connecting with organizations
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
