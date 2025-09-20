"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateEvent } from "@/hooks/use-baridi-marketing"
import { client } from "@/lib/auth-client"

interface CreateEventDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateEventDialog({
    open, onOpenChange }: CreateEventDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        type: "",
        scheduledFor: "",
        requiredEmoji: "🍺",
        freeItem: "branded mug",
        minQuantity: 3,
    })

    const { data: activeOrganization } = client.useActiveOrganization()
    const createEvent = useCreateEvent()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!activeOrganization?.id) return

        await createEvent.mutateAsync({
            organizationId: activeOrganization.id,
            ...formData,
            scheduledFor: new Date(formData.scheduledFor).toISOString(),
        })

        onOpenChange(false)
        setFormData({
            name: "",
            type: "",
            scheduledFor: "",
            requiredEmoji: "🍺",
            freeItem: "branded mug",
            minQuantity: 3,
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>Create an event with automatic marketing campaigns</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Event Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Mugithi Night, Rhumba Evening..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Event Type</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MUGITHI_NIGHT">Mugithi Night</SelectItem>
                                <SelectItem value="RHUMBA_EVENING">Rhumba Evening</SelectItem>
                                <SelectItem value="KARAOKE_NIGHT">Karaoke Night</SelectItem>
                                <SelectItem value="LIVE_BAND">Live Band</SelectItem>
                                <SelectItem value="DJ_NIGHT">DJ Night</SelectItem>
                                <SelectItem value="SPORTS_VIEWING">Sports Viewing</SelectItem>
                                <SelectItem value="HAPPY_HOUR">Happy Hour</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="scheduledFor">Date & Time</Label>
                        <Input
                            id="scheduledFor"
                            type="datetime-local"
                            value={formData.scheduledFor}
                            onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="emoji">Required Emoji</Label>
                            <Input
                                id="emoji"
                                value={formData.requiredEmoji}
                                onChange={(e) => setFormData({ ...formData, requiredEmoji: e.target.value })}
                                placeholder="🍺"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="minQuantity">Min Quantity</Label>
                            <Input
                                id="minQuantity"
                                type="number"
                                value={formData.minQuantity}
                                onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="freeItem">Free Item</Label>
                        <Input
                            id="freeItem"
                            value={formData.freeItem}
                            onChange={(e) => setFormData({ ...formData, freeItem: e.target.value })}
                            placeholder="branded mug, t-shirt, etc."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createEvent.isPending}>
                            {createEvent.isPending ? "Creating..." : "Create Event"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
