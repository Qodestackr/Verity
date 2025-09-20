"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MapPin, Navigation, Clock, Check, Award, Truck } from "lucide-react"
import { useUpdateRouteStatus } from "@/hooks/use-driver-queries"

interface RouteProgressCardProps {
    route: {
        id: string
        name: string
        status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
        stops: string[]
        estimatedDuration?: number
        totalDistance?: number
        startedAt?: string
        completedAt?: string
        deliveries?: Array<{
            id: string
            customerName: string
            customerAddress: string
            status: string
            scheduledFor: string
        }>
    }
}

export function RouteProgressCard({
    route }: RouteProgressCardProps) {
    const updateRouteStatus = useUpdateRouteStatus()

    const completedStops = route.deliveries?.filter((d) => d.status === "DELIVERED").length || 0
    const totalStops = route.stops.length
    const progressPercentage = totalStops > 0 ? (completedStops / totalStops) * 100 : 0

    const handleStartRoute = async () => {
        try {
            await updateRouteStatus.mutateAsync({
                routeId: route.id,
                status: "IN_PROGRESS",
                startedAt: new Date().toISOString(),
            })
        } catch (error) {
            // Error handled by mutation
        }
    }

    const handleCompleteRoute = async () => {
        try {
            await updateRouteStatus.mutateAsync({
                routeId: route.id,
                status: "COMPLETED",
                completedAt: new Date().toISOString(),
            })
        } catch (error) {
            // Error handled by mutation
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PLANNED":
                return <Badge className="bg-blue-500/10 text-blue-500">Planned</Badge>
            case "IN_PROGRESS":
                return <Badge className="bg-amber-500/10 text-amber-500">In Progress</Badge>
            case "COMPLETED":
                return <Badge className="bg-green-500/10 text-green-500">Completed</Badge>
            case "CANCELLED":
                return <Badge className="bg-red-500/10 text-red-500">Cancelled</Badge>
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    const estimatedCompletion = route.estimatedDuration
        ? new Date(Date.now() + route.estimatedDuration * 60000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
        : "TBD"

    return (
        <Card className="border-2 border-emerald-500/20">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Today's Route</CardTitle>
                    {getStatusBadge(route.status)}
                </div>
                <div className="text-sm text-muted-foreground">
                    {route.name} • {totalStops} stops
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progressPercentage)}% Complete</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center justify-center p-2 rounded-md bg-green-500/10">
                        <span className="text-xs text-muted-foreground">Completed</span>
                        <span className="text-lg font-bold text-green-500">{completedStops}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-md bg-blue-500/10">
                        <span className="text-xs text-muted-foreground">Remaining</span>
                        <span className="text-lg font-bold text-blue-500">{totalStops - completedStops}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-md bg-purple-500/10">
                        <span className="text-xs text-muted-foreground">ETA</span>
                        <span className="text-lg font-bold text-purple-500">{estimatedCompletion}</span>
                    </div>
                </div>

                {route.totalDistance && (
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>Total Distance</span>
                        </div>
                        <span className="font-medium">{route.totalDistance.toFixed(1)} km</span>
                    </div>
                )}

                {route.estimatedDuration && (
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Estimated Duration</span>
                        </div>
                        <span className="font-medium">{Math.round(route.estimatedDuration)} min</span>
                    </div>
                )}

                <div className="flex gap-2">
                    {route.status === "PLANNED" && (
                        <Button className="flex-1" onClick={handleStartRoute} disabled={updateRouteStatus.isPending}>
                            <Truck className="h-4 w-4 mr-2" />
                            Start Route
                        </Button>
                    )}

                    {route.status === "IN_PROGRESS" && completedStops === totalStops && (
                        <Button className="flex-1" onClick={handleCompleteRoute} disabled={updateRouteStatus.isPending}>
                            <Check className="h-4 w-4 mr-2" />
                            Complete Route
                        </Button>
                    )}

                    <Button variant="outline" size="sm">
                        <Navigation className="h-4 w-4 mr-2" />
                        View Map
                    </Button>
                </div>

                {route.status === "COMPLETED" && (
                    <div className="bg-green-50 p-3 rounded-md">
                        <div className="flex items-center gap-2 text-green-700">
                            <Award className="h-4 w-4" />
                            <span className="text-sm font-medium">Route Completed Successfully!</span>
                        </div>
                        <div className="text-xs text-green-600 mt-1">All deliveries completed on time</div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
