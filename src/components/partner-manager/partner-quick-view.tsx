"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
    Users,
    Phone,
    MapPin,
    Mail,
    ShoppingCart,
    Calendar,
    CreditCard,
    DollarSign,
    ShoppingBag,
    Building,
    Globe,
    TrendingUp,
    Package,
    History,
    Eye,
    CheckCircle,
} from "lucide-react"

interface PartnerQuickViewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    partner: any
    formatCurrency: (amount: number) => string
    onToggleBNPL: (partnerId: string) => void
    onTogglePriceVisibility: (partnerId: string) => void
}

export function PartnerQuickView({
    open,
    onOpenChange,
    partner,
    formatCurrency,
    onToggleBNPL,
    onTogglePriceVisibility,
}: PartnerQuickViewProps) {
    const [activeTab, setActiveTab] = useState("overview")

    if (!partner) return null

    // Get tier badge
    const getTierBadge = (tier: string) => {
        switch (tier) {
            case "Platinum":
                return (
                    <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-200 font-medium">
                        <span className="mr-1">●</span> Platinum
                    </Badge>
                )
            case "Gold":
                return (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-200 font-medium">
                        <span className="mr-1">●</span> Gold
                    </Badge>
                )
            case "Silver":
                return (
                    <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-200 font-medium">
                        <span className="mr-1">●</span> Silver
                    </Badge>
                )
            default:
                return <Badge variant="outline">{tier}</Badge>
        }
    }

    // Get status badge
    const getStatusBadge = (status: string) => {
        return status === "Active" ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-200">
                <span className="mr-1 text-green-500">●</span> Active
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-red-500/10 h-5 text-xs font-normal text-red-500 border-red-200">
                <span className="mr-1 text-red-500">●</span> Inactive
            </Badge>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-2 bg-gradient-to-r from-teal-50 to-white border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <DialogTitle className="text-lg font-light flex items-center gap-2">
                                {partner.name}
                                {partner.paymentStatus === "Overdue" && (
                                    <Badge className="h-5 text-xs font-normal" variant="destructive">
                                        Overdue Payment
                                    </Badge>
                                )}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-2 mt-1">
                                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                                {partner.type}
                                <span className="text-muted-foreground">•</span>
                                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                                {partner.region}
                                <span className="text-muted-foreground">•</span>
                                {getStatusBadge(partner.status)}
                            </DialogDescription>
                        </div>
                        <div className="flex flex-col items-end">
                            {getTierBadge(partner.tier)}
                            <span className="text-xs text-muted-foreground mt-1">ID: {partner.id}</span>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="border-b px-6 bg-muted/30">
                        <TabsList className="bg-transparent h-12 p-0">
                            <TabsTrigger
                                value="overview"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 h-12 px-4"
                            >
                                <div className="flex items-center">
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Overview
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="permissions"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 h-12 px-4"
                            >
                                <div className="flex items-center">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Permissions
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="orders"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 h-12 px-4"
                            >
                                <div className="flex items-center">
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Orders
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="max-h-[60vh]">
                        <TabsContent value="overview" className="p-6 pt-4 m-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Contact Information */}
                                <Card className="p-1">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center">
                                            <Users className="h-4 w-4 mr-2 text-teal-600" />
                                            Contact Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-1 pt-0">
                                        <div className="flex items-start gap-3 pb-2">
                                            <div className="bg-muted rounded-full p-1.5 mt-0.5">
                                                <Users className="h-4 w-4 text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{partner.contactPerson}</p>
                                                <p className="text-sm text-muted-foreground">Primary Contact</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 pb-2">
                                            <div className="bg-muted rounded-full p-1.5 mt-0.5">
                                                <Phone className="h-4 w-4 text-teal-600" />
                                            </div>
                                            <div>
                                                <p>{partner.phone}</p>
                                                <p className="text-sm text-muted-foreground">Phone</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 pb-2">
                                            <div className="bg-muted rounded-full p-1.5 mt-0.5">
                                                <Mail className="h-4 w-4 text-teal-600" />
                                            </div>
                                            <div>
                                                <p>{partner.email}</p>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="bg-muted rounded-full p-1.5 mt-0.5">
                                                <MapPin className="h-4 w-4 text-teal-600" />
                                            </div>
                                            <div>
                                                <p>{partner.address}</p>
                                                <p className="text-sm text-muted-foreground">Physical Address</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Account Information */}
                                <Card className="p-1">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center">
                                            <CreditCard className="h-4 w-4 mr-2 text-teal-600" />
                                            Account Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-1 pt-0">
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-muted/50 p-3 rounded-md">
                                                    <p className="text-xs text-muted-foreground">Credit Limit</p>
                                                    <p className="font-medium">{formatCurrency(partner.creditLimit)}</p>
                                                </div>
                                                <div className="bg-muted/50 p-3 rounded-md">
                                                    <p className="text-xs text-muted-foreground">Current Balance</p>
                                                    <p className="font-medium">{formatCurrency(partner.currentBalance)}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-muted/50 p-3 rounded-md">
                                                    <p className="text-xs text-muted-foreground">Available Credit</p>
                                                    <p className="font-medium">{formatCurrency(partner.availableCredit)}</p>
                                                </div>
                                                <div
                                                    className={`p-3 rounded-md ${partner.paymentStatus === "Overdue" ? "bg-red-50" : "bg-green-50"}`}
                                                >
                                                    <p className="text-xs text-muted-foreground">Payment Status</p>
                                                    <p
                                                        className={
                                                            partner.paymentStatus === "Overdue"
                                                                ? "text-red-500 font-medium"
                                                                : "text-green-500 font-medium"
                                                        }
                                                    >
                                                        {partner.paymentStatus}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Performance Overview */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center">
                                            <TrendingUp className="h-4 w-4 mr-2 text-teal-600" />
                                            Performance Overview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="grid grid-cols-2 gap-y-3">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total Spend</p>
                                                <p className="font-bold">{formatCurrency(partner.totalSpend)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total Orders</p>
                                                <p className="font-bold">{partner.totalOrders}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Last Order</p>
                                                <p>{partner.lastOrderDate ? partner.lastOrderDate : "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Last Order Amount</p>
                                                <p>{formatCurrency(partner.lastOrderAmount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Last Visit</p>
                                                <p>{partner.lastVisit}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Order Frequency</p>
                                                <p>{partner.orderFrequency}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Popular Products */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center">
                                            <Package className="h-4 w-4 mr-2 text-teal-600" />
                                            Popular Products
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        {partner.popularProducts && partner.popularProducts.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {partner.popularProducts.map((product: string) => (
                                                    <Badge
                                                        variant="secondary"
                                                        key={product}
                                                        className="bg-teal-50 text-teal-700 hover:bg-teal-100"
                                                    >
                                                        {product}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-4 border border-dashed rounded-md">
                                                <Package className="h-8 w-8 text-muted-foreground mb-2" />
                                                <p className="text-sm text-muted-foreground">No popular products yet</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="permissions" className="p-6 pt-4 m-0">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center">
                                            <CreditCard className="h-4 w-4 mr-2 text-teal-600" />
                                            Buy Now, Pay Later (BNPL)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">BNPL Status</p>
                                                <p className="text-sm text-muted-foreground">Allow this Partner to place orders on credit</p>
                                            </div>
                                            <Switch
                                                checked={partner.bnplEnabled}
                                                onCheckedChange={() => onToggleBNPL(partner.id)}
                                                className="data-[state=checked]:bg-teal-600"
                                            />
                                        </div>

                                        {partner.bnplEnabled && (
                                            <div className="mt-4 p-3 bg-teal-50 rounded-md border border-teal-100">
                                                <div className="flex items-start gap-2">
                                                    <div className="mt-0.5">
                                                        <CheckCircle className="h-5 w-5 text-teal-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-teal-700">BNPL Enabled</p>
                                                        <p className="text-sm text-teal-600">
                                                            This Partner can place orders up to {formatCurrency(partner.creditLimit)} on credit
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center">
                                            <Eye className="h-4 w-4 mr-2 text-teal-600" />
                                            Visibility Settings
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Price Visibility</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Allow this Parnet to see your product prices
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={partner.priceVisibility}
                                                    onCheckedChange={() => onTogglePriceVisibility(partner.id)}
                                                    className="data-[state=checked]:bg-teal-600"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Product Visibility</p>
                                                    <p className="text-sm text-muted-foreground">Allow this partner to see your products</p>
                                                </div>
                                                <Switch checked={partner.productVisibility} className="data-[state=checked]:bg-teal-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="orders" className="p-6 pt-4 m-0">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-medium flex items-center">
                                    <History className="h-4 w-4 mr-2 text-teal-600" />
                                    Order History
                                </h3>
                                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 h-8">
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Create Order
                                </Button>
                            </div>

                            {partner.totalOrders > 0 ? (
                                <div>
                                    <Card className="py-0 overflow-hidden">
                                        <div className="bg-muted/50 px-4 py-2 flex justify-between text-sm border-b">
                                            <span className="font-medium flex items-center">
                                                <ShoppingCart className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                                Order #{partner.id}-001
                                            </span>
                                            <span className="text-muted-foreground flex items-center">
                                                <Calendar className="h-3.5 w-3.5 mr-2" />
                                                {partner.lastOrderDate}
                                            </span>
                                        </div>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-muted-foreground flex items-center">
                                                    <Package className="h-3.5 w-3.5 mr-2" />3 products
                                                </span>
                                                <span className="text-sm font-medium flex items-center">
                                                    <DollarSign className="h-3.5 w-3.5 mr-1" />
                                                    {formatCurrency(partner.lastOrderAmount)}
                                                </span>
                                            </div>
                                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-200">
                                                <span className="mr-1 text-green-500">●</span> Delivered
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-md bg-muted/10">
                                    <ShoppingCart className="h-10 w-10 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">No orders yet for this partner</p>
                                    <Button size="sm" className="mt-4 bg-teal-600 hover:bg-teal-700">
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Create First Order
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                <DialogFooter className="p-4 border-t bg-gradient-to-r from-teal-50 to-white">
                    <div className="flex justify-between w-full">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                        <div className="flex gap-2">
                            <Button className="bg-teal-600 hover:bg-teal-700">
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Create Order
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
