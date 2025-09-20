"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, Receipt, CheckCircle, Clock, XCircle } from "lucide-react"
import type { Expense } from "@/types/accounting"
import { useDeleteExpense } from "@/hooks/use-expenses"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ExpenseTableProps {
    expenses: Expense[]
}

const paymentMethodLabels: Record<string, string> = {
    CASH: "Cash",
    CREDIT: "Credit",
    MPESA: "M-Pesa",
    OTHER_MOBILE_MONEY: "Mobile Money",
    CARD: "Card",
    BANK: "Bank Transfer",
}

const paymentStatusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    PAID: "bg-green-100 text-green-800",
    SUCCEEDED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800",
}

const paymentStatusIcons: Record<string, any> = {
    PENDING: Clock,
    PROCESSING: Clock,
    PAID: CheckCircle,
    SUCCEEDED: CheckCircle,
    FAILED: XCircle,
    REFUNDED: XCircle,
}

export function ExpenseTable({
    expenses }: ExpenseTableProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const deleteExpense = useDeleteExpense()

    const handleDelete = async () => {
        if (deleteId) {
            await deleteExpense.mutateAsync(deleteId)
            setDeleteId(null)
        }
    }

    if (expenses.length === 0) {
        return (
            <div className="text-center py-8">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No expenses</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by creating your first expense.</p>
            </div>
        )
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.map((expense) => {
                            const StatusIcon = paymentStatusIcons[expense.paymentStatus] || Clock

                            return (
                                <TableRow key={expense.id}>
                                    <TableCell className="font-medium">{format(new Date(expense.expenseDate), "MMM dd, yyyy")}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{expense.description}</div>
                                            {expense.vendor && <div className="text-sm text-muted-foreground">{expense.vendor.name}</div>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{expense.category.name}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">KES {expense.amount.toLocaleString()}</TableCell>
                                    <TableCell>{paymentMethodLabels[expense.paymentMethod] || expense.paymentMethod}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={paymentStatusColors[expense.paymentStatus]}>
                                            <StatusIcon className="w-3 h-3 mr-1" />
                                            {expense.paymentStatus.toLowerCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                {expense.receiptUrl && (
                                                    <DropdownMenuItem>
                                                        <Receipt className="mr-2 h-4 w-4" />
                                                        View Receipt
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(expense.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this expense? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteExpense.isPending}
                        >
                            {deleteExpense.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
