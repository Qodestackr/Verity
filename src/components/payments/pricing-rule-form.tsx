"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Plus, Trash2, Info, ArrowRight, ArrowLeft, Percent, DollarSign, Tag } from "lucide-react"
import { format } from "date-fns"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "@/lib/zod";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { ProductSelector } from "@/components/products/product-selector"
import { cn } from "@/lib/utils"
import { PricingTier } from "@/types/payments"

// API data
const sampleRules = [
    {
        id: "1",
        name: "Tusker Bulk Discount",
        productId: "prod_1",
        productName: "Tusker Lager",
        discountType: "percentage",
        status: "active",
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-06-30"),
        tiers: [
            { min: 1, max: 10, value: 0 },
            { min: 11, max: 50, value: 5 },
            { min: 51, max: 100, value: 10 },
            { min: 101, max: null, value: 15 },
        ],
    },
    {
        id: "2",
        name: "Premium Spirits Volume Pricing",
        productId: "prod_2",
        productName: "Various Premium Spirits",
        discountType: "fixed",
        status: "scheduled",
        startDate: new Date("2025-05-15"),
        endDate: new Date("2025-07-15"),
        tiers: [
            { min: 1, max: 5, value: 0 },
            { min: 6, max: 20, value: 100 },
            { min: 21, max: null, value: 200 },
        ],
    },
]

const pricingTierSchema = z.object({
    min: z.number().min(1, "Minimum quantity must be at least 1"),
    max: z.number().nullable(),
    value: z.number().min(0, "Discount value must be at least 0"),
})

const formSchema = z.object({
    name: z.string().min(3, "Rule name must be at least 3 characters"),
    productId: z.string().min(1, "Please select a product"),
    productName: z.string(),
    discountType: z.enum(["percentage", "fixed"]),
    startDate: z.date(),
    endDate: z.date(),
    tiers: z
        .array(pricingTierSchema)
        .min(1, "At least one pricing tier is required")
        .refine(
            (tiers) => {
                // Check that tiers are in ascending order by min quantity
                for (let i = 1; i < tiers.length; i++) {
                    if (tiers[i].min <= tiers[i - 1].min) {
                        return false
                    }
                    // Check that max of previous tier is one less than min of current tier
                    if (tiers[i - 1].max !== null && tiers[i - 1].max + 1 !== tiers[i].min) {
                        return false
                    }
                }
                return true
            },
            {
                message: "Pricing tiers must be in ascending order with no gaps between tiers",
            },
        ),
})

type FormValues = z.infer<typeof formSchema>

type PricingRuleFormProps = {
    editId?: string
}

export function PricingRuleForm({    
 editId }: PricingRuleFormProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("details")

    // Initialize form with default values or existing rule data
    const defaultValues: Partial<FormValues> = {
        name: "",
        productId: "",
        productName: "",
        discountType: "percentage",
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        tiers: [
            { min: 1, max: 10, value: 0 },
            { min: 11, max: null, value: 5 },
        ],
    }

    // If editing, load the existing rule data
    if (editId) {
        const rule = sampleRules.find((r) => r.id === editId)
        if (rule) {
            defaultValues.name = rule.name
            defaultValues.productId = rule.productId
            defaultValues.productName = rule.productName
            defaultValues.discountType = rule.discountType as "percentage" | "fixed"
            defaultValues.startDate = rule.startDate
            defaultValues.endDate = rule.endDate
            defaultValues.tiers = [...rule.tiers]
        }
    }

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
        mode: "onChange",
    })

    const { control, handleSubmit, watch, setValue, getValues, formState } = form
    const watchTiers = watch("tiers")
    const watchDiscountType = watch("discountType")

    const onSubmit = (data: FormValues) => {
        console.log("Form submitted:", data)
        // save the data to API
        router.push("/")
    }

    const addTier = () => {
        const currentTiers = getValues("tiers")
        const lastTier = currentTiers[currentTiers.length - 1]

        const newMin = lastTier.max ? lastTier.max + 1 : lastTier.min + 10
        const newTier = {
            min: newMin,
            max: null,
            value: lastTier.value + 5,
        }

        setValue("tiers", [...currentTiers, newTier], { shouldValidate: true })
    }

    const removeTier = (index: number) => {
        const currentTiers = getValues("tiers")
        if (currentTiers.length > 1) {
            // If removing a tier in the middle, adjust the max of the previous tier
            if (index > 0 && index < currentTiers.length - 1) {
                currentTiers[index - 1].max = currentTiers[index + 1].min - 1
            }

            const newTiers = currentTiers.filter((_, i) => i !== index)
            setValue("tiers", newTiers, { shouldValidate: true })
        }
    }

    const updateTierMax = (index: number, value: number | null) => {
        const currentTiers = getValues("tiers")

        // Update the current tier's max
        currentTiers[index].max = value

        // If there's a next tier, update its min to be max + 1
        if (index < currentTiers.length - 1 && value !== null) {
            currentTiers[index + 1].min = value + 1
        }

        setValue("tiers", currentTiers, { shouldValidate: true })
    }

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details" className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Rule Details
                        </TabsTrigger>
                        <TabsTrigger value="tiers" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Pricing Tiers
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 pt-4">
                        <Card className="border-none shadow-md">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Define the basic details for your pricing rule</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <FormField
                                    control={control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rule Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Tusker Bulk Discount"
                                                    {...field}
                                                    className="border-slate-300 focus-visible:ring-slate-400"
                                                />
                                            </FormControl>
                                            <FormDescription>A descriptive name for this pricing rule</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="productId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product</FormLabel>
                                            <FormControl>
                                                <ProductSelector
                                                    selectedProductId={field.value}
                                                    selectedProductName={form.getValues("productName")}
                                                    onProductSelect={(id, name) => {
                                                        field.onChange(id)
                                                        setValue("productName", name)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>This pricing rule will apply to all products</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="discountType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Discount Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="border-slate-300 focus-visible:ring-slate-400">
                                                        <SelectValue placeholder="Select discount type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="percentage" className="flex items-center gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <Percent className="h-4 w-4 text-slate-500" />
                                                            <span>Percentage (%)</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="fixed" className="flex items-center gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="h-4 w-4 text-slate-500" />
                                                            <span>Fixed Amount (KSh)</span>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                {field.value === "percentage"
                                                    ? "Discount as a percentage of the product price"
                                                    : "Discount as a fixed amount in KSh"}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                                <CardTitle>Date Range</CardTitle>
                                <CardDescription>Set when this pricing rule will be active</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                <FormField
                                    control={control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal border-slate-300",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>When this pricing rule becomes active</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>End Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal border-slate-300",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date < form.getValues("startDate")}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>When this pricing rule expires</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter className="flex justify-end pt-2 pb-6">
                                <Button
                                    type="button"
                                    onClick={() => setActiveTab("tiers")}
                                    className="gap-2 bg-slate-800 hover:bg-slate-700"
                                >
                                    Next: Pricing Tiers
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tiers" className="space-y-4 pt-4">
                        <Card className="border-none shadow-md">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg flex flex-row items-center justify-between space-y-0 pb-2">
                                <div>
                                    <CardTitle>Pricing Tiers</CardTitle>
                                    <CardDescription>Define discount tiers based on quantity ranges</CardDescription>
                                </div>
                                <Button type="button" onClick={addTier} variant="outline" size="sm" className="gap-1 border-slate-300">
                                    <Plus className="h-4 w-4" />
                                    Add Tier
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-500">
                                        <div className="col-span-3">Quantity Range</div>
                                        <div className="col-span-7">
                                            <div className="flex items-center gap-1">
                                                {watchDiscountType === "percentage" ? "Discount %" : "Discount Amount (KSh)"}
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="h-3.5 w-3.5 text-slate-400" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="max-w-xs">
                                                                {watchDiscountType === "percentage"
                                                                    ? "The percentage discount applied to products in this quantity range"
                                                                    : "The fixed amount discount applied to products in this quantity range"}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>
                                        <div className="col-span-2">Actions</div>
                                    </div>

                                    <Separator className="bg-slate-200" />

                                    {watchTiers.map((tier, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-4 items-center">
                                            <div className="col-span-3 flex items-center gap-2">
                                                <div className="flex flex-col">
                                                    <FormField
                                                        control={control}
                                                        name={`tiers.${index}.min`}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-0">
                                                                <FormControl>
                                                                    <div className="flex items-center gap-2">
                                                                        <Input
                                                                            {...field}
                                                                            type="number"
                                                                            onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                                                                            className="w-24 border-slate-300"
                                                                            disabled={index > 0}
                                                                        />
                                                                        <span>to</span>
                                                                    </div>
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <FormField
                                                    control={control}
                                                    name={`tiers.${index}.max`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-0">
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    value={field.value === null ? "" : field.value}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value === "" ? null : Number.parseInt(e.target.value)
                                                                        field.onChange(value)
                                                                        updateTierMax(index, value)
                                                                    }}
                                                                    placeholder="∞"
                                                                    className="w-24 border-slate-300"
                                                                    disabled={index < watchTiers.length - 1}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="col-span-7">
                                                <FormField
                                                    control={control}
                                                    name={`tiers.${index}.value`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-0">
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        {...field}
                                                                        type="number"
                                                                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                                                        className={cn(
                                                                            "border-slate-300",
                                                                            watchDiscountType === "percentage" ? "pr-8" : "pl-8",
                                                                        )}
                                                                    />
                                                                    {watchDiscountType === "percentage" ? (
                                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                                                                    ) : (
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">KSh</span>
                                                                    )}
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeTier(index)}
                                                    disabled={watchTiers.length <= 1}
                                                    className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setActiveTab("details")}
                                className="gap-2 border-slate-300"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Details
                            </Button>

                            <div className="flex space-x-4">
                                <Button type="button" variant="outline" onClick={() => router.push("/")} className="border-slate-300">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={!formState.isValid} className="bg-slate-800 hover:bg-slate-700">
                                    {editId ? "Update Rule" : "Create Rule"}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </Form>
    )
}