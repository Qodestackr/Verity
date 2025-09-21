"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { QrCode, Package, RefreshCw, Loader2, AlertTriangle, CheckCircle2, FileText, ArrowLeftRight, ClipboardList } from "lucide-react"
import BarcodeScanner from "@/components/core/scanner/barcode-snanner"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

// Type definitions
interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    packaging: string;
    stock: number;
    stockStatus: string;
    reorderLevel: number;
    warehouse: string;
    lastUpdated: string;
    expiryDate: string;
    batchNumber: string;
    exciseDuty: string;
    krabSticker: boolean;
    optimalTemp: string;
    supplierName: string;
    costPrice: number;
    retailPrice: number;
    barcode: string;
}

/**
 * This component demonstrates how to integrate the barcode scanner
 * with the inventory management system.
 */
export const InventoryBarcodeScannerButton = () => {
    const [scannerOpen, setScannerOpen] = useState(false)
    const [scannedProduct, setScannedProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(false)
    const [scanMode, setScanMode] = useState<"lookup" | "stocktake" | "transfer">("lookup")
    const [newQuantity, setNewQuantity] = useState<number | null>(null)
    const [destinationWarehouse, setDestinationWarehouse] = useState<string | null>(null)
    const [notes, setNotes] = useState("")

    // Handle barcode detection
    const handleBarcodeDetected = async (result: any) => {
        if (!result || !result.codeResult) return

        const barcode = result.codeResult.code
        const format = result.codeResult.format

        console.log(`Detected ${format} barcode: ${barcode}`)

        // Close the scanner first to improve UX
        setScannerOpen(false)

        // Show loading state
        setLoading(true)

        try {
            const product = await findProductByBarcode(barcode)

            if (product) {
                setScannedProduct(product)

                // Initialize form values
                if (scanMode === "stocktake") {
                    setNewQuantity(product.stock)
                }

                toast.success(`Found: ${product.name}`)
            } else {
                toast.error(`Product not found for barcode: ${barcode}`)
            }
        } catch (error) {
            console.error("Error finding product:", error)
            toast.error("Failed to lookup product information")
        } finally {
            setLoading(false)
        }
    }

    // Mock function to find a product by barcode
    const findProductByBarcode = (barcode: string): Promise<Product | null> => {
        // Sim network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockProducts: Record<string, Product> = {
                    "5901234123457": {
                        id: "PRD-001",
                        name: "Tusker Lager",
                        sku: "TUS-LAG-330",
                        category: "Beer",
                        packaging: "24 x 330ml bottles",
                        stock: 1240,
                        stockStatus: "in-stock",
                        reorderLevel: 500,
                        warehouse: "Nairobi Central",
                        lastUpdated: "2025-03-15",
                        expiryDate: "2025-09-15",
                        batchNumber: "KBL-202503-A",
                        exciseDuty: "Paid",
                        krabSticker: true,
                        optimalTemp: "4-6°C",
                        supplierName: "EABL",
                        costPrice: 2400,
                        retailPrice: 3120,
                        barcode: "5901234123457"
                    },
                    "9781234567897": {
                        id: "PRD-003",
                        name: "Guinness Stout",
                        sku: "GNS-STT-500",
                        category: "Beer",
                        packaging: "24 x 500ml cans",
                        stock: 320,
                        stockStatus: "low-stock",
                        reorderLevel: 350,
                        warehouse: "Thika",
                        lastUpdated: "2025-03-20",
                        expiryDate: "2025-10-20",
                        batchNumber: "KBL-202503-C",
                        exciseDuty: "Paid",
                        krabSticker: true,
                        optimalTemp: "5-8°C",
                        supplierName: "EABL",
                        costPrice: 360_0,
                        retailPrice: 4680,
                        barcode: "9781234567897"
                    },
                    "1234567890128": {
                        id: "PRD-004",
                        name: "Johnnie Walker Black Label",
                        sku: "JW-BL-750",
                        category: "Whisky",
                        packaging: "12 x 750ml bottles",
                        stock: 45,
                        stockStatus: "low-stock",
                        reorderLevel: 50,
                        warehouse: "Nairobi Central",
                        lastUpdated: "2025-03-22",
                        expiryDate: "2027-03-22",
                        batchNumber: "JW-202503-A",
                        exciseDuty: "Paid",
                        krabSticker: true,
                        optimalTemp: "15-20°C",
                        supplierName: "Diageo",
                        costPrice: 360_00,
                        retailPrice: 46800,
                        barcode: "1234567890128"
                    }
                }

                resolve(mockProducts[barcode] || null)
            }, 1000)
        })
    }

    // Handle scanner errors
    const handleScannerError = (error: any) => {
        console.error("Scanner error:", error)
        toast.error("Failed to initialize camera. Please check permissions.")
    }

    // Get badge for stock status
    const getStockStatusBadge = (status: string) => {
        switch (status) {
            case "in-stock":
                return <Badge className="bg-green-500">In Stock</Badge>
            case "low-stock":
                return <Badge className="bg-amber-500">Low Stock</Badge>
            case "out-of-stock":
                return <Badge className="bg-red-500">Out of Stock</Badge>
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    // Clear scanned product
    const handleClear = () => {
        setScannedProduct(null)
        setNewQuantity(null)
        setDestinationWarehouse(null)
        setNotes("")
    }

    // Calc stock percentage for progress bar
    const getStockPercentage = (stock: number, reorderLevel: number) => {
        if (stock === 0) return 0
        const percentage = (stock / (reorderLevel * 2)) * 100
        return Math.min(percentage, 100)
    }

    // Update stock quantity (mock function)
    const handleUpdateStock = () => {
        if (!scannedProduct || newQuantity === null) return

        const change = newQuantity - scannedProduct.stock
        const action = change >= 0 ? 'added' : 'removed'

        toast.success(`Stock updated: ${Math.abs(change)} units ${action}`)

        setTimeout(() => {
            handleClear()
        }, 1500)
    }

    // Handle stock transfer
    const handleTransferStock = () => {
        if (!scannedProduct || !destinationWarehouse || newQuantity === null || newQuantity <= 0) {
            toast.error("Please complete all required fields")
            return
        }

        toast.success(`Transferring ${newQuantity} units of ${scannedProduct.name} to ${destinationWarehouse}`)

        setTimeout(() => {
            handleClear()
        }, 1500)
    }

    // Change scan mode
    const changeScanMode = (mode: "lookup" | "stocktake" | "transfer") => {
        setScanMode(mode)
        // Reset product and form when changing modes
        handleClear()
    }

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)}>
                <QrCode className="mr-2 h-4 w-4" />
                Scan Inventory
            </Button>

            <Sheet open={scannerOpen} onOpenChange={setScannerOpen}>
                <SheetContent side="right" className="sm:max-w-md p-0 flex flex-col">
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            Inventory Scanner
                        </SheetTitle>
                    </SheetHeader>

                    <div className="p-4 flex-1 overflow-auto">
                        <div className="space-y-4">
                            <div className="flex gap-2 w-full">
                                {[
                                    { mode: "lookup", icon: <FileText className="h-4 w-4" /> },
                                    { mode: "stocktake", icon: <ClipboardList className="h-4 w-4" /> },
                                    { mode: "transfer", icon: <ArrowLeftRight className="h-4 w-4" /> }
                                ].map((item) => (
                                    <Button
                                        key={item.mode}
                                        variant={scanMode === item.mode ? "default" : "outline"}
                                        size="sm"
                                        className="flex-1 capitalize"
                                        onClick={() => changeScanMode(item.mode as "lookup" | "stocktake" | "transfer")}
                                    >
                                        {item.icon}
                                        <span className="ml-2">{item.mode}</span>
                                    </Button>
                                ))}
                            </div>

                            <Alert>
                                <AlertTitle>
                                    {scanMode === "lookup" && "Inventory Lookup Mode"}
                                    {scanMode === "stocktake" && "Stock Take Mode"}
                                    {scanMode === "transfer" && "Stock Transfer Mode"}
                                </AlertTitle>
                                <AlertDescription>
                                    {scanMode === "lookup" && "Scan barcodes to view detailed product information"}
                                    {scanMode === "stocktake" && "Update physical inventory counts by scanning products"}
                                    {scanMode === "transfer" && "Move stock between warehouses by scanning products"}
                                </AlertDescription>
                            </Alert>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                    <p className="text-muted-foreground">Looking up product...</p>
                                </div>
                            ) : scannedProduct ? (
                                <div className="space-y-4">
                                    {/* Product Card */}
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between">
                                                <CardTitle>{scannedProduct.name}</CardTitle>
                                                {getStockStatusBadge(scannedProduct.stockStatus)}
                                            </div>
                                            <CardDescription>{scannedProduct.id} | {scannedProduct.sku}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                                <div>
                                                    <p className="text-muted-foreground">Current Stock</p>
                                                    <p className="font-medium">{scannedProduct.stock} units</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Warehouse</p>
                                                    <p className="font-medium">{scannedProduct.warehouse}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Category</p>
                                                    <p className="font-medium">{scannedProduct.category}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Reorder Level</p>
                                                    <p className="font-medium">{scannedProduct.reorderLevel} units</p>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span>Stock Level</span>
                                                    <span>{scannedProduct.stock} of {scannedProduct.reorderLevel * 2} target</span>
                                                </div>
                                                <Progress value={getStockPercentage(scannedProduct.stock, scannedProduct.reorderLevel)} className="h-1.5" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Mode-specific forms */}
                                    {scanMode === "lookup" && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Detailed Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-sm">
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                        <div>
                                                            <p className="text-muted-foreground">Packaging</p>
                                                            <p>{scannedProduct.packaging}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground">Supplier</p>
                                                            <p>{scannedProduct.supplierName}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground">Batch Number</p>
                                                            <p>{scannedProduct.batchNumber}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground">Expiry Date</p>
                                                            <p>{scannedProduct.expiryDate}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground">Last Updated</p>
                                                            <p>{scannedProduct.lastUpdated}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground">Optimal Temp</p>
                                                            <p>{scannedProduct.optimalTemp}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground">Cost Price</p>
                                                            <p>KES {scannedProduct.costPrice.toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground">Retail Price</p>
                                                            <p>KES {scannedProduct.retailPrice.toLocaleString()}</p>
                                                        </div>
                                                    </div>

                                                    <Separator />

                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1">
                                                            <p className="text-muted-foreground">Excise Duty</p>
                                                            <p>{scannedProduct.exciseDuty}</p>
                                                        </div>
                                                        <Badge variant={scannedProduct.krabSticker ? "default" : "destructive"}>
                                                            {scannedProduct.krabSticker ? "KRA Compliant" : "Non-Compliant"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button variant="outline" size="sm" className="w-full" onClick={handleClear}>
                                                    Clear
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    )}

                                    {scanMode === "stocktake" && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Update Stock Count</CardTitle>
                                                <CardDescription>Adjust stock level after physical count</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="current-quantity">Current Quantity</Label>
                                                            <Input
                                                                id="current-quantity"
                                                                type="number"
                                                                value={scannedProduct.stock}
                                                                disabled
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="new-quantity">New Quantity</Label>
                                                            <Input
                                                                id="new-quantity"
                                                                type="number"
                                                                value={newQuantity === null ? "" : newQuantity}
                                                                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="stock-notes">Notes</Label>
                                                        <Input
                                                            id="stock-notes"
                                                            placeholder="Optional notes about this adjustment"
                                                            value={notes}
                                                            onChange={(e) => setNotes(e.target.value)}
                                                        />
                                                    </div>

                                                    {newQuantity !== null && newQuantity !== scannedProduct.stock && (
                                                        <Alert className={newQuantity > scannedProduct.stock ? "bg-green-500/10" : "bg-amber-500/10"}>
                                                            <AlertTitle>Stock Change</AlertTitle>
                                                            <AlertDescription>
                                                                {newQuantity > scannedProduct.stock ? (
                                                                    <>Adding {newQuantity - scannedProduct.stock} units</>
                                                                ) : (
                                                                    <>Removing {scannedProduct.stock - newQuantity} units</>
                                                                )}
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex justify-between">
                                                <Button variant="outline" size="sm" onClick={handleClear}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleUpdateStock}
                                                    disabled={newQuantity === null || newQuantity === scannedProduct.stock}
                                                >
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Update Stock
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    )}

                                    {scanMode === "transfer" && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Stock Transfer</CardTitle>
                                                <CardDescription>Move stock to another warehouse</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="source-warehouse">Source Warehouse</Label>
                                                        <Input
                                                            id="source-warehouse"
                                                            value={scannedProduct.warehouse}
                                                            disabled
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="destination-warehouse">Destination Warehouse</Label>
                                                        <select
                                                            id="destination-warehouse"
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            value={destinationWarehouse || ""}
                                                            onChange={(e) => setDestinationWarehouse(e.target.value)}
                                                        >
                                                            <option value="">Select Warehouse</option>
                                                            {["Nairobi Central", "Mombasa", "Thika", "Kisumu"].filter(w => w !== scannedProduct.warehouse).map((warehouse) => (
                                                                <option key={warehouse} value={warehouse}>{warehouse}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="transfer-quantity">Transfer Quantity</Label>
                                                        <Input
                                                            id="transfer-quantity"
                                                            type="number"
                                                            min="1"
                                                            max={scannedProduct.stock}
                                                            value={newQuantity === null ? "" : newQuantity}
                                                            onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                                                        />
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Maximum: {scannedProduct.stock} units
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="transfer-notes">Notes</Label>
                                                        <Input
                                                            id="transfer-notes"
                                                            placeholder="Optional notes about this transfer"
                                                            value={notes}
                                                            onChange={(e) => setNotes(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex justify-between">
                                                <Button variant="outline" size="sm" onClick={handleClear}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleTransferStock}
                                                    disabled={
                                                        !destinationWarehouse ||
                                                        newQuantity === null ||
                                                        newQuantity <= 0 ||
                                                        newQuantity > scannedProduct.stock
                                                    }
                                                >
                                                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                                                    Transfer Stock
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="bg-muted rounded-full p-3 mb-4">
                                        <QrCode className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium mb-2">No Product Scanned</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Click the button below to scan a barcode
                                    </p>
                                    <BarcodeScanner
                                        onDetected={handleBarcodeDetected}
                                        onError={handleScannerError}
                                        readers={["code_128_reader", "ean_reader", "ean_8_reader"]}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {scannedProduct && (
                        <SheetFooter className="p-4 border-t">
                            <Button variant="outline" className="w-full" onClick={() => {
                                handleClear()
                                setScannerOpen(false)
                            }}>
                                Close
                            </Button>
                        </SheetFooter>
                    )}
                </SheetContent>
            </Sheet>
        </>
    )
}