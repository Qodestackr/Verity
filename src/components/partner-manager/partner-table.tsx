"use client"

import { useCurrency } from "@/hooks/useCurrency";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PartnerTableProps {
    partners: any[]
    formatCurrency: (amount: number) => string
    selectedPartners: string[]
    onSelectAll: () => void
    onSelectPartner: (partnerId: string) => void
    onPartnerClick: (partner: any) => void
    onToggleBNPL: (partnerId: string) => void
    onTogglePriceVisibility: (partnerId: string) => void
}
 
export function PartnerTable({    

    partners,
    formatCurrency,
    selectedPartners,
    onSelectAll,
    onSelectPartner,
    onPartnerClick,
    onToggleBNPL,
    onTogglePriceVisibility,
}: PartnerTableProps) {
    // Get tier badge
    const getTierBadge = (tier: string) => {
        switch (tier) {
            case "Platinum":
                return (
                    <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-200">
                        Platinum
                    </Badge>
                )
            case "Gold":
                return (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-200">
                        Gold
                    </Badge>
                )
            case "Silver":
                return (
                    <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-200">
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
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-200">
                Active
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-200">
                Inactive
            </Badge>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">
                            <Checkbox
                                checked={selectedPartners.length === partners.length && partners.length > 0}
                                onCheckedChange={onSelectAll}
                            />
                        </TableHead>
                        <TableHead>Partner</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead className="text-right">Total Spend</TableHead>
                        <TableHead className="text-center">BNPL</TableHead>
                        <TableHead className="text-center">Price Visibility</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {partners.map((partner) => (
                        <TableRow
                            key={partner.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => onPartnerClick(partner)}
                        >
                            <TableCell className="p-2">
                                <Checkbox
                                    checked={selectedPartners.includes(partner.id)}
                                    onCheckedChange={() => onSelectPartner(partner.id)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{partner.name}</div>
                                <div className="text-xs text-muted-foreground">{partner.type}</div>
                            </TableCell>
                            <TableCell>{partner.region}</TableCell>
                            <TableCell>{getStatusBadge(partner.status)}</TableCell>
                            <TableCell>{getTierBadge(partner.tier)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(partner.totalSpend)}</TableCell>
                            <TableCell className="text-center">
                                <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Switch
                                                    checked={partner.bnplEnabled}
                                                    onCheckedChange={() => onToggleBNPL(partner.id)}
                                                    className="data-[state=checked]:bg-teal-600"
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{partner.bnplEnabled ? "Disable" : "Enable"} Buy Now, Pay Later</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Switch
                                                    checked={partner.priceVisibility}
                                                    onCheckedChange={() => onTogglePriceVisibility(partner.id)}
                                                    className="data-[state=checked]:bg-teal-600"
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{partner.priceVisibility ? "Hide" : "Show"} Prices</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </TableCell>
                            <TableCell>
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
                                                onPartnerClick(partner)
                                            }}
                                        >
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Create Order</DropdownMenuItem>
                                        <DropdownMenuItem>Add Note</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}

                    {partners.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={9} className="h-24 text-center">
                                No partners found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
