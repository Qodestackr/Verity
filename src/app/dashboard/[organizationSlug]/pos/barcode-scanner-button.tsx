"use client"

import { useState } from "react"
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QrCode } from "lucide-react"
import { toast } from "sonner"
import BarcodeScanner from "@/components/core/scanner/barcode-snanner"

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    stock: number;
}

interface BarcodeScannerButtonProps {
    onProductFound?: (product: Product) => void;
}

export const BarcodeScannerButton: React.FC<BarcodeScannerButtonProps> = ({
    onProductFound
}) => {
    const [scannerOpen, setScannerOpen] = useState<boolean>(false)

    const handleBarcodeDetected = (result: any) => {
        if (!result || !result.codeResult) return

        const barcode = result.codeResult.code
        const format = result.codeResult.format

        console.log(`Detected ${format} barcode: ${barcode}`)

        // search your inventory for the product
        // sim finding a product
        const mockProduct = findProductByBarcode(barcode)

        if (mockProduct) {
            // Play a success sound or show a notification
            toast.success(`Found: ${mockProduct.name}`)

            // Pass the product to the parent component
            if (onProductFound) {
                onProductFound(mockProduct)
            }

            // Close the scanner
            setScannerOpen(false)
        } else {
            toast.error(`Product not found for barcode: ${barcode}`)
        }
    }

    // Mock function to find a product by barcode
    //query your DB or API
    const findProductByBarcode = (barcode: string): Product | undefined => {
        // with inventory system
        // For demonstration, we'll use a simple mock lookup
        const mockProducts: Record<string, Product> = {
            "5901234123457": {
                id: "1",
                name: "Tusker Lager",
                price: 250,
                category: "Beer",
                image: "/guiness-defaultimg.webp",
                stock: 48
            },
            "9781234567897": {
                id: "12",
                name: "Guinness",
                price: 300,
                category: "Beer",
                image: "/guiness-defaultimg.webp",
                stock: 30
            },
            "1234567890128": {
                id: "2",
                name: "Johnnie Walker Black",
                price: 3500,
                category: "Whisky",
                image: "/guiness-defaultimg.webp",
                stock: 12
            }
        }

        return mockProducts[barcode]
    }

    const handleScannerError = (error: any) => {
        console.error("Scanner error:", error)
        toast.error("Failed to initialize camera. Please check permissions.")
    }

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)}>
                <QrCode className="mr-2 h-4 w-4" />
                Scan Barcode
            </Button>

            <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
                <DialogContent className="max-w-2xl p-0">
                    <DialogHeader className="p-2 pb-0">
                        <DialogTitle className="text-sm font-light">Scan Product Barcode</DialogTitle>
                    </DialogHeader>

                    <div className="p-4 pt-0">
                        <BarcodeScanner
                            onDetected={handleBarcodeDetected}
                            onError={handleScannerError}
                            onScannerClose={() => setScannerOpen(false)}
                            readers={[
                                "code_128_reader",
                                "ean_reader",
                                "ean_8_reader",
                                "code_39_reader"
                            ]}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default BarcodeScannerButton