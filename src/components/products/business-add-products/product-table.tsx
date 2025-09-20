"use client"

import { useState, useMemo } from "react"
import { useCurrency } from "@/hooks/useCurrency";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { ChevronLeft, ChevronRight, Edit, Eye, Loader2, MoreHorizontal, Trash } from "lucide-react"

// Mock data for demonstration - simplified to match our approach
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
    }
]

interface ProductTableProps {
    searchQuery: string
}

export default function ProductTable({ searchQuery }: ProductTableProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15

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
        <div className="bg-white dark:bg-background rounded-md border border-teal-100 shadow-sm">
            <div className="relative w-full overflow-auto">
                <Table className="text-xs">
                    <TableHeader>
                        <TableRow className="bg-teal-50 hover:bg-teal-50">
                            <TableHead className="w-[80px]">SKU</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Price (KES)</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                                        <span className="ml-2">Loading products...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : paginatedProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <p className="text-muted-foreground">No products found</p>
                                        {searchQuery && (
                                            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search query</p>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedProducts.map((product) => (
                                <TableRow key={product.id} className="hover:bg-teal-50/50">
                                    <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{product.name}</div>
                                    </TableCell>
                                    <TableCell>{product.type}</TableCell>
                                    <TableCell className="text-right">{product.price.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <span className={`font-medium ${product.stock < 20 ? "text-red-600" : ""}`}>{product.stock}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`${product.isAvailable
                                                ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700 border-green-200"
                                                : "bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700 border-red-200"
                                                }`}
                                        >
                                            {product.isAvailable ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
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
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {filteredProducts.length > itemsPerPage && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-teal-100">
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
        </div>
    )
}
