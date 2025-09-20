import { toast } from "sonner"
import type { LoyaltyCustomer, NewCustomerPayload } from "@/types/loyalty"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAddLoyaltyCustomer } from "@/hooks/use-loyalty"

type AddCustomerDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCustomerAdded: (customer: LoyaltyCustomer) => void
    organizationId: string
}

export function AddCustomerDialog({
    open, onOpenChange, onCustomerAdded, organizationId }: AddCustomerDialogProps) {
    const [newCustomer, setNewCustomer] = useState({
        name: "",
        phone: "",
    })

    const { mutate: addCustomer, isPending } = useAddLoyaltyCustomer()

    const handleAddCustomer = () => {
        if (!newCustomer.name || !newCustomer.phone) {
            toast.error("Required fields missing", {
                description: "Name and phone number are required",
            })
            return
        }

        let formattedPhone = newCustomer.phone
        if (!formattedPhone.startsWith("+")) {
            if (formattedPhone.startsWith("0")) {
                formattedPhone = "+254" + formattedPhone.substring(1)
            } else if (!formattedPhone.startsWith("+254")) {
                formattedPhone = "+254" + formattedPhone
            }
        }

        addCustomer(
            {
                name: newCustomer.name,
                phone: formattedPhone,
                organizationId,
            },
            {
                onSuccess: (data) => {
                    toast.success("Customer added", {
                        description: `${newCustomer.name} has been added successfully`,
                    })

                    setNewCustomer({ name: "", phone: "" })
                    onOpenChange(false)

                    // Notify parent component about the new customer
                    //   if (data) {
                    //     onCustomerAdded(data.body)
                    //   }
                },
                onError: (error) => {
                    console.error("Error adding customer:", error)
                    toast.error("Failed to add customer", {
                        description: "There was an error adding the customer. Please try again.",
                    })
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-medium">Add New Customer</DialogTitle>
                </DialogHeader>

                <div className="py-2 space-y-3">
                    <div className="space-y-1">
                        <label htmlFor="name" className="text-xs font-medium">
                            Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                            id="name"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            placeholder="Customer name"
                            className="h-8"
                            disabled={isPending}
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="phone" className="text-xs font-medium">
                            Phone Number <span className="text-destructive">*</span>
                        </label>
                        <Input
                            id="phone"
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                            placeholder="07XX XXX XXX"
                            className="h-8"
                            disabled={isPending}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        className="h-7 text-xs"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="h-7 text-xs"
                        onClick={handleAddCustomer}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                Adding...
                            </>
                        ) : (
                            "Add Customer"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}