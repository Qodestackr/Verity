"use client"

import { useState, useEffect } from "react"
import { Clock, Plus, User, ShoppingBag } from "lucide-react"
import { format } from "date-fns"
import { useDraftOrderStore } from "@/stores/use-draft-order-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { getFormattedMoney } from "@/utils/money"

interface DraftOrdersDrawerProps {
    onCreateNewDraft: () => void
}

export function DraftOrdersDrawer({
    onCreateNewDraft }: DraftOrdersDrawerProps) {
    const [open, setOpen] = useState(false)
    const { activeDraftId, draftOrders, isLoading, setActiveDraftId, loadDraftOrders } = useDraftOrderStore()

    // Load draft orders on mount
    useEffect(() => {
        loadDraftOrders()
    }, [loadDraftOrders])

    const handleSelectDraft = (draftId: string) => {
        setActiveDraftId(draftId)
        setOpen(false)
    }

    const handleCreateNewDraft = () => {
        onCreateNewDraft()
        setOpen(false)
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return format(date, "h:mm a")
        } catch (e) {
            return "Unknown time"
        }
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                    <Clock className="h-4 w-4 mr-1.5" />
                    Drafts
                    <Badge variant="secondary" className="ml-1">
                        {draftOrders.length}
                    </Badge>
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <div className="p-4 pb-0">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-medium">Draft Orders</h4>
                            <Button size="sm" onClick={handleCreateNewDraft}>
                                <Plus className="h-4 w-4 mr-1.5" />
                                New Draft
                            </Button>
                        </div>
                    </div>
                    <ScrollArea className="h-[50vh] px-4 py-2">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            </div>
                        ) : draftOrders.length > 0 ? (
                            <div className="space-y-2">
                                {draftOrders.map((draft) => (
                                    <Card
                                        key={draft.id}
                                        className={cn(
                                            "cursor-pointer transition-all",
                                            draft.id === activeDraftId ? "border-primary bg-primary/5" : "",
                                        )}
                                        onClick={() => handleSelectDraft(draft.id)}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-muted-foreground">Updated {formatDate(draft.created)}</span>
                                                <Badge variant="outline">{draft.lines?.length || 0} items</Badge>
                                            </div>

                                            <div className="mb-1">
                                                {draft.userEmail ? (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <User className="h-3 w-3" />
                                                        <span>{draft.userEmail}</span>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">No customer</p>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm flex items-center gap-1">
                                                    <ShoppingBag className="h-3 w-3" />
                                                    {draft.lines?.reduce((total: number, line: any) => total + line.quantity, 0) || 0} items
                                                </span>
                                                <span className="font-medium">{getFormattedMoney(draft.total?.gross?.amount || 0)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No draft orders</p>
                                <Button variant="outline" className="mt-4" onClick={handleCreateNewDraft}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create New Draft
                                </Button>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
