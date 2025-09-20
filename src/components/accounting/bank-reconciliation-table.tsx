"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from "@tanstack/react-table"
import { ArrowUpDown, Check, MoreHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Mock transaction data
const transactions = [
    {
        id: "tx_1",
        date: new Date("2025-04-20"),
        description: "Payment from ABC Distributors",
        amount: 45000,
        type: "credit",
        status: "matched",
        matchedWith: "inv_123",
        category: "sales",
        reference: "REF123456",
    },
    {
        id: "tx_2",
        date: new Date("2025-04-19"),
        description: "Office Rent Payment",
        amount: 35000,
        type: "debit",
        status: "matched",
        matchedWith: "exp_456",
        category: "rent",
        reference: "REF789012",
    },
    {
        id: "tx_3",
        date: new Date("2025-04-18"),
        description: "Utility Bill - Electricity",
        amount: 12000,
        type: "debit",
        status: "matched",
        matchedWith: "exp_789",
        category: "utilities",
        reference: "REF345678",
    },
    {
        id: "tx_4",
        date: new Date("2025-04-17"),
        description: "Payment from XYZ Company",
        amount: 28500,
        type: "credit",
        status: "unmatched",
        matchedWith: null,
        category: null,
        reference: "REF901234",
    },
    {
        id: "tx_5",
        date: new Date("2025-04-16"),
        description: "Office Supplies Purchase",
        amount: 5000,
        type: "debit",
        status: "unmatched",
        matchedWith: null,
        category: null,
        reference: "REF567890",
    },
    {
        id: "tx_6",
        date: new Date("2025-04-15"),
        description: "Transport Expenses",
        amount: 2500,
        type: "debit",
        status: "unmatched",
        matchedWith: null,
        category: null,
        reference: "REF123789",
    },
    {
        id: "tx_7",
        date: new Date("2025-04-14"),
        description: "Payment from Regular Customer",
        amount: 15000,
        type: "credit",
        status: "unmatched",
        matchedWith: null,
        category: null,
        reference: "REF456012",
    },
]

// Define columns for the transaction table
const columns: ColumnDef<(typeof transactions)[0]>[] = [
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 hover:bg-transparent"
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = row.getValue("date") as Date
            return <div className="font-medium">{format(date, "MMM d, yyyy")}</div>
        },
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
            return (
                <div className="max-w-[300px] truncate" title={row.getValue("description")}>
                    {row.getValue("description")}
                </div>
            )
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 hover:bg-transparent"
                >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = Number.parseFloat(row.getValue("amount"))
            const type = row.original.type
            const formatted = new Intl.NumberFormat("en-KE", {
                style: "currency",
                currency: "KES",
            }).format(amount)

            return (
                <div className={cn("font-medium text-right", type === "credit" ? "text-green-600" : "text-red-600")}>
                    {type === "credit" ? "+" : "-"}
                    {formatted}
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        status === "matched"
                            ? "border-green-500 text-green-700 bg-green-50"
                            : "border-amber-500 text-amber-700 bg-amber-50",
                    )}
                >
                    {status === "matched" ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            const category = row.getValue("category") as string | null
            return category ? (
                <div className="capitalize">{category}</div>
            ) : (
                <div className="text-muted-foreground italic">Uncategorized</div>
            )
        },
    },
    {
        accessorKey: "reference",
        header: "Reference",
        cell: ({ row }) => {
            return <div className="text-xs font-mono">{row.getValue("reference")}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const transaction = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(transaction.id)}>
                            Copy transaction ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        {transaction.status === "unmatched" ? (
                            <DropdownMenuItem>Match transaction</DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem>View matched record</DropdownMenuItem>
                        )}
                        <DropdownMenuItem>Edit transaction</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete transaction</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

interface BankReconciliationTableProps {
    filter: "all" | "matched" | "unmatched"
    searchQuery: string
}

export function BankReconciliationTable({
    filter, searchQuery }: BankReconciliationTableProps) {
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: "date",
            desc: true,
        },
    ])

    // Filter transactions based on filter and search query
    const filteredTransactions = transactions.filter((transaction) => {
        // Filter by status
        if (filter === "matched" && transaction.status !== "matched") return false
        if (filter === "unmatched" && transaction.status !== "unmatched") return false

        // Filter by search query
        if (!searchQuery) return true

        const searchLower = searchQuery.toLowerCase()
        return (
            transaction.description.toLowerCase().includes(searchLower) ||
            transaction.reference.toLowerCase().includes(searchLower) ||
            (transaction.category && transaction.category.toLowerCase().includes(searchLower))
        )
    })

    const table = useReactTable({
        data: filteredTransactions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
        initialState: {
            pagination: {
                pageSize: 5,
            },
        },
    })

    return (
        <div>
            <div className="rounded-md border-t">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <p>No transactions found</p>
                                        <p className="text-sm">Try adjusting your filters or search query</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-4 py-4">
                <div className="text-sm text-muted-foreground">
                    Showing {table.getRowModel().rows.length} of {filteredTransactions.length} transactions
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
