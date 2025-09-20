"use client"

import { useState } from "react"
import { User, Search, Phone, Plus } from "lucide-react"
import { useDraftOrderStore } from "@/stores/use-draft-order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const MOCK_CUSTOMERS = [
    {
        id: "c1",
        name: "John Doe",
        phone: "0712345678",
        email: "john@example.com",
        loyaltyPoints: 120,
        loyaltyTier: "Silver",
        lastVisit: "2 days ago",
    },
    {
        id: "c2",
        name: "Jane Smith",
        phone: "0723456789",
        email: "jane@example.com",
        loyaltyPoints: 350,
        loyaltyTier: "Gold",
        lastVisit: "Yesterday",
    },
    {
        id: "c3",
        name: "Mike Johnson",
        phone: "0734567890",
        email: "mike@example.com",
        loyaltyPoints: 50,
        loyaltyTier: "Bronze",
        lastVisit: "1 week ago",
    },
    {
        id: "c4",
        name: "Sarah Williams",
        phone: "0745678901",
        email: "sarah@example.com",
        loyaltyPoints: 500,
        loyaltyTier: "Platinum",
        lastVisit: "Today",
    },
]

export function CustomerSheet() {

    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const { activeDraftId, draftOrders, updateDraft } = useDraftOrderStore()

    // Get the active draft
    const activeDraft = draftOrders.find((draft) => draft.id === activeDraftId)

    // Filter customers based on search query
    const filteredCustomers = MOCK_CUSTOMERS.filter((customer) => {
        if (!searchQuery) return true

        const query = searchQuery.toLowerCase()
        return (
            customer.name.toLowerCase().includes(query) ||
            customer.phone.includes(query) ||
            customer.email.toLowerCase().includes(query)
        )
    })

    const handleSelectCustomer = async (customer: (typeof MOCK_CUSTOMERS)[0]) => {
        if (!activeDraftId) {
            toast.error("No active draft order")
            return
        }

        // Update the draft order with customer information
        const success = await updateDraft({
            customerEmail: customer.email,
            customerPhone: customer.phone,
            customerName: customer.name,
            note: `Customer: ${customer.name}, Phone: ${customer.phone}, Loyalty: ${customer.loyaltyTier} (${customer.loyaltyPoints} points)`,
        })

        if (success) {
            toast.success(`${customer.name} added to order`)
            setOpen(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                    <User className="h-4 w-4 mr-1.5" />
                    {activeDraft?.userEmail || "Add Customer"}
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Select Customer</SheetTitle>
                </SheetHeader>

                <div className="py-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search by name or phone..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        {filteredCustomers.map((customer) => (
                            <Card
                                key={customer.id}
                                className="cursor-pointer hover:border-primary transition-all"
                                onClick={() => handleSelectCustomer(customer)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1">
                                            <p className="font-medium">{customer.name}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-3 w-3" />
                                                <span>{customer.phone}</span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <Badge variant="outline">{customer.loyaltyTier}</Badge>
                                            <p className="text-xs mt-1">{customer.loyaltyPoints} points</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {filteredCustomers.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No customers found</p>
                                <Button variant="outline" className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add New Customer
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
