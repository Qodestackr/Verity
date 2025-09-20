"use client"

import { ShoppingCart, MoreHorizontal, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface RetailerCardProps {
    retailer: any
    formatCurrency: (amount: number) => string
    isSelected: boolean
    onSelect: () => void
    onClick: () => void
    onEdit: () => void
}

export function RetailerCard({
    retailer, formatCurrency, isSelected, onSelect, onClick, onEdit }: RetailerCardProps) {
    // Get tier badge
    const getTierBadge = (tier: string) => {
        switch (tier) {
            case "Platinum":
                return (
                    <Badge variant="outline" className="bg-purple-500/10 h-4 text-xs font-light text-purple-500 border-purple-200">
                        Platinum
                    </Badge>
                )
            case "Gold":
                return (
                    <Badge variant="outline" className="bg-amber-500/10 h-4 text-xs font-light text-amber-500 border-amber-200">
                        Gold
                    </Badge>
                )
            case "Silver":
                return (
                    <Badge variant="outline" className="bg-slate-500/10 h-4 text-xs font-light text-slate-500 border-slate-200">
                        Silver
                    </Badge>
                )
            default:
                return <Badge variant="outline">{tier}</Badge>
        }
    }

    // Get status badge
    const getStatusBadge = (status: string) => {
        return status === "Active" ? (
            <Badge variant="outline" className="bg-green-500/10 h-4 text-xs font-light text-green-500 border-green-200">
                Active
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-red-500/10 h-4 text-xs font-light text-red-500 border-red-200">
                Inactive
            </Badge>
        )
    }

    return (
        <Card
            className={`transition-all py-0 p-1 duration-200 ${isSelected ? "ring-2 ring-primary" : ""} ${retailer.status === "Inactive" ? "opacity-70" : ""
                }`}
            onClick={onClick}
        >
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div className="flex justify-between items-center gap-2">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onSelect()}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                    />
                    <div>
                        <CardTitle className="text-base font-light flex items-center gap-2">
                            {retailer.name}
                            {retailer.paymentStatus === "Overdue" && <AlertCircle className="h-4 w-4 text-red-500" />}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{retailer.type}</span>
                            {getStatusBadge(retailer.status)}
                        </div>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation()
                                onClick()
                            }}
                        >
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation()
                                onEdit()
                            }}
                        >
                            Edit Retailer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Create Order</DropdownMenuItem>
                        <DropdownMenuItem>Add Note</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent className="pb-3 p-1">
                <div className="space-y-2">
                    <div className="flex justify-between items-center pt-1">
                        <div className="flex items-center gap-2">
                            {getTierBadge(retailer.tier)}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            <span>{retailer.totalOrders}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
