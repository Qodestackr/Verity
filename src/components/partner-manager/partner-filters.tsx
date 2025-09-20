"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Filter } from "lucide-react"
import { usePartnerStore } from "@/stores/use-partner-store"

interface PartnerFiltersProps {
    showStatusFilter?: boolean
}

export function PartnerFilters({
    showStatusFilter = false }: PartnerFiltersProps) {
    const { filters, setFilters } = usePartnerStore()

    return (
        <div className="flex flex-wrap gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <div className="p-2">
                        <p className="text-xs font-medium mb-1">Business Type</p>
                        <Select value={filters.businessType} onValueChange={(value) => setFilters({ businessType: value })}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Business Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="DISTRIBUTOR">Distributor</SelectItem>
                                <SelectItem value="WHOLESALER">Wholesaler</SelectItem>
                                <SelectItem value="RETAILER">Retailer</SelectItem>
                                <SelectItem value="BRAND_OWNER">Brand Owner</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="p-2">
                        <p className="text-xs font-medium mb-1">Location</p>
                        <Select value={filters.city} onValueChange={(value) => setFilters({ city: value })}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="City" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Cities</SelectItem>
                                <SelectItem value="Nairobi">Nairobi</SelectItem>
                                <SelectItem value="Mombasa">Mombasa</SelectItem>
                                <SelectItem value="Kisumu">Kisumu</SelectItem>
                                <SelectItem value="Nakuru">Nakuru</SelectItem>
                                <SelectItem value="Eldoret">Eldoret</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {showStatusFilter && (
                        <div className="p-2">
                            <p className="text-xs font-medium mb-1">Status</p>
                            <Select value={filters.status} onValueChange={(value) => setFilters({ status: value })}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
