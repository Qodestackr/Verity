"use client"
import { format } from "date-fns"
import { CalendarIcon, Receipt } from "lucide-react"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { ExpenseCategory } from "@/types/accounting"
import { useCreateExpense } from "@/hooks/use-expenses"
import { client } from "@/lib/auth-client"

const formSchema = z.object({
    expenseDate: z.date({
        required_error: "Please select a date",
    }),
    amount: z.coerce
        .number({
            required_error: "Please enter an amount",
            invalid_type_error: "Please enter a valid number",
        })
        .positive("Amount must be positive"),
    categoryId: z.string({
        required_error: "Please select a category",
    }),
    description: z.string().min(3, "Description must be at least 3 characters"),
    paymentMethod: z.enum(["CASH", "CREDIT", "MPESA", "OTHER_MOBILE_MONEY", "CARD", "BANK"], {
        required_error: "Please select a payment method",
    }),
    taxDeductible: z.boolean().default(false),
    taxAmount: z.coerce.number().optional(),
    notes: z.string().optional(),
})

interface ExpenseDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    categories: ExpenseCategory[]
}

export function ExpenseDialog({
    open, onOpenChange, categories }: ExpenseDialogProps) {
    const createExpense = useCreateExpense()
    const { data: activeOrganization, isPending, isRefetching } = client.useActiveOrganization()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            expenseDate: new Date(),
            amount: undefined,
            categoryId: undefined,
            description: "",
            paymentMethod: undefined,
            taxDeductible: false,
            taxAmount: undefined,
            notes: "",
        },
    })

    if (isPending) {
        console.log('Org Pending...Skeletons')
    }

    async function handleSubmit(values: z.infer<typeof formSchema>) {
        try {
            await createExpense.mutateAsync({
                organizationId: `${activeOrganization?.id}`,
                categoryId: values.categoryId,
                amount: values.amount,
                description: values.description,
                paymentMethod: values.paymentMethod,
                expenseDate: values.expenseDate.toISOString(),
                taxDeductible: values.taxDeductible,
                taxAmount: values.taxAmount,
                notes: values.notes,
            })

            form.reset()
            onOpenChange(false)
        } catch (error) {
            // Error is handled by the mutation
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                    <DialogDescription>Record a new business expense for your organization.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="expenseDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date</FormLabel>
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
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount (KES)</FormLabel>
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
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Method</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CASH">Cash</SelectItem>
                                                <SelectItem value="BANK">Bank Transfer</SelectItem>
                                                <SelectItem value="MPESA">M-Pesa</SelectItem>
                                                <SelectItem value="OTHER_MOBILE_MONEY">Mobile Money</SelectItem>
                                                <SelectItem value="CARD">Credit Card</SelectItem>
                                                <SelectItem value="CREDIT">Credit</SelectItem>
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
                                        <Textarea placeholder="e.g., Office supplies for Q1" className="resize-none" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Additional notes..." className="resize-none" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={createExpense.isPending}>
                                {createExpense.isPending ? (
                                    <>
                                        <Receipt className="mr-2 h-4 w-4 animate-pulse" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Receipt className="mr-2 h-4 w-4" />
                                        Save Expense
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
