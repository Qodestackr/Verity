"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider } from "react-hook-form"
import z from "@/lib/zod";
import { format, addMonths } from "date-fns"
import { CalendarIcon, Plus, Minus, Copy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { APP_BASE_API_URL } from "@/config/urls";

const formSchema = z.object({
    name: z.string().min(3, "Budget name must be at least 3 characters"),
    startDate: z.date({
        required_error: "Start date is required",
    }),
    endDate: z
        .date({
            required_error: "End date is required",
        })
        .refine((date) => date > new Date(), {
            message: "End date must be in the future",
        }),
    totalAmount: z.coerce
        .number({
            required_error: "Total amount is required",
            invalid_type_error: "Total amount must be a number",
        })
        .positive("Total amount must be positive"),
    description: z.string().optional(),
    allocations: z
        .array(
            z.object({
                categoryId: z.string({
                    required_error: "Category is required",
                }),
                amount: z.coerce
                    .number({
                        required_error: "Amount is required",
                        invalid_type_error: "Amount must be a number",
                    })
                    .positive("Amount must be positive"),
                notes: z.string().optional(),
            }),
        )
        .min(1, "At least one category allocation is required"),
})

interface BudgetCreateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: z.infer<typeof formSchema>) => void
    organizationId: string
}

export function BudgetCreateDialog({
    open, onOpenChange, onSubmit, organizationId }: BudgetCreateDialogProps) {
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("manual")
    const [templates, setTemplates] = useState<any[]>([])
    const [suggestedBudget, setSuggestedBudget] = useState<any>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            startDate: new Date(),
            endDate: addMonths(new Date(), 1),
            totalAmount: 0,
            description: "",
            allocations: [{ categoryId: "", amount: 0, notes: "" }],
        },
    })

    // Calc total allocs
    const allocations = form.watch("allocations")
    const totalAllocations = allocations.reduce((sum, allocation) => sum + (Number(allocation.amount) || 0), 0)
    const totalBudget = form.watch("totalAmount") || 0
    const allocationDifference = totalBudget - totalAllocations

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${APP_BASE_API_URL}/accounting/expense-categories?organizationId=${organizationId}`)
                const data = await response.json()
                setCategories(data)
            } catch (error) {
                console.error("Error fetching categories:", error)
            }
        }

        if (open) {
            fetchCategories()
        }
    }, [open, organizationId])

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch(`${APP_BASE_API_URL}/accounting/budgets/templates?organizationId=${organizationId}&mode=templates`)
                const data = await response.json()
                setTemplates(data)
            } catch (error) {
                console.error("Error fetching budget templates:", error)
            }
        }

        const fetchSuggestedBudget = async () => {
            try {
                const response = await fetch(`${APP_BASE_API_URL}/accounting/budgets/templates?organizationId=${organizationId}&mode=suggest&months=3`)
                const data = await response.json()
                setSuggestedBudget(data)
            } catch (error) {
                console.error("Error fetching suggested budget:", error)
            }
        }

        if (open) {
            fetchTemplates()
            fetchSuggestedBudget()
        }
    }, [open, organizationId])

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        setIsLoading(true)
        onSubmit(values)
        setIsLoading(false)
    }

    const addAllocation = () => {
        const currentAllocations = form.getValues("allocations")
        form.setValue("allocations", [...currentAllocations, { categoryId: "", amount: 0, notes: "" }])
    }

    const removeAllocation = (index: number) => {
        const currentAllocations = form.getValues("allocations")
        if (currentAllocations.length > 1) {
            form.setValue(
                "allocations",
                currentAllocations.filter((_, i) => i !== index),
            )
        }
    }

    const applyTemplate = (template: any) => {
        const totalAmount = form.getValues("totalAmount")
        if (!totalAmount) {
            form.setError("totalAmount", {
                type: "manual",
                message: "Please set a total budget amount first",
            })
            return
        }

        // Calc allocations based on template %s
        const newAllocations = template.allocations
            .filter((allocation: any) => allocation.categoryId)
            .map((allocation: any) => ({
                categoryId: allocation.categoryId,
                amount: (totalAmount * allocation.percentage) / 100,
                notes: "",
            }))

        form.setValue("allocations", newAllocations)
    }

    const applySuggestedBudget = () => {
        if (!suggestedBudget) return

        const totalMonthly = suggestedBudget.totalMonthlyAverage
        const newAllocations = suggestedBudget.categoryAllocations
            .filter((allocation: any) => allocation.monthlyAverage > 0)
            .map((allocation: any) => ({
                categoryId: allocation.categoryId,
                amount: allocation.monthlyAverage,
                notes: "Based on historical data",
            }))

        form.setValue("totalAmount", Math.ceil(totalMonthly))
        form.setValue("allocations", newAllocations)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Budget</DialogTitle>
                    <DialogDescription>Set up a budget to track and manage your business expenses</DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="manual">Manual Setup</TabsTrigger>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                        <TabsTrigger value="suggested">AI Suggested</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual">
                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Budget Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Q2 2025 Budget" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="totalAmount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Total Budget (KES)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="0.00" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Start Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                            >
                                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>End Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                            >
                                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                    </PopoverContent>
                                                </Popover>
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
                                            <FormLabel>Description (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Add notes about this budget..." className="resize-none" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium">Category Allocations</h3>
                                        <div className="text-sm">
                                            <span className={allocationDifference !== 0 ? "text-red-500" : "text-green-500"}>
                                                {allocationDifference === 0
                                                    ? "Allocations match budget"
                                                    : `${allocationDifference > 0 ? "Unallocated" : "Over-allocated"}: KES ${Math.abs(allocationDifference).toLocaleString()}`}
                                            </span>
                                        </div>
                                    </div>

                                    {allocations.map((_, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 items-start">
                                            <FormField
                                                control={form.control}
                                                name={`allocations.${index}.categoryId`}
                                                render={({ field }) => (
                                                    <FormItem className="col-span-5">
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select category" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {categories.map((category) => (
                                                                    <SelectItem key={category.id} value={category.id}>
                                                                        {category.name}
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
                                                name={`allocations.${index}.amount`}
                                                render={({ field }) => (
                                                    <FormItem className="col-span-4">
                                                        <FormControl>
                                                            <Input type="number" placeholder="Amount" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`allocations.${index}.notes`}
                                                render={({ field }) => (
                                                    <FormItem className="col-span-2">
                                                        <FormControl>
                                                            <Input placeholder="Notes" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeAllocation(index)}
                                                className="col-span-1"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    <Button type="button" variant="outline" size="sm" onClick={addAllocation} className="mt-2">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Category
                                    </Button>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-green-700 hover:bg-green-800 text-white" disabled={isLoading}>
                                        {isLoading ? "Creating..." : "Create Budget"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </FormProvider>
                    </TabsContent>

                    <TabsContent value="templates">
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Choose a template to quickly set up your budget allocations. You'll still need to set the total budget
                                amount.
                            </p>

                            <FormField
                                control={form.control}
                                name="totalAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Budget Amount (KES)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 gap-4">
                                {templates.map((template, index) => (
                                    <Card key={index}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">{template.name}</CardTitle>
                                            <CardDescription>{template.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {template.allocations.map((allocation: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center text-sm">
                                                        <span>{allocation.categoryName}</span>
                                                        <span>{allocation.percentage}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button
                                                onClick={() => applyTemplate(template)}
                                                className="w-full mt-4 bg-green-700 hover:bg-green-800 text-white"
                                            >
                                                <Copy className="mr-2 h-4 w-4" />
                                                Use This Template
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <DialogFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab("manual")
                                    }}
                                    className="bg-green-700 hover:bg-green-800 text-white"
                                >
                                    Continue to Manual Setup
                                </Button>
                            </DialogFooter>
                        </div>
                    </TabsContent>

                    <TabsContent value="suggested">
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Our AI has analyzed your past expenses and created a suggested budget based on your spending patterns.
                            </p>

                            {suggestedBudget ? (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Suggested Monthly Budget</CardTitle>
                                        <CardDescription>
                                            Based on your spending from the past {suggestedBudget.basedOn.months} months
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4">
                                            <div className="text-lg font-bold">
                                                KES {suggestedBudget.totalMonthlyAverage.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Suggested monthly budget</div>
                                        </div>

                                        <div className="space-y-2">
                                            {suggestedBudget.categoryAllocations
                                                .filter((allocation: any) => allocation.monthlyAverage > 0)
                                                .sort((a: any, b: any) => b.monthlyAverage - a.monthlyAverage)
                                                .map((allocation: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center text-sm">
                                                        <span>{allocation.categoryName}</span>
                                                        <div className="text-right">
                                                            <div>KES {allocation.monthlyAverage.toLocaleString()}</div>
                                                            <div className="text-xs text-muted-foreground">{allocation.percentage.toFixed(1)}%</div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        <Button
                                            onClick={applySuggestedBudget}
                                            className="w-full mt-4 bg-green-700 hover:bg-green-800 text-white"
                                        >
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Apply Suggested Budget
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="flex items-center justify-center p-8 border rounded-md">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-4"></div>
                                        <p>Analyzing your expense history...</p>
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab("manual")
                                    }}
                                    className="bg-green-700 hover:bg-green-800 text-white"
                                >
                                    Continue to Manual Setup
                                </Button>
                            </DialogFooter>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
