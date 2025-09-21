"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X, ChevronDown, Heart, Clock, ThumbsUp, Wine, Sparkles, MapPin, Brain } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Store } from "@/types/store"

const mockStores: Store[] = [
    {
        id: "store_1",
        name: "Bottleshop By Roast",
        image: "/Evening-Glow-at-Bottleshop.png?height=400&width=600",
        rating: 98,
        reviewCount: 124,
        deliveryTime: "30-45 min",
        deliveryFee: 250,
        distance: 2.4,
        isFavorite: true,
        categories: ["Premium", "Imported"],
        tags: ["whiskey", "wine", "vodka", "gin"],
        isOpen: true,
        isFeatured: true,
        promoText: "Free delivery on orders over KSh 5,000",
    },
    {
        id: "store_2",
        name: "Nairobi Wine Gallery",
        image: "/Evening-Glow-at-Bottleshop.png?height=400&width=600",
        rating: 96,
        reviewCount: 87,
        deliveryTime: "40-55 min",
        deliveryFee: 300,
        distance: 3.8,
        isFavorite: false,
        categories: ["Wine", "Champagne"],
        tags: ["wine", "champagne", "prosecco"],
        isOpen: true,
        isNew: true,
    },
    {
        id: "store_3",
        name: "Westlands Liquor Store",
        image: "/Evening-Glow-at-Bottleshop.png?height=400&width=600",
        rating: 92,
        reviewCount: 156,
        deliveryTime: "25-40 min",
        deliveryFee: 200,
        distance: 1.5,
        isFavorite: false,
        categories: ["Local", "Imported"],
        tags: ["beer", "whiskey", "vodka"],
        isOpen: true,
        promoText: "10% off on all whiskeys",
    },
    {
        id: "store_4",
        name: "Karen Wine Emporium",
        image: "/Evening-Glow-at-Bottleshop.png?height=400&width=600",
        rating: 94,
        reviewCount: 62,
        deliveryTime: "45-60 min",
        deliveryFee: 350,
        distance: 5.2,
        isFavorite: false,
        categories: ["Premium", "Wine"],
        tags: ["wine", "champagne", "spirits"],
        isOpen: true,
    },
    {
        id: "store_5",
        name: "Kileleshwa Spirits",
        image: "/Evening-Glow-at-Bottleshop.png?height=400&width=600",
        rating: 90,
        reviewCount: 43,
        deliveryTime: "35-50 min",
        deliveryFee: 250,
        distance: 3.1,
        isFavorite: false,
        categories: ["Spirits", "Local"],
        tags: ["whiskey", "brandy", "gin"],
        isOpen: true,
    },
    {
        id: "store_6",
        name: "Lavington Wine Cellar",
        image: "/Evening-Glow-at-Bottleshop.png?height=400&width=600",
        rating: 97,
        reviewCount: 108,
        deliveryTime: "40-55 min",
        deliveryFee: 300,
        distance: 4.3,
        isFavorite: true,
        categories: ["Premium", "Wine"],
        tags: ["wine", "champagne"],
        isOpen: false,
    },
    {
        id: "store_7",
        name: "Kilimani Liquor Hub",
        image: "/Evening-Glow-at-Bottleshop.png?height=400&width=600",
        rating: 89,
        reviewCount: 76,
        deliveryTime: "30-45 min",
        deliveryFee: 250,
        distance: 2.8,
        isFavorite: false,
        categories: ["Beer", "Spirits"],
        tags: ["beer", "whiskey", "vodka"],
        isOpen: true,
        isNew: true,
    },
]

const categories = [
    { id: "all", name: "All" },
    { id: "premium", name: "Premium" },
    { id: "wine", name: "Wine" },
    { id: "spirits", name: "Spirits" },
    { id: "beer", name: "Beer" },
    { id: "imported", name: "Imported" },
    { id: "local", name: "Local" },
]

const sortOptions = [
    { id: "recommended", name: "Recommended" },
    { id: "rating", name: "Rating" },
    { id: "delivery_time", name: "Delivery Time" },
    { id: "distance", name: "Distance" },
]

export default function StoresPage() {
    const router = useRouter()

    const [searchQuery, setSearchQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState("all")
    const [activeSortOption, setActiveSortOption] = useState("recommended")
    const [showSortOptions, setShowSortOptions] = useState(false)
    const [filteredStores, setFilteredStores] = useState<Store[]>(mockStores)
    const [selectedFilters, setSelectedFilters] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Handle store selection
    const handleStoreSelect = (storeId: string) => {
        router.push(`/shop/${storeId}`)
    }

    const toggleFavorite = (storeId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setFilteredStores(
            filteredStores.map((store) => (store.id === storeId ? { ...store, isFavorite: !store.isFavorite } : store)),
        )
    }

    useEffect(() => {
        setIsLoading(true)

        // Sim loading delay
        setTimeout(() => {
            let results = [...mockStores]
            if (searchQuery) {
                results = results.filter(
                    (store) =>
                        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        store.categories.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        store.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
                )
            }

            if (activeCategory !== "all") {
                results = results.filter((store) =>
                    store.categories.some((cat) => cat.toLowerCase() === activeCategory.toLowerCase()),
                )
            }
            if (selectedFilters.length > 0) {
                if (selectedFilters.includes("open")) {
                    results = results.filter((store) => store.isOpen)
                }
                if (selectedFilters.includes("free_delivery")) {
                    results = results.filter((store) => store.deliveryFee === 0)
                }
                if (selectedFilters.includes("promotions")) {
                    results = results.filter((store) => store.promoText)
                }
            }
            switch (activeSortOption) {
                case "rating":
                    results.sort((a, b) => b.rating - a.rating)
                    break
                case "delivery_time":
                    results.sort((a, b) => {
                        const aTime = Number.parseInt(a.deliveryTime.split("-")[0])
                        const bTime = Number.parseInt(b.deliveryTime.split("-")[0])
                        return aTime - bTime
                    })
                    break
                case "distance":
                    results.sort((a, b) => a.distance - b.distance)
                    break
                default:
                    // For recommended, prioritize featured and new stores
                    results.sort((a, b) => {
                        if (a.isFeatured && !b.isFeatured) return -1
                        if (!a.isFeatured && b.isFeatured) return 1
                        if (a.isNew && !b.isNew) return -1
                        if (!a.isNew && b.isNew) return 1
                        return b.rating - a.rating
                    })
            }

            setFilteredStores(results)
            setIsLoading(false)
        }, 800)
    }, [searchQuery, activeCategory, selectedFilters, activeSortOption])
    const toggleFilter = (filter: string) => {
        setSelectedFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
    }
    const clearFilters = () => {
        setActiveCategory("all")
        setSelectedFilters([])
        setSearchQuery("")
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-background">
            <header className="sticky top-0 z-10 bg-white dark:bg-background border-b">
                <div className="px-4 pb-4 flex gap-2 justify-center items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search for stores..."
                            className="pl-10 h-8 text-xs pr-10 bg-gray-100 dark:bg-gray-800 border-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                    <Button className="h-8 text-xs" size="sm" variant="outline" onClick={() => router.push("/shop/baridi")}>
                        <Brain />
                        Baridi AI
                    </Button>
                </div>
            </header>
            <div className="bg-white dark:bg-background border-b">
                <ScrollArea className="w-full" orientation="horizontal">
                    <div className="flex p-4 space-x-2">
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                variant={activeCategory === category.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveCategory(category.id)}
                                className={activeCategory === category.id ? "bg-amber-500 hover:bg-amber-600" : ""}
                            >
                                {category.name}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>
            <div className="bg-white dark:bg-background border-b p-4 flex space-x-2">
                <div className="relative">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                        onClick={() => setShowSortOptions(!showSortOptions)}
                    >
                        Sort by <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                    {showSortOptions && (
                        <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md border p-1 z-10 w-48">
                            {sortOptions.map((option) => (
                                <Button
                                    key={option.id}
                                    variant="ghost"
                                    size="sm"
                                    className={`w-full justify-start ${activeSortOption === option.id ? "bg-amber-50 text-amber-700" : ""}`}
                                    onClick={() => {
                                        setActiveSortOption(option.id)
                                        setShowSortOptions(false)
                                    }}
                                >
                                    {option.name}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
                <Button
                    variant={selectedFilters.includes("open") ? "default" : "outline"}
                    size="sm"
                    className={selectedFilters.includes("open") ? "bg-amber-500 hover:bg-amber-600" : ""}
                    onClick={() => toggleFilter("open")}
                >
                    Open Now
                </Button>
                <Button
                    variant={selectedFilters.includes("free_delivery") ? "default" : "outline"}
                    size="sm"
                    className={selectedFilters.includes("free_delivery") ? "bg-amber-500 hover:bg-amber-600" : ""}
                    onClick={() => toggleFilter("free_delivery")}
                >
                    Free Delivery
                </Button>
                <Button
                    variant={selectedFilters.includes("promotions") ? "default" : "outline"}
                    size="sm"
                    className={selectedFilters.includes("promotions") ? "bg-amber-500 hover:bg-amber-600" : ""}
                    onClick={() => toggleFilter("promotions")}
                >
                    Promotions
                </Button>
            </div>
            {(searchQuery || activeCategory !== "all" || selectedFilters.length > 0) && (
                <div className="bg-white dark:bg-background px-4 py-2 flex justify-between items-center border-b">
                    <span className="text-sm font-medium">
                        {filteredStores.length} {filteredStores.length === 1 ? "result" : "results"}
                    </span>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Reset
                    </Button>
                </div>
            )}
            <div className="flex-1 p-4">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array(6).fill(0).map((_, index) => (
                            <Card key={index} className="overflow-hidden p-0">
                                <div className="h-32 md:h-40 bg-gray-200 animate-pulse" />
                                <div className="p-3 space-y-2">
                                    <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : filteredStores.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredStores.map((store) => (
                            <Card
                                key={store.id}
                                className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col"
                                onClick={() => handleStoreSelect(store.id)}
                            >
                                {/* Store Image - more compact on mobile */}
                                <div className="relative h-18 md:h-30 bg-gray-200 dark:bg-background">
                                    {store.image.startsWith("http") ? (
                                        <div
                                            className="absolute inset-0 bg-center bg-cover"
                                            style={{ backgroundImage: `url(${store.image})` }}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                            <Wine className="h-10 w-10 text-gray-400" />
                                        </div>
                                    )}

                                    {/* Favorite Button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white"
                                        onClick={(e) => toggleFavorite(store.id, e)}
                                    >
                                        <Heart className={`h-4 w-4 md:h-5 md:w-5 ${store.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                                    </Button>
                                    <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap max-w-[70%]">
                                        {store.isNew && (
                                            <Badge className="border-none h-4 text-[10px] bg-blue-500 md:text-sm py-0 dark:bg-emerald-900  dark:text-white font-light">New</Badge>
                                        )}
                                        {store.isFeatured && (
                                            <Badge className="h-4 bg-amber-500 text-xs md:text-sm py-0  dark:bg-green-900 border-none dark:text-white font-light">Featured</Badge>
                                        )}
                                        {!store.isOpen && (
                                            <Badge variant="outline" className="h-4 bg-white text-xs md:text-sm py-0  dark:bg-red-900 border-none font-light">
                                                Closed
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="absolute bottom-2 right-2">
                                        <Badge variant="outline" className="h-4 bg-white flex items-center gap-1 text-xs md:text-sm py-0 border-none dark:bg-slate-900 dark: font-light">
                                            <ThumbsUp className="h-3 w-3 text-amber-500" />
                                            {store.rating}%
                                            <span className="hidden md:inline">({store.reviewCount})</span>
                                        </Badge>
                                    </div>

                                </div>

                                <div className="p-1 flex-grow flex flex-col justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs flex items-center text-gray-500">
                                            <MapPin className="h-3 w-3 mr-0.5" />
                                            {store.distance} km
                                        </span>
                                        <h3 className="font-normal text-sm line-clamp-1">{store.name}</h3>
                                        •
                                        <p className="flex text-xs items-center text-gray-500">
                                            <Clock className="h-3 w-3 mr-0.5" />
                                            {store.deliveryTime}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap justify-between items-center text-xs md:text-sm gap-y-1">
                                        {store.promoText && (
                                            <div className="mt-1 text-xs md:text-sm text-amber-600 flex items-center line-clamp-1">
                                                <Sparkles className="h-3 w-3 mr-0.5 flex-shrink-0" />
                                                <span className="truncate">{store.promoText}</span>
                                            </div>
                                        )}

                                        <div className="text-xs text-green-700 md:text-sm">
                                            {store.deliveryFee > 0 ? (
                                                <span>KSh {store.deliveryFee} delivery</span>
                                            ) : (
                                                <span className="text-green-600 font-medium">Free delivery</span>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Wine className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium mb-1">No stores found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your filters or search term</p>
                        <Button onClick={clearFilters}>Clear Filters</Button>
                    </div>
                )}
            </div>
        </div>
    )
}
