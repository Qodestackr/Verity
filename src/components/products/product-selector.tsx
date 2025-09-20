"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// API data
const products = [
    { id: "prod_1", name: "Tusker Lager" },
    { id: "prod_2", name: "Various Premium Spirits" },
    { id: "prod_3", name: "Johnnie Walker Black Label" },
    { id: "prod_4", name: "Smirnoff Vodka" },
    { id: "prod_5", name: "Heineken" },
    { id: "prod_6", name: "Jack Daniel's" },
    { id: "prod_7", name: "Baileys Irish Cream" },
    { id: "prod_8", name: "Corona Extra" },
    { id: "prod_9", name: "Jameson Irish Whiskey" },
    { id: "prod_10", name: "Guinness Draught" },
]

type ProductSelectorProps = {
    selectedProductId: string
    selectedProductName: string
    onProductSelect: (id: string, name: string) => void
}

export function ProductSelector({
    selectedProductId, selectedProductName, onProductSelect }: ProductSelectorProps) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between w-full border-slate-300 focus-visible:ring-slate-400"
                >
                    {selectedProductName || "Select a product..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[400px]">
                <Command>
                    <CommandInput placeholder="Search products..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No products found.</CommandEmpty>
                        <CommandGroup>
                            {products.map((product) => (
                                <CommandItem
                                    key={product.id}
                                    value={product.name}
                                    onSelect={() => {
                                        onProductSelect(product.id, product.name)
                                        setOpen(false)
                                    }}
                                >
                                    {product.name}
                                    <Check
                                        className={cn("ml-auto h-4 w-4", selectedProductId === product.id ? "opacity-100" : "opacity-0")}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
