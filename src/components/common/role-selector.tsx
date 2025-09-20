"use client"

import { useState } from "react"
import { Check, Store, Warehouse, Building2, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const roles = [
    {
        id: "retailer",
        name: "Retailer",
        description: "Order products from wholesalers",
        icon: Store,
    },
    {
        id: "wholesaler",
        name: "Wholesaler",
        description: "Manage orders from retailers and order from distributors",
        icon: Warehouse,
    },
    {
        id: "distributor",
        name: "Distributor",
        description: "Manage inventory and fulfill wholesaler orders",
        icon: Building2,
    },
]

export function RoleSelector() {

    const [selectedRole, setSelectedRole] = useState(roles[0])

    return (
        <div className="w-full max-w-md mx-auto">
            <h2 className="text-lg font-medium mb-4">Select your role</h2>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                        <div className="flex items-center gap-2">
                            {selectedRole && (
                                <>
                                    <selectedRole.icon className="h-5 w-5 text-muted-foreground" />
                                    <span>{selectedRole.name}</span>
                                </>
                            )}
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[300px]" align="center">
                    {roles.map((role) => (
                        <DropdownMenuItem
                            key={role.id}
                            className={cn("flex items-center gap-2 p-3 cursor-pointer", selectedRole.id === role.id && "bg-accent")}
                            onClick={() => setSelectedRole(role)}
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                                <role.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{role.name}</p>
                                <p className="text-xs text-muted-foreground">{role.description}</p>
                            </div>
                            {selectedRole.id === role.id && <Check className="h-4 w-4 text-primary" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}