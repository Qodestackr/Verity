"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, Mail, X, CreditCard, Eye } from "lucide-react"

interface BulkActionsProps {
    selectedCount: number
    onClearSelection: () => void
}

export function BulkActions({
    selectedCount, onClearSelection }: BulkActionsProps) {
    return (
        <Card className="py-0 p-1 bg-teal-50 border-teal-200">
            <CardContent className="p-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={onClearSelection} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">{selectedCount} wholesalers selected</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="bg-teal-600 text-white hover:bg-teal-700 h-7 text-xs">
                        <CreditCard className="h-4 w-4 mr-1" />
                        Enable BNPL
                    </Button>
                    <Button variant="outline" size="sm" className="bg-teal-600 text-white hover:bg-teal-700 h-7 text-xs">
                        <Eye className="h-4 w-4 mr-1" />
                        Show Prices
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Create Orders
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
