"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Save } from "lucide-react"

interface NewRetailerFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (retailerData: any) => void
}

export function NewRetailerForm({
    open, onOpenChange, onSave }: NewRetailerFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        type: "",
        region: "",
        address: "",
        contactPerson: "",
        phone: "",
        email: "",
        tier: "Silver",
        creditLimit: "0",
    })

    const handleInputChange = (field: string, value: any) => {
        setFormData({
            ...formData,
            [field]: value,
        })
    }

    const handleSubmit = () => {
        // Validate required fields
        if (!formData.name || !formData.region) {
            alert("Please fill in all required fields.")
            return
        }

        onSave(formData)

        // Reset form
        setFormData({
            name: "",
            type: "",
            region: "",
            address: "",
            contactPerson: "",
            phone: "",
            email: "",
            tier: "Silver",
            creditLimit: "0",
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add New Retailer</DialogTitle>
                    <DialogDescription>Enter the details of the new retailer below</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Business Name*
                            </Label>
                            <Input
                                id="name"
                                placeholder="Enter business name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="type" className="text-sm font-medium">
                                Business Type
                            </Label>
                            <Input
                                id="type"
                                placeholder="e.g. Bar, Retail Shop"
                                value={formData.type}
                                onChange={(e) => handleInputChange("type", e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="region" className="text-sm font-medium">
                                Region*
                            </Label>
                            <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                                <SelectTrigger id="region" className="mt-1">
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

                        <div>
                            <Label htmlFor="contact-person" className="text-sm font-medium">
                                Contact Person
                            </Label>
                            <Input
                                id="contact-person"
                                placeholder="Full name"
                                value={formData.contactPerson}
                                onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone" className="text-sm font-medium">
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                placeholder="+254..."
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="address" className="text-sm font-medium">
                                Business Address
                            </Label>
                            <Textarea
                                id="address"
                                placeholder="Enter address"
                                value={formData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="tier" className="text-sm font-medium">
                                Account Tier
                            </Label>
                            <Select value={formData.tier} onValueChange={(value) => handleInputChange("tier", value)}>
                                <SelectTrigger id="tier" className="mt-1">
                                    <SelectValue placeholder="Select tier" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Platinum">Platinum</SelectItem>
                                    <SelectItem value="Gold">Gold</SelectItem>
                                    <SelectItem value="Silver">Silver</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="credit-limit" className="text-sm font-medium">
                                Credit Limit (KES)
                            </Label>
                            <Input
                                id="credit-limit"
                                type="number"
                                placeholder="0"
                                value={formData.creditLimit}
                                onChange={(e) => handleInputChange("creditLimit", e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        <Save className="h-4 w-4 mr-2" />
                        Add Retailer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
