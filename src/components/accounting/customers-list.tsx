"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Filter, MoreHorizontal, Plus, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

const customers = [
    {
        id: "CUST-001",
        name: "Nairobi Wholesalers",
        email: "accounts@nairobiwholesalers.co.ke",
        phone: "+254 722 123 456",
        type: "wholesaler",
        creditLimit: 1000000,
        creditUsed: 450000,
        status: "active",
        outstandingBalance: 245600,
        lastOrderDate: "2025-03-10",
    },
    {
        id: "CUST-002",
        name: "Mombasa Distributors",
        email: "finance@mombasadist.co.ke",
        phone: "+254 733 234 567",
        type: "distributor",
        creditLimit: 800000,
        creditUsed: 720000,
        status: "warning",
        outstandingBalance: 189300,
        lastOrderDate: "2025-03-08",
    },
    {
        id: "CUST-003",
        name: "Kisumu Retailers Ltd",
        email: "accounts@kisumuretailers.co.ke",
        phone: "+254 712 345 678",
        type: "retailer",
        creditLimit: 500000,
        creditUsed: 225000,
        status: "active",
        outstandingBalance: 78500,
        lastOrderDate: "2025-03-07",
    },
    {
        id: "CUST-004",
        name: "Nakuru Liquor Store",
        email: "info@nakuruliquor.co.ke",
        phone: "+254 724 456 789",
        type: "retailer",
        creditLimit: 300000,
        creditUsed: 42800,
        status: "active",
        outstandingBalance: 42800,
        lastOrderDate: "2025-03-05",
    },
    {
        id: "CUST-005",
        name: "Eldoret Distributors",
        email: "accounts@eldoretdist.co.ke",
        phone: "+254 735 567 890",
        type: "distributor",
        creditLimit: 700000,
        creditUsed: 680000,
        status: "warning",
        outstandingBalance: 156700,
        lastOrderDate: "2025-03-03",
    },
    {
        id: "CUST-006",
        name: "Thika Wholesalers",
        email: "finance@thikawholesalers.co.ke",
        phone: "+254 726 678 901",
        type: "wholesaler",
        creditLimit: 900000,
        creditUsed: 850000,
        status: "warning",
        outstandingBalance: 98400,
        lastOrderDate: "2025-03-01",
    },
]

export function CustomersList() {
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    const organizationSlug = useOrganizationSlug()

    const filteredCustomers = customers.filter((customer) => {
        const matchesSearch =
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesType = typeFilter === "all" || customer.type === typeFilter

        const matchesStatus = statusFilter === "all" || customer.status === statusFilter

        return matchesSearch && matchesType && matchesStatus
    })

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("en-KE", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date)
    }

    const getCreditStatusBadge = (customer: any) => {
        const creditPercentage = (customer.creditUsed / customer.creditLimit) * 100

        if (creditPercentage >= 90) {
            return <Badge className="bg-red-500 hover:bg-red-600">Critical</Badge>
        } else if (creditPercentage >= 80) {
            return <Badge className="bg-amber-500 hover:bg-amber-600">Warning</Badge>
        } else {
            return <Badge className="bg-green-500 hover:bg-green-600">Good</Badge>
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-light tracking-tight">Customers</h1>
                    <p className="text-xs text-muted-foreground">Manage customer accounts and credit</p>
                </div>

                <div className="flex items-center gap-1">
                    <Button className="h-8 text-xs bg-emerald-700 hover:bg-emerald-800" asChild>
                        <Link href={`/dashboard/${organizationSlug}/accounting/customers/pos`}>
                            <Sparkles className="h-5 w-5 text-amber-500 mr-1.5" /> Loyalty Accounts
                        </Link>
                    </Button>
                    <Button className="h-8 text-xs bg-emerald-700 hover:bg-emerald-800" asChild>
                        <Link href={`/dashboard/${organizationSlug}/accounting/customers/new`}>
                            <Plus className="mr-2 h-4 w-4" /> Add Customer
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Customer Accounts</CardTitle>
                    <CardDescription>View and manage customer accounts and credit limits</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search customers..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="distributor">Distributors</SelectItem>
                                    <SelectItem value="wholesaler">Wholesalers</SelectItem>
                                    <SelectItem value="retailer">Retailers</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="warning">Credit Warning</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table className="text-xs">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Credit Limit</TableHead>
                                    <TableHead>Credit Status</TableHead>
                                    <TableHead>Outstanding</TableHead>
                                    <TableHead>Last Order</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                            No customers found matching your filters
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        <Link
                                                            href={`/dashboard/${organizationSlug}/accounting/customers/${customer.id}`}
                                                            className="hover:underline text-primary"
                                                        >
                                                            {customer.name}
                                                        </Link>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">{customer.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="h-4 font-light text-xs capitalize">
                                                    {customer.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">KSh {customer.creditLimit.toLocaleString()}</div>
                                                    <div className="w-full bg-muted rounded-full h-2 mt-1">
                                                        <div
                                                            className={`h-2 rounded-full ${(customer.creditUsed / customer.creditLimit) * 100 >= 90
                                                                ? "bg-red-500"
                                                                : (customer.creditUsed / customer.creditLimit) * 100 >= 80
                                                                    ? "bg-amber-500"
                                                                    : "bg-green-500"
                                                                }`}
                                                            style={{ width: `${(customer.creditUsed / customer.creditLimit) * 100}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {Math.round((customer.creditUsed / customer.creditLimit) * 100)}% used
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getCreditStatusBadge(customer)}</TableCell>
                                            <TableCell>KSh {customer.outstandingBalance.toLocaleString()}</TableCell>
                                            <TableCell>{formatDate(customer.lastOrderDate)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/${organizationSlug}/accounting/customers/${customer.id}`}>View details</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/${organizationSlug}/accounting/customers/${customer.id}/edit`}>Edit customer</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/${organizationSlug}/accounting/customers/${customer.id}/invoices`}>View invoices</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/${organizationSlug}/accounting/customers/${customer.id}/credit`}>Adjust credit limit</Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}