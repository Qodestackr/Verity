"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CreditCard, Building2, Phone, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useAddPaymentMethod } from "@/hooks/use-subscription-queries"

const paymentMethodSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("MPESA"),
        provider: z.literal("MPESA"),
        phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
        isDefault: z.boolean().optional(),
    }),
    z.object({
        type: z.literal("CARD"),
        provider: z.enum(["STRIPE", "PAYSTACK"]),
        lastFour: z.string().length(4, "Last four digits required"),
        expiryMonth: z.number().min(1).max(12),
        expiryYear: z.number().min(new Date().getFullYear()),
        cardBrand: z.string().optional(),
        isDefault: z.boolean().optional(),
    }),
    z.object({
        type: z.literal("BANK_ACCOUNT"),
        provider: z.enum(["COOP_BANK", "OTHER"]),
        accountName: z.string().min(2, "Account name required"),
        accountNumber: z.string().min(8, "Account number required"),
        isDefault: z.boolean().optional(),
    }),
])

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>

interface PaymentMethodFormProps {
    onSuccess?: () => void
    defaultType?: "MPESA" | "CARD" | "BANK_ACCOUNT"
}

export function PaymentMethodForm({
    onSuccess, defaultType = "MPESA" }: PaymentMethodFormProps) {
    const [selectedType, setSelectedType] = useState<"MPESA" | "CARD" | "BANK_ACCOUNT">(defaultType)
    const addPaymentMethod = useAddPaymentMethod()

    const form = useForm<PaymentMethodFormData>({
        resolver: zodResolver(paymentMethodSchema),
        defaultValues: {
            type: defaultType,
            provider: defaultType === "MPESA" ? "MPESA" : defaultType === "CARD" ? "STRIPE" : "COOP_BANK",
            isDefault: false,
        },
    })

    const onSubmit = async (data: PaymentMethodFormData) => {
        try {
            await addPaymentMethod.mutateAsync(data)
            onSuccess?.()
        } catch (error) {
            // Error is handled by the mutation
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-lg font-normal">Add Payment Method</CardTitle>
                <CardDescription>Choose your preferred payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Payment Type</Label>
                    <RadioGroup
                        value={selectedType}
                        onValueChange={(value) => {
                            setSelectedType(value as typeof selectedType)
                            form.setValue("type", value as any)
                            if (value === "MPESA") {
                                form.setValue("provider", "MPESA")
                            } else if (value === "CARD") {
                                form.setValue("provider", "STRIPE")
                            } else {
                                form.setValue("provider", "COOP_BANK")
                            }
                        }}
                        className="grid grid-cols-3 gap-3"
                    >
                        <div>
                            <RadioGroupItem value="MPESA" id="mpesa" className="peer sr-only" />
                            <Label
                                htmlFor="mpesa"
                                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-600 [&:has([data-state=checked])]:border-emerald-600 cursor-pointer"
                            >
                                <Phone className="mb-2 h-5 w-5 text-emerald-600" />
                                <span className="text-xs">M-Pesa</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="CARD" id="card" className="peer sr-only" />
                            <Label
                                htmlFor="card"
                                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-600 [&:has([data-state=checked])]:border-emerald-600 cursor-pointer"
                            >
                                <CreditCard className="mb-2 h-5 w-5 text-emerald-600" />
                                <span className="text-xs">Card</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="BANK_ACCOUNT" id="bank" className="peer sr-only" />
                            <Label
                                htmlFor="bank"
                                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-600 [&:has([data-state=checked])]:border-emerald-600 cursor-pointer"
                            >
                                <Building2 className="mb-2 h-5 w-5 text-emerald-600" />
                                <span className="text-xs">Bank</span>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {selectedType === "MPESA" && (
                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Phone Number</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-2">
                                                <div className="w-16">
                                                    <Input value="+254" disabled className="h-9 bg-muted/50 text-sm" />
                                                </div>
                                                <Input {...field} placeholder="712 345 678" className="h-9 text-sm" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {selectedType === "CARD" && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="lastFour"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Last Four Digits</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="1234" maxLength={4} className="h-9 text-sm" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="expiryMonth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm">Expiry Month</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        placeholder="12"
                                                        min={1}
                                                        max={12}
                                                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                                                        className="h-9 text-sm"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="expiryYear"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm">Expiry Year</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        placeholder="2025"
                                                        min={new Date().getFullYear()}
                                                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                                                        className="h-9 text-sm"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </>
                        )}

                        {selectedType === "BANK_ACCOUNT" && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="accountName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Account Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="John Doe" className="h-9 text-sm" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="accountNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Account Number</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="01234567890" className="h-9 text-sm" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                            disabled={addPaymentMethod.isPending}
                        >
                            {addPaymentMethod.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                "Add Payment Method"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
