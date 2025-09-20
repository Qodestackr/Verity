"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";

import { useCurrency } from "@/hooks/useCurrency";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    UserCheck,
    UserX,
    Truck,
    Clock,
    Coffee,
    Calendar,
    MapPin,
    ChevronLeft,
    AlertCircle
} from "lucide-react";
import { Button } from '@/components/ui/button';

export default function DriverCheckIn() {
    const router = useRouter();
    const [status, setStatus] = useState("available");
    const [autoCheckIn, setAutoCheckIn] = useState(true);
    const [locationSharing, setLocationSharing] = useState(true);

    // Current time formatted for display
    const currentTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Current date formatted for display
    const currentDate = new Date().toLocaleDateString([], {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });

    // Calc hrs worked
    const hoursWorked = "6h 45m";

    // Status options with their details
    const statusOptions = [
        {
            value: "available",
            label: "Available",
            description: "Ready for deliveries",
            icon: UserCheck,
            color: "text-green-500",
            bgColor: "bg-green-500/10"
        },
        {
            value: "on_delivery",
            label: "On Delivery",
            description: "Currently delivering orders",
            icon: Truck,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10"
        },
        {
            value: "on_break",
            label: "On Break",
            description: "Taking a break",
            icon: Coffee,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10"
        },
        {
            value: "off_duty",
            label: "Off Duty",
            description: "Shift complete",
            icon: UserX,
            color: "text-red-500",
            bgColor: "bg-red-500/10"
        }
    ];

    // Find current status object
    const currentStatus = statusOptions.find(opt => opt.value === status);
    const StatusIcon = currentStatus?.icon || UserCheck;

    return (
        <div className="container max-w-md mx-auto p-4">
            <div className="flex items-center mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-normal">Check-In & Availability</h1>
            </div>

            {/* Status Card */}
            <Card className="mb-6 border-2 border-primary/20">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <CardTitle>Current Status</CardTitle>
                        <Badge
                            className={`${currentStatus?.bgColor} ${currentStatus?.color}`}
                        >
                            {currentStatus?.label}
                        </Badge>
                    </div>
                    <CardDescription>Set your availability status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className={`h-10 w-10 rounded-full ${currentStatus?.bgColor} flex items-center justify-center`}>
                                <StatusIcon className={`h-5 w-5 ${currentStatus?.color}`} />
                            </div>
                            <div>
                                <div className="font-medium">{currentStatus?.label}</div>
                                <div className="text-xs text-muted-foreground">{currentStatus?.description}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium">{currentTime}</div>
                            <div className="text-xs text-muted-foreground">{currentDate}</div>
                        </div>
                    </div>

                    <RadioGroup
                        value={status}
                        onValueChange={setStatus}
                        className="grid grid-cols-2 gap-2"
                    >
                        {statusOptions.map((option) => (
                            <Label
                                key={option.value}
                                htmlFor={option.value}
                                className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer ${status === option.value
                                    ? "border-primary bg-primary/5"
                                    : "hover:bg-muted/50"
                                    }`}
                            >
                                <RadioGroupItem
                                    value={option.value}
                                    id={option.value}
                                    className="sr-only"
                                />
                                <div className={`h-8 w-8 rounded-full ${option.bgColor} flex items-center justify-center`}>
                                    {React.createElement(option.icon, { className: `h-4 w-4 ${option.color}` })}
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{option.label}</div>
                                    <div className="text-xs text-muted-foreground">{option.description}</div>
                                </div>
                            </Label>
                        ))}
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Check-in Details */}
            <Tabs defaultValue="today" className="mb-6">
                <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="today" className="mt-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Today's Activity</CardTitle>
                            <CardDescription>Shift time: 8:00 AM - 5:00 PM</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Hours worked</span>
                                </div>
                                <span className="font-medium">{hoursWorked}</span>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <UserCheck className="h-3 w-3 text-green-500" />
                                        </div>
                                        <span>Available</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span>8:00 AM</span>
                                        <span className="text-xs text-muted-foreground">Check-in</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <Truck className="h-3 w-3 text-blue-500" />
                                        </div>
                                        <span>On Delivery</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span>8:15 AM</span>
                                        <span className="text-xs text-muted-foreground">Status change</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                                            <Coffee className="h-3 w-3 text-amber-500" />
                                        </div>
                                        <span>On Break</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span>12:00 PM</span>
                                        <span className="text-xs text-muted-foreground">Status change</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <Truck className="h-3 w-3 text-blue-500" />
                                        </div>
                                        <span>On Delivery</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span>12:45 PM</span>
                                        <span className="text-xs text-muted-foreground">Status change</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="history">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Previous Activity</CardTitle>
                            <CardDescription>Last 7 days</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Yesterday</span>
                                </div>
                                <span className="text-sm">8h 15m</span>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Monday, Apr 21</span>
                                </div>
                                <span className="text-sm">7h 45m</span>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Friday, Apr 19</span>
                                </div>
                                <span className="text-sm">8h 30m</span>
                            </div>

                            <Button variant="outline" className="w-full" size="sm">
                                View Full History
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Settings */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Location Settings</CardTitle>
                    <CardDescription>Configure GPS and auto check-in</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="auto-checkin" className="font-medium">Auto Check-In</Label>
                            <p className="text-xs text-muted-foreground">
                                Automatically check in when arriving at locations
                            </p>
                        </div>
                        <Switch
                            id="auto-checkin"
                            checked={autoCheckIn}
                            onCheckedChange={setAutoCheckIn}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="location-sharing" className="font-medium">Location Sharing</Label>
                            <p className="text-xs text-muted-foreground">
                                Share location with dispatch during work hours
                            </p>
                        </div>
                        <Switch
                            id="location-sharing"
                            checked={locationSharing}
                            onCheckedChange={setLocationSharing}
                        />
                    </div>

                    <div className="rounded-md bg-blue-500/10 p-3 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div className="text-xs">
                            <p className="font-medium text-blue-500">Location data is used only during work hours</p>
                            <p className="text-muted-foreground">Your privacy is protected according to our policy</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6">
                <Button className="w-full" size="lg">
                    Update Status
                </Button>
            </div>
        </div>
    );
}