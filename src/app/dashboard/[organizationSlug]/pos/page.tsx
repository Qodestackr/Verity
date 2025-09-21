"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import {
    Search,
    Plus,
    Sparkles,
    CreditCard,
    Banknote,
    Smartphone,
    Percent,
    CheckCircle,
    Loader2,
    Printer,
    X,
    PackageSearch,
    ShoppingBag,
    User,
    Trash2,
    LayoutGrid,
    ListFilter,
    Minus,
    FileText,
    DollarSign,
    AlertCircle,
    ArrowRight,
    Tag,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { type MeilisearchHit, searchEngine } from "@/utils/search-engine"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useDraftOrderStore } from "@/stores/use-draft-order-store"
import POSCustomerLoyalty from "@/components/marketing/customer/loyalty-program"

interface Product {
    id: string
    name: string
    slug?: string
    pricing?: {
        priceRange?: {
            start?: {
                gross?: {
                    amount: number
                    currency?: string
                }
            }
        }
        onSale?: boolean
    }
    category?: {
        name: string
        id: string
    }
    variants?: Array<{
        id: string
        name?: string
        sku?: string
        quantityAvailable?: number
        pricing?: {
            price?: {
                gross?: {
                    amount: number
                }
            }
        }
    }>
    thumbnail?: {
        url: string
        alt?: string
    }
    isAvailableForPurchase?: boolean
}

// Format currency
const formatCurrency = (amount: number) => {
    return `{formatCurrency(amount)}`
}

export default function POSSystem() {
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortOrder, setSortOrder] = useState<"name_ASC" | "price_ASC" | "price_DESC">("name_ASC")
    const [showPaymentDialog, setShowPaymentDialog] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<"M-Pesa" | "Cash" | "Card" | "Split" | null>(null)
    const [isProcessingPayment, setIsProcessingPayment] = useState(false)
    const [showReceiptDialog, setShowReceiptDialog] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<"grid" | "list">("list")
    const [showOnAccountSheet, setShowOnAccountSheet] = useState(false)
    const [customerPhone, setCustomerPhone] = useState("")
    const [customerName, setCustomerName] = useState("")
    const [showMissingProductDialog, setShowMissingProductDialog] = useState(false)
    const [missingProductName, setMissingProductName] = useState("")

    const [isLoading, setIsLoading] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [searchError, setSearchError] = useState<Error | null>(null)
    const [searchData, setSearchData] = useState<MeilisearchHit[]>([])
    const [categories, setCategories] = useState<string[]>([])

    const {
        activeDraftId,
        draftOrders,
        createNewDraft,
        addItemsToDraft,
        removeItemFromDraft,
        updateDraft,
        completeDraft,
        loadDraftOrders,
        deleteDraft,
        setActiveDraftId,
    } = useDraftOrderStore()

    const activeDraft = useMemo(
        () => draftOrders.find((draft) => draft.id === activeDraftId),
        [draftOrders, activeDraftId],
    )

    // Transform search results to Product interface
    const searchedProducts = useMemo(() => {
        return searchData.map((hit: MeilisearchHit) => {
            // Transform Meilisearch hit to match the Product interface
            const variant = hit.variants && hit.variants.length > 0 ? hit.variants[0] : null
            return {
                id: hit.id,
                name: hit.name,
                slug: hit.slug,
                pricing: {
                    priceRange: {
                        start: {
                            gross: {
                                amount: hit.price || 0,
                                currency: "KES",
                            },
                        },
                    },
                },
                variants: variant
                    ? [
                        {
                            id: variant?.variantId || "",
                            name: variant.name || "",
                            sku: variant.sku || "",
                            quantityAvailable: hit.stock || 0,
                            pricing: {
                                price: {
                                    gross: {
                                        amount: hit.price || 0,
                                    },
                                },
                            },
                        },
                    ]
                    : [],
                category: hit.category
                    ? {
                        name: typeof hit.category === "string" ? hit.category : "Uncategorized",
                        id: typeof hit.category === "string" ? hit.category : "uncategorized",
                    }
                    : undefined,
                isAvailableForPurchase: hit.stock ? hit.stock > 0 : false,
            } as Product
        })
    }, [searchData])

    // Load draft orders on mount
    useEffect(() => {
        loadDraftOrders()
    }, [loadDraftOrders])


    // Focus search input when component mounts
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus()
            setSearchQuery("Kenya Cane")
        }
    }, [])

    // Search products when query changes
    useEffect(() => {
        if (searchQuery.length >= 1) {
            setIsLoading(true)
            setIsSearching(true)

            const timer = setTimeout(async () => {
                try {
                    const hits = await searchEngine({
                        index: "test_products",
                        searchQuery: searchQuery,
                        attributesToRetrieve: [
                            "id",
                            "saleor_id",
                            "variants",
                            "name",
                            "slug",
                            "skus",
                            "stock",
                            "price",
                            "cost_price",
                            "category",
                        ],
                        retries: 2,
                    })

                    setSearchData(hits)
                    setSearchError(null)

                    // Extract unique categories
                    const uniqueCategories = new Set<string>()
                    hits.forEach((hit) => {
                        if (hit.category && typeof hit.category === "string") {
                            uniqueCategories.add(hit.category)
                        }
                    })
                    setCategories(Array.from(uniqueCategories))
                } catch (error) {
                    console.error("Search error:", error)
                    setSearchError(error instanceof Error ? error : new Error("Search failed"))
                    setSearchData([])
                } finally {
                    setIsLoading(false)
                    setIsSearching(false)
                }
            }, 300)

            return () => clearTimeout(timer)
        } else {
            setSearchData([])
        }
    }, [searchQuery])

    const getProductPrice = (product: Product): number => {
        if (product.variants && product.variants.length > 0 && product.variants[0].pricing?.price?.gross?.amount) {
            return product.variants[0].pricing.price.gross.amount
        }
        return product.pricing?.priceRange?.start?.gross?.amount || 0
    }

    const getProductVariantId = (product: Product): string => {
        return product.variants && product.variants.length > 0 ? product.variants[0].id : ""
    }

    const getProductStock = (product: Product): number => {
        return product.variants && product.variants.length > 0 ? product.variants[0].quantityAvailable || 0 : 0
    }

    const getProductCategory = (product: Product): string => {
        return product.category?.name || "Uncategorized"
    }

    // Filter products by category and search query
    const filteredProducts = useMemo(() => {
        return searchedProducts.filter((product) => {
            // Filter by category if selected
            if (selectedCategory && product.category?.name !== selectedCategory) {
                return false
            }
            return true
        })
    }, [searchedProducts, selectedCategory])

    // Sort products
    const sortedProducts = useMemo(() => {
        return [...filteredProducts].sort((a, b) => {
            const priceA = getProductPrice(a)
            const priceB = getProductPrice(b)

            if (sortOrder === "name_ASC") {
                return a.name.localeCompare(b.name)
            } else if (sortOrder === "price_ASC") {
                return priceA - priceB
            } else {
                return priceB - priceA
            }
        })
    }, [filteredProducts, sortOrder])

    // Handle adding a product to the active draft
    const handleAddProduct = async (product: Product) => {
        const price = getProductPrice(product)
        const variantId = getProductVariantId(product)

        // If no active draft, create one
        if (!activeDraftId) {
            const newDraftId = await createNewDraft({
                items: [
                    {
                        variantId: variantId,
                        quantity: 1,
                        name: product.name,
                        price: price,
                    },
                ],
            })

            if (newDraftId) {
                toast.success(`Added ${product.name}`)
            }
            return
        }

        // Add to existing draft
        const success = await addItemsToDraft([
            {
                variantId: variantId,
                quantity: 1,
                name: product.name,
                price: price,
            },
        ])

        if (success) {
            toast.success(`Added ${product.name}`)
        }

        // Clear search after adding
        setSearchQuery("")
    }

    // Handle removing an item from the active draft
    const handleRemoveItem = async (lineId: string) => {
        await removeItemFromDraft(lineId)
    }

    // Handle updating item quantity
    const handleUpdateQuantity = async (lineId: string, currentQuantity: number, change: number) => {
        const newQuantity = currentQuantity + change
        if (newQuantity < 1) return

        // This would require a mutation to update the line quantity
        // For now, we'll remove the item and add it again with the new quantity
        console.log(`Update quantity for ${lineId} to ${newQuantity}`)

        // In a real implementation, you would call a mutation to update the quantity
        toast.success("Quantity updated")
    }

    // Handle creating a new draft
    const handleCreateNewDraft = async () => {
        await createNewDraft({ items: [] })
    }

    // Handle putting the current sale on account (saving draft)
    const handlePutOnAccount = async () => {
        if (!activeDraft || !activeDraft.lines?.length) {
            toast.error("Sale is empty")
            return
        }

        // Add customer info if available
        if (customerName || customerPhone) {
            await updateDraft({
                customerName,
                customerPhone,
                note: "Put on account",
            })
        }

        // Create a new draft for the next sale
        await handleCreateNewDraft()

        toast.success("Sale put on account")
    }

    // Handle checkout
    const handleCheckout = () => {
        if (!activeDraft) {
            toast.error("No active draft")
            return
        }

        if (!activeDraft.lines?.length) {
            toast.error("Empty order", {
                description: "Please add items to the order first",
            })
            return
        }

        setShowPaymentDialog(true)
    }

    // Handle payment completion
    const handleCompletePayment = async () => {
        if (!paymentMethod || !activeDraftId) return

        setIsProcessingPayment(true)

        try {
            // Complete the draft order
            const result = await completeDraft()

            if (result.success) {
                // Simulate payment processing delay
                await new Promise((resolve) => setTimeout(resolve, 1500))

                setIsProcessingPayment(false)
                setShowPaymentDialog(false)
                setShowReceiptDialog(true)

                // In a real app, you would process the payment here
                console.log(`Payment processed via ${paymentMethod}`)
            } else {
                throw new Error("Failed to complete draft order")
            }
        } catch (error) {
            console.error("Payment error:", error)
            toast.error("Payment failed", {
                description: error instanceof Error ? error.message : "An unknown error occurred",
            })
            setIsProcessingPayment(false)
        }
    }

    // Handle finishing transaction
    const handleFinishTransaction = () => {
        setShowReceiptDialog(false)
        setPaymentMethod(null)
        handleCreateNewDraft()
    }

    // Handle loading a draft order
    const handleLoadDraft = (draftId: string) => {
        // If current draft has items, confirm before replacing
        if (activeDraft?.lines?.length) {
            if (confirm("This will replace your current sale. Continue?")) {
                setActiveDraftId(draftId)
                setShowOnAccountSheet(false)
                toast.success("Draft loaded")
            }
        } else {
            setActiveDraftId(draftId)
            setShowOnAccountSheet(false)
            toast.success("Draft loaded")
        }
    }

    // Handle marking a draft as completed
    const handleMarkAsPaid = async (draftId: string) => {
        // Save current draft ID
        const currentDraftId = activeDraftId

        // Set the draft to complete as active
        setActiveDraftId(draftId)

        // Complete the draft
        const result = await completeDraft()

        if (result.success) {
            toast.success("Draft marked as paid")

            // Restore previous active draft
            setActiveDraftId(currentDraftId)
        } else {
            toast.error("Failed to mark draft as paid")
        }
    }

    // Calculate totals for the active draft
    const subtotal = activeDraft?.subtotal?.gross?.amount || 0
    const total = activeDraft?.total?.gross?.amount || 0
    const itemCount = activeDraft?.lines?.reduce((total: number, line: any) => total + line.quantity, 0) || 0

    return (
        <div className="max-w-6xl mx-auto flex flex-col bg-background">
            <header className="border-b bg-background z-10 sticky top-0">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold flex items-center">
                            <Sparkles className="h-5 w-5 text-amber-500 mr-1.5" />
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs flex justify-center items-center"
                            onClick={() => setShowOnAccountSheet(true)}
                        >
                            <FileText className="h-4 w-4 mr-1.5" />
                            On Account
                            {draftOrders.length > 0 && (
                                <Badge variant="secondary" className="ml-1.5">
                                    {draftOrders.length}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Products area */}
                <div className="w-2/3 flex flex-col h-full border-r">
                    <div className="p-2 border-b">
                        <div className="flex gap-2 mb-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    ref={searchInputRef}
                                    placeholder="Search products..."
                                    className="pl-8 pr-10 h-8 text-xs"
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
                            <div className="flex rounded-md">
                                <Button
                                    variant={viewMode === "grid" ? "default" : "ghost"}
                                    size="icon"
                                    className="h-8 w-10 rounded-none rounded-l-md"
                                    onClick={() => setViewMode("grid")}
                                >
                                    <LayoutGrid className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "ghost"}
                                    size="icon"
                                    className="h-8 w-10 rounded-none rounded-r-md"
                                    onClick={() => setViewMode("list")}
                                >
                                    <ListFilter className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-1 overflow-x-auto pb-1">
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? "default" : "outline"}
                                    size="sm"
                                    className="h-7"
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        {isLoading ? (
                            viewMode === "grid" ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-3">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <Card key={index} className="p-0 overflow-hidden rounded-sm">
                                            <CardContent className="p-1.5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <Skeleton className="h-4 w-3/4 mb-1" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                    <Skeleton className="h-6 w-6 rounded-full ml-2" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-0">
                                    <Table className="text-xs">
                                        <TableHeader className="sticky top-0 bg-background">
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Stock</TableHead>
                                                <TableHead className="w-[40px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Array.from({ length: 6 }).map((_, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Skeleton className="h-4 w-full" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4 w-16" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4 w-8" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-6 w-6 rounded-full" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )
                        ) : searchError ? (
                            <div className="text-center py-12">
                                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
                                <p className="text-destructive font-medium">Error loading products</p>
                                <p className="text-sm text-muted-foreground mt-1">{searchError.message}</p>
                                <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
                                    Retry
                                </Button>
                            </div>
                        ) : viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-3">
                                {sortedProducts.map((product) => {
                                    const price = getProductPrice(product)
                                    const stock = getProductStock(product)
                                    const category = getProductCategory(product)
                                    const isAvailable = stock > 0
                                    const variantName = product.variants && product.variants[0]?.name

                                    return (
                                        <Card
                                            key={product.id}
                                            className={`p-0 overflow-hidden rounded-sm transition-all cursor-pointer hover:shadow-md ${!isAvailable ? "opacity-60 cursor-not-allowed" : ""
                                                }`}
                                            onClick={() => isAvailable && handleAddProduct(product)}
                                        >
                                            <CardContent className="p-1.5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-normal line-clamp-1">
                                                            {product.name}{" "}
                                                            {variantName && <span className="text-[10px] text-green-700">({variantName})</span>}
                                                        </p>
                                                        <p className="text-sm font-normal mt-1">{formatCurrency(price)}</p>
                                                    </div>

                                                    {isAvailable ? (
                                                        <Button
                                                            size="sm"
                                                            className="h-6 w-6 rounded-full ml-2 bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleAddProduct(product)
                                                            }}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    ) : (
                                                        <Badge variant="outline" className="ml-2 h-4 text-xs font-light">
                                                            Out of stock
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="p-0">
                                <Table className="text-xs">
                                    <TableHeader className="sticky top-0 bg-background">
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead className="w-[40px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedProducts.map((product) => {
                                            const price = getProductPrice(product)
                                            const stock = getProductStock(product)
                                            const category = getProductCategory(product)
                                            const isAvailable = stock > 0
                                            const variantName = product.variants && product.variants[0]?.name

                                            return (
                                                <TableRow
                                                    key={product.id}
                                                    className={`cursor-pointer ${!isAvailable ? "opacity-60" : ""}`}
                                                    onClick={() => isAvailable && handleAddProduct(product)}
                                                >
                                                    <TableCell className="font-normal">
                                                        {product.name}
                                                        {variantName && <span className="text-xs text-green-700 ml-1">({variantName})</span>}
                                                    </TableCell>
                                                    <TableCell>{formatCurrency(price)}</TableCell>
                                                    <TableCell>{stock}</TableCell>
                                                    <TableCell>
                                                        {isAvailable ? (
                                                            <Button
                                                                size="sm"
                                                                className="h-6 w-6 rounded-full bg-green-600 hover:bg-green-700 text-white"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleAddProduct(product)
                                                                }}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        ) : (
                                                            <Badge variant="outline" className="h-4 text-xs font-light">Out of stock</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>

                                {sortedProducts.length === 0 && searchQuery && (
                                    <div className="text-center py-12">
                                        <PackageSearch className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                                        <p className="text-muted-foreground">No products found</p>
                                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => {
                                                setMissingProductName(searchQuery)
                                                setShowMissingProductDialog(true)
                                            }}
                                        >
                                            <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                                            Record Missing Product
                                        </Button>
                                    </div>
                                )}

                                {!searchQuery && (
                                    <div className="text-center py-12">
                                        <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                                        <p className="text-muted-foreground">Search for products</p>
                                        <p className="text-sm text-muted-foreground mt-1">Enter a product name or category</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <div className="w-1/3 flex flex-col h-full">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h2 className="text-lg font-normal flex items-center">
                            <ShoppingBag className="h-5 w-5 mr-2 text-muted-foreground" />
                            Current Sale
                        </h2>
                        {activeDraft?.userEmail && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {activeDraft.userEmail}
                            </Badge>
                        )}
                    </div>
                    <ScrollArea className="flex-1">
                        {activeDraft?.lines && activeDraft.lines.length > 0 ? (
                            <Table className="text-xs">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeDraft.lines.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{item.productName}</p>
                                                    {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-5"
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-7 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-5"
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency((item.price || 0) * item.quantity)}                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-5 text-destructive"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                >
                                                    <Trash2 className="h-3 w-3 stroke-1" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8">
                                <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                                <p className="text-muted-foreground">No items in sale</p>
                                <p className="text-sm text-muted-foreground mt-1">Add products to get started</p>
                            </div>
                        )}
                    </ScrollArea>

                    <POSCustomerLoyalty />
                    {activeDraft?.lines && activeDraft.lines.length > 0 && (
                        <div className="p-4 border-t">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>

                                <Separator className="my-2" />

                                <div className="flex justify-between pt-2 font-bold">
                                    <span>Total</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>

                                <div className="flex gap-2 pt-3">
                                    <Button variant="outline" className="flex-1 h-7 font-light text-xs" onClick={handlePutOnAccount}>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Put On Account
                                    </Button>

                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white h-7 font-light text-xs"
                                        disabled={!activeDraft?.lines?.length}
                                        onClick={handleCheckout}
                                    >
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Pay Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Sheet open={showOnAccountSheet} onOpenChange={setShowOnAccountSheet}>
                <SheetContent side="left" className="w-full sm:max-w-md p-0 flex flex-col">
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                            Draft Orders
                        </SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-1 p-4">
                        <div className="flex justify-between mb-4">
                            <h3 className="text-sm font-medium">Available On Account</h3>
                            <Button size="sm" className="h-7 text-xs font-light" onClick={handleCreateNewDraft}>
                                <Plus className="h-4 w-4 mr-1.5" />
                                New Draft
                            </Button>
                        </div>
                        {draftOrders.length > 0 ? (
                            <div className="space-y-2">
                                {draftOrders.map((draft) => (
                                    <Card key={draft.id} className="p-2 cursor-pointer hover:border-primary">
                                        <CardContent className="p-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <Badge className="font-light h-4 text-xs" variant="outline">
                                                    {draft.lines?.length || 0} items
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(draft.created).toLocaleString()}
                                                </span>
                                            </div>

                                            {draft.userEmail && (
                                                <div className="flex items-center gap-1 text-sm mb-1">
                                                    <User className="h-3 w-3" />
                                                    <span>{draft.userEmail}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm flex items-center gap-1">
                                                    <Tag className="h-3 w-3" />
                                                    {draft.lines
                                                        ?.slice(0, 2)
                                                        .map((line: any) => line.productName)
                                                        .join(", ")}
                                                    {(draft.lines?.length || 0) > 2 && "..."}
                                                </span>
                                                <span className="font-normal">{formatCurrency(draft.total?.gross?.amount || 0)}</span>
                                            </div>

                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-1/2 h-7 text-xs"
                                                    onClick={() => handleLoadDraft(draft.id)}
                                                >
                                                    <ArrowRight className="h-3 w-3 mr-1" />
                                                    Load Draft
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="w-1/2 h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => handleMarkAsPaid(draft.id)}
                                                >
                                                    <DollarSign className="h-3 w-3 mr-1" />
                                                    Mark As Paid
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No draft orders</p>
                                <Button variant="outline" className="mt-4 h-7 text-xs font-light" onClick={handleCreateNewDraft}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create New Draft
                                </Button>
                            </div>
                        )}
                    </ScrollArea>
                </SheetContent>
            </Sheet>
            {/* Payment Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-center font-light">Select Payment Method</DialogTitle>
                    </DialogHeader>

                    <div className="py-2">
                        <h3 className="text-xl mb-4 text-center font-bold">{formatCurrency(total)}</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Card
                                className={`cursor-pointer transition-all h-16 ${paymentMethod === "M-Pesa"
                                    ? "border-2 border-green-500 bg-green-50 dark:bg-green-950/20"
                                    : "border hover:border-primary"
                                    }`}
                                onClick={() => !isProcessingPayment && setPaymentMethod("M-Pesa")}
                            >
                                <CardContent className="p-1 flex items-center justify-center h-full">
                                    {isProcessingPayment && paymentMethod === "M-Pesa" ? (
                                        <div className="flex flex-col items-center">
                                            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mb-1"></div>
                                            <span className="text-sm">Processing...</span>
                                        </div>
                                    ) : (
                                        <div className="flex gap-1.5 justify-center items-center">
                                            <Smartphone className="h-5 w-5 mb-1 text-green-600" />
                                            <span className="font-medium">M-Pesa</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card
                                className={`cursor-pointer transition-all h-16 ${paymentMethod === "Cash"
                                    ? "border-2 border-green-500 bg-green-50 dark:bg-green-950/20"
                                    : "border hover:border-primary"
                                    }`}
                                onClick={() => !isProcessingPayment && setPaymentMethod("Cash")}
                            >
                                <CardContent className="p-1 flex items-center justify-center h-full">
                                    {isProcessingPayment && paymentMethod === "Cash" ? (
                                        <div className="flex flex-col items-center">
                                            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mb-1"></div>
                                            <span className="text-sm">Processing...</span>
                                        </div>
                                    ) : (
                                        <div className="flex gap-1.5 justify-center items-center">
                                            <Banknote className="h-5 w-5 mb-1 text-green-600" />
                                            <span className="font-medium">Cash</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card
                                className={`cursor-pointer transition-all h-16 ${paymentMethod === "Card"
                                    ? "border-2 border-green-500 bg-green-50 dark:bg-green-950/20"
                                    : "border hover:border-primary"
                                    }`}
                                onClick={() => !isProcessingPayment && setPaymentMethod("Card")}
                            >
                                <CardContent className="p-1 flex items-center justify-center h-full">
                                    {isProcessingPayment && paymentMethod === "Card" ? (
                                        <div className="flex flex-col items-center">
                                            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mb-1"></div>
                                            <span className="text-sm">Processing...</span>
                                        </div>
                                    ) : (
                                        <div className="flex gap-1.5 justify-center items-center">
                                            <CreditCard className="h-5 w-5 mb-1 text-blue-500" />
                                            <span className="font-medium">Card</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card
                                className={`cursor-pointer transition-all h-16 ${paymentMethod === "Split"
                                    ? "border-2 border-green-500 bg-green-50 dark:bg-green-950/20"
                                    : "border hover:border-primary"
                                    }`}
                                onClick={() => !isProcessingPayment && setPaymentMethod("Split")}
                            >
                                <CardContent className="p-1 flex items-center justify-center h-full">
                                    {isProcessingPayment && paymentMethod === "Split" ? (
                                        <div className="flex flex-col items-center">
                                            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mb-1"></div>
                                            <span className="text-sm">Processing...</span>
                                        </div>
                                    ) : (
                                        <div className="flex gap-1.5 justify-center items-center">
                                            <Percent className="h-5 w-5 mb-1 text-purple-500" />
                                            <span className="font-medium">Split</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            className="h-8 text-xs"
                            variant="outline"
                            onClick={() => setShowPaymentDialog(false)}
                            disabled={isProcessingPayment}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                            disabled={!paymentMethod || isProcessingPayment}
                            onClick={handleCompletePayment}
                        >
                            {isProcessingPayment ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Complete Payment"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Receipt Dialog */}
            <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-center">Payment Successful</DialogTitle>
                    </DialogHeader>

                    <div className="py-2 space-y-2">
                        <div className="flex justify-center">
                            <div className="h-14 w-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 6 }}
                                >
                                    <CheckCircle className="h-5 w-5" />
                                </motion.div>
                            </div>
                        </div>

                        <div className="text-center">
                            <h3 className="font-medium text-xl">Payment Received</h3>
                            <p className="text-sm text-muted-foreground mt-2">{`via ${paymentMethod}`}</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date().toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>

                        <div className="flex justify-center gap-2 pt-2">
                            <Button className="h-8 text-xs" variant="outline" onClick={handleFinishTransaction}>
                                New Sale
                            </Button>
                            <Button
                                onClick={handleFinishTransaction}
                                className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Printer className="h-4 w-4 mr-1" />
                                Print Receipt
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Missing Product Dialog */}
            <Dialog open={showMissingProductDialog} onOpenChange={setShowMissingProductDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Record Missing Product</DialogTitle>
                    </DialogHeader>

                    <div className="py-3">
                        <div className="flex items-center gap-2 p-1.5 border rounded-md bg-muted/20 mb-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            <div>
                                <p className="font-medium">{missingProductName}</p>
                                <p className="text-xs text-muted-foreground">Product not in inventory</p>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground mb-1">
                            Recording missing products helps track demand for products not currently in your inventory.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMissingProductDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                // In a real implementation, you would save this to your database
                                toast.success("Product request recorded", {
                                    description: `We've noted that "${missingProductName}" was requested`,
                                })
                                setShowMissingProductDialog(false)
                                setMissingProductName("")
                            }}
                        >
                            Record Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
