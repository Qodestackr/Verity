"use client"

import { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Grid3X3, List, Package, Plus, Search, Upload } from "lucide-react"
import ProductBuilder from "./product-builder"
import ProductTable from "./product-table"
import ProductGrid from "./product-grid"

export default function BusinessAddProductManagement() {
    const [view, setView] = useState<"table" | "grid">("table")
    const [isAddProductOpen, setIsAddProductOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="container mx-auto py-6 space-y-6">
            <Card className="border-teal-100 py-0">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="text-teal-800 flex items-center gap-2">
                                <Package className="h-5 w-5 text-teal-600" />
                                Product Management
                            </CardTitle>
                            <CardDescription>Manage your inventory of beverages and other products</CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                size="sm"
                                className="h-8 gap-1 text-xs bg-teal-600 hover:bg-teal-700"
                                onClick={() => setIsAddProductOpen(true)}
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Add Product</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-[300px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search products..."
                                    className="pl-8 h-9 text-sm w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="bg-slate-100 rounded-md p-1 flex">
                                <Button
                                    variant={view === "table" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="h-8 px-2 rounded-sm"
                                    onClick={() => setView("table")}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={view === "grid" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="h-8 px-2 rounded-sm"
                                    onClick={() => setView("grid")}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isAddProductOpen ? (
                <ProductBuilder />
            ) : view === "table" ? (
                <ProductTable searchQuery={searchQuery} />
            ) : (
                <ProductGrid searchQuery={searchQuery} />
            )}
        </div>
    )
}
