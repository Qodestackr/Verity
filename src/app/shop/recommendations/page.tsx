"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
    Sparkles,
    Wine,
    TrendingUp,
    Calendar,
    Gift,
    ShoppingBag,
    Heart,
    ChevronRight,
    Zap,
    Search,
    Filter,
} from "lucide-react"

import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

// Product interface
interface Product {
    id: string
    name: string
    category: string
    price: number
    stock: number
    image?: string
    tags: string[]
    abv?: number
    origin?: string
    popularity: number
    margin: number
}

// Recommendation types
type RecommendationType = "personal" | "trending" | "pairing" | "seasonal" | "premium" | "margin"

interface RecommendationGroup {
    type: RecommendationType
    title: string
    description: string
    icon: React.ReactNode
    products: Product[]
}

// Mock products
const mockProducts: Product[] = [
    {
        id: "prod_1",
        name: "Jameson Irish Whiskey",
        category: "Whiskey",
        price: 2500,
        stock: 15,
        tags: ["irish", "whiskey", "popular"],
        abv: 40,
        origin: "Ireland",
        popularity: 95,
        margin: 22,
    },
    {
        id: "prod_2",
        name: "Johnnie Walker Black Label",
        category: "Whiskey",
        price: 3200,
        stock: 8,
        tags: ["scotch", "whiskey", "premium"],
        abv: 40,
        origin: "Scotland",
        popularity: 90,
        margin: 25,
    },
    {
        id: "prod_3",
        name: "Hennessy VS",
        category: "Cognac",
        price: 4000,
        stock: 6,
        tags: ["cognac", "french", "premium"],
        abv: 40,
        origin: "France",
        popularity: 85,
        margin: 30,
    },
    {
        id: "prod_4",
        name: "Grey Goose Vodka",
        category: "Vodka",
        price: 3500,
        stock: 10,
        tags: ["vodka", "premium", "french"],
        abv: 40,
        origin: "France",
        popularity: 80,
        margin: 35,
    },
    {
        id: "prod_5",
        name: "Don Julio Blanco",
        category: "Tequila",
        price: 4500,
        stock: 5,
        tags: ["tequila", "premium", "mexican"],
        abv: 40,
        origin: "Mexico",
        popularity: 75,
        margin: 28,
    },
    {
        id: "prod_6",
        name: "Bombay Sapphire Gin",
        category: "Gin",
        price: 2800,
        stock: 12,
        tags: ["gin", "english", "popular"],
        abv: 47,
        origin: "England",
        popularity: 78,
        margin: 26,
    },
    {
        id: "prod_7",
        name: "Glenfiddich 12 Year",
        category: "Whiskey",
        price: 4800,
        stock: 7,
        tags: ["scotch", "whiskey", "single malt", "premium"],
        abv: 40,
        origin: "Scotland",
        popularity: 82,
        margin: 32,
    },
    {
        id: "prod_8",
        name: "Bacardi Superior",
        category: "Rum",
        price: 1800,
        stock: 20,
        tags: ["rum", "white rum", "popular"],
        abv: 40,
        origin: "Puerto Rico",
        popularity: 88,
        margin: 20,
    },
    {
        id: "prod_9",
        name: "Jack Daniel's",
        category: "Whiskey",
        price: 2800,
        stock: 18,
        tags: ["bourbon", "whiskey", "american", "popular"],
        abv: 40,
        origin: "USA",
        popularity: 92,
        margin: 24,
    },
    {
        id: "prod_10",
        name: "Absolut Vodka",
        category: "Vodka",
        price: 2200,
        stock: 25,
        tags: ["vodka", "swedish", "popular"],
        abv: 40,
        origin: "Sweden",
        popularity: 86,
        margin: 22,
    },
    {
        id: "prod_11",
        name: "Moët & Chandon Champagne",
        category: "Champagne",
        price: 6500,
        stock: 4,
        tags: ["champagne", "french", "premium", "sparkling"],
        abv: 12,
        origin: "France",
        popularity: 70,
        margin: 40,
    },
    {
        id: "prod_12",
        name: "Hendrick's Gin",
        category: "Gin",
        price: 3800,
        stock: 9,
        tags: ["gin", "scottish", "premium"],
        abv: 44,
        origin: "Scotland",
        popularity: 76,
        margin: 30,
    },
]

// Mock customer purchase history
const customerPurchaseHistory = [
    {
        productId: "prod_1",
        frequency: 5,
    },
    {
        productId: "prod_9",
        frequency: 3,
    },
    {
        productId: "prod_6",
        frequency: 2,
    },
]

// Mock seasonal recommendations
const seasonalRecommendations = [
    {
        season: "Summer",
        products: ["prod_4", "prod_6", "prod_10", "prod_12"],
    },
    {
        season: "Winter",
        products: ["prod_2", "prod_3", "prod_7", "prod_11"],
    },
    {
        season: "Festive",
        products: ["prod_3", "prod_5", "prod_11"],
    },
]

// Get current season
const getCurrentSeason = () => {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return "Spring"
    if (month >= 5 && month <= 7) return "Summer"
    if (month >= 8 && month <= 10) return "Fall"
    return "Winter"
}

// Mock pairing recommendations
const pairingRecommendations = [
    {
        category: "Whiskey",
        pairsWith: ["Chocolate", "Cheese", "Red Meat"],
        products: ["prod_1", "prod_2", "prod_7", "prod_9"],
    },
    {
        category: "Vodka",
        pairsWith: ["Seafood", "Caviar", "Light Appetizers"],
        products: ["prod_4", "prod_10"],
    },
    {
        category: "Gin",
        pairsWith: ["Citrus Fruits", "Cucumber", "Herbs"],
        products: ["prod_6", "prod_12"],
    },
]

export default function POSRecommendations() {
    const [activeTab, setActiveTab] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [recommendations, setRecommendations] = useState<RecommendationGroup[]>([])
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentSeason] = useState(getCurrentSeason())

    // Generate recommendations
    useEffect(() => {
        setIsLoading(true)

        setTimeout(() => {
            const personalRecs = generatePersonalRecommendations()
            const trendingRecs = generateTrendingRecommendations()
            const pairingRecs = generatePairingRecommendations()
            const seasonalRecs = generateSeasonalRecommendations()
            const premiumRecs = generatePremiumRecommendations()
            const marginRecs = generateMarginRecommendations()

            setRecommendations([personalRecs, trendingRecs, seasonalRecs, pairingRecs, premiumRecs, marginRecs])

            setIsLoading(false)
        }, 1000)
    }, [])

    // Generate personal recommendations based on purchase history
    const generatePersonalRecommendations = (): RecommendationGroup => {
        // Get categories the customer has purchased
        const purchasedProductIds = customerPurchaseHistory.map((item) => item.productId)
        const purchasedProducts = mockProducts.filter((product) => purchasedProductIds.includes(product.id))
        const purchasedCategories = [...new Set(purchasedProducts.map((product) => product.category))]

        // Find similar products in the same categories
        const recommendedProducts = mockProducts
            .filter((product) => purchasedCategories.includes(product.category) && !purchasedProductIds.includes(product.id))
            .slice(0, 4)

        return {
            type: "personal",
            title: "Recommended for You",
            description: "Based on your purchase history",
            icon: <Heart className="h-4 w-4 text-rose-500" />,
            products: recommendedProducts,
        }
    }

    // Generate trending recommendations
    const generateTrendingRecommendations = (): RecommendationGroup => {
        // Sort by popularity and take top 4
        const trendingProducts = [...mockProducts].sort((a, b) => b.popularity - a.popularity).slice(0, 4)

        return {
            type: "trending",
            title: "Trending Now",
            description: "Popular with customers this week",
            icon: <TrendingUp className="h-4 w-4 text-blue-500" />,
            products: trendingProducts,
        }
    }

    // Generate pairing recommendations
    const generatePairingRecommendations = (): RecommendationGroup => {
        // Get random pairing category
        const randomPairingIndex = Math.floor(Math.random() * pairingRecommendations.length)
        const randomPairing = pairingRecommendations[randomPairingIndex]

        const pairingProducts = mockProducts.filter((product) => randomPairing.products.includes(product.id)).slice(0, 4)

        return {
            type: "pairing",
            title: `Perfect with ${randomPairing.pairsWith[0]}`,
            description: `${randomPairing.category} selections that pair well with ${randomPairing.pairsWith.join(", ")}`,
            icon: <Wine className="h-4 w-4 text-purple-500" />,
            products: pairingProducts,
        }
    }

    // Generate seasonal recommendations
    const generateSeasonalRecommendations = (): RecommendationGroup => {
        // Find season-appropriate products
        let seasonProducts: string[] = []

        if (currentSeason === "Summer") {
            seasonProducts = seasonalRecommendations[0].products
        } else if (currentSeason === "Winter") {
            seasonProducts = seasonalRecommendations[1].products
        } else {
            // For spring and fall, mix summer and winter
            seasonProducts = [
                ...seasonalRecommendations[0].products.slice(0, 2),
                ...seasonalRecommendations[1].products.slice(0, 2),
            ]
        }

        // Check if we're near any holidays for festive recommendations
        const currentMonth = new Date().getMonth()
        if (currentMonth === 11 || currentMonth === 0) {
            // December or January
            seasonProducts = [...seasonProducts, ...seasonalRecommendations[2].products]
        }

        const seasonalProducts = mockProducts.filter((product) => seasonProducts.includes(product.id)).slice(0, 4)

        return {
            type: "seasonal",
            title: `${currentSeason} Selections`,
            description: `Perfect for the current season`,
            icon: <Calendar className="h-4 w-4 text-amber-500" />,
            products: seasonalProducts,
        }
    }

    // Generate premium upsell recommendations
    const generatePremiumRecommendations = (): RecommendationGroup => {
        // Sort by price and take top premium products
        const premiumProducts = [...mockProducts].sort((a, b) => b.price - a.price).slice(0, 4)

        return {
            type: "premium",
            title: "Premium Selections",
            description: "Luxury options for discerning customers",
            icon: <Gift className="h-4 w-4 text-emerald-500" />,
            products: premiumProducts,
        }
    }

    // Generate high-margin recommendations
    const generateMarginRecommendations = (): RecommendationGroup => {
        // Sort by margin and take top margin products
        const marginProducts = [...mockProducts].sort((a, b) => b.margin - a.margin).slice(0, 4)

        return {
            type: "margin",
            title: "Staff Picks",
            description: "Recommended by our expert team",
            icon: <Zap className="h-4 w-4 text-amber-500" />,
            products: marginProducts,
        }
    }

    // Add product to cart
    const addToCart = (product: Product) => {
        toast.success(`Added to cart`, {
            description: product.name,
        })
    }

    // Filter recommendations based on search
    const filteredRecommendations =
        searchQuery.length > 0
            ? recommendations
                .map((group) => ({
                    ...group,
                    products: group.products.filter(
                        (product) =>
                            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
                    ),
                }))
                .filter((group) => group.products.length > 0)
            : recommendations

    return (
        <div className="max-w-5xl mx-auto flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-background z-10 sticky top-0">
                <div className="flex items-center justify-between p-3">
                    <h1 className="text-lg font-semibold flex items-center">
                        <Sparkles className="h-5 w-5 text-amber-500 mr-1.5" />
                        Smart Recommendations
                    </h1>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col">
                {/* Search */}
                <div className="p-3 border-b">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search recommendations..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs
                    defaultValue="all"
                    className="flex-1 overflow-hidden flex flex-col"
                    value={activeTab}
                    onValueChange={setActiveTab}
                >
                    <div className="px-3 pt-3 border-b">
                        <ScrollArea className="w-full" orientation="horizontal">
                            <TabsList className="w-full justify-start">
                                <TabsTrigger value="all" className="px-3">
                                    All
                                </TabsTrigger>
                                <TabsTrigger value="personal" className="px-3">
                                    For You
                                </TabsTrigger>
                                <TabsTrigger value="trending" className="px-3">
                                    Trending
                                </TabsTrigger>
                                <TabsTrigger value="seasonal" className="px-3">
                                    Seasonal
                                </TabsTrigger>
                                <TabsTrigger value="pairing" className="px-3">
                                    Pairings
                                </TabsTrigger>
                                <TabsTrigger value="premium" className="px-3">
                                    Premium
                                </TabsTrigger>
                            </TabsList>
                        </ScrollArea>
                    </div>

                    {/* All Recommendations Tab */}
                    <TabsContent value="all" className="flex-1 overflow-y-auto p-0">
                        <ScrollArea className="h-full">
                            <div className="p-4 space-y-6">
                                {isLoading
                                    ? // Loading skeleton
                                    Array(3)
                                        .fill(0)
                                        .map((_, groupIndex) => (
                                            <div key={groupIndex} className="space-y-3">
                                                <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {Array(4)
                                                        .fill(0)
                                                        .map((_, productIndex) => (
                                                            <div key={productIndex} className="h-32 bg-muted rounded animate-pulse"></div>
                                                        ))}
                                                </div>
                                            </div>
                                        ))
                                    : filteredRecommendations.map((group, index) => (
                                        <div key={index} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-lg font-medium flex items-center">
                                                    {group.icon}
                                                    <span className="ml-2">{group.title}</span>
                                                </h2>
                                                <Button variant="ghost" size="sm" className="text-xs">
                                                    See all <ChevronRight className="h-3 w-3 ml-1" />
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{group.description}</p>

                                            <div className="grid grid-cols-2 gap-3">
                                                {group.products.map((product) => (
                                                    <Card key={product.id} className="overflow-hidden">
                                                        <CardContent className="p-3">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-medium truncate">{product.name}</h3>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {product.category}
                                                                        </Badge>
                                                                        {product.abv && (
                                                                            <span className="text-xs text-muted-foreground">{product.abv}% ABV</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm font-semibold mt-2">KSh {product.price.toLocaleString()}</p>
                                                                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                                        <ShoppingBag className="h-3 w-3 mr-1" />
                                                                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    className="h-8"
                                                                    disabled={product.stock <= 0}
                                                                    onClick={() => addToCart(product)}
                                                                >
                                                                    Add
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>

                                            {index < filteredRecommendations.length - 1 && <Separator className="mt-6" />}
                                        </div>
                                    ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    {/* Individual Category Tabs */}
                    {["personal", "trending", "seasonal", "pairing", "premium"].map((tabValue) => (
                        <TabsContent key={tabValue} value={tabValue} className="flex-1 overflow-y-auto p-0">
                            <ScrollArea className="h-full">
                                <div className="p-4">
                                    {isLoading ? (
                                        <div className="space-y-3">
                                            {Array(8)
                                                .fill(0)
                                                .map((_, productIndex) => (
                                                    <div key={productIndex} className="h-24 bg-muted rounded animate-pulse"></div>
                                                ))}
                                        </div>
                                    ) : (
                                        <>
                                            {filteredRecommendations
                                                .filter((group) => group.type === tabValue)
                                                .map((group) => (
                                                    <div key={group.type} className="space-y-3">
                                                        <div>
                                                            <h2 className="text-lg font-medium flex items-center">
                                                                {group.icon}
                                                                <span className="ml-2">{group.title}</span>
                                                            </h2>
                                                            <p className="text-sm text-muted-foreground">{group.description}</p>
                                                        </div>

                                                        <div className="space-y-3 mt-4">
                                                            {group.products.map((product) => (
                                                                <Card key={product.id} className="overflow-hidden">
                                                                    <CardContent className="p-3">
                                                                        <div className="flex justify-between items-center">
                                                                            <div className="flex-1 min-w-0">
                                                                                <h3 className="font-medium">{product.name}</h3>
                                                                                <div className="flex items-center gap-2 mt-1">
                                                                                    <Badge variant="outline" className="text-xs">
                                                                                        {product.category}
                                                                                    </Badge>
                                                                                    {product.origin && (
                                                                                        <span className="text-xs text-muted-foreground">{product.origin}</span>
                                                                                    )}
                                                                                </div>
                                                                                <p className="text-sm font-semibold mt-1">
                                                                                    KSh {product.price.toLocaleString()}
                                                                                </p>
                                                                            </div>
                                                                            <Button
                                                                                size="sm"
                                                                                className="h-8"
                                                                                disabled={product.stock <= 0}
                                                                                onClick={() => addToCart(product)}
                                                                            >
                                                                                Add
                                                                            </Button>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                        </>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    )
}
