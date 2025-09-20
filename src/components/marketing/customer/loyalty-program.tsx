"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Award, BadgePercent, Loader2, Check } from "lucide-react"

import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLoyaltyCustomer, useRedeemPoints, useAddLoyaltyCustomer } from "@/hooks/use-loyalty"
import { calculateDiscountPoints } from "@/utils/loyalty"
import type { LoyaltyCustomer } from "@/types/loyalty"
import { LOYALTY_TIERS } from "@/config/loyalty"
import CustomerSearch from "./customer-search"
import { AddCustomerDialog } from "./add-customer-dialog"

const loyaltyTierStyles = {
    Bronze: {
        color: "bg-amber-600",
        textColor: "text-amber-600",
        borderColor: "border-amber-600",
    },
    Silver: {
        color: "bg-slate-400",
        textColor: "text-white",
        borderColor: "border-none",
    },
    Gold: {
        color: "bg-amber-400",
        textColor: "text-amber-600",
        borderColor: "border-amber-400",
    },
    Platinum: {
        color: "bg-emerald-400",
        textColor: "text-emerald-600",
        borderColor: "border-emerald-400",
    },
}

export default function POSCustomerLoyalty() {
    const isMobile = useIsMobile()
    const [searchPhone, setSearchPhone] = useState<string | null>(null)
    const { data: customerData, isLoading: isCustomerLoading } = useLoyaltyCustomer(`${searchPhone}`)
    const { mutate: redeemPoints, isPending: isRedeeming } = useRedeemPoints()

    const [selectedCustomer, setSelectedCustomer] = useState<LoyaltyCustomer | null>(null)
    const [recentCustomers, setRecentCustomers] = useState<LoyaltyCustomer[]>([])
    const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false)
    const [newCustomer, setNewCustomer] = useState({
        name: "",
        phone: "",
    })
    const [orderTotal, setOrderTotal] = useState(3000) // Example order total in KES
    const [discountApplied, setDiscountApplied] = useState(false)

    useEffect(() => {
        if (customerData && !selectedCustomer) {
            handleSelectCustomer(customerData)
        }
    }, [customerData, selectedCustomer])

    const handleSelectCustomer = (customer: LoyaltyCustomer) => {
        setSelectedCustomer(customer)
        setDiscountApplied(false)
        setSearchPhone(customer.phone)

        if (!recentCustomers.some((c) => c.id === customer.id)) {
            const updatedRecents = [customer, ...recentCustomers].slice(0, 5)
            setRecentCustomers(updatedRecents)
        }
    }

    const clearSelectedCustomer = () => {
        setSelectedCustomer(null)
        setSearchPhone(null)
        setDiscountApplied(false)
    }

    const handleAddCustomer = () => {
        if (!newCustomer.name || !newCustomer.phone) {
            toast.error("Required fields missing", {
                description: "Name and phone number are required",
            })
            return
        }

        if (recentCustomers.some((c) => c.phone === newCustomer.phone)) {
            toast.error("Customer already exists", {
                description: "A customer with this phone number already exists",
            })
            return
        }

        const customer: LoyaltyCustomer = {
            id: `cust_${Date.now()}`,
            name: newCustomer.name,
            phone: newCustomer.phone,
            email: null,
            loyaltyPoints: {
                pointsEarned: 5,
                pointsRedeemed: 0,
                balance: 5,
                history: [
                    {
                        id: `trans_${Date.now()}`,
                        amount: 5,
                        type: "BONUS",
                        description: "Welcome bonus",
                        redeemedFrom: "POS",
                        createdAt: new Date(),
                    },
                ],
            },
            loyaltyTier: "Bronze",
            lastVisit: new Date().toISOString(),
            totalSpent: 0,
            joinDate: new Date().toISOString(),
        }

        setRecentCustomers([customer, ...recentCustomers])

        setSelectedCustomer(customer)

        setNewCustomer({ name: "", phone: "" })
        setShowAddCustomerDialog(false)

        toast.success("Customer added", {
            description: `${customer.name} has been added successfully`,
        })
    }

    const getLoyaltyTierStyle = (tier: LoyaltyCustomer["loyaltyTier"]) => {
        return loyaltyTierStyles[tier]
    }

    const handleCustomerAdded = (newCustomer: LoyaltyCustomer) => {
        if (!recentCustomers.some((c) => c.id === newCustomer.id)) {
            const updatedRecents = [newCustomer, ...recentCustomers].slice(0, 5)
            setRecentCustomers(updatedRecents)
        }
        handleSelectCustomer(newCustomer)
    }

    const applyLoyaltyDiscount = () => {
        if (!selectedCustomer) return

        const pointsToRedeem = calculateDiscountPoints({
            customer: selectedCustomer,
            orderTotal: orderTotal,
            pointsPerKES: 1, // 1 point = 1 KES value
        })

        if (pointsToRedeem <= 0) {
            toast.error("Not enough points", {
                description: "Customer doesn't have enough points for a discount",
            })
            return
        }

        redeemPoints(
            {
                customerId: selectedCustomer.id,
                points: pointsToRedeem,
                description: "POS Discount Application",
            },
            {
                onSuccess: () => {
                    setDiscountApplied(true)
                    const tierDiscount = LOYALTY_TIERS[selectedCustomer.loyaltyTier].discount
                    toast.success("Sip Points discount applied", {
                        description: `${tierDiscount}% discount (${pointsToRedeem} points) applied to current order`,
                    })
                },
                onError: () =>
                    toast.error("Failed to apply discount", {
                        description: "There was an error processing the loyalty discount",
                    }),
            },
        )
    }

    return (
        <div className="bg-background">
            <div className="flex items-center flex-col flex-1 mb-2 overflow-hidden">
                <AnimatePresence mode="wait">
                    {selectedCustomer ? (
                        <motion.div
                            key="customer-minimal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-y"
                        >
                            <div className="p-2 flex items-center justify-between">
                                <div className="flex items-center flex-1 min-w-0">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 mr-1" onClick={clearSelectedCustomer}>
                                        <X className="h-3 w-3" />
                                    </Button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center flex-wrap gap-1">
                                            <h2 className="text-sm font-medium truncate">{selectedCustomer.name}</h2>
                                            <Badge
                                                className={`text-xs h-4 ${getLoyaltyTierStyle(selectedCustomer.loyaltyTier).textColor} ${getLoyaltyTierStyle(selectedCustomer.loyaltyTier).borderColor} border`}
                                            >
                                                {selectedCustomer.loyaltyTier}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">{selectedCustomer.phone}</span>
                                            <span className="text-xs text-muted-foreground flex items-center">
                                                <Award className="h-3 w-3 mr-1" />
                                                {selectedCustomer.loyaltyPoints.pointsEarned} pts
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white h-7 ml-2"
                                    onClick={applyLoyaltyDiscount}
                                    disabled={discountApplied || isRedeeming}
                                >
                                    {isRedeeming ? (
                                        <>
                                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                            <span className="whitespace-nowrap">Processing...</span>
                                        </>
                                    ) : discountApplied ? (
                                        <>
                                            <Check className="h-3 w-3 mr-1" />
                                            <span className="whitespace-nowrap">
                                                {LOYALTY_TIERS[selectedCustomer.loyaltyTier].discount}% Applied
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <BadgePercent className="h-3 w-3 mr-1" />
                                            <span className="whitespace-nowrap">
                                                Apply {LOYALTY_TIERS[selectedCustomer.loyaltyTier].discount}%
                                            </span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            <CustomerSearch
                                onSelectCustomer={handleSelectCustomer}
                                recentCustomers={recentCustomers}
                                onAddCustomer={() => setShowAddCustomerDialog(true)}
                            />
                        </>
                    )}
                </AnimatePresence>
            </div>

            <AddCustomerDialog
                open={showAddCustomerDialog}
                onOpenChange={setShowAddCustomerDialog}
                onCustomerAdded={handleCustomerAdded}
                organizationId={"o2ss8xaophSuEWgv6RC7ELwcAYfvw1JR"}
            />
        </div>
    )
}