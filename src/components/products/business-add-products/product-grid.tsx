"use client"

import { useState, useMemo } from "react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, Edit, Eye, Loader2, MoreHorizontal, Package, Trash } from "lucide-react"

// Use the same mock data from product-table.tsx
const mockProducts = [
    {
        id: "1",
        name: "Tusker Lager 500ML",
        sku: "TSK-500ML",
        type: "Alcoholic",
        price: 180,
        stock: 120,
        isAvailable: true,
    },
    {
        id: "2",
        name: "Kenya Cane 750ML",
        sku: "KC-750ML",
        type: "Alcoholic",
        price: 1200,
        stock: 45,
        isAvailable: true,
    },
    {
        id: "3",
        name: "Coca-Cola 330ML",
        sku: "CC-330ML",
        type: "Non-Alcoholic",
        price: 80,
        stock: 200,
        isAvailable: true,
    },
    {
        id: "4",
        name: "Johnnie Walker Black Label 750ML",
        sku: "JW-BL-750ML",
        type: "Alcoholic",
        price: 3500,
        stock: 15,
        isAvailable: true,
    },
    {
        id: "5",
        name: "Heineken 330ML",
        sku: "HNK-330ML",
        type: "Alcoholic",
        price: 220,
        stock: 85,
        isAvailable: true,
    },
    {
        id: "6",
        name: "Minute Maid Orange 1L",
        sku: "MM-OJ-1L",
        type: "Non-Alcoholic",
        price: 150,
        stock: 60,
        isAvailable: true,
    },
    {
        id: "7",
        name: "Ugali 1/4kg",
        sku: "UGL-14",
        type: "Food",
        price: 50,
        stock: 30,
        isAvailable: true,
    },
    {
        id: "8",
        name: "Nyama Choma 1kg",
        sku: "NCH-1KG",
        type: "Food",
        price: 800,
        stock: 10,
        isAvailable: true,
    },
    {
        id: "9",
        name: "Fanta Orange 500ML",
        sku: "FNT-500ML",
        type: "Non-Alcoholic",
        price: 90,
        stock: 150,
        isAvailable: true,
    },
    {
        id: "10",
        name: "Gilbey's Gin 750ML",
        sku: "GLB-750ML",
        type: "Alcoholic",
        price: 1400,
        stock: 25,
        isAvailable: true,
    },
]

interface ProductGridProps {
    searchQuery: string
}

export default function ProductGrid({ searchQuery }: ProductGridProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    // Filter products based on search query
    const filteredProducts = useMemo(() => {
        if (!searchQuery) return mockProducts

        return mockProducts.filter(
            (product) =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.type.toLowerCase().includes(searchQuery.toLowerCase()),
        )
    }, [searchQuery])

    // Paginate products
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return filteredProducts.slice(startIndex, startIndex + itemsPerPage)
    }, [filteredProducts, currentPage])

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

    return (
        <div className="space-y-4">
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                    <span className="ml-2">Loading products...</span>
                </div>
            ) : paginatedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-md border">
                    <Package className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No products found</p>
                    {searchQuery && <p className="text-sm text-muted-foreground mt-1">Try adjusting your search query</p>}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {paginatedProducts.map((product) => (
                            <Card
                                key={product.id}
                                className="overflow-hidden border-teal-100 hover:border-teal-300 transition-colors py-0"
                            >
                                <CardHeader className="p-4 pb-2 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="font-medium line-clamp-1">{product.name}</div>
                                            <div className="text-xs text-muted-foreground">{product.type}</div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Product
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Delete Product
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-3">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <div className="text-xs text-muted-foreground">SKU</div>
                                            <div className="font-mono text-xs">{product.sku}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Price</div>
                                            <div className="font-medium">KES {product.price.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Stock</div>
                                            <div className={`font-medium ${product.stock < 20 ? "text-red-600" : ""}`}>{product.stock}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Status</div>
                                            <Badge
                                                variant="outline"
                                                className={`${product.isAvailable
                                                    ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700 border-green-200"
                                                    : "bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700 border-red-200"
                                                    }`}
                                            >
                                                {product.isAvailable ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-3 bg-slate-50 border-t flex justify-between">
                                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                                        <Eye className="mr-1 h-3.5 w-3.5" />
                                        View
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                                        <Edit className="mr-1 h-3.5 w-3.5" />
                                        Edit
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {filteredProducts.length > itemsPerPage && (
                        <div className="flex items-center justify-between py-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                                {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="text-sm mx-2">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
