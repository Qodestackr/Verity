"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import {
    Package,
    Search,
    Loader2,
    Calendar,
    Truck,
    FileText,
    Plus,
    Trash2,
    Receipt,
    ArrowRight,
    AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import z from "@/lib/zod";
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useMutation } from "urql"
import { UpdateStockDocument, CreateStockDocument } from "@/gql/graphql"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import pLimit from "p-limit"
import { searchEngine, type MeilisearchHit } from "@/utils/search-engine"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const receivedItemSchema = z.object({
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    costPrice: z.coerce.number().min(1, "Cost price must be at least 1 KES"),
})

interface Supplier {
    id: string
    name: string
    contactPerson: string
    phone: string
    email: string
}

interface ReceivedItem {
    id: string
    product: any
    variant: any
    expectedQuantity: number
    receivedQuantity: number
    costPrice: number
    warehouseId: string
    isModified: boolean
    validationErrors?: string[]
}

interface ReceiptDetails {
    receiptNumber: string
    supplier: Supplier | null
    deliveryDate: Date
    paymentStatus: "paid" | "unpaid" | "partial"
    paymentMethod: "cash" | "credit" | "bank_transfer" | "mobile_money" | ""
    notes: string
    attachmentUrl?: string
}

const debugLog = (message: string, data?: any) => {
    console.log(`[Stock Receive Debug] ${new Date().toISOString()} - ${message}`, data)
}

export function StockReceivingForm() {

    const [receiptDetails, setReceiptDetails] = useState<ReceiptDetails>({
        receiptNumber: `GRN-${Date.now().toString().slice(-6)}`,
        supplier: null,
        deliveryDate: new Date(),
        paymentStatus: "unpaid",
        paymentMethod: "",
        notes: "",
    })

    const [items, setItems] = useState<ReceivedItem[]>([])
    const [activeCell, setActiveCell] = useState<{ row: number; col: string } | null>(null)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [showCalendar, setShowCalendar] = useState(false)
    const [activeTab, setActiveTab] = useState("details")
    const [supplierSearchQuery, setSupplierSearchQuery] = useState("")
    const [showSupplierSearch, setShowSupplierSearch] = useState(false)
    const [updateResults, setUpdateResults] = useState<{
        total: number
        success: number
        failed: number
        failedItems: Array<{ name: string; error: string }>
    }>({
        total: 0,
        success: 0,
        failed: 0,
        failedItems: [],
    })
    const [showResultsDialog, setShowResultsDialog] = useState(false)

    // Refs for cell navigation
    const cellRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

    // API data
    const mockSuppliers: Supplier[] = [
        {
            id: "sup_1",
            name: "Premium Beverages Ltd",
            contactPerson: "John Smith",
            phone: "0712345678",
            email: "john@premiumbev.com",
        },
        {
            id: "sup_2",
            name: "Global Spirits Distributors",
            contactPerson: "Sarah Johnson",
            phone: "0723456789",
            email: "sarah@globalspirits.com",
        },
        {
            id: "sup_3",
            name: "Vintage Wine Imports",
            contactPerson: "Michael Brown",
            phone: "0734567890",
            email: "michael@vintagewine.com",
        },
    ]

    const [isSearching, setIsSearching] = useState(false)
    const [searchError, setSearchError] = useState<Error | null>(null)
    const [searchData, setSearchData] = useState<MeilisearchHit[]>([])

    const [updateStockResult, updateStock] = useMutation(UpdateStockDocument)
    const [createStockResult, createStock] = useMutation(CreateStockDocument)

    useEffect(() => {
        if (items.length === 0) {
            // Create 1 empty row to start
            setItems([
                {
                    id: `item-${Date.now()}`,
                    product: null,
                    variant: null,
                    expectedQuantity: 0,
                    receivedQuantity: 0,
                    costPrice: 0,
                    warehouseId: "",
                    isModified: false,
                },
            ])
        }
    }, [])

    useEffect(() => {
        if (searchQuery.length > 1) {
            setIsLoading(true)

            const timer = setTimeout(async () => {
                try {
                    setIsSearching(true)

                    const hits = await searchEngine({
                        index: "products",
                        searchQuery: searchQuery,
                        limit: 20,
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
                } catch (error) {
                    console.error("Search error:", error)
                    setSearchError(error instanceof Error ? error : new Error("Search failed"))
                    setSearchData([])
                } finally {
                    setIsSearching(false)
                    setIsLoading(false)
                }
            }, 300)

            return () => clearTimeout(timer)
        } else if (searchQuery.length === 0) {
            // If search query is cleared, reset to initial state
            const resetSearch = async () => {
                try {
                    setIsSearching(true)
                    setIsLoading(true)

                    const hits = await searchEngine({
                        index: "products",
                        searchQuery: "",
                        limit: 20,
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
                } catch (error) {
                    console.error("Error resetting search:", error)
                } finally {
                    setIsSearching(false)
                    setIsLoading(false)
                }
            }

            resetSearch()
        } else {
            setSearchResults([])
        }
    }, [searchQuery])

    // useMemo for transforming Meilisearch hits to the expected product structure
    const searchedProducts = useMemo(() => {
        return searchData.map((hit: MeilisearchHit) => {
            // Transform Meilisearch hit to match the expected product structure
            const variant = hit.variants && hit.variants.length > 0 ? hit.variants[0] : null

            return {
                id: hit.id,
                name: hit.name,
                slug: hit.slug,
                category: hit.category
                    ? { name: typeof hit.category === "string" ? hit.category : "Uncategorized" }
                    : undefined,
                variants: variant
                    ? [
                        {
                            id: variant?.variantId || "",
                            name: variant?.name || "",
                            sku: variant?.sku || "",
                            quantityAvailable: hit.stock || 0,
                            pricing: {
                                price: {
                                    gross: {
                                        amount: hit.price || 0,
                                    },
                                },
                            },
                            stocks:
                                hit.stock !== undefined
                                    ? [
                                        {
                                            warehouse: {
                                                id:
                                                    process.env.NEXT_PUBLIC_DEFAULT_WAREHOUSE_ID ||
                                                    "V2FyZWhvdXNlOjNlMTUwNDRiLWIyNGUtNDA1Mi1hNWY1LTVhOTI3MTE5M2I5Nw==",
                                            },
                                            quantity: hit.stock,
                                        },
                                    ]
                                    : [],
                        },
                    ]
                    : [],
            }
        })
    }, [searchData])

    useEffect(() => {
        if (searchedProducts.length > 0) {
            setSearchResults(searchedProducts)
        }
    }, [searchedProducts])

    const handleCellFocus = (row: number, col: string) => {
        setActiveCell({ row, col })
        if (col === "product") {
            setSearchOpen(true)
        }
    }

    // Update product in a row
    const updateProduct = (rowIndex: number, product: any, variant: any) => {
        if (!product || !variant) return

        // Get warehouse info
        const warehouse = variant.stocks?.[0]?.warehouse || {
            id:
                process.env.NEXT_PUBLIC_DEFAULT_WAREHOUSE_ID ||
                "V2FyZWhvdXNlOjNlMTUwNDRiLWIyNGUtNDA1Mi1hNWY1LTVhOTI3MTE5M2I5Nw==",
        }

        const newItems = [...items]
        newItems[rowIndex] = {
            ...newItems[rowIndex],
            product,
            variant,
            expectedQuantity: 0, // This would come from a purchase order
            receivedQuantity: 0,
            costPrice: Math.round((variant.pricing?.price?.gross?.amount || 0) * 0.8), // Assuming cost price is 80% of selling
            warehouseId: warehouse?.id || "",
            isModified: true,
        }

        debugLog("Product updated", {
            rowIndex,
            product: product.name,
            variant: variant.name,
            warehouseId: warehouse.id,
        })

        setItems(newItems)
        setSearchOpen(false)
        setSearchQuery("")
        setTimeout(() => {
            const quantityCell = cellRefs.current[`quantity-${rowIndex}`]
            if (quantityCell) {
                quantityCell.focus()
                quantityCell.select()
            }
        }, 100)
    }

    const updateReceivedQuantity = (rowIndex: number, quantity: number | string) => {
        const newItems = [...items]
        const item = newItems[rowIndex]

        if (item.product) {
            newItems[rowIndex] = {
                ...item,
                receivedQuantity: quantity === "" ? "" : Number(quantity),
                isModified: true,
            }
            setItems(newItems)
        }
    }

    // Update cost price in a row
    const updateCostPrice = (rowIndex: number, costPrice: number | string) => {
        const newItems = [...items]
        const item = newItems[rowIndex]

        if (item.product) {
            newItems[rowIndex] = {
                ...item,
                costPrice: costPrice === "" ? "" : Number(costPrice),
                isModified: true,
            }
            setItems(newItems)
        }
    }

    const addRow = () => {
        setItems([
            ...items,
            {
                id: `item-${Date.now()}`,
                product: null,
                variant: null,
                expectedQuantity: 0,
                receivedQuantity: 0,
                costPrice: 0,
                warehouseId: "",
                isModified: false,
            },
        ])
    }

    const removeRow = (index: number) => {
        const newItems = [...items]
        newItems.splice(index, 1)
        setItems(newItems)
    }

    const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, col: string) => {
        if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault()

            // Move to next cell based on current column
            if (col === "product") {
                // Move to quantity
                const quantityCell = cellRefs.current[`quantity-${rowIndex}`]
                if (quantityCell) {
                    quantityCell.focus()
                    quantityCell.select()
                }
            } else if (col === "quantity") {
                // Move to cost price
                const costPriceCell = cellRefs.current[`costPrice-${rowIndex}`]
                if (costPriceCell) {
                    costPriceCell.focus()
                    costPriceCell.select()
                }
            } else if (col === "costPrice") {
                // Move to next row's product
                if (rowIndex < items.length - 1) {
                    const nextProductCell = cellRefs.current[`product-${rowIndex + 1}`]
                    if (nextProductCell) {
                        nextProductCell.focus()
                    }
                } else {
                    // Add a new row if at the last row
                    addRow()
                    setTimeout(() => {
                        const nextProductCell = cellRefs.current[`product-${items.length}`]
                        if (nextProductCell) {
                            nextProductCell.focus()
                        }
                    }, 100)
                }
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault()
            // Move to the same column in the next row
            if (rowIndex < items.length - 1) {
                const nextCell = cellRefs.current[`${col}-${rowIndex + 1}`]
                if (nextCell) {
                    nextCell.focus()
                    nextCell.select()
                }
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            // Move to the same column in the previous row
            if (rowIndex > 0) {
                const prevCell = cellRefs.current[`${col}-${rowIndex - 1}`]
                if (prevCell) {
                    prevCell.focus()
                    prevCell.select()
                }
            }
        }
    }

    // Filter suppliers based on search query
    const filteredSuppliers = mockSuppliers.filter(
        (supplier) =>
            supplier.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
            supplier.contactPerson.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
            supplier.phone.includes(supplierSearchQuery),
    )

    // Select a supplier
    const selectSupplier = (supplier: Supplier) => {
        setReceiptDetails((prev) => ({
            ...prev,
            supplier,
        }))
        setShowSupplierSearch(false)
    }

    // Calc totals
    const totalItems = items.reduce((sum, item) => sum + (item.product ? 1 : 0), 0)
    const totalQuantity = items.reduce((sum, item) => sum + (Number(item.receivedQuantity) || 0), 0)
    const totalValue = items.reduce(
        (sum, item) => sum + (Number(item.receivedQuantity) || 0) * (Number(item.costPrice) || 0),
        0,
    )

    // Save the stock receipt
    // Replace the saveStockReceipt function with a more resilient implementation using p-limit
    const saveStockReceipt = async () => {
        // Validate receipt details
        if (!receiptDetails.supplier) {
            toast.error("Missing supplier", {
                description: "Please select a supplier for this delivery",
            })
            setActiveTab("details")
            return
        }

        const validItems = items.filter((item) => item.product && Number(item.receivedQuantity) > 0)
        if (validItems.length === 0) {
            toast.error("No items to receive", {
                description: "Please add at least one product with quantity",
            })
            setActiveTab("items")
            return
        }

        const validationErrors: Record<string, string[]> = {}
        validItems.forEach((item, index) => {
            try {
                receivedItemSchema.parse({
                    quantity: item.receivedQuantity,
                    costPrice: item.costPrice,
                })
            } catch (error) {
                if (error instanceof z.ZodError) {
                    validationErrors[index] = error.errors.map((err) => err.message)
                }
            }
        })

        if (Object.keys(validationErrors).length > 0) {
            const errorCount = Object.keys(validationErrors).length
            toast.error(`Validation failed for ${errorCount} item${errorCount > 1 ? "s" : ""}`, {
                description: "Please correct the highlighted fields",
                duration: 5000,
            })

            const newItems = [...items]
            Object.entries(validationErrors).forEach(([index, errors]) => {
                const rowIndex = Number.parseInt(index)
                newItems[rowIndex] = {
                    ...newItems[rowIndex],
                    validationErrors: errors,
                }
            })
            setItems(newItems)
            setActiveTab("items")
            return
        }

        setIsSaving(true)

        // Create a progress toast that we'll update
        const progressToastId = toast.loading(`Updating 0/${validItems.length} products...`)

        try {
            // Create a stock receipt record in your database
            // This would typically be done via a server action or API route
            const receiptData = {
                receiptNumber: receiptDetails.receiptNumber,
                supplierId: receiptDetails.supplier.id,
                supplierName: receiptDetails.supplier.name,
                deliveryDate: receiptDetails.deliveryDate.toISOString(),
                paymentStatus: receiptDetails.paymentStatus,
                paymentMethod: receiptDetails.paymentMethod,
                notes: receiptDetails.notes,
                totalItems: validItems.length,
                totalQuantity: totalQuantity,
                totalValue: totalValue,
                items: validItems.map((item) => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    variantId: item.variant.id,
                    variantName: item.variant.name,
                    quantity: Number(item.receivedQuantity),
                    costPrice: Number(item.costPrice),
                    totalCost: Number(item.receivedQuantity) * Number(item.costPrice),
                })),
            }

            debugLog("Receipt data prepared", receiptData)

            const limit = pLimit(5)
            let completedCount = 0
            let successCount = 0
            let failedCount = 0
            const failedItems: Array<{ name: string; error: string }> = []

            // Prepare all update promises
            const updatePromises = validItems.map((item) => {
                return limit(async () => {
                    try {
                        debugLog("Processing item", {
                            product: item.product.name,
                            variant: item.variant.name,
                            quantity: item.receivedQuantity,
                        })

                        if (!item.warehouseId) {
                            throw new Error(`No warehouse ID for ${item.product.name}`)
                        }

                        // Calc the new total quantity
                        const currentQuantity = item.variant.quantityAvailable || 0
                        const newQuantity = currentQuantity + Number(item.receivedQuantity)

                        debugLog("Stock update details", {
                            variantId: item.variant.id,
                            warehouseId: item.warehouseId,
                            currentQuantity,
                            receivedQuantity: item.receivedQuantity,
                            newQuantity,
                        })

                        // First try to update existing stock
                        const updateResult = await updateStock({
                            variantId: item.variant.id,
                            warehouseId: item.warehouseId,
                            quantity: newQuantity,
                        })

                        debugLog("Stock update result", updateResult)

                        if (updateResult.error) {
                            throw new Error(`Stock update failed: ${updateResult.error.message}`)
                        }

                        if (updateResult.data?.productVariantStocksUpdate?.errors?.length) {
                            // If update fails, try creating new stock
                            debugLog("Update failed, attempting create", {
                                variantId: item.variant.id,
                                warehouseId: item.warehouseId,
                            })

                            const createResult = await createStock({
                                variantId: item.variant.id,
                                input: [
                                    {
                                        warehouse: item.warehouseId,
                                        quantity: newQuantity,
                                    },
                                ],
                            })

                            if (createResult.error) {
                                throw new Error(`Stock creation failed: ${createResult.error.message}`)
                            }

                            if (createResult.data?.productVariantStocksCreate?.errors?.length) {
                                const errorMessage = createResult.data.productVariantStocksCreate.errors[0].message
                                throw new Error(`Stock creation failed: ${errorMessage}`)
                            }
                        }

                        return { success: true, item }
                    } catch (error) {
                        return {
                            success: false,
                            item,
                            error: error instanceof Error ? error.message : "Unknown error",
                        }
                    } finally {
                        completedCount++
                        toast.loading(`Updating ${completedCount}/${validItems.length} products...`, {
                            id: progressToastId,
                        })
                    }
                })
            })

            const results = await Promise.all(updatePromises)

            // Process results
            results.forEach((result) => {
                if (result.success) {
                    successCount++
                } else {
                    failedCount++
                    failedItems.push({
                        name: `${result.item.product.name} - ${result.item.variant.name}`,
                        error: result.error || "Unknown error",
                    })
                    debugLog("Error updating stock", {
                        product: result.item.product.name,
                        error: result.error,
                    })
                }
            })

            // Update the toast with final result
            if (failedCount === 0) {
                toast.success(`Updated ${successCount} product${successCount > 1 ? "s" : ""} successfully`, {
                    id: progressToastId,
                    duration: 3000,
                })
            } else {
                toast.error(`${failedCount} update${failedCount > 1 ? "s" : ""} failed`, {
                    id: progressToastId,
                    description: `${successCount} product${successCount > 1 ? "s" : ""} updated successfully`,
                    duration: 5000,
                })
            }

            // Store update results
            setUpdateResults({
                total: validItems.length,
                success: successCount,
                failed: failedCount,
                failedItems,
            })

            if (validItems.length > 3 || failedCount > 0) {
                setShowResultsDialog(true)
            }

            // If at least some items were successful, trigger a webhook to notify Saleor
            if (successCount > 0) {
                try {
                    // This would be a server action or API route in your app
                    await triggerSaleorWebhook(receiptData)
                    debugLog("Saleor webhook triggered successfully")
                } catch (error) {
                    debugLog("Error triggering Saleor webhook", error)
                    toast.error("Failed to notify Saleor about stock update", {
                        description: "The stock was updated but the system may need to be synced",
                    })
                }
            }

            // If all items were successful, reset the form
            if (failedCount === 0) {
                // Reset form for next receipt
                setReceiptDetails({
                    receiptNumber: `GRN-${Date.now().toString().slice(-6)}`,
                    supplier: null,
                    deliveryDate: new Date(),
                    paymentStatus: "unpaid",
                    paymentMethod: "",
                    notes: "",
                })

                setItems([
                    {
                        id: `item-${Date.now()}`,
                        product: null,
                        variant: null,
                        expectedQuantity: 0,
                        receivedQuantity: 0,
                        costPrice: 0,
                        warehouseId: "",
                        isModified: false,
                    },
                ])

                setActiveTab("details")
            }
        } catch (error) {
            console.error("Error receiving stock:", error)
            toast.error("Failed to receive stock", {
                description: error instanceof Error ? error.message : "An unexpected error occurred",
                duration: 5000,
            })
        } finally {
            setIsSaving(false)
        }
    }

    const triggerSaleorWebhook = async (receiptData: any) => {
        // API route to send a webhook to Saleor to notify about the stock update

        // For now, we'll just simulate a successful webhook call
        return new Promise((resolve) => {
            setTimeout(resolve, 500)
        })
    }

    return (
        <div className="mx-auto py-4 max-w-5xl">
            <Card className="border-0 shadow-md bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
                <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl font-light">
                                <Truck className="h-5 w-5 text-green-800" />
                                Stock Receiving
                            </CardTitle>
                            <CardDescription className="font-light">Record incoming stock deliveries from suppliers</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={saveStockReceipt}
                                disabled={isSaving}
                                className="h-8 text-xs bg-green-800 hover:bg-green-700 text-white"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Receipt className="mr-2 h-3 w-3" />
                                        Receive Stock
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full rounded-none border-b">
                            <TabsTrigger
                                value="details"
                                className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-700"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Receipt Details
                            </TabsTrigger>
                            <TabsTrigger
                                value="items"
                                className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-700"
                            >
                                <Package className="h-4 w-4 mr-2" />
                                Received Items
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="receipt-number">Receipt/Delivery Note #</Label>
                                    <Input
                                        id="receipt-number"
                                        value={receiptDetails.receiptNumber}
                                        onChange={(e) => setReceiptDetails((prev) => ({ ...prev, receiptNumber: e.target.value }))}
                                        placeholder="Enter receipt number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="delivery-date">Delivery Date</Label>
                                    <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {receiptDetails.deliveryDate ? format(receiptDetails.deliveryDate, "PPP") : "Select date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <CalendarComponent
                                                mode="single"
                                                selected={receiptDetails.deliveryDate}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        setReceiptDetails((prev) => ({ ...prev, deliveryDate: date }))
                                                        setShowCalendar(false)
                                                    }
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label>Supplier</Label>
                                    <Popover open={showSupplierSearch} onOpenChange={setShowSupplierSearch}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
                                                <Truck className="mr-2 h-4 w-4" />
                                                {receiptDetails.supplier ? receiptDetails.supplier.name : "Select supplier"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput
                                                    placeholder="Search suppliers..."
                                                    value={supplierSearchQuery}
                                                    onValueChange={setSupplierSearchQuery}
                                                />
                                                <CommandList>
                                                    <CommandEmpty>No suppliers found</CommandEmpty>
                                                    <CommandGroup>
                                                        {filteredSuppliers.map((supplier) => (
                                                            <CommandItem
                                                                key={supplier.id}
                                                                value={supplier.name}
                                                                onSelect={() => selectSupplier(supplier)}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span>{supplier.name}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {supplier.contactPerson} • {supplier.phone}
                                                                    </span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label>Payment Status</Label>
                                    <div className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="paid"
                                                checked={receiptDetails.paymentStatus === "paid"}
                                                onCheckedChange={() => setReceiptDetails((prev) => ({ ...prev, paymentStatus: "paid" }))}
                                            />
                                            <label
                                                htmlFor="paid"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Paid
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="unpaid"
                                                checked={receiptDetails.paymentStatus === "unpaid"}
                                                onCheckedChange={() => setReceiptDetails((prev) => ({ ...prev, paymentStatus: "unpaid" }))}
                                            />
                                            <label
                                                htmlFor="unpaid"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Unpaid
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="partial"
                                                checked={receiptDetails.paymentStatus === "partial"}
                                                onCheckedChange={() => setReceiptDetails((prev) => ({ ...prev, paymentStatus: "partial" }))}
                                            />
                                            <label
                                                htmlFor="partial"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Partial
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {receiptDetails.paymentStatus === "paid" || receiptDetails.paymentStatus === "partial" ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="payment-method">Payment Method</Label>
                                        <Select
                                            value={receiptDetails.paymentMethod}
                                            onValueChange={(value) => setReceiptDetails((prev) => ({ ...prev, paymentMethod: value as any }))}
                                        >
                                            <SelectTrigger id="payment-method">
                                                <SelectValue placeholder="Select payment method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="credit">Credit/Debit Card</SelectItem>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : null}

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={receiptDetails.notes}
                                        onChange={(e) => setReceiptDetails((prev) => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Enter any additional notes about this delivery"
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={() => setActiveTab("items")} className="bg-green-800 hover:bg-green-700">
                                    Continue to Items <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="items" className="p-0">
                            <div className="p-4">
                                <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Important</AlertTitle>
                                    <AlertDescription>
                                        Items added here will update your Saleor inventory. Make sure quantities and cost prices are
                                        correct.
                                    </AlertDescription>
                                </Alert>
                            </div>

                            <div className="overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                            <TableHead className="w-[40px] text-xs font-medium">#</TableHead>
                                            <TableHead className="w-[40%] text-xs font-medium">Product</TableHead>
                                            <TableHead className="text-xs font-medium">Received Qty</TableHead>
                                            <TableHead className="text-xs font-medium">Cost Price (KES)</TableHead>
                                            <TableHead className="text-xs font-medium">Total (KES)</TableHead>
                                            <TableHead className="w-[40px] text-xs font-medium"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, index) => (
                                            <TableRow
                                                key={item.id}
                                                className={cn(
                                                    "h-[52px] hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                                    activeCell?.row === index ? "bg-green-50/50 dark:bg-green-900/10" : "",
                                                    item.isModified ? "bg-green-50 dark:bg-green-900/20" : "",
                                                    item.validationErrors ? "bg-red-50 dark:bg-red-900/10 border-l-2 border-red-500" : "",
                                                )}
                                            >
                                                <TableCell className="text-xs font-medium text-slate-500">{index + 1}</TableCell>
                                                <TableCell>
                                                    <Popover
                                                        open={searchOpen && activeCell?.row === index && activeCell?.col === "product"}
                                                        onOpenChange={(open) => {
                                                            if (!open) {
                                                                setSearchOpen(false)
                                                            }
                                                        }}
                                                    >
                                                        <PopoverTrigger asChild>
                                                            <div className="relative">
                                                                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                                                <Input
                                                                    id={`product-${index}`}
                                                                    ref={(el) => (cellRefs.current[`product-${index}`] = el)}
                                                                    placeholder="Search product..."
                                                                    value={item.product?.name || searchQuery}
                                                                    onChange={(e) => {
                                                                        setSearchQuery(e.target.value)
                                                                        setIsLoading(true)
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleCellFocus(index, "product")
                                                                        setSearchOpen(true)
                                                                    }}
                                                                    onFocus={(e) => {
                                                                        e.stopPropagation()
                                                                        handleCellFocus(index, "product")
                                                                        setSearchOpen(true)
                                                                    }}
                                                                    onKeyDown={(e) => handleKeyDown(e, index, "product")}
                                                                    className={cn(
                                                                        "pl-8 h-9 text-xs w-full",
                                                                        item.product ? "border-green-200 dark:border-green-800" : "",
                                                                        item.isModified ? "bg-green-50 dark:bg-green-900/10" : "",
                                                                    )}
                                                                />
                                                                {item.product && item.variant && (
                                                                    <div className="absolute right-2 top-2">
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="h-5 text-[10px] font-normal bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                                                        >
                                                                            {item.variant.name}
                                                                        </Badge>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            collisionPadding={10}
                                                            avoidCollisions={true}
                                                            className="p-0 h-[300px] w-[400px]"
                                                            align="start"
                                                            side="bottom"
                                                            sideOffset={5}
                                                        >
                                                            <Command>
                                                                <CommandInput
                                                                    placeholder="Search by name, SKU or category..."
                                                                    value={searchQuery}
                                                                    onValueChange={setSearchQuery}
                                                                    onFocus={(e) => e.stopPropagation()}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="text-xs"
                                                                />
                                                                <CommandList>
                                                                    <CommandEmpty>
                                                                        {isLoading ? (
                                                                            <div className="flex items-center justify-center p-4">
                                                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                                <span className="text-xs">Searching inventory...</span>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="py-6 text-center text-xs text-slate-500">
                                                                                <Package className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                                                                                No matching products found
                                                                            </div>
                                                                        )}
                                                                    </CommandEmpty>
                                                                    <CommandGroup>
                                                                        <ScrollArea className="h-[280px]">
                                                                            {searchResults.map((product) => (
                                                                                <div key={product.id}>
                                                                                    {product.variants.map((variant: any) => (
                                                                                        <CommandItem
                                                                                            key={variant.id}
                                                                                            value={`${product.name} ${variant.name}`}
                                                                                            onSelect={() => updateProduct(index, product, variant)}
                                                                                            className="flex items-start py-2"
                                                                                        >
                                                                                            <div className="flex flex-col">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <span className="font-medium">{product.name}</span>
                                                                                                    <Badge
                                                                                                        variant="outline"
                                                                                                        className="h-5 text-[10px] font-normal bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800"
                                                                                                    >
                                                                                                        {variant.name}
                                                                                                    </Badge>
                                                                                                </div>
                                                                                                <div className="flex gap-3 mt-1">
                                                                                                    <span className="text-[10px] text-slate-500">
                                                                                                        Stock:{" "}
                                                                                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                                                                                            {variant.quantityAvailable}
                                                                                                        </span>
                                                                                                    </span>
                                                                                                    <span className="text-[10px] text-slate-500">
                                                                                                        Price:{" "}
                                                                                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                                                                                            KES {variant.pricing?.price?.gross?.amount.toLocaleString() || 0}
                                                                                                        </span>
                                                                                                    </span>
                                                                                                    <span className="text-[10px] text-slate-500">
                                                                                                        {product.category?.name || ""}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </CommandItem>
                                                                                    ))}
                                                                                </div>
                                                                            ))}
                                                                        </ScrollArea>
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        id={`quantity-${index}`}
                                                        ref={(el) => (cellRefs.current[`quantity-${index}`] = el)}
                                                        type="number"
                                                        min="0"
                                                        value={item.receivedQuantity || ""}
                                                        onChange={(e) => updateReceivedQuantity(index, e.target.value)}
                                                        onFocus={() => handleCellFocus(index, "quantity")}
                                                        onKeyDown={(e) => handleKeyDown(e, index, "quantity")}
                                                        className={cn(
                                                            "h-9 text-xs w-20",
                                                            item.isModified ? "bg-green-50 dark:bg-green-900/10" : "",
                                                            !item.product ? "bg-slate-50 cursor-not-allowed dark:bg-slate-800/50" : "",
                                                            item.validationErrors?.includes("Quantity must be at least 1") ? "border-red-500" : "",
                                                        )}
                                                        disabled={!item.product}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        id={`costPrice-${index}`}
                                                        ref={(el) => (cellRefs.current[`costPrice-${index}`] = el)}
                                                        type="number"
                                                        min="0"
                                                        value={item.costPrice || ""}
                                                        onChange={(e) => updateCostPrice(index, e.target.value)}
                                                        onFocus={() => handleCellFocus(index, "costPrice")}
                                                        onKeyDown={(e) => handleKeyDown(e, index, "costPrice")}
                                                        className={cn(
                                                            "h-9 text-xs w-24",
                                                            item.isModified ? "bg-green-50 dark:bg-green-900/10" : "",
                                                            !item.product ? "bg-slate-50 cursor-not-allowed dark:bg-slate-800/50" : "",
                                                            item.validationErrors?.includes("Cost price must be at least 1 KES")
                                                                ? "border-red-500"
                                                                : "",
                                                        )}
                                                        disabled={!item.product}
                                                    />
                                                </TableCell>

                                                <TableCell className="text-xs font-medium">
                                                    {item.product
                                                        ? `KES ${((Number(item.receivedQuantity) || 0) * (Number(item.costPrice) || 0)).toLocaleString()}`
                                                        : "-"}
                                                </TableCell>

                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeRow(index)}
                                                        className="h-7 w-7 rounded-full"
                                                        disabled={items.length === 1}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                                                    </Button>
                                                </TableCell>
                                                {item.validationErrors && (
                                                    <div className="absolute -bottom-4 left-0 right-0 bg-red-50 dark:bg-red-900/10 px-4 py-1 text-xs text-red-600 dark:text-red-400 z-10 shadow-sm">
                                                        {item.validationErrors.map((error, i) => (
                                                            <div key={i}>{error}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="p-4 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={addRow}
                                    className="h-8 text-xs border-dashed border-slate-300 dark:border-slate-700"
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    Add Product Row
                                </Button>
                            </div>

                            <div className="p-4 border-t bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="text-xs text-slate-500">
                                            <span className="font-medium">Receipt Summary</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-xs text-slate-500">Total Items:</span>
                                                <p className="font-medium">{totalItems}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-500">Total Quantity:</span>
                                                <p className="font-medium">{totalQuantity}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-500">Total Value:</span>
                                                <p className="font-medium">KES {totalValue.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setActiveTab("details")}>
                                            Back to Details
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={saveStockReceipt}
                                            disabled={isSaving}
                                            className="h-8 text-xs bg-green-900 hover:bg-green-700 text-white"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Receipt className="mr-2 h-3.5 w-3.5" />
                                                    Receive Stock
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <div className="text-center text-xs text-slate-500 mt-2">
                <p>Tip: Use Tab or Enter to navigate between cells</p>
            </div>

            <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Stock Receiving Results</DialogTitle>
                        <DialogDescription>Summary of all stock updates that were processed</DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="flex justify-between items-center mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                            <div className="text-sm">Total Products:</div>
                            <div className="font-medium">{updateResults.total}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                                <div className="text-green-600 dark:text-green-400 font-medium text-lg">{updateResults.success}</div>
                                <div className="text-xs text-green-600 dark:text-green-400">Successfully Updated</div>
                            </div>

                            <div className="flex flex-col items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                                <div className="text-red-600 dark:text-red-400 font-medium text-lg">{updateResults.failed}</div>
                                <div className="text-xs text-red-600 dark:text-red-400">Failed Updates</div>
                            </div>
                        </div>

                        {updateResults.failedItems.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-2">Failed Items:</h4>
                                <div className="max-h-[200px] overflow-y-auto border rounded-md">
                                    {updateResults.failedItems.map((item, index) => (
                                        <div key={index} className="p-2 text-xs border-b last:border-b-0">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-red-500 mt-1">{item.error}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setShowResultsDialog(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
