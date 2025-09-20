"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Upload,
    FileText,
    FilePlus2,
    X,
    Mail,
    AlertCircle,
    Check,
    Loader2,
    ChevronDown,
    Info,
} from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function InvitePartnersModal() {

    const [isOpen, setIsOpen] = useState(false)
    const [selectedTab, setSelectedTab] = useState("manual")
    const [emails, setEmails] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedFile, setUploadedFile] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [previewData, setPreviewData] = useState([])
    const [helpOpen, setHelpOpen] = useState(false)

    // Mock validation function
    const validateEmails = (input) => {
        const emailArray = input.split(/[,\n]/).map(e => e.trim()).filter(Boolean)
        return emailArray.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    }

    const handleFileUpload = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setUploadedFile(file)

        // Mock file processing
        setTimeout(() => {
            // Mock preview data
            setPreviewData([
                // { email: "john@companyone.com", name: "John Smith", business: "Company One", valid: true },
                // { email: "sarah@companytwo.co.ke", name: "Sarah Njeri", business: "Company Two", valid: true },
                // { email: "invalid-email", name: "", business: "Unknown", valid: false },
            ])
            setIsUploading(false)
        }, 1500)
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)

        // Mock submission
        await new Promise(resolve => setTimeout(resolve, 2000))

        setIsSubmitting(false)
        setIsOpen(false)

        // Reset form
        setEmails("")
        setUploadedFile(null)
        setPreviewData([])
    }

    const handleClearFile = () => {
        setUploadedFile(null)
        setPreviewData([])
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 border-teal-200 text-teal-700 hover:bg-teal-50">
                    <FilePlus2 className="h-4 w-4" />
                    Invite/Refer Partners
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader className="py-2">
                    <DialogTitle>Invite Business Partners</DialogTitle>
                    <DialogDescription className="text-xs">
                        Connect with suppliers, wholesalers, or retailers
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="manual" className="w-full" onValueChange={setSelectedTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                        <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="mt-2 space-y-3">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="emails" className="text-sm">Partner Emails</Label>
                                <span className="text-xs text-muted-foreground">Required</span>
                            </div>
                            <Textarea
                                id="emails"
                                placeholder="Enter email addresses (one per line or comma-separated)"
                                className="h-24 text-sm"
                                value={emails}
                                onChange={(e) => setEmails(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter the email addresses of your business partners
                            </p>
                        </div>

                        {emails && !validateEmails(emails) && (
                            <Alert variant="destructive" className="py-2">
                                <AlertCircle className="h-3 w-3" />
                                <AlertTitle className="text-xs font-medium">Invalid Email Format</AlertTitle>
                                <AlertDescription className="text-xs">
                                    Please check the email addresses format
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="message" className="text-sm">Message (Optional)</Label>
                            </div>
                            <Textarea
                                id="message"
                                placeholder="Add a personalized message to your invitation"
                                className="h-20 text-sm"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="bulk" className="mt-2 space-y-3">
                        <div className="space-y-1.5">
                            <Label className="text-sm">Upload Contact List</Label>

                            {!uploadedFile ? (
                                <div className="border-2 border-dashed rounded-md p-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                                        <p className="text-sm font-medium mb-1">Drag and drop or click to upload</p>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Support for CSV, XLS, or XLSX files
                                        </p>
                                        <Button variant="outline" size="sm" asChild className="text-xs">
                                            <label>
                                                Select File
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".csv,.xls,.xlsx"
                                                    onChange={handleFileUpload}
                                                />
                                            </label>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border rounded-md p-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <p className="text-sm font-medium">{uploadedFile.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(uploadedFile.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleClearFile}
                                            disabled={isUploading}
                                            className="h-6 w-6"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isUploading && (
                            <div className="flex items-center justify-center py-2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                                <p className="text-xs text-muted-foreground">Processing file...</p>
                            </div>
                        )}

                        <AnimatePresence>
                            {previewData.length > 0 && !isUploading && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-1.5"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-medium">Contact Preview</h4>
                                        <Badge variant={previewData.some(d => !d.valid) ? "destructive" : "outline"} className="text-xs">
                                            {previewData.filter(d => d.valid).length}/{previewData.length} Valid
                                        </Badge>
                                    </div>

                                    <div className="border rounded-md overflow-hidden">
                                        <div className="grid grid-cols-4 text-xs font-medium bg-muted px-2 py-1">
                                            <div>Status</div>
                                            <div>Email</div>
                                            <div>Name</div>
                                            <div>Business</div>
                                        </div>
                                        <Separator />
                                        <div className="max-h-28 overflow-y-auto">
                                            {previewData.map((contact, i) => (
                                                <div
                                                    key={i}
                                                    className="grid grid-cols-4 text-xs px-2 py-1 border-b last:border-0"
                                                >
                                                    <div>
                                                        {contact.valid ? (
                                                            <Badge variant="outline" className="bg-green-50 text-green-600 flex items-center w-14 justify-center h-5 text-[10px]">
                                                                <Check className="h-2.5 w-2.5 mr-0.5" />
                                                                Valid
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-red-50 text-red-600 flex items-center w-14 justify-center h-5 text-[10px]">
                                                                <X className="h-2.5 w-2.5 mr-0.5" />
                                                                Error
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="truncate">{contact.email}</div>
                                                    <div className="truncate">{contact.name || "—"}</div>
                                                    <div className="truncate">{contact.business || "—"}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {previewData.some(d => !d.valid) && (
                                        <Alert variant="destructive" className="py-1.5">
                                            <AlertCircle className="h-3 w-3" />
                                            <AlertTitle className="text-xs">Invalid Entries Found</AlertTitle>
                                            <AlertDescription className="text-xs">
                                                You can still proceed with the valid contacts.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </TabsContent>
                </Tabs>

                <Collapsible
                    open={helpOpen}
                    onOpenChange={setHelpOpen}
                    className="border rounded-md mt-2"
                >
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 transition-colors rounded-md">
                            <div className="flex items-center gap-1.5">
                                <Info className="h-3.5 w-3.5 text-blue-500" />
                                <span className="text-xs font-medium">How it works</span>
                            </div>
                            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${helpOpen ? 'transform rotate-180' : ''}`} />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-2 pb-2">
                        <p className="text-xs text-muted-foreground">
                            Your partners will receive an invite to join Alcorabooks and seamlessly connect with your business.
                            Once they accept, they can browse your selected products, place orders, and track inventory—all in one place.
                        </p>
                    </CollapsibleContent>
                </Collapsible>

                <DialogFooter className="flex items-center justify-end gap-2 pt-3 pb-1">
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isSubmitting}
                        className="h-8 text-xs"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            isSubmitting ||
                            (selectedTab === "manual" && (!emails || !validateEmails(emails))) ||
                            (selectedTab === "bulk" && (!uploadedFile || isUploading))
                        }
                        className="h-8 text-xs"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send Invitations"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}