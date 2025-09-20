"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useCurrency } from "@/hooks/useCurrency";
import z from "@/lib/zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Barcode, Plus, Minus, X, Save, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import TagInput from "@/components/ui/tag-input"
import { CreateProductDocument } from '@/gql/graphql';
import { createCompleteProduct } from '@/services/product-service';
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

const productSuggestions = [
    { id: "tusker-lager", label: "Tusker Lager" },
    { id: "johnnie-walker-black", label: "Johnnie Walker Black Label" },
    { id: "absolut-vodka", label: "Absolut Vodka" },
    { id: "jameson-whiskey", label: "Jameson Irish Whiskey" },
    { id: "hennessy-vsop", label: "Hennessy VSOP" },
    { id: "jack-daniels", label: "Jack Daniel's" },
    { id: "bombay-sapphire", label: "Bombay Sapphire Gin" },
    { id: "bacardi-rum", label: "Bacardi White Rum" },
    { id: "smirnoff-vodka", label: "Smirnoff Vodka" },
    { id: "baileys-irish-cream", label: "Baileys Irish Cream" },
    { id: "corona-extra", label: "Corona Extra Beer" },
    { id: "heineken", label: "Heineken Beer" },
    { id: "glenfiddich-12", label: "Glenfiddich 12 Year Old" },
    { id: "moet-chandon", label: "Moët & Chandon Champagne" },
    { id: "captain-morgan", label: "Captain Morgan Spiced Rum" },
]

const categorySuggestions = [
    { id: "beer", label: "Beer" },
    { id: "whisky", label: "Whisky" },
    { id: "vodka", label: "Vodka" },
    { id: "gin", label: "Gin" },
    { id: "rum", label: "Rum" },
    { id: "tequila", label: "Tequila" },
    { id: "liqueur", label: "Liqueur" },
    { id: "wine", label: "Wine" },
    { id: "champagne", label: "Champagne" },
    { id: "brandy", label: "Brandy" },
    { id: "cognac", label: "Cognac" },
    { id: "cider", label: "Cider" },
    { id: "spirits", label: "Other Spirits" },
]

const BarcodeScanner = ({ onScan }: { onScan: (code: string) => void }) => {
    return (
        <Button variant="outline" className="w-full flex gap-2 h-20 border-dashed" onClick={() => onScan("8901072000126")}>
            <Barcode className="h-5 w-5" />
            <div className="flex flex-col items-center">
                <span>Scan Barcode</span>
                <span className="text-xs text-muted-foreground">Tap to activate scanner</span>
            </div>
        </Button>
    )
}

const productSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    categories: z
        .array(
            z.object({
                id: z.string(),
                label: z.string(),
            }),
        )
        .min(1, "At least one category is required"),
    price: z
        .string()
        .min(1, "Price is required")
        .refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) >= 0, {
            message: "Price must be a positive number",
        }),
    cost: z.string().optional(),
    stock: z.string().default("1"),
    barcode: z.string().optional(),
    description: z.string().optional(),
    lowStockAlert: z.string().default("5"),
    isPopular: z.boolean().default(false),
    hasVariants: z.boolean().default(false),
    variants: z
        .array(
            z.object({
                id: z.string(),
                name: z.string(),
                price: z.string(),
                stock: z.string(),
            }),
        )
        .optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function AddProductPage() {
    const router = useRouter()
    const isMobile = useIsMobile()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [activeTab, setActiveTab] = useState("basic")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [variants, setVariants] = useState<Array<{ id: string; name: string; price: string; stock: string }>>([])

    const organizationSlug = useOrganizationSlug()

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            categories: [],
            price: "",
            cost: "",
            stock: "1",
            barcode: "",
            description: "",
            lowStockAlert: "5",
            isPopular: false,
            hasVariants: false,
            variants: [],
        },
    })
    const hasVariants = form.watch("hasVariants")
    const handleBarcodeScan = (code: string) => {
        form.setValue("barcode", code)
        if (code === "8901072000126") {
            toast.success("Product found in database", {
                description: "Some fields have been pre-filled",
            })

            form.setValue("name", "Johnnie Walker Black Label")
            form.setValue("categories", [{ id: "whisky", label: "Whisky" }])
            form.setValue("price", "3500")
            form.setValue("cost", "2800")
            form.setValue("description", "Premium blended Scotch whisky, aged 12 years")
        }
    }
    const addVariant = () => {
        const newVariant = {
            id: Date.now().toString(),
            name: "",
            price: form.getValues("price"),
            stock: "1",
        }
        setVariants([...variants, newVariant])
    }
    const removeVariant = (id: string) => {
        setVariants(variants.filter((v) => v.id !== id))
    }
    const updateVariant = (id: string, field: string, value: string) => {
        setVariants(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)))
    }

    const onSubmit = async (values: ProductFormValues) => {
        setIsSubmitting(true)

        console.log("Form values:", values)
        console.log("Variants:", variants)

        try {
            const result = await createCompleteProduct({
                name: values.name,
                category: values.categories[0].label,
                price: values.price,
                stock: parseInt(values.stock),
                alcoholContent: "40%",
                volume: "750ml"
            });

            if (result.success) {
                setIsSubmitting(false);
                toast.success("Product created successfully");
                router.push(`/dashboard/${organizationSlug}/inventory`);
            } else {
                toast.error("Failed to create product");
            }
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error("An unexpected error occurred");
        }
    }

    if (showSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                >
                    <Check className="h-8 w-8 text-green-600" />
                </motion.div>

                <h1 className="text-2xl font-bold mb-2">Product Added!</h1>
                <p className="text-center text-muted-foreground mb-6">
                    {form.getValues("name")} has been added to your inventory
                </p>

                <div className="flex gap-3">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/inventory">Back to Inventory</Link>
                    </Button>
                    <Button
                        onClick={() => {
                            setShowSuccess(false)
                            form.reset()
                            setVariants([])
                        }}
                    >
                        Add Another Product
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="border-b bg-background sticky top-0 z-10 px-4 py-2">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/dashboard/inventory">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-xl font-normal">Add New Product</h1>
                    </div>

                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting} className="gap-1 h-8 text-xs" size="sm">
                        {isSubmitting ? (
                            <>
                                <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                <span>Save Product</span>
                            </>
                        )}
                    </Button>
                </div>
            </header>
            <ScrollArea className="flex-1">
                <div className="max-w-4xl mx-auto p-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-6">
                                    {isMobile && (
                                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                                                <TabsTrigger value="variants">Variants</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    )}
                                    {(!isMobile || activeTab === "basic") && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Basic Information</CardTitle>
                                                <CardDescription>Enter the product details</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Product Name <span className="text-destructive">*</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <TagInput
                                                                    placeholder="Search for existing products or add new..."
                                                                    label=""
                                                                    suggestions={productSuggestions}
                                                                    maxTags={1}
                                                                    onChange={(tags) => {
                                                                        if (tags.length > 0) {
                                                                            const selectedProduct = productSuggestions.find((p) => p.id === tags[0].id)
                                                                            if (selectedProduct) {
                                                                                form.setValue("name", selectedProduct.label)

                                                                                // Auto-fill other fields based on the selected product
                                                                                if (selectedProduct.id === "johnnie-walker-black") {
                                                                                    form.setValue("categories", [{ id: "whisky", label: "Whisky" }])
                                                                                    form.setValue("price", "3500")
                                                                                    form.setValue("cost", "2800")
                                                                                    form.setValue("description", "Premium blended Scotch whisky, aged 12 years")
                                                                                    form.setValue("barcode", "8901072000126")
                                                                                } else if (selectedProduct.id === "tusker-lager") {
                                                                                    form.setValue("categories", [{ id: "beer", label: "Beer" }])
                                                                                    form.setValue("price", "180")
                                                                                    form.setValue("cost", "120")
                                                                                    form.setValue("description", "Kenya's iconic lager beer")
                                                                                    form.setValue("barcode", "5740900719375")
                                                                                } else if (selectedProduct.id === "absolut-vodka") {
                                                                                    form.setValue("categories", [{ id: "vodka", label: "Vodka" }])
                                                                                    form.setValue("price", "2200")
                                                                                    form.setValue("cost", "1800")
                                                                                    form.setValue("description", "Premium Swedish vodka")
                                                                                    form.setValue("barcode", "7312040017669")
                                                                                }

                                                                                toast.success(`Found product: ${selectedProduct.label}`, {
                                                                                    description: "Product details have been filled automatically",
                                                                                })
                                                                            } else {
                                                                                // If it's a new product, just set the name
                                                                                form.setValue("name", tags[0].label)
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Search for existing products or enter a new product name
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem className="hidden">
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="categories"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Categories <span className="text-destructive">*</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <TagInput
                                                                    placeholder="Search or add categories..."
                                                                    label=""
                                                                    suggestions={categorySuggestions}
                                                                    onChange={field.onChange}
                                                                    defaultTags={field.value}
                                                                    error={form.formState.errors.categories?.message as string}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>Select existing categories or create new ones</FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="price"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    Selling Price (KSh) <span className="text-destructive">*</span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input type="number" placeholder="0" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="cost"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Cost Price (KSh)</FormLabel>
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
                                                    name="description"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Description</FormLabel>
                                                            <FormControl>
                                                                <Textarea placeholder="Product description..." className="min-h-[80px]" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="isPopular"
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center space-x-2">
                                                            <FormControl>
                                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                            </FormControl>
                                                            <FormLabel>Mark as popular product</FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                    )}
                                    {(!isMobile || activeTab === "inventory") && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Inventory</CardTitle>
                                                <CardDescription>Manage stock and tracking</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <FormField
                                                    control={form.control}
                                                    name="stock"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Initial Stock</FormLabel>
                                                            <div className="flex">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="rounded-r-none"
                                                                    onClick={() => {
                                                                        const currentValue = Number.parseInt(field.value) || 0
                                                                        field.onChange(Math.max(1, currentValue - 1).toString())
                                                                    }}
                                                                >
                                                                    <Minus className="h-4 w-4" />
                                                                </Button>
                                                                <FormControl>
                                                                    <Input type="number" className="rounded-none text-center" {...field} />
                                                                </FormControl>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="rounded-l-none"
                                                                    onClick={() => {
                                                                        const currentValue = Number.parseInt(field.value) || 0
                                                                        field.onChange((currentValue + 1).toString())
                                                                    }}
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="lowStockAlert"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Low Stock Alert Threshold</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} />
                                                            </FormControl>
                                                            <FormDescription>You'll be alerted when stock falls below this number</FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="barcode"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Barcode (UPC/EAN)</FormLabel>
                                                            <div className="flex gap-2">
                                                                <FormControl>
                                                                    <Input placeholder="Enter barcode" className="flex-1" {...field} />
                                                                </FormControl>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        const randomBarcode = Math.floor(Math.random() * 10000000000000)
                                                                            .toString()
                                                                            .padStart(13, "0")
                                                                        field.onChange(randomBarcode)
                                                                    }}
                                                                >
                                                                    <Barcode className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="pt-2">
                                                    <BarcodeScanner onScan={handleBarcodeScan} />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                    {(!isMobile || activeTab === "variants") && (
                                        <Card>
                                            <CardHeader>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <CardTitle>Variants</CardTitle>
                                                        <CardDescription>Add product variations</CardDescription>
                                                    </div>
                                                    <FormField
                                                        control={form.control}
                                                        name="hasVariants"
                                                        render={({ field }) => (
                                                            <FormItem className="flex items-center space-x-2">
                                                                <FormControl>
                                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                                </FormControl>
                                                                <FormLabel>Has variants</FormLabel>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </CardHeader>

                                            {hasVariants && (
                                                <CardContent className="space-y-2">
                                                    {variants.length === 0 ? (
                                                        <div className="text-center py-2">
                                                            <p className="text-muted-foreground mb-4">No variants added yet</p>
                                                            <Button type="button" className="h-8 text-xs" size="sm" onClick={addVariant}>
                                                                <Plus className="h-4 w-4 mr-1" />
                                                                Add Variant
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="space-y-2">
                                                                {variants.map((variant, index) => (
                                                                    <div key={variant.id} className="border rounded-md p-2 relative">
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="absolute right-2 top-2 h-6 w-6 text-muted-foreground"
                                                                            onClick={() => removeVariant(variant.id)}
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>

                                                                        <div className="grid gap-3">
                                                                            <div className="space-y-2">
                                                                                <Label htmlFor={`variant-name-${variant.id}`}>Variant Name (e.g. 750ml)</Label>
                                                                                <Input
                                                                                    id={`variant-name-${variant.id}`}
                                                                                    value={variant.name}
                                                                                    onChange={(e) => updateVariant(variant.id, "name", e.target.value)}
                                                                                    placeholder="e.g. 750ml, 1L, etc."
                                                                                />
                                                                            </div>

                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div className="space-y-2">
                                                                                    <Label htmlFor={`variant-price-${variant.id}`}>Price (KSh)</Label>
                                                                                    <Input
                                                                                        id={`variant-price-${variant.id}`}
                                                                                        type="number"
                                                                                        value={variant.price}
                                                                                        onChange={(e) => updateVariant(variant.id, "price", e.target.value)}
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <Label htmlFor={`variant-stock-${variant.id}`}>Stock</Label>
                                                                                    <Input
                                                                                        id={`variant-stock-${variant.id}`}
                                                                                        type="number"
                                                                                        value={variant.stock}
                                                                                        onChange={(e) => updateVariant(variant.id, "stock", e.target.value)}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={addVariant}
                                                                className="w-full text-xs h-8"
                                                                size="sm"
                                                            >
                                                                <Plus className="h-4 w-4 mr-1" />
                                                                Add Another Variant
                                                            </Button>
                                                        </>
                                                    )}
                                                </CardContent>
                                            )}
                                        </Card>
                                    )}
                                </div>
                            </div>
                            {isMobile && (
                                <div className="sticky bottom-0 bg-background border-t p-2 mt-4">
                                    <Button type="submit" className="w-full h-8 text-xs cursor-pointer" size="sm" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Product
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </Form>
                </div>
            </ScrollArea>
        </div>
    )
}
