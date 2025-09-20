"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    User,
    Phone,
    X,
    Plus,
    Award,
    Sparkles,
    Clock,
    Zap,
    ChevronRight,
    UserPlus,
    BadgePercent,
    Loader2,
    Heart,
    History,
    Gift,
    CreditCard,
    ShoppingBag,
} from "lucide-react"

import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

interface Customer {
    id: string
    name: string
    phone: string
    email?: string
    lastVisit: string
    totalSpent: number
    loyaltyPoints: number
    loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum"
    favoriteProducts: Array<{
        id: string
        name: string
        purchaseCount: number
        lastPurchased: string
    }>
    purchaseHistory: Array<{
        id: string
        date: string
        total: number
        items: number
    }>
    recommendations: Array<{
        id: string
        name: string
        reason: string
    }>
}

const mockCustomers: Customer[] = [
    {
        id: "cust_1",
        name: "John Doe",
        phone: "0712345678",
        email: "john.doe@example.com",
        lastVisit: "Yesterday",
        totalSpent: 15000,
        loyaltyPoints: 450,
        loyaltyTier: "Silver",
        favoriteProducts: [
            {
                id: "prod_1",
                name: "Jameson Irish Whiskey",
                purchaseCount: 5,
                lastPurchased: "2 weeks ago",
            },
            {
                id: "prod_2",
                name: "Johnnie Walker Black Label",
                purchaseCount: 3,
                lastPurchased: "1 month ago",
            },
        ],
        purchaseHistory: [
            {
                id: "ord_1",
                date: "Yesterday",
                total: 2500,
                items: 3,
            },
            {
                id: "ord_2",
                date: "Last week",
                total: 4200,
                items: 5,
            },
        ],
        recommendations: [
            {
                id: "rec_1",
                name: "Glenfiddich 12 Year",
                reason: "Based on whiskey preferences",
            },
            {
                id: "rec_2",
                name: "Hennessy VS",
                reason: "Popular with similar customers",
            },
        ],
    },
    {
        id: "cust_2",
        name: "Jane Smith",
        phone: "0723456789",
        email: "jane.smith@example.com",
        lastVisit: "Last week",
        totalSpent: 8500,
        loyaltyPoints: 220,
        loyaltyTier: "Bronze",
        favoriteProducts: [
            {
                id: "prod_3",
                name: "Absolut Vodka",
                purchaseCount: 4,
                lastPurchased: "3 weeks ago",
            },
        ],
        purchaseHistory: [
            {
                id: "ord_3",
                date: "Last week",
                total: 1800,
                items: 2,
            },
        ],
        recommendations: [
            {
                id: "rec_3",
                name: "Grey Goose Vodka",
                reason: "Premium upgrade from Absolut",
            },
        ],
    },
    {
        id: "cust_3",
        name: "Michael Johnson",
        phone: "0734567890",
        lastVisit: "2 days ago",
        totalSpent: 32000,
        loyaltyPoints: 980,
        loyaltyTier: "Gold",
        favoriteProducts: [
            {
                id: "prod_4",
                name: "Hennessy XO",
                purchaseCount: 2,
                lastPurchased: "1 month ago",
            },
            {
                id: "prod_5",
                name: "Dom Perignon",
                purchaseCount: 1,
                lastPurchased: "2 months ago",
            },
        ],
        purchaseHistory: [
            {
                id: "ord_4",
                date: "2 days ago",
                total: 12000,
                items: 2,
            },
            {
                id: "ord_5",
                date: "2 weeks ago",
                total: 20000,
                items: 3,
            },
        ],
        recommendations: [
            {
                id: "rec_4",
                name: "Remy Martin XO",
                reason: "Based on cognac preferences",
            },
            {
                id: "rec_5",
                name: "Macallan 18 Year",
                reason: "Premium spirits enthusiast",
            },
        ],
    },
]

const loyaltyTiers = {
    Bronze: {
        color: "bg-amber-600",
        textColor: "text-amber-600",
        borderColor: "border-amber-600",
        bgColor: "bg-amber-50 dark:bg-amber-950/20",
        minPoints: 0,
        discount: "2%",
        nextTier: "Silver",
        nextTierPoints: 300,
    },
    Silver: {
        color: "bg-slate-400",
        textColor: "text-slate-600",
        borderColor: "border-slate-400",
        bgColor: "bg-slate-50 dark:bg-slate-950/20",
        minPoints: 300,
        discount: "5%",
        nextTier: "Gold",
        nextTierPoints: 750,
    },
    Gold: {
        color: "bg-amber-400",
        textColor: "text-amber-600",
        borderColor: "border-amber-400",
        bgColor: "bg-amber-50 dark:bg-amber-950/20",
        minPoints: 750,
        discount: "8%",
        nextTier: "Platinum",
        nextTierPoints: 1500,
    },
    Platinum: {
        color: "bg-emerald-400",
        textColor: "text-emerald-600",
        borderColor: "border-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
        minPoints: 1500,
        discount: "12%",
        nextTier: null,
        nextTierPoints: null,
    },
}

export default function POSCustomerPage() {
    const isMobile = useIsMobile()
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [recentCustomers, setRecentCustomers] = useState<Customer[]>(mockCustomers)
    const [isSearching, setIsSearching] = useState(false)
    const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false)
    const [newCustomer, setNewCustomer] = useState({
        name: "",
        phone: "",
        email: "",
    })
    const [activeTab, setActiveTab] = useState("profile")
    const [showLoyaltyInfoDialog, setShowLoyaltyInfoDialog] = useState(false)

    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [])

    const handleSearch = (query: string) => {
        setSearchQuery(query)

        if (query.length >= 3) {
            setIsSearching(true)

            // Sim search delay
            setTimeout(() => {
                setIsSearching(false)
            }, 500)
        }
    }

    const findCustomerByPhone = (phone: string): Customer | undefined => {
        return mockCustomers.find((c) => c.phone === phone)
    }

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer)
        setSearchQuery("")

        // Move customer to the top of recent customers
        const updatedRecents = [customer, ...recentCustomers.filter((c) => c.id !== customer.id)]
        setRecentCustomers(updatedRecents)
    }

    const clearSelectedCustomer = () => {
        setSelectedCustomer(null)
    }

    const handleAddCustomer = () => {
        if (!newCustomer.name || !newCustomer.phone) {
            toast.error("Required fields missing", {
                description: "Name and phone number are required",
            })
            return
        }

        if (mockCustomers.some((c) => c.phone === newCustomer.phone)) {
            toast.error("Customer already exists", {
                description: "A customer with this phone number already exists",
            })
            return
        }

        const customer: Customer = {
            id: `cust_${Date.now()}`,
            name: newCustomer.name,
            phone: newCustomer.phone,
            email: newCustomer.email,
            lastVisit: "Today",
            totalSpent: 0,
            loyaltyPoints: 0,
            loyaltyTier: "Bronze",
            favoriteProducts: [],
            purchaseHistory: [],
            recommendations: [],
        }

        setRecentCustomers([customer, ...recentCustomers])

        setSelectedCustomer(customer)

        setNewCustomer({ name: "", phone: "", email: "" })
        setShowAddCustomerDialog(false)

        toast.success("Customer added", {
            description: `${customer.name} has been added successfully`,
        })
    }

    // Get loyalty tier info for a customer
    const getLoyaltyTierInfo = (tier: Customer["loyaltyTier"]) => {
        return loyaltyTiers[tier]
    }

    // Calc progress to next tier
    const calculateNextTierProgress = (customer: Customer) => {
        const currentTier = getLoyaltyTierInfo(customer.loyaltyTier)

        if (!currentTier.nextTier) return 100 // Already at max tier

        const nextTierPoints = currentTier.nextTierPoints as number
        const pointsNeeded = nextTierPoints - currentTier.minPoints
        const pointsEarned = customer.loyaltyPoints - currentTier.minPoints

        return Math.min(100, Math.round((pointsEarned / pointsNeeded) * 100))
    }

    const applyLoyaltyDiscount = () => {
        if (!selectedCustomer) return

        const tierInfo = getLoyaltyTierInfo(selectedCustomer.loyaltyTier)

        setShowLoyaltyInfoDialog(true)

        toast.success("Loyalty discount applied", {
            description: `${tierInfo.discount} discount applied to current order`,
        })
    }

    const filteredCustomers =
        searchQuery.length >= 3
            ? mockCustomers.filter(
                (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery),
            )
            : []

    return (
        <div className="max-w-5xl mx-auto flex flex-col h-screen bg-background">
            <header className="border-b bg-background z-10 sticky top-0">
                <div className="flex items-center justify-between p-3">
                    <h1 className="text-lg font-light flex items-center">
                        <Sparkles className="h-5 w-5 text-amber-500 mr-1.5" />
                        Customer Loyalty
                    </h1>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="p-3 border-b">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search customers by name or phone..."
                                className="pl-10 pr-10"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                                    onClick={() => setSearchQuery("")}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>

                        <Button variant="outline" size="icon" onClick={() => setShowAddCustomerDialog(true)}>
                            <UserPlus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {searchQuery.length >= 3 && !selectedCustomer && (
                            <motion.div
                                key="search-results"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full overflow-y-auto p-3"
                            >
                                <div className="mb-1 flex items-center justify-between">
                                    <h2 className="text-lg font-medium">Search Results</h2>
                                    {isSearching ? (
                                        <div className="flex items-center">
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            <span className="text-sm text-muted-foreground">Searching...</span>
                                        </div>
                                    ) : (
                                        <Badge className="h-4 text-xs font-light" variant="outline">{filteredCustomers.length} found</Badge>
                                    )}
                                </div>

                                {filteredCustomers.length > 0 ? (
                                    <div className="space-y-3">
                                        {filteredCustomers.map((customer) => (
                                            <Card
                                                key={customer.id}
                                                className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                                                onClick={() => handleSelectCustomer(customer)}
                                            >
                                                <CardContent className="p-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-12 w-12 border-2 border-background">
                                                            <AvatarFallback
                                                                className={`${getLoyaltyTierInfo(customer.loyaltyTier).color} text-white`}
                                                            >
                                                                {customer.name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-medium truncate">{customer.name}</h3>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`${getLoyaltyTierInfo(customer.loyaltyTier).textColor} ${getLoyaltyTierInfo(customer.loyaltyTier).borderColor}`}
                                                                >
                                                                    {customer.loyaltyTier}
                                                                </Badge>
                                                            </div>

                                                            <div className="flex items-center text-sm text-muted-foreground gap-3 mt-1">
                                                                <span className="flex items-center">
                                                                    <Phone className="h-3 w-3 mr-1" />
                                                                    {customer.phone}
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <Award className="h-3 w-3 mr-1" />
                                                                    {customer.loyaltyPoints} pts
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    !isSearching && (
                                        <div className="flex flex-col items-center justify-center h-[calc(100%-200px)] text-center">
                                            <User className="h-10 w-10 text-muted-foreground/50 mb-1" />
                                            <h3 className="text-lg font-normal mb-1">No customers found</h3>
                                            <p className="text-sm text-muted-foreground mb-1">No customers match "{searchQuery}"</p>
                                            <Button
                                                className="h-8 text-xs"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setNewCustomer({
                                                        ...newCustomer,
                                                        phone: searchQuery.match(/\d+/g)?.join("") || "",
                                                    })
                                                    setShowAddCustomerDialog(true)
                                                }}
                                            >
                                                <UserPlus className="h-4 w-4 mr-1" />
                                                Add New Customer
                                            </Button>
                                        </div>
                                    )
                                )}
                            </motion.div>
                        )}
                        {selectedCustomer && (
                            <motion.div
                                key="customer-profile"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="h-full overflow-hidden flex flex-col">
                                <div className={`p-1 ${getLoyaltyTierInfo(selectedCustomer.loyaltyTier).bgColor}`}>
                                    <div className="flex items-start">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 mr-2 -ml-2" onClick={clearSelectedCustomer}>
                                            <X className="h-4 w-4" />
                                        </Button>

                                        <Avatar className="h-12 w-12 border-2 border-background">
                                            <AvatarFallback
                                                className={`${getLoyaltyTierInfo(selectedCustomer.loyaltyTier).color} text-white`}
                                            >
                                                {selectedCustomer.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="ml-2 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-xl font-light truncate">{selectedCustomer.name}</h2>
                                                <Badge
                                                    className={`text-xs font-light h-4 ${getLoyaltyTierInfo(selectedCustomer.loyaltyTier).textColor} ${getLoyaltyTierInfo(selectedCustomer.loyaltyTier).bgColor} border ${getLoyaltyTierInfo(selectedCustomer.loyaltyTier).borderColor}`}
                                                >
                                                    {selectedCustomer.loyaltyTier}
                                                </Badge>
                                            </div>

                                            <div className="text-xs flex items-center text-muted-foreground gap-3 mt-1">
                                                <span className="flex items-center">
                                                    <Phone className="h-3 w-3 mr-1" />
                                                    {selectedCustomer.phone}
                                                </span>
                                                <span className="flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {selectedCustomer.lastVisit}
                                                </span>
                                            </div>

                                            <div className="mt-1 flex items-center">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs flex items-center">
                                                            <Award className="h-3 w-3 mr-1" />
                                                            {selectedCustomer.loyaltyPoints} points
                                                        </span>

                                                        {getLoyaltyTierInfo(selectedCustomer.loyaltyTier).nextTier && (
                                                            <span className="text-xs">
                                                                {calculateNextTierProgress(selectedCustomer)}% to{" "}
                                                                {getLoyaltyTierInfo(selectedCustomer.loyaltyTier).nextTier}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {getLoyaltyTierInfo(selectedCustomer.loyaltyTier).nextTier ? (
                                                        <div className="w-full bg-background/50 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className={`h-full ${getLoyaltyTierInfo(selectedCustomer.loyaltyTier).color}`}
                                                                style={{ width: `${calculateNextTierProgress(selectedCustomer)}%` }}
                                                            ></div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full bg-background/50 rounded-full h-1.5 overflow-hidden">
                                                            <div className="h-full bg-emerald-400 w-full"></div>
                                                        </div>
                                                    )}
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 ml-2"
                                                    onClick={() => setShowLoyaltyInfoDialog(true)}
                                                >
                                                    <BadgePercent className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 border-b flex gap-2 overflow-x-auto">
                                    <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={applyLoyaltyDiscount}>
                                        <BadgePercent className="h-3.5 w-3.5 mr-1.5" />
                                        Apply {getLoyaltyTierInfo(selectedCustomer.loyaltyTier).discount} Discount
                                    </Button>

                                    <Button onClick={() => setShowLoyaltyInfoDialog(true)} variant="outline" size="sm" className="whitespace-nowrap">
                                        <Gift className="h-3.5 w-3.5 mr-1.5" />
                                        Add Gift
                                    </Button>

                                    <Button onClick={() => setShowLoyaltyInfoDialog(true)} variant="outline" size="sm" className="whitespace-nowrap">
                                        <Award className="h-3.5 w-3.5 mr-1.5" />
                                        Add Points
                                    </Button>
                                </div>

                                <Tabs
                                    defaultValue="profile"
                                    className="flex-1 overflow-hidden flex flex-col"
                                    value={activeTab}
                                    onValueChange={setActiveTab}>
                                    <div className="px-3 pt-2 border-b">
                                        <TabsList className="w-full grid grid-cols-3">
                                            <TabsTrigger value="profile">Profile</TabsTrigger>
                                            <TabsTrigger value="favorites">Favorites</TabsTrigger>
                                            <TabsTrigger value="history">History</TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <TabsContent value="profile" className="flex-1 overflow-y-auto p-0">
                                        <ScrollArea className="h-full">
                                            <div className="p-1 space-y-2">
                                                <div>
                                                    <h3 className="text-sm font-medium mb-1 flex items-center">
                                                        <Zap className="h-4 w-4 mr-1.5 text-amber-500" />
                                                        Customer Stats
                                                    </h3>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Card className="p-1">
                                                            <CardContent className="p-1">
                                                                <div className="text-xs text-muted-foreground mb-1">Total Spent</div>
                                                                <div className="text-sm font-normal">
                                                                    KSh {selectedCustomer.totalSpent.toLocaleString()}
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        <Card className="p-1">
                                                            <CardContent className="p-1">
                                                                <div className="text-xs text-muted-foreground mb-1">Loyalty Points</div>
                                                                <div className="text-sm font-normal">{selectedCustomer.loyaltyPoints}</div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                </div>
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>

                                    <TabsContent value="favorites" className="flex-1 overflow-y-auto p-0">
                                        <ScrollArea className="h-full">
                                            <div className="p-1">
                                                <h3 className="text-sm font-medium mb-1 flex items-center">
                                                    <Heart className="h-4 w-4 mr-1.5 text-rose-500" />
                                                    Favorite Products
                                                </h3>

                                                {selectedCustomer.favoriteProducts.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {selectedCustomer.favoriteProducts.map((product) => (
                                                            <Card key={product.id} className="p-1 overflow-hidden">
                                                                <CardContent className="p-1">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <h4 className="font-normal">{product.name}</h4>
                                                                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                                                <ShoppingBag className="h-3 w-3 mr-1" />
                                                                                Purchased {product.purchaseCount} times
                                                                                <span className="mx-1">•</span>
                                                                                <Clock className="h-3 w-3 mr-1" />
                                                                                Last: {product.lastPurchased}
                                                                            </div>
                                                                        </div>
                                                                        <Button size="sm" variant="outline" className="h-7 text-xs font-light">
                                                                            <Plus className="h-3 w-3 font-light" />
                                                                            Add
                                                                        </Button>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-2">
                                                        <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-1" />
                                                        <h4 className="text-lg font-medium mb-1">No favorites yet</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            This customer hasn't purchased enough products to determine favorites
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>

                                    <TabsContent value="history" className="flex-1 overflow-y-auto p-0">
                                        <ScrollArea className="h-full">
                                            <div className="p-1">
                                                <h3 className="text-sm font-medium mb-1 flex items-center">
                                                    <History className="h-4 w-4 mr-1.5 text-blue-500" />
                                                    Purchase History
                                                </h3>

                                                {selectedCustomer.purchaseHistory.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {selectedCustomer.purchaseHistory.map((order) => (
                                                            <Card key={order.id} className="p-1 overflow-hidden">
                                                                <CardContent className="p-1">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <h4 className="text-sm font-normal">Order #{order.id.split("_")[1]}</h4>
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    {order.items} {order.items === 1 ? "item" : "items"}
                                                                                </Badge>
                                                                            </div>
                                                                            <p className="text-xs text-muted-foreground mt-1">{order.date}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="font-normal">KSh {order.total.toLocaleString()}</div>
                                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                                +{Math.round(order.total / 100)} points
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <CreditCard className="h-12 w-12 text-muted-foreground/30 mx-auto mb-1" />
                                                        <h4 className="text-lg font-medium mb-1">No purchase history</h4>
                                                        <p className="text-sm text-muted-foreground">This customer hasn't made any purchases yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>
                                </Tabs>
                            </motion.div>
                        )}
                        {!searchQuery && !selectedCustomer && (
                            <motion.div
                                key="recent-customers"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="h-full overflow-y-auto p-3"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-light">Recent Customers</h2>
                                </div>

                                <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {recentCustomers.map((customer) => (
                                        <Card
                                            key={customer.id}
                                            className="p-1 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                                            onClick={() => handleSelectCustomer(customer)}
                                        >
                                            <CardContent className="p-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-normal truncate">{customer.name}</h3>
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-xs h-4 font-light ${getLoyaltyTierInfo(customer.loyaltyTier).textColor} ${getLoyaltyTierInfo(customer.loyaltyTier).borderColor}`}
                                                            >
                                                                {customer.loyaltyTier}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
                                                            <span className="flex text-xs items-center">
                                                                <Phone className="h-3 w-3 mr-1" />
                                                                {customer.phone}
                                                            </span>
                                                            <span className="flex text-xs items-center">
                                                                <Award className="h-3 w-3 mr-1" />
                                                                {customer.loyaltyPoints} pts
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-light text-sm">Add New Customer</DialogTitle>
                    </DialogHeader>

                    <div className="py-2 space-y-2">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Name <span className="text-destructive">*</span>
                            </label>
                            <Input
                                id="name"
                                value={newCustomer.name}
                                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                placeholder="Customer name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium">
                                Phone Number <span className="text-destructive">*</span>
                            </label>
                            <Input
                                id="phone"
                                value={newCustomer.phone}
                                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                placeholder="07XX XXX XXX"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email (Optional)
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={newCustomer.email}
                                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                placeholder="customer@example.com"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button className="h-7 text-xs bg-emerald-700" onClick={handleAddCustomer}>Add Customer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={showLoyaltyInfoDialog} onOpenChange={setShowLoyaltyInfoDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-light">Loyalty Program</DialogTitle>
                    </DialogHeader>

                    <div className="py-2">
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback
                                        className={`${getLoyaltyTierInfo(selectedCustomer?.loyaltyTier || "Bronze").color} text-white`}
                                    >
                                        {selectedCustomer?.name.charAt(0) || "L"}
                                    </AvatarFallback>
                                </Avatar>

                                <div>
                                    <h3 className="font-normal">{selectedCustomer?.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                            className={`h-4 font-light text-xs ${getLoyaltyTierInfo(selectedCustomer?.loyaltyTier || "Bronze").textColor} ${getLoyaltyTierInfo(selectedCustomer?.loyaltyTier || "Bronze").borderColor}`}
                                        >
                                            {selectedCustomer?.loyaltyTier} Tier
                                        </Badge>
                                        <span className="text-xs">{selectedCustomer?.loyaltyPoints} points</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-normal mb-1">Loyalty Tiers & Benefits</h3>

                                <div className="space-y-3">
                                    {Object.entries(loyaltyTiers).map(([tier, info]) => (
                                        <div
                                            key={tier}
                                            className={`p-1.5 border rounded-md ${selectedCustomer?.loyaltyTier === tier ? info.bgColor + " border-2 " + info.borderColor : ""}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-4 w-4 rounded-full ${info.color}`}></div>
                                                    <h4 className="font-normal">{tier}</h4>
                                                </div>
                                                {/* <Badge variant="outline">{info.discount} Discount</Badge> */}
                                                <div className="text-xs text-muted-foreground mt-1">{info.minPoints}+ loyalty points</div>
                                            </div>
                                            {info.nextTier && (
                                                <div className="text-xs mt-2">
                                                    Next tier: {info.nextTier} ({info.nextTierPoints} points)
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* TODO: REFER & EARN POINTS: Bonus points for referring friends */}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
