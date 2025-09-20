"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { Plus, Save, Trash2, Loader2, Search, CheckCircle, Package, Sparkles, Keyboard, Edit } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import z from "@/lib/zod";

import { MeilisearchHit, searchEngine } from "@/utils/search-engine"

// GraphQL and batching
import pLimit from "p-limit"
import { useMutation } from "urql"
import { UpdateStockDocument, SetProductVariantPriceDocument, CreateStockDocument } from "@/gql/graphql"

// Add a detailed summary modal to show batch update results
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Validation schema for price updates
const priceUpdateSchema = z.object({
    price: z.coerce.number().min(0.01, "Price must be at least 0.01 KES"),
    costPrice: z.coerce.number().min(0.01, "Cost price must be at least 0.01 KES"),
})

// Validation schema for stock updates
const stockUpdateSchema = z.object({
    quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
})

interface InventoryRow {
    id: string
    product: any
    variant: any
    quantity: number
    buyingPrice: number
    sellingPrice: number
    costPrice: number
    warehouseId: string
    channelId: string
    isModified: boolean
    isNew?: boolean
    validationErrors?: string[]
}

// Enhanced logger
const debugLog = (message: string, data?: any) => {
    console.log(`[Stock Debug] ${new Date().toISOString()} - ${message}`, data)
}

export default function PremiumInventorySpreadsheet() {
    const [rows, setRows] = useState<InventoryRow[]>([])
    const [activeCell, setActiveCell] = useState<{ row: number; col: string } | null>(null)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [showResultsDialog, setShowResultsDialog] = useState(false)
    const [bulkEditMode, setBulkEditMode] = useState(false)
    const [selectedRows, setSelectedRows] = useState<string[]>([])

    // Channel ID - from context or props
    const channelId = "Q2hhbm5lbDoz"

    // Refs for cell navigation
    const cellRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

    // Update results state
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

    // Batch progress state
    const [batchProgress, setBatchProgress] = useState<{
        total: number
        completed: number
        visible: boolean
    }>({
        total: 0,
        completed: 0,
        visible: false,
    })

    // Bulk edit state
    const [bulkEditValue, setBulkEditValue] = useState<{
        field: "sellingPrice" | "costPrice" | null | any
        value: string
        operation: "set" | "increase" | "decrease" | "margin"
    }>({
        field: null,
        value: "",
        operation: "set",
    })

    // Replace the sortConfig state:
    const [sortConfig, setSortConfig] = useState<{
        field: string
        direction: string
    }>({
        field: "name",
        direction: "asc",
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [endCursor, setEndCursor] = useState<string | null | any>(null)
    const productsPerPage = 20

    // Add these state variables:
    const [isSearching, setIsSearching] = useState(false)
    const [searchError, setSearchError] = useState<Error | null>(null)
    const [searchData, setSearchData] = useState<MeilisearchHit[]>([])

    // GraphQL mutations
    const [updatePriceResult, updatePrice] = useMutation(SetProductVariantPriceDocument)
    const [updateStockResult, updateStock] = useMutation(UpdateStockDocument)
    const [createStockResult, createStock] = useMutation(CreateStockDocument)

    // Remove this GraphQL query:
    // const [searchQueryResult, executeSearch] = useQuery({
    //     query: SearchProductsSortedDocument,
    //     variables: {
    //         search: searchQuery.toUpperCase(),
    //         sortBy: sortConfig.field,
    //         sortDirection: sortConfig.direction,
    //         first: productsPerPage,
    //         after: endCursor,
    //         channel: "century-consults",
    //     },
    //     pause: true, // We'll manually fetch when needed
    // })

    // Replace the searchedProducts useMemo:
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
                            id: variant.variantId || "",
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
                            stocks:
                                hit.stock !== undefined
                                    ? [
                                        {
                                            warehouse: {
                                                id: "V2FyZWhvdXNlOjNlMTUwNDRiLWIyNGUtNDA1Mi1hNWY1LTVhOTI3MTE5M2I5Nw==",
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

    // Replace the pagination effect:
    useEffect(() => {
        // For Meilisearch, we'll handle pagination differently
        // This is a simplified version - you may need to adjust based on your Meilisearch setup
        setHasNextPage(searchData.length >= productsPerPage)
    }, [searchData, productsPerPage])

    // Replace the loadMoreProducts function:
    const loadMoreProducts = async () => {
        if (hasNextPage && !isSearching) {
            setCurrentPage((prev) => prev + 1)

            try {
                setIsSearching(true)
                // offset-based or cursor-based pagination
                const hits = await searchEngine({
                    index: "products",
                    searchQuery: searchQuery,
                    limit: productsPerPage,
                    offset: currentPage * productsPerPage,
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

                // Append new results to existing ones
                setSearchData((prev) => [...prev, ...hits])
            } catch (error) {
                console.error("Error loading more products:", error)
                setSearchError(error instanceof Error ? error : new Error("Failed to load more products"))
            } finally {
                setIsSearching(false)
            }
        }
    }

    // Replace the handleSortChange function:
    const handleSortChange = async (field: string, direction: string) => {
        setSortConfig({ field, direction })
        setCurrentPage(1)
        setEndCursor(null)

        try {
            setIsSearching(true)
            setIsLoading(true)

            // Convert field and direction to Meilisearch sort format
            // This is a simplified example - adjust based on your Meilisearch setup
            const sortBy = [`${field}:${direction}`]

            const hits = await searchEngine({
                index: "products",
                searchQuery: searchQuery,
                limit: productsPerPage,
                sort: sortBy,
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
            console.error("Error sorting products:", error)
            setSearchError(error instanceof Error ? error : new Error("Failed to sort products"))
        } finally {
            setIsSearching(false)
            setIsLoading(false)
        }
    }

    // Initialize with empty rows
    useEffect(() => {
        if (rows.length === 0) {
            // Create 1 empty row to start
            setRows([
                {
                    id: `row-${Date.now()}`,
                    product: null,
                    variant: null,
                    quantity: 0,
                    buyingPrice: 0,
                    sellingPrice: 0,
                    costPrice: 0,
                    warehouseId: "",
                    channelId,
                    isModified: false,
                },
            ])
        }
    }, [])

    // Replace the initial search execution effect:
    useEffect(() => {
        const initialSearch = async () => {
            try {
                setIsSearching(true)
                setIsLoading(true)

                const hits = await searchEngine({
                    index: "products",
                    searchQuery: "", // Empty query to get all products
                    limit: productsPerPage,
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
                console.error("Error in initial search:", error)
                setSearchError(error instanceof Error ? error : new Error("Failed to load initial products"))
            } finally {
                setIsSearching(false)
                setIsLoading(false)
            }
        }

        initialSearch()
    }, [])

    // Replace the search products effect:
    useEffect(() => {
        if (searchQuery.length > 1) {
            setIsLoading(true)
            setCurrentPage(1)
            setEndCursor(null)

            const timer = setTimeout(async () => {
                try {
                    setIsSearching(true)

                    // Convert sort config to Meilisearch format
                    const sortBy = [`${sortConfig.field}:${sortConfig.direction}`]

                    const hits = await searchEngine({
                        index: "products",
                        searchQuery: searchQuery,
                        limit: productsPerPage,
                        sort: sortBy,
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
                        limit: productsPerPage,
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
    }, [searchQuery, sortConfig])

    // Update the search results effect:
    useEffect(() => {
        if (searchedProducts.length > 0) {
            setSearchResults(searchedProducts)
        }
    }, [searchedProducts])

    // Handle cell focus
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
            id: "V2FyZWhvdXNlOjNlMTUwNDRiLWIyNGUtNDA1Mi1hNWY1LTVhOTI3MTE5M2I5Nw==",
        }

        const newRows = [...rows]
        newRows[rowIndex] = {
            ...newRows[rowIndex],
            product,
            variant,
            quantity: variant.quantityAvailable || 0,
            buyingPrice: Math.round((variant.pricing?.price?.gross?.amount || 0) * 0.8), // Assuming 20% margin
            sellingPrice: variant.pricing?.price?.gross?.amount || 0,
            costPrice: Math.round((variant.pricing?.price?.gross?.amount || 0) * 0.8), // Assuming cost price is 80% of selling
            warehouseId: warehouse?.id || "",
            channelId,
            isModified: true,
        }

        debugLog("Product updated", {
            rowIndex,
            product: product.name,
            variant: variant.name,
            warehouseId: warehouse.id,
        })

        setRows(newRows)
        setSearchOpen(false)
        setSearchQuery("")

        // Focus on quantity cell
        setTimeout(() => {
            const quantityCell = cellRefs.current[`quantity-${rowIndex}`]
            if (quantityCell) {
                quantityCell.focus()
                quantityCell.select()
            }
        }, 100)
    }

    // Update quantity in a row
    const updateQuantity = (rowIndex: number, quantity: number | string) => {
        const newRows = [...rows]
        const row = newRows[rowIndex]

        if (row.product) {
            newRows[rowIndex] = {
                ...row,
                quantity,
                isModified: true,
            }
            setRows(newRows)
        }
    }

    // Update buying price in a row
    const updateBuyingPrice = (rowIndex: number, buyingPrice: number) => {
        const newRows = [...rows]
        const row = newRows[rowIndex]

        if (row.product) {
            newRows[rowIndex] = {
                ...row,
                buyingPrice,
                isModified: true,
            }
            setRows(newRows)
        }
    }

    // Update cost price in a row
    const updateCostPrice = (rowIndex: number, costPrice: number) => {
        const newRows = [...rows]
        const row = newRows[rowIndex]

        if (row.product) {
            newRows[rowIndex] = {
                ...row,
                costPrice,
                isModified: true,
            }
            setRows(newRows)
        }
    }

    // Update selling price in a row
    const updateSellingPrice = (rowIndex: number, sellingPrice: number) => {
        const newRows = [...rows]
        const row = newRows[rowIndex]

        if (row.product) {
            newRows[rowIndex] = {
                ...row,
                sellingPrice,
                isModified: true,
            }
            setRows(newRows)
        }
    }

    // Add a new row
    const addRow = () => {
        setRows([
            ...rows,
            {
                id: `row-${Date.now()}`,
                product: null,
                variant: null,
                quantity: 0,
                buyingPrice: 0,
                sellingPrice: 0,
                costPrice: 0,
                warehouseId: "",
                channelId,
                isModified: false,
                isNew: true,
            },
        ])
    }

    // Remove a row
    const removeRow = (index: number) => {
        const newRows = [...rows]
        newRows.splice(index, 1)
        setRows(newRows)
    }

    // Handle keyboard navigation
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
                // Move to buying price
                const buyingPriceCell = cellRefs.current[`buyingPrice-${rowIndex}`]
                if (buyingPriceCell) {
                    buyingPriceCell.focus()
                    buyingPriceCell.select()
                }
            } else if (col === "buyingPrice") {
                // Move to cost price
                const costPriceCell = cellRefs.current[`costPrice-${rowIndex}`]
                if (costPriceCell) {
                    costPriceCell.focus()
                    costPriceCell.select()
                }
            } else if (col === "costPrice") {
                // Move to selling price
                const sellingPriceCell = cellRefs.current[`sellingPrice-${rowIndex}`]
                if (sellingPriceCell) {
                    sellingPriceCell.focus()
                    sellingPriceCell.select()
                }
            } else if (col === "sellingPrice") {
                // Move to next row's product
                if (rowIndex < rows.length - 1) {
                    const nextProductCell = cellRefs.current[`product-${rowIndex + 1}`]
                    if (nextProductCell) {
                        nextProductCell.focus()
                    }
                } else {
                    // Add a new row if at the last row
                    addRow()
                    setTimeout(() => {
                        const nextProductCell = cellRefs.current[`product-${rows.length}`]
                        if (nextProductCell) {
                            nextProductCell.focus()
                        }
                    }, 100)
                }
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault()
            // Move to the same column in the next row
            if (rowIndex < rows.length - 1) {
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

    // Bulk edit functions
    const toggleRowSelection = (rowId: string) => {
        setSelectedRows((prev) => (prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]))
    }

    const selectAllRows = () => {
        const productRowIds = rows.filter((row) => row.product).map((row) => row.id)
        setSelectedRows(productRowIds)
    }

    const clearRowSelection = () => {
        setSelectedRows([])
    }

    const applyBulkEdit = () => {
        if (!bulkEditValue.field || !bulkEditValue.value || selectedRows.length === 0) {
            toast.error("Cannot apply bulk edit", {
                description: "Please select a field, operation, value, and at least one row",
            })
            return
        }

        const numericValue = Number.parseFloat(bulkEditValue.value)
        if (isNaN(numericValue)) {
            toast.error("Invalid value", {
                description: "Please enter a valid number",
            })
            return
        }

        const newRows = [...rows]
        let updatedCount = 0

        selectedRows.forEach((rowId) => {
            const rowIndex = newRows.findIndex((row) => row.id === rowId)
            if (rowIndex === -1 || !newRows[rowIndex].product) return

            const row = newRows[rowIndex]
            let newValue = 0

            switch (bulkEditValue.operation) {
                case "set":
                    newValue = numericValue
                    break
                case "increase":
                    newValue = row[bulkEditValue.field] * (1 + numericValue / 100)
                    break
                case "decrease":
                    newValue = row[bulkEditValue!.field] * (1 - numericValue / 100)
                    break
                case "margin":
                    if (bulkEditValue.field === "sellingPrice" && row.costPrice > 0) {
                        newValue = row.costPrice * (1 + numericValue / 100)
                    } else if (bulkEditValue.field === "costPrice" && row.sellingPrice > 0) {
                        newValue = row.sellingPrice / (1 + numericValue / 100)
                    }
                    break
            }

            if (newValue > 0) {
                newRows[rowIndex] = {
                    ...row,
                    [bulkEditValue.field]: Math.round(newValue),
                    isModified: true,
                }
                updatedCount++
            }
        })

        setRows(newRows)
        setBulkEditMode(false)
        setSelectedRows([])

        toast.success(`Bulk edit applied`, {
            description: `Updated ${updatedCount} product${updatedCount !== 1 ? "s" : ""}`,
        })
    }

    // Save inventory changes with batch processing using your GraphQL mutations
    const saveChanges = async () => {
        const modifiedRows = rows.filter((row) => row.isModified && row.product)

        if (modifiedRows.length === 0) {
            toast.error("No changes to save", {
                description: "Please make changes to at least one product",
            })
            return
        }

        setIsSaving(true)

        try {
            // Validate all rows before processing
            const validationErrors: Record<string, string[]> = {}

            modifiedRows.forEach((row, index) => {
                try {
                    // Validate price data
                    priceUpdateSchema.parse({
                        price: row.sellingPrice,
                        costPrice: row.costPrice,
                    })

                    // Validate stock data
                    stockUpdateSchema.parse({
                        quantity: row.quantity,
                    })
                } catch (error) {
                    if (error instanceof z.ZodError) {
                        validationErrors[index] = error.errors.map((err) => err.message)
                    }
                }
            })

            if (Object.keys(validationErrors).length > 0) {
                // Show validation errors
                const errorCount = Object.keys(validationErrors).length
                toast.error(`Validation failed for ${errorCount} product${errorCount > 1 ? "s" : ""}`, {
                    description: "Please correct the highlighted fields",
                    duration: 5000,
                })

                // Highlight rows with errors
                const newRows = [...rows]
                Object.entries(validationErrors).forEach(([index, errors]) => {
                    const rowIndex = Number.parseInt(index)
                    newRows[rowIndex] = {
                        ...newRows[rowIndex],
                        validationErrors: errors,
                    }
                })
                setRows(newRows)
                setIsSaving(false)
                return
            }

            // Create a progress toast that we'll update
            const progressToastId = toast.loading(`Updating 0/${modifiedRows.length} products...`)

            // Use p-limit to limit concurrent requests
            const limit = pLimit(5) // Process 5 requests at a time
            let completedCount = 0
            let successCount = 0
            let failedCount = 0
            const failedItems: Array<{ name: string; error: string }> = []

            // Prepare all update promises
            const updatePromises = modifiedRows.map((row) => {
                return limit(async () => {
                    let stockSuccess = false
                    let priceSuccess = false
                    const errors: string[] = []
                    const logData = {
                        product: row.product?.name,
                        variant: row.variant?.name,
                        warehouseId: row.warehouseId,
                        quantity: row.quantity,
                    }

                    try {
                        debugLog("Starting update for product", logData)

                        // PRICE UPDATE
                        const priceResult = await updatePrice({
                            id: row.variant.id,
                            input: [
                                {
                                    channelId: row.channelId,
                                    price: row.sellingPrice.toFixed(2),
                                    costPrice: row.costPrice.toFixed(2),
                                },
                            ],
                        })

                        debugLog("Price update result", priceResult)

                        if (priceResult.error) {
                            throw new Error(`Price update failed: ${priceResult.error.message}`)
                        }

                        if (priceResult.data?.productVariantChannelListingUpdate?.errors?.length) {
                            const errorMessage = priceResult.data.productVariantChannelListingUpdate.errors[0].message
                            throw new Error(`Price update failed: ${errorMessage}`)
                        }

                        priceSuccess = true

                        // STOCK HANDLING
                        const warehouseId = row.warehouseId || process.env.NEXT_PUBLIC_DEFAULT_WAREHOUSE_ID

                        if (!warehouseId) {
                            throw new Error("No warehouse ID available for stock update")
                        }

                        try {
                            // 1. First try updating existing stock
                            const updateResult = await updateStock({
                                variantId: row.variant.id,
                                warehouseId,
                                quantity: row.quantity,
                            })

                            debugLog("Stock update result", updateResult)

                            if (updateResult.error) {
                                throw new Error(`Stock update failed: ${updateResult.error.message}`)
                            }

                            if (updateResult.data?.productVariantStocksUpdate?.errors?.length) {
                                // 2. If update fails, try creating new stock
                                debugLog("Update failed, attempting create", {
                                    variantId: row.variant.id,
                                    warehouseId,
                                })

                                const createResult = await createStock({
                                    variantId: row.variant.id,
                                    input: [
                                        {
                                            warehouse: warehouseId,
                                            quantity: row.quantity,
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

                            stockSuccess = true
                        } catch (error) {
                            console.error("Stock operation failed:", error)
                            errors.push(error instanceof Error ? error.message : "Unknown stock error")
                        }
                    } catch (error) {
                        console.error("Update error:", error)
                        errors.push(error instanceof Error ? error.message : "Unknown error")
                    }

                    // Update progress
                    completedCount++
                    const success = priceSuccess && stockSuccess

                    if (success) {
                        successCount++
                    } else {
                        failedCount++
                        failedItems.push({
                            name: `${row.product.name} - ${row.variant.name}`,
                            error: errors.join(", ") || "Unknown error",
                        })
                    }

                    setBatchProgress({
                        total: modifiedRows.length,
                        completed: completedCount,
                        visible: true,
                    })

                    toast.loading(`Updating ${completedCount}/${modifiedRows.length} products...`, {
                        id: progressToastId,
                    })

                    return { success, row }
                })
            })

            // Execute all updates and wait for completion
            const results = await Promise.all(updatePromises)

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

                // Show details of failed items
                failedItems.forEach((item) => {
                    toast.error(`Failed to update ${item.name}`, {
                        description: item.error,
                        duration: 5000,
                    })
                })
            }

            // Store update results for the dialog
            setUpdateResults({
                total: modifiedRows.length,
                success: successCount,
                failed: failedCount,
                failedItems,
            })

            if (modifiedRows.length > 3) {
                setShowResultsDialog(true)
            }

            // Reset modified flags for successful updates
            const updatedRows = rows.map((row) => {
                const result = results.find((r) => r.row.id === row.id)
                if (result && result.success) {
                    return {
                        ...row,
                        isModified: false,
                        isNew: false,
                    }
                }
                return row
            })

            setRows(updatedRows)
        } catch (error) {
            console.error("Error updating inventory:", error)
            toast.error("Failed to update inventory", {
                description: error instanceof Error ? error.message : "An unexpected error occurred",
            })
        } finally {
            setIsSaving(false)
            setTimeout(() => {
                setBatchProgress((prev) => ({ ...prev, visible: false }))
            }, 1500)
        }
    }

    // Get modified rows count
    const modifiedCount = rows.filter((row) => row.isModified && row.product).length

    // Add keyboard shortcuts for power users
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault()
                if (modifiedCount > 0 && !isSaving) {
                    saveChanges()
                    toast.success("Keyboard shortcut: Save", {
                        description: "Ctrl+S or Cmd+S",
                        duration: 2000,
                    })
                }
            }

            // Ctrl/Cmd + A to add row
            if ((e.ctrlKey || e.metaKey) && e.key === "a") {
                e.preventDefault()
                addRow()
                toast.success("Keyboard shortcut: Add Row", {
                    description: "Ctrl+A or Cmd+A",
                    duration: 2000,
                })
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [modifiedCount, isSaving])

    return (
        <div className="mx-auto py-4 max-w-5xl">
            {batchProgress.visible && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 shadow-md">
                    <div className="container mx-auto px-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-sm font-medium">
                                Updating Inventory ({batchProgress.completed}/{batchProgress.total})
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {Math.round((batchProgress.completed / batchProgress.total) * 100)}% Complete
                            </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                            <div
                                className="bg-purple-600 h-1.5 rounded-full transition-all duration-300 ease-in-out"
                                style={{ width: `${(batchProgress.completed / batchProgress.total) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex flex-col gap-4">
                <Card className="border-0 shadow-md bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
                    <CardHeader className="pb-3 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 font-normal text-xl">
                                    <Sparkles className="h-5 w-5 text-green-700" />
                                    Update Stock
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Ensure to fill in the buying price — {`It's`} essential for accurate profit tracking & bookkeeping.
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        toast.success("Keyboard Shortcuts", {
                                            description: (
                                                <div className="mt-2 space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span>Save Changes:</span>
                                                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Ctrl+S</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span>Add Row:</span>
                                                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Ctrl+A</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span>Navigate:</span>
                                                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
                                                            Tab/Arrow Keys
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                            duration: 5000,
                                        })
                                    }}
                                    className="h-8 text-xs"
                                >
                                    <Keyboard className="mr-2 h-3.5 w-3.5" />
                                    Shortcuts
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setBulkEditMode(!bulkEditMode)}
                                    className="h-8 text-xs"
                                >
                                    <Edit className="mr-2 h-3.5 w-3.5" />
                                    Bulk Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setRows([])
                                        setTimeout(() => {
                                            setRows([
                                                {
                                                    id: `row-${Date.now()}`,
                                                    product: null,
                                                    variant: null,
                                                    quantity: 0,
                                                    buyingPrice: 0,
                                                    sellingPrice: 0,
                                                    costPrice: 0,
                                                    warehouseId: "",
                                                    channelId,
                                                    isModified: false,
                                                },
                                            ])
                                        }, 10)
                                    }}
                                    className="h-8 text-xs"
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={saveChanges}
                                    disabled={modifiedCount === 0 || isSaving}
                                    className="h-8 text-xs bg-green-800 hover:bg-green-700 text-white"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-3 w-3" />
                                            Save All Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {bulkEditMode && (
                            <div className="mb-4 p-3 border rounded-md bg-purple-50 dark:bg-purple-900/10">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium">Bulk Edit {selectedRows.length} Selected Items</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => {
                                            setBulkEditMode(false)
                                            setSelectedRows([])
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-3">
                                    <div>
                                        <Select
                                            value={bulkEditValue.field || ""}
                                            onValueChange={(value: "buyingPrice" | "sellingPrice" | "costPrice") =>
                                                setBulkEditValue((prev) => ({ ...prev, field: value }))
                                            }
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Select field" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="buyingPrice">Buying Price</SelectItem>
                                                <SelectItem value="costPrice">Cost Price</SelectItem>
                                                <SelectItem value="sellingPrice">Selling Price</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Select
                                            value={bulkEditValue.operation}
                                            onValueChange={(value: "set" | "increase" | "decrease" | "margin") =>
                                                setBulkEditValue((prev) => ({ ...prev, operation: value }))
                                            }
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Select operation" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="set">Set to value</SelectItem>
                                                <SelectItem value="increase">Increase by %</SelectItem>
                                                <SelectItem value="decrease">Decrease by %</SelectItem>
                                                <SelectItem value="margin">Set margin %</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Input
                                            type="number"
                                            placeholder={bulkEditValue.operation === "margin" ? "Margin %" : "Value"}
                                            className="h-8 text-xs"
                                            value={bulkEditValue.value}
                                            onChange={(e) => setBulkEditValue((prev) => ({ ...prev, value: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <Button
                                            className="w-full h-8 text-xs bg-green-800 hover:bg-green-700 text-white"
                                            onClick={applyBulkEdit}
                                        >
                                            Apply to {selectedRows.length} Item{selectedRows.length !== 1 ? "s" : ""}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-between text-xs text-slate-500">
                                    <div>
                                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={selectAllRows}>
                                            Select All
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearRowSelection}>
                                            Clear Selection
                                        </Button>
                                    </div>
                                    <div>
                                        {selectedRows.length} of {rows.filter((row) => row.product).length} items selected
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sorting controls */}
                        <div className="p-3 border-b">
                            <div className="flex flex-wrap gap-3 items-center">
                                <div>
                                    <label className="text-xs mb-1 block">Sort By</label>
                                    <Select
                                        value={`${sortConfig.field}_${sortConfig.direction}`}
                                        onValueChange={(value) => {
                                            const [field, direction] = value.split("_") as [string, string]
                                            handleSortChange(field, direction)
                                        }}
                                    >
                                        <SelectTrigger className="h-8 text-xs w-[180px]">
                                            <SelectValue placeholder="Sort products" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={`name_asc`}>Name (A-Z)</SelectItem>
                                            <SelectItem value={`name_desc`}>Name (Z-A)</SelectItem>
                                            <SelectItem value={`price_asc`}>Price (Low to High)</SelectItem>
                                            <SelectItem value={`price_desc`}>Price (High to Low)</SelectItem>
                                            {/* <SelectItem value={`${ProductOrderField.Date}_${OrderDirection.Desc}`}>Newest First</SelectItem>
                                            <SelectItem value={`${ProductOrderField.Date}_${OrderDirection.Asc}`}>Oldest First</SelectItem> */}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                        {bulkEditMode && (
                                            <TableHead className="w-[40px] pr-0">
                                                <Checkbox
                                                    checked={
                                                        rows.filter((row) => row.product).length > 0 &&
                                                        rows.filter((row) => row.product).every((row) => selectedRows.includes(row.id))
                                                    }
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            selectAllRows()
                                                        } else {
                                                            clearRowSelection()
                                                        }
                                                    }}
                                                />
                                            </TableHead>
                                        )}
                                        <TableHead className="w-[40px] text-xs font-medium">#</TableHead>
                                        <TableHead className="w-[40%] text-xs font-medium">Product</TableHead>
                                        <TableHead className="text-xs font-medium">Quantity</TableHead>
                                        <TableHead className="text-xs font-medium">Buying Price Price (KES)</TableHead>
                                        <TableHead className="text-xs font-medium">Sell Price (KES)</TableHead>
                                        <TableHead className="w-[40px] text-xs font-medium"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row, index) => (
                                        <TableRow
                                            key={row.id}
                                            className={cn(
                                                "h-[52px] hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                                activeCell?.row === index ? "bg-purple-50/50 dark:bg-purple-900/10" : "",
                                                row.isModified ? "bg-purple-50 dark:bg-purple-900/20" : "",
                                                row.validationErrors ? "bg-red-50 dark:bg-red-900/10 border-l-2 border-red-500" : "",
                                            )}
                                        >
                                            {bulkEditMode && (
                                                <TableCell className="w-[40px] pr-0">
                                                    <Checkbox
                                                        checked={selectedRows.includes(row.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                toggleRowSelection(row.id)
                                                            } else {
                                                                toggleRowSelection(row.id)
                                                            }
                                                        }}
                                                        disabled={!row.product}
                                                    />
                                                </TableCell>
                                            )}
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
                                                                value={row.product?.name || searchQuery}
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
                                                                    row.product ? "border-purple-200 dark:border-purple-800" : "",
                                                                    row.isModified ? "bg-purple-50 dark:bg-purple-900/10" : "",
                                                                )}
                                                            />
                                                            {row.product && row.variant && (
                                                                <div className="absolute right-2 top-2">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="h-5 text-[10px] font-normal bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
                                                                    >
                                                                        {row.variant.name}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        collisionPadding={10} // Adds padding to collision detection
                                                        avoidCollisions={true}
                                                        className="p-0 h-[300px] w-[400px]"
                                                        align="start"
                                                        side="bottom"
                                                        sideOffset={5}
                                                    >
                                                        <Command>
                                                            <CommandList>
                                                                <CommandEmpty>
                                                                    {isSearching ? (
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
                                                                                                <span className="text-[11px] font-normal">{product.name}</span>
                                                                                                <Badge
                                                                                                    variant="outline"
                                                                                                    className="h-4 text-[10px] font-light bg-slate-50 text-teal-700 border-emerald-400 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800"
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

                                                                        {hasNextPage && (
                                                                            <div className="py-2 px-2 text-center">
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={loadMoreProducts}
                                                                                    disabled={isSearching}
                                                                                    className="w-full text-xs h-8"
                                                                                >
                                                                                    {isSearching ? (
                                                                                        <>
                                                                                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                                                                            Loading...
                                                                                        </>
                                                                                    ) : (
                                                                                        "Load more products"
                                                                                    )}
                                                                                </Button>
                                                                            </div>
                                                                        )}
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
                                                    value={row.quantity || ""}
                                                    // onChange={(e) => updateQuantity(index, Number.parseInt(e.target.value) || 0)}
                                                    onChange={(e) => {
                                                        // Allow for empty string or partial inputs during typing
                                                        const val = e.target.value === "" ? "" : Number(e.target.value)
                                                        updateQuantity(index, val)
                                                    }}
                                                    onFocus={() => handleCellFocus(index, "quantity")}
                                                    onKeyDown={(e) => handleKeyDown(e, index, "quantity")}
                                                    className={cn(
                                                        "h-9 text-xs font-light w-20",
                                                        row.isModified &&
                                                            row.product &&
                                                            row.variant &&
                                                            row.quantity !== row.variant.quantityAvailable
                                                            ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800"
                                                            : "",
                                                        !row.product ? "bg-slate-50 cursor-not-allowed dark:bg-slate-800/50" : "",
                                                        row.validationErrors?.includes("Quantity cannot be negative") ? "border-red-500" : "",
                                                    )}
                                                    disabled={!row.product}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Input
                                                    id={`costPrice-${index}`}
                                                    ref={(el) => (cellRefs.current[`costPrice-${index}`] = el)}
                                                    type="number"
                                                    min="0"
                                                    value={row.costPrice}
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value);
                                                        updateCostPrice(index, isNaN(value) ? 0 : value);
                                                    }}

                                                    onFocus={() => handleCellFocus(index, "costPrice")}
                                                    onKeyDown={(e) => handleKeyDown(e, index, "costPrice")}
                                                    className={cn(
                                                        "h-9 text-xs w-24",
                                                        row.isModified && row.product
                                                            ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800"
                                                            : "",
                                                        !row.product ? "bg-slate-50 cursor-not-allowed dark:bg-slate-800/50" : "",
                                                        row.validationErrors?.includes("Cost price must be at least 1 KES") ? "border-red-500" : "",
                                                    )}
                                                    disabled={!row.product}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Input
                                                    id={`sellingPrice-${index}`}
                                                    ref={(el) => (cellRefs.current[`sellingPrice-${index}`] = el)}
                                                    type="number"
                                                    min="0"
                                                    value={row.sellingPrice}
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value);
                                                        updateSellingPrice(index, isNaN(value) ? 0 : value);
                                                    }}

                                                    onFocus={() => handleCellFocus(index, "sellingPrice")}
                                                    onKeyDown={(e) => handleKeyDown(e, index, "sellingPrice")}
                                                    className={cn(
                                                        "h-9 text-xs w-24 font-light",
                                                        row.isModified && row.product
                                                            ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800"
                                                            : "",
                                                        !row.product ? "bg-slate-50 cursor-not-allowed dark:bg-slate-800/50" : "",
                                                        row.validationErrors?.includes("Selling price must be at least 1 KES")
                                                            ? "border-red-500"
                                                            : "",
                                                    )}
                                                    disabled={!row.product}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeRow(index)}
                                                    className="h-7 w-7 rounded-full"
                                                    disabled={rows.length === 1}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                                                </Button>
                                            </TableCell>
                                            {row.validationErrors && (
                                                <div className="absolute -bottom-4 left-0 right-0 bg-red-50 dark:bg-red-900/10 px-4 py-1 text-xs text-red-600 dark:text-red-400 z-10 shadow-sm">
                                                    {row.validationErrors.map((error, i) => (
                                                        <div key={i}>{error}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="p-2 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addRow}
                                className="h-7 text-xs border-dashed border-slate-300 dark:border-slate-700"
                            >
                                <Plus className="h-3 w-3 mr-0.5" />
                                Add Product Row
                            </Button>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-between py-3 border-t bg-slate-50 dark:bg-slate-900/50">
                        <div className="space-y-1">
                            <div className="text-xs text-slate-500">
                                {modifiedCount > 0 ? (
                                    <span className="text-purple-600 dark:text-purple-400 font-medium flex items-center">
                                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                        {modifiedCount} product{modifiedCount > 1 ? "s" : ""} ready to update
                                    </span>
                                ) : (
                                    "No changes pending"
                                )}
                            </div>
                        </div>

                        <Button
                            variant="default"
                            size="sm"
                            onClick={saveChanges}
                            disabled={modifiedCount === 0 || isSaving}
                            className="h-7 text-xs bg-green-800 hover:bg-green-700 text-white"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-3.5 w-3.5" />
                                    Save All Changes
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Inventory Update Results</DialogTitle>
                        <DialogDescription>Summary of all inventory updates that were processed</DialogDescription>
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
