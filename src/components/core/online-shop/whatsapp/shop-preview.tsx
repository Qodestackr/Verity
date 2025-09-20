"use client"

import { useState } from "react"
import Image from "next/image"
import {
    ShoppingBag,
    MessageCircle,
    ChevronRight,
    Store,
    Search,
    Plus,
    Minus,
    ShoppingCart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Product {
    id: string
    name: string
    price: number
    image: string
    category: string
}

interface CartItem {
    product: Product
    quantity: number
}

export function ShopPreview() {

    const [activeCategory, setActiveCategory] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [cart, setCart] = useState<CartItem[]>([])

    const categories = [
        { id: "all", name: "All" },
        { id: "beer", name: "Beer" },
        { id: "spirits", name: "Spirits" },
        { id: "wine", name: "Wine" },
        { id: "whisky", name: "Whisky" },
    ]

    const products: Product[] = [
        {
            id: "1",
            name: "Tusker Lager",
            price: 180,
            image: "/guiness-defaultimg.webp?height=80&width=80",
            category: "beer",
        },
        {
            id: "2",
            name: "Johnnie Walker Black",
            price: 3500,
            image: "/guiness-defaultimg.webp?height=80&width=80",
            category: "whisky",
        },
        {
            id: "3",
            name: "Gilbeys Gin",
            price: 1200,
            image: "/guiness-defaultimg.webp?height=80&width=80",
            category: "spirits",
        },
        {
            id: "4",
            name: "Four Cousins Wine",
            price: 950,
            image: "/guiness-defaultimg.webp?height=80&width=80",
            category: "wine",
        },
        {
            id: "5",
            name: "Heineken",
            price: 200,
            image: "/guiness-defaultimg.webp?height=80&width=80",
            category: "beer",
        },
        {
            id: "6",
            name: "Jack Daniels",
            price: 3200,
            image: "/guiness-defaultimg.webp?height=80&width=80",
            category: "whisky",
        },
    ]

    const filteredProducts = products.filter((product) => {
        const matchesCategory = activeCategory === "all" || product.category === activeCategory
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const addToCart = (product: Product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product.id === product.id)

            if (existingItem) {
                return prevCart.map((item) =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
                )
            } else {
                return [...prevCart, { product, quantity: 1 }]
            }
        })
    }

    const removeFromCart = (productId: string) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product.id === productId)

            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map((item) => (item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
            } else {
                return prevCart.filter((item) => item.product.id !== productId)
            }
        })
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    return (
        <div className="w-full max-w-xl mx-auto border rounded-lg overflow-hidden shadow-lg bg-white dark:bg-background">
            {/* Shop Header */}
            <div className="bg-emerald-700 text-white p-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="font-semibold">Kamakis Liquor Store</h2>
                        <p className="text-xs opacity-80">Premium drinks delivered to you</p>
                    </div>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 opacity-70" />
                        <span>Kamakis, Eastern Bypass</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="p-3 border-b">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search products..."
                        className="pl-9 h-9 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="p-2 border-b overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                    {categories.map((category) => (
                        <Button
                            key={category.id}
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "rounded-full text-xs px-3 h-8",
                                activeCategory === category.id
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 hover:text-emerald-800"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                            )}
                            onClick={() => setActiveCategory(category.id)}
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Products */}
            <ScrollArea className="h-[320px]">
                <div className="p-3 space-y-3">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No products found</p>
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                                <div className="w-16 h-16 rounded-md bg-slate-100 overflow-hidden flex-shrink-0">
                                    <Image
                                        src={product.image || "/guiness-defaultimg.webp"}
                                        alt={product.name}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                                    <p className="text-emerald-700 font-semibold">KES {product.price.toLocaleString()}</p>
                                    <Badge variant="outline" className="mt-1 text-[10px] bg-slate-50 text-slate-600">
                                        {product.category}
                                    </Badge>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 rounded-full text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                                    onClick={() => addToCart(product)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Cart */}
            <div className="border-t">
                {cart.length > 0 ? (
                    <div>
                        <div className="p-3">
                            <h3 className="font-medium text-sm mb-2">Your Order</h3>
                            <div className="space-y-2 max-h-[120px] overflow-y-auto">
                                {cart.map((item) => (
                                    <div key={item.product.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 rounded-full"
                                                    onClick={() => removeFromCart(item.product.id)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-6 text-center">{item.quantity}</span>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 rounded-full"
                                                    onClick={() => addToCart(item.product)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <span className="truncate max-w-[120px]">{item.product.name}</span>
                                        </div>
                                        <span className="text-sm font-normal">KES {(item.product.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        <div className="p-3">
                            <div className="flex justify-between text-sm mb-2">
                                <span>Subtotal ({totalItems} items)</span>
                                <span className="font-medium">KES {totalAmount.toLocaleString()}</span>
                            </div>

                            <Button className="w-full bg-emerald-700 hover:bg-emerald-800">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Checkout on WhatsApp
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-center">
                        <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                        <h3 className="font-medium text-sm">Your cart is empty</h3>
                        <p className="text-xs text-slate-500 mt-1">Add products to place an order</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-3 text-center border-t">
                <Button variant="link" className="text-xs text-emerald-700 h-auto p-0">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Chat with us on WhatsApp
                    <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
            </div>
        </div>
    )
}
