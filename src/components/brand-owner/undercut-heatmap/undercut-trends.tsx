"use client"

import { useEffect, useRef, useState } from "react"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function UndercutTrends() {

    const [selectedProduct, setSelectedProduct] = useState("all")
    const [selectedRegion, setSelectedRegion] = useState("all")
    const [selectedView, setSelectedView] = useState("trend")
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const pieCanvasRef = useRef<HTMLCanvasElement>(null)
    const barCanvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas dimensions
        const resizeCanvas = () => {
            const parent = canvas.parentElement
            if (!parent) return

            canvas.width = parent.clientWidth
            canvas.height = parent.clientHeight
        }

        resizeCanvas()
        window.addEventListener("resize", resizeCanvas)

        // Draw line chart
        const drawLineChart = () => {
            if (!ctx) return

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Set chart dimensions
            const chartPadding = { top: 20, right: 30, bottom: 50, left: 60 }
            const chartWidth = canvas.width - chartPadding.left - chartPadding.right
            const chartHeight = canvas.height - chartPadding.top - chartPadding.bottom

            // Define data
            const dates = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            const severeData = [5, 6, 4, 7, 8, 10, 12, 15, 18, 22, 25, 28]
            const moderateData = [12, 14, 15, 18, 20, 22, 25, 28, 30, 32, 35, 38]
            const mildData = [18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45]
            const totalRetailers = 350

            // Calculate percentages
            const severePercentages = severeData.map((value) => (value / totalRetailers) * 100)
            const moderatePercentages = moderateData.map((value) => (value / totalRetailers) * 100)
            const mildPercentages = mildData.map((value) => (value / totalRetailers) * 100)

            // Draw axes
            ctx.beginPath()
            ctx.moveTo(chartPadding.left, chartPadding.top)
            ctx.lineTo(chartPadding.left, chartPadding.top + chartHeight)
            ctx.lineTo(chartPadding.left + chartWidth, chartPadding.top + chartHeight)
            ctx.strokeStyle = "#e5e7eb"
            ctx.lineWidth = 1
            ctx.stroke()

            // Draw horizontal grid lines
            const gridLines = 5
            for (let i = 0; i <= gridLines; i++) {
                const y = chartPadding.top + (chartHeight * i) / gridLines
                const value = Math.round(30 - (30 * i) / gridLines)

                ctx.beginPath()
                ctx.moveTo(chartPadding.left, y)
                ctx.lineTo(chartPadding.left + chartWidth, y)
                ctx.strokeStyle = "#f3f4f6"
                ctx.stroke()

                // Draw y-axis labels
                ctx.fillStyle = "#6b7280"
                ctx.font = "10px sans-serif"
                ctx.textAlign = "right"
                ctx.textBaseline = "middle"
                ctx.fillText(value.toString() + "%", chartPadding.left - 10, y)
            }

            // Draw x-axis labels
            const xStep = chartWidth / (dates.length - 1)
            dates.forEach((date, i) => {
                const x = chartPadding.left + xStep * i
                ctx.fillStyle = "#6b7280"
                ctx.font = "10px sans-serif"
                ctx.textAlign = "center"
                ctx.textBaseline = "top"
                ctx.fillText(date, x, chartPadding.top + chartHeight + 10)
            })

            // Draw severe data line
            ctx.beginPath()
            severePercentages.forEach((value, i) => {
                const x = chartPadding.left + xStep * i
                const y = chartPadding.top + chartHeight - (chartHeight * value) / 30
                if (i === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }
            })
            ctx.strokeStyle = "#dc2626"
            ctx.lineWidth = 2
            ctx.stroke()

            // Draw moderate data line
            ctx.beginPath()
            moderatePercentages.forEach((value, i) => {
                const x = chartPadding.left + xStep * i
                const y = chartPadding.top + chartHeight - (chartHeight * value) / 30
                if (i === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }
            })
            ctx.strokeStyle = "#d97706"
            ctx.lineWidth = 2
            ctx.stroke()

            // Draw mild data line
            ctx.beginPath()
            mildPercentages.forEach((value, i) => {
                const x = chartPadding.left + xStep * i
                const y = chartPadding.top + chartHeight - (chartHeight * value) / 30
                if (i === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }
            })
            ctx.strokeStyle = "#eab308"
            ctx.lineWidth = 2
            ctx.stroke()

            // Draw legend
            const legendX = chartPadding.left + 20
            const legendY = chartPadding.top + 20
            const itemHeight = 20
            const colorBoxSize = 12

            // Severe
            ctx.fillStyle = "#dc2626"
            ctx.fillRect(legendX, legendY, colorBoxSize, colorBoxSize)
            ctx.fillStyle = "#111827"
            ctx.font = "12px sans-serif"
            ctx.textAlign = "left"
            ctx.textBaseline = "middle"
            ctx.fillText("Severe (>20% below MSRP)", legendX + colorBoxSize + 5, legendY + colorBoxSize / 2)

            // Moderate
            ctx.fillStyle = "#d97706"
            ctx.fillRect(legendX, legendY + itemHeight, colorBoxSize, colorBoxSize)
            ctx.fillStyle = "#111827"
            ctx.font = "12px sans-serif"
            ctx.textAlign = "left"
            ctx.textBaseline = "middle"
            ctx.fillText("Moderate (10-20% below MSRP)", legendX + colorBoxSize + 5, legendY + itemHeight + colorBoxSize / 2)

            // Mild
            ctx.fillStyle = "#eab308"
            ctx.fillRect(legendX, legendY + itemHeight * 2, colorBoxSize, colorBoxSize)
            ctx.fillStyle = "#111827"
            ctx.font = "12px sans-serif"
            ctx.textAlign = "left"
            ctx.textBaseline = "middle"
            ctx.fillText("Mild (5-10% below MSRP)", legendX + colorBoxSize + 5, legendY + itemHeight * 2 + colorBoxSize / 2)

            // Draw title
            ctx.fillStyle = "#111827"
            ctx.font = "14px sans-serif"
            ctx.textAlign = "center"
            ctx.textBaseline = "top"
            ctx.fillText("Undercut Trend Over Time (% of Retailers)", canvas.width / 2, 10)
        }

        // Initial draw
        drawLineChart()

        // Redraw on resize
        window.addEventListener("resize", drawLineChart)

        return () => {
            window.removeEventListener("resize", resizeCanvas)
            window.removeEventListener("resize", drawLineChart)
        }
    }, [selectedProduct, selectedRegion])

    useEffect(() => {
        const canvas = pieCanvasRef.current
        if (!canvas || selectedView !== "distribution") return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas dimensions
        const resizeCanvas = () => {
            const parent = canvas.parentElement
            if (!parent) return

            canvas.width = parent.clientWidth
            canvas.height = parent.clientHeight
        }

        resizeCanvas()
        window.addEventListener("resize", resizeCanvas)

        // Draw pie chart
        const drawPieChart = () => {
            if (!ctx) return

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Define data
            const data = [
                { label: "Compliant", value: 78.6, color: "#10b981" },
                { label: "Severe", value: 8.2, color: "#dc2626" },
                { label: "Moderate", value: 10.5, color: "#d97706" },
                { label: "Mild", value: 2.7, color: "#eab308" },
            ]

            const total = data.reduce((sum, item) => sum + item.value, 0)
            const centerX = canvas.width / 2
            const centerY = canvas.height / 2
            const radius = Math.min(centerX, centerY) * 0.7

            let startAngle = 0
            data.forEach((item) => {
                const sliceAngle = (item.value / total) * 2 * Math.PI

                // Draw slice
                ctx.beginPath()
                ctx.moveTo(centerX, centerY)
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
                ctx.closePath()
                ctx.fillStyle = item.color
                ctx.fill()

                // Draw label
                const labelAngle = startAngle + sliceAngle / 2
                const labelRadius = radius * 0.7
                const labelX = centerX + Math.cos(labelAngle) * labelRadius
                const labelY = centerY + Math.sin(labelAngle) * labelRadius

                if (item.value > 5) {
                    // Only draw labels for slices that are big enough
                    ctx.fillStyle = "#ffffff"
                    ctx.font = "bold 14px sans-serif"
                    ctx.textAlign = "center"
                    ctx.textBaseline = "middle"
                    ctx.fillText(`${item.value}%`, labelX, labelY)
                }

                startAngle += sliceAngle
            })

            // Draw legend
            const legendX = 20
            const legendY = canvas.height - 100
            const itemHeight = 25
            const colorBoxSize = 15

            data.forEach((item, index) => {
                ctx.fillStyle = item.color
                ctx.fillRect(legendX, legendY + index * itemHeight, colorBoxSize, colorBoxSize)

                ctx.fillStyle = "#111827"
                ctx.font = "12px sans-serif"
                ctx.textAlign = "left"
                ctx.textBaseline = "middle"
                ctx.fillText(
                    `${item.label} (${item.value}%)`,
                    legendX + colorBoxSize + 10,
                    legendY + index * itemHeight + colorBoxSize / 2,
                )
            })

            // Draw title
            ctx.fillStyle = "#111827"
            ctx.font = "14px sans-serif"
            ctx.textAlign = "center"
            ctx.textBaseline = "top"
            ctx.fillText("Price Compliance Distribution", canvas.width / 2, 10)
        }

        // Initial draw
        drawPieChart()

        // Redraw on resize
        window.addEventListener("resize", drawPieChart)

        return () => {
            window.removeEventListener("resize", resizeCanvas)
            window.removeEventListener("resize", drawPieChart)
        }
    }, [selectedView, selectedProduct, selectedRegion])

    useEffect(() => {
        const canvas = barCanvasRef.current
        if (!canvas || selectedView !== "regional") return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas dimensions
        const resizeCanvas = () => {
            const parent = canvas.parentElement
            if (!parent) return

            canvas.width = parent.clientWidth
            canvas.height = parent.clientHeight
        }

        resizeCanvas()
        window.addEventListener("resize", resizeCanvas)

        // Draw bar chart
        const drawBarChart = () => {
            if (!ctx) return

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Set chart dimensions
            const chartPadding = { top: 30, right: 30, bottom: 50, left: 60 }
            const chartWidth = canvas.width - chartPadding.left - chartPadding.right
            const chartHeight = canvas.height - chartPadding.top - chartPadding.bottom

            // Define data
            const regions = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Malindi"]
            const severeData = [12.5, 10.2, 5.8, 4.2, 3.5, 2.1]
            const moderateData = [15.2, 12.8, 10.5, 8.7, 7.2, 5.4]
            const mildData = [8.3, 7.5, 6.2, 5.8, 4.3, 3.2]

            // Draw axes
            ctx.beginPath()
            ctx.moveTo(chartPadding.left, chartPadding.top)
            ctx.lineTo(chartPadding.left, chartPadding.top + chartHeight)
            ctx.lineTo(chartPadding.left + chartWidth, chartPadding.top + chartHeight)
            ctx.strokeStyle = "#e5e7eb"
            ctx.lineWidth = 1
            ctx.stroke()

            // Draw horizontal grid lines
            const gridLines = 5
            for (let i = 0; i <= gridLines; i++) {
                const y = chartPadding.top + (chartHeight * i) / gridLines
                const value = Math.round(30 - (30 * i) / gridLines)

                ctx.beginPath()
                ctx.moveTo(chartPadding.left, y)
                ctx.lineTo(chartPadding.left + chartWidth, y)
                ctx.strokeStyle = "#f3f4f6"
                ctx.stroke()

                // Draw y-axis labels
                ctx.fillStyle = "#6b7280"
                ctx.font = "10px sans-serif"
                ctx.textAlign = "right"
                ctx.textBaseline = "middle"
                ctx.fillText(value.toString() + "%", chartPadding.left - 10, y)
            }

            // Draw bars
            const barWidth = chartWidth / regions.length / 4
            const groupWidth = barWidth * 3 + 10

            regions.forEach((region, i) => {
                const x = chartPadding.left + groupWidth * i + barWidth

                // Draw x-axis labels
                ctx.fillStyle = "#6b7280"
                ctx.font = "10px sans-serif"
                ctx.textAlign = "center"
                ctx.textBaseline = "top"
                ctx.fillText(region, x + barWidth, chartPadding.top + chartHeight + 10)

                // Draw severe bar
                const severeHeight = (chartHeight * severeData[i]) / 30
                ctx.fillStyle = "#dc2626"
                ctx.fillRect(x, chartPadding.top + chartHeight - severeHeight, barWidth, severeHeight)

                // Draw moderate bar
                const moderateHeight = (chartHeight * moderateData[i]) / 30
                ctx.fillStyle = "#d97706"
                ctx.fillRect(x + barWidth + 5, chartPadding.top + chartHeight - moderateHeight, barWidth, moderateHeight)

                // Draw mild bar
                const mildHeight = (chartHeight * mildData[i]) / 30
                ctx.fillStyle = "#eab308"
                ctx.fillRect(x + barWidth * 2 + 10, chartPadding.top + chartHeight - mildHeight, barWidth, mildHeight)
            })

            // Draw legend
            const legendX = chartPadding.left + 20
            const legendY = chartPadding.top + 20
            const itemHeight = 20
            const colorBoxSize = 12

            // Severe
            ctx.fillStyle = "#dc2626"
            ctx.fillRect(legendX, legendY, colorBoxSize, colorBoxSize)
            ctx.fillStyle = "#111827"
            ctx.font = "12px sans-serif"
            ctx.textAlign = "left"
            ctx.textBaseline = "middle"
            ctx.fillText("Severe", legendX + colorBoxSize + 5, legendY + colorBoxSize / 2)

            // Moderate
            ctx.fillStyle = "#d97706"
            ctx.fillRect(legendX + 100, legendY, colorBoxSize, colorBoxSize)
            ctx.fillStyle = "#111827"
            ctx.font = "12px sans-serif"
            ctx.textAlign = "left"
            ctx.textBaseline = "middle"
            ctx.fillText("Moderate", legendX + 100 + colorBoxSize + 5, legendY + colorBoxSize / 2)

            // Mild
            ctx.fillStyle = "#eab308"
            ctx.fillRect(legendX + 200, legendY, colorBoxSize, colorBoxSize)
            ctx.fillStyle = "#111827"
            ctx.font = "12px sans-serif"
            ctx.textAlign = "left"
            ctx.textBaseline = "middle"
            ctx.fillText("Mild", legendX + 200 + colorBoxSize + 5, legendY + colorBoxSize / 2)

            // Draw title
            ctx.fillStyle = "#111827"
            ctx.font = "14px sans-serif"
            ctx.textAlign = "center"
            ctx.textBaseline = "top"
            ctx.fillText("Regional Undercut Distribution", canvas.width / 2, 10)
        }

        // Initial draw
        drawBarChart()

        // Redraw on resize
        window.addEventListener("resize", drawBarChart)

        return () => {
            window.removeEventListener("resize", resizeCanvas)
            window.removeEventListener("resize", drawBarChart)
        }
    }, [selectedView, selectedProduct, selectedRegion])

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="w-[180px] bg-white border-gray-200">
                        <SelectValue placeholder="All Products" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        <SelectItem value="premium-vodka">Premium Vodka 750ml</SelectItem>
                        <SelectItem value="craft-gin">Craft Gin 500ml</SelectItem>
                        <SelectItem value="blended-whisky">Blended Whisky 1L</SelectItem>
                        <SelectItem value="light-beer">Light Beer 6-pack</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="w-[160px] bg-white border-gray-200">
                        <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        <SelectItem value="nairobi">Nairobi</SelectItem>
                        <SelectItem value="mombasa">Mombasa</SelectItem>
                        <SelectItem value="kisumu">Kisumu</SelectItem>
                        <SelectItem value="nakuru">Nakuru</SelectItem>
                        <SelectItem value="eldoret">Eldoret</SelectItem>
                    </SelectContent>
                </Select>

                <div className="ml-auto">
                    <Tabs defaultValue="trend" onValueChange={setSelectedView}>
                        <TabsList className="bg-white border border-gray-200">
                            <TabsTrigger
                                value="trend"
                                className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                            >
                                Trend Over Time
                            </TabsTrigger>
                            <TabsTrigger
                                value="distribution"
                                className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                            >
                                Distribution
                            </TabsTrigger>
                            <TabsTrigger
                                value="regional"
                                className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                            >
                                Regional
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 h-[400px] relative">
                <TabsContent value="trend" className="h-full m-0 p-0">
                    <canvas ref={canvasRef} className="w-full h-full" />
                </TabsContent>

                <TabsContent value="distribution" className="h-full m-0 p-0">
                    <canvas ref={pieCanvasRef} className="w-full h-full" />
                </TabsContent>

                <TabsContent value="regional" className="h-full m-0 p-0">
                    <canvas ref={barCanvasRef} className="w-full h-full" />
                </TabsContent>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="absolute right-3 top-3 cursor-pointer bg-blue-100 text-blue-600 rounded-full p-1">
                                <Info className="h-4 w-4" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="max-w-xs">
                                <p className="font-medium mb-1">About Undercut Trends</p>
                                <p className="text-sm">
                                    This analysis shows how price undercutting has changed over time, its distribution by severity, and
                                    regional patterns. Use this data to identify emerging issues and track the effectiveness of your
                                    interventions.
                                </p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h3 className="text-sm font-medium mb-2">Key Insights</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Severe undercutting has increased by 460% over the past 12 months</li>
                    <li>• Nairobi and Mombasa account for 65% of all severe undercutting cases</li>
                    <li>• Premium Vodka is the most affected product (42% of all cases)</li>
                    <li>• Undercutting typically spreads from urban centers to surrounding areas</li>
                </ul>
            </div>
        </div>
    )
}
