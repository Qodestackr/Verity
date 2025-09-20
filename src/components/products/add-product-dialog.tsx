"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "@/lib/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { addProduct } from "@/services/add-product-service"
import { toast } from "sonner"
import { useCacheProduct } from "@/hooks/use-cache-product"

const productTypes = ["Alcoholic", "Non-Alcoholic"]
const categories = ["Alcoholic", "Non-Alcoholic"]

export const volumes = [
    "250ML", "275ML", "300ML", "330ML", "350ML", "375ML", "440ML", "500ML",
    "620ML", "650ML", "700ML", "750ML", "1L", "1.5L", "1.75L", "2L", "5L",
];

export const countries = [
    "Kenya", "Uganda", "Tanzania", "South Africa", // Regional
    "United Kingdom", "Scotland", "Ireland",
    "Germany", "France", "Italy", "Spain", "Netherlands", "Belgium", "Sweden", "Denmark", "Poland", "Russia", // Europe
    "United States", "Mexico", "Canada", // North America
    "Japan", "India", "China", "Thailand", // Asia
    "Australia", "New Zealand",
    "Other"
];

const productFormSchema = z.object({
    name: z.string().min(2, { message: "Product name must be at least 2 characters" }),
    brand: z.string().min(2, { message: "Brand must be at least 2 characters" }),
    type: z.string().min(1, { message: "Please select a product type" }),
    category: z.string().min(1, { message: "Please select a category" }),
    volume: z.string().min(1, { message: "Please select a volume" }),
    price: z.coerce
        .number({ invalid_type_error: "Please enter a valid price" })
        .positive({ message: "Price must be positive" }),
    sku: z.string().min(3, { message: "SKU must be at least 3 characters" }),
    alcoholPercentage: z.string().optional(),
    origin: z.string().optional(),
    stock: z.coerce.number().nonnegative().optional(),
    description: z.string().optional(),
})

// Infer the type from the schema
type ProductFormValues = z.infer<typeof productFormSchema>

export function AddProductDialog({
    open, onOpenChange, onAddProduct }: any) {
    const [activeTab, setActiveTab] = useState("basic")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { mutateAsync: cacheProduct } = useCacheProduct();

    // Initialize the form with react-hook-form and zod resolver
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: "",
            brand: "",
            type: "",
            category: "",
            volume: "",
            price: undefined,
            sku: "",
            alcoholPercentage: "",
            origin: "",
            stock: undefined,
            description: "",
        },
    })

    // Handle form submission
    const onSubmit = async (data: ProductFormValues) => {
        setIsSubmitting(true)

        try {
            // Process the data
            const processedData = {
                ...data,
                alcoholPercentage: data.alcoholPercentage?.endsWith("%")
                    ? data.alcoholPercentage
                    : data.alcoholPercentage
                        ? `${data.alcoholPercentage}%`
                        : "40%", // Default value
                stock: data.stock || 0,
                description: data.description || "",
            }
            console.log("Submitting product data:", processedData)

            // Call the service to add the product to Saleor
            const result = await addProduct(processedData)

            console.log("So Result from AddProductService Is here?", result)

            if (result.success) {
                toast.success("Product added successfully", {
                    description: `Success!`,
                })

                try {
                    await cacheProduct({
                        ...processedData,
                        productId: result.productId,
                    });
                    toast.success("Product cached in Redis");
                } catch (error) {
                    console.error('Redis cache error:', error);
                    toast.warning("Product created but Redis cache failed", {
                        description: (error as Error).message,
                    });
                }

                onAddProduct(processedData)
                form.reset()
                setActiveTab("basic")
                onOpenChange(false)
            } else {
                toast.error("Failed to add product", {
                    description: result.error || "An unknown error occurred",
                })
            }
        } catch (error) {
            console.error("Error adding product:", error)
            toast.error("Error", {
                description: (error as any)?.message || "An unexpected error occurred",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Helper to navigate between tabs
    const goToNextTab = () => {
        if (activeTab === "basic") {
            // Validate basic fields before proceeding
            const basicFields = ["name", "brand", "type", "category", "volume", "price", "sku"]
            const isBasicValid = basicFields.every((field) => form.getFieldState(field as any).invalid === false)

            if (isBasicValid) {
                setActiveTab("details")
            } else {
                // Trigger validation on basic fields
                form.trigger(basicFields as any)
            }
        } else if (activeTab === "details") {
            setActiveTab("inventory")
        }
    }

    const goToPreviousTab = () => {
        if (activeTab === "details") {
            setActiveTab("basic")
        } else if (activeTab === "inventory") {
            setActiveTab("details")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Add New Product</DialogTitle>
                            <DialogDescription>Enter the details for the new liquor product.</DialogDescription>
                        </DialogHeader>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-5">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter product name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="brand"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Brand *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter brand name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Type *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {productTypes.map((type) => (
                                                            <SelectItem key={type} value={type}>
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category} value={category}>
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="volume"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Volume *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select volume" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {volumes.map((volume) => (
                                                            <SelectItem key={volume} value={volume}>
                                                                {volume}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price (KES) *</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="sku"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SKU/Barcode *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter SKU" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end">
                                    <Button size="sm" className="text-xs h-8" type="button" onClick={goToNextTab}>
                                        Next
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="details" className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="alcoholPercentage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Alcohol Percentage</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. 40%" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="origin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country of Origin</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select country" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {countries.map((country) => (
                                                            <SelectItem key={country} value={country}>
                                                                {country}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter product description" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-between">
                                    <Button size="sm" className="text-xs h-8" type="button" variant="outline" onClick={goToPreviousTab}>
                                        Previous
                                    </Button>
                                    <Button size="sm" className="text-xs h-8" type="button" onClick={goToNextTab}>
                                        Next
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="inventory" className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Initial Stock</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <FormLabel>Warehouse</FormLabel>
                                    <div className="rounded-md border p-3 text-sm text-muted-foreground">
                                        (Default)
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <FormLabel>Channel</FormLabel>
                                    <div className="rounded-md border p-3 text-sm text-muted-foreground">(Default)</div>
                                </div>

                                <div className="flex justify-between">
                                    <Button type="button" variant="outline" onClick={goToPreviousTab}>
                                        Previous
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="mt-2">
                            <Button size="sm" className="text-xs h-8" type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            {activeTab === "inventory" && (
                                <Button size="sm" className="text-xs h-8" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Adding..." : "Add Product"}
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}