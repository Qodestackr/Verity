"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Button
} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ClipboardCheck,
    ChevronLeft,
    Check,
    X,
    Camera,
    CreditCard,
    Clock,
    Calendar,
    AlertCircle,
    Building,
    FileText,
    Search,
    AlertTriangle,
    CheckCircle
} from "lucide-react";

export default function DeliveryChecklist() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("today");

    // Mock data for completed checklists
    const checklistData = {
        today: [
            {
                id: "del-123",
                customer: "Rosslyn Riviera Mall",
                time: "3:45 PM",
                status: "completed",
                items: [
                    { name: "Verify Order Items", completed: true },
                    { name: "Client Signature", completed: true },
                    { name: "Capture Proof of Delivery", completed: true },
                    { name: "Collect Payment", completed: true, amount: "KSh 24,500" },
                    { name: "Client Feedback", completed: true, rating: 5 }
                ],
                notes: "Delivered to receiving dock as requested. Security verification took extra time.",
                proofImages: 2,
                invoice: "INV-5672"
            },
            {
                id: "del-124",
                customer: "Garden City Mall",
                time: "4:15 PM",
                status: "completed",
                items: [
                    { name: "Verify Order Items", completed: true },
                    { name: "Client Signature", completed: true },
                    { name: "Capture Proof of Delivery", completed: true },
                    { name: "Collect Payment", completed: true, amount: "KSh 18,750" },
                    { name: "Client Feedback", completed: true, rating: 4 }
                ],
                notes: "",
                proofImages: 1,
                invoice: "INV-5673"
            },
            {
                id: "del-125",
                customer: "Two Rivers Mall",
                time: "4:50 PM",
                status: "failed",
                items: [
                    { name: "Verify Order Items", completed: false },
                    { name: "Client Signature", completed: false },
                    { name: "Capture Proof of Delivery", completed: false },
                    { name: "Collect Payment", completed: false },
                    { name: "Client Feedback", completed: false }
                ],
                failureReason: "Establishment closed early - no staff available",
                failureEvidence: 1,
                rescheduleDate: "Apr 24, 2025"
            }
        ],
        previous: [
            {
                id: "del-118",
                customer: "Westlands Liquor Store",
                date: "Apr 22, 2025",
                time: "10:30 AM",
                status: "completed",
                items: [
                    { name: "Verify Order Items", completed: true },
                    { name: "Client Signature", completed: true },
                    { name: "Capture Proof of Delivery", completed: true },
                    { name: "Collect Payment", completed: true, amount: "KSh 32,100" },
                    { name: "Client Feedback", completed: true, rating: 5 }
                ],
                notes: "Repeat customer, very satisfied with service",
                proofImages: 3,
                invoice: "INV-5665"
            },
            {
                id: "del-119",
                customer: "Central Bar & Restaurant",
                date: "Apr 22, 2025",
                time: "11:45 AM",
                status: "partial",
                items: [
                    { name: "Verify Order Items", completed: true, note: "Missing 2 bottles of premium vodka" },
                    { name: "Client Signature", completed: true },
                    { name: "Capture Proof of Delivery", completed: true },
                    { name: "Collect Payment", completed: true, amount: "KSh 14,850" },
                    { name: "Client Feedback", completed: true, rating: 3 }
                ],
                notes: "Client unhappy with missing items. Follow-up needed.",
                proofImages: 2,
                invoice: "INV-5666"
            }
        ]
    };

    // Helper function for status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-500/10 text-green-500">Completed</Badge>;
            case 'partial':
                return <Badge className="bg-amber-500/10 text-amber-500">Partial</Badge>;
            case 'failed':
                return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
            default:
                return <Badge className="bg-slate-500/10 text-slate-500">{status}</Badge>;
        }
    };

    // Helper function for checklist item icon
    const getCheckIcon = (completed) => {
        if (completed) {
            return <Check className="h-3 w-3 text-green-500" />;
        }
        return <X className="h-3 w-3 text-red-500" />;
    };

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
                <h1 className="text-2xl font-normal">Delivery Checklist</h1>
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-md bg-amber-600/10 flex items-center justify-center">
                        <ClipboardCheck className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <div className="font-medium">Delivery Records</div>
                        <div className="text-xs text-muted-foreground">Completed tasks & status updates</div>
                    </div>
                </div>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                    <Search className="h-3.5 w-3.5" />
                    <span className="text-xs">Filter</span>
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="previous">Previous</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="mt-4 space-y-4">
                    {checklistData.today.map((delivery) => (
                        <Card key={delivery.id} className={`overflow-hidden border-l-4 ${delivery.status === 'completed' ? 'border-l-green-500' :
                            delivery.status === 'partial' ? 'border-l-amber-500' : 'border-l-red-500'
                            }`}>
                            <CardHeader className="p-3 pb-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <CardTitle className="text-base">{delivery.customer}</CardTitle>
                                    </div>
                                    {getStatusBadge(delivery.status)}
                                </div>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{delivery.time}</span>
                                    {delivery.invoice && (
                                        <>
                                            <FileText className="h-3.5 w-3.5 ml-2" />
                                            <span>{delivery.invoice}</span>
                                        </>
                                    )}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-3">
                                {delivery.status !== 'failed' ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 gap-1">
                                            {delivery.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center text-xs">
                                                    <div className="w-5 flex justify-center mr-1">
                                                        {getCheckIcon(item.completed)}
                                                    </div>
                                                    <span className={`${item.completed ? '' : 'text-muted-foreground line-through'}`}>
                                                        {item.name}
                                                    </span>
                                                    {item.amount && (
                                                        <Badge className="ml-auto text-xs bg-blue-500/10 text-blue-500">{item.amount}</Badge>
                                                    )}
                                                    {item.rating && (
                                                        <div className="ml-auto flex items-center">
                                                            {Array(item.rating).fill(0).map((_, i) => (
                                                                <div key={i} className="text-amber-500">★</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {item.note && (
                                                        <span className="ml-2 text-xs text-red-500">{item.note}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {delivery.notes && (
                                            <div className="rounded-md bg-slate-100 p-2 text-xs">
                                                <p>{delivery.notes}</p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            {delivery.proofImages > 0 && (
                                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                                    <Camera className="h-3 w-3" />
                                                    {delivery.proofImages} photo{delivery.proofImages > 1 ? 's' : ''}
                                                </Badge>
                                            )}
                                            {delivery.status === 'completed' && (
                                                <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" />
                                                    All items verified
                                                </Badge>
                                            )}
                                            {delivery.status === 'partial' && (
                                                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 text-xs flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Partial delivery
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2 rounded-md bg-red-50 p-2">
                                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <div className="text-xs">
                                                <p className="font-medium text-red-500">Delivery Failed</p>
                                                <p>{delivery.failureReason}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Rescheduled: {delivery.rescheduleDate}</span>
                                            </div>
                                            {delivery.failureEvidence > 0 && (
                                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                                    <Camera className="h-3 w-3" />
                                                    {delivery.failureEvidence} photo{delivery.failureEvidence > 1 ? 's' : ''}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 mt-3">
                                    <Button size="sm" variant="outline" className="text-xs h-7 w-full">
                                        View Details
                                    </Button>
                                    <Button size="sm" className="text-xs h-7 w-full">
                                        <FileText className="h-3.5 w-3.5 mr-1" />
                                        Report
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="previous" className="mt-4 space-y-4">
                    {checklistData.previous.map((delivery) => (
                        <Card key={delivery.id} className={`overflow-hidden border-l-4 ${delivery.status === 'completed' ? 'border-l-green-500' :
                            delivery.status === 'partial' ? 'border-l-amber-500' : 'border-l-red-500'
                            }`}>
                            <CardHeader className="p-3 pb-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <CardTitle className="text-base">{delivery.customer}</CardTitle>
                                    </div>
                                    {getStatusBadge(delivery.status)}
                                </div>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{delivery.date}</span>
                                    <Clock className="h-3.5 w-3.5 ml-2" />
                                    <span>{delivery.time}</span>
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-3">
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 gap-1">
                                        {delivery.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center text-xs">
                                                <div className="w-5 flex justify-center mr-1">
                                                    {getCheckIcon(item.completed)}
                                                </div>
                                                <span className={`${item.completed ? '' : 'text-muted-foreground line-through'}`}>
                                                    {item.name}
                                                </span>
                                                {item.amount && (
                                                    <Badge className="ml-auto text-xs bg-blue-500/10 text-blue-500">{item.amount}</Badge>
                                                )}
                                                {item.rating && (
                                                    <div className="ml-auto flex items-center">
                                                        {Array(item.rating).fill(0).map((_, i) => (
                                                            <div key={i} className="text-amber-500">★</div>
                                                        ))}
                                                    </div>
                                                )}
                                                {item.note && (
                                                    <span className="ml-2 text-xs text-red-500">{item.note}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {delivery.notes && (
                                        <div className="rounded-md bg-slate-100 p-2 text-xs">
                                            <p>{delivery.notes}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        {delivery.proofImages > 0 && (
                                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                                                <Camera className="h-3 w-3" />
                                                {delivery.proofImages} photo{delivery.proofImages > 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                        {delivery.status === 'completed' && (
                                            <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                All items verified
                                            </Badge>
                                        )}
                                        {delivery.status === 'partial' && (
                                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 text-xs flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Partial delivery
                                            </Badge>
                                        )}
                                    </div>

                                    <Button size="sm" variant="outline" className="text-xs h-7 w-full">
                                        View Full Report
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>

            <div className="bg-blue-50 rounded-md p-3 flex items-start gap-2 mb-6">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                    <p className="font-medium text-blue-500">Checklist Completion Rate: 92%</p>
                    <p className="text-muted-foreground">Complete all delivery verification steps to maintain your high rating.</p>
                </div>
            </div>
        </div>
    );
}