"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Calendar, TrendingUp, AlertTriangle, Download, RefreshCw, Loader2, CalendarIcon, Brain } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { toast } from "sonner"

// Types
type ForecastItem = {
    date: string
    actual: number
    predicted: number
    lower: number
    upper: number
}

type EventType = {
    id: string
    name: string
    date: string
    impact: "high" | "medium" | "low"
    category: "sports" | "holiday" | "local" | "weather" | "custom"
    description: string
}

type ProductType = {
    id: string
    name: string
    category: string
    currentStock: number
    reorderPoint: number
    optimalStock: number
    suggestedOrder: number
    trend: "up" | "down" | "stable"
    riskLevel: "high" | "medium" | "low"
}

export function SmartForecasting() {
    const { formatCurrency } = useCurrency();

    const [isLoading, setIsLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState<string>("tusker-lager")
    const [forecastRange, setForecastRange] = useState<string>("14")
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [isGenerating, setIsGenerating] = useState(false)

    // Sample data
    const [forecastData, setForecastData] = useState<ForecastItem[]>([])
    const [events, setEvents] = useState<EventType[]>([])
    const [products, setProducts] = useState<ProductType[]>([])

    useEffect(() => {
        // Simulate API call to load data
        const loadData = async () => {
            setIsLoading(true)
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000))

                // Generate sample forecast data
                const today = new Date()
                const newForecastData: ForecastItem[] = []

                for (let i = 0; i < 30; i++) {
                    const date = new Date(today)
                    date.setDate(date.getDate() + i)

                    // Create some patterns - higher on weekends, with some randomness
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6
                    const baseValue = isWeekend ? 120 : 70
                    const randomFactor = Math.random() * 20 - 10
                    const predicted = Math.round(baseValue + randomFactor)

                    // Add some special event spikes
                    const isSpecialDay = i === 5 || i === 12 || i === 19
                    const specialDayBoost = isSpecialDay ? 50 : 0

                    newForecastData.push({
                        date: format(date, "MMM dd"),
                        actual: i < 7 ? Math.round(predicted * (0.9 + Math.random() * 0.2)) : 0, // Only show actual for past days
                        predicted: predicted + specialDayBoost,
                        lower: Math.round((predicted + specialDayBoost) * 0.8),
                        upper: Math.round((predicted + specialDayBoost) * 1.2),
                    })
                }

                setForecastData(newForecastData)

                // Sample events
                setEvents([
                    {
                        id: "1",
                        name: "Champions League Final",
                        date: format(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
                        impact: "high",
                        category: "sports",
                        description: "Expected 40% increase in beer sales based on previous finals",
                    },
                    {
                        id: "2",
                        name: "Public Holiday",
                        date: format(new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
                        impact: "medium",
                        category: "holiday",
                        description: "Historical data shows 25% increase in overall sales",
                    },
                    {
                        id: "3",
                        name: "Local Festival",
                        date: format(new Date(today.getTime() + 19 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
                        impact: "high",
                        category: "local",
                        description: "Expected 35% increase in spirits and wine",
                    },
                    {
                        id: "4",
                        name: "Heavy Rain Forecast",
                        date: format(new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
                        impact: "low",
                        category: "weather",
                        description: "Typically sees 15% decrease in foot traffic",
                    },
                ])

                // Sample products
                setProducts([
                    {
                        id: "tusker-lager",
                        name: "Tusker Lager",
                        category: "Beer",
                        currentStock: 145,
                        reorderPoint: 100,
                        optimalStock: 300,
                        suggestedOrder: 155,
                        trend: "up",
                        riskLevel: "low",
                    },
                    {
                        id: "johnnie-walker-black",
                        name: "Johnnie Walker Black",
                        category: "Whisky",
                        currentStock: 28,
                        reorderPoint: 25,
                        optimalStock: 60,
                        suggestedOrder: 32,
                        trend: "stable",
                        riskLevel: "medium",
                    },
                    {
                        id: "kenya-cane",
                        name: "Kenya Cane",
                        category: "Spirits",
                        currentStock: 18,
                        reorderPoint: 30,
                        optimalStock: 75,
                        suggestedOrder: 57,
                        trend: "down",
                        riskLevel: "high",
                    },
                    {
                        id: "four-cousins",
                        name: "Four Cousins",
                        category: "Wine",
                        currentStock: 42,
                        reorderPoint: 40,
                        optimalStock: 80,
                        suggestedOrder: 38,
                        trend: "up",
                        riskLevel: "low",
                    },
                ])
            } catch (error) {
                console.error("Error loading forecast data:", error)
                toast.error("Failed to load forecast data")
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

    const handleProductChange = (value: string) => {
        setSelectedProduct(value)
        // In a real app, this would trigger an API call to get data for the selected product
    }

    const handleRangeChange = (value: string) => {
        setForecastRange(value)
        // In a real app, this would adjust the forecast range
    }

    const handleGenerateForecast = async () => {
        setIsGenerating(true)
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000))
            toast.success("Forecast updated", {
                description: "AI model has incorporated the latest sales data and events",
            })
        } catch (error) {
            toast.error("Failed to generate forecast")
        } finally {
            setIsGenerating(false)
        }
    }

    const selectedProductData = products.find((p) => p.id === selectedProduct)

    // Filter forecast data based on selected range
    const filteredForecastData = forecastData.slice(0, Number.parseInt(forecastRange))

    return (
        <Card className="border-emerald-100 dark:border-emerald-900/30">
            <CardHeader className="pb-3 border-b border-emerald-100 dark:border-emerald-900/30">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-lg font-normal">Smart Inventory Forecasting</CardTitle>
                        <CardDescription>AI-powered demand prediction with event correlation</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleGenerateForecast} disabled={isGenerating}>
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Update Forecast
                                </>
                            )}
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <div className="p-2">
                <div className="flex flex-col md:flex-row gap-3 mb-2">
                    <div className="flex-1 space-y-4 h-full">
                        <div className="flex flex-col md:flex-row gap-2">
                            <Select value={selectedProduct} onValueChange={handleProductChange}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={product.id}>
                                            {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={forecastRange} onValueChange={handleRangeChange}>
                                <SelectTrigger className="w-full md:w-[150px]">
                                    <SelectValue placeholder="Forecast range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">7 days</SelectItem>
                                    <SelectItem value="14">14 days</SelectItem>
                                    <SelectItem value="30">30 days</SelectItem>
                                </SelectContent>
                            </Select>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full md:w-[180px] justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {selectedProductData && (
                            <Card className="p-1">
                                <CardContent className="p-1">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Current Stock</p>
                                            <p className="text-sm font-normal">{selectedProductData.currentStock}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Reorder Point</p>
                                            <p className="text-sm font-normal">{selectedProductData.reorderPoint}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Optimal Stock</p>
                                            <p className="text-sm font-normal">{selectedProductData.optimalStock}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Suggested Order</p>
                                            <p className="text-sm font-normal">{selectedProductData.suggestedOrder}</p>
                                            <Badge
                                                className={
                                                    selectedProductData.riskLevel === "high"
                                                        ? "h-4 font-light text-xs bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                                                        : selectedProductData.riskLevel === "medium"
                                                            ? "h-4 font-light text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
                                                            : "h-4 font-light text-xs bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200"
                                                }
                                            >
                                                {selectedProductData.riskLevel === "high"
                                                    ? "High Risk"
                                                    : selectedProductData.riskLevel === "medium"
                                                        ? "Medium Risk"
                                                        : "Low Risk"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-normal">Demand Forecast</CardTitle>
                                <CardDescription>Predicted sales with confidence intervals</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-80">
                                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart
                                            data={filteredForecastData}
                                            margin={{
                                                top: 20,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="actual"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                name="Actual Sales"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="predicted"
                                                stroke="#6366f1"
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                                dot={{ r: 4 }}
                                                name="Predicted Sales"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="upper"
                                                stroke="#d1d5db"
                                                strokeWidth={1}
                                                dot={false}
                                                name="Upper Bound"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="lower"
                                                stroke="#d1d5db"
                                                strokeWidth={1}
                                                dot={false}
                                                name="Lower Bound"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="w-full md:w-80">
                        <Card className="h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-normal">Upcoming Events</CardTitle>
                                <CardDescription>Events that may impact sales</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-40">
                                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {events.map((event) => (
                                            <div
                                                key={event.id}
                                                className="p-3 rounded-md border border-emerald-100 dark:border-emerald-900/30"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`p-1.5 rounded-md ${event.category === "sports"
                                                                ? "bg-blue-100 dark:bg-blue-900/30"
                                                                : event.category === "holiday"
                                                                    ? "bg-amber-100 dark:bg-amber-900/30"
                                                                    : event.category === "local"
                                                                        ? "bg-purple-100 dark:bg-purple-900/30"
                                                                        : event.category === "weather"
                                                                            ? "bg-slate-100 dark:bg-slate-900/30"
                                                                            : "bg-emerald-100 dark:bg-emerald-900/30"
                                                                }`}
                                                        >
                                                            <Calendar
                                                                className={`h-4 w-4 ${event.category === "sports"
                                                                    ? "text-blue-600"
                                                                    : event.category === "holiday"
                                                                        ? "text-amber-600"
                                                                        : event.category === "local"
                                                                            ? "text-purple-600"
                                                                            : event.category === "weather"
                                                                                ? "text-slate-600"
                                                                                : "text-emerald-600"
                                                                    }`}
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{event.name}</p>
                                                            <p className="text-xs text-muted-foreground">{event.date}</p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        className={
                                                            event.impact === "high"
                                                                ? "h-4 font-light text-xs bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                                                                : event.impact === "medium"
                                                                    ? "h-4 font-light text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
                                                                    : "h-4 font-light text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200"
                                                        }
                                                    >
                                                        {event.impact === "high"
                                                            ? "High Impact"
                                                            : event.impact === "medium"
                                                                ? "Medium Impact"
                                                                : "Low Impact"}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">{event.description}</p>
                                            </div>
                                        ))}

                                        <Button variant="outline" size="sm" className="w-full">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Track Custom Event
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>


                <div className="flex justify-start items-start my-4">
                    <Button variant="outline" size="sm" className="w-1/3 font-light">
                        <Brain className="mr-1 text-teal-700 h-4 w-4" />
                        Ask Baridi AI
                    </Button>
                </div>

                <Tabs defaultValue="insights" className="w-full">
                    <TabsList className="w-full grid grid-cols-3 mb-2">
                        <TabsTrigger className="text-xs" value="insights">
                            <TrendingUp className="text-emerald-600 h-4 w-4 mr-1" />
                            AI Insights
                        </TabsTrigger>
                        <TabsTrigger className="text-xs" value="risks">
                            <AlertTriangle className="text-orange-400  h-4 w-4 mr-1" />
                            Risk Analysis
                        </TabsTrigger>
                        <TabsTrigger className="text-xs" value="recommendations">
                            <Calendar className="text-teal-800 h-4 w-4 mr-1" />
                            Order Actions
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="insights" className="mt-0">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-normal">AI-Generated Insights</CardTitle>
                                <CardDescription>Smart analysis of your inventory and sales patterns</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="space-y-4">
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                                            <p className="font-medium">Champions League Final Impact</p>
                                        </div>
                                        <p className="text-sm">
                                            Based on historical data from similar events, expect a 40-45% increase in beer sales, particularly
                                            Tusker Lager and Guinness. Consider stocking an additional 120 units of Tusker Lager to meet
                                            demand.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                                            <p className="font-medium">Seasonal Trend Detected</p>
                                        </div>
                                        <p className="text-sm">
                                            Wine sales typically increase by 25% during this time of year. Four Cousins and Nederburg are your
                                            top performers. Consider running a wine promotion to capitalize on this trend.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                                            <p className="font-medium">Kenya Cane Stock Alert</p>
                                        </div>
                                        <p className="text-sm">
                                            Kenya Cane is currently below reorder point with upcoming events likely to increase demand. Order
                                            immediately to avoid stockouts during the Local Festival where spirits sales typically spike.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                                            <p className="font-medium">Weather Impact Analysis</p>
                                        </div>
                                        <p className="text-sm">
                                            The forecasted heavy rain on May 18th will likely reduce foot traffic by 15%. Consider running a
                                            delivery promotion to offset the expected drop in in-store sales.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="risks" className="mt-0">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-normal">Inventory Risk Analysis</CardTitle>
                                <CardDescription>Potential stockout and overstock risks</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="space-y-4">
                                    <div className="p-3 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 rounded-md">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                            <p className="font-medium text-red-800 dark:text-red-300">High Risk of Stockout</p>
                                        </div>
                                        <p className="text-sm">
                                            Kenya Cane (18 units) is below reorder point (30 units) with upcoming Local Festival expected to
                                            increase demand by 35%. Immediate order recommended.
                                        </p>
                                    </div>

                                    <div className="p-3 border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30 rounded-md">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                                            <p className="font-medium text-amber-800 dark:text-amber-300">Medium Risk of Stockout</p>
                                        </div>
                                        <p className="text-sm">
                                            Johnnie Walker Black (28 units) is close to reorder point (25 units). With current sales velocity,
                                            you may run out in 10-14 days.
                                        </p>
                                    </div>

                                    <div className="p-3 border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/30 rounded-md">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="h-4 w-4 text-blue-600" />
                                            <p className="font-medium text-blue-800 dark:text-blue-300">Potential Overstock</p>
                                        </div>
                                        <p className="text-sm">
                                            KEG Booze has been selling 30% below forecast for the past 2 weeks. Consider running a
                                            promotion to reduce inventory before expiration.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="recommendations" className="mt-0">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-normal">Smart Order Recommendations</CardTitle>
                                <CardDescription>AI-optimized order quantities based on forecasted demand</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="space-y-4">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-2 font-medium">Product</th>
                                                    <th className="text-right py-2 font-medium">Current Stock</th>
                                                    <th className="text-right py-2 font-medium">Forecasted Need</th>
                                                    <th className="text-right py-2 font-medium">Suggested Order</th>
                                                    <th className="text-right py-2 font-medium">Priority</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="py-2">Kenya Cane</td>
                                                    <td className="text-right py-2">18</td>
                                                    <td className="text-right py-2">75</td>
                                                    <td className="text-right py-2 font-medium">57</td>
                                                    <td className="text-right py-2">
                                                        <Badge className="h-4 font-light text-xs bg-red-100 text-red-800 hover:bg-red-200 border-red-200">High</Badge>
                                                    </td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2">Tusker Lager</td>
                                                    <td className="text-right py-2">145</td>
                                                    <td className="text-right py-2">300</td>
                                                    <td className="text-right py-2 font-medium">155</td>
                                                    <td className="text-right py-2">
                                                        <Badge className="h-4 font-light text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                                                            Medium
                                                        </Badge>
                                                    </td>
                                                </tr>
                                                <tr className="border-b text-xs">
                                                    <td className="py-2">Johnnie Walker Black</td>
                                                    <td className="text-right py-2">28</td>
                                                    <td className="text-right py-2">60</td>
                                                    <td className="text-right py-2 font-medium">32</td>
                                                    <td className="text-right py-2">
                                                        <Badge className="h-4 font-light text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                                                            Medium
                                                        </Badge>
                                                    </td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2">Four Cousins</td>
                                                    <td className="text-right py-2">42</td>
                                                    <td className="text-right py-2">80</td>
                                                    <td className="text-right py-2 font-medium">38</td>
                                                    <td className="text-right py-2">
                                                        <Badge className="h-4 font-light text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Low</Badge>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="h-4 w-4 text-emerald-600" />
                                            <p className="font-medium">Optimal Order Schedule</p>
                                        </div>
                                        <p className="text-sm">
                                            Place Kenya Cane order immediately. Order Tusker Lager and Johnnie Walker Black by May 15th to
                                            ensure stock for Champions League Final. Four Cousins can be ordered with regular weekly delivery.
                                        </p>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button className="h-8 bg-emerald-700 hover:bg-emerald-800">Generate Purchase Orders</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </Card>
    )
}
