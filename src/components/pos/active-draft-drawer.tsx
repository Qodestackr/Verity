"use client"

import { useState } from "react"
import { ShoppingBag, Save, Receipt, Trash2, Plus, Minus } from "lucide-react"

import { useDraftOrderStore } from "@/stores/use-draft-order-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { getFormattedMoney } from "@/utils/money"

interface ActiveDraftDrawerProps {
    onCheckout: () => void
    onSaveDraft: () => void
}

export function ActiveDraftDrawer({
    onCheckout, onSaveDraft }: ActiveDraftDrawerProps) {
    const { formatCurrency } = useCurrency()
    const [open, setOpen] = useState(false)
    const { activeDraftId, draftOrders, removeItemFromDraft } = useDraftOrderStore()

    const activeDraft = draftOrders.find((draft) => draft.id === activeDraftId)

    const subtotal = activeDraft?.subtotal?.gross?.amount || 0
    const total = activeDraft?.total?.gross?.amount || 0
    const itemCount = activeDraft?.lines?.reduce((total: number, line: any) => total + line.quantity, 0) || 0

    const handleRemoveItem = async (lineId: string) => {
        await removeItemFromDraft(lineId)
    }

    const handleCheckout = () => {
        setOpen(false)
        onCheckout()
    }

    const handleSaveDraft = () => {
        setOpen(false)
        onSaveDraft()
    }

    // Render a cart item
    const renderCartItem = (item: any) => {
        return (
            <div key={item.id} className="flex items-center justify-between py-3 border-b">
                <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">{getFormattedMoney(item.unitPrice?.gross?.amount || 0)} each</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none rounded-l-md"
                            onClick={() => {
                                // update the quantity
                                // This would require a mutation to update the line quantity
                                console.log("Decrease quantity for", item.id)
                            }}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none rounded-r-md"
                            onClick={() => {
                                // update the quantity
                                // This would require a mutation to update the line quantity
                                console.log("Increase quantity for", item.id)
                            }}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemoveItem(item.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <p className="font-medium ml-2 w-24 text-right">
                        {formatCurrency((item.unitPrice?.gross?.amount || 0) * item.quantity)}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button className="h-9 bg-green-600 hover:bg-green-700 text-white">
                    <ShoppingBag className="h-4 w-4 mr-1.5" />
                    <Badge variant="secondary" className="mr-1">
                        {itemCount}
                    </Badge>
                    {getFormattedMoney(total)}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <div className="p-4 pb-0">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-medium">Current Order</h4>
                            {activeDraft?.userEmail && (
                                <Badge variant="outline" className="ml-2">
                                    {activeDraft.userEmail}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="p-4">
                        {activeDraft?.lines?.length > 0 ? (
                            <ScrollArea className="h-[30vh]">
                                <div className="space-y-1">{activeDraft.lines.map((item: any) => renderCartItem(item))}</div>
                            </ScrollArea>
                        ) : (
                            <div className="text-center py-8">
                                <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                                <p className="text-muted-foreground">No items in this order</p>
                                <p className="text-sm text-muted-foreground mt-1">Select drinks to add them</p>
                            </div>
                        )}

                        {activeDraft?.lines?.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{getFormattedMoney(subtotal)}</span>
                                </div>

                                <Separator className="my-2" />

                                <div className="flex justify-between pt-2 font-bold">
                                    <span>Total</span>
                                    <span>{getFormattedMoney(total)}</span>
                                </div>

                                <div className="flex gap-2 pt-3">
                                    <Button variant="outline" className="flex-1" onClick={handleSaveDraft}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Draft
                                    </Button>

                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                        disabled={!activeDraft?.lines?.length}
                                        onClick={handleCheckout}
                                    >
                                        <Receipt className="h-4 w-4 mr-2" />
                                        Checkout
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}