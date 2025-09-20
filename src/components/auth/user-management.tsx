"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Building2,
    ChevronDown,
    Filter,
    Loader2,
    MoreHorizontal,
    Search,
    Shield,
    Store,
    Truck,
    UserCog,
    Users,
} from "lucide-react"

import { AddUserDialog } from "./add-user-dialog"

const dummyUsers = [
    {
        id: "1",
        name: "John Kamau",
        email: "john@alcorabooks.com",
        image: "/placeholder.svg?height=40&width=40",
        status: "active",
        roles: ["admin", "orders"],
        businessUnit: "Nairobi",
        lastActive: "2h ago",
    },
    {
        id: "2",
        name: "Mary Wanjiku",
        email: "mary@alcorabooks.com",
        image: "/placeholder.svg?height=40&width=40",
        status: "active",
        roles: ["orders", "delivery"],
        businessUnit: "Nairobi",
        lastActive: "5m ago",
    },
    {
        id: "3",
        name: "Peter Omondi",
        email: "peter@alcorabooks.com",
        image: "/placeholder.svg?height=40&width=40",
        status: "active",
        roles: ["delivery"],
        businessUnit: "Nairobi",
        lastActive: "1d ago",
    },
    {
        id: "4",
        name: "Sarah Njeri",
        email: "sarah@alcorabooks.com",
        image: "/placeholder.svg?height=40&width=40",
        status: "inactive",
        roles: ["inventory"],
        businessUnit: "Mombasa",
        lastActive: "3d ago",
    },
    {
        id: "5",
        name: "David Mwangi",
        email: "david@alcorabooks.com",
        image: "/placeholder.svg?height=40&width=40",
        status: "active",
        roles: ["admin", "inventory", "orders"],
        businessUnit: "Mombasa",
        lastActive: "Now",
    },
    {
        id: "6",
        name: "Elizabeth A.",
        email: "elizabeth@alcorabooks.com",
        image: "/placeholder.svg?height=40&width=40",
        status: "active",
        roles: ["orders"],
        businessUnit: "Kisumu",
        lastActive: "1h ago",
    },
    {
        id: "7",
        name: "Michael O.",
        email: "michael@alcorabooks.com",
        image: "/placeholder.svg?height=40&width=40",
        status: "pending",
        roles: [],
        businessUnit: "Kisumu",
        lastActive: "Never",
    },
    {
        id: "8",
        name: "Grace Wambui",
        email: "grace@alcorabooks.com",
        image: "/placeholder.svg?height=40&width=40",
        status: "active",
        roles: ["delivery", "inventory"],
        businessUnit: "Premium",
        lastActive: "4h ago",
    },
]

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

// Business units for filtering
const businessUnits = [
    { id: "all", name: "All Units" },
    { id: "nairobi", name: "Nairobi" },
    { id: "mombasa", name: "Mombasa" },
    { id: "kisumu", name: "Kisumu" },
    { id: "premium", name: "Premium" },
]

export function UserManagement() {

    const [users, setUsers] = useState(dummyUsers)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedBusinessUnit, setSelectedBusinessUnit] = useState("all")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)

    // Filter users based on search query, business unit and status
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesBusinessUnit =
            selectedBusinessUnit === "all" || user.businessUnit.toLowerCase().includes(selectedBusinessUnit.toLowerCase())

        const matchesStatus = selectedStatus === "all" || user.status === selectedStatus

        return matchesSearch && matchesBusinessUnit && matchesStatus
    })

    // Handle role change
    const handleRoleChange = (roleId, checked) => {
        if (!selectedUser) return

        setUsers((prevUsers) =>
            prevUsers.map((user) => {
                if (user.id === selectedUser.id) {
                    const updatedRoles = checked ? [...user.roles, roleId] : user.roles.filter((r) => r !== roleId)

                    return {
                        ...user,
                        roles: updatedRoles,
                    }
                }
                return user
            }),
        )

        // Update the selected user as well
        setSelectedUser((prev) => {
            if (!prev) return prev

            const updatedRoles = checked ? [...prev.roles, roleId] : prev.roles.filter((r) => r !== roleId)

            return {
                ...prev,
                roles: updatedRoles,
            }
        })
    }

    // Save role changes
    const saveRoleChanges = () => {
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            setIsRoleDialogOpen(false)
            // save the changes to the server
        }, 1000)
    }

    // Handle adding a new user
    const handleAddUser = (newUser) => {
        setUsers((prevUsers) => [
            ...prevUsers,
            {
                id: String(prevUsers.length + 1),
                ...newUser,
                image: "/placeholder.svg?height=40&width=40",
                lastActive: "Just now",
            },
        ])
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-light flex items-center gap-1.5">
                            <UserCog className="h-5 w-5 text-primary" />
                            Staff Management
                        </CardTitle>
                        <CardDescription>Manage user access and permissions across distribution channels</CardDescription>
                    </div>
                    <AddUserDialog
                    //   onUserAdded={handleAddUser}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="px-3 pb-2">
                    {/* Search and filters */}
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-9 h-9 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                                        <Building2 className="h-4 w-4" />
                                        {businessUnits.find((bu) => bu.id === selectedBusinessUnit)?.name || "All Units"}
                                        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[180px]">
                                    <DropdownMenuLabel>Filter by Unit</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {businessUnits.map((unit) => (
                                        <DropdownMenuItem
                                            key={unit.id}
                                            onClick={() => setSelectedBusinessUnit(unit.id)}
                                            className="cursor-pointer"
                                        >
                                            {unit.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                                        <Filter className="h-4 w-4" />
                                        Status
                                        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[150px]">
                                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setSelectedStatus("all")} className="cursor-pointer">
                                        All Statuses
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSelectedStatus("active")} className="cursor-pointer">
                                        Active
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSelectedStatus("inactive")} className="cursor-pointer">
                                        Inactive
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSelectedStatus("pending")} className="cursor-pointer">
                                        Pending
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Table using shadcn/UI Table components */}
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[30%] py-2 text-xs">User</TableHead>
                                    <TableHead className="hidden sm:table-cell w-[15%] py-2 text-xs">Unit</TableHead>
                                    <TableHead className="w-[25%] py-2 text-xs">Roles</TableHead>
                                    <TableHead className="hidden sm:table-cell py-2 text-xs">Active</TableHead>
                                    <TableHead className="w-[20%] py-2 text-xs">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            {/* User column */}
                                            <TableCell className="py-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Avatar className="h-7 w-7 flex-shrink-0">
                                                        <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 overflow-hidden">
                                                        <p className="text-xs font-medium truncate">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Business Unit */}
                                            <TableCell className="hidden sm:table-cell py-2">
                                                <span className="text-xs">{user.businessUnit}</span>
                                            </TableCell>

                                            {/* Roles */}
                                            <TableCell className="py-2">
                                                {user.roles.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.slice(0, 2).map((role) => {
                                                            const roleInfo = availableRoles.find((r) => r.id === role)
                                                            return (
                                                                <Badge
                                                                    key={role}
                                                                    variant="outline"
                                                                    className="text-xs py-0 h-5 flex items-center gap-1 px-1.5"
                                                                >
                                                                    {roleInfo?.icon}
                                                                    <span className="hidden sm:inline">{roleInfo?.name}</span>
                                                                    <span className="sm:hidden">{role.slice(0, 3)}</span>
                                                                </Badge>
                                                            )
                                                        })}
                                                        {user.roles.length > 2 && (
                                                            <Badge variant="outline" className="text-xs py-0 h-5 px-1.5">
                                                                +{user.roles.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">None</span>
                                                )}
                                            </TableCell>

                                            {/* Last Active */}
                                            <TableCell className="hidden sm:table-cell py-2">
                                                <span className="text-xs">{user.lastActive}</span>
                                            </TableCell>

                                            {/* Status and Actions */}
                                            <TableCell className="py-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge
                                                        variant={
                                                            user.status === "active" ? "success" : user.status === "pending" ? "warning" : "secondary"
                                                        }
                                                        className="text-xs h-5 px-1.5"
                                                    >
                                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                    </Badge>

                                                    {/* User Actions Dialog */}
                                                    <Dialog
                                                        open={isRoleDialogOpen && selectedUser?.id === user.id}
                                                        onOpenChange={(open) => {
                                                            if (!open) setIsRoleDialogOpen(false)
                                                        }}
                                                    >
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => {
                                                                    setSelectedUser(user)
                                                                    setIsRoleDialogOpen(true)
                                                                }}
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[400px]">
                                                            <DialogHeader>
                                                                <DialogTitle>Manage User Roles</DialogTitle>
                                                                <DialogDescription>Assign or remove roles for {user.name}</DialogDescription>
                                                            </DialogHeader>

                                                            <div className="flex items-center gap-3 py-2">
                                                                <Avatar className="h-9 w-9">
                                                                    <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium text-sm">{user.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                                </div>
                                                            </div>

                                                            <div className="border rounded-md p-3 space-y-3">
                                                                <h4 className="text-sm font-medium">Available Roles</h4>
                                                                <div className="space-y-2">
                                                                    {availableRoles.map((role) => (
                                                                        <div key={role.id} className="flex items-start space-x-2">
                                                                            <Checkbox
                                                                                id={`role-${role.id}`}
                                                                                checked={selectedUser?.roles.includes(role.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    handleRoleChange(role.id, checked === true)
                                                                                }}
                                                                            />
                                                                            <div className="grid gap-1 leading-none">
                                                                                <Label
                                                                                    htmlFor={`role-${role.id}`}
                                                                                    className="flex items-center gap-1.5 text-sm font-medium leading-none"
                                                                                >
                                                                                    {role.icon}
                                                                                    {role.name}
                                                                                </Label>
                                                                                <p className="text-xs text-muted-foreground">{role.description}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <DialogFooter>
                                                                <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)} size="sm">
                                                                    Cancel
                                                                </Button>
                                                                <Button onClick={saveRoleChanges} disabled={isLoading} size="sm">
                                                                    {isLoading ? (
                                                                        <>
                                                                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                                                            Saving...
                                                                        </>
                                                                    ) : (
                                                                        "Save Changes"
                                                                    )}
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-[300px] text-center">
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <div className="rounded-full bg-muted h-12 w-12 flex items-center justify-center mb-3">
                                                    <Users className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <h3 className="text-base font-medium">No users found</h3>
                                                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                                                    {searchQuery
                                                        ? `No users match "${searchQuery}"`
                                                        : "Try adjusting your filters or add new users"}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <p>
                            Showing {filteredUsers.length} of {users.length} users
                        </p>
                        <p>Updated: Today at 2:30 PM</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
