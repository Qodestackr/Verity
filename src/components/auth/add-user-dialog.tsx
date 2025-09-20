"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "@/lib/zod";
import { Loader2, Shield, Store, Truck, Building2, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

// Available roles with their descriptions and icons
const availableRoles = [
    {
        id: "admin",
        name: "Admin",
        description: "Full access to all system features",
        icon: <Shield className="h-4 w-4 text-amber-500" />,
    },
    {
        id: "orders",
        name: "Orders",
        description: "Can view and process customer orders",
        icon: <Store className="h-4 w-4 text-blue-500" />,
    },
    {
        id: "delivery",
        name: "Delivery",
        description: "Can manage deliveries and track status",
        icon: <Truck className="h-4 w-4 text-green-500" />,
    },
    {
        id: "inventory",
        name: "Inventory",
        description: "Can manage products and stock levels",
        icon: <Building2 className="h-4 w-4 text-purple-500" />,
    },
]

// Form schema with validation
const userFormSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Name must be at least 2 characters" })
        .max(50, { message: "Name must not exceed 50 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    roles: z.array(z.string()).min(1, { message: "Select at least one role" }),
})

type UserFormValues = z.infer<typeof userFormSchema>

export function AddUserDialog() {

    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            name: "",
            email: "",
            roles: [],
        },
    })

    const onSubmit = async (data: UserFormValues) => {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            console.log("Form data submitted:", data)

            toast.success("User invited successfully", {
                description: `An invitation has been sent to ${data.email}`,
            })

            // Close dialog and reset form
            setOpen(false)
            form.reset()
        } catch (error) {
            console.error("Error inviting user:", error)

            toast.error("Error inviting user", {
                description: "There was a problem sending the invitation. Please try again.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 h-8 text-xs">
                    <UserPlus className="h-3.5 w-3.5" />
                    Add User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="font-normal">Add New User</DialogTitle>
                    <DialogDescription>Enter user details to send an invitation.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john.doe@example.com" type="email" {...field} />
                                    </FormControl>
                                    <FormDescription>An invitation will be sent to this email address</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="roles"
                            render={() => (
                                <FormItem>
                                    <div className="mb-2">
                                        <FormLabel>User Roles</FormLabel>
                                        <FormDescription>Select the roles for this user</FormDescription>
                                    </div>
                                    <div className="space-y-2 border rounded-md p-3">
                                        {availableRoles.map((role) => (
                                            <FormField
                                                key={role.id}
                                                control={form.control}
                                                name="roles"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem key={role.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(role.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, role.id])
                                                                            : field.onChange(field.value?.filter((value) => value !== role.id))
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <div className="space-y-1 leading-none">
                                                                <FormLabel className="flex items-center gap-1.5">
                                                                    {role.icon}
                                                                    {role.name}
                                                                </FormLabel>
                                                                <FormDescription className="text-xs">{role.description}</FormDescription>
                                                            </div>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Invitation"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
