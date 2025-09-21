"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "@/lib/zod";

const formSchema = z.object({
    date: z.date({
        required_error: "Please select a date",
    }),
    description: z.string().min(3, "Description must be at least 3 characters"),
    amount: z.coerce
        .number({
            required_error: "Please enter an amount",
            invalid_type_error: "Please enter a valid number",
        })
        .positive("Amount must be positive"),
    type: z.enum(["credit", "debit"], {
        required_error: "Please select a transaction type",
    }),
    category: z.string().optional(),
    reference: z.string().optional(),
})

interface BankTransactionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function BankTransactionDialog({
    open, onOpenChange }: BankTransactionDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date(),
            description: "",
            amount: undefined,
            type: undefined,
            category: undefined,
            reference: "",
        },
    })

    function handleSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)

        setTimeout(() => {
            console.log(values)
            form.reset()
            setIsSubmitting(false)
            onOpenChange(false)
        }, 500)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Bank Transaction</DialogTitle>
                    <DialogDescription>
                        Add a transaction that appears in your bank statement but is not in your accounting records.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
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
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="credit">Credit (Money In)</SelectItem>
                                                <SelectItem value="debit">Debit (Money Out)</SelectItem>
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
                                        <Input placeholder="Transaction description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
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

                            <FormField
                                control={form.control}
                                name="category"
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
                                                <SelectItem value="sales">Sales</SelectItem>
                                                <SelectItem value="rent">Rent</SelectItem>
                                                <SelectItem value="utilities">Utilities</SelectItem>
                                                <SelectItem value="transport">Transport</SelectItem>
                                                <SelectItem value="office_supplies">Office Supplies</SelectItem>
                                                <SelectItem value="marketing">Marketing</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>Categorize this transaction for reporting</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="reference"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reference Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Optional" {...field} />
                                    </FormControl>
                                    <FormDescription>Bank reference or transaction ID</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-green-700 hover:bg-green-800 text-white" disabled={isSubmitting}>
                                {isSubmitting ? "Adding..." : "Add Transaction"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
