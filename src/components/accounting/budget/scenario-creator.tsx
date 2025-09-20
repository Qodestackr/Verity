"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider, useFieldArray } from "react-hook-form"
import z from "@/lib/zod";
import { Plus, Minus, Sparkles, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { APP_BASE_API_URL } from "@/config/urls";

const scenarioFormSchema = z.object({
    name: z.string().min(3, "Scenario name must be at least 3 characters"),
    description: z.string().optional(),
    isBaseline: z.boolean().default(false),
    totalAmount: z.coerce
        .number({
            required_error: "Total amount is required",
            invalid_type_error: "Total amount must be a number",
        })
        .positive("Total amount must be positive"),
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
                changePercent: z.coerce.number().optional(),
                notes: z.string().optional(),
            }),
        )
        .min(1, "At least one category allocation is required"),
    assumptions: z
        .array(
            z.object({
                type: z.string(),
                name: z.string().min(1, "Assumption name is required"),
                description: z.string().min(1, "Description is required"),
                changeType: z.string(),
                changeValue: z.coerce.number(),
                appliedTo: z.string().optional(),
            }),
        )
        .optional(),
})

interface ScenarioCreatorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: z.infer<typeof scenarioFormSchema>) => void
    organizationId: string
    budgetId: string
    baselineScenario?: any
    editingScenario?: any
}

export function ScenarioCreator({

    open,
    onOpenChange,
    onSubmit,
    organizationId,
    budgetId,
    baselineScenario,
    editingScenario,
}: ScenarioCreatorProps) {
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("details")
    const isEditing = !!editingScenario

    const form = useForm<z.infer<typeof scenarioFormSchema>>({
        resolver: zodResolver(scenarioFormSchema),
        defaultValues: {
            name: editingScenario?.name || "",
            description: editingScenario?.description || "",
            isBaseline: editingScenario?.isBaseline || false,
            totalAmount: editingScenario?.totalAmount || baselineScenario?.totalAmount || 0,
            allocations: editingScenario?.allocations?.map((a: any) => ({
                categoryId: a.categoryId,
                amount: a.amount,
                changePercent: a.changePercent || 0,
                notes: a.notes || "",
            })) ||
                baselineScenario?.allocations?.map((a: any) => ({
                    categoryId: a.categoryId,
                    amount: a.amount,
                    changePercent: 0,
                    notes: "",
                })) || [{ categoryId: "", amount: 0, changePercent: 0, notes: "" }],
            assumptions:
                editingScenario?.assumptions?.map((a: any) => ({
                    type: a.type,
                    name: a.name,
                    description: a.description,
                    changeType: a.changeType,
                    changeValue: a.changeValue,
                    appliedTo: a.appliedTo || "",
                })) || [],
        },
    })

    const {
        fields: allocationFields,
        append: appendAllocation,
        remove: removeAllocation,
    } = useFieldArray({
        control: form.control,
        name: "allocations",
    })

    const {
        fields: assumptionFields,
        append: appendAssumption,
        remove: removeAssumption,
    } = useFieldArray({
        control: form.control,
        name: "assumptions",
    })

    // Calc total allocations
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

    const handleSubmit = (values: z.infer<typeof scenarioFormSchema>) => {
        const toastInfo = isEditing ? "Scenario updated" : "Scenario created";

        setIsLoading(true)
        try {
            onSubmit(values)
            toast.success(`${toastInfo}`, {
                description: `Your scenario "${values.name}" has been ${isEditing ? "updated" : "created"} successfully.`,
            })
        } catch (error) {
            console.error("Error submitting scenario:", error)
            toast.error("Error", {
                description: `Failed to ${isEditing ? "update" : "create"} scenario. Please try again.`,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const addAllocation = () => {
        appendAllocation({ categoryId: "", amount: 0, changePercent: 0, notes: "" })
    }

    const addAssumption = () => {
        appendAssumption({
            type: "expense",
            name: "",
            description: "",
            changeType: "percentage",
            changeValue: 0,
            appliedTo: "",
        })
    }

    const applyAssumptions = () => {
        const assumptions = form.getValues("assumptions") || []
        const currentAllocations = form.getValues("allocations")
        const newAllocations = [...currentAllocations]
        let newTotalAmount = form.getValues("totalAmount")

        // Apply each assumption
        assumptions.forEach((assumption) => {
            if (assumption.type === "expense") {
                if (assumption.appliedTo === "all") {
                    // Apply to all categories
                    newAllocations.forEach((allocation, index) => {
                        if (assumption.changeType === "percentage") {
                            const changeMultiplier = 1 + assumption.changeValue / 100
                            newAllocations[index].amount = allocation.amount * changeMultiplier
                            newAllocations[index].changePercent = assumption.changeValue
                        } else {
                            // Absolute change - distribute proportionally
                            const proportion = allocation.amount / totalAllocations
                            const absoluteChange = assumption.changeValue * proportion
                            newAllocations[index].amount = allocation.amount + absoluteChange
                        }
                    })
                } else if (assumption.appliedTo) {
                    // Apply to specific category
                    const index = newAllocations.findIndex((a) => a.categoryId === assumption.appliedTo)
                    if (index !== -1) {
                        if (assumption.changeType === "percentage") {
                            const changeMultiplier = 1 + assumption.changeValue / 100
                            newAllocations[index].amount = newAllocations[index].amount * changeMultiplier
                            newAllocations[index].changePercent = assumption.changeValue
                        } else {
                            newAllocations[index].amount = newAllocations[index].amount + assumption.changeValue
                        }
                    }
                }
            } else if (assumption.type === "revenue") {
                // Revenue assumptions don't directly affect allocations in this model
                // but could be used for impact calculations
            }
        })

        // Update total amount based on new allocations
        newTotalAmount = newAllocations.reduce((sum, allocation) => sum + allocation.amount, 0)

        // Update form values
        form.setValue("allocations", newAllocations)
        form.setValue("totalAmount", newTotalAmount)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Scenario" : "Create New Budget Scenario"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Modify your budget scenario to explore different financial outcomes."
                            : "Create a 'what-if' scenario to explore different budget assumptions and outcomes."}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="details">Basic Details</TabsTrigger>
                        <TabsTrigger value="allocations">Allocations</TabsTrigger>
                        <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
                    </TabsList>

                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <TabsContent value="details">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Scenario Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Cost Reduction Plan" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Describe the purpose and assumptions of this scenario..."
                                                            className="resize-none"
                                                            {...field}
                                                        />
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
                                                    <FormLabel>Total Budget Amount (KES)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0.00" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {!baselineScenario && (
                                            <FormField
                                                control={form.control}
                                                name="isBaseline"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>Set as Baseline Scenario</FormLabel>
                                                            <p className="text-sm text-muted-foreground">
                                                                The baseline scenario serves as the reference point for all comparisons.
                                                            </p>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                                disabled={isEditing && editingScenario?.isBaseline}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="allocations">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium">Category Allocations</h3>
                                        <div className="text-sm">
                                            <span className={allocationDifference !== 0 ? "text-red-500" : "text-green-500"}>
                                                {allocationDifference === 0
                                                    ? "Allocations match budget"
                                                    : `${allocationDifference > 0 ? "Unallocated" : "Over-allocated"}: KES ${Math.abs(
                                                        allocationDifference,
                                                    ).toLocaleString()}`}
                                            </span>
                                        </div>
                                    </div>

                                    {allocationFields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                                            <FormField
                                                control={form.control}
                                                name={`allocations.${index}.categoryId`}
                                                render={({ field }) => (
                                                    <FormItem className="col-span-4">
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
                                                    <FormItem className="col-span-3">
                                                        <FormControl>
                                                            <Input type="number" placeholder="Amount" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`allocations.${index}.changePercent`}
                                                render={({ field }) => (
                                                    <FormItem className="col-span-2">
                                                        <FormControl>
                                                            <div className="flex items-center">
                                                                <Input type="number" placeholder="% Change" {...field} disabled={!baselineScenario} />
                                                                <span className="ml-1">%</span>
                                                            </div>
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
                                                disabled={allocationFields.length <= 1}
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
                            </TabsContent>

                            <TabsContent value="assumptions">
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Add assumptions to model different financial scenarios. These can be applied to specific categories
                                        or across the entire budget.
                                    </p>

                                    {assumptionFields.length === 0 ? (
                                        <Card className="border-dashed">
                                            <CardContent className="pt-6 text-center">
                                                <p className="text-muted-foreground mb-4">No assumptions added yet</p>
                                                <Button type="button" variant="outline" onClick={addAssumption}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Your First Assumption
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <>
                                            {assumptionFields.map((field, index) => (
                                                <Card key={field.id}>
                                                    <CardHeader className="pb-2">
                                                        <div className="flex justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`assumptions.${index}.type`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                                <FormControl>
                                                                                    <SelectTrigger className="w-[120px]">
                                                                                        <SelectValue placeholder="Type" />
                                                                                    </SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent>
                                                                                    <SelectItem value="expense">Expense</SelectItem>
                                                                                    <SelectItem value="revenue">Revenue</SelectItem>
                                                                                    <SelectItem value="other">Other</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`assumptions.${index}.name`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <Input placeholder="Assumption name" className="w-[200px]" {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeAssumption(index)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`assumptions.${index}.description`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Description</FormLabel>
                                                                    <FormControl>
                                                                        <Textarea
                                                                            placeholder="Describe this assumption..."
                                                                            className="resize-none"
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormField
                                                                control={form.control}
                                                                name={`assumptions.${index}.changeType`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Change Type</FormLabel>
                                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                                            <FormControl>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Select type" />
                                                                                </SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent>
                                                                                <SelectItem value="percentage">Percentage</SelectItem>
                                                                                <SelectItem value="absolute">Absolute Amount</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <FormField
                                                                control={form.control}
                                                                name={`assumptions.${index}.changeValue`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Change Value</FormLabel>
                                                                        <FormControl>
                                                                            <div className="flex items-center">
                                                                                <Input type="number" {...field} />
                                                                                <span className="ml-2">
                                                                                    {form.watch(`assumptions.${index}.changeType`) === "percentage" ? "%" : "KES"}
                                                                                </span>
                                                                            </div>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>

                                                        <FormField
                                                            control={form.control}
                                                            name={`assumptions.${index}.appliedTo`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Apply To</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select where to apply" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="all">All Categories</SelectItem>
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
                                                    </CardContent>
                                                </Card>
                                            ))}

                                            <div className="flex justify-between">
                                                <Button type="button" variant="outline" size="sm" onClick={addAssumption}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Another Assumption
                                                </Button>

                                                <Button type="button" onClick={applyAssumptions} className="bg-green-700 hover:bg-green-800">
                                                    <Sparkles className="h-4 w-4 mr-2" />
                                                    Apply Assumptions
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </TabsContent>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-green-700 hover:bg-green-800 text-white" disabled={isLoading}>
                                    {isLoading ? (
                                        "Saving..."
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            {isEditing ? "Update Scenario" : "Save Scenario"}
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </FormProvider>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
