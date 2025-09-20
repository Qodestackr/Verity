"use client"

import { useState } from "react"
import { Calendar, CreditCard, Download, Settings, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    useCurrentSubscription,
    usePaymentMethods,
    useInvoices,
    useCancelSubscription,
} from "@/hooks/use-subscription-queries"
import { PaymentMethodForm } from "./payment-method-form"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

export function CurrentSubscription() {

    const [showPaymentForm, setShowPaymentForm] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)

    const { data: subscriptionData, isLoading: subscriptionLoading } = useCurrentSubscription()
    const { data: paymentMethods, isLoading: paymentMethodsLoading } = usePaymentMethods()
    const { data: invoicesData, isLoading: invoicesLoading } = useInvoices(5, 0)
    const cancelSubscription = useCancelSubscription()

    const organizationSlug = useOrganizationSlug()

    const subscription = subscriptionData?.subscription
    const billingContact = subscriptionData?.billingContact
    const defaultPaymentMethod = paymentMethods?.find((pm) => pm.isDefault)

    console.log(subscriptionData, billingContact, paymentMethods, invoicesData)

    const handleCancelSubscription = async () => {
        if (!subscription) return

        try {
            await cancelSubscription.mutateAsync(subscription.id)
            setShowCancelDialog(false)
        } catch (error) {
            // Error is handled by the mutation
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return "bg-emerald-100 text-emerald-800 border-emerald-200"
            case "TRIALING":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "PAST_DUE":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "CANCELED":
                return "bg-red-100 text-red-800 border-red-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    if (subscriptionLoading) {
        return (
            <div className="space-y-6">
                <div className="h-48 bg-muted/50 rounded-lg animate-pulse" />
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
                    <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
                </div>
            </div>
        )
    }

    if (!subscription) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                    <p className="text-muted-foreground text-center mb-4">
                        You don't have an active subscription. Choose a plan to get started.
                    </p>
                    <Link href={`/dashboard/${organizationSlug}/account-plan`}>
                        <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">View Plans</Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-normal">Current Plan</CardTitle>
                            <CardDescription>Your subscription details and billing information</CardDescription>
                        </div>
                        <Badge className={getStatusColor(subscription.status)}>
                            {subscription.status === "TRIALING" ? "Free Trial" : subscription.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <h3 className="font-medium text-lg">{subscription.plan.name}</h3>
                            <p className="text-sm text-muted-foreground">{subscription.plan.description}</p>
                            <div className="mt-2">
                                <span className="text-2xl font-normal">
                                    {subscription.plan.currency} {subscription.plan.price.toLocaleString()}
                                </span>
                                <span className="text-muted-foreground ml-1">/{subscription.plan.interval.toLowerCase()}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Current period</span>
                                <span className="font-medium">
                                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                                </span>
                            </div>

                            {subscription.trialEndDate && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Trial ends</span>
                                    <span className="font-medium text-blue-600">{formatDate(subscription.trialEndDate)}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Next billing</span>
                                <span className="font-medium">{formatDate(subscription.nextBillingDate)}</span>
                            </div>

                            {subscription.cancelAtPeriodEnd && (
                                <div className="flex items-center gap-2 text-sm text-yellow-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Cancels at period end</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div className="flex gap-3">
                        <Link className="cursor-pointer" href={`/dashboard/${organizationSlug}/account-plan`}>
                            <Button variant="outline" size="sm">
                                <Settings className="mr-2 h-4 w-4" />
                                Change Plan
                            </Button>
                        </Link>

                        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    Cancel Subscription
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Cancel Subscription</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to cancel your subscription? You'll lose access to all premium features.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                                        Keep Subscription
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleCancelSubscription}
                                        disabled={cancelSubscription.isPending}
                                    >
                                        {cancelSubscription.isPending ? "Canceling..." : "Cancel Subscription"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-normal">Payment Method</CardTitle>
                        <CardDescription>Manage your payment details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {defaultPaymentMethod ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-muted/50 p-3 rounded-md">
                                        {defaultPaymentMethod.type === "MPESA" ? (
                                            <div className="h-5 w-5 bg-green-600 rounded" />
                                        ) : (
                                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {defaultPaymentMethod.type === "MPESA"
                                                ? `M-Pesa ${defaultPaymentMethod.phoneNumber}`
                                                : defaultPaymentMethod.type === "CARD"
                                                    ? `•••• •••• •••• ${defaultPaymentMethod.lastFour}`
                                                    : defaultPaymentMethod.accountName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{defaultPaymentMethod.provider} • Default</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">
                                    Update Payment Method
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-muted/50 p-3 rounded-md">
                                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground">No payment method added</p>
                                    </div>
                                </div>

                                <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                        >
                                            Add Payment Method
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <PaymentMethodForm onSuccess={() => setShowPaymentForm(false)} />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-normal">Billing Information</CardTitle>
                        <CardDescription>Your billing contact details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="grid gap-1">
                                <span className="text-sm text-muted-foreground">Email</span>
                                <span className="text-sm">{billingContact?.email || "Not provided"}</span>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-sm text-muted-foreground">Business Name</span>
                                <span className="text-sm">{billingContact?.name || "Not provided"}</span>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-sm text-muted-foreground">Address</span>
                                <span className="text-sm">
                                    {billingContact?.address ? `${billingContact.address}, ${billingContact.city || ""}` : "Not provided"}
                                </span>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-4">
                            Update Information
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-normal">Recent Invoices</CardTitle>
                    <CardDescription>View and download your recent invoices</CardDescription>
                </CardHeader>
                <CardContent>
                    {invoicesLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-muted/50 rounded-md animate-pulse" />
                            ))}
                        </div>
                    ) : invoicesData?.invoices.length ? (
                        <div className="space-y-3">
                            {invoicesData.invoices.map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-md">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm font-medium">Invoice #{invoice.number}</p>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${invoice.status === "PAID"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                    }`}
                                            >
                                                {invoice.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{formatDate(invoice.dueDate)}</p>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <div>
                                            <p className="text-sm font-medium">KES {invoice.amount.toLocaleString()}</p>
                                            {invoice.status === "PAID" && invoice.paidAt && (
                                                <p className="text-xs text-muted-foreground">Paid {formatDate(invoice.paidAt)}</p>
                                            )}
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No invoices yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
