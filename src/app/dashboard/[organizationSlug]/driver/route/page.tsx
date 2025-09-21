"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from '@/components/ui/button';
import {
    MapPin,
    Navigation,
    Clock,
    ChevronLeft,
    Check,
    X,
    ChevronRight,
    Star,
    Award,
    Truck,
    AlertCircle,
    PlusCircle
} from "lucide-react";

export default function DriverRoute() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("map");
    const [routeProgress, setRouteProgress] = useState(60);

    // Mock route data
    const routeData = {
        totalStops: 8,
        completedStops: 5,
        remainingStops: 3,
        routeName: "Nairobi Central",
        estimatedCompletion: "4:30 PM",
        routeEfficiency: 92,
        stops: [
            {
                id: "stop1",
                name: "Westlands Liquor Store",
                address: "54 Waiyaki Way, Westlands",
                time: "10:30 AM",
                completed: true,
                status: "completed",
                items: 5
            },
            {
                id: "stop2",
                name: "Central Bar & Restaurant",
                address: "27 Kenyatta Ave, CBD",
                time: "11:45 AM",
                completed: true,
                status: "completed",
                items: 3
            },
            {
                id: "stop3",
                name: "Kilimani Wine Shop",
                address: "12 Argwings Kodhek Rd",
                time: "1:15 PM",
                completed: true,
                status: "completed",
                items: 8
            },
            {
                id: "stop4",
                name: "Karen Country Club",
                address: "Karen Road",
                time: "2:30 PM",
                completed: true,
                status: "completed",
                items: 12
            },
            {
                id: "stop5",
                name: "Lavington Green Mall",
                address: "James Gichuru Rd",
                time: "3:20 PM",
                completed: true,
                status: "completed",
                items: 6
            },
            {
                id: "stop6",
                name: "Rosslyn Riviera Mall",
                address: "Limuru Rd, Gigiri",
                time: "3:45 PM",
                completed: false,
                status: "current",
                items: 4
            },
            {
                id: "stop7",
                name: "Garden City Mall",
                address: "Thika Road",
                time: "4:15 PM",
                completed: false,
                status: "upcoming",
                items: 7
            },
            {
                id: "stop8",
                name: "Two Rivers Mall",
                address: "Limuru Rd, Ruaka",
                time: "4:30 PM",
                completed: false,
                status: "upcoming",
                items: 5
            }
        ],
        opportunities: [
            {
                id: "opp1",
                name: "Kilifi Coastal Route",
                description: "High-volume weekend deliveries",
                stops: 10,
                earnings: "+15%",
                timeframe: "Next Weekend",
                status: "available"
            },
            {
                id: "opp2",
                name: "Mombasa Central",
                description: "Premium clients, high-value orders",
                stops: 12,
                earnings: "+25%",
                timeframe: "Next Month",
                status: "coming-soon"
            }
        ]
    };

    // Helper function for stop status
    const getStopStatusClasses = (status: string) => {
        switch (status) {
            case 'completed':
                return {
                    iconBg: "bg-green-500/10",
                    iconColor: "text-green-500",
                    icon: Check
                };
            case 'current':
                return {
                    iconBg: "bg-blue-500/10",
                    iconColor: "text-blue-500",
                    icon: Navigation
                };
            case 'upcoming':
                return {
                    iconBg: "bg-slate-500/10",
                    iconColor: "text-slate-500",
                    icon: Clock
                };
            default:
                return {
                    iconBg: "bg-slate-500/10",
                    iconColor: "text-slate-500",
                    icon: MapPin
                };
        }
    };

    return (
        <div className="container max-w-md mx-auto p-2">
            <div className="flex items-center mb-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="mr-1"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-light">Your Route</h1>
            </div>

            {/* Route Summary Card */}
            <Card className="mb-6 border-2 border-green-500/20">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <CardTitle>Today's Route</CardTitle>
                        <Badge className="bg-green-500/10 text-green-500">
                            {routeProgress}% Complete
                        </Badge>
                    </div>
                    <CardDescription>{routeData.routeName} • {routeData.totalStops} stops</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Progress value={routeProgress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="flex flex-col items-center justify-center p-2 rounded-md bg-green-500/10">
                            <span className="text-xs text-muted-foreground">Completed</span>
                            <span className="text-lg font-bold text-green-500">{routeData.completedStops}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 rounded-md bg-blue-500/10">
                            <span className="text-xs text-muted-foreground">Remaining</span>
                            <span className="text-lg font-bold text-blue-500">{routeData.remainingStops}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 rounded-md bg-purple-500/10">
                            <span className="text-xs text-muted-foreground">ETA</span>
                            <span className="text-lg font-bold text-purple-500">{routeData.estimatedCompletion}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-amber-500" />
                            <span className="text-sm">Route Efficiency</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-bold text-amber-500">{routeData.routeEfficiency}%</span>
                            <Badge variant="outline" className="ml-2 text-xs bg-amber-500/10 text-amber-500">
                                Top 10%
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Route Details Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="map">Map View</TabsTrigger>
                    <TabsTrigger value="list">Stop List</TabsTrigger>
                </TabsList>

                <TabsContent value="map" className="mt-2">
                    <Card className='py-1'>
                        <CardContent className="py-1 mb-1">
                            <div className="relative w-full h-64 bg-slate-100 flex items-center justify-center">
                                {/* This would be replaced with an actual map component */}
                                <div className="text-center p-4">
                                    <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                                    <div className="text-sm text-muted-foreground">
                                        Interactive map would display here
                                    </div>
                                    <div className="mt-2">
                                        <Badge className="bg-blue-500/10 text-blue-500">Current: Rosslyn Riviera Mall</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Navigation className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium">Current Stop</span>
                                    </div>
                                    <Badge className="bg-blue-500/10 text-blue-500">In Progress</Badge>
                                </div>

                                <div className="mb-4">
                                    <h3 className="font-medium">Rosslyn Riviera Mall</h3>
                                    <div className="text-sm text-muted-foreground">Limuru Rd, Gigiri</div>
                                    <div className="text-sm">4 items to deliver</div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Button size="sm" className="gap-1">
                                        <Check className="h-4 w-4" />
                                        Mark Complete
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-1">
                                        <Clock className="h-4 w-4" />
                                        ETA: 15 min
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="list" className="mt-2">
                    <Card className='py-1'>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">All Stops</CardTitle>
                            <CardDescription>Optimized delivery sequence</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 mb-1">
                            {routeData.stops.map((stop) => {
                                const statusClasses = getStopStatusClasses(stop.status);
                                const StatusIcon = statusClasses.icon;

                                return (
                                    <div key={stop.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-slate-50">
                                        <div className={`flex-shrink-0 h-8 w-8 rounded-full ${statusClasses.iconBg} flex items-center justify-center mt-1`}>
                                            <StatusIcon className={`h-4 w-4 ${statusClasses.iconColor}`} />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium">{stop.name}</div>
                                                <span className="text-xs">{stop.time}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">{stop.address}</div>
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="text-xs">
                                                    <Badge variant="outline" className="text-xs">
                                                        {stop.items} items
                                                    </Badge>
                                                </div>
                                                {stop.status === 'current' && (
                                                    <Button variant="ghost" size="sm" className="h-6 py-1 px-2">
                                                        Details
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Opportunities Card */}
            <Card className="mb-3 py-1">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Award className="h-4 w-4 text-amber-500" />
                            Route Opportunities
                        </CardTitle>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                            New!
                        </Badge>
                    </div>
                    <CardDescription>Special routes for top performers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {routeData.opportunities.map((opp) => (
                        <Card key={opp.id} className="border border-amber-200">
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-medium">{opp.name}</div>
                                        <div className="text-xs text-muted-foreground">{opp.description}</div>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex items-center gap-1 text-xs">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                <span>{opp.stops} stops</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                                <Star className="h-3 w-3 text-amber-500" />
                                                <span className="text-amber-500">{opp.earnings}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <span>{opp.timeframe}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={opp.status === 'available' ? 'default' : 'outline'}
                                        className="h-7 text-xs mb-1"
                                        disabled={opp.status !== 'available'}
                                    >
                                        {opp.status === 'available' ? 'Apply' : 'Coming Soon'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>

            {/* Performance Card */}
            <Card className='py-1'>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        Route Performance
                    </CardTitle>
                    <CardDescription>Your delivery statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="text-sm">On-time deliveries</div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">98%</span>
                            <Badge className="bg-green-500/10 text-green-500">
                                +2%
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">Customer satisfaction</div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">4.9/5</span>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="h-3 w-3 text-amber-500" fill={star < 5 ? "#f59e0b" : "none"} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">Route efficiency</div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">92%</span>
                            <Badge className="bg-green-500/10 text-green-500">
                                Top 10%
                            </Badge>
                        </div>
                    </div>

                    <div className="rounded-md bg-blue-500/10 p-3 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div className="text-xs">
                            <p className="font-medium text-blue-500">Your performance qualifies for premium routes</p>
                            <p className="text-muted-foreground">Keep up the good work to maintain eligibility</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-0 mb-1">
                    <Button variant="outline" className="w-full text-xs h-8" size="sm">
                        View Detailed Performance
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}