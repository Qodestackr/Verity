"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, FileText, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Stepper, Step } from "@/components/ui/stepper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const mockParsePDF = async (file: File): Promise<any[]> => {
    // PDF parsing lib
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock extracted transactions
            resolve([
                {
                    date: "2025-04-20",
                    description: "PAYMENT FROM ABC DISTRIBUTORS",
                    amount: "45,000.00",
                    type: "CREDIT",
                    reference: "REF123456",
                },
                {
                    date: "2025-04-19",
                    description: "OFFICE RENT PAYMENT",
                    amount: "35,000.00",
                    type: "DEBIT",
                    reference: "REF789012",
                },
                {
                    date: "2025-04-18",
                    description: "UTILITY BILL - ELECTRICITY",
                    amount: "12,000.00",
                    type: "DEBIT",
                    reference: "REF345678",
                },
                {
                    date: "2025-04-17",
                    description: "PAYMENT FROM XYZ COMPANY",
                    amount: "28,500.00",
                    type: "CREDIT",
                    reference: "REF901234",
                },
                {
                    date: "2025-04-16",
                    description: "OFFICE SUPPLIES PURCHASE",
                    amount: "5,000.00",
                    type: "DEBIT",
                    reference: "REF567890",
                },
            ])
        }, 2000)
    })
}

export function PDFImporter() {

    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [file, setFile] = useState<File | null>(null)
    const [extractedData, setExtractedData] = useState<any[] | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [processingProgress, setProcessingProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null)
        const selectedFile = e.target.files?.[0]

        if (!selectedFile) return

        if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
            setError("Please select a PDF file")
            return
        }

        setFile(selectedFile)
        setCurrentStep(1)
        setIsProcessing(true)

        // Sim progress updates
        const progressInterval = setInterval(() => {
            setProcessingProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval)
                    return 90
                }
                return prev + 10
            })
        }, 200)

        try {
            // send file to a server for processing
            const extractedTransactions = await mockParsePDF(selectedFile)
            setExtractedData(extractedTransactions)
            setProcessingProgress(100)

            setTimeout(() => {
                setIsProcessing(false)
                setCurrentStep(2)
            }, 500)
        } catch (err) {
            setError("Failed to extract data from PDF. Please try a different file or use CSV import.")
            setIsProcessing(false)
            console.error(err)
        } finally {
            clearInterval(progressInterval)
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0]

            if (!droppedFile.name.toLowerCase().endsWith(".pdf")) {
                setError("Please select a PDF file")
                return
            }

            // Trigger the same handling as file input
            const dataTransfer = new DataTransfer()
            dataTransfer.items.add(droppedFile)

            if (fileInputRef.current) {
                fileInputRef.current.files = dataTransfer.files
                const event = new Event("change", { bubbles: true })
                fileInputRef.current.dispatchEvent(event)
            }
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleImport = () => {
        setIsProcessing(true)
        setTimeout(() => {
            setIsProcessing(false)
            setCurrentStep(3)
        }, 1500)
    }

    const handleFinish = () => {
        router.push("/accounting/reconciliation")
    }

    return (
        <div className="space-y-6">
            <Stepper currentStep={currentStep} className="mb-8">
                <Step title="Upload PDF" description="Select your bank statement" />
                <Step title="Extract Data" description="Process the PDF content" />
                <Step title="Review" description="Verify transaction data" />
                <Step title="Complete" description="Import successful" />
            </Stepper>

            {currentStep === 0 && (
                <div
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center space-y-4",
                        error ? "border-red-300 bg-red-50" : "border-muted-foreground/25 hover:border-muted-foreground/50",
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
                    <div>
                        <h3 className="font-medium text-lg">Upload PDF Bank Statement</h3>
                        <p className="text-sm text-muted-foreground mb-4">Drag and drop your PDF file here, or click to browse</p>

                        {error && (
                            <div className="text-red-500 text-sm mb-4 flex items-center justify-center">
                                <X className="h-4 w-4 mr-1" />
                                {error}
                            </div>
                        )}

                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="pdf-upload"
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="h-4 w-4 mr-2" />
                            Select PDF File
                        </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">Supported formats: PDF statements from major Kenyan banks</div>

                    <Alert className="mt-6 bg-amber-50 text-amber-800 border-amber-200">
                        <AlertTitle className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            PDF Import Note
                        </AlertTitle>
                        <AlertDescription className="text-sm">
                            PDF extraction is experimental and may not work with all bank statement formats. For best results, use CSV
                            import if available from your bank.
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {currentStep === 1 && (
                <div className="space-y-6 py-8 text-center">
                    <div className="space-y-4">
                        <h3 className="font-medium">Processing PDF Statement</h3>
                        <p className="text-sm text-muted-foreground">
                            Extracting transaction data from your PDF statement. This may take a moment...
                        </p>

                        <div className="space-y-2 max-w-md mx-auto">
                            <Progress value={processingProgress} className="h-2" />
                            <div className="text-xs text-right text-muted-foreground">{processingProgress}% complete</div>
                        </div>

                        <div className="text-sm">
                            {processingProgress < 30 && "Analyzing PDF structure..."}
                            {processingProgress >= 30 && processingProgress < 60 && "Identifying transaction tables..."}
                            {processingProgress >= 60 && processingProgress < 90 && "Extracting transaction data..."}
                            {processingProgress >= 90 && "Finalizing import..."}
                        </div>
                    </div>
                </div>
            )}

            {currentStep === 2 && extractedData && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-medium">Review Extracted Transactions</h3>
                        <p className="text-sm text-muted-foreground">
                            We've extracted {extractedData.length} transactions from your PDF statement. Please review before
                            importing.
                        </p>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Reference</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {extractedData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{row.description}</TableCell>
                                        <TableCell>{row.amount}</TableCell>
                                        <TableCell>{row.type}</TableCell>
                                        <TableCell>{row.reference || "N/A"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={() => setCurrentStep(0)}>
                            Back
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={isProcessing}
                            className="bg-green-700 hover:bg-green-800 text-white"
                        >
                            {isProcessing ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    Import {extractedData.length} Transactions
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-6 text-center py-8">
                    <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto flex items-center justify-center">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium text-xl">Import Successful!</h3>
                        <p className="text-muted-foreground">
                            {extractedData?.length} transactions have been successfully imported.
                        </p>
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleFinish} className="bg-green-700 hover:bg-green-800 text-white">
                            Go to Reconciliation
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
