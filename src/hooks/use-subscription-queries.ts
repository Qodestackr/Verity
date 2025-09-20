import { useCurrency } from "@/hooks/useCurrency";
import { APP_BASE_API_URL } from "@/config/urls"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface SubscriptionPlan {
    id: string
    name: string
    description: string | null
    price: number
    currency: string
    interval: "DAY" | "WEEK" | "MONTH" | "YEAR"
    intervalCount: number
    trialPeriodDays: number | null
    features: any
    businessType: "RETAILER" | "WHOLESALER" | "DISTRIBUTOR" | "BRAND_OWNER" | null
    tier: "FREE" | "STANDARD" | "PREMIUM" | "ENTERPRISE"
    isActive: boolean
}

interface Subscription {
    id: string
    organizationId: string
    planId: string
    status: "ACTIVE" | "PAST_DUE" | "UNPAID" | "CANCELED" | "TRIALING" | "INCOMPLETE" | "INCOMPLETE_EXPIRED"
    startDate: string
    endDate: string | null
    trialEndDate: string | null
    currentPeriodStart: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
    canceledAt: string | null
    nextBillingDate: string
    plan: SubscriptionPlan
    paymentMethod?: PaymentMethodDetails
    invoices?: Invoice[]
}

interface PaymentMethodDetails {
    id: string
    organizationId: string
    type: "CARD" | "BANK_ACCOUNT" | "BANK_TRANSFER" | "MPESA" | "OTHER"
    provider: "COOP_BANK" | "MPESA" | "STRIPE" | "PAYSTACK" | "OTHER"
    isDefault: boolean
    lastFour?: string
    phoneNumber?: string
    accountName?: string
}

interface BillingContact {
    id: string
    organizationId: string
    name: string | null
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    postalCode: string | null
    country: string | null
    taxId: string | null
}

interface Invoice {
    id: string
    number: string
    status: "DRAFT" | "OPEN" | "PAID" | "VOID" | "UNCOLLECTIBLE"
    amount: number
    amountDue: number
    dueDate: string
    paidAt: string | null
    description: string | null
    receiptUrl: string | null
}

export const useSubscriptionPlans = () => {
    return useQuery({
        queryKey: ["subscription-plans"],
        queryFn: async () => {
            console.log("🔍 Fetching subscription plans...")
            const response = await fetch(`${APP_BASE_API_URL}/subscriptions`)

            if (!response.ok) {
                console.error("❌ API Error:", response.status, response.statusText)
                throw new Error("Failed to fetch subscription plans")
            }

            const data = await response.json()
            console.log("✅ API Response:", data)

            // Log what we actually received
            console.log("📊 Plans count:", data.plans?.length || 0)
            console.log("🔄 Current subscription:", data.currentSubscription)

            return data as { plans: SubscriptionPlan[]; currentSubscription: Subscription | null }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
    })
}

export const useCurrentSubscription = () => {
    return useQuery({
        queryKey: ["current-subscription"],
        queryFn: async () => {
            const response = await fetch(`${APP_BASE_API_URL}/subscriptions/current`)
            if (!response.ok) {
                throw new Error("Failed to fetch current subscription")
            }
            const data = await response.json()
            return data as { subscription: Subscription | null; billingContact: BillingContact | null }
        },
    })
}

export const usePaymentMethods = () => {
    return useQuery({
        queryKey: ["payment-methods"],
        queryFn: async () => {
            const response = await fetch(`${APP_BASE_API_URL}/payment-methods`)
            if (!response.ok) {
                throw new Error("Failed to fetch payment methods")
            }
            return response.json() as Promise<PaymentMethodDetails[]>
        },
    })
}

export const useBillingContact = () => {
    return useQuery({
        queryKey: ["billing-contact"],
        queryFn: async () => {
            const response = await fetch(`${APP_BASE_API_URL}/billing/contact`)
            if (!response.ok) {
                throw new Error("Failed to fetch billing contact")
            }
            return response.json() as Promise<BillingContact>
        },
    })
}

export const useInvoices = (limit = 10, offset = 0, status?: string) => {
    return useQuery({
        queryKey: ["invoices", limit, offset, status],
        queryFn: async () => {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
                ...(status && { status }),
            })
            const response = await fetch(`${APP_BASE_API_URL}/invoices?${params}`)
            if (!response.ok) {
                throw new Error("Failed to fetch invoices")
            }
            return response.json() as Promise<{
                invoices: Invoice[]
                pagination: { total: number; limit: number; offset: number; hasMore: boolean }
            }>
        },
    })
}

export const useCreateSubscription = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ planId, paymentMethodId }: { planId: string; paymentMethodId?: string }) => {
            const response = await fetch(`${APP_BASE_API_URL}/subscriptions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ planId, paymentMethodId }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to create subscription")
            }

            return response.json() as Promise<Subscription>
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscription-plans"] })
            queryClient.invalidateQueries({ queryKey: ["current-subscription"] })
            toast.success("Subscription created successfully!")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create subscription")
        },
    })
}

export const useAddPaymentMethod = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (paymentMethodData: {
            type: "CARD" | "BANK_ACCOUNT" | "MPESA" | "OTHER"
            provider: "COOP_BANK" | "MPESA" | "STRIPE" | "PAYSTACK" | "OTHER"
            isDefault?: boolean
            phoneNumber?: string
            accountName?: string
            accountNumber?: string
            lastFour?: string
            expiryMonth?: number
            expiryYear?: number
            cardBrand?: string
        }) => {
            const response = await fetch(`${APP_BASE_API_URL}/payment-methods`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentMethodData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to add payment method")
            }

            return response.json() as Promise<PaymentMethodDetails>
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-methods"] })
            toast.success("Payment method added successfully!")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to add payment method")
        },
    })
}

export const useUpdateBillingContact = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (billingData: Partial<BillingContact>) => {
            const response = await fetch(`${APP_BASE_API_URL}/billing/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(billingData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to update billing contact")
            }

            return response.json() as Promise<BillingContact>
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["billing-contact"] })
            toast.success("Billing information updated successfully!")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update billing information")
        },
    })
}

export const useUpdateSubscription = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            subscriptionId,
            updates,
        }: {
            subscriptionId: string
            updates: {
                planId?: string
                paymentMethodId?: string
                cancelAtPeriodEnd?: boolean
            }
        }) => {
            const response = await fetch(`${APP_BASE_API_URL}/subscriptions/${subscriptionId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updates),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to update subscription")
            }

            return response.json() as Promise<Subscription>
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["current-subscription"] })
            queryClient.invalidateQueries({ queryKey: ["subscription-plans"] })
            toast.success("Subscription updated successfully!")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update subscription")
        },
    })
}

export const useCancelSubscription = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (subscriptionId: string) => {
            const response = await fetch(`${APP_BASE_API_URL}/subscriptions/${subscriptionId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to cancel subscription")
            }

            return response.json() as Promise<Subscription>
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["current-subscription"] })
            queryClient.invalidateQueries({ queryKey: ["subscription-plans"] })
            toast.success("Subscription canceled successfully!")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to cancel subscription")
        },
    })
}
