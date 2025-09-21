"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2, Package, Save } from "lucide-react"

// Simplified product types - just the basics
const productTypes = ["Alcoholic", "Non-Alcoholic", "Food", "Other"]

// Simplified form schema focusing only on essential fields
const productFormSchema = z.object({
    // Essential fields only
    name: z.string().min(2, { message: "Product name must be at least 2 characters" }),
    type: z.string().min(1, { message: "Please select a product type" }),
    sku: z.string().min(3, { message: "SKU/Barcode must be at least 3 characters" }),
    price: z.coerce
        .number({ invalid_type_error: "Please enter a valid price" })
        .positive({ message: "Price must be positive" }),
    stock: z.coerce.number().nonnegative().default(0),
    isAvailable: z.boolean().default(true),
})

type ProductFormValues = z.infer<typeof productFormSchema>

export default function ProductBuilder() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize form with default values
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: "",
            type: "",
            sku: "",
            price: undefined,
            stock: 0,
            isAvailable: true,
        },
    })

    // Handle form submission
    const onSubmit = async (data: ProductFormValues) => {
        setIsSubmitting(true)

        try {
            // Process the data - extract information and apply smart defaults
            const processedData = {
                ...data,
                // TODO: Extract volume from product name if possible (e.g., "Tusker Lager 500ML" -> volume: "500ML")
                volume: extractVolumeFromName(data.name),

                // Apply smart defaults for fields we don't ask for
                brand: extractBrandFromName(data.name), // Default to first word or part of name
                alcoholPercentage: data.type === "Alcoholic" ? "40%" : "", // Default ABV for alcoholic products
                origin: "Kenya", // Default country of origin
                category: getCategoryFromType(data.type), // Derive category from type
            }

            console.log("Submitting product data:", processedData)

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast.success("Product added successfully", {
                description: `${data.name} has been added to your inventory.`,
            })

            // Reset form
            form.reset()
        } catch (error) {
            console.error("Error adding product:", error)
            toast.error("Failed to add product", {
                description: error instanceof Error ? error.message : "An unexpected error occurred",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Helper functions to extract information from product name
    function extractVolumeFromName(name: string): string {
        // Simple regex to find common volume patterns like "500ML", "1L", "750ml", etc.
        const volumeRegex = /\b(\d+(\.\d+)?)\s*(ml|ML|l|L)\b/i
        const match = name.match(volumeRegex)
        return match ? match[0] : ""
    }

    function extractBrandFromName(name: string): string {
        // Simple heuristic: use the first word as the brand
        // TODO: Enhance with AI to recognize actual brands
        const firstWord = name.split(" ")[0]
        return firstWord || "Unknown"
    }

    function getCategoryFromType(type: string): string {
        // Simple mapping from type to default category
        switch (type) {
            case "Alcoholic":
                return "Spirits" // Default category for alcoholic
            case "Non-Alcoholic":
                return "Soft Drinks" // Default category for non-alcoholic
            case "Food":
                return "Meals" // Default category for food
            default:
                return "Miscellaneous"
        }
    }

    return (
        <Card className="border-teal-100 shadow-md py-0">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
                <CardTitle className="text-teal-800 flex items-center gap-2">
                    <Package className="h-5 w-5 text-teal-600" />
                    Add New Product
                </CardTitle>
                <CardDescription>Enter the basic details to add a product to your inventory</CardDescription>
            </CardHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="p-6 space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Tusker Lager 500ML" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Include the volume in the name (e.g., "Tusker Lager 500ML", "Kenya Cane 750ML")
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SKU/Barcode *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter SKU or scan barcode" {...field} />
                                        </FormControl>
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
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Initial Stock</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormDescription>Leave as 0 if you don't have stock yet</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isAvailable"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Available for Sale</FormLabel>
                                        <FormDescription>Make this product available in your store</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>

                    <CardFooter className="bg-slate-50 border-t p-6">
                        <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 ml-auto">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Product
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}
