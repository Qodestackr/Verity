"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
    ArrowLeft,
    Calendar,
    Check,
    Download,
    FileText,
    Filter,
    HelpCircle,
    Landmark,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Search,
    Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BankReconciliationTable } from "@/components/accounting/bank-reconciliation-table"
import { BankTransactionDialog } from "@/components/accounting/bank-transaction-dialog"
import { BankAccountSelector } from "@/components/accounting/bank-account-selector"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

const bankAccounts = [
    { id: "acc_1", name: "Main Business Account", bank: "Equity Bank", accountNumber: "****1234", balance: 245000 },
    { id: "acc_2", name: "Savings Account", bank: "KCB", accountNumber: "****5678", balance: 120000 },
]

// Mock data for reconciliation status
const reconciliationStatus = {
    totalTransactions: 42,
    matchedTransactions: 28,
    unmatchedTransactions: 14,
    lastReconciled: new Date("2025-04-15"),
}

export default function BankReconciliationPage() {
    const [selectedAccount, setSelectedAccount] = useState(bankAccounts[0])
    const [isAddingTransaction, setIsAddingTransaction] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const organizationSlug = useOrganizationSlug()

    const matchPercentage = Math.round(
        (reconciliationStatus.matchedTransactions / reconciliationStatus.totalTransactions) * 100,
    )

    return (
        <div className="max-w-5xl mx-auto py-2">
            <div className="flex items-center mb-3">
                <Link href={`/dashboard/${organizationSlug}/accounting`} className="mr-2">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-light">Bank Reconciliation</h1>
                    <p className="text-muted-foreground">Match your bank transactions with your accounting records</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reconciliation Status</CardTitle>
                    <CardDescription>Current matching progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Matched</span>
                            <span className="font-medium">{matchPercentage}%</span>
                        </div>
                        <Progress value={matchPercentage} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Total Transactions</div>
                            <div className="text-lg font-semibold">{reconciliationStatus.totalTransactions}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Matched</div>
                            <div className="text-lg font-semibold text-green-600">{reconciliationStatus.matchedTransactions}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Unmatched</div>
                            <div className="text-lg font-semibold text-amber-600">
                                {reconciliationStatus.unmatchedTransactions}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Last Reconciled</div>
                            <div className="text-lg font-semibold">
                                {format(reconciliationStatus.lastReconciled, "MMM d, yyyy")}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="font-extralight">Transactions</CardTitle>
                                    <CardDescription>
                                        {format(reconciliationStatus.lastReconciled, "MMMM d, yyyy")} to{" "}
                                        {format(new Date(), "MMMM d, yyyy")}
                                    </CardDescription>
                                </div>
                                <BankAccountSelector
                                    accounts={bankAccounts}
                                    selectedAccount={selectedAccount}
                                    onSelectAccount={setSelectedAccount}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="px-6 pb-3 flex flex-col sm:flex-row gap-3 justify-between">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search transactions..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4 mr-1" />
                                        Filter
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Date Range
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/${organizationSlug}/accounting/import`}>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Import bank statement
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Download className="h-4 w-4 mr-2" />
                                                Export transactions
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Refresh transactions
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <Tabs defaultValue="unmatched">
                                <div className="px-6">
                                    <TabsList className="w-full grid grid-cols-3">
                                        <TabsTrigger value="all">All</TabsTrigger>
                                        <TabsTrigger value="matched">Matched</TabsTrigger>
                                        <TabsTrigger value="unmatched">Unmatched</TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="all" className="pt-0">
                                    <BankReconciliationTable filter="all" searchQuery={searchQuery} />
                                </TabsContent>

                                <TabsContent value="matched" className="pt-0">
                                    <BankReconciliationTable filter="matched" searchQuery={searchQuery} />
                                </TabsContent>

                                <TabsContent value="unmatched" className="pt-0">
                                    <BankReconciliationTable filter="unmatched" searchQuery={searchQuery} />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" size="sm" onClick={() => setIsAddingTransaction(true)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Transaction
                            </Button>
                            <Button className="bg-green-700 hover:bg-green-800 text-white" size="sm">
                                <Check className="h-4 w-4 mr-1" />
                                Complete Reconciliation
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href={`/dashboard/${organizationSlug}/accounting/import`}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import Bank Statement
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Download className="h-4 w-4 mr-2" />
                                Export Reconciliation Report
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Landmark className="h-4 w-4 mr-2" />
                                Connect Bank Account
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <FileText className="h-4 w-4 mr-2" />
                                View Previous Reconciliations
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Need Help?</CardTitle>
                    </CardHeader>
                    <CardContent className="w-full grid grid-cols-1">
                        <div className="flex items-start gap-3">
                            <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium">What is bank reconciliation?</p>
                                <p className="text-xs text-muted-foreground">
                                    Bank reconciliation is the process of matching your accounting records with your bank statements to
                                    ensure accuracy.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium">How often should I reconcile?</p>
                                <p className="text-xs text-muted-foreground">
                                    For small businesses, we recommend reconciling your accounts at least once a month.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="link" className="text-blue-500 p-0 h-auto">
                            View reconciliation guide
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <BankTransactionDialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction} />
        </div>
    )
}
