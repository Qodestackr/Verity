"use client"

import { useState } from "react"
import { CheckCircle2, ArrowRight, Loader2, Crown, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useSubscriptionPlans, useCreateSubscription } from "@/hooks/use-subscription-queries"
import { PaymentMethodForm } from "./payment-method-form"

interface SubscriptionPlansProps {
    businessType?: "RETAILER" | "WHOLESALER" | "DISTRIBUTOR" | "BRAND_OWNER"
    onSubscriptionCreated?: () => void
}

export function SubscriptionPlans({
    businessType = "RETAILER", onSubscriptionCreated }: SubscriptionPlansProps) {
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
    const [showPaymentDialog, setShowPaymentDialog] = useState(false)
    const [showPaymentForm, setShowPaymentForm] = useState(false)

    const { data, isLoading, error } = useSubscriptionPlans()
    const createSubscription = useCreateSubscription()

    // Debug logging
    console.log("🎯 SubscriptionPlans Debug:", {
        isLoading,
        error: error?.message,
        data,
        plansCount: data?.plans?.length,
        businessType,
    })

    const handlePlanSelect = (planId: string) => {
        setSelectedPlanId(planId)
        setShowPaymentDialog(true)
    }

    const handleSubscriptionCreate = async (paymentMethodId?: string) => {
        if (!selectedPlanId) return

        try {
            await createSubscription.mutateAsync({
                planId: selectedPlanId,
                paymentMethodId,
            })
            setShowPaymentDialog(false)
            setShowPaymentForm(false)
            onSubscriptionCreated?.()
        } catch (error) {
            console.error("❌ Subscription creation failed:", error)
        }
    }

    const selectedPlan = data?.plans.find((plan) => plan.id === selectedPlanId)
    const isFree = selectedPlan?.price === 0

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm text-muted-foreground">Loading subscription plans...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
                <div className="text-center space-y-4 max-w-md">
                    <p className="text-red-600">Failed to load subscription plans</p>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                    <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    const plans = data?.plans || []
    const currentSubscription = data?.currentSubscription

    // Show debug info if no plans
    if (plans.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
                <div className="max-w-2xl w-full">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="font-medium text-yellow-800 mb-2 text-center">No Subscription Plans Found</h3>
                        <p className="text-sm text-yellow-700 mb-4 text-center">
                            It looks like there are no subscription plans configured for your business type ({businessType}).
                        </p>
                        {/* <div className="text-xs text-left bg-yellow-100 p-3 rounded font-mono">
                            <p>
                                <strong>Debug Info:</strong>
                            </p>
                            <p>• API Response: {JSON.stringify(data, null, 2)}</p>
                            <p>• Business Type: {businessType}</p>
                            <p>• Plans Array Length: {plans.length}</p>
                        </div> */}
                        <div className="flex justify-center mt-4">
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                                className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            >
                                Refresh Plans
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-8 px-4">
            <div className="text-center mb-2 max-w-2xl mx-auto">
                <h2 className="text-3xl font-normal tracking-tight mb-3">Choose Your Plan</h2>
                <p className="text-muted-foreground text-lg mb-4">
                    Select the plan that best fits your business needs
                </p>
                {currentSubscription && (
                    <Badge variant="outline" className="text-sm px-3 py-1">
                        Current: {currentSubscription.plan.name} ({currentSubscription.status})
                    </Badge>
                )}
            </div>

            <div className="w-full max-w-4xl mx-auto">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 place-items-center">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            onSelect={() => handlePlanSelect(plan.id)}
                            isCurrentPlan={currentSubscription?.planId === plan.id}
                            popular={plan.tier === "PREMIUM"}
                        />
                    ))}
                </div>
            </div>
            <div className="mt-1 text-center">
                <p className="text-sm text-muted-foreground">
                    Need help choosing? Contact our support team for personalized recommendations.
                </p>
            </div>

            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-normal">Complete Your Subscription</DialogTitle>
                        <DialogDescription className="text-sm">
                            {isFree ? "You will start a free trial" : "Set up your payment method to activate your plan."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {selectedPlan && (
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium">{selectedPlan.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedPlan.interval.toLowerCase()}ly subscription
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-lg">
                                            {selectedPlan.currency} {selectedPlan.price.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">per {selectedPlan.interval.toLowerCase()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isFree && !showPaymentForm && (
                            <div className="text-center">
                                <Button
                                    onClick={() => setShowPaymentForm(true)}
                                    className="bg-emerald-700 hover:bg-emerald-800 text-white"
                                >
                                    Add Payment Method
                                </Button>
                            </div>
                        )}

                        {showPaymentForm && (
                            <PaymentMethodForm
                                onSuccess={() => {
                                    setShowPaymentForm(false)
                                    // For now, create subscription without payment method
                                    // In production, you'd get the payment method ID
                                    handleSubscriptionCreate()
                                }}
                            />
                        )}

                        {selectedPlan?.trialPeriodDays && (
                            <div className="text-xs text-center p-3 bg-emerald-50 rounded-lg">
                                <p className="text-emerald-700">
                                    🎉 Your subscription will begin with a {selectedPlan.trialPeriodDays}-day free trial.
                                    {!isFree && " You won't be charged until the trial ends."}
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex flex-col md:flex-row justify-between items-center">
                        {isFree && (
                            <Button
                                className="w-full md:w-auto md:ml-auto bg-emerald-700 hover:bg-emerald-800 text-white"
                                onClick={() => handleSubscriptionCreate()}
                                disabled={createSubscription.isPending}
                            >
                                {createSubscription.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        Start Free Trial
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function PlanCard({
    plan,
    onSelect,
    isCurrentPlan = false,
    popular = false,
}: {
    plan: any
    onSelect: () => void
    isCurrentPlan?: boolean
    popular?: boolean
}) {
    const features = Array.isArray(plan.features) ? plan.features : []

    return (
        <Card
            className={`
                flex flex-col justify-center items-center w-full max-w-sm mx-auto h-full
                ${popular ? "border-emerald-600 shadow-lg ring-1 ring-emerald-600/20" : "border-gray-200"} 
                ${isCurrentPlan ? "ring-2 ring-emerald-600 bg-emerald-50/30" : ""}
                transition-all duration-200 hover:shadow-md
            `}
        >
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col gap-1">
                        {popular && (
                            <Badge className="text-xs h-6 border-none bg-emerald-700 text-white w-fit">
                                <Crown className="mr-1 h-3 w-3" />
                                Most Popular
                            </Badge>
                        )}
                        {isCurrentPlan && (
                            <Badge variant="outline" className="text-xs h-6 border-emerald-600 text-emerald-700 w-fit">
                                Current Plan
                            </Badge>
                        )}
                    </div>
                    {plan.tier === "PREMIUM" && <Zap className="h-5 w-5 text-emerald-600" />}
                </div>

                <CardTitle className="text-2xl font-medium">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold">
                        {plan.currency} {plan.price.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-lg">/{plan.interval.toLowerCase()}</span>
                </div>
                <CardDescription className="text-sm text-gray-600">{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 pt-0">
                <div className="space-y-3">
                    {features.map((feature: string, i: number) => (
                        <div key={i} className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm leading-relaxed">{feature}</span>
                        </div>
                    ))}

                    {plan.trialPeriodDays && (
                        <>
                            <Separator className="my-4" />
                            <div className="flex items-start bg-emerald-50 p-3 rounded-lg">
                                <Zap className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-sm font-medium text-emerald-700">
                                    {plan.trialPeriodDays}-day free trial included
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-4">
                <Button
                    className={`
                        w-full h-11 text-sm font-medium
                        ${popular || isCurrentPlan
                            ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-md"
                            : "border-2 border-gray-300 hover:border-emerald-600 hover:text-emerald-700"
                        }
                        transition-all duration-200
                    `}
                    variant={popular || isCurrentPlan ? "default" : "outline"}
                    onClick={onSelect}
                    disabled={isCurrentPlan}
                >
                    {isCurrentPlan ? (
                        "✓ Current Plan"
                    ) : plan.price === 0 ? (
                        <>
                            Start Free Trial
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    ) : (
                        <>
                            Select Plan
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}