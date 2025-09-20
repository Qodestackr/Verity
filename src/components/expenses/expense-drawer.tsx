import { CalendarIcon, Receipt } from 'lucide-react'
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Textarea } from "@/components/ui/textarea"
import type { ExpenseCategory } from "@/types/accounting"
import { useCreateExpense } from "@/hooks/use-expenses"
import { client } from '@/lib/auth-client'

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

interface ExpenseDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    categories: ExpenseCategory[]
}

export function ExpenseDrawer({
    open, onOpenChange, categories }: ExpenseDrawerProps) {
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
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Add Expense</DrawerTitle>
                    <DrawerDescription>
                        Add a new expense to your accounting. Click save when you're done.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[240px] pl-3 text-left font-normal",
                                        !form.getValues().expenseDate && "text-muted-foreground"
                                    )}
                                >
                                    {form.getValues().expenseDate ? (
                                        format(form.getValues().expenseDate, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={form.getValues().expenseDate}
                                    onSelect={(date) => form.setValue("expenseDate", date!)}
                                    disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Amount
                        </Label>
                        <Input
                            id="amount"
                            placeholder="Amount"
                            className="col-span-3"
                            type="number"
                            {...form.register("amount")}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                            Category
                        </Label>
                        <Select onValueChange={form.setValue.bind(null, "categoryId")}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Description
                        </Label>
                        <Input
                            id="description"
                            placeholder="Description"
                            className="col-span-3"
                            {...form.register("description")}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="paymentMethod" className="text-right">
                            Payment Method
                        </Label>
                        <Select onValueChange={form.setValue.bind(null, "paymentMethod")}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a payment method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CASH">Cash</SelectItem>
                                <SelectItem value="BANK">Bank Transfer</SelectItem>
                                <SelectItem value="MPESA">M-Pesa</SelectItem>
                                <SelectItem value="OTHER_MOBILE_MONEY">Mobile Money</SelectItem>
                                <SelectItem value="CARD">Credit Card</SelectItem>
                                <SelectItem value="CREDIT">Credit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="taxDeductible" className="text-right">
                            Tax Deductible
                        </Label>
                        <Switch
                            id="taxDeductible"
                            className="col-span-3"
                            checked={form.getValues().taxDeductible}
                            onCheckedChange={(checked) => form.setValue("taxDeductible", checked)}
                        />
                    </div>
                    {form.getValues().taxDeductible && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="taxAmount" className="text-right">
                                Tax Amount
                            </Label>
                            <Input
                                id="taxAmount"
                                placeholder="Tax Amount"
                                className="col-span-3"
                                type="number"
                                {...form.register("taxAmount")}
                            />
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Notes"
                            className="col-span-3"
                            {...form.register("notes")}
                        />
                    </div>
                </div>
                <DrawerFooter>
                    <Button
                        onClick={() => form.handleSubmit(handleSubmit)()}
                        className="h-8 text-xs bg-green-700 hover:bg-green-800 text-white flex-1"
                        disabled={createExpense.isPending}
                    >
                        {createExpense.isPending ? (
                            <>
                                <Receipt className="mr-2 h-3 w-3 animate-pulse" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Receipt className="mr-2 h-3 w-3" />
                                Save Expense
                            </>
                        )}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}