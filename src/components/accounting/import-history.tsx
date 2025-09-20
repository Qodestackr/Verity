"use client"

import { format } from "date-fns"
import { FileSpreadsheet, FileText, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const importHistory = [
    {
        id: "imp_1",
        date: new Date("2025-04-20"),
        fileName: "equity_bank_apr_2025.csv",
        fileType: "csv",
        transactionCount: 42,
        status: "completed",
        account: "Main Business Account",
    },
    {
        id: "imp_2",
        date: new Date("2025-04-15"),
        fileName: "kcb_statement_mar_2025.pdf",
        fileType: "pdf",
        transactionCount: 38,
        status: "completed",
        account: "Savings Account",
    },
    {
        id: "imp_3",
        date: new Date("2025-04-10"),
        fileName: "equity_bank_mar_2025.csv",
        fileType: "csv",
        transactionCount: 45,
        status: "completed",
        account: "Main Business Account",
    },
    {
        id: "imp_4",
        date: new Date("2025-04-05"),
        fileName: "coop_bank_feb_2025.pdf",
        fileType: "pdf",
        transactionCount: 32,
        status: "completed",
        account: "Main Business Account",
    },
]

export function ImportHistory() {
    return (
        <div className="space-y-4">
            {importHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No import history available</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {importHistory.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                                {item.fileType === "csv" ? (
                                    <FileSpreadsheet className="h-8 w-8 text-blue-500" />
                                ) : (
                                    <FileText className="h-8 w-8 text-amber-500" />
                                )}
                                <div>
                                    <div className="font-medium">{item.fileName}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {format(item.date, "MMM d, yyyy")} • {item.account}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    {item.transactionCount} transactions
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>View details</DropdownMenuItem>
                                        <DropdownMenuItem>View transactions</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600">Delete import</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
