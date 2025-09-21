"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import {
    Upload,
    FileSpreadsheet,
    Users,
    Mail,
    Check,
    AlertCircle,
    Download,
    RefreshCw,
    CheckCircle,
    ChevronRight,
    Trash2,
    PenLine,
    UserPlus,
    List,
    Copy,
    Info,
    ChevronLeft,
    HelpCircle
} from "lucide-react"


import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

// Animation variants
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 10 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
        },
    },
}

// Mock customer data that would be imported from CSV
const mockImportedCustomers = [
    { id: "c1", name: "Kalahari Lounge", email: "purchasing@kalahari.co.ke", phone: "+254712345678", type: "Retailer", status: "new" },
    { id: "c2", name: "Brew Masters Ltd", email: "orders@brewmasters.co.ke", phone: "+254723456789", type: "Wholesaler", status: "new" },
    { id: "c3", name: "Highlands Distributors", email: "supply@highlands.co.ke", phone: "+254734567890", type: "Distributor", status: "existing" },
    { id: "c4", name: "Safari Club", email: "inventory@safariclub.co.ke", phone: "+254745678901", type: "Retailer", status: "new" },
    { id: "c5", name: "Downtown Spirits", email: "purchasing@downtownspirits.co.ke", phone: "+254756789012", type: "Retailer", status: "invalid", error: "Email domain doesn't exist" },
    { id: "c6", name: "Kenya Beverages", email: "orders@kenyabev.co.ke", phone: "+254767890123", type: "Wholesaler", status: "new" },
    { id: "c7", name: "Capital Distributors", email: "supply@capitaldist.co.ke", phone: "+254778901234", type: "Distributor", status: "existing" },
]

// Sample template structure
const templateStructure = [
    { field: "name", description: "Customer business name", required: true, example: "Kalahari Lounge" },
    { field: "email", description: "Primary contact email", required: true, example: "purchasing@kalahari.co.ke" },
    { field: "phone", description: "Contact phone number", required: false, example: "+254712345678" },
    { field: "type", description: "(Retailer, Wholesaler, Distributor)", required: true, example: "Retailer" },
    { field: "address", description: "Physical address", required: false, example: "123 Main St, Nairobi" },
    { field: "license", description: "Business license number", required: false, example: "BL-12345" },
]

export default function CustomerImportPage() {
    const [currentTab, setCurrentTab] = useState("upload")
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadStatus, setUploadStatus] = useState("idle") // idle, uploading, validating, completed, error
    const [selectedFile, setSelectedFile] = useState(null)
    const [importedData, setImportedData] = useState([])
    const [selectedCustomers, setSelectedCustomers] = useState({})
    const [inviteStatus, setInviteStatus] = useState({}) // Tracks sending status
    const [emailSubject, setEmailSubject] = useState("Join Alcorabooks - Your Invitation from [Your Company]")
    const [emailTemplate, setEmailTemplate] = useState(
        "Hello,\n\nWe're inviting you to join Alcorabooks, the platform we're now using to manage our liquor distribution operations. Using this platform will make ordering, inventory tracking, and payments much smoother for both of us.\n\nTo get started, simply click the link below:\n\n[INVITE_LINK]\n\nIf you have any questions, please don't hesitate to contact us.\n\nRegards,\n[Your Company]"
    )
    const [isDragging, setIsDragging] = useState(false)

    const fileInputRef = useRef(null)
    const textareaRef = useRef(null)

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [emailTemplate])

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            setUploadStatus("uploading")

            // Sim upload progress
            let progress = 0
            const interval = setInterval(() => {
                progress += 5
                setUploadProgress(progress)

                if (progress >= 100) {
                    clearInterval(interval)
                    setUploadStatus("validating")

                    // Sim validation delay
                    setTimeout(() => {
                        // Sim validation results
                        setImportedData(mockImportedCustomers)
                        setUploadStatus("completed")

                        // Pre-select all valid customers
                        const initialSelection = {}
                        mockImportedCustomers.forEach(customer => {
                            if (customer.status !== "invalid" && customer.status !== "existing") {
                                initialSelection[customer.id] = true
                            }
                        })
                        setSelectedCustomers(initialSelection)

                        // Move to review tab
                        setCurrentTab("review")
                    }, 1500)
                }
            }, 100)
        }
    }

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault()
        if (!isDragging) setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && (file.type === "text/csv" || file.name.endsWith(".csv") || file.type.includes("spreadsheet") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
            setSelectedFile(file)
            if (fileInputRef.current) {
                // This is needed to make the file input's onChange handler work with dropped files
                const dataTransfer = new DataTransfer()
                dataTransfer.items.add(file)
                fileInputRef.current.files = dataTransfer.files
                handleFileSelect({ target: { files: [file] } })
            }
        } else {
            toast.error("Please upload a CSV or Excel file")
        }
    }

    // Toggle customer selection
    const toggleCustomer = (customerId) => {
        setSelectedCustomers(prev => ({
            ...prev,
            [customerId]: !prev[customerId]
        }))
    }

    // Toggle all customers
    const toggleAllCustomers = () => {
        const validCustomers = importedData.filter(c => c.status !== "invalid" && c.status !== "existing")

        // Check if all valid customers are selected
        const allSelected = validCustomers.every(c => selectedCustomers[c.id])

        // Toggle accordingly
        const newSelection = {}
        importedData.forEach(customer => {
            if (customer.status !== "invalid" && customer.status !== "existing") {
                newSelection[customer.id] = !allSelected
            }
        })

        setSelectedCustomers(newSelection)
    }

    // Download template
    const downloadTemplate = () => {
        const templateContent = "name,email,phone,type,address,license\nKalahari Lounge,purchasing@kalahari.co.ke,+254712345678,Retailer,123 Main St Nairobi,BL-12345\nBrew Masters Ltd,orders@brewmasters.co.ke,+254723456789,Wholesaler,456 Commerce Ave Mombasa,BL-67890"

        const blob = new Blob([templateContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'Alcorabooks_customer_import_template.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success("Template downloaded successfully")
    }

    // Send invitations
    const sendInvitations = () => {
        const selectedIds = Object.keys(selectedCustomers).filter(id => selectedCustomers[id])

        if (selectedIds.length === 0) {
            toast.error("Please select at least one customer to invite")
            return
        }

        // Reset invite status
        setInviteStatus({})

        // Sim sending invitations
        selectedIds.forEach((id, index) => {
            // Set status to sending
            setInviteStatus(prev => ({ ...prev, [id]: "sending" }))

            // Sim delay and success/failure
            setTimeout(() => {
                const success = Math.random() > 0.1 // 90% success rate
                setInviteStatus(prev => ({
                    ...prev,
                    [id]: success ? "sent" : "error"
                }))

                // Show toast after all invitations processed
                if (index === selectedIds.length - 1) {
                    const errorCount = Object.values(inviteStatus).filter(status => status === "error").length

                    if (errorCount === 0) {
                        toast.success(`Successfully sent ${selectedIds.length} invitations`)
                    } else {
                        toast.warning(`Sent ${selectedIds.length - errorCount} invitations, ${errorCount} failed`)
                    }
                }
            }, 500 + (index * 300)) // Stagger the sending
        })
    }

    // Reset the import process
    const resetImport = () => {
        setSelectedFile(null)
        setUploadProgress(0)
        setUploadStatus("idle")
        setImportedData([])
        setSelectedCustomers({})
        setInviteStatus({})
        setCurrentTab("upload")

        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-3 py-2">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Invite Customers</h1>
                    <p className="text-muted-foreground">
                        Import your customer list and invite them to join Alcorabooks
                    </p>
                </div>

                <div className="mt-4 md:mt-0 flex items-center space-x-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button className="h-8 text-xs" variant="outline" size="sm" onClick={resetImport}>
                                    <RefreshCw className="mr-1 h-4 w-4" />
                                    Reset
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Start over with a new import
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="h-8 text-xs" variant="outline" size="sm">
                                <UserPlus className="mr-1 h-4 w-4" />
                                Add Single Customer
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Customer</DialogTitle>
                                <DialogDescription>
                                    Enter customer details to add them individually
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-2 py-1">
                                <div className="grid gap-1">
                                    <label htmlFor="name" className="text-sm font-medium">Business Name</label>
                                    <Input id="name" placeholder="Enter business name" />
                                </div>
                                <div className="grid gap-1">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <Input id="email" type="email" placeholder="contact@business.com" />
                                </div>
                                <div className="grid gap-1">
                                    <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                                    <Input id="phone" placeholder="+254712345678" />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="type" className="text-sm font-medium">Customer Type</label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select customer type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="retailer">Retailer</SelectItem>
                                            <SelectItem value="wholesaler">Wholesaler</SelectItem>
                                            <SelectItem value="distributor">Distributor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button>Add & Invite</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="mb-2 inline-flex h-12 items-center justify-start bg-muted p-1 text-muted-foreground w-full rounded-md">
                    <TabsTrigger
                        value="upload"
                        className="relative rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center"
                    >
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-background border mr-2 text-xs font-semibold">1</span>
                        Upload Customers
                    </TabsTrigger>
                    <TabsTrigger
                        value="review"
                        disabled={uploadStatus !== "completed"}
                        className="relative rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center"
                    >
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-background border mr-2 text-xs font-semibold">2</span>
                        Review & Select
                    </TabsTrigger>
                    <TabsTrigger
                        value="invite"
                        disabled={uploadStatus !== "completed"}
                        className="relative rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center"
                    >
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-background border mr-2 text-xs font-semibold">3</span>
                        Send Invitations
                    </TabsTrigger>
                </TabsList>

                {/* Upload Tab */}
                <TabsContent value="upload">
                    <div className="grid gap-3 md:grid-cols-2">
                        <Card className="border-2 border-solid">
                            <CardHeader>
                                <CardTitle className="text-xl">Upload Customer List</CardTitle>
                                <CardDescription>
                                    Import your customers from a CSV or Excel file
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-2 text-center transition-all duration-200 ${uploadStatus === 'idle' ? 'border-muted-foreground/25 hover:border-muted-foreground/50' : ''} ${isDragging ? 'border-primary/70 bg-primary/5' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    {uploadStatus === 'idle' ? (
                                        <motion.div
                                            className="flex flex-col items-center"
                                            initial="hidden"
                                            animate="show"
                                            variants={container}
                                        >
                                            <motion.div
                                                variants={item}
                                                className="p-2 bg-muted rounded-full mb-2"
                                            >
                                                <Upload className="h-6 w-6 text-muted-foreground" />
                                            </motion.div>
                                            <motion.h3
                                                variants={item}
                                                className="text-md mb-1"
                                            >
                                                Drag & drop your file or click to browse
                                            </motion.h3>
                                            <motion.p
                                                variants={item}
                                                className="text-sm text-muted-foreground mb-2"
                                            >
                                                Supported formats: CSV, Excel (xlsx, xls)
                                            </motion.p>
                                            <Input
                                                type="file"
                                                ref={fileInputRef}
                                                accept=".csv,.xlsx,.xls"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                id="file-upload"
                                            />
                                            <motion.div variants={item}>
                                                <Button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    size='sm'
                                                    className="h-8 text-xs transition-all hover:shadow-md"
                                                >
                                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                                    Select File
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-full mb-2">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-medium">{selectedFile?.name}</span>
                                                    <span className="text-muted-foreground">{uploadProgress}%</span>
                                                </div>
                                                <Progress value={uploadProgress} className="h-1 w-full" />
                                            </div>

                                            <div className="flex items-center justify-center h-10">
                                                {uploadStatus === 'uploading' && (
                                                    <p className="text-sm flex items-center">
                                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                        Uploading file...
                                                    </p>
                                                )}

                                                {uploadStatus === 'validating' && (
                                                    <p className="text-sm flex items-center">
                                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                        Validating data...
                                                    </p>
                                                )}

                                                {uploadStatus === 'completed' && (
                                                    <p className="text-sm flex items-center text-green-600 dark:text-green-400">
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        File processed successfully!
                                                    </p>
                                                )}

                                                {uploadStatus === 'error' && (
                                                    <p className="text-sm flex items-center text-red-600 dark:text-red-400">
                                                        <AlertCircle className="mr-2 h-4 w-4" />
                                                        Error processing file. Please try again.
                                                    </p>
                                                )}
                                            </div>

                                            {uploadStatus === 'completed' && (
                                                <Button
                                                    className="mt-4"
                                                    onClick={() => setCurrentTab('review')}
                                                >
                                                    Review Data
                                                    <ChevronRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            )}

                                            {uploadStatus === 'error' && (
                                                <Button
                                                    variant="outline"
                                                    className="mt-4"
                                                    onClick={resetImport}
                                                >
                                                    Try Again
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Template & Instructions</CardTitle>
                                <CardDescription>
                                    Follow these guidelines to prepare your import file
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div>
                                        <h4 className="font-medium mb-2">Required Format</h4>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Your file should include the following columns:
                                        </p>
                                        <ScrollArea className="h-68 w-full rounded-md border">
                                            <div className="p-3 mx-6">
                                                <Table className="text-xs">
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Field</TableHead>
                                                            <TableHead>Description</TableHead>
                                                            <TableHead className="text-right">Required</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {templateStructure.map((field) => (
                                                            <TableRow key={field.field}>
                                                                <TableCell className="font-medium">{field.field}</TableCell>
                                                                <TableCell>{field.description}</TableCell>
                                                                <TableCell className="text-right">
                                                                    {field.required ?
                                                                        <Badge variant="default">Yes</Badge> :
                                                                        <Badge variant="outline">No</Badge>
                                                                    }
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2 flex items-center">
                                            Download Template
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Use this template to properly format your customer data
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </h4>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Use our template to ensure your data is formatted correctly:
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={downloadTemplate}
                                            className="hover:shadow-sm transition-all"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download CSV Template
                                        </Button>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md border border-blue-200 dark:border-blue-900">
                                        <h5 className="flex items-center font-medium mb-1 text-blue-800 dark:text-blue-300">
                                            <Info className="h-4 w-4 mr-2" />
                                            Pro Tips
                                        </h5>
                                        <ul className="text-xs space-y-1 text-blue-800 dark:text-blue-300">
                                            <li>• Ensure email addresses are valid and correctly formatted</li>
                                            <li>• Customer types must be "Retailer", "Wholesaler", or "Distributor"</li>
                                            <li>• Remove any duplicates before importing</li>
                                            <li>• Maximum 5000 customers per import</li>
                                            <li>• AI Agent coming soon: Auto-fix duplicates, formatting issues, and messy data without manual cleanup</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Review Tab */}
                <TabsContent value="review">
                    <Card className="border-2 border-solid">
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Review Customer Data</CardTitle>
                                    <CardDescription>
                                        Review and select the customers you want to invite
                                    </CardDescription>
                                </div>
                                <div className="mt-2 md:mt-0 space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={toggleAllCustomers}
                                    >
                                        <Check className="mr-1 h-4 w-4" />
                                        {importedData.filter(c => c.status !== "invalid" && c.status !== "existing").every(c => selectedCustomers[c.id])
                                            ? "Deselect All"
                                            : "Select All"}
                                    </Button>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    onClick={() => setCurrentTab('invite')}
                                                >
                                                    Continue to Invitations
                                                    <ChevronRight className="ml-1 h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Move to the next step with selected customers
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px] w-full rounded-md">
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-background z-10">
                                            <TableRow>
                                                <TableHead className="w-[50px]"></TableHead>
                                                <TableHead>Business Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {importedData.map((customer) => (
                                                <TableRow key={customer.id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedCustomers[customer.id] || false}
                                                            onCheckedChange={() => toggleCustomer(customer.id)}
                                                            disabled={customer.status === "invalid" || customer.status === "existing"}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{customer.name}</div>
                                                    </TableCell>
                                                    <TableCell>{customer.email}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                customer.type === "Retailer"
                                                                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900"
                                                                    : customer.type === "Wholesaler"
                                                                        ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-900"
                                                                        : "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900"
                                                            }
                                                        >
                                                            {customer.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {customer.status === "new" && (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900">
                                                                New
                                                            </Badge>
                                                        )}
                                                        {customer.status === "existing" && (
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900">
                                                                Already on platform
                                                            </Badge>
                                                        )}
                                                        {customer.status === "invalid" && (
                                                            <div className="flex items-center">
                                                                <Badge variant="destructive">
                                                                    Invalid
                                                                </Badge>
                                                                <span className="ml-2 text-xs text-muted-foreground">
                                                                    {customer.error}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-1">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="icon">
                                                                            <PenLine className="h-4 w-4" />
                                                                            <span className="sr-only">Edit</span>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        Edit customer
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="icon">
                                                                            <Trash2 className="h-4 w-4" />
                                                                            <span className="sr-only">Delete</span>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        Remove from import
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </ScrollArea>

                            <div className="mt-2 flex flex-col sm:flex-row sm:justify-between text-sm text-muted-foreground gap-2">
                                <div>
                                    Total: {importedData.length} customers
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900">
                                        {importedData.filter(c => c.status === "new").length} New
                                    </Badge>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900">
                                        {importedData.filter(c => c.status === "existing").length} Existing
                                    </Badge>
                                    <Badge variant="destructive">
                                        {importedData.filter(c => c.status === "invalid").length} Invalid
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/50 flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentTab('upload')}
                                className="flex items-center"
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                Back to Upload
                            </Button>
                            <Button
                                onClick={() => setCurrentTab('invite')}
                            >
                                Continue
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Invite Tab */}
                <TabsContent value="invite">
                    <div className="grid gap-3 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Customize Invitation</CardTitle>
                                <CardDescription>
                                    Personalize the email invitation that will be sent to your customers
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium">Email Subject</label>
                                        <Input
                                            id="subject"
                                            value={emailSubject}
                                            onChange={e => setEmailSubject(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label htmlFor="template" className="text-sm font-medium">Email Message</label>
                                        <ScrollArea className="h-[240px] w-full rounded-md border">
                                            <Textarea
                                                id="template"
                                                ref={textareaRef}
                                                value={emailTemplate}
                                                onChange={e => setEmailTemplate(e.target.value)}
                                                className="min-h-[240px] w-full rounded-md border-0 bg-transparent px-3 py-2 text-sm ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0"
                                                placeholder="Enter your invitation message"
                                            />
                                        </ScrollArea>
                                    </div>

                                    <div className="bg-muted p-2 rounded-md">
                                        <h4 className="text-sm font-medium mb-2">Available Variables:</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div className="flex items-center">
                                                <code className="text-xs bg-muted-foreground/20 p-1 rounded">[INVITE_LINK]</code>
                                                <span className="text-xs ml-2">Unique invitation link</span>
                                            </div>
                                            <div className="flex items-center">
                                                <code className="text-xs bg-muted-foreground/20 p-1 rounded">[CUSTOMER_NAME]</code>
                                                <span className="text-xs ml-2">Customer business name</span>
                                            </div>
                                            <div className="flex items-center">
                                                <code className="text-xs bg-muted-foreground/20 p-1 rounded">[YOUR_COMPANY]</code>
                                                <span className="text-xs ml-2">Your company name</span>
                                            </div>
                                            <div className="flex items-center">
                                                <code className="text-xs bg-muted-foreground/20 p-1 rounded">[EXPIRY_DATE]</code>
                                                <span className="text-xs ml-2">Invite expiration date</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <Button variant="outline" size="sm">
                                            <RefreshCw className="mr-1 h-4 w-4" />
                                            Reset to Default
                                        </Button>
                                        <Button size="sm">
                                            <Copy className="mr-1 h-4 w-4" />
                                            Preview
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-1 border-solid">
                            <CardHeader>
                                <CardTitle className="text-lg">Ready to Send</CardTitle>
                                <CardDescription>
                                    Review and send invitations to your selected customers
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="bg-muted rounded-md p-2">
                                        <h4 className="font-medium mb-2 flex items-center">
                                            <Users className="h-4 w-4 mr-2" />
                                            Selected Customers
                                        </h4>
                                        <div className="text-sm text-muted-foreground">
                                            {Object.keys(selectedCustomers).filter(id => selectedCustomers[id]).length} customers selected for invitation
                                        </div>

                                        <Separator className="my-3" />

                                        <ScrollArea className="h-[180px] w-full pr-4">
                                            <div className="space-y-2 pr-2">
                                                {importedData
                                                    .filter(customer => selectedCustomers[customer.id])
                                                    .map(customer => (
                                                        <motion.div
                                                            key={customer.id}
                                                            className="flex items-center justify-between text-sm bg-background p-2 rounded-md"
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <div className="flex items-center">
                                                                <Avatar className="h-6 w-6 mr-2">
                                                                    <AvatarFallback className="text-xs">
                                                                        {customer.name.substring(0, 2).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span>{customer.name}</span>
                                                            </div>
                                                            <Badge variant="outline" className="text-xs">
                                                                {customer.type}
                                                            </Badge>
                                                        </motion.div>
                                                    ))
                                                }

                                                {Object.keys(selectedCustomers).filter(id => selectedCustomers[id]).length === 0 && (
                                                    <div className="text-center py-2 text-sm text-muted-foreground">
                                                        No customers selected
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md border border-blue-200 dark:border-blue-900">
                                        <h4 className="flex items-center font-medium mb-2 text-blue-800 dark:text-blue-300">
                                            <Info className="h-4 w-4 mr-2" />
                                            What happens next?
                                        </h4>
                                        <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-300">
                                            <li>• Each customer will receive a personalized email invitation</li>
                                            <li>• You'll be notified when they join the platform</li>
                                            <li>• Invitations expire after 14 days</li>
                                            <li>• You can resend invitations if needed</li>
                                        </ul>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <Button
                                            size="lg"
                                            onClick={sendInvitations}
                                            disabled={Object.keys(selectedCustomers).filter(id => selectedCustomers[id]).length === 0}
                                            className="w-full flex items-center justify-center transition-all hover:shadow-md"
                                        >
                                            <Mail className="mr-2 h-5 w-5" />
                                            Send Invitations
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentTab('review')}
                                            className="w-full"
                                        >
                                            <ChevronLeft className="mr-1 h-4 w-4" />
                                            Back to Review
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sending Progress */}
                    {Object.keys(inviteStatus).length > 0 && (
                        <Card className="mt-3">
                            <CardHeader>
                                <CardTitle className="text-xl">Invitation Status</CardTitle>
                                <CardDescription>
                                    Real-time status of your invitation emails
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <div>
                                            <span className="font-medium">Sending invitations...</span>
                                        </div>
                                        <div>
                                            {Object.values(inviteStatus).filter(status => status === "sent").length} / {Object.keys(inviteStatus).length} completed
                                        </div>
                                    </div>

                                    <Progress
                                        value={(Object.values(inviteStatus).filter(status => status === "sent" || status === "error").length / Object.keys(inviteStatus).length) * 100}
                                        className="h-2"
                                    />

                                    <ScrollArea className="h-[300px] w-full rounded-md border">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-background z-10">
                                                <TableRow>
                                                    <TableHead>Business Name</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead className="text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {importedData
                                                    .filter(customer => selectedCustomers[customer.id])
                                                    .map(customer => (
                                                        <TableRow key={customer.id}>
                                                            <TableCell className="font-medium">{customer.name}</TableCell>
                                                            <TableCell>{customer.email}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">
                                                                    {customer.type}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {!inviteStatus[customer.id] && (
                                                                    <Badge variant="outline">
                                                                        Queued
                                                                    </Badge>
                                                                )}

                                                                {inviteStatus[customer.id] === "sending" && (
                                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900">
                                                                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                                                        Sending
                                                                    </Badge>
                                                                )}

                                                                {inviteStatus[customer.id] === "sent" && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ duration: 0.3 }}
                                                                    >
                                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900">
                                                                            <Check className="h-3 w-3 mr-1" />
                                                                            Sent
                                                                        </Badge>
                                                                    </motion.div>
                                                                )}

                                                                {inviteStatus[customer.id] === "error" && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ duration: 0.3 }}
                                                                    >
                                                                        <Badge variant="destructive">
                                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                                            Failed
                                                                        </Badge>
                                                                    </motion.div>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                }
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>

                                    {Object.values(inviteStatus).every(status => status === "sent" || status === "error") && (
                                        <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    // Reset invite status for failed ones
                                                    const newStatus = {};
                                                    Object.keys(inviteStatus).forEach(id => {
                                                        if (inviteStatus[id] === "error") {
                                                            newStatus[id] = null;
                                                        }
                                                    });
                                                    setInviteStatus(newStatus);
                                                }}
                                                disabled={!Object.values(inviteStatus).some(status => status === "error")}
                                            >
                                                <RefreshCw className="mr-1 h-4 w-4" />
                                                Retry Failed
                                            </Button>

                                            <Button
                                                onClick={resetImport}
                                                className="transition-all hover:shadow-md"
                                            >
                                                <Check className="mr-1 h-4 w-4" />
                                                Complete
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}