"use client"

import { useState, useMemo } from "react"
import { Search, Users, Network, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDiscoverOrganizations, useRelationships } from "@/hooks/use-partners-api"
import { PartnerDiscoveryTable } from "./partner-discovery-table"
import { ConnectedPartnersTable } from "./connected-partners-table"
import { PartnerFilters } from "./partner-filters"
import { usePartnerStore } from "@/stores/use-partner-store"

export function PartnerManagement() {

    const [activeTab, setActiveTab] = useState("discover")
    const { searchQuery, setSearchQuery, filters, selectedPartners, clearSelection } = usePartnerStore()
    const [selectedPartner, setSelectedPartner] = useState<any>(null)

    // API queries
    const discoverQuery = useDiscoverOrganizations({
        businessType: filters.businessType !== "all" ? filters.businessType : undefined,
        search: searchQuery || undefined,
        city: filters.city !== "all" ? filters.city : undefined,
        limit: 50,
    })

    const relationshipsQuery = useRelationships({
        status: filters.status !== "all" ? filters.status : undefined,
    })

    // Filter discovered organizations to exclude already connected ones
    const connectedPartnerIds = useMemo(() => {
        return new Set(relationshipsQuery.data?.map((rel) => rel.partnerId) || [])
    }, [relationshipsQuery.data])

    const availableOrganizations = useMemo(() => {
        return discoverQuery.data?.organizations?.filter((org) => !connectedPartnerIds.has(org.id)) || []
    }, [discoverQuery.data?.organizations, connectedPartnerIds])

    const handleConnect = (organizationId: string) => {
        // The connection is handled in the PartnerDiscoveryTable component
        // This is just for any additional UI updates
        console.log("Connecting to:", organizationId)
    }

    const handleViewPartnerDetails = (relationship: any) => {
        setSelectedPartner(relationship)
        // You can open a modal or navigate to a details page here
        console.log("View details for:", relationship)
    }

    const stats = {
        totalConnections: relationshipsQuery.data?.length || 0,
        activeConnections: relationshipsQuery.data?.filter((rel) => rel.status === "ACTIVE").length || 0,
        pendingRequests: relationshipsQuery.data?.filter((rel) => rel.status === "PENDING").length || 0,
        availableOrganizations: availableOrganizations.length,
    }

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-light tracking-tight">Partner Management</h1>
                    <p className="text-muted-foreground">Discover and connect with organizations in the Alcora network</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Card className="p-1 py-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
                        <Network className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-1 py-0">
                        <div className="text-sm">{stats.totalConnections}</div>
                    </CardContent>
                </Card>

                <Card className="p-1 py-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-1 py-0">
                        <div className="text-sm text-green-600">{stats.activeConnections}</div>
                    </CardContent>
                </Card>

                <Card className="p-1 py-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-1 py-0">
                        <div className="text-sm text-yellow-600">{stats.pendingRequests}</div>
                    </CardContent>
                </Card>

                <Card className="p-1 py-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available to Connect</CardTitle>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-1 py-0">
                        <div className="text-sm text-blue-600">{stats.availableOrganizations}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                    <TabsList className="grid w-full sm:w-auto grid-cols-2">
                        <TabsTrigger value="discover">Discover Partners</TabsTrigger>
                        <TabsTrigger value="connected">My Connections</TabsTrigger>
                    </TabsList>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1 sm:w-80">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search organizations..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <PartnerFilters showStatusFilter={activeTab === "connected"} />
                    </div>
                </div>

                <TabsContent value="discover" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Discover Organizations</CardTitle>
                            <CardDescription>Find and connect with organizations in the Alcora network</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PartnerDiscoveryTable
                                organizations={availableOrganizations}
                                isLoading={discoverQuery.isLoading}
                                onConnect={handleConnect}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="connected" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Connected Partners</CardTitle>
                            <CardDescription>Manage your existing business relationships and permissions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ConnectedPartnersTable
                                relationships={relationshipsQuery.data || []}
                                isLoading={relationshipsQuery.isLoading}
                                onViewDetails={handleViewPartnerDetails}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Bulk Actions */}
            {selectedPartners.length > 0 && (
                <Card className="fixed bottom-4 right-4 w-80 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{selectedPartners.length} selected</span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={clearSelection}>
                                    Clear
                                </Button>
                                <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                                    Bulk Connect
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
