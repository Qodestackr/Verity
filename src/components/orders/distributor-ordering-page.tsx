"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { useCurrency } from "@/hooks/useCurrency";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "@/lib/zod"
import {
    Plus,
    Trash2,
    FileText,
    ShoppingCart,
    Loader2,
    PackageCheck,
    Clock,
    CheckCircle2,
    AlertCircle,
    Save,
    History,
    Filter,
    Info,
    X,
    Truck,
    Sparkles,
    Building2,
    Wine,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Form } from "@/components/ui/form"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { usePartnerStore } from "@/stores/partner-store"
import { useOrderStore } from "@/stores/order-store"
import { useDistributorStore, type DistributorInfo } from "@/stores/distributor-store"
import { useUrlChange } from "@/hooks/checkout/use-url-change"

/**
 * Form schema for order metadata
 */
const formSchema = z.object({
    deliveryDate: z.date().optional(),
    specialInstructions: z.string().optional(),
})

/**
 * Props for the DistributorOrderingPage component
 */
interface DistributorOrderingPageProps {
    initialData?: {
        partnerId?: string
        organizationId?: string
        supplierData?: any
        relationship?: any
    }
}

/**
 * Component for ordering from a distributor
 */
export default function DistributorOrderingPage({ initialData }: DistributorOrderingPageProps) {
    // Router and params
    const router = useRouter()
    const params = useParams<{ organizationSlug: string; supplierId: string }>()

    // State
    const [searchOpen, setSearchOpen] = useState(false)
    const [activeCell, setActiveCell] = useState<{ row: number; col: string } | null>(null)
    const [activeTab, setActiveTab] = useState("new-order")
    const [showDistributorInfo, setShowDistributorInfo] = useState(false)
    const [showOrderSummary, setShowOrderSummary] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [localDistributor, setLocalDistributor] = useState<DistributorInfo | null>(null)

    // Zustand stores
    const { selectedPartnerId, selectPartner, hasPermission } = usePartnerStore()

    const {
        rows,
        setRows,
        addRow,
        removeRow,
        updateProduct,
        updateQuantity,
        searchQuery,
        setSearchQuery,
        searchProducts,
        searchResults,
        getTotalItems,
        getSubtotal,
        getTax,
        getTotal,
        submitOrder,
        isSubmitting,
    } = useOrderStore()

    const { currentDistributor, fetchDistributorInfo, setCurrentDistributor } = useDistributorStore()

    console.log("CURR DISTR", currentDistributor)
    console.log("LOCAL DISTR", localDistributor)

    // Form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Default to 2 days from now
            specialInstructions: "",
        },
    })

    // Mock order history data
    // This would be replaced with data from an API
    const orderHistory = [
        {
            id: "PO-2023-001",
            date: "2023-10-15",
            status: "delivered",
            items: 12,
            total: 45600,
        },
        {
            id: "PO-2023-002",
            date: "2023-11-02",
            status: "shipped",
            items: 8,
            total: 28900,
        },
        {
            id: "PO-2023-003",
            date: "2023-11-20",
            status: "pending",
            items: 15,
            total: 52300,
        },
    ]

    // Handle URL changes
    useUrlChange(({ queryParams }) => {
        // Update state based on URL changes
        if (params.supplierId) {
            selectPartner(params.supplierId)
        }
    })

    // Initialize with supplier data if available
    useEffect(() => {
        if (initialData?.supplierData) {
            const supplierData = initialData.supplierData

            // Create distributor info from supplier data
            const distributorInfo: DistributorInfo = {
                id: supplierData.id,
                name: supplierData.name || "Unknown Organization",
                logo: supplierData.logo,
                location: supplierData.address || supplierData.city || null,
                contactPerson: supplierData.contactPerson || null,
                phone: supplierData.phoneNumber || null,
                email: supplierData.email || null,
                businessType: supplierData.businessType,
                leadTime: getLeadTimeByBusinessType(supplierData.businessType || "DISTRIBUTOR"),
                minimumOrder: "KES 10,000", // Default value
                paymentTerms: "10 days", // Default value
                categories: ["Beer", "Spirits", "Wine"], // Default categories
                popularBrands: [], // Empty by default
            }

            // Set local state first for immediate UI update
            setLocalDistributor(distributorInfo)

            // Then update the store
            setCurrentDistributor(distributorInfo)
        }
    }, [initialData?.supplierData, setCurrentDistributor])

    // Initialize component
    useEffect(() => {
        // Initialize with an empty row if none exist
        if (rows.length === 0) {
            setRows([
                {
                    id: `row-${Date.now()}`,
                    product: null,
                    quantity: 1,
                    price: 0,
                    total: 0,
                },
            ])
        }

        // Select partner from URL params
        if (params.supplierId && params.supplierId !== selectedPartnerId) {
            selectPartner(params.supplierId)

            // Fetch distributor info if not already set
            if (!currentDistributor && !localDistributor) {
                console.log("Fetching distributor info for:", params.supplierId)
                fetchDistributorInfo(params.supplierId)
                    .then(() => console.log("Distributor info fetched successfully"))
                    .catch((err) => console.error("Error fetching distributor info:", err))
            }
        }
    }, [params.supplierId, selectedPartnerId, currentDistributor, localDistributor])

    // Helper function to get lead time based on business type
    function getLeadTimeByBusinessType(businessType: string): string {
        switch (businessType) {
            case "DISTRIBUTOR":
                return "1-6 hrs"
            case "WHOLESALER":
                return "6hrs-1 day"
            case "RETAILER":
                return "1-2 days"
            default:
                return "24-48 hours"
        }
    }

    // Filtered products based on selected category
    const filteredProducts = selectedCategory
        ? searchResults.filter((product) => product.category === selectedCategory)
        : searchResults

    // Get unique categories from products
    const categories = [...new Set(searchResults.map((product) => product.category).filter(Boolean))]

    // Filtered rows with products
    const filledRows = rows.filter((row) => row.product)

    // Handle cell focus
    const handleCellFocus = (row: number, col: string) => {
        setActiveCell({ row, col })
        if (col === "product") {
            setSearchOpen(true)
        }
    }

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, col: string) => {
        if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault()

            // Move to next cell
            if (col === "product") {
                // Move to quantity
                const quantityCell = document.getElementById(`quantity-${rowIndex}`)
                if (quantityCell) {
                    quantityCell.focus()
                }
            } else if (col === "quantity") {
                // Move to next row's product
                if (rowIndex < rows.length - 1) {
                    const nextProductCell = document.getElementById(`product-${rowIndex + 1}`)
                    if (nextProductCell) {
                        nextProductCell.focus()
                    }
                } else {
                    // Add a new row if at the last row
                    addRow()
                    setTimeout(() => {
                        const nextProductCell = document.getElementById(`product-${rows.length}`)
                        if (nextProductCell) {
                            nextProductCell.focus()
                        }
                    }, 100)
                }
            }
        }
    }

    // Handle form submission
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (filledRows.length === 0) {
            toast.error("No items in order", {
                description: "Please add at least one product to your order",
            })
            return
        }

        if (!params.supplierId) {
            toast.error("No supplier selected", {
                description: "Please select a supplier to place an order",
            })
            return
        }

        try {
            // Submit the order
            const result = await submitOrder(params.supplierId, "alcoraadmin")

            if (result.success) {
                toast.success("Order placed successfully", {
                    description: `Purchase Order #${result.orderId} has been created`,
                })

                // Clear the form and switch to order history
                setRows([
                    {
                        id: `row-${Date.now()}`,
                        product: null,
                        quantity: 1,
                        price: 0,
                        total: 0,
                    },
                ])
                form.reset()
                setActiveTab("order-history")
            } else {
                throw new Error(result.error)
            }
        } catch (error: any) {
            toast.error("Failed to place order", {
                description: error.message || "An unexpected error occurred",
            })
        }
    }

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                )
            case "confirmed":
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Confirmed
                    </Badge>
                )
            case "shipped":
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        <PackageCheck className="h-3 w-3 mr-1" />
                        Shipped
                    </Badge>
                )
            case "delivered":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Delivered
                    </Badge>
                )
            case "cancelled":
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Cancelled
                    </Badge>
                )
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    // Use either the store distributor or local distributor
    const activeDistributor = currentDistributor || localDistributor

    // If no distributor is selected, show a message
    if (!activeDistributor) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-medium mb-2">Loading Distributor Information...</h2>
                    <p className="text-muted-foreground mb-4">Please wait while we fetch the distributor details</p>
                    <Button onClick={() => router.push(`/dashboard/${params.organizationSlug}/place-orders`)}>
                        View All Distributors
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-2">
            <div className="flex flex-col gap-2">
                <div className="sticky top-18 z-10 flex items-center justify-between bg-white dark:bg-gray-950 p-4 rounded-sm shadow-sm border mb-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border">
                            <AvatarImage src={activeDistributor.logo || "/placeholder.svg"} alt={activeDistributor.name} />
                            <AvatarFallback>
                                <Building2 className="h-6 w-6 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-xl font-medium">{activeDistributor.name}</h1>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Verified Partner
                                </Badge>
                                <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Lead time: {activeDistributor.leadTime}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => setShowDistributorInfo(true)}>
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>View distributor information</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden md:flex"
                            onClick={() => setActiveTab("order-history")}
                        >
                            <History className="h-4 w-4 mr-2" />
                            Order History
                        </Button>

                        <Button
                            variant="default"
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={() => setShowOrderSummary(true)}
                            disabled={filledRows.length === 0}
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Review Order</span>
                            {filledRows.length > 0 && (
                                <Badge variant="outline" className="ml-2 bg-white/20 border-white/40 text-white">
                                    {getTotalItems()}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="new-order" value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex justify-between items-center mb-4">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="new-order" className="flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4" />
                                New Order
                            </TabsTrigger>
                            <TabsTrigger value="order-history" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Order History
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="new-order">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <Card className="shadow-sm border-0">
                                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-light">Order Sheet</CardTitle>
                                            <CardDescription>Create your order for {activeDistributor.name}</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setRows([])} type="button">
                                                <X className="h-4 w-4 mr-2" />
                                                Clear All
                                            </Button>
                                            <Button variant="outline" size="sm" type="button">
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Draft
                                            </Button>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        {/* Spreadsheet table */}
                                        <div className="rounded-md border overflow-hidden bg-white dark:bg-gray-950">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/50">
                                                        <TableHead className="w-[50px]">#</TableHead>
                                                        <TableHead className="w-[40%]">Product</TableHead>
                                                        <TableHead>Quantity</TableHead>
                                                        <TableHead>Unit Price</TableHead>
                                                        <TableHead className="text-right">Total</TableHead>
                                                        <TableHead className="w-[50px]"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {rows.map((row, index) => (
                                                        <TableRow key={row.id} className={activeCell?.row === index ? "bg-muted/30" : ""}>
                                                            <TableCell className="font-normal">{index + 1}</TableCell>
                                                            <TableCell>
                                                                <Popover
                                                                    open={searchOpen && activeCell?.row === index && activeCell?.col === "product"}
                                                                    onOpenChange={setSearchOpen}
                                                                >
                                                                    <PopoverTrigger asChild>
                                                                        <div className="flex items-center gap-2">
                                                                            <Input
                                                                                id={`product-${index}`}
                                                                                placeholder="Search product..."
                                                                                value={row.product?.name || ""}
                                                                                onChange={(e) => { }}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    handleCellFocus(index, "product")
                                                                                    setSearchOpen(true)
                                                                                }}
                                                                                onFocus={(e) => {
                                                                                    e.stopPropagation()
                                                                                    handleCellFocus(index, "product")
                                                                                }}
                                                                                onKeyDown={(e) => {
                                                                                    e.stopPropagation()
                                                                                    handleKeyDown(e, index, "product")
                                                                                }}
                                                                                className={cn(
                                                                                    "w-full",
                                                                                    row.product ? "border-teal-500 focus-visible:ring-teal-500" : "",
                                                                                )}
                                                                            />
                                                                            {row.product && (
                                                                                <Badge variant="outline" className="bg-muted">
                                                                                    {row.product.category}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="p-0 w-[400px]" align="start" side="bottom" sideOffset={5}>
                                                                        <Command>
                                                                            <CommandInput
                                                                                placeholder="Search product..."
                                                                                value={searchQuery}
                                                                                onValueChange={setSearchQuery}
                                                                            />
                                                                            <CommandList>
                                                                                <CommandEmpty>
                                                                                    <div className="flex flex-col items-center justify-center py-6">
                                                                                        <PackageCheck className="h-8 w-8 text-muted-foreground mb-2" />
                                                                                        <p className="text-sm text-muted-foreground">No products found</p>
                                                                                    </div>
                                                                                </CommandEmpty>
                                                                                <CommandGroup>
                                                                                    <ScrollArea className="h-[300px]">
                                                                                        {filteredProducts.map((product) => (
                                                                                            <CommandItem
                                                                                                key={product.id}
                                                                                                value={product.name}
                                                                                                onSelect={() => updateProduct(index, product)}
                                                                                                className="py-3"
                                                                                            >
                                                                                                <div className="flex flex-col w-full">
                                                                                                    <div className="flex items-center justify-between">
                                                                                                        <span className="font-normal">{product.name}</span>
                                                                                                        <Badge
                                                                                                            variant={product.stock > 0 ? "outline" : "destructive"}
                                                                                                            className="text-[10px]"
                                                                                                        >
                                                                                                            Stock: {product.stock}
                                                                                                        </Badge>
                                                                                                    </div>
                                                                                                    <div className="flex justify-between mt-1">
                                                                                                        <span className="text-xs text-muted-foreground">
                                                                                                            SKU: {product.sku} • {product.category}
                                                                                                        </span>
                                                                                                        <div className="flex items-center gap-2">
                                                                                                            <span className="text-xs font-normal">
                                                                                                                KES {product.price.toLocaleString()}
                                                                                                            </span>
                                                                                                            {product.casePrice && (
                                                                                                                <span className="text-xs text-teal-600">
                                                                                                                    Case: KES {product.casePrice.toLocaleString()}
                                                                                                                </span>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </CommandItem>
                                                                                        ))}
                                                                                    </ScrollArea>
                                                                                </CommandGroup>
                                                                            </CommandList>
                                                                        </Command>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </TableCell>

                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        id={`quantity-${index}`}
                                                                        type="number"
                                                                        min="1"
                                                                        value={row.quantity}
                                                                        onChange={(e) => updateQuantity(index, Number.parseInt(e.target.value) || 1)}
                                                                        onFocus={() => handleCellFocus(index, "quantity")}
                                                                        onKeyDown={(e) => handleKeyDown(e, index, "quantity")}
                                                                        className="w-20"
                                                                        disabled={!row.product}
                                                                    />
                                                                    {row.product?.caseSize && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={cn(
                                                                                "text-xs",
                                                                                row.quantity >= row.product.caseSize
                                                                                    ? "bg-teal-50 text-teal-700 border-teal-200"
                                                                                    : "bg-muted",
                                                                            )}
                                                                        >
                                                                            {row.quantity >= row.product.caseSize ? (
                                                                                <Sparkles className="h-3 w-3 mr-1" />
                                                                            ) : null}
                                                                            Case: {row.product.caseSize}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                {row.product?.minOrderQty && row.product.minOrderQty > 1 && (
                                                                    <div className="text-[10px] text-amber-600 mt-1">Min: {row.product.minOrderQty}</div>
                                                                )}
                                                            </TableCell>

                                                            <TableCell>
                                                                {row.product ? (
                                                                    <div>
                                                                        <div className="font-normal">KES {row.price.toLocaleString()}</div>
                                                                        {row.product.caseSize &&
                                                                            row.product.casePrice &&
                                                                            row.quantity >= row.product.caseSize && (
                                                                                <div className="text-[10px] text-teal-600">Case discount applied</div>
                                                                            )}
                                                                    </div>
                                                                ) : (
                                                                    "-"
                                                                )}
                                                            </TableCell>

                                                            <TableCell className="text-right font-normal">
                                                                {row.product ? (
                                                                    <div className="text-right">
                                                                        <div>KES {row.total.toLocaleString()}</div>
                                                                    </div>
                                                                ) : (
                                                                    "-"
                                                                )}
                                                            </TableCell>

                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeRow(index)}
                                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                    type="button"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <Button variant="outline" size="sm" onClick={addRow} className="gap-1" type="button">
                                                <Plus className="h-4 w-4" />
                                                Add Row
                                            </Button>

                                            <div className="flex items-center gap-4">
                                                <div className="text-sm text-muted-foreground">
                                                    Items: <span className="font-normal">{getTotalItems()}</span>
                                                </div>
                                                <div className="text-sm">
                                                    Total: <span className="font-normal">KES {getTotal().toLocaleString()}</span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="bg-teal-600 hover:bg-teal-700 text-white"
                                                    onClick={() => setShowOrderSummary(true)}
                                                    disabled={filledRows.length === 0}
                                                >
                                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                                    Review Order
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="order-history">
                        <Card className="shadow-sm border-0">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Order History</CardTitle>
                                        <CardDescription>View and track your previous orders from {activeDistributor.name}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input placeholder="Search orders..." className="w-[200px]" />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Filter className="h-4 w-4 mr-2" />
                                                    Filter
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                                <DropdownMenuItem>All Orders</DropdownMenuItem>
                                                <DropdownMenuItem>Pending</DropdownMenuItem>
                                                <DropdownMenuItem>Confirmed</DropdownMenuItem>
                                                <DropdownMenuItem>Shipped</DropdownMenuItem>
                                                <DropdownMenuItem>Delivered</DropdownMenuItem>
                                                <DropdownMenuItem>Cancelled</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead>Order ID</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Items</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                                <TableHead className="w-[100px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orderHistory.map((order) => (
                                                <TableRow key={order.id} className="hover:bg-muted/30 cursor-pointer">
                                                    <TableCell className="font-normal">{order.id}</TableCell>
                                                    <TableCell>{order.date}</TableCell>
                                                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                                                    <TableCell>{order.items}</TableCell>
                                                    <TableCell className="text-right">KES {order.total.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm">
                                                            View Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Distributor Info Sheet */}
            <Sheet open={showDistributorInfo} onOpenChange={setShowDistributorInfo}>
                <SheetContent className="sm:max-w-md px-3">
                    <SheetHeader>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src={activeDistributor.logo || "/placeholder.svg"} alt={activeDistributor.name} />
                                <AvatarFallback>
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <SheetTitle>{activeDistributor.name}</SheetTitle>
                                <SheetDescription>{activeDistributor.location}</SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="mt-2 space-y-2">
                        {/* Key Info Cards */}
                        <div className="grid grid-cols-2 gap-2">
                            <Card className="p-3">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">Lead Time</span>
                                    <span className="font-normal">{activeDistributor.leadTime}</span>
                                </div>
                            </Card>
                            <Card className="p-1.5">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">Min. Order</span>
                                    <span className="font-normal">{activeDistributor.minimumOrder}</span>
                                </div>
                            </Card>
                            <Card className="p-1.5">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">Payment Terms</span>
                                    <span className="font-normal">{activeDistributor.paymentTerms}</span>
                                </div>
                            </Card>
                            <Card className="p-1.5">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">Contact</span>
                                    <span className="font-normal">{activeDistributor.contactPerson}</span>
                                </div>
                            </Card>
                        </div>

                        <div>
                            <h4 className="text-sm font-normal mb-2">Popular Brands</h4>
                            <div className="flex flex-wrap gap-2">
                                {activeDistributor.popularBrands.map((brand) => (
                                    <Badge key={brand} variant="outline" className="bg-muted">
                                        <Wine className="h-3 w-3 mr-1" />
                                        {brand}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Order Summary Sheet */}
            <Sheet open={showOrderSummary} onOpenChange={setShowOrderSummary}>
                <SheetContent className="sm:max-w-xl px-4 overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Order Summary</SheetTitle>
                        <SheetDescription>Review your order before submitting</SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-10 w-10 border">
                                    <AvatarImage src={activeDistributor.logo || "/placeholder.svg"} alt={activeDistributor.name} />
                                    <AvatarFallback>
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-normal">{activeDistributor.name}</h3>
                                    <p className="text-xs text-muted-foreground">{activeDistributor.location}</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-sm font-normal">Order Date</div>
                                <div className="text-sm">{format(new Date(), "MMM dd, yyyy")}</div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="text-sm font-normal mb-2">Order Items ({getTotalItems()})</h4>
                            <div className="rounded-md border overflow-hidden">
                                <Table className="text-xs">
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filledRows.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-normal">{row.product?.name}</div>
                                                        <div className="text-xs text-muted-foreground">SKU: {row.product?.sku}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">{row.quantity}</TableCell>
                                                <TableCell className="text-right">KES {row.price.toLocaleString()}</TableCell>
                                                <TableCell className="text-right font-normal">KES {row.total.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-normal mb-2">Delivery Information</h4>
                                <div className="rounded-md border p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-muted-foreground" />
                                        <div className="text-sm">
                                            <span className="font-normal">Delivery Date:</span>{" "}
                                            {form.getValues().deliveryDate
                                                ? format(form.getValues().deliveryDate, "MMM dd, yyyy")
                                                : "Not specified"}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div className="text-sm">
                                            <span className="font-normal">Special Instructions:</span>{" "}
                                            <p className="text-muted-foreground mt-1">
                                                {form.getValues().specialInstructions || "None provided"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-normal mb-2">Order Summary</h4>
                                <div className="rounded-md border p-3">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal:</span>
                                            <span>KES {getSubtotal().toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">VAT (16%):</span>
                                            <span>KES {getTax().toLocaleString()}</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between font-normal">
                                            <span>Total:</span>
                                            <span>KES {getTotal().toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2 text-xs text-muted-foreground">
                                    <p>By placing this order, you agree to the supplier&apos;s T&Cs.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="mt-6 flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setShowOrderSummary(false)} className="sm:flex-1 h-8 text-xs">
                            Edit Order
                        </Button>
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            className="bg-teal-600 hover:bg-teal-700 text-white sm:flex-1 h-8 text-xs"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Place Order
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    )
}
