"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, FileSpreadsheet, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Stepper, Step } from "@/components/ui/stepper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

const parseCSV = (content: string) => {
    const lines = content.split("\n")
    const headers = lines[0].split(",").map((header) => header.trim().replace(/"/g, ""))

    const rows = lines
        .slice(1)
        .map((line) => {
            const values = line.split(",").map((value) => value.trim().replace(/"/g, ""))
            return headers.reduce(
                (obj, header, i) => {
                    obj[header] = values[i] || ""
                    return obj
                },
                {} as Record<string, string>,
            )
        })
        .filter((row) => Object.values(row).some((val) => val))

    return { headers, rows }
}

export function CSVImporter() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [file, setFile] = useState<File | null>(null)
    const [csvData, setCsvData] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null)
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const requiredFields = ["date", "description", "amount", "type"]

    const targetFields = [
        { id: "date", label: "Transaction Date" },
        { id: "description", label: "Description" },
        { id: "amount", label: "Amount" },
        { id: "type", label: "Transaction Type" },
        { id: "reference", label: "Reference Number" },
        { id: "category", label: "Category" },
    ]

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null)
        const selectedFile = e.target.files?.[0]

        if (!selectedFile) return

        if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
            setError("Please select a CSV file")
            return
        }

        setFile(selectedFile)

        // Read the file content
        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string
                const parsed = parseCSV(content)
                setCsvData(parsed)

                // Try to auto-map columns based on common header names
                const autoMapping: Record<string, string> = {}
                parsed.headers.forEach((header) => {
                    const headerLower = header.toLowerCase()

                    if (headerLower.includes("date")) autoMapping[header] = "date"
                    else if (headerLower.includes("desc")) autoMapping[header] = "description"
                    else if (headerLower.includes("amount") || headerLower.includes("sum")) autoMapping[header] = "amount"
                    else if (headerLower.includes("type") || headerLower.includes("dr") || headerLower.includes("cr"))
                        autoMapping[header] = "type"
                    else if (headerLower.includes("ref")) autoMapping[header] = "reference"
                    else if (headerLower.includes("cat")) autoMapping[header] = "category"
                })

                setColumnMapping(autoMapping)
                setCurrentStep(1)
            } catch (err) {
                setError("Failed to parse CSV file. Please check the format.")
                console.error(err)
            }
        }
        reader.readAsText(selectedFile)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0]

            if (!droppedFile.name.toLowerCase().endsWith(".csv")) {
                setError("Please select a CSV file")
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

    const handleColumnMappingChange = (csvHeader: string, targetField: string) => {
        setColumnMapping({
            ...columnMapping,
            [csvHeader]: targetField,
        })
    }

    const isReadyToPreview = () => {
        return requiredFields.every((field) => Object.values(columnMapping).includes(field))
    }

    const handlePreview = () => {
        if (isReadyToPreview()) {
            setCurrentStep(2)
        }
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

    const transformedData = csvData?.rows
        .map((row) => {
            const transformed: Record<string, any> = {}

            Object.entries(columnMapping).forEach(([csvHeader, targetField]) => {
                transformed[targetField] = row[csvHeader]
            })

            return transformed
        })
        .slice(0, 5) // Just show first 5 rows in preview

    return (
        <div className="space-y-6">
            <Stepper currentStep={currentStep} className="mb-8">
                <Step title="Upload CSV" description="Select your bank statement" />
                <Step title="Map Columns" description="Match CSV columns to fields" />
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
                    <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground" />
                    <div>
                        <h3 className="font-medium text-lg">Upload CSV Bank Statement</h3>
                        <p className="text-sm text-muted-foreground mb-4">Drag and drop your CSV file here, or click to browse</p>

                        {error && (
                            <div className="text-red-500 text-sm mb-4 flex items-center justify-center">
                                <X className="h-4 w-4 mr-1" />
                                {error}
                            </div>
                        )}

                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="csv-upload"
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="h-4 w-4 mr-2" />
                            Select CSV File
                        </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">Supported formats: CSV files from major Kenyan banks</div>
                </div>
            )}

            {currentStep === 1 && csvData && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-medium">Map CSV Columns</h3>
                        <p className="text-sm text-muted-foreground">
                            Match the columns from your CSV file to our system fields. Required fields are marked with an asterisk
                            (*).
                        </p>
                    </div>

                    <div className="space-y-4">
                        {csvData.headers.map((header) => (
                            <div key={header} className="grid grid-cols-2 gap-4 items-center">
                                <div>
                                    <Label>{header}</Label>
                                    <div className="text-xs text-muted-foreground mt-1">Sample: {csvData.rows[0]?.[header] || "N/A"}</div>
                                </div>
                                <Select
                                    value={columnMapping[header] || ""}
                                    onValueChange={(value) => handleColumnMappingChange(header, value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select field" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Do not import --</SelectItem>
                                        {targetFields.map((field) => (
                                            <SelectItem key={field.id} value={field.id}>
                                                {field.label} {requiredFields.includes(field.id) ? "*" : ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={() => setCurrentStep(0)}>
                            Back
                        </Button>
                        <Button
                            onClick={handlePreview}
                            disabled={!isReadyToPreview()}
                            className="bg-green-700 hover:bg-green-800 text-white"
                        >
                            Preview Data
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {currentStep === 2 && transformedData && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-medium">Review Transactions</h3>
                        <p className="text-sm text-muted-foreground">
                            Review the first 5 transactions before importing. A total of {csvData?.rows.length} transactions will be
                            imported.
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
                                {transformedData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.date || "N/A"}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{row.description || "N/A"}</TableCell>
                                        <TableCell>{row.amount || "N/A"}</TableCell>
                                        <TableCell>{row.type || "N/A"}</TableCell>
                                        <TableCell>{row.reference || "N/A"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={() => setCurrentStep(1)}>
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
                                    Import {csvData?.rows.length} Transactions
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
                            {csvData?.rows.length} transactions have been successfully imported.
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