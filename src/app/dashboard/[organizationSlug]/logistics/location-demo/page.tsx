"use client"

import { useState } from "react"
import { Battery, MapPin, Navigation, RefreshCw, Settings, Thermometer, Truck, Wifi } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUltraGeolocation } from "@/hooks/use-geolocation"

export default function GeolocationDemo() {
    const [options, setOptions] = useState({
        deliveryMode: true,
        heatReductionMode: true,
        batteryOptimization: true,
        backgroundTracking: true
    })

    const location = useUltraGeolocation(options)

    const formatTime = (timestamp: number | null) => {
        if (!timestamp) return "Never"
        return new Date(timestamp).toLocaleTimeString()
    }

    const getAccuracyColor = (accuracy: number | undefined) => {
        if (!accuracy) return "text-gray-500"
        if (accuracy <= 10) return "text-green-600"
        if (accuracy <= 50) return "text-yellow-600"
        return "text-red-600"
    }

    const toggleOption = (option: keyof typeof options) => {
        setOptions(prev => ({
            ...prev,
            [option]: !prev[option]
        }))
    }

    return (
        <div className="max-w-4xl mx-auto px-4 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    <MapPin className="w-8 h-8 text-red-600" />
                    Tests @Geolocation
                </h1>
                <p className="text-gray-600">
                    Optimized for delivery riders in Kenya's unique conditions
                </p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Optimization Settings
                    </CardTitle>
                    <CardDescription>
                        Configure the geolocation hook for your specific needs
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="delivery-mode"
                                checked={options.deliveryMode}
                                onCheckedChange={() => toggleOption('deliveryMode')}
                            />
                            <Label htmlFor="delivery-mode" className="flex items-center gap-2">
                                <Truck className="w-4 h-4" />
                                Delivery Mode
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="heat-reduction"
                                checked={options.heatReductionMode}
                                onCheckedChange={() => toggleOption('heatReductionMode')}
                            />
                            <Label htmlFor="heat-reduction" className="flex items-center gap-2">
                                <Thermometer className="w-4 h-4" />
                                Heat Reduction
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="battery-optimization"
                                checked={options.batteryOptimization}
                                onCheckedChange={() => toggleOption('batteryOptimization')}
                            />
                            <Label htmlFor="battery-optimization" className="flex items-center gap-2">
                                <Battery className="w-4 h-4" />
                                Battery Optimization
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="background-tracking"
                                checked={options.backgroundTracking}
                                onCheckedChange={() => toggleOption('backgroundTracking')}
                            />
                            <Label htmlFor="background-tracking" className="flex items-center gap-2">
                                <Navigation className="w-4 h-4" />
                                Background Tracking
                            </Label>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Location Context</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {location.inNairobi && (
                                <Badge className="bg-blue-500">Nairobi</Badge>
                            )}
                            {location.inMombasa && (
                                <Badge className="bg-blue-500">Mombasa</Badge>
                            )}
                            {location.inMajorCity && !location.inNairobi && !location.inMombasa && (
                                <Badge className="bg-blue-500">Major City</Badge>
                            )}
                            {!location.inMajorCity && (
                                <Badge variant="outline">Rural Area</Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Signal Quality</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Wifi className={`w-5 h-5 ${location.signalStrength === 'excellent' ? 'text-green-500' :
                                location.signalStrength === 'good' ? 'text-blue-500' :
                                    location.signalStrength === 'fair' ? 'text-yellow-500' :
                                        'text-red-500'
                                }`} />
                            <span className="font-medium capitalize">
                                {location.signalStrength || 'Unknown'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Network: {location.networkQuality || 'Detecting...'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Battery Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Battery className={`w-5 h-5 ${location.batteryLevel > 0.7 ? 'text-green-500' :
                                location.batteryLevel > 0.3 ? 'text-yellow-500' :
                                    'text-red-500'
                                }`} />
                            <span className="font-medium">
                                {Math.round((location.batteryLevel || 0) * 100)}%
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Device Temperature: {location.isDeviceHot ? 'Hot' : 'Normal'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tracking Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${location.isWatching ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                            <span className="font-medium">
                                {location.isWatching ? 'Live Tracking' : 'Idle'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Last updated: {formatTime(location.lastUpdated)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Location Display */}
            <Card className="bg-white">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-500" />
                            Current Location
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={location.getLocation}
                                disabled={location.loading}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${location.loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button
                                size="sm"
                                onClick={location.isWatching ? location.stopWatching : location.startWatching}
                                variant={location.isWatching ? "destructive" : "default"}
                            >
                                {location.isWatching ? 'Stop Tracking' : 'Start Tracking'}
                            </Button>
                        </div>
                    </div>
                    {location.loading && (
                        <CardDescription>
                            Getting precise location...
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    {location.error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
                            <strong>Error:</strong> {location.error}
                        </div>
                    )}

                    {location.location ? (
                        <Tabs defaultValue="coordinates" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="coordinates">Coordinates</TabsTrigger>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="developer">Developer</TabsTrigger>
                            </TabsList>
                            <TabsContent value="coordinates" className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-500">Latitude</div>
                                        <div className="text-lg font-mono text-gray-900">
                                            {location.location.latitude.toFixed(6)}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-500">Longitude</div>
                                        <div className="text-lg font-mono text-gray-900">
                                            {location.location.longitude.toFixed(6)}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="details" className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-500">Accuracy</div>
                                        <div className={`text-lg font-semibold ${getAccuracyColor(location.location.accuracy)}`}>
                                            ±{Math.round(location.location.accuracy)}m
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-500">Speed</div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            {location.location.speed !== null
                                                ? `${Math.round((location.location.speed || 0) * 3.6)} km/h`
                                                : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-500">Accuracy Score</div>
                                        <div className="text-lg font-semibold text-blue-600">
                                            {location.getAccuracyScore()}%
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="developer" className="pt-4">
                                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-white overflow-auto">
                                    <pre>{JSON.stringify(location.coordinates, null, 2)}</pre>
                                    <div className="mt-2 pt-2 border-t border-gray-700">
                                        <div className="text-green-400">locationString: "{location.locationString}"</div>
                                        <div className="text-blue-400 mt-1">accuracyScore: {location.getAccuracyScore()}%</div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="py-8 text-center text-gray-500">
                            {location.loading ? (
                                <div className="flex flex-col items-center">
                                    <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                                    <p>Getting your location...</p>
                                </div>
                            ) : (
                                <p>No location data available. Click "Refresh" to get your location.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Performance Insights */}
            {location.location && (
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Insights</CardTitle>
                        <CardDescription>
                            Real-time metrics from the Ultra Kenya Geolocation hook
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-600">{location.getAccuracyScore()}</div>
                                <div className="text-xs text-gray-600">Accuracy Score</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {location.hasHighAccuracyFix ? 'GPS' : 'NET'}
                                </div>
                                <div className="text-xs text-gray-600">Source Type</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {location.batteryOptimized ? 'ON' : 'OFF'}
                                </div>
                                <div className="text-xs text-gray-600">Battery Saving</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {location.inMajorCity ? 'CITY' : 'RURAL'}
                                </div>
                                <div className="text-xs text-gray-600">Area Type</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
