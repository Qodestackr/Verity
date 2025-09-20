"use client"
import Link from "next/link"
import { ArrowLeft, Download, Send, Printer, Edit, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

const invoiceData = {
    id: "INV-003",
    customer: "Kisumu Retailers Ltd",
    customerAddress: "456 Lake Road, Kisumu, Kenya",
    customerEmail: "accounts@kisumuretailers.co.ke",
    customerPhone: "+254 712 345 678",
    amount: 78500,
    tax: 12560,
    total: 91060,
    date: "2025-03-07",
    dueDate: "2025-03-21",
    status: "pending",
    customerType: "retailer",
    paymentMethod: "Bank Transfer",
    items: [
        {
            id: 1,
            name: "Premium Lager - 500ml",
            quantity: 50,
            unitPrice: 350,
            total: 17500,
        },
        {
            id: 2,
            name: "Craft IPA - 330ml",
            quantity: 100,
            unitPrice: 420,
            total: 42000,
        },
        {
            id: 3,
            name: "Stout - 500ml",
            quantity: 30,
            unitPrice: 380,
            total: 11400,
        },
        {
            id: 4,
            name: "Cider - 330ml",
            quantity: 20,
            unitPrice: 380,
            total: 7600,
        },
    ],
    notes: "Payment due within 14 days. Please include invoice number in your payment reference.",
}

export function InvoiceDetails({
    id }: { id: string }) {
    // fetch the invoice data based on the ID
    // const [invoice, setInvoice] = useState(null)
    // useEffect(() => { fetch invoice data here }, [id])

    const invoice = invoiceData // Using sample data for demonstration

    const organizationSlug = useOrganizationSlug()

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("en-KE", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return (
                    <div className="flex items-center gap-2">
                        <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                )
            case "pending":
                return (
                    <div className="flex items-center gap-2">
                        <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </div>
                )
            case "overdue":
                return (
                    <div className="flex items-center gap-2">
                        <Badge className="bg-red-500 hover:bg-red-600">Overdue</Badge>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                )
            default:
                return <Badge>{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/dashboard/${organizationSlug}/accounting/customers`}>
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Invoice {invoice.id}</h1>
                        <p className="text-muted-foreground">Issued on {formatDate(invoice.date)}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                    <Button variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                    <Button variant="outline" size="sm">
                        <Send className="mr-2 h-4 w-4" /> Send
                    </Button>
                    <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button size="sm">Mark as Paid</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Invoice Details</CardTitle>
                        <CardDescription>Complete breakdown of invoice {invoice.id}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div>
                                    <h3 className="font-semibold mb-1">From</h3>
                                    <div className="text-sm">
                                        <p>Alcorabooks Limited</p>
                                        <p>123 Business Park</p>
                                        <p>Nairobi, Kenya</p>
                                        <p>info@Alcorabooks.co.ke</p>
                                        <p>+254 700 123 456</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">To</h3>
                                    <div className="text-sm">
                                        <p>{invoice.customer}</p>
                                        <p>{invoice.customerAddress}</p>
                                        <p>{invoice.customerEmail}</p>
                                        <p>{invoice.customerPhone}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Details</h3>
                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">Invoice Number:</span>
                                            <span>{invoice.id}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">Date Issued:</span>
                                            <span>{formatDate(invoice.date)}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">Due Date:</span>
                                            <span>{formatDate(invoice.dueDate)}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-muted-foreground">Status:</span>
                                            <span>{getStatusBadge(invoice.status)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoice.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                <TableCell className="text-right">KSh {item.unitPrice.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">KSh {item.total.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex flex-col items-end space-y-2">
                                <div className="flex justify-between w-full max-w-xs">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span>KSh {invoice.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between w-full max-w-xs">
                                    <span className="text-muted-foreground">VAT (16%):</span>
                                    <span>KSh {invoice.tax.toLocaleString()}</span>
                                </div>
                                <Separator className="w-full max-w-xs" />
                                <div className="flex justify-between w-full max-w-xs font-bold">
                                    <span>Total:</span>
                                    <span>KSh {invoice.total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="bg-muted p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Notes</h3>
                                <p className="text-sm">{invoice.notes}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold mb-1">Payment Method</h3>
                                    <p className="text-sm">{invoice.paymentMethod}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold mb-1">Bank Details</h3>
                                    <div className="text-sm">
                                        <p>Bank: Kenya Commercial Bank</p>
                                        <p>Account Name: Alcorabooks Limited</p>
                                        <p>Account Number: 1234567890</p>
                                        <p>Branch: Westlands</p>
                                        <p>Swift Code: KCBLKENX</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold mb-1">Payment Instructions</h3>
                                    <p className="text-sm">Please include invoice number {invoice.id} in your payment reference.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold mb-1">Customer Type</h3>
                                    <Badge variant="outline" className="capitalize">
                                        {invoice.customerType}
                                    </Badge>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold mb-1">Payment History</h3>
                                    <p className="text-sm">Always pays on time</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold mb-1">Credit Limit</h3>
                                    <p className="text-sm">KSh 500,000</p>
                                    <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                                        <div className="bg-primary h-2.5 rounded-full" style={{ width: "45%" }}></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">KSh 225,000 used (45%)</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" asChild className="w-full">
                                <Link href={`/accounting/customers/kisumu-retailers`}>View Customer Profile</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}