"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Check, X, ChevronRight, UserCog, Search, ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { updateUserRole } from "@/actions/user"

type User = {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
    image: string
    phoneNumber: string | null
}

type Pagination = {
    total: number
    pages: number
    page: number
    limit: number
}

export default function UserApprovalList({
    users,
    pagination,
}: {
    users: User[]
    pagination: Pagination
}) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<string>("")

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const handleUpdateRole = async (userId: string, role: string) => {
        try {
            setIsUpdating(true)
            await updateUserRole(userId, role as any)
            toast.success(`User role updated to ${role}`)
            router.refresh()
            setSheetOpen(false)
        } catch (error) {
            toast.error("Failed to update user role")
            console.error(error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handlePageChange = (newPage: number) => {
        router.push(`/dashboard/admin/users/approval?page=${newPage}&limit=${pagination.limit}`)
    }

    const openUserDetails = (user: User) => {
        setSelectedUser(user)
        setSelectedRole(user.role)
        setSheetOpen(true)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search users..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => openUserDetails(user)}>
                                                <UserCog className="h-4 w-4 mr-2" />
                                                Manage
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {pagination.pages > 1 && (
                <div className="flex items-center justify-center space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-md px-3 mx-2">
                    <SheetHeader>
                        <SheetTitle>User Details</SheetTitle>
                        <SheetDescription>View and manage user information</SheetDescription>
                    </SheetHeader>

                    {selectedUser && (
                        <ScrollArea className="h-[calc(100vh-200px)] pr-4 mt-6">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">User Information</h3>
                                    <div className="grid gap-4">
                                        <div>
                                            <p className="text-sm font-medium mb-1">Name</p>
                                            <p className="text-sm">{selectedUser.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium mb-1">Email</p>
                                            <p className="text-sm">{selectedUser.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium mb-1">Phone</p>
                                            <p className="text-sm">{selectedUser.phoneNumber || "Not provided"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium mb-1">Created</p>
                                            <p className="text-sm">{format(new Date(selectedUser.createdAt), "PPP")}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium mb-1">Current Role</p>
                                            <Badge variant="outline" className="mt-1">
                                                {selectedUser.role}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-4">Update User Role</h3>
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <label htmlFor="role" className="text-sm font-medium">
                                                Select Role
                                            </label>
                                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                                <SelectTrigger id="role">
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="user">User</SelectItem>
                                                    <SelectItem value="retailer">Retailer</SelectItem>
                                                    <SelectItem value="wholesaler">Wholesaler</SelectItem>
                                                    <SelectItem value="distributor">Distributor</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex space-x-2">
                                            <Button
                                                className="flex-1"
                                                onClick={() => handleUpdateRole(selectedUser.id, selectedRole)}
                                                disabled={isUpdating || selectedRole === selectedUser.role}
                                            >
                                                {isUpdating ? "Updating..." : "Update Role"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick Actions</h3>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => handleUpdateRole(selectedUser.id, `${selectedUser.role}`)}
                                            disabled={isUpdating}
                                        >
                                            <Check className="h-4 w-4 mr-2" />
                                            Approve as {selectedUser.role}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="flex-1"
                                            onClick={() => {
                                                // Here you would call rejectUser function
                                                toast.error("User rejection not implemented")
                                            }}
                                            disabled={isUpdating}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    )}

                    <SheetFooter className="mt-6">
                        <SheetClose asChild>
                            <Button variant="outline">Close</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    )
}

