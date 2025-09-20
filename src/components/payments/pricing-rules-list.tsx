"use client"

import { useState } from "react"
import Link from "next/link"
import { Edit, Trash2, Calendar, Tag, Package, SettingsIcon } from 'lucide-react'

import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import EmptyState from "../ui/empty-state"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"

// API data
const initialRules = [
    {
        id: "1",
        name: "Tusker Bulk Discount",
        productName: "Tusker Lager",
        discountType: "percentage",
        status: "active",
        startDate: "2025-04-01",
        endDate: "2025-06-30",
        tiers: [
            { min: 1, max: 10, value: 0 },
            { min: 11, max: 50, value: 5 },
            { min: 51, max: 100, value: 10 },
            { min: 101, max: null, value: 15 },
        ],
    },
    {
        id: "2",
        name: "Premium Spirits Volume Pricing",
        productName: "Various Premium Spirits",
        discountType: "fixed",
        status: "scheduled",
        startDate: "2025-05-15",
        endDate: "2025-07-15",
        tiers: [
            { min: 1, max: 5, value: 0 },
            { min: 6, max: 20, value: 100 },
            { min: 21, max: null, value: 200 },
        ],
    },
]

export function PricingRulesList() {
    const { formatCurrency } = useCurrency();

    const [rules, setRules] = useState(initialRules)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [ruleToDelete, setRuleToDelete] = useState<string | null>(null)
    const organizationSlug = useOrganizationSlug()

    const handleDeleteClick = (id: string) => {
        setRuleToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        if (ruleToDelete) {
            setRules(rules.filter(rule => rule.id !== ruleToDelete))
            setDeleteDialogOpen(false)
            setRuleToDelete(null)
        }
    }

    return (
        <div className="space-y-2 w-full">
            {rules.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-5">
                        <EmptyState
                            icon={<SettingsIcon />}
                            title={"No pricing rules found"}
                            description="No Pricing rules. Create your first pricing rule"
                            actionText="Create Pricing Rule"
                            actionHref={`/dashboard/${organizationSlug}/promotions/pricing-rules/new`}
                        />
                    </CardContent>
                </Card>
            ) : (
                rules.map((rule) => (
                    <Card key={rule.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="font-normal">{rule.name}</CardTitle>
                                    <CardDescription className="flex items-center mt-1 text-sm">
                                        <Package className="mr-1 h-4 w-4" />
                                        {rule.productName}
                                    </CardDescription>
                                </div>
                                <Badge variant={rule.status === "active" ? "default" : "outline"}>
                                    {rule.status === "active" ? "Active" : "Scheduled"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm text-muted-foreground mb-4">
                                <Calendar className="mr-1 h-4 w-4" />
                                <span className="font-medium text-blue-500">
                                    {rule.startDate} to {rule.endDate}
                                </span>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Quantity Range</TableHead>
                                        <TableHead>
                                            {rule.discountType === "percentage" ? "Discount %" : "Discount Amount (KSh)"}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rule.tiers.map((tier, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {tier.min} - {tier.max ? tier.max : "∞"}
                                            </TableCell>
                                            <TableCell>
                                                {tier.value}
                                                {rule.discountType === "percentage" ? "%" : " KSh"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                            <Link href={`/dashboard/${organizationSlug}/promotions/pricing-rules/edit/${rule.id}`}>
                                <Button variant="outline" size="sm">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(rule.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </CardFooter>
                    </Card>
                ))
            )}

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Pricing Rule</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this pricing rule? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
