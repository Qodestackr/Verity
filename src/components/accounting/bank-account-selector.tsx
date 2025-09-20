"use client"

import { ChevronDown } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BankAccount {
    id: string
    name: string
    bank: string
    accountNumber: string
    balance: number
}

interface BankAccountSelectorProps {
    accounts: BankAccount[]
    selectedAccount: BankAccount
    onSelectAccount: (account: BankAccount) => void
}

export function BankAccountSelector({
    accounts, selectedAccount, onSelectAccount }: BankAccountSelectorProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-normal text-blue-600">{selectedAccount.name}</span>
                        <span className="text-xs text-muted-foreground">{selectedAccount.bank}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
                <DropdownMenuLabel>Select Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {accounts.map((account) => (
                    <DropdownMenuItem key={account.id} onClick={() => onSelectAccount(account)} className="cursor-pointer">
                        <div className="flex flex-col w-full">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{account.name}</span>
                                <span className="text-sm">KES {account.balance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span>{account.bank}</span>
                                <span>{account.accountNumber}</span>
                            </div>
                        </div>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                    <span className="text-blue-500">+ Add new account</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
