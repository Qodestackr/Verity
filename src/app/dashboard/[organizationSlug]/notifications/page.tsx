"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    Bell,
    ShoppingCart,
    Package,
    AlertCircle,
    CheckCircle,
    Clock,
    Info,
    DollarSign,
    Zap,
    Filter,
    CheckSquare,
    Truck,
    RefreshCw,
    ChevronRight,
    ChevronDown,
    Settings,
    X,
    Eye
} from "lucide-react"


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type NotificationType = "orders" | "inventory" | "payments" | "system";
type NotificationPriority = "critical" | "warning" | "success" | "normal";

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    read: boolean;
    priority: NotificationPriority;
    date: Date;
}

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

const mockNotifications: Notification[] = [
    {
        id: "n1",
        type: "orders",
        title: "Order #BRW-4529 delivered",
        message: "Tusker Larger delivery has been completed successfully",
        time: "Just now",
        read: false,
        priority: "success",
        date: new Date(),
    },
    {
        id: "n2",
        type: "inventory",
        title: "Low stock alert: Heineken",
        message: "Inventory below threshold (15 units). Consider reordering soon.",
        time: "10m ago",
        read: false,
        priority: "warning",
        date: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
        id: "n3",
        type: "payments",
        title: "Payment overdue: Invoice #INV-2234",
        message: "Payment of KSh 24,500 is 3 days overdue. Please settle to avoid service interruption.",
        time: "2h ago",
        read: false,
        priority: "critical",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
        id: "n4",
        type: "orders",
        title: "New order received: #BRW-4530",
        message: "Gilbeys Gin (24 units) order placed by Kalahari Lounge.",
        time: "3h ago",
        read: true,
        priority: "normal",
        date: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
        id: "n5",
        type: "system",
        title: "System maintenance scheduled",
        message: "Alcorabooks will be undergoing maintenance on Sunday, 2am-4am EAT. Plan accordingly.",
        time: "5h ago",
        read: true,
        priority: "normal",
        date: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
        id: "n6",
        type: "inventory",
        title: "Price change alert: Johnnie Walker",
        message: "Distributor price increased by 5% effective next order.",
        time: "1d ago",
        read: true,
        priority: "warning",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
        id: "n7",
        type: "payments",
        title: "Invoice #INV-2235 issued",
        message: "New invoice for KSh 38,750 has been issued. Due in 14 days.",
        time: "1d ago",
        read: true,
        priority: "normal",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
        id: "n8",
        type: "orders",
        title: "Order #BRW-4528 in transit",
        message: "Your White Cap order is now in transit. Expected delivery tomorrow.",
        time: "2d ago",
        read: true,
        priority: "normal",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
        id: "n9",
        type: "system",
        title: "New feature: Auto-reordering",
        message: "Auto-reordering is now available. Set minimum stock levels to activate.",
        time: "3d ago",
        read: true,
        priority: "normal",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
];

// Helper function to get icon based on notification type
function getNotificationIcon(type: NotificationType, priority: NotificationPriority) {
    switch (type) {
        case "orders":
            return priority === "critical" ?
                <AlertCircle className="h-4 w-4 text-destructive" /> :
                <ShoppingCart className="h-4 w-4 text-blue-500" />;
        case "inventory":
            return priority === "critical" ?
                <AlertCircle className="h-4 w-4 text-destructive" /> :
                <Package className="h-4 w-4 text-green-500" />;
        case "payments":
            return priority === "critical" ?
                <AlertCircle className="h-4 w-4 text-destructive" /> :
                <DollarSign className="h-4 w-4 text-amber-500" />;
        case "system":
            return priority === "critical" ?
                <AlertCircle className="h-4 w-4 text-destructive" /> :
                <Info className="h-4 w-4 text-purple-500" />;
        default:
            return <Bell className="h-4 w-4 text-primary" />;
    }
}

// Helper to get badge based on priority
function getPriorityBadge(priority: NotificationPriority) {
    switch (priority) {
        case "critical":
            return <Badge variant="destructive" className="px-1.5 py-0 text-xs">Critical</Badge>;
        case "warning":
            return <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 px-1.5 py-0 text-xs">Warning</Badge>;
        case "success":
            return <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white px-1.5 py-0 text-xs">Success</Badge>;
        default:
            return <Badge variant="outline" className="px-1.5 py-0 text-xs">Info</Badge>;
    }
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(mockNotifications);
    const [searchQuery, setSearchQuery] = useState("");
    const [timeFilter, setTimeFilter] = useState("all");
    const [criticalExpanded, setCriticalExpanded] = useState(true);

    // Critical notifications are unread with priority critical or warning
    const criticalNotifications = notifications.filter(
        (n) => !n.read && (n.priority === "critical" || n.priority === "warning")
    );

    // Count by type for badges
    const notificationCounts = {
        all: notifications.filter(n => !n.read).length,
        orders: notifications.filter(n => n.type === "orders" && !n.read).length,
        inventory: notifications.filter(n => n.type === "inventory" && !n.read).length,
        payments: notifications.filter(n => n.type === "payments" && !n.read).length,
        system: notifications.filter(n => n.type === "system" && !n.read).length,
    };

    // Filter notifications when search or time filter changes
    useEffect(() => {
        let filtered = [...notifications];

        // Apply search filter if there's a query
        if (searchQuery) {
            filtered = filtered.filter(
                n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    n.message.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply time filter
        if (timeFilter !== "all") {
            const now = new Date();
            switch (timeFilter) {
                case "today":
                    filtered = filtered.filter(n => {
                        const today = new Date(now);
                        today.setHours(0, 0, 0, 0);
                        return n.date >= today;
                    });
                    break;
                case "week":
                    filtered = filtered.filter(n => {
                        const weekAgo = new Date(now);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return n.date >= weekAgo;
                    });
                    break;
                // Add more time filters as needed
            }
        }

        setFilteredNotifications(filtered);
    }, [searchQuery, timeFilter, notifications]);

    // Mark a notification as read
    const markAsRead = (id: string) => {
        setNotifications(
            notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            )
        );
    };

    // Mark all notifications as read
    const markAllAsRead = () => {
        setNotifications(
            notifications.map(n => ({ ...n, read: true }))
        );
    };

    return (
        <div className="max-w-4xl mx-auto px-3 py-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground text-sm">
                        Stay updated with your business activities and alerts
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                        disabled={!notifications.some(n => !n.read)}
                        className="h-8"
                    >
                        <CheckSquare className="mr-1 h-3 w-3" />
                        Mark all read
                    </Button>
                    <Button variant="default" size="sm" className="h-8">
                        <Settings className="mr-1 h-3 w-3" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* AI Summary for Critical Notifications */}
            {criticalNotifications.length > 0 && (
                <Collapsible open={criticalExpanded} onOpenChange={setCriticalExpanded} className="mb-2">
                    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
                        <CardHeader className="pb-1 pt-2 px-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Zap className="h-4 w-4 text-amber-500 mr-2" />
                                    <CardTitle className="text-base">Critical Notifications</CardTitle>
                                </div>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                        {criticalExpanded ?
                                            <ChevronDown className="h-4 w-4" /> :
                                            <ChevronRight className="h-4 w-4" />
                                        }
                                    </Button>
                                </CollapsibleTrigger>
                            </div>
                        </CardHeader>
                        <CollapsibleContent>
                            <CardContent className="pt-0 pb-2 px-2">
                                <p className="text-xs text-muted-foreground mb-2">
                                    You have {criticalNotifications.length} item{criticalNotifications.length !== 1 ? 's' : ''} requiring attention:
                                </p>
                                <div className="space-y-1.5">
                                    {criticalNotifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-2 p-1.5 rounded-md border border-amber-200 bg-white dark:bg-background"
                                        >
                                            {getNotificationIcon(notification.type, notification.priority)}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">{notification.title}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => markAsRead(notification.id)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <X className="h-3 w-3" />
                                                <span className="sr-only">Dismiss</span>
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>
            )}

            {/* Filters */}
            <div className="mb-4 flex flex-col sm:flex-row gap-2">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search notifications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 h-9 text-sm"
                        />
                    </div>
                </div>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Filter by time" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This week</SelectItem>
                        <SelectItem value="month">This month</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tabbed Interface */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-3 inline-flex items-center justify-start bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
                    <TabsTrigger value="all" className="relative rounded-sm px-3 py-1 text-xs font-medium transition-all">
                        All
                        {notificationCounts.all > 0 && (
                            <Badge className="ml-1 px-1 py-0 h-4 min-w-4 text-[10px]" variant="default">
                                {notificationCounts.all}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="text-xs">
                        Orders
                        {notificationCounts.orders > 0 && (
                            <Badge className="ml-1 px-1 py-0 h-4 min-w-4 text-[10px]" variant="default">
                                {notificationCounts.orders}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="text-xs">
                        Inventory
                        {notificationCounts.inventory > 0 && (
                            <Badge className="ml-1 px-1 py-0 h-4 min-w-4 text-[10px]" variant="default">
                                {notificationCounts.inventory}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="text-xs">
                        Payments
                        {notificationCounts.payments > 0 && (
                            <Badge className="ml-1 px-1 py-0 h-4 min-w-4 text-[10px]" variant="default">
                                {notificationCounts.payments}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="system" className="text-xs">
                        System
                        {notificationCounts.system > 0 && (
                            <Badge className="ml-1 px-1 py-0 h-4 min-w-4 text-[10px]" variant="default">
                                {notificationCounts.system}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* All Notifications Tab */}
                <TabsContent value="all">
                    <NotificationList
                        notifications={filteredNotifications}
                        markAsRead={markAsRead}
                    />
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders">
                    <NotificationList
                        notifications={filteredNotifications.filter(n => n.type === "orders")}
                        markAsRead={markAsRead}
                    />
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory">
                    <NotificationList
                        notifications={filteredNotifications.filter(n => n.type === "inventory")}
                        markAsRead={markAsRead}
                    />
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments">
                    <NotificationList
                        notifications={filteredNotifications.filter(n => n.type === "payments")}
                        markAsRead={markAsRead}
                    />
                </TabsContent>

                {/* System Tab */}
                <TabsContent value="system">
                    <NotificationList
                        notifications={filteredNotifications.filter(n => n.type === "system")}
                        markAsRead={markAsRead}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

// Component for displaying the list of notifications
function NotificationList({ notifications, markAsRead }: { notifications: Notification[], markAsRead: (id: string) => void }) {
    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-3 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <h3 className="text-base font-medium">No notifications</h3>
                <p className="text-xs text-muted-foreground mt-1">
                    You're all caught up! Check back later for updates.
                </p>
            </div>
        );
    }

    // Group notifications by date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groupedNotifications = {
        today: notifications.filter(n => n.date >= today),
        yesterday: notifications.filter(n => n.date >= yesterday && n.date < today),
        thisWeek: notifications.filter(n => n.date >= lastWeek && n.date < yesterday),
        older: notifications.filter(n => n.date < lastWeek),
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
        >
            {/* Today */}
            {groupedNotifications.today.length > 0 && (
                <div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-1">Today</h3>
                    <div className="space-y-1.5">
                        {groupedNotifications.today.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                markAsRead={markAsRead}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Yesterday */}
            {groupedNotifications.yesterday.length > 0 && (
                <div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-2">Yesterday</h3>
                    <div className="space-y-1.5">
                        {groupedNotifications.yesterday.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                markAsRead={markAsRead}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* This Week */}
            {groupedNotifications.thisWeek.length > 0 && (
                <div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-2">This Week</h3>
                    <div className="space-y-1.5">
                        {groupedNotifications.thisWeek.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                markAsRead={markAsRead}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Older */}
            {groupedNotifications.older.length > 0 && (
                <div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-2">Older</h3>
                    <div className="space-y-1.5">
                        {groupedNotifications.older.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                markAsRead={markAsRead}
                            />
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

// Individual notification card
function NotificationCard({ notification, markAsRead }: { notification: Notification, markAsRead: (id: string) => void }) {
    // Get action button based on notification type
    const getActionButton = (type: NotificationType) => {
        switch (type) {
            case "orders":
                return (
                    <Button variant="ghost" size="sm" className="h-7 rounded-sm px-2 text-xs">
                        <Truck className="mr-1 h-3 w-3" />
                        View Order
                    </Button>
                );
            case "inventory":
                return (
                    <Button variant="ghost" size="sm" className="h-7 rounded-sm px-2 text-xs">
                        <Package className="mr-1 h-3 w-3" />
                        Manage Stock
                    </Button>
                );
            case "payments":
                return (
                    <Button variant="ghost" size="sm" className="h-7 rounded-sm px-2 text-xs">
                        <DollarSign className="mr-1 h-3 w-3" />
                        View Invoice
                    </Button>
                );
            default:
                return (
                    <Button variant="ghost" size="sm" className="h-7 rounded-sm px-2 text-xs">
                        <Eye className="mr-1 h-3 w-3" />
                        Details
                    </Button>
                );
        }
    };

    return (
        <motion.div variants={item}>
            <Card className={`transition-all hover:bg-muted/50 ${!notification.read ? "border-l-[3px] border-l-primary" : "border-l-[3px] border-transparent"}`}>
                <CardContent className="flex items-start gap-2">
                    <div className={`p-1.5 rounded-full ${notification.priority === "critical" ? "bg-red-100 dark:bg-red-900/20" : notification.priority === "warning" ? "bg-amber-100 dark:bg-amber-900/20" : notification.priority === "success" ? "bg-green-100 dark:bg-green-900/20" : "bg-blue-100 dark:bg-blue-900/20"}`}>
                        {getNotificationIcon(notification.type, notification.priority)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <h3 className="text-xs font-medium truncate max-w-[150px] sm:max-w-[250px]">{notification.title}</h3>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">{notification.title}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                {getPriorityBadge(notification.priority)}
                            </div>
                            <div className="flex items-center text-[10px] text-muted-foreground whitespace-nowrap">
                                <Clock className="h-2.5 w-2.5 mr-0.5" />
                                {notification.time}
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">{notification.message}</p>

                        <div className="flex items-center justify-between gap-1">
                            {getActionButton(notification.type)}

                            {!notification.read && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-7 w-7 p-0 rounded-full"
                                >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    <span className="sr-only">Mark as read</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}