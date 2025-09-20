"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Download, MoreHorizontal, Plus, Search, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Badge } from "@/components/ui/badge"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

// Sample data - would be fetched from API in production
const invoices = [
    {
        id: "INV-001",
        customer: "Nairobi Wholesalers",
        amount: 245600,
        date: "2025-03-10",
        dueDate: "2025-03-24",
        status: "paid",
        customerType: "wholesaler",
    },
    {
        id: "INV-002",
        customer: "Mombasa Distributors",
        amount: 189300,
        date: "2025-03-08",
        dueDate: "2025-03-22",
        status: "paid",
        customerType: "distributor",
    },
    {
        id: "INV-003",
        customer: "Kisumu Retailers Ltd",
        amount: 78500,
        date: "2025-03-07",
        dueDate: "2025-03-21",
        status: "pending",
        customerType: "retailer",
    },
    {
        id: "INV-004",
        customer: "Nakuru Liquor Store",
        amount: 42800,
        date: "2025-03-05",
        dueDate: "2025-03-19",
        status: "paid",
        customerType: "retailer",
    },
    {
        id: "INV-005",
        customer: "Eldoret Distributors",
        amount: 156700,
        date: "2025-03-03",
        dueDate: "2025-03-17",
        status: "overdue",
        customerType: "distributor",
    },
    {
        id: "INV-006",
        customer: "Thika Wholesalers",
        amount: 98400,
        date: "2025-03-01",
        dueDate: "2025-03-15",
        status: "overdue",
        customerType: "wholesaler",
    },
    {
        id: "INV-007",
        customer: "Machakos Liquor Hub",
        amount: 67500,
        date: "2025-02-28",
        dueDate: "2025-03-14",
        status: "pending",
        customerType: "retailer",
    },
    {
        id: "INV-008",
        customer: "Nyeri Distributors",
        amount: 124600,
        date: "2025-02-25",
        dueDate: "2025-03-11",
        status: "paid",
        customerType: "distributor",
    },
]

export function InvoicesList() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [customerTypeFilter, setCustomerTypeFilter] = useState("all")

    const organizationSlug = useOrganizationSlug()

    const filteredInvoices = invoices.filter((invoice) => {
        const matchesSearch =
            invoice.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.id.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

        const matchesCustomerType = customerTypeFilter === "all" || invoice.customerType === customerTypeFilter

        return matchesSearch && matchesStatus && matchesCustomerType
    })

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("en-KE", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>
            case "pending":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>
            case "overdue":
                return <Badge className="bg-red-500 hover:bg-red-600">Overdue</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">Manage and track all your invoices</p>
                </div>
                <Button asChild>
                    <Link href={`/dashboard/${organizationSlug}/accounting/invoices/new`}>
                        <Plus className="mr-2 h-4 w-4" /> Create Invoice
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Invoices</CardTitle>
                    <CardDescription>View, filter and manage your invoices</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search invoices..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Filter by customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Customers</SelectItem>
                                    <SelectItem value="distributor">Distributors</SelectItem>
                                    <SelectItem value="wholesaler">Wholesalers</SelectItem>
                                    <SelectItem value="retailer">Retailers</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvoices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                            No invoices found matching your filters
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInvoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/accounting/invoices/${invoice.id}`} className="hover:underline text-primary">
                                                    {invoice.id}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{invoice.customer}</TableCell>
                                            <TableCell>{formatDate(invoice.date)}</TableCell>
                                            <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                                            <TableCell>KSh {invoice.amount.toLocaleString()}</TableCell>
                                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
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
                                                            <Link href={`/accounting/invoices/${invoice.id}`}>View details</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Download className="mr-2 h-4 w-4" /> Download PDF
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>
                                                            <FileText className="mr-2 h-4 w-4" /> Mark as paid
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>Send reminder</DropdownMenuItem>
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