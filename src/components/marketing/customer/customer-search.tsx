"use client"

import { useState, useEffect, useRef } from "react"
import { Search, User, Phone, X, Award, Loader2, UserPlus, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { LoyaltyCustomer } from "@/types/loyalty"
import { searchEngine } from "@/utils/search-engine"
import { APP_BASE_API_URL } from "@/config/urls"

const loyaltyTierStyles = {
    Bronze: {
        color: "bg-amber-600",
        textColor: "text-amber-600",
        borderColor: "border-amber-600",
    },
    Silver: {
        color: "bg-slate-400",
        textColor: "text-white",
        borderColor: "border-none",
    },
    Gold: {
        color: "bg-amber-400",
        textColor: "text-amber-600",
        borderColor: "border-amber-400",
    },
    Platinum: {
        color: "bg-emerald-400",
        textColor: "text-emerald-600",
        borderColor: "border-emerald-400",
    },
}

interface CustomerSearchProps {
    onSelectCustomer: (customer: LoyaltyCustomer) => void
    recentCustomers?: LoyaltyCustomer[]
    onAddCustomer?: () => void
}

export default function CustomerSearch({ onSelectCustomer, recentCustomers = [], onAddCustomer }: CustomerSearchProps) {
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<LoyaltyCustomer[]>([])
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
    const [searchError, setSearchError] = useState<string | null>(null);


    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [])

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }
        if (query.length >= 3) {
            setIsSearching(true)
            const timeout = setTimeout(() => {
                performSearch(query)
            }, 500)

            setSearchTimeout(timeout)
        } else {
            setSearchResults([])
            setIsSearching(false)
        }
    }

    const performSearch = async (query: string) => {
        try {
            const response = await fetch(`${APP_BASE_API_URL}/loyalty/search?q=${encodeURIComponent(query)}`);
            // if (!response.ok) throw new Error('Search failed'); TODO: TO REPORTING SERVICE
            const { customers } = await response.json();
            setSearchResults(customers);
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }

    const getLoyaltyTierStyle = (tier: LoyaltyCustomer["loyaltyTier"]) => {
        return loyaltyTierStyles[tier]
    }

    return (
        <div className="p-2">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
                    <Input
                        ref={searchInputRef}
                        placeholder="Search customer :name or phone..."
                        className="pl-8 pr-10 h-9 placeholder:text-xs"
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

                <Button variant="outline" size="icon" className="h-9 w-9" onClick={onAddCustomer}>
                    <UserPlus className="h-4 w-4" />
                </Button>
            </div>
            {searchQuery.length >= 3 && (
                <div className="mt-2">
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-medium">Search Results</h2>
                        {isSearching ? (
                            <div className="flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span className="text-xs text-muted-foreground">Searching...</span>
                            </div>
                        ) : (
                            <Badge variant="outline" className="text-xs h-4 font-light mr-1">
                                {searchResults.length} found
                            </Badge>
                        )}
                    </div>

                    {searchResults.length > 0 ? (
                        <ScrollArea className="max-h-[200px]">
                            <div className="space-y-2">
                                {searchResults.map((customer) => (
                                    <Card
                                        key={customer.id}
                                        className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                                        onClick={() => onSelectCustomer(customer)}
                                    >
                                        <CardContent className="p-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1">
                                                        <h3 className="text-sm font-medium truncate">{customer.name}</h3>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs h-4 ${getLoyaltyTierStyle(customer.loyaltyTier).textColor} ${getLoyaltyTierStyle(customer.loyaltyTier).borderColor}`}
                                                        >
                                                            {customer.loyaltyTier}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center text-xs text-muted-foreground gap-2 mt-1">
                                                        <span className="flex items-center">
                                                            <Phone className="h-3 w-3 mr-1" />
                                                            {customer.phone}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Award className="h-3 w-3 mr-1" />
                                                            {customer.loyaltyPoints.pointsEarned} pts
                                                        </span>
                                                    </div>
                                                </div>

                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        !isSearching && (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <User className="h-10 w-10 text-muted-foreground/50 mb-2" />
                                <h3 className="text-sm font-medium mb-1">No customers found</h3>
                                <p className="text-xs text-muted-foreground mb-3">No customers match "{searchQuery}"</p>
                                <Button variant="outline" size="sm" onClick={onAddCustomer}>
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    Add New Customer
                                </Button>
                            </div>
                        )
                    )}
                </div>
            )}

            {!searchQuery && recentCustomers.length > 0 && (
                <div className="mt-2">
                    <h2 className="text-sm font-medium mb-2">Recent Customers</h2>
                    <ScrollArea className="h-[150px] px-3">
                        <div className="space-y-1">
                            {recentCustomers.map((customer) => (
                                <div
                                    key={customer.id}
                                    onClick={() => onSelectCustomer(customer)}
                                    className="flex items-center justify-between rounded-md border p-2 cursor-pointer hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1 text-sm font-medium">
                                                <span className="truncate">{customer.name}</span>
                                                <span className="text-muted-foreground truncate">: {customer.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs mt-0.5">
                                                <Badge
                                                    variant="outline"
                                                    className={`h-4 text-xs font-light ${getLoyaltyTierStyle(customer.loyaltyTier).textColor} ${getLoyaltyTierStyle(customer.loyaltyTier).borderColor}`}
                                                >
                                                    {customer.loyaltyTier}
                                                </Badge>
                                                <span className="text-muted-foreground">{customer.loyaltyPoints.pointsEarned} pts</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-3 w-3 text-muted-foreground ml-2" />
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    )
}
