"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Info } from "lucide-react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function MarketPenetrationChart({
    expanded = false }: { expanded?: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

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

        // Define data
        const regions = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"]
        const penetrationData = [
            { name: "Premium Vodka", data: [92, 78, 65, 58, 42] },
            { name: "Craft Gin", data: [85, 72, 48, 42, 35] },
            { name: "Blended Whisky", data: [78, 65, 52, 45, 38] },
            { name: "Light Beer", data: [95, 88, 82, 75, 68] },
        ]
        const colors = ["#047857", "#0369a1", "#7e22ce", "#ca8a04"]

        // Draw chart
        const drawChart = () => {
            if (!ctx) return

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Set chart dimensions
            const chartPadding = { top: 20, right: 20, bottom: 50, left: 50 }
            const chartWidth = canvas.width - chartPadding.left - chartPadding.right
            const chartHeight = canvas.height - chartPadding.top - chartPadding.bottom

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
                const value = Math.round(100 - (100 * i) / gridLines)

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
            const barWidth = chartWidth / (regions.length * penetrationData.length + penetrationData.length)
            const groupWidth = barWidth * penetrationData.length

            regions.forEach((region, i) => {
                const x = chartPadding.left + groupWidth * i + groupWidth / 2 + i * barWidth
                ctx.fillStyle = "#6b7280"
                ctx.font = "10px sans-serif"
                ctx.textAlign = "center"
                ctx.textBaseline = "top"
                ctx.fillText(region, x, chartPadding.top + chartHeight + 10)
            })

            // Draw bars
            penetrationData.forEach((product, productIndex) => {
                product.data.forEach((value, regionIndex) => {
                    const x =
                        chartPadding.left +
                        groupWidth * regionIndex +
                        barWidth * productIndex +
                        regionIndex * barWidth +
                        barWidth / 2
                    const barHeight = (chartHeight * value) / 100
                    const y = chartPadding.top + chartHeight - barHeight

                    ctx.fillStyle = colors[productIndex]
                    ctx.fillRect(x, y, barWidth * 0.8, barHeight)

                    // Add value label on top of the bar
                    if (value > 10) {
                        ctx.fillStyle = "#ffffff"
                        ctx.font = "9px sans-serif"
                        ctx.textAlign = "center"
                        ctx.textBaseline = "middle"
                        if (barHeight > 15) {
                            ctx.fillText(value.toString() + "%", x + barWidth * 0.4, y + barHeight / 2)
                        }
                    }
                })
            })

            // Draw legend
            const legendX = chartPadding.left
            const legendY = chartPadding.top + 10
            const itemHeight = 20
            const colorBoxSize = 12

            penetrationData.forEach((product, index) => {
                const y = legendY + index * itemHeight

                // Draw color box
                ctx.fillStyle = colors[index]
                ctx.fillRect(legendX, y, colorBoxSize, colorBoxSize)

                // Draw label
                ctx.fillStyle = "#111827"
                ctx.font = "12px sans-serif"
                ctx.textAlign = "left"
                ctx.textBaseline = "middle"
                ctx.fillText(product.name, legendX + colorBoxSize + 5, y + colorBoxSize / 2)
            })

            // Draw title
            ctx.fillStyle = "#111827"
            ctx.font = "14px sans-serif"
            ctx.textAlign = "center"
            ctx.textBaseline = "top"
            ctx.fillText("Market Penetration by Region and Product", canvas.width / 2, 10)
        }

        // Initial draw
        drawChart()

        // Redraw on resize
        window.addEventListener("resize", drawChart)

        return () => {
            window.removeEventListener("resize", resizeCanvas)
            window.removeEventListener("resize", drawChart)
        }
    }, [expanded])

    return (
        <div className={`relative ${expanded ? "h-[500px]" : "aspect-[2/1]"} bg-white rounded-md`}>
            <div className="absolute top-3 left-3 z-10 flex gap-2">
                <Select defaultValue="penetration">
                    <SelectTrigger className="w-[180px] bg-white border-gray-200">
                        <SelectValue placeholder="View Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="penetration">Market Penetration</SelectItem>
                        <SelectItem value="growth">Growth Rate</SelectItem>
                        <SelectItem value="opportunity">Opportunity Gaps</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="pt-16 h-full">
                <canvas ref={canvasRef} className="w-full h-full" />
            </div>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute right-3 top-3 cursor-pointer"
                        >
                            <div className="bg-blue-100 text-blue-600 rounded-full p-1">
                                <Info className="h-4 w-4" />
                            </div>
                        </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="max-w-xs">
                            <p className="font-medium mb-1">About Market Penetration</p>
                            <p className="text-sm">
                                Market penetration shows the percentage of potential retailers in each region that stock your products.
                                Higher penetration indicates stronger market presence and distribution efficiency.
                            </p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-md p-2 shadow-sm">
                <div className="text-xs font-medium">Key Insights:</div>
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                    <li>• Light Beer has highest overall penetration (82% avg)</li>
                    <li>• Significant opportunity in Eldoret region (52% avg)</li>
                    <li>• Premium Vodka growing fastest in Nakuru (+12%)</li>
                </ul>
            </div>
        </div>
    )
}
