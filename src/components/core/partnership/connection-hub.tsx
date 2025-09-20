"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useCurrency } from "@/hooks/useCurrency";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    Plus,
    Clock,
    ShoppingBag,
    ArrowRight,
    HelpCircle,
    MapPin,
    SearchIcon,
    Store,
    SendHorizonal,
    Briefcase,
    RefreshCw,
    Building2,
    Loader2,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

// Animation variants
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
        },
    },
}

const hoverEffect = {
    rest: { scale: 1 },
    hover: {
        scale: 1.03,
        transition: {
            duration: 0.2,
            type: "tween",
            ease: "easeOut",
        },
    },
}

interface Organization {
    id: string
    name: string
    logo: string | null
    businessType: string
    city: string
    description: string
    visibilitySettings: {
        showContactInfo: boolean
        showProducts: boolean
    }
}

interface PendingRequest {
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
    notes: string
}

interface ConnectionHubProps {
    organizationId: string
}

export default function ConnectionHub({ organizationId }: ConnectionHubProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("discover")
    const queryClient = useQueryClient()

    const { data: suggestedConnections = [], isLoading: isLoadingSuggested } = useQuery({
        queryKey: ["discover-organizations", organizationId, searchQuery],
        queryFn: async () => {
            const params = new URLSearchParams({
                organizationId,
                limit: "6",
                offset: "0",
            })

            if (searchQuery) {
                params.append("search", searchQuery)
            }

            const response = await fetch(`/api/organizations/discover?${params}`)
            if (!response.ok) {
                throw new Error("Failed to fetch suggested connections")
            }
            const data = await response.json()
            return data.organizations as Organization[]
        },
        enabled: !!organizationId,
    })

    const { data: pendingRequests = [], isLoading: isLoadingPending } = useQuery({
        queryKey: ["pending-relationships", organizationId],
        queryFn: async () => {
            const response = await fetch(`/api/relationships?organizationId=${organizationId}&status=PENDING`)
            if (!response.ok) {
                throw new Error("Failed to fetch pending requests")
            }
            return response.json() as Promise<PendingRequest[]>
        },
        enabled: !!organizationId,
    })

    const createConnectionMutation = useMutation({
        mutationFn: async ({ targetId, notes }: { targetId: string; notes?: string }) => {
            const response = await fetch("/api/relationships", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    organizationId,
                    targetId,
                    type: "GENERAL",
                    notes: notes || "Connection request from Alcorabooks",
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
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to create connection")
            }

            return response.json()
        },
        onSuccess: () => {
            toast.success("Connection request sent successfully!")
            queryClient.invalidateQueries({ queryKey: ["pending-relationships", organizationId] })
            queryClient.invalidateQueries({ queryKey: ["discover-organizations", organizationId] })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to send connection request")
        },
    })

    const handleConnectionRequest = (targetId: string, partnerName: string) => {
        createConnectionMutation.mutate({
            targetId,
            notes: `Looking to build a partnership with ${partnerName}`,
        })
    }

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 1) return "Just now"
        if (diffInHours < 24) return `${diffInHours} hours ago`
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays} days ago`
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
            >
                <h1 className="text-2xl md:text-3xl font-light tracking-tight">Welcome to Alcorabooks</h1>
                <p className="text-muted-foreground text-sm">Connect with your suppliers and customers to get started</p>
            </motion.div>

            <Alert className="mb-6 bg-teal-50 border-teal-200 text-teal-800">
                <HelpCircle className="h-4 w-4 text-teal-600" />
                <AlertTitle>Getting Started</AlertTitle>
                <AlertDescription className="p-1 text-xs text-teal-700">
                    To use Alcorabooks effectively, you'll need to connect with your existing business partners. Search for them
                    below or browse suggested connections.
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="discover" className="w-full mb-6" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full md:w-auto">
                    <TabsTrigger value="discover">Discover</TabsTrigger>
                    <TabsTrigger value="pending">
                        Pending
                        {pendingRequests.length > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {pendingRequests.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="demo">Demo Features</TabsTrigger>
                </TabsList>

                {/* Search and discover tab */}
                <TabsContent value="discover" className="mt-2">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="font-normal">Find Your Business Partners</CardTitle>
                            <CardDescription>
                                Search for distributors, wholesalers or retailers you currently work with
                            </CardDescription>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by business name..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button className="bg-teal-600 hover:bg-teal-700" disabled={isLoadingSuggested}>
                                    {isLoadingSuggested ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div>
                                <h3 className="text-sm font-medium mb-1">{searchQuery ? "Search Results" : "Suggested Connections"}</h3>

                                {isLoadingSuggested ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                                        <span className="ml-2 text-sm text-muted-foreground">Finding connections...</span>
                                    </div>
                                ) : suggestedConnections.length > 0 ? (
                                    <motion.div
                                        variants={container}
                                        initial="hidden"
                                        animate="show"
                                        className="grid grid-cols-1 md:grid-cols-2 gap-2"
                                    >
                                        {suggestedConnections.map((connection) => (
                                            <motion.div key={connection.id} variants={item} whileHover="hover" initial="rest" animate="rest">
                                                <motion.div variants={hoverEffect}>
                                                    <Card className="py-0 p-1 overflow-hidden border hover:border-teal-200 hover:shadow-md transition-all duration-200">
                                                        <CardContent className="p-1">
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-12 w-12">
                                                                    <AvatarImage src={connection.logo || "/placeholder.svg"} alt={connection.name} />
                                                                    <AvatarFallback>
                                                                        <Building2 className="h-6 w-6" />
                                                                    </AvatarFallback>
                                                                </Avatar>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start gap-1 justify-between">
                                                                        <div>
                                                                            <h3 className="font-normal text-sm line-clamp-1">{connection.name}</h3>
                                                                            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                                                                <Badge variant="outline" className="h-4 text-xs font-light">
                                                                                    {connection.businessType}
                                                                                </Badge>
                                                                                <span className="text-xs">•</span>
                                                                                <span className="text-xs flex items-center">
                                                                                    <MapPin className="h-3 w-3 mr-1" />
                                                                                    {connection.city || "Kenya"}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="gap-1 h-7 text-xs border-teal-200 text-teal-700 hover:bg-teal-50"
                                                                            onClick={() => handleConnectionRequest(connection.id, connection.name)}
                                                                            disabled={createConnectionMutation.isPending}
                                                                        >
                                                                            {createConnectionMutation.isPending ? (
                                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                            ) : (
                                                                                <Plus className="h-3 w-3" />
                                                                            )}
                                                                            Request Connection
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="bg-muted inline-flex p-3 rounded-full mb-2">
                                            <SearchIcon className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <h3 className="font-medium mb-1">
                                            {searchQuery ? "No results found" : "No suggestions available"}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {searchQuery
                                                ? `No businesses found matching "${searchQuery}"`
                                                : "Try searching for specific business names or types"}
                                        </p>
                                        {searchQuery && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setSearchQuery("")}
                                                className="text-teal-600 border-teal-200 hover:bg-teal-50"
                                            >
                                                Clear search
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pending requests tab */}
                <TabsContent value="pending" className="mt-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-normal">Pending Connection Requests</CardTitle>
                            <CardDescription className="text-xs">Track the status of your connection requests</CardDescription>
                        </CardHeader>

                        <CardContent>
                            {isLoadingPending ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                                    <span className="ml-2 text-sm text-muted-foreground">Loading pending requests...</span>
                                </div>
                            ) : pendingRequests.length > 0 ? (
                                <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                                    {pendingRequests.map((request) => (
                                        <motion.div key={request.id} variants={item}>
                                            <Card className="py-0 p-1 overflow-hidden border">
                                                <CardContent className="p-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-amber-500/10 p-2 rounded-md">
                                                                <Clock className="h-4 w-4 text-amber-500" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-medium text-sm">{request.partnerName}</h3>
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Badge variant="outline" className="font-normal text-xs">
                                                                        {request.partnerBusinessType}
                                                                    </Badge>
                                                                    <span>•</span>
                                                                    <span>{request.partnerLocation || "Kenya"}</span>
                                                                    <span>•</span>
                                                                    <span className="capitalize">{request.direction}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge variant="secondary" className="mb-1">
                                                                {request.status}
                                                            </Badge>
                                                            <p className="text-xs text-muted-foreground">{getTimeAgo(request.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="text-center py-3">
                                    <div className="bg-muted inline-flex p-2 rounded-full mb-1">
                                        <SendHorizonal className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-medium mb-1">No pending requests</h3>
                                    <p className="text-sm text-muted-foreground mb-2">You haven't sent any connection requests yet</p>
                                    <Button onClick={() => setActiveTab("discover")} className="bg-teal-600 hover:bg-teal-700">
                                        Discover Partners
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Demo features tab */}
                <TabsContent value="demo" className="mt-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Experience Alcorabooks</CardTitle>
                            <CardDescription>Explore the platform features with our interactive demo</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <motion.div
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 md:grid-cols-2 gap-2"
                            >
                                <motion.div variants={item} whileHover="hover" initial="rest" animate="rest">
                                    <motion.div variants={hoverEffect}>
                                        <Card className="overflow-hidden h-full border hover:border-teal-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                                            <CardContent className="p-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="bg-teal-500/10 p-2 rounded-md">
                                                        <Store className="h-5 w-5 text-teal-600" />
                                                    </div>
                                                    <h3 className="font-medium">Interactive Ordering</h3>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Test drive ordering system with sample products and experience a hassle-free checkout.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full h-8 text-xs gap-1 border-teal-200 text-teal-700 hover:bg-teal-50"
                                                >
                                                    Try Demo
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>

                                <motion.div variants={item} whileHover="hover" initial="rest" animate="rest">
                                    <motion.div variants={hoverEffect}>
                                        <Card className="overflow-hidden h-full border hover:border-teal-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                                            <CardContent className="p-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="bg-teal-500/10 p-2 rounded-md">
                                                        <Briefcase className="h-5 w-5 text-teal-600" />
                                                    </div>
                                                    <h3 className="font-medium">Inventory Management</h3>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Track, manage, and optimize your inventory effortlessly across multiple locations in real
                                                    time.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full h-8 text-xs gap-1 border-teal-200 text-teal-700 hover:bg-teal-50"
                                                >
                                                    Try Demo
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>

                                <motion.div variants={item} whileHover="hover" initial="rest" animate="rest">
                                    <motion.div variants={hoverEffect}>
                                        <Card className="overflow-hidden h-full border hover:border-teal-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                                            <CardContent className="p-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="bg-teal-500/10 p-2 rounded-md">
                                                        <RefreshCw className="h-5 w-5 text-teal-600" />
                                                    </div>
                                                    <h3 className="font-medium">Auto-Reordering</h3>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Never run out of stock again with intelligent auto-reordering based on your sales patterns.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full h-8 text-xs gap-1 border-teal-200 text-teal-700 hover:bg-teal-50"
                                                >
                                                    Try Demo
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>

                                <motion.div variants={item} whileHover="hover" initial="rest" animate="rest">
                                    <motion.div variants={hoverEffect}>
                                        <Card className="overflow-hidden h-full border hover:border-teal-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                                            <CardContent className="p-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="bg-teal-500/10 p-2 rounded-md">
                                                        <ShoppingBag className="h-5 w-5 text-teal-600" />
                                                    </div>
                                                    <h3 className="font-medium">Analytics Dashboard</h3>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Visualize your business performance with interactive charts and actionable insights.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full h-8 text-xs gap-1 border-teal-200 text-teal-700 hover:bg-teal-50"
                                                >
                                                    Try Demo
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
