"use client"

import { useState, useMemo } from "react"
import {
    BarChart3,
    TrendingUp,
    AlertTriangle,
    Package,
    Map,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Truck,
    Percent,
    Clock,
    RefreshCcw,
    ShoppingCart,
    Warehouse,
    Megaphone,
    CircleDollarSign,
    Droplets,
    Eye,
    CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, subDays } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { BarChartComponent, LineChartComponent } from "@/components/ui/chart"

// Types
interface Brand {
    id: string
    name: string
    logo: string
}

interface Product {
    id: string
    name: string
    sku: string
    category: string
    subcategory?: string
    brand: Brand
    unitSize: string
    unitPrice: number
    costPrice: number
}

interface Region {
    id: string
    name: string
    type: "county" | "subcounty" | "ward"
    parentId?: string
}

interface Location {
    id: string
    name: string
    type: "store" | "warehouse" | "distributor"
    region: Region
    latitude: number
    longitude: number
    address?: string
}

interface Distributor {
    id: string
    name: string
    region: Region
    contactPerson: string
    phone: string
    email: string
    performance: number // 0-100
}

interface SalesData {
    productId: string
    product: Product
    locationId: string
    location: Location
    date: string
    quantity: number
    value: number
    previousPeriodQuantity: number
    previousPeriodValue: number
}

interface StockLevel {
    productId: string
    product: Product
    locationId: string
    location: Location
    quantity: number
    daysOfSupply: number
    reorderPoint: number
    lastRestockDate: string
}

interface Alert {
    id: string
    type: "stockout" | "low_stock" | "overstock" | "sales_spike" | "sales_drop" | "distribution_gap"
    severity: "critical" | "warning" | "info"
    message: string
    productId: string
    product: Product
    locationId?: string
    location?: Location
    regionId?: string
    region?: Region
    timestamp: string
    acknowledged: boolean
}

interface Campaign {
    id: string
    name: string
    startDate: string
    endDate: string
    status: "active" | "scheduled" | "completed"
    type: "promotion" | "discount" | "visibility" | "sampling"
    products: Product[]
    regions: Region[]
    target: number
    achieved: number
    budget: number
    spent: number
}

interface DistributorPerformance {
    distributorId: string
    distributor: Distributor
    deliveryPerformance: number // 0-100
    coveragePerformance: number // 0-100
    stockAvailability: number // 0-100
    salesPerformance: number // 0-100
    overallScore: number // 0-100
}

// Mock data
const mockBrands: Brand[] = [
    { id: "brand_1", name: "EABL", logo: "/placeholder.svg?height=40&width=40" },
    { id: "brand_2", name: "KWAL", logo: "/placeholder.svg?height=40&width=40" },
    { id: "brand_3", name: "Coca-Cola", logo: "/placeholder.svg?height=40&width=40" },
]

const mockProducts: Product[] = [
    {
        id: "prod_1",
        name: "Tusker Lager",
        sku: "TL-001",
        category: "Beer",
        brand: mockBrands[0],
        unitSize: "500ml",
        unitPrice: 250,
        costPrice: 180,
    },
    {
        id: "prod_2",
        name: "Tusker Malt",
        sku: "TM-001",
        category: "Beer",
        brand: mockBrands[0],
        unitSize: "500ml",
        unitPrice: 280,
        costPrice: 200,
    },
    {
        id: "prod_3",
        name: "Guinness",
        sku: "GN-001",
        category: "Beer",
        subcategory: "Stout",
        brand: mockBrands[0],
        unitSize: "500ml",
        unitPrice: 300,
        costPrice: 220,
    },
    {
        id: "prod_4",
        name: "Johnnie Walker Black",
        sku: "JWB-001",
        category: "Spirits",
        subcategory: "Whisky",
        brand: mockBrands[0],
        unitSize: "750ml",
        unitPrice: 3500,
        costPrice: 2800,
    },
    {
        id: "prod_5",
        name: "Smirnoff Vodka",
        sku: "SV-001",
        category: "Spirits",
        subcategory: "Vodka",
        brand: mockBrands[0],
        unitSize: "750ml",
        unitPrice: 1800,
        costPrice: 1400,
    },
    {
        id: "prod_6",
        name: "Gilbeys Gin",
        sku: "GG-001",
        category: "Spirits",
        subcategory: "Gin",
        brand: mockBrands[1],
        unitSize: "750ml",
        unitPrice: 1500,
        costPrice: 1200,
    },
    {
        id: "prod_7",
        name: "Viceroy Brandy",
        sku: "VB-001",
        category: "Spirits",
        subcategory: "Brandy",
        brand: mockBrands[1],
        unitSize: "750ml",
        unitPrice: 1200,
        costPrice: 900,
    },
    {
        id: "prod_8",
        name: "Coca-Cola",
        sku: "CC-001",
        category: "Soft Drinks",
        brand: mockBrands[2],
        unitSize: "500ml",
        unitPrice: 100,
        costPrice: 70,
    },
]

const mockRegions: Region[] = [
    { id: "reg_1", name: "Nairobi", type: "county" },
    { id: "reg_2", name: "Mombasa", type: "county" },
    { id: "reg_3", name: "Kisumu", type: "county" },
    { id: "reg_4", name: "Nakuru", type: "county" },
    { id: "reg_5", name: "Eldoret", type: "county" },
    { id: "reg_6", name: "Westlands", type: "subcounty", parentId: "reg_1" },
    { id: "reg_7", name: "Kasarani", type: "subcounty", parentId: "reg_1" },
    { id: "reg_8", name: "Nyali", type: "subcounty", parentId: "reg_2" },
    { id: "reg_9", name: "Kisauni", type: "subcounty", parentId: "reg_2" },
]

const mockLocations: Location[] = [
    {
        id: "loc_1",
        name: "Westlands Liquor Store",
        type: "store",
        region: mockRegions[5],
        latitude: -1.2641,
        longitude: 36.8065,
    },
    {
        id: "loc_2",
        name: "Kasarani Wines & Spirits",
        type: "store",
        region: mockRegions[6],
        latitude: -1.2209,
        longitude: 36.8865,
    },
    {
        id: "loc_3",
        name: "Nyali Beach Liquor",
        type: "store",
        region: mockRegions[7],
        latitude: -4.0435,
        longitude: 39.7035,
    },
    {
        id: "loc_4",
        name: "Kisauni Drinks Hub",
        type: "store",
        region: mockRegions[8],
        latitude: -4.0335,
        longitude: 39.6835,
    },
    {
        id: "loc_5",
        name: "Nairobi Central Warehouse",
        type: "warehouse",
        region: mockRegions[0],
        latitude: -1.2864,
        longitude: 36.8172,
    },
    {
        id: "loc_6",
        name: "Mombasa Port Warehouse",
        type: "warehouse",
        region: mockRegions[1],
        latitude: -4.0435,
        longitude: 39.6682,
    },
]

const mockDistributors: Distributor[] = [
    {
        id: "dist_1",
        name: "Nairobi Beverage Distributors",
        region: mockRegions[0],
        contactPerson: "John Kamau",
        phone: "0712345678",
        email: "john@nbd.co.ke",
        performance: 87,
    },
    {
        id: "dist_2",
        name: "Coastal Drinks Logistics",
        region: mockRegions[1],
        contactPerson: "Sarah Omar",
        phone: "0723456789",
        email: "sarah@cdl.co.ke",
        performance: 92,
    },
    {
        id: "dist_3",
        name: "Lakeside Beverages",
        region: mockRegions[2],
        contactPerson: "Michael Ochieng",
        phone: "0734567890",
        email: "michael@lakeside.co.ke",
        performance: 78,
    },
    {
        id: "dist_4",
        name: "Rift Valley Distributors",
        region: mockRegions[3],
        contactPerson: "Jane Kiprop",
        phone: "0745678901",
        email: "jane@rvd.co.ke",
        performance: 81,
    },
]

// Generate mock sales data
const generateMockSalesData = (): SalesData[] => {
    const salesData: SalesData[] = []
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 30) // Last 30 days

    // For each product
    mockProducts.forEach((product) => {
        // For each location
        mockLocations
            .filter((loc) => loc.type === "store")
            .forEach((location) => {
                // For each day
                for (let i = 0; i < 30; i++) {
                    const date = new Date(startDate)
                    date.setDate(startDate.getDate() + i)

                    // Base quantity with some randomness
                    let baseQuantity = 0
                    if (product.category === "Beer") {
                        baseQuantity = Math.floor(Math.random() * 30) + 20 // 20-50 units
                    } else if (product.category === "Spirits") {
                        baseQuantity = Math.floor(Math.random() * 10) + 5 // 5-15 units
                    } else {
                        baseQuantity = Math.floor(Math.random() * 50) + 30 // 30-80 units
                    }

                    // Add day of week effect (weekends have higher sales)
                    const dayOfWeek = date.getDay()
                    const weekendMultiplier = dayOfWeek === 5 || dayOfWeek === 6 ? 1.5 : 1

                    // Add location effect
                    const locationMultiplier = location.region.name === "Westlands" || location.region.name === "Nyali" ? 1.3 : 1

                    // Calc final quantity
                    const quantity = Math.floor(baseQuantity * weekendMultiplier * locationMultiplier)
                    const value = quantity * product.unitPrice

                    // Previous period (for comparison)
                    const previousPeriodQuantity = Math.floor(quantity * (Math.random() * 0.4 + 0.8)) // 80-120% of current
                    const previousPeriodValue = previousPeriodQuantity * product.unitPrice

                    salesData.push({
                        productId: product.id,
                        product,
                        locationId: location.id,
                        location,
                        date: date.toISOString(),
                        quantity,
                        value,
                        previousPeriodQuantity,
                        previousPeriodValue,
                    })
                }
            })
    })

    return salesData
}

// Generate mock stock levels
const generateMockStockLevels = (): StockLevel[] => {
    const stockLevels: StockLevel[] = []

    // For each product
    mockProducts.forEach((product) => {
        // For each location
        mockLocations.forEach((location) => {
            // Base quantity with some randomness
            let baseQuantity = 0
            if (product.category === "Beer") {
                baseQuantity = Math.floor(Math.random() * 100) + 50 // 50-150 units
            } else if (product.category === "Spirits") {
                baseQuantity = Math.floor(Math.random() * 30) + 10 // 10-40 units
            } else {
                baseQuantity = Math.floor(Math.random() * 200) + 100 // 100-300 units
            }

            // Warehouse has more stock
            const locationMultiplier = location.type === "warehouse" ? 5 : 1

            // Calc final quantity
            const quantity = Math.floor(baseQuantity * locationMultiplier)

            // Calc days of supply based on average daily sales
            const daysOfSupply = Math.floor(Math.random() * 14) + 1 // 1-15 days

            // Reorder point
            const reorderPoint = Math.floor(baseQuantity * 0.3) // 30% of base quantity

            // Last restock date (random within last 14 days)
            const today = new Date()
            const lastRestockDate = new Date(today)
            lastRestockDate.setDate(today.getDate() - Math.floor(Math.random() * 14))

            stockLevels.push({
                productId: product.id,
                product,
                locationId: location.id,
                location,
                quantity,
                daysOfSupply,
                reorderPoint,
                lastRestockDate: lastRestockDate.toISOString(),
            })
        })
    })

    return stockLevels
}

// Generate mock alerts
const generateMockAlerts = (): Alert[] => {
    const alerts: Alert[] = [
        {
            id: "alert_1",
            type: "stockout",
            severity: "critical",
            message: "Stockout detected for Tusker Lager at Westlands Liquor Store",
            productId: "prod_1",
            product: mockProducts[0],
            locationId: "loc_1",
            location: mockLocations[0],
            timestamp: new Date().toISOString(),
            acknowledged: false,
        },
        {
            id: "alert_2",
            type: "low_stock",
            severity: "warning",
            message: "Low stock for Johnnie Walker Black at Nyali Beach Liquor (2 days supply remaining)",
            productId: "prod_4",
            product: mockProducts[3],
            locationId: "loc_3",
            location: mockLocations[2],
            timestamp: new Date().toISOString(),
            acknowledged: false,
        },
        {
            id: "alert_3",
            type: "sales_spike",
            severity: "info",
            message: "Sales spike detected for Guinness in Nairobi region (+45% vs last week)",
            productId: "prod_3",
            product: mockProducts[2],
            regionId: "reg_1",
            region: mockRegions[0],
            timestamp: new Date().toISOString(),
            acknowledged: true,
        },
        {
            id: "alert_4",
            type: "distribution_gap",
            severity: "warning",
            message: "Distribution gap detected for Smirnoff Vodka in Kisumu region (40% coverage)",
            productId: "prod_5",
            product: mockProducts[4],
            regionId: "reg_3",
            region: mockRegions[2],
            timestamp: new Date().toISOString(),
            acknowledged: false,
        },
        {
            id: "alert_5",
            type: "sales_drop",
            severity: "warning",
            message: "Sales drop detected for Gilbeys Gin in Mombasa region (-30% vs last week)",
            productId: "prod_6",
            product: mockProducts[5],
            regionId: "reg_2",
            region: mockRegions[1],
            timestamp: new Date().toISOString(),
            acknowledged: false,
        },
    ]

    return alerts
}

// Generate mock campaigns
const generateMockCampaigns = (): Campaign[] => {
    const campaigns: Campaign[] = [
        {
            id: "camp_1",
            name: "Tusker Summer Promotion",
            startDate: "2025-01-01",
            endDate: "2025-01-31",
            status: "active",
            type: "promotion",
            products: [mockProducts[0], mockProducts[1]],
            regions: [mockRegions[0], mockRegions[1]],
            target: 10000,
            achieved: 6500,
            budget: 500000,
            spent: 320000,
        },
        {
            id: "camp_2",
            name: "Johnnie Walker Tasting Events",
            startDate: "2025-01-15",
            endDate: "2025-02-15",
            status: "active",
            type: "sampling",
            products: [mockProducts[3]],
            regions: [mockRegions[0]],
            target: 5000,
            achieved: 2200,
            budget: 300000,
            spent: 150000,
        },
        {
            id: "camp_3",
            name: "Guinness Rugby Sponsorship",
            startDate: "2025-02-01",
            endDate: "2025-03-15",
            status: "scheduled",
            type: "visibility",
            products: [mockProducts[2]],
            regions: [mockRegions[0], mockRegions[2], mockRegions[3]],
            target: 15000,
            achieved: 0,
            budget: 800000,
            spent: 0,
        },
        {
            id: "camp_4",
            name: "Coastal Spirits Discount",
            startDate: "2024-12-01",
            endDate: "2024-12-31",
            status: "completed",
            type: "discount",
            products: [mockProducts[4], mockProducts[5], mockProducts[6]],
            regions: [mockRegions[1]],
            target: 8000,
            achieved: 9200,
            budget: 400000,
            spent: 380000,
        },
    ]

    return campaigns
}

// Generate mock distributor performance
const generateMockDistributorPerformance = (): DistributorPerformance[] => {
    return mockDistributors.map((distributor) => {
        // Generate random performance metrics
        const deliveryPerformance = Math.floor(Math.random() * 20) + 80 // 80-100
        const coveragePerformance = Math.floor(Math.random() * 30) + 70 // 70-100
        const stockAvailability = Math.floor(Math.random() * 25) + 75 // 75-100
        const salesPerformance = Math.floor(Math.random() * 40) + 60 // 60-100

        // Calc overall score (weighted average)
        const overallScore = Math.floor(
            deliveryPerformance * 0.3 + coveragePerformance * 0.2 + stockAvailability * 0.3 + salesPerformance * 0.2,
        )

        return {
            distributorId: distributor.id,
            distributor,
            deliveryPerformance,
            coveragePerformance,
            stockAvailability,
            salesPerformance,
            overallScore,
        }
    })
}

// Initialize mock data
const mockSalesData = generateMockSalesData()
const mockStockLevels = generateMockStockLevels()
const mockAlerts = generateMockAlerts()
const mockCampaigns = generateMockCampaigns()
const mockDistributorPerformance = generateMockDistributorPerformance()

// Helper function to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

// Helper function to format percentage
const formatPercentage = (value: number, includeSign = true) => {
    const sign = includeSign && value > 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
}

// Helper function to get alert icon
const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
        case "stockout":
            return <Package className="h-4 w-4 text-red-500" />
        case "low_stock":
            return <AlertTriangle className="h-4 w-4 text-amber-500" />
        case "sales_spike":
            return <TrendingUp className="h-4 w-4 text-green-500" />
        case "sales_drop":
            return <TrendingUp className="h-4 w-4 text-red-500" />
        case "distribution_gap":
            return <Map className="h-4 w-4 text-amber-500" />
        case "overstock":
            return <Package className="h-4 w-4 text-amber-500" />
        default:
            return <AlertTriangle className="h-4 w-4" />
    }
}

// Helper function to get alert severity badge
const getAlertSeverityBadge = (severity: Alert["severity"]) => {
    switch (severity) {
        case "critical":
            return <Badge variant="destructive">Critical</Badge>
        case "warning":
            return (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    Warning
                </Badge>
            )
        case "info":
            return (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    Info
                </Badge>
            )
        default:
            return null
    }
}

// Helper function to get campaign status badge
const getCampaignStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
        case "active":
            return (
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                    Active
                </Badge>
            )
        case "scheduled":
            return (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    Scheduled
                </Badge>
            )
        case "completed":
            return (
                <Badge variant="outline" className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                    Completed
                </Badge>
            )
        default:
            return null
    }
}

// Helper function to get campaign type icon
const getCampaignTypeIcon = (type: Campaign["type"]) => {
    switch (type) {
        case "promotion":
            return <Megaphone className="h-4 w-4 text-purple-500" />
        case "discount":
            return <Percent className="h-4 w-4 text-green-500" />
        case "visibility":
            return <Eye className="h-4 w-4 text-blue-500" />
        case "sampling":
            return <Droplets className="h-4 w-4 text-amber-500" />
        default:
            return null
    }
}

// Main dashboard component
export default function BrandIntelligenceDashboard() {
    // State for date range filter
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    })

    // State for selected brand filter
    const [selectedBrand, setSelectedBrand] = useState<string>("all")

    // State for selected region filter
    const [selectedRegion, setSelectedRegion] = useState<string>("all")

    // State for selected product category filter
    const [selectedCategory, setSelectedCategory] = useState<string>("all")

    // Filter sales data based on selected filters
    const filteredSalesData = useMemo(() => {
        return mockSalesData.filter((sale) => {
            // Date range filter
            if (dateRange?.from && dateRange?.to) {
                const saleDate = new Date(sale.date)
                if (saleDate < dateRange.from || saleDate > dateRange.to) {
                    return false
                }
            }

            // Brand filter
            if (selectedBrand !== "all" && sale.product.brand.id !== selectedBrand) {
                return false
            }

            // Region filter
            if (selectedRegion !== "all") {
                const locationRegion = sale.location.region
                if (locationRegion.id !== selectedRegion && locationRegion.parentId !== selectedRegion) {
                    return false
                }
            }

            // Category filter
            if (selectedCategory !== "all" && sale.product.category !== selectedCategory) {
                return false
            }

            return true
        })
    }, [mockSalesData, dateRange, selectedBrand, selectedRegion, selectedCategory])

    // Calc sales summary
    const salesSummary = useMemo(() => {
        let totalSales = 0
        let totalUnits = 0
        let totalPreviousSales = 0
        let totalPreviousUnits = 0

        filteredSalesData.forEach((sale) => {
            totalSales += sale.value
            totalUnits += sale.quantity
            totalPreviousSales += sale.previousPeriodValue
            totalPreviousUnits += sale.previousPeriodQuantity
        })

        const salesGrowth = totalPreviousSales > 0 ? ((totalSales - totalPreviousSales) / totalPreviousSales) * 100 : 0
        const unitsGrowth = totalPreviousUnits > 0 ? ((totalUnits - totalPreviousUnits) / totalPreviousUnits) * 100 : 0

        return {
            totalSales,
            totalUnits,
            salesGrowth,
            unitsGrowth,
        }
    }, [filteredSalesData])

    // Calc top products by sales
    const topProducts = useMemo(() => {
        const productSales: Record<string, { product: Product; units: number; value: number }> = {}

        filteredSalesData.forEach((sale) => {
            if (!productSales[sale.productId]) {
                productSales[sale.productId] = {
                    product: sale.product,
                    units: 0,
                    value: 0,
                }
            }

            productSales[sale.productId].units += sale.quantity
            productSales[sale.productId].value += sale.value
        })

        return Object.values(productSales)
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
    }, [filteredSalesData])

    // Calc top regions by sales
    const topRegions = useMemo(() => {
        const regionSales: Record<string, { region: Region; units: number; value: number }> = {}

        filteredSalesData.forEach((sale) => {
            const regionId = sale.location.region.id
            if (!regionSales[regionId]) {
                regionSales[regionId] = {
                    region: sale.location.region,
                    units: 0,
                    value: 0,
                }
            }

            regionSales[regionId].units += sale.quantity
            regionSales[regionId].value += sale.value
        })

        return Object.values(regionSales)
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
    }, [filteredSalesData])

    // Calc sales trend data for chart
    const salesTrendData = useMemo(() => {
        const dailySales: Record<string, { date: string; sales: number; units: number }> = {}

        filteredSalesData.forEach((sale) => {
            const dateStr = sale.date.split("T")[0] // Get YYYY-MM-DD part
            if (!dailySales[dateStr]) {
                dailySales[dateStr] = {
                    date: format(new Date(dateStr), "MMM d"),
                    sales: 0,
                    units: 0,
                }
            }

            dailySales[dateStr].sales += sale.value
            dailySales[dateStr].units += sale.quantity
        })

        return Object.values(dailySales).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }, [filteredSalesData])

    // Calc category distribution data for chart
    const categoryDistributionData = useMemo(() => {
        const categoryData: Record<string, { category: string; value: number; units: number }> = {}

        filteredSalesData.forEach((sale) => {
            const category = sale.product.category
            if (!categoryData[category]) {
                categoryData[category] = {
                    category,
                    value: 0,
                    units: 0,
                }
            }

            categoryData[category].value += sale.value
            categoryData[category].units += sale.quantity
        })

        return Object.values(categoryData)
    }, [filteredSalesData])

    // Filter stock levels based on selected filters
    const filteredStockLevels = useMemo(() => {
        return mockStockLevels.filter((stock) => {
            // Brand filter
            if (selectedBrand !== "all" && stock.product.brand.id !== selectedBrand) {
                return false
            }

            // Region filter
            if (selectedRegion !== "all") {
                const locationRegion = stock.location.region
                if (locationRegion.id !== selectedRegion && locationRegion.parentId !== selectedRegion) {
                    return false
                }
            }

            // Category filter
            if (selectedCategory !== "all" && stock.product.category !== selectedCategory) {
                return false
            }

            return true
        })
    }, [mockStockLevels, selectedBrand, selectedRegion, selectedCategory])

    // Calc stock summary
    const stockSummary = useMemo(() => {
        let totalStockValue = 0
        let totalStockUnits = 0
        let lowStockCount = 0
        let stockoutCount = 0

        filteredStockLevels.forEach((stock) => {
            totalStockValue += stock.quantity * stock.product.costPrice
            totalStockUnits += stock.quantity

            if (stock.quantity === 0) {
                stockoutCount++
            } else if (stock.quantity < stock.reorderPoint) {
                lowStockCount++
            }
        })

        return {
            totalStockValue,
            totalStockUnits,
            lowStockCount,
            stockoutCount,
        }
    }, [filteredStockLevels])

    // Filter alerts based on selected filters
    const filteredAlerts = useMemo(() => {
        return mockAlerts.filter((alert) => {
            // Brand filter
            if (selectedBrand !== "all" && alert.product.brand.id !== selectedBrand) {
                return false
            }

            // Region filter
            if (selectedRegion !== "all") {
                if (alert.region) {
                    if (alert.region.id !== selectedRegion && alert.region.parentId !== selectedRegion) {
                        return false
                    }
                } else if (alert.location) {
                    const locationRegion = alert.location.region
                    if (locationRegion.id !== selectedRegion && locationRegion.parentId !== selectedRegion) {
                        return false
                    }
                }
            }

            // Category filter
            if (selectedCategory !== "all" && alert.product.category !== selectedCategory) {
                return false
            }

            return true
        })
    }, [mockAlerts, selectedBrand, selectedRegion, selectedCategory])

    // Filter campaigns based on selected filters
    const filteredCampaigns = useMemo(() => {
        return mockCampaigns.filter((campaign) => {
            // Brand filter
            if (selectedBrand !== "all") {
                const hasBrandProduct = campaign.products.some((product) => product.brand.id === selectedBrand)
                if (!hasBrandProduct) {
                    return false
                }
            }

            // Region filter
            if (selectedRegion !== "all") {
                const hasRegion = campaign.regions.some(
                    (region) => region.id === selectedRegion || region.parentId === selectedRegion,
                )
                if (!hasRegion) {
                    return false
                }
            }

            // Category filter
            if (selectedCategory !== "all") {
                const hasCategoryProduct = campaign.products.some((product) => product.category === selectedCategory)
                if (!hasCategoryProduct) {
                    return false
                }
            }

            return true
        })
    }, [mockCampaigns, selectedBrand, selectedRegion, selectedCategory])

    // Filter distributor performance based on selected filters
    const filteredDistributorPerformance = useMemo(() => {
        return mockDistributorPerformance.filter((performance) => {
            // Region filter
            if (selectedRegion !== "all") {
                const distributorRegion = performance.distributor.region
                if (distributorRegion.id !== selectedRegion && distributorRegion.parentId !== selectedRegion) {
                    return false
                }
            }

            return true
        })
    }, [mockDistributorPerformance, selectedRegion])

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Brand Intelligence Dashboard</h1>
                    <p className="text-muted-foreground">Monitor your brand's performance across the entire ecosystem</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-9">
                                <Calendar className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "MMM d, yyyy")
                                    )
                                ) : (
                                    "Select date range"
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <CalendarComponent
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>

                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                        <SelectTrigger className="w-[180px] h-9">
                            <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Brands</SelectItem>
                            {mockBrands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                    {brand.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger className="w-[180px] h-9">
                            <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            <SelectGroup>
                                <SelectLabel>Counties</SelectLabel>
                                {mockRegions
                                    .filter((r) => r.type === "county")
                                    .map((region) => (
                                        <SelectItem key={region.id} value={region.id}>
                                            {region.name}
                                        </SelectItem>
                                    ))}
                            </SelectGroup>
                            <SelectGroup>
                                <SelectLabel>Sub-Counties</SelectLabel>
                                {mockRegions
                                    .filter((r) => r.type === "subcounty")
                                    .map((region) => (
                                        <SelectItem key={region.id} value={region.id}>
                                            {region.name}
                                        </SelectItem>
                                    ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px] h-9">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Beer">Beer</SelectItem>
                            <SelectItem value="Spirits">Spirits</SelectItem>
                            <SelectItem value="Soft Drinks">Soft Drinks</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="h-9">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-muted-foreground">Total Sales</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold">{formatCurrency(salesSummary.totalSales)}</span>
                                </div>
                                <span
                                    className={`text-sm ${salesSummary.salesGrowth >= 0 ? "text-green-600" : "text-red-600"} font-medium`}
                                >
                                    {salesSummary.salesGrowth >= 0 ? (
                                        <ArrowUpRight className="inline h-3 w-3 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="inline h-3 w-3 mr-1" />
                                    )}
                                    {formatPercentage(salesSummary.salesGrowth)} vs previous
                                </span>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CircleDollarSign className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-muted-foreground">Units Sold</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold">{salesSummary.totalUnits.toLocaleString()}</span>
                                </div>
                                <span
                                    className={`text-sm ${salesSummary.unitsGrowth >= 0 ? "text-green-600" : "text-red-600"} font-medium`}
                                >
                                    {salesSummary.unitsGrowth >= 0 ? (
                                        <ArrowUpRight className="inline h-3 w-3 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="inline h-3 w-3 mr-1" />
                                    )}
                                    {formatPercentage(salesSummary.unitsGrowth)} vs previous
                                </span>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <ShoppingCart className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-muted-foreground">Inventory Value</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold">{formatCurrency(stockSummary.totalStockValue)}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {stockSummary.totalStockUnits.toLocaleString()} units in stock
                                </span>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <Warehouse className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-muted-foreground">Stock Alerts</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold">{stockSummary.lowStockCount + stockSummary.stockoutCount}</span>
                                </div>
                                <span className="text-sm text-red-600 font-medium">
                                    {stockSummary.stockoutCount} stockouts, {stockSummary.lowStockCount} low stock
                                </span>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid grid-cols-5 w-full max-w-3xl">
                    <TabsTrigger value="overview" className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Sales Analysis
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        Inventory
                    </TabsTrigger>
                    <TabsTrigger value="distribution" className="flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        Distribution
                    </TabsTrigger>
                    <TabsTrigger value="campaigns" className="flex items-center gap-1">
                        <Megaphone className="h-4 w-4" />
                        Campaigns
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {/* Sales Trend Chart */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium">Sales Trend</CardTitle>
                                <CardDescription>Daily sales performance over time</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-[100px] p-4">
                                    {/* <LineChartComponent
                                        data={salesTrendData}
                                        categories={["sales"]}
                                        index="date"
                                        valueFormatter={(value) => formatCurrency(value)}
                                        height={300}
                                    /> */}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Alerts Card */}
                        <Card className="md:col-span-2">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-medium">Alerts</CardTitle>
                                        <CardDescription>Critical issues requiring attention</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="font-normal">
                                        {filteredAlerts.length} alerts
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 w-full">
                                <ScrollArea className="h-[300px]">
                                    <div className="px-4 py-2">
                                        {filteredAlerts.length > 0 ? (
                                            <div className="space-y-3">
                                                {filteredAlerts.map((alert) => (
                                                    <div
                                                        key={alert.id}
                                                        className={`p-3 rounded-md border ${alert.severity === "critical"
                                                            ? "bg-red-50 border-red-200"
                                                            : alert.severity === "warning"
                                                                ? "bg-amber-50 border-amber-200"
                                                                : "bg-blue-50 border-blue-200"
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            {getAlertIcon(alert.type)}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-sm font-medium truncate">{alert.message}</p>
                                                                    {getAlertSeverityBadge(alert.severity)}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {format(new Date(alert.timestamp), "MMM d, h:mm a")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-[250px] text-center">
                                                <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                                                <p className="text-sm font-medium">No alerts found</p>
                                                <p className="text-xs text-muted-foreground mt-1">All systems are running smoothly</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Top Products */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium">Top Products</CardTitle>
                                <CardDescription>Best performing products by sales</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[300px]">
                                    <div className="px-4 py-2">
                                        {topProducts.map((product, index) => (
                                            <div key={product.product.id} className="py-3 border-b last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{product.product.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {product.product.category} • {product.product.unitSize}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">{formatCurrency(product.value)}</p>
                                                        <p className="text-xs text-muted-foreground">{product.units.toLocaleString()} units</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* Top Regions */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium">Top Regions</CardTitle>
                                <CardDescription>Best performing regions by sales</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[300px]">
                                    <div className="px-4 py-2">
                                        {topRegions.map((region, index) => (
                                            <div key={region.region.id} className="py-3 border-b last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{region.region.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {region.region.type === "county" ? "County" : "Sub-County"}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">{formatCurrency(region.value)}</p>
                                                        <p className="text-xs text-muted-foreground">{region.units.toLocaleString()} units</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* Category Distribution */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium">Category Distribution</CardTitle>
                                <CardDescription>Sales breakdown by product category</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-[300px] p-4">
                                    {/* <BarChartComponent
                                        data={categoryDistributionData}
                                        categories={["value"]}
                                        index="category"
                                        valueFormatter={(value) => formatCurrency(value)}
                                        height={300}
                                    /> */}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Active Campaigns */}
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-medium">Active Campaigns</CardTitle>
                                    <CardDescription>Current marketing initiatives and their performance</CardDescription>
                                </div>
                                <Button variant="outline" size="sm">
                                    View All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium">Campaign</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium">Type</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium">Timeline</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Progress</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Budget</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCampaigns
                                            .filter((campaign) => campaign.status !== "completed")
                                            .map((campaign) => (
                                                <tr key={campaign.id} className="border-b hover:bg-slate-50">
                                                    <td className="py-3 px-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">{campaign.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {campaign.products.map((p) => p.name).join(", ")}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-1">
                                                            {getCampaignTypeIcon(campaign.type)}
                                                            <span className="text-sm capitalize">{campaign.type}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">{getCampaignStatusBadge(campaign.status)}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm">
                                                                {format(new Date(campaign.startDate), "MMM d")} -{" "}
                                                                {format(new Date(campaign.endDate), "MMM d, yyyy")}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {campaign.status === "active" ? (
                                                                    <>
                                                                        <Clock className="inline h-3 w-3 mr-1" />
                                                                        {Math.ceil(
                                                                            (new Date(campaign.endDate).getTime() - new Date().getTime()) /
                                                                            (1000 * 60 * 60 * 24),
                                                                        )}{" "}
                                                                        days left
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        Starts in{" "}
                                                                        {Math.ceil(
                                                                            (new Date(campaign.startDate).getTime() - new Date().getTime()) /
                                                                            (1000 * 60 * 60 * 24),
                                                                        )}{" "}
                                                                        days
                                                                    </>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex flex-col items-end">
                                                            <div className="w-full max-w-[200px]">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {campaign.achieved.toLocaleString()} / {campaign.target.toLocaleString()}
                                                                    </span>
                                                                    <span className="text-xs font-medium">
                                                                        {Math.round((campaign.achieved / campaign.target) * 100)}%
                                                                    </span>
                                                                </div>
                                                                <Progress value={(campaign.achieved / campaign.target) * 100} className="h-2" />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">{formatCurrency(campaign.spent)}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                of {formatCurrency(campaign.budget)} (
                                                                {Math.round((campaign.spent / campaign.budget) * 100)}%)
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Distributor Performance */}
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-medium">Distributor Performance</CardTitle>
                                    <CardDescription>Delivery and coverage metrics for your distribution network</CardDescription>
                                </div>
                                <Button variant="outline" size="sm">
                                    View Details
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium">Distributor</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium">Region</th>
                                            <th className="text-center py-3 px-4 text-sm font-medium">Delivery</th>
                                            <th className="text-center py-3 px-4 text-sm font-medium">Coverage</th>
                                            <th className="text-center py-3 px-4 text-sm font-medium">Stock Availability</th>
                                            <th className="text-center py-3 px-4 text-sm font-medium">Sales</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Overall Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDistributorPerformance.map((performance) => (
                                            <tr key={performance.distributorId} className="border-b hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback>
                                                                {performance.distributor.name
                                                                    .split(" ")
                                                                    .map((n) => n[0])
                                                                    .join("")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">{performance.distributor.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {performance.distributor.contactPerson}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm">{performance.distributor.region.name}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col items-center">
                                                        <span
                                                            className={`text-sm font-medium ${performance.deliveryPerformance >= 90
                                                                ? "text-green-600"
                                                                : performance.deliveryPerformance >= 70
                                                                    ? "text-amber-600"
                                                                    : "text-red-600"
                                                                }`}
                                                        >
                                                            {performance.deliveryPerformance}%
                                                        </span>
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1">
                                                            <div
                                                                className={`h-full rounded-full ${performance.deliveryPerformance >= 90
                                                                    ? "bg-green-500"
                                                                    : performance.deliveryPerformance >= 70
                                                                        ? "bg-amber-500"
                                                                        : "bg-red-500"
                                                                    }`}
                                                                style={{ width: `${performance.deliveryPerformance}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col items-center">
                                                        <span
                                                            className={`text-sm font-medium ${performance.coveragePerformance >= 90
                                                                ? "text-green-600"
                                                                : performance.coveragePerformance >= 70
                                                                    ? "text-amber-600"
                                                                    : "text-red-600"
                                                                }`}
                                                        >
                                                            {performance.coveragePerformance}%
                                                        </span>
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1">
                                                            <div
                                                                className={`h-full rounded-full ${performance.coveragePerformance >= 90
                                                                    ? "bg-green-500"
                                                                    : performance.coveragePerformance >= 70
                                                                        ? "bg-amber-500"
                                                                        : "bg-red-500"
                                                                    }`}
                                                                style={{ width: `${performance.coveragePerformance}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col items-center">
                                                        <span
                                                            className={`text-sm font-medium ${performance.stockAvailability >= 90
                                                                ? "text-green-600"
                                                                : performance.stockAvailability >= 70
                                                                    ? "text-amber-600"
                                                                    : "text-red-600"
                                                                }`}
                                                        >
                                                            {performance.stockAvailability}%
                                                        </span>
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1">
                                                            <div
                                                                className={`h-full rounded-full ${performance.stockAvailability >= 90
                                                                    ? "bg-green-500"
                                                                    : performance.stockAvailability >= 70
                                                                        ? "bg-amber-500"
                                                                        : "bg-red-500"
                                                                    }`}
                                                                style={{ width: `${performance.stockAvailability}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col items-center">
                                                        <span
                                                            className={`text-sm font-medium ${performance.salesPerformance >= 90
                                                                ? "text-green-600"
                                                                : performance.salesPerformance >= 70
                                                                    ? "text-amber-600"
                                                                    : "text-red-600"
                                                                }`}
                                                        >
                                                            {performance.salesPerformance}%
                                                        </span>
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1">
                                                            <div
                                                                className={`h-full rounded-full ${performance.salesPerformance >= 90
                                                                    ? "bg-green-500"
                                                                    : performance.salesPerformance >= 70
                                                                        ? "bg-amber-500"
                                                                        : "bg-red-500"
                                                                    }`}
                                                                style={{ width: `${performance.salesPerformance}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="flex flex-col items-end">
                                                            <span
                                                                className={`text-sm font-medium ${performance.overallScore >= 90
                                                                    ? "text-green-600"
                                                                    : performance.overallScore >= 70
                                                                        ? "text-amber-600"
                                                                        : "text-red-600"
                                                                    }`}
                                                            >
                                                                {performance.overallScore}%
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">Overall</span>
                                                        </div>
                                                        <div
                                                            className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs ${performance.overallScore >= 90
                                                                ? "bg-green-500"
                                                                : performance.overallScore >= 70
                                                                    ? "bg-amber-500"
                                                                    : "bg-red-500"
                                                                }`}
                                                        >
                                                            {performance.overallScore}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sales Analysis Tab */}
                <TabsContent value="sales" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sales by Product</CardTitle>
                                <CardDescription>Detailed breakdown of sales by product</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px]">
                                    {/* <BarChartComponent
                                        data={topProducts.map((p) => ({ name: p.product.name, value: p.value }))}
                                        categories={["value"]}
                                        index="name"
                                        valueFormatter={(value) => formatCurrency(value)}
                                        height={400}
                                    /> */}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Sales by Region</CardTitle>
                                <CardDescription>Geographic distribution of sales</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px]">
                                    {/* <BarChartComponent
                                        data={topRegions.map((r) => ({ name: r.region.name, value: r.value }))}
                                        categories={["value"]}
                                        index="name"
                                        valueFormatter={(value) => formatCurrency(value)}
                                        height={400}
                                    /> */}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Velocity</CardTitle>
                            <CardDescription>Rate of product movement across locations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium">Product</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium">Category</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Daily Avg Units</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Weekly Trend</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Velocity Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topProducts.map((product, index) => (
                                            <tr key={product.product.id} className="border-b hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{product.product.name}</span>
                                                        <span className="text-xs text-muted-foreground">{product.product.sku}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm">{product.category}</span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="text-sm font-medium">{(product.units / 30).toFixed(1)}</span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span
                                                        className={`text-sm font-medium ${index % 2 === 0 ? "text-green-600" : "text-red-600"}`}
                                                    >
                                                        {index % 2 === 0 ? "+" : "-"}
                                                        {(Math.random() * 10 + 1).toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-sm font-medium">{Math.floor(Math.random() * 30 + 70)}</span>
                                                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                            High
                                                        </Badge>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Stock Health</CardTitle>
                                <CardDescription>Current inventory status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Healthy Stock</span>
                                        <span className="text-sm font-medium">{Math.floor(Math.random() * 20 + 60)}%</span>
                                    </div>
                                    <Progress value={Math.floor(Math.random() * 20 + 60)} className="h-2 bg-slate-100" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Low Stock</span>
                                        <span className="text-sm font-medium">{Math.floor(Math.random() * 10 + 20)}%</span>
                                    </div>
                                    <Progress value={Math.floor(Math.random() * 10 + 20)} className="h-2 bg-slate-100" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Stockout</span>
                                        <span className="text-sm font-medium">{Math.floor(Math.random() * 10 + 5)}%</span>
                                    </div>
                                    <Progress value={Math.floor(Math.random() * 10 + 5)} className="h-2 bg-slate-100" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Overstock</span>
                                        <span className="text-sm font-medium">{Math.floor(Math.random() * 10 + 5)}%</span>
                                    </div>
                                    <Progress value={Math.floor(Math.random() * 10 + 5)} className="h-2 bg-slate-100" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Stock Alerts</CardTitle>
                                <CardDescription>Critical inventory issues</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 text-sm font-medium">Product</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium">Location</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium">Issue</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium">Current Stock</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium">Days of Supply</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStockLevels
                                                .filter((stock) => stock.quantity <= stock.reorderPoint)
                                                .slice(0, 5)
                                                .map((stock) => (
                                                    <tr key={`${stock.productId}-${stock.locationId}`} className="border-b hover:bg-slate-50">
                                                        <td className="py-3 px-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">{stock.product.name}</span>
                                                                <span className="text-xs text-muted-foreground">{stock.product.sku}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="text-sm">{stock.location.name}</span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {stock.quantity === 0 ? (
                                                                <Badge variant="destructive">Stockout</Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                                                    Low Stock
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span className="text-sm font-medium">{stock.quantity}</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span
                                                                className={`text-sm font-medium ${stock.daysOfSupply <= 3 ? "text-red-600" : "text-amber-600"}`}
                                                            >
                                                                {stock.daysOfSupply} days
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Turnover</CardTitle>
                            <CardDescription>Rate at which inventory is sold and replaced</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium">Product</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium">Category</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Avg. Stock</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Monthly Sales</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Turnover Rate</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mockProducts.slice(0, 5).map((product, index) => {
                                            const avgStock = Math.floor(Math.random() * 100 + 50)
                                            const monthlySales = Math.floor(Math.random() * 80 + 20)
                                            const turnoverRate = (monthlySales / avgStock).toFixed(1)

                                            return (
                                                <tr key={product.id} className="border-b hover:bg-slate-50">
                                                    <td className="py-3 px-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">{product.name}</span>
                                                            <span className="text-xs text-muted-foreground">{product.sku}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-sm">{product.category}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <span className="text-sm">{avgStock}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <span className="text-sm">{monthlySales}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <span className="text-sm font-medium">{turnoverRate}x</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        {Number(turnoverRate) >= 0.8 ? (
                                                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                                Healthy
                                                            </Badge>
                                                        ) : Number(turnoverRate) >= 0.4 ? (
                                                            <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                                                Moderate
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                                                                Slow
                                                            </Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Distribution Tab */}
                <TabsContent value="distribution" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Distribution Coverage</CardTitle>
                                <CardDescription>Product availability across regions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {mockRegions
                                        .filter((r) => r.type === "county")
                                        .slice(0, 3)
                                        .map((region) => {
                                            const coverage = Math.floor(Math.random() * 30 + 70)

                                            return (
                                                <div key={region.id} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">{region.name}</span>
                                                        <span className="text-sm">{coverage}% coverage</span>
                                                    </div>
                                                    <Progress value={coverage} className="h-2" />
                                                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                                                        <div>
                                                            <span className="block">Outlets</span>
                                                            <span className="font-medium text-foreground">
                                                                {Math.floor(Math.random() * 100 + 100)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="block">Active</span>
                                                            <span className="font-medium text-foreground">{Math.floor(Math.random() * 80 + 80)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="block">Inactive</span>
                                                            <span className="font-medium text-foreground">{Math.floor(Math.random() * 20 + 10)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Distributor Performance</CardTitle>
                                <CardDescription>Delivery and coverage metrics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {filteredDistributorPerformance.slice(0, 3).map((performance) => (
                                        <div key={performance.distributorId} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>
                                                            {performance.distributor.name
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium">{performance.distributor.name}</span>
                                                </div>
                                                <span className="text-sm">{performance.overallScore}% overall</span>
                                            </div>
                                            <Progress value={performance.overallScore} className="h-2" />
                                            <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                                                <div>
                                                    <span className="block">Delivery</span>
                                                    <span className="font-medium text-foreground">{performance.deliveryPerformance}%</span>
                                                </div>
                                                <div>
                                                    <span className="block">Coverage</span>
                                                    <span className="font-medium text-foreground">{performance.coveragePerformance}%</span>
                                                </div>
                                                <div>
                                                    <span className="block">Stock</span>
                                                    <span className="font-medium text-foreground">{performance.stockAvailability}%</span>
                                                </div>
                                                <div>
                                                    <span className="block">Sales</span>
                                                    <span className="font-medium text-foreground">{performance.salesPerformance}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Distribution Gaps</CardTitle>
                            <CardDescription>Areas with low product availability</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium">Region</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium">Product</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Coverage</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Target</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Gap</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mockRegions.slice(0, 5).map((region, index) => {
                                            const product = mockProducts[index % mockProducts.length]
                                            const coverage = Math.floor(Math.random() * 30 + 30)
                                            const target = 80
                                            const gap = target - coverage

                                            return (
                                                <tr key={`${region.id}-${product.id}`} className="border-b hover:bg-slate-50">
                                                    <td className="py-3 px-4">
                                                        <span className="text-sm font-medium">{region.name}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm">{product.name}</span>
                                                            <span className="text-xs text-muted-foreground">{product.category}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <span className="text-sm font-medium">{coverage}%</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <span className="text-sm">{target}%</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <span className="text-sm font-medium text-red-600">{gap}%</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <Button variant="outline" size="sm">
                                                            Resolve
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Campaigns Tab */}
                <TabsContent value="campaigns" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Status</CardTitle>
                                <CardDescription>Overview of marketing initiatives</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Active</span>
                                        <span className="text-sm font-medium">
                                            {filteredCampaigns.filter((c) => c.status === "active").length}
                                        </span>
                                    </div>
                                    <Progress
                                        value={
                                            (filteredCampaigns.filter((c) => c.status === "active").length / filteredCampaigns.length) * 100
                                        }
                                        className="h-2 bg-slate-100"
                                    />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Scheduled</span>
                                        <span className="text-sm font-medium">
                                            {filteredCampaigns.filter((c) => c.status === "scheduled").length}
                                        </span>
                                    </div>
                                    <Progress
                                        value={
                                            (filteredCampaigns.filter((c) => c.status === "scheduled").length / filteredCampaigns.length) *
                                            100
                                        }
                                        className="h-2 bg-slate-100"
                                    />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Completed</span>
                                        <span className="text-sm font-medium">
                                            {filteredCampaigns.filter((c) => c.status === "completed").length}
                                        </span>
                                    </div>
                                    <Progress
                                        value={
                                            (filteredCampaigns.filter((c) => c.status === "completed").length / filteredCampaigns.length) *
                                            100
                                        }
                                        className="h-2 bg-slate-100"
                                    />

                                    <Separator className="my-4" />

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Campaign Types</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex items-center gap-2">
                                                <Megaphone className="h-4 w-4 text-purple-500" />
                                                <span className="text-sm">Promotion</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Percent className="h-4 w-4 text-green-500" />
                                                <span className="text-sm">Discount</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Eye className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm">Visibility</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Droplets className="h-4 w-4 text-amber-500" />
                                                <span className="text-sm">Sampling</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Campaign Performance</CardTitle>
                                <CardDescription>Results of active and recent campaigns</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 text-sm font-medium">Campaign</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium">Type</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium">Target</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium">Achieved</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium">Progress</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium">ROI</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCampaigns.map((campaign) => {
                                                const progress = (campaign.achieved / campaign.target) * 100
                                                const roi = campaign.spent > 0 ? ((campaign.achieved * 200) / campaign.spent - 1) * 100 : 0

                                                return (
                                                    <tr key={campaign.id} className="border-b hover:bg-slate-50">
                                                        <td className="py-3 px-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">{campaign.name}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {format(new Date(campaign.startDate), "MMM d")} -{" "}
                                                                    {format(new Date(campaign.endDate), "MMM d")}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-1">
                                                                {getCampaignTypeIcon(campaign.type)}
                                                                <span className="text-sm capitalize">{campaign.type}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span className="text-sm">{campaign.target.toLocaleString()}</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span className="text-sm font-medium">{campaign.achieved.toLocaleString()}</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full">
                                                                    <div
                                                                        className={`h-full rounded-full ${progress >= 80 ? "bg-green-500" : progress >= 50 ? "bg-amber-500" : "bg-red-500"
                                                                            }`}
                                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs">{Math.round(progress)}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span className={`text-sm font-medium ${roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                                {roi.toFixed(1)}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Campaign Impact</CardTitle>
                            <CardDescription>Sales lift and market share changes from campaigns</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium">Campaign</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium">Products</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Pre-Campaign Sales</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">During Campaign</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Sales Lift</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium">Market Share Change</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCampaigns
                                            .filter((c) => c.status === "active" || c.status === "completed")
                                            .map((campaign) => {
                                                const preCampaignSales = Math.floor(Math.random() * 5000 + 5000)
                                                const duringCampaignSales = Math.floor(preCampaignSales * (1 + Math.random() * 0.5))
                                                const salesLift = ((duringCampaignSales - preCampaignSales) / preCampaignSales) * 100
                                                const marketShareChange = Math.random() * 4 - 1

                                                return (
                                                    <tr key={campaign.id} className="border-b hover:bg-slate-50">
                                                        <td className="py-3 px-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">{campaign.name}</span>
                                                                <span className="text-xs text-muted-foreground capitalize">{campaign.type}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm">{campaign.products.map((p) => p.name).join(", ")}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {campaign.products.length} product{campaign.products.length !== 1 ? "s" : ""}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span className="text-sm">{formatCurrency(preCampaignSales)}</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span className="text-sm">{formatCurrency(duringCampaignSales)}</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span
                                                                className={`text-sm font-medium ${salesLift >= 0 ? "text-green-600" : "text-red-600"}`}
                                                            >
                                                                {salesLift >= 0 ? "+" : ""}
                                                                {salesLift.toFixed(1)}%
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span
                                                                className={`text-sm font-medium ${marketShareChange >= 0 ? "text-green-600" : "text-red-600"}`}
                                                            >
                                                                {marketShareChange >= 0 ? "+" : ""}
                                                                {marketShareChange.toFixed(1)}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
