import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Save, X } from 'lucide-react'

interface RetailerDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    retailer: any
    formatCurrency: (amount: number) => string
    onSave: (updatedRetailer: any) => void
}

export function RetailerDrawer({
    open, onOpenChange, retailer, formatCurrency, onSave }: RetailerDrawerProps) {
    const [formData, setFormData] = useState<any>(null)
    const [activeTab, setActiveTab] = useState("basic")

    // Initialize form data when retailer changes
    useState(() => {
        if (retailer) {
            setFormData({ ...retailer })
        }
    })

    if (!retailer || !formData) return null

    const handleInputChange = (field: string, value: any) => {
        setFormData({
            ...formData,
            [field]: value,
        })
    }

    const handleSave = () => {
        onSave(formData)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl w-full p-0 flex flex-col">
                <SheetHeader className="px-6 pt-6 pb-2">
                    <SheetTitle>Edit Retailer</SheetTitle>
                    <SheetDescription>
                        Update retailer information and settings
                    </SheetDescription>
                </SheetHeader>

                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <div className="border-b px-6">
                        <TabsList className="bg-transparent h-10 p-0">
                            <TabsTrigger
                                value="basic"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-10"
                            >
                                Basic Info
                            </TabsTrigger>
                            <TabsTrigger
                                value="contact"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-10"
                            >
                                Contact
                            </TabsTrigger>
                            <TabsTrigger
                                value="financial"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-10"
                            >
                                Financial
                            </TabsTrigger>
                            <TabsTrigger
                                value="settings"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-10"
                            >
                                Settings
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1">
                        <TabsContent value="basic" className="p-6 pt-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Business Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Business Type</Label>
                                    <Input
                                        id="type"
                                        value={formData.type}
                                        onChange={(e) => handleInputChange("type", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="region">Region</Label>
                                    <Select
                                        value={formData.region}
                                        onValueChange={(value) => handleInputChange("region", value)}
                                    >
                                        <SelectTrigger id="region">
                                            <SelectValue placeholder="Select region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Westlands">Westlands</SelectItem>
                                            <SelectItem value="Kilimani">Kilimani</SelectItem>
                                            <SelectItem value="Karen">Karen</SelectItem>
                                            <SelectItem value="CBD">CBD</SelectItem>
                                            <SelectItem value="Eastleigh">Eastleigh</SelectItem>
                                            <SelectItem value="Langata">Langata</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Business Address</Label>
                                    <Textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange("address", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tier">Account Tier</Label>
                                    <Select
                                        value={formData.tier}
                                        onValueChange={(value) => handleInputChange("tier", value)}
                                    >
                                        <SelectTrigger id="tier">
                                            <SelectValue placeholder="Select tier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Platinum">Platinum</SelectItem>
                                            <SelectItem value="Gold">Gold</SelectItem>
                                            <SelectItem value="Silver">Silver</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="contact" className="p-6 pt-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contactPerson">Contact Person</Label>
                                    <Input
                                        id="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="financial" className="p-6 pt-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="creditLimit">Credit Limit (KES)</Label>
                                    <Input
                                        id="creditLimit"
                                        type="number"
                                        value={formData.creditLimit}
                                        onChange={(e) => handleInputChange("creditLimit", parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currentBalance">Current Balance (KES)</Label>
                                    <Input
                                        id="currentBalance"
                                        type="number"
                                        value={formData.currentBalance}
                                        onChange={(e) => handleInputChange("currentBalance", parseInt(e.target.value))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Available Credit: {formatCurrency(formData.creditLimit - formData.currentBalance)}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="paymentStatus">Payment Status</Label>
                                    <Select
                                        value={formData.paymentStatus}
                                        onValueChange={(value) => handleInputChange("paymentStatus", value)}
                                    >
                                        <SelectTrigger id="paymentStatus">
                                            <SelectValue placeholder="Select payment status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Good">Good</SelectItem>
                                            <SelectItem value="Overdue">Overdue</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="orderFrequency">Order Frequency</Label>
                                    <Select
                                        value={formData.orderFrequency}
                                        onValueChange={(value) => handleInputChange("orderFrequency", value)}
                                    >
                                        <SelectTrigger id="orderFrequency">
                                            <SelectValue placeholder="Select order frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Weekly">Weekly</SelectItem>
                                            <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                                            <SelectItem value="Monthly">Monthly</SelectItem>
                                            <SelectItem value="Quarterly">Quarterly</SelectItem>
                                            <SelectItem value="New">New</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="settings" className="p-6 pt-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="status">Account Status</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Inactive accounts cannot place orders
                                        </p>
                                    </div>
                                    <Switch
                                        id="status"
                                        checked={formData.status === "Active"}
                                        onCheckedChange={(checked) => handleInputChange("status", checked ? "Active" : "Inactive")}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Send Order Notifications</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Notify retailer about order status changes
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Send Payment Reminders</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Send automatic payment reminders
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Include in Marketing</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Include in marketing campaigns and promotions
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </div>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                <SheetFooter className="p-4 border-t bg-muted/50">
                    <div className="flex justify-between w-full">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
