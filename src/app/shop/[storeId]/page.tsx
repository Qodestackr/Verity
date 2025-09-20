"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Search,
    X,
    Clock,
    ThumbsUp,
    Wine,
    Sparkles,
    MapPin,
    Info,
    Plus,
    Minus,
    Check,
    ShoppingBag,
    ArrowRight,
} from "lucide-react"

import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import React from "react"

// Store interface
interface Store {
    id: string
    name: string
    image: string
    rating: number
    reviewCount: number
    deliveryTime: string
    deliveryFee: number
    distance: number
    isFavorite: boolean
    categories: string[]
    tags: string[]
    isOpen: boolean
    isFeatured?: boolean
    isNew?: boolean
    promoText?: string
    description?: string
    address?: string
    phone?: string
}

// Product interface
interface Product {
    id: string
    name: string
    category: string
    price: number
    stock: number
    image?: string
    description: string
    abv?: number
    origin?: string
    isNew?: boolean
    isFeatured?: boolean
    isPopular?: boolean
    isOutOfStock?: boolean
}

// Cart item interface
interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image?: string
}

// Mock stores data
const mockStores: Record<string, Store> = {
    store_1: {
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
        description: "Premium liquor store with a wide selection of imported spirits, wines, and craft beers.",
        address: "Rosslyn Riviera Mall, Limuru Road, Nairobi",
        phone: "+254 712 345 678",
    },
    store_2: {
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
        description: "Specialized wine store with a curated selection of wines from around the world.",
        address: "The Oval, Westlands, Nairobi",
        phone: "+254 723 456 789",
    },
}

// Mock products by store
const mockProductsByStore: Record<string, Product[]> = {
    store_1: [
        {
            id: "prod_1",
            name: "Jameson Irish Whiskey",
            category: "Whiskey",
            price: 2500,
            stock: 15,
            description: "Smooth and perfectly balanced triple-distilled Irish whiskey.",
            abv: 40,
            origin: "Ireland",
            isPopular: true,
        },
        {
            id: "prod_2",
            name: "Johnnie Walker Black Label",
            category: "Whiskey",
            price: 3200,
            stock: 8,
            description: "Rich, complex and incredibly well-balanced blend of Scotland's finest whiskies.",
            abv: 40,
            origin: "Scotland",
            isFeatured: true,
        },
        {
            id: "prod_3",
            name: "Hennessy VS",
            category: "Cognac",
            price: 4000,
            stock: 6,
            description: "Bold and fragrant cognac with notes of oak and fruit.",
            abv: 40,
            origin: "France",
            isPopular: true,
        },
        {
            id: "prod_4",
            name: "Grey Goose Vodka",
            category: "Vodka",
            price: 3500,
            stock: 10,
            description: "Ultra-premium vodka made from French wheat.",
            abv: 40,
            origin: "France",
        },
        {
            id: "prod_5",
            name: "Don Julio Blanco",
            category: "Tequila",
            price: 4500,
            stock: 0,
            description: "Crisp agave flavor with hints of citrus and black pepper.",
            abv: 40,
            origin: "Mexico",
            isOutOfStock: true,
        },
        {
            id: "prod_6",
            name: "Bombay Sapphire Gin",
            category: "Gin",
            price: 2800,
            stock: 12,
            description: "Bright, fresh gin with 10 exotic botanicals.",
            abv: 47,
            origin: "England",
            isPopular: true,
        },
    ],
    store_2: [
        {
            id: "prod_7",
            name: "Cloudy Bay Sauvignon Blanc",
            category: "White Wine",
            price: 3800,
            stock: 8,
            description: "Vibrant and expressive New Zealand Sauvignon Blanc with notes of citrus and tropical fruits.",
            abv: 13,
            origin: "New Zealand",
            isFeatured: true,
        },
        {
            id: "prod_8",
            name: "Dom Pérignon Vintage",
            category: "Champagne",
            price: 18500,
            stock: 3,
            description: "Prestigious champagne with complex aromas and exceptional aging potential.",
            abv: 12.5,
            origin: "France",
            isFeatured: true,
        },
        {
            id: "prod_9",
            name: "Veuve Clicquot Brut",
            category: "Champagne",
            price: 7200,
            stock: 6,
            description: "Well-balanced, dry champagne with notes of apple and brioche.",
            abv: 12,
            origin: "France",
            isPopular: true,
        },
        {
            id: "prod_10",
            name: "Château Margaux",
            category: "Red Wine",
            price: 25000,
            stock: 2,
            description: "Elegant Bordeaux with remarkable depth and complexity.",
            abv: 13.5,
            origin: "France",
            isFeatured: true,
        },
        {
            id: "prod_11",
            name: "Caymus Cabernet Sauvignon",
            category: "Red Wine",
            price: 9500,
            stock: 4,
            description: "Rich California Cabernet with dark fruit flavors and velvety tannins.",
            abv: 14.5,
            origin: "USA",
            isPopular: true,
        },
        {
            id: "prod_12",
            name: "Whispering Angel Rosé",
            category: "Rosé Wine",
            price: 3200,
            stock: 0,
            description: "Elegant and refreshing Provence rosé with delicate fruit notes.",
            abv: 13,
            origin: "France",
            isOutOfStock: true,
        },
    ],
}

// Product categories by store
const productCategoriesByStore: Record<string, string[]> = {
    store_1: ["All", "Whiskey", "Vodka", "Gin", "Tequila", "Cognac"],
    store_2: ["All", "Red Wine", "White Wine", "Champagne", "Rosé Wine"],
}

export default function StorePage({ params }: { params: { storeId: string } }) {
    const router = useRouter()
    const isMobile = useIsMobile()
    const { storeId } = React.use(params)

    console.log("storeId", storeId);

    // State
    const [store, setStore] = useState<Store | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState("All")
    const [cart, setCart] = useState<CartItem[]>([])
    const [showCart, setShowCart] = useState(false)
    const [showStoreInfo, setShowStoreInfo] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [addedProducts, setAddedProducts] = useState<Record<string, boolean>>({})

    // Calc cart totals
    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0)

    useEffect(() => {
        setIsLoading(true)
        setTimeout(() => {
            const storeData = mockStores[storeId]
            const productsData = mockProductsByStore[storeId] || []

            if (storeData) {
                setStore(storeData)
                setProducts(productsData)
            } else {
                // Handle store not found
                router.push(`/shop`)
            }

            setIsLoading(false)
        }, 800)
    }, [storeId, router])

    // Filter products based on search and category
    const filteredProducts = products.filter((product) => {
        const matchesSearch = searchQuery
            ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.origin?.toLowerCase().includes(searchQuery.toLowerCase())
            : true

        const matchesCategory = activeCategory === "All" ? true : product.category === activeCategory

        return matchesSearch && matchesCategory
    })

    // Add to cart
    const addToCart = (product: Product) => {
        // Check if product is in stock
        if (product.isOutOfStock) return

        // Check if product is already in cart
        const existingItem = cart.find((item) => item.id === product.id)

        if (existingItem) {
            // Update quantity if already in cart
            setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
        } else {
            // Add new item to cart
            setCart([
                ...cart,
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    image: product.image,
                },
            ])
        }

        // Mark product as added for animation
        setAddedProducts({ ...addedProducts, [product.id]: true })
    }

    // Update cart item quantity
    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            setCart(cart.filter((item) => item.id !== id))
        } else {
            // Update quantity
            setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)))
        }
    }

    // Remove from cart
    const removeFromCart = (id: string) => {
        setCart(cart.filter((item) => item.id !== id))
    }

    // Clear cart
    const clearCart = () => {
        setCart([])
    }

    // Proceed to checkout
    const checkout = () => {
        router.push(`/shop/${storeId}/checkout`)
    }

    // Render product card
    const renderProductCard = (product: Product) => {
        const isInCart = cart.some((item) => item.id === product.id)
        const cartItem = cart.find((item) => item.id === product.id)
        const isOutOfStock = product.isOutOfStock
        const isAdded = addedProducts[product.id]

        return (
            <Card key={product.id} className={`overflow-hidden transition-all p-1.5 ${isOutOfStock ? "opacity-70" : ""}`}>
                {/* Badges */}
                <div className="flex flex-col gap-1">
                    {product.isNew && <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>}
                    {product.isFeatured && <Badge className="h-4 text-xs font-light bg-emerald-600 hover:bg-emerald-700">Featured</Badge>}
                    {isOutOfStock && (
                        <Badge variant="outline" className="h-4 text-xs font-light bg-background/80 border-none">
                            Out of Stock
                        </Badge>
                    )}
                </div>
                <CardContent className="p-1">
                    <div className="mb-1">
                        <h3 className="font-normal line-clamp-1">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="h-4 text-xs font-light  font-light">
                                {product.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{product.abv}% ABV</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="font-light text-sm">KSh {product.price.toLocaleString()}</p>

                        {isInCart ? (
                            <div className="flex items-center border rounded-md">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-6 p-0 rounded-none rounded-l-md"
                                    onClick={() => updateQuantity(product.id, (cartItem?.quantity || 1) - 1)}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm">{cartItem?.quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-6 p-0 rounded-none rounded-r-md"
                                    onClick={() => updateQuantity(product.id, (cartItem?.quantity || 0) + 1)}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <Button size="sm" variant="outline" className="h-7 text-xs" disabled={isOutOfStock} onClick={() => addToCart(product)}>
                                <AnimatePresence mode="wait">
                                    {isAdded ? (
                                        <motion.div
                                            key="check"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            onAnimationComplete={() => {
                                                setTimeout(() => {
                                                    setAddedProducts({ ...addedProducts, [product.id]: false })
                                                }, 1000)
                                            }}
                                        >
                                            <Check className="h-4 w-4" />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="add" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                            Add
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (isLoading || !store) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50 p-4">
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="h-40 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="h-8 w-full bg-gray-200 rounded animate-pulse mb-4" />
                <div className="grid grid-cols-2 gap-4">
                    {Array(4)
                        .fill(0)
                        .map((_, i) => (
                            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
                        ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white dark:bg-background border-b">
                <div className="flex items-center p-4">
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/shop/stores")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-normal truncate">{store.name}</h1>
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setShowStoreInfo(true)}>
                            <Info className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="sm" className="relative" onClick={() => setShowCart(true)}>
                            <ShoppingBag className="h-4 w-4 mr-1.5" />
                            Cart
                            {cartItemCount > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                    {cartItemCount}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Store Banner */}
                <div className="relative h-40 bg-gray-200">
                    {store.image.startsWith("http") ? (
                        <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${store.image})` }} />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                            <Wine className="h-16 w-16 text-gray-400" />
                        </div>
                    )}

                    {/* Store Info Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 text-white">
                        <div className="flex items-center gap-2">
                            {store.isNew && <Badge className="h-4 text-xs font-light bg-blue-500">New</Badge>}
                            {store.isFeatured && <Badge className="h-4 text-xs font-light bg-amber-500">Featured</Badge>}
                            {!store.isOpen && (
                                <Badge variant="outline" className="bg-white/20 border-white">
                                    Closed
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="h-4 text-xs font-light bg-white/20 border-white flex items-center gap-1">
                                        <ThumbsUp className="h-3 w-3" />
                                        {store.rating}% ({store.reviewCount})
                                    </Badge>
                                    <span className="text-sm flex items-center">
                                        <Clock className="h-3.5 w-3.5 mr-1" />
                                        {store.deliveryTime}
                                    </span>
                                </div>
                            </div>

                            <div className="text-sm">
                                {store.deliveryFee > 0 ? (
                                    <span>KSh {store.deliveryFee} delivery</span>
                                ) : (
                                    <span className="font-medium">Free delivery</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-4 py-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search products..."
                            className="pl-10 pr-10 bg-gray-100 dark:bg-gray-900 border-none"
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
                </div>

                {/* Category Filters */}
                <ScrollArea className="w-full" orientation="horizontal">
                    <div className="flex px-4 pb-2 space-x-2">
                        {productCategoriesByStore[storeId]?.map((category) => (
                            <Button
                                key={category}
                                variant={activeCategory === category ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveCategory(category)}
                                className={activeCategory === category ? "h-7 text-xs bg-emerald-600 hover:bg-emerald-700 dark:text-slate-100" : ""}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </header>

            {/* Product Listings */}
            <div className="flex-1 p-4">
                {/* Promo Banner */}
                {store.promoText && (
                    <div className="bg-amber-50 dark:bg-emerald-800 border border-amber-200 dark:border-emerald-200 rounded-lg p-3 mb-4 flex items-center">
                        <Sparkles className="h-5 w-5 text-amber-500 dark:text-emerald-500 mr-2 flex-shrink-0" />
                        <p className="text-sm text-amber-700 dark:text-emerald-300">{store.promoText}</p>
                    </div>
                )}

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map(renderProductCard)}
                </div>

                {/* No Results */}
                {filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Wine className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium">No products found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your search or category filter</p>
                        <Button
                            onClick={() => {
                                setSearchQuery("")
                                setActiveCategory("All")
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>

            {/* Cart Sheet */}
            <Sheet open={showCart} onOpenChange={setShowCart}>
                <SheetContent className="w-full sm:max-w-md p-0 flex flex-col" side={isMobile ? "bottom" : "right"}>
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle className="flex items-center">
                            <ShoppingBag className="h-5 w-5 mr-2" />
                            Your Cart
                            {cartItemCount > 0 && (
                                <Badge variant="outline" className="h-4 text-xs font-light ml-2">
                                    {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
                                </Badge>
                            )}
                        </SheetTitle>
                    </SheetHeader>

                    {cart.length > 0 ? (
                        <>
                            <ScrollArea className="flex-1">
                                <div className="divide-y">
                                    {cart.map((item) => (
                                        <div key={item.id} className="p-1.5 flex items-center gap-3">
                                            {/* Product image placeholder */}
                                            <div className="h-12 w-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                                                <Wine className="h-8 w-8 text-muted-foreground/30" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium line-clamp-1">{item.name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    KSh {item.price.toLocaleString()} × {item.quantity}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center border rounded-md">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 p-0 rounded-none rounded-l-md"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 p-0 rounded-none rounded-r-md"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            <div className="p-2 border-t space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>KSh {cartTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Delivery</span>
                                        <span>KSh {store.deliveryFee.toLocaleString()}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between pt-2 font-bold">
                                        <span>Total</span>
                                        <span>KSh {(cartTotal + store.deliveryFee).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={checkout}>
                                        Checkout
                                    </Button>
                                    <Button variant="outline" className="w-full" onClick={clearCart}>
                                        Clear Cart
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-3" />
                            <h3 className="text-lg font-medium">Your cart is empty</h3>
                            <p className="text-sm text-muted-foreground mb-6">Add some products to your cart to continue shopping</p>
                            <Button variant="outline" onClick={() => setShowCart(false)}>
                                Continue Shopping
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Store Info Sheet */}
            <Sheet open={showStoreInfo} onOpenChange={setShowStoreInfo}>
                <SheetContent className="w-full sm:max-w-md p-0" side={isMobile ? "bottom" : "right"}>
                    <SheetHeader className="p-2 border-b">
                        <SheetTitle>Store Information</SheetTitle>
                    </SheetHeader>

                    <div className="p-1.5 space-y-2">
                        <div>
                            <h3 className="font-medium text-muted-foreground">About</h3>
                            <p className="text-sm">{store.description}</p>
                        </div>

                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Delivery</h3>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{store.deliveryTime}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{store.distance} km away</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Rating</h3>
                            <div className="flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4 text-amber-500" />
                                <span className="text-sm">
                                    {store.rating}% positive ({store.reviewCount} reviews)
                                </span>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Floating Cart Button (Mobile) */}
            {isMobile && cartItemCount > 0 && !showCart && (
                <div className="fixed bottom-4 right-4 left-4 z-50">
                    <Button
                        className="w-full shadow-lg bg-emerald-600 hover:bg-emerald-700 dark:text-white"
                        size="lg"
                        onClick={() => setShowCart(true)}
                    >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        View Cart ({cartItemCount}) - KSh {cartTotal.toLocaleString()}
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            )}
        </div>
    )
}
