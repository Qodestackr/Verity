"use client"
import { useState, useEffect, SetStateAction } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    ChevronLeft,
    Search,
    Filter,
    ClipboardList,
    Clock,
    CheckCircle2,
    AlertCircle,
    ShieldAlert,
    Building,
    ChevronDown,
    RefreshCw,
    MoreVertical,
    FileCheck,
    MapPin,
    Phone,
    Star,
    Download,
    Printer,
    Share2,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function AssignedOrders() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("active")
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedOrder, setExpandedOrder] = useState(null)
    const [filterOpen, setFilterOpen] = useState(false)
    const [filteredOrders, setFilteredOrders] = useState({
        active: [],
        completed: [],
        issue: [],
    })
    const [selectedPriority, setSelectedPriority] = useState("all")
    const [selectedLocation, setSelectedLocation] = useState("all")
    const [selectedClientType, setSelectedClientType] = useState("all")
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [showStatusDialog, setShowStatusDialog] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)

    // Mock data for assigned orders
    const assignedOrders = {
        active: [
            {
                id: "ORD-7829",
                clientName: "Westlands Liquor Store",
                clientType: "Retailer",
                location: "Westlands, Nairobi",
                assignedTo: {
                    id: "DRV-123",
                    name: "John Kamau",
                    imageUrl: "/placeholder.svg?height=30&width=30",
                    phone: "+254 712 345 678",
                    rating: 4.8,
                },
                assignedBy: {
                    id: "ADM-001",
                    name: "Mary Otieno",
                    role: "Route Manager",
                },
                products: [
                    { name: "Tusker Lager", quantity: 10, units: "Crates" },
                    { name: "Jameson", quantity: 5, units: "Bottles" },
                    { name: "Absolut Vodka", quantity: 8, units: "Bottles" },
                ],
                status: "in_transit",
                value: "KES 45,800",
                priority: "high",
                assignmentDate: "24 Apr, 2025",
                expectedDelivery: "24 Apr, 2025",
                timeSlot: "2:00 PM - 4:00 PM",
                auditTrail: [
                    { action: "Order Created", timestamp: "24 Apr, 8:15 AM", user: "System" },
                    { action: "Order Assigned", timestamp: "24 Apr, 8:30 AM", user: "Mary Otieno" },
                    { action: "Stock Verified", timestamp: "24 Apr, 9:00 AM", user: "Warehouse Team" },
                    { action: "Loading Started", timestamp: "24 Apr, 9:45 AM", user: "John Kamau" },
                    { action: "In Transit", timestamp: "24 Apr, 10:15 AM", user: "John Kamau" },
                ],
            },
            {
                id: "ORD-7830",
                clientName: "Kilimani Wine Shop",
                clientType: "Retailer",
                location: "Kilimani, Nairobi",
                assignedTo: {
                    id: "DRV-128",
                    name: "David Mwangi",
                    imageUrl: "/placeholder.svg?height=30&width=30",
                    phone: "+254 722 456 789",
                    rating: 4.6,
                },
                assignedBy: {
                    id: "ADM-001",
                    name: "Mary Otieno",
                    role: "Route Manager",
                },
                products: [
                    { name: "Moët & Chandon", quantity: 12, units: "Bottles" },
                    { name: "Hennessy XO", quantity: 5, units: "Bottles" },
                    { name: "Johnnie Walker Blue", quantity: 3, units: "Bottles" },
                ],
                status: "loading",
                value: "KES 128,500",
                priority: "medium",
                assignmentDate: "24 Apr, 2025",
                expectedDelivery: "24 Apr, 2025",
                timeSlot: "3:00 PM - 5:00 PM",
                auditTrail: [
                    { action: "Order Created", timestamp: "24 Apr, 8:45 AM", user: "System" },
                    { action: "Order Assigned", timestamp: "24 Apr, 9:20 AM", user: "Mary Otieno" },
                    { action: "Stock Verified", timestamp: "24 Apr, 10:30 AM", user: "Warehouse Team" },
                    { action: "Loading Started", timestamp: "24 Apr, 11:15 AM", user: "David Mwangi" },
                ],
            },
            {
                id: "ORD-7832",
                clientName: "Karen Country Club",
                clientType: "Business",
                location: "Karen, Nairobi",
                assignedTo: {
                    id: "DRV-145",
                    name: "Jane Wairimu",
                    imageUrl: "/placeholder.svg?height=30&width=30",
                    phone: "+254 733 567 890",
                    rating: 4.9,
                },
                assignedBy: {
                    id: "ADM-002",
                    name: "Peter Njoroge",
                    role: "Distribution Manager",
                },
                products: [
                    { name: "Glenfiddich 18", quantity: 12, units: "Bottles" },
                    { name: "Grey Goose", quantity: 15, units: "Bottles" },
                    { name: "Corona Beer", quantity: 20, units: "Crates" },
                    { name: "Chivas Regal", quantity: 8, units: "Bottles" },
                ],
                status: "assigned",
                value: "KES 234,000",
                priority: "urgent",
                assignmentDate: "24 Apr, 2025",
                expectedDelivery: "24 Apr, 2025",
                timeSlot: "4:00 PM - 6:00 PM",
                auditTrail: [
                    { action: "Order Created", timestamp: "24 Apr, 9:15 AM", user: "System" },
                    { action: "Order Assigned", timestamp: "24 Apr, 10:05 AM", user: "Peter Njoroge" },
                ],
            },
        ],
        completed: [
            {
                id: "ORD-7825",
                clientName: "Two Rivers Mall Liquor Shop",
                clientType: "Retailer",
                location: "Ruaka, Kiambu",
                assignedTo: {
                    id: "DRV-123",
                    name: "John Kamau",
                    imageUrl: "/placeholder.svg?height=30&width=30",
                    phone: "+254 712 345 678",
                    rating: 4.8,
                },
                assignedBy: {
                    id: "ADM-001",
                    name: "Mary Otieno",
                    role: "Route Manager",
                },
                products: [
                    { name: "Tusker Lager", quantity: 15, units: "Crates" },
                    { name: "Smirnoff Vodka", quantity: 12, units: "Bottles" },
                ],
                status: "delivered",
                value: "KES 37,500",
                priority: "medium",
                assignmentDate: "23 Apr, 2025",
                deliveryDate: "23 Apr, 2025",
                timeSlot: "2:00 PM - 4:00 PM",
                completionTime: "3:25 PM",
                receivedBy: "Samuel Kimani",
                auditTrail: [
                    { action: "Order Created", timestamp: "23 Apr, 8:15 AM", user: "System" },
                    { action: "Order Assigned", timestamp: "23 Apr, 8:45 AM", user: "Mary Otieno" },
                    { action: "Stock Verified", timestamp: "23 Apr, 9:30 AM", user: "Warehouse Team" },
                    { action: "Loading Started", timestamp: "23 Apr, 10:00 AM", user: "John Kamau" },
                    { action: "In Transit", timestamp: "23 Apr, 10:30 AM", user: "John Kamau" },
                    { action: "Delivered", timestamp: "23 Apr, 3:25 PM", user: "John Kamau" },
                    { action: "Payment Verified", timestamp: "23 Apr, 3:30 PM", user: "Finance Team" },
                ],
                deliveryNotes: "Customer requested items to be placed in the storage room",
                paymentMethod: "Corporate Account",
                invoiceNumber: "INV-2025-4587",
            },
            {
                id: "ORD-7826",
                clientName: "Garden City Mall Bar",
                clientType: "Business",
                location: "Thika Road, Nairobi",
                assignedTo: {
                    id: "DRV-128",
                    name: "David Mwangi",
                    imageUrl: "/placeholder.svg?height=30&width=30",
                    phone: "+254 722 456 789",
                    rating: 4.6,
                },
                assignedBy: {
                    id: "ADM-002",
                    name: "Peter Njoroge",
                    role: "Distribution Manager",
                },
                products: [
                    { name: "Heineken", quantity: 20, units: "Crates" },
                    { name: "Jack Daniels", quantity: 10, units: "Bottles" },
                    { name: "Bacardi Rum", quantity: 8, units: "Bottles" },
                ],
                status: "delivered",
                value: "KES 68,000",
                priority: "high",
                assignmentDate: "23 Apr, 2025",
                deliveryDate: "23 Apr, 2025",
                timeSlot: "1:00 PM - 3:00 PM",
                completionTime: "2:15 PM",
                receivedBy: "Grace Wanjiku",
                auditTrail: [
                    { action: "Order Created", timestamp: "23 Apr, 8:30 AM", user: "System" },
                    { action: "Order Assigned", timestamp: "23 Apr, 9:00 AM", user: "Peter Njoroge" },
                    { action: "Stock Verified", timestamp: "23 Apr, 9:45 AM", user: "Warehouse Team" },
                    { action: "Loading Started", timestamp: "23 Apr, 10:30 AM", user: "David Mwangi" },
                    { action: "In Transit", timestamp: "23 Apr, 11:15 AM", user: "David Mwangi" },
                    { action: "Delivered", timestamp: "23 Apr, 2:15 PM", user: "David Mwangi" },
                    { action: "Payment Verified", timestamp: "23 Apr, 2:25 PM", user: "Finance Team" },
                ],
                deliveryNotes: "Signature obtained from bar manager",
                paymentMethod: "Mobile Money",
                invoiceNumber: "INV-2025-4588",
            },
        ],
        issue: [
            {
                id: "ORD-7824",
                clientName: "Lavington Green Mall",
                clientType: "Wholesaler",
                location: "Lavington, Nairobi",
                assignedTo: {
                    id: "DRV-145",
                    name: "Jane Wairimu",
                    imageUrl: "/placeholder.svg?height=30&width=30",
                    phone: "+254 733 567 890",
                    rating: 4.9,
                },
                assignedBy: {
                    id: "ADM-001",
                    name: "Mary Otieno",
                    role: "Route Manager",
                },
                products: [
                    { name: "Martell Cognac", quantity: 8, units: "Bottles" },
                    { name: "Dom Perignon", quantity: 5, units: "Bottles" },
                    { name: "Bombay Sapphire", quantity: 12, units: "Bottles" },
                ],
                status: "issue",
                issueType: "stock_shortage",
                issueDescription: "2 bottles of Dom Perignon not available in stock",
                value: "KES 158,200",
                priority: "high",
                assignmentDate: "23 Apr, 2025",
                expectedDelivery: "23 Apr, 2025",
                timeSlot: "11:00 AM - 1:00 PM",
                auditTrail: [
                    { action: "Order Created", timestamp: "23 Apr, 7:45 AM", user: "System" },
                    { action: "Order Assigned", timestamp: "23 Apr, 8:15 AM", user: "Mary Otieno" },
                    { action: "Stock Issue Reported", timestamp: "23 Apr, 9:00 AM", user: "Warehouse Team" },
                    { action: "Issue Escalated", timestamp: "23 Apr, 9:15 AM", user: "System" },
                    { action: "Client Notified", timestamp: "23 Apr, 9:30 AM", user: "Mary Otieno" },
                ],
                resolutionStatus: "pending",
                escalatedTo: "Inventory Manager",
                estimatedResolutionTime: "24 Apr, 12:00 PM",
            },
            {
                id: "ORD-7823",
                clientName: "Rosslyn Riviera Mall",
                clientType: "Retailer",
                location: "Gigiri, Nairobi",
                assignedTo: {
                    id: "DRV-123",
                    name: "John Kamau",
                    imageUrl: "/placeholder.svg?height=30&width=30",
                    phone: "+254 712 345 678",
                    rating: 4.8,
                },
                assignedBy: {
                    id: "ADM-002",
                    name: "Peter Njoroge",
                    role: "Distribution Manager",
                },
                products: [
                    { name: "Johnnie Walker Black", quantity: 15, units: "Bottles" },
                    { name: "Baileys", quantity: 12, units: "Bottles" },
                    { name: "Corona Beer", quantity: 10, units: "Crates" },
                ],
                status: "issue",
                issueType: "vehicle_breakdown",
                issueDescription: "Vehicle broke down on Limuru Road",
                value: "KES 92,500",
                priority: "urgent",
                assignmentDate: "23 Apr, 2025",
                expectedDelivery: "23 Apr, 2025",
                timeSlot: "10:00 AM - 12:00 PM",
                auditTrail: [
                    { action: "Order Created", timestamp: "23 Apr, 7:30 AM", user: "System" },
                    { action: "Order Assigned", timestamp: "23 Apr, 8:00 AM", user: "Peter Njoroge" },
                    { action: "Stock Verified", timestamp: "23 Apr, 8:45 AM", user: "Warehouse Team" },
                    { action: "Loading Started", timestamp: "23 Apr, 9:15 AM", user: "John Kamau" },
                    { action: "In Transit", timestamp: "23 Apr, 9:45 AM", user: "John Kamau" },
                    { action: "Vehicle Breakdown Reported", timestamp: "23 Apr, 10:30 AM", user: "John Kamau" },
                    { action: "Recovery Team Dispatched", timestamp: "23 Apr, 10:45 AM", user: "Operations Team" },
                    { action: "Client Notified", timestamp: "23 Apr, 11:00 AM", user: "Peter Njoroge" },
                ],
                resolutionStatus: "in_progress",
                escalatedTo: "Fleet Manager",
                estimatedResolutionTime: "23 Apr, 2:00 PM",
            },
        ],
    }

    // Apply filters and search
    useEffect(() => {
        const applyFilters = (orders: any[]) => {
            return orders.filter((order) => {
                // Search filter
                const searchLower = searchQuery.toLowerCase()
                const matchesSearch =
                    order.id.toLowerCase().includes(searchLower) ||
                    order.clientName.toLowerCase().includes(searchLower) ||
                    order.location.toLowerCase().includes(searchLower) ||
                    order.assignedTo.name.toLowerCase().includes(searchLower)

                // Priority filter
                const matchesPriority = selectedPriority === "all" || order.priority === selectedPriority

                // Location filter
                const matchesLocation = selectedLocation === "all" || order.location.includes(selectedLocation)

                // Client type filter
                const matchesClientType = selectedClientType === "all" || order.clientType === selectedClientType

                return matchesSearch && matchesPriority && matchesLocation && matchesClientType
            })
        }

        setFilteredOrders({
            active: applyFilters(assignedOrders.active),
            completed: applyFilters(assignedOrders.completed),
            issue: applyFilters(assignedOrders.issue),
        })
    }, [searchQuery, selectedPriority, selectedLocation, selectedClientType])

    // Helper function for status badge
    const getStatusBadge = (status: any) => {
        switch (status) {
            case "assigned":
                return {
                    label: "Assigned",
                    class: "bg-blue-500/10 text-blue-500",
                }
            case "loading":
                return {
                    label: "Loading",
                    class: "bg-amber-500/10 text-amber-500",
                }
            case "in_transit":
                return {
                    label: "In Transit",
                    class: "bg-purple-500/10 text-purple-500",
                }
            case "delivered":
                return {
                    label: "Delivered",
                    class: "bg-green-500/10 text-green-500",
                }
            case "issue":
                return {
                    label: "Issue Reported",
                    class: "bg-red-500/10 text-red-500",
                }
            default:
                return {
                    label: "Unknown",
                    class: "bg-slate-500/10 text-slate-500",
                }
        }
    }

    // Helper function for priority badge
    const getPriorityBadge = (priority: any) => {
        switch (priority) {
            case "urgent":
                return {
                    label: "Urgent",
                    class: "bg-red-500/10 text-red-500",
                }
            case "high":
                return {
                    label: "High",
                    class: "bg-amber-500/10 text-amber-500",
                }
            case "medium":
                return {
                    label: "Medium",
                    class: "bg-blue-500/10 text-blue-500",
                }
            case "low":
                return {
                    label: "Low",
                    class: "bg-green-500/10 text-green-500",
                }
            default:
                return {
                    label: "Normal",
                    class: "bg-slate-500/10 text-slate-500",
                }
        }
    }

    // Helper function for issue type badge
    const getIssueTypeBadge = (issueType: any) => {
        switch (issueType) {
            case "stock_shortage":
                return {
                    label: "Stock Shortage",
                    class: "bg-amber-500/10 text-amber-500",
                }
            case "vehicle_breakdown":
                return {
                    label: "Vehicle Breakdown",
                    class: "bg-red-500/10 text-red-500",
                }
            case "client_unavailable":
                return {
                    label: "Client Unavailable",
                    class: "bg-blue-500/10 text-blue-500",
                }
            case "payment_issue":
                return {
                    label: "Payment Issue",
                    class: "bg-purple-500/10 text-purple-500",
                }
            default:
                return {
                    label: "Other Issue",
                    class: "bg-slate-500/10 text-slate-500",
                }
        }
    }

    // Toggle expanded order details
    const toggleExpandOrder = (orderId: SetStateAction<null>) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null)
        } else {
            setExpandedOrder(orderId)
        }
    }

    const handleRefresh = () => {
        setIsRefreshing(true)
        // Sim refresh delay
        setTimeout(() => {
            setIsRefreshing(false)
            toast.success("Refreshed", {
                description: "Order data has been updated",
            })
        }, 1000)
    }

    const handleStatusUpdate = (order: any, newStatus: any) => {
        // update the status backends
        toast.success("Status Updated", {
            description: `Order ${order.id} status changed to ${newStatus}`,
        })
        setShowStatusDialog(false)
    }

    const resetFilters = () => {
        setSelectedPriority("all")
        setSelectedLocation("all")
        setSelectedClientType("all")
        setSearchQuery("")
    }

    return (
        <div className="container max-w-md mx-auto p-4">
            <div className="flex items-center mb-6">
                <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-normal">Assigned Orders</h1>
            </div>

            {/* Search and filter */}
            <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search orders..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFilterOpen(!filterOpen)}
                    className={filterOpen ? "bg-muted" : ""}
                >
                    <Filter className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className={isRefreshing ? "animate-spin" : ""}
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Filter options (conditionally displayed) */}
            {filterOpen && (
                <Card className="mb-4 border border-muted">
                    <CardContent className="p-3 space-y-3">
                        <div className="flex items-center justify-between text-sm font-medium">
                            <span>Filters</span>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={resetFilters}>
                                Reset
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Priority</label>
                                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Priorities</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium">Location</label>
                                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Locations</SelectItem>
                                        <SelectItem value="Nairobi">Nairobi</SelectItem>
                                        <SelectItem value="Kiambu">Kiambu</SelectItem>
                                        <SelectItem value="Westlands">Westlands</SelectItem>
                                        <SelectItem value="Karen">Karen</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium">Client Type</label>
                                <Select value={selectedClientType} onValueChange={setSelectedClientType}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Select client type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="Retailer">Retailer</SelectItem>
                                        <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                                        <SelectItem value="Business">Business</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                            <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-muted"
                                onClick={() => setSearchQuery("Today")}
                            >
                                Today
                            </Badge>
                            <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-muted"
                                onClick={() => setSelectedPriority("high")}
                            >
                                High Priority
                            </Badge>
                            <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-muted"
                                onClick={() => setSelectedLocation("Nairobi")}
                            >
                                Nairobi CBD
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="flex flex-col items-center justify-center p-3 rounded-md bg-blue-500/10">
                    <div className="text-xs text-muted-foreground mb-1">Active</div>
                    <div className="text-xl font-bold text-blue-500">{filteredOrders.active.length}</div>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-md bg-green-500/10">
                    <div className="text-xs text-muted-foreground mb-1">Completed</div>
                    <div className="text-xl font-bold text-green-500">{filteredOrders.completed.length}</div>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-md bg-red-500/10">
                    <div className="text-xs text-muted-foreground mb-1">Issues</div>
                    <div className="text-xl font-bold text-red-500">{filteredOrders.issue.length}</div>
                </div>
            </div>

            {/* Orders Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="active" className="text-xs">
                        Active Orders
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs">
                        Completed
                    </TabsTrigger>
                    <TabsTrigger value="issue" className="text-xs">
                        Issues
                    </TabsTrigger>
                </TabsList>

                {/* Active Orders Tab */}
                <TabsContent value="active">
                    <div className="space-y-4">
                        {filteredOrders.active.map((order) => {
                            const statusBadge = getStatusBadge(order.status)
                            const priorityBadge = getPriorityBadge(order.priority)
                            const isExpanded = order.id === expandedOrder

                            return (
                                <Card
                                    key={order.id}
                                    className={`border-l-4 ${order.priority === "urgent"
                                        ? "border-l-red-500"
                                        : order.priority === "high"
                                            ? "border-l-amber-500"
                                            : "border-l-blue-500"
                                        }`}
                                >
                                    <CardHeader className="p-4 pb-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-base">{order.id}</CardTitle>
                                                    <Badge className={statusBadge.class}>{statusBadge.label}</Badge>
                                                </div>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <Building className="h-3 w-3" />
                                                    {order.clientName} ({order.clientType})
                                                </CardDescription>
                                            </div>
                                            <Badge className={priorityBadge.class}>{priorityBadge.label}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage
                                                        src={order.assignedTo.imageUrl || "/placeholder.svg"}
                                                        alt={order.assignedTo.name}
                                                    />
                                                    <AvatarFallback>{order.assignedTo.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-sm">{order.assignedTo.name}</div>
                                            </div>
                                            <div className="text-sm font-medium">{order.value}</div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{order.timeSlot}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span>{order.location}</span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full mt-3 text-xs justify-between"
                                            onClick={() => toggleExpandOrder(order.id)}
                                        >
                                            {isExpanded ? "Hide Details" : "View Details"}
                                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                        </Button>

                                        {isExpanded && (
                                            <div className="mt-3 pt-3 border-t text-sm">
                                                <div className="font-medium mb-2">Order Details</div>
                                                <div className="space-y-2 mb-4">
                                                    {order.products.map((product, idx) => (
                                                        <div key={idx} className="flex justify-between text-xs">
                                                            <span>{product.name}</span>
                                                            <span>
                                                                {product.quantity} {product.units}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="font-medium mb-2">Assignment Info</div>
                                                <div className="space-y-1 text-xs mb-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Assigned By:</span>
                                                        <span>{order.assignedBy.name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Assignment Date:</span>
                                                        <span>{order.assignmentDate}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Expected Delivery:</span>
                                                        <span>{order.expectedDelivery}</span>
                                                    </div>
                                                </div>

                                                <div className="font-medium mb-2">Driver Info</div>
                                                <div className="space-y-1 text-xs mb-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Driver ID:</span>
                                                        <span>{order.assignedTo.id}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Phone:</span>
                                                        <span>{order.assignedTo.phone}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Rating:</span>
                                                        <span className="flex items-center">
                                                            {order.assignedTo.rating}
                                                            <Star className="h-3 w-3 fill-amber-500 text-amber-500 ml-1" />
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="font-medium mb-2">Audit Trail</div>
                                                <div className="space-y-2">
                                                    {order.auditTrail.map((event, idx) => (
                                                        <div key={idx} className="flex items-start gap-2">
                                                            <div className="h-4 w-4 rounded-full bg-blue-500/10 flex items-center justify-center mt-0.5">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="font-medium">{event.action}</span>
                                                                    <span className="text-muted-foreground">{event.timestamp}</span>
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">by {event.user}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="p-0">
                                        <div className="grid grid-cols-2 w-full border-t">
                                            <Button
                                                variant="ghost"
                                                className="py-2 h-10 rounded-none border-r flex gap-1"
                                                onClick={() => {
                                                    setSelectedOrder(order)
                                                    setShowStatusDialog(true)
                                                }}
                                            >
                                                <FileCheck className="h-4 w-4" />
                                                <span className="text-xs">Update Status</span>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="py-2 h-10 rounded-none flex gap-1">
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="text-xs">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <Share2 className="h-4 w-4 mr-2" />
                                                        Share Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Printer className="h-4 w-4 mr-2" />
                                                        Print Order
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardFooter>
                                </Card>
                            )
                        })}

                        {filteredOrders.active.length === 0 && (
                            <div className="text-center py-8">
                                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                <h3 className="text-lg font-medium">No active orders found</h3>
                                <p className="text-sm text-muted-foreground">Try adjusting your filters or search criteria</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Completed Orders Tab */}
                <TabsContent value="completed">
                    <div className="space-y-4">
                        {filteredOrders.completed.map((order) => {
                            const statusBadge = getStatusBadge(order.status)
                            const priorityBadge = getPriorityBadge(order.priority)
                            const isExpanded = order.id === expandedOrder

                            return (
                                <Card key={order.id} className="border-l-4 border-l-green-500">
                                    <CardHeader className="p-4 pb-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-base">{order.id}</CardTitle>
                                                    <Badge className={statusBadge.class}>{statusBadge.label}</Badge>
                                                </div>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <Building className="h-3 w-3" />
                                                    {order.clientName} ({order.clientType})
                                                </CardDescription>
                                            </div>
                                            <div className="text-xs text-muted-foreground">Completed: {order.completionTime}</div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage
                                                        src={order.assignedTo.imageUrl || "/placeholder.svg"}
                                                        alt={order.assignedTo.name}
                                                    />
                                                    <AvatarFallback>{order.assignedTo.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-sm">{order.assignedTo.name}</div>
                                            </div>
                                            <div className="text-sm font-medium">{order.value}</div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                <span>Received by: {order.receivedBy}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span>{order.location}</span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full mt-3 text-xs justify-between"
                                            onClick={() => toggleExpandOrder(order.id)}
                                        >
                                            {isExpanded ? "Hide Details" : "View Details"}
                                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                        </Button>

                                        {isExpanded && (
                                            <div className="mt-3 pt-3 border-t text-sm">
                                                <div className="font-medium mb-2">Order Details</div>
                                                <div className="space-y-2 mb-4">
                                                    {order.products.map((product, idx) => (
                                                        <div key={idx} className="flex justify-between text-xs">
                                                            <span>{product.name}</span>
                                                            <span>
                                                                {product.quantity} {product.units}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="font-medium mb-2">Delivery Info</div>
                                                <div className="space-y-1 text-xs mb-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Delivery Date:</span>
                                                        <span>{order.deliveryDate}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Completion Time:</span>
                                                        <span>{order.completionTime}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Received By:</span>
                                                        <span>{order.receivedBy}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Payment Method:</span>
                                                        <span>{order.paymentMethod}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Invoice:</span>
                                                        <span>{order.invoiceNumber}</span>
                                                    </div>
                                                </div>

                                                {order.deliveryNotes && (
                                                    <div className="mb-4">
                                                        <div className="font-medium mb-1">Delivery Notes</div>
                                                        <div className="text-xs p-2 bg-muted rounded-md">{order.deliveryNotes}</div>
                                                    </div>
                                                )}

                                                <div className="font-medium mb-2">Audit Trail</div>
                                                <div className="space-y-2">
                                                    {order.auditTrail.map((event, idx) => (
                                                        <div key={idx} className="flex items-start gap-2">
                                                            <div className="h-4 w-4 rounded-full bg-green-500/10 flex items-center justify-center mt-0.5">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="font-medium">{event.action}</span>
                                                                    <span className="text-muted-foreground">{event.timestamp}</span>
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">by {event.user}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="p-0">
                                        <div className="grid grid-cols-2 w-full border-t">
                                            <Button variant="ghost" className="py-2 h-10 rounded-none border-r flex gap-1">
                                                <Download className="h-4 w-4" />
                                                <span className="text-xs">Download POD</span>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="py-2 h-10 rounded-none flex gap-1">
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="text-xs">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <Printer className="h-4 w-4 mr-2" />
                                                        Print Invoice
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Share2 className="h-4 w-4 mr-2" />
                                                        Share Details
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardFooter>
                                </Card>
                            )
                        })}

                        {filteredOrders.completed.length === 0 && (
                            <div className="text-center py-8">
                                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                <h3 className="text-lg font-medium">No completed orders found</h3>
                                <p className="text-sm text-muted-foreground">Try adjusting your filters or search criteria</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Issues Tab */}
                <TabsContent value="issue">
                    <div className="space-y-4">
                        {filteredOrders.issue.map((order) => {
                            const statusBadge = getStatusBadge(order.status)
                            const issueTypeBadge = getIssueTypeBadge(order.issueType)
                            const isExpanded = order.id === expandedOrder

                            return (
                                <Card key={order.id} className="border-l-4 border-l-red-500">
                                    <CardHeader className="p-4 pb-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-base">{order.id}</CardTitle>
                                                    <Badge className={statusBadge.class}>{statusBadge.label}</Badge>
                                                </div>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <Building className="h-3 w-3" />
                                                    {order.clientName} ({order.clientType})
                                                </CardDescription>
                                            </div>
                                            <Badge className={issueTypeBadge.class}>{issueTypeBadge.label}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage
                                                        src={order.assignedTo.imageUrl || "/placeholder.svg"}
                                                        alt={order.assignedTo.name}
                                                    />
                                                    <AvatarFallback>{order.assignedTo.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-sm">{order.assignedTo.name}</div>
                                            </div>
                                            <div className="text-sm font-medium">{order.value}</div>
                                        </div>

                                        <div className="p-2 bg-red-500/10 rounded-md text-xs text-red-700 mb-3">
                                            <AlertCircle className="h-3 w-3 inline-block mr-1" />
                                            {order.issueDescription}
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>Est. Resolution: {order.estimatedResolutionTime}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <ShieldAlert className="h-3 w-3" />
                                                <span>Escalated to: {order.escalatedTo}</span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full mt-3 text-xs justify-between"
                                            onClick={() => toggleExpandOrder(order.id)}
                                        >
                                            {isExpanded ? "Hide Details" : "View Details"}
                                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                        </Button>

                                        {isExpanded && (
                                            <div className="mt-3 pt-3 border-t text-sm">
                                                <div className="font-medium mb-2">Order Details</div>
                                                <div className="space-y-2 mb-4">
                                                    {order.products.map((product, idx) => (
                                                        <div key={idx} className="flex justify-between text-xs">
                                                            <span>{product.name}</span>
                                                            <span>
                                                                {product.quantity} {product.units}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="font-medium mb-2">Issue Details</div>
                                                <div className="space-y-1 text-xs mb-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Issue Type:</span>
                                                        <span>{issueTypeBadge.label}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Resolution Status:</span>
                                                        <span className="capitalize">{order.resolutionStatus.replace("_", " ")}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Escalated To:</span>
                                                        <span>{order.escalatedTo}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Est. Resolution:</span>
                                                        <span>{order.estimatedResolutionTime}</span>
                                                    </div>
                                                </div>

                                                <div className="font-medium mb-2">Audit Trail</div>
                                                <div className="space-y-2">
                                                    {order.auditTrail.map((event, idx) => (
                                                        <div key={idx} className="flex items-start gap-2">
                                                            <div className="h-4 w-4 rounded-full bg-red-500/10 flex items-center justify-center mt-0.5">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="font-medium">{event.action}</span>
                                                                    <span className="text-muted-foreground">{event.timestamp}</span>
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">by {event.user}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="p-0">
                                        <div className="grid grid-cols-2 w-full border-t">
                                            <Button variant="ghost" className="py-2 h-10 rounded-none border-r flex gap-1">
                                                <Phone className="h-4 w-4" />
                                                <span className="text-xs">Contact Support</span>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="py-2 h-10 rounded-none flex gap-1">
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="text-xs">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Issue Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <Phone className="h-4 w-4 mr-2" />
                                                        Call Client
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Phone className="h-4 w-4 mr-2" />
                                                        Call Driver
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <AlertCircle className="h-4 w-4 mr-2" />
                                                        Escalate Issue
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardFooter>
                                </Card>
                            )
                        })}

                        {filteredOrders.issue.length === 0 && (
                            <div className="text-center py-8">
                                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                <h3 className="text-lg font-medium">No issues found</h3>
                                <p className="text-sm text-muted-foreground">All orders are running smoothly</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Status Update Dialog */}
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Order Status</DialogTitle>
                        <DialogDescription>{selectedOrder && `Update status for order ${selectedOrder.id}`}</DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Current Status</label>
                                <div className="flex items-center gap-2">
                                    <Badge className={getStatusBadge(selectedOrder.status).class}>
                                        {getStatusBadge(selectedOrder.status).label}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">New Status</label>
                                <Select defaultValue={selectedOrder.status}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="assigned">Assigned</SelectItem>
                                        <SelectItem value="loading">Loading</SelectItem>
                                        <SelectItem value="in_transit">In Transit</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="issue">Issue Reported</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status Notes (Optional)</label>
                                <Input placeholder="Add notes about this status change" />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-between">
                        <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => handleStatusUpdate(selectedOrder, "in_transit")}>Update Status</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
