"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function DemandForecastChart({
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
        const actualData = [42, 45, 48, 52, 58, 65, 72, 78, 82, 85, 88, 92]
        const forecastData = [95, 98, 102, 105, 108, 112, 115, 118, 120, 122, 125, 128]
        const confidenceUpperBound = forecastData.map((val) => val * 1.1)
        const confidenceLowerBound = forecastData.map((val) => val * 0.9)

        const months = [
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
            "Jan",
            "Feb",
            "Mar",
        ]

        // Draw chart
        const drawChart = () => {
            if (!ctx) return

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Set chart dimensions
            const chartPadding = { top: 20, right: 20, bottom: 50, left: 50 }
            const chartWidth = canvas.width - chartPadding.left - chartPadding.right
            const chartHeight = canvas.height - chartPadding.top - chartPadding.bottom

            // Find max value for scaling
            const maxValue = Math.max(...confidenceUpperBound) * 1.1

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
                const value = Math.round(maxValue - (maxValue * i) / gridLines)

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
                ctx.fillText(value.toString(), chartPadding.left - 10, y)
            }

            // Draw x-axis labels
            const visibleMonths = months.slice(0, 24) // Show 24 months
            const monthStep = expanded ? 1 : 2 // Show every month or every other month
            for (let i = 0; i < visibleMonths.length; i += monthStep) {
                const x = chartPadding.left + (chartWidth * i) / (visibleMonths.length - 1)
                ctx.fillStyle = "#6b7280"
                ctx.font = "10px sans-serif"
                ctx.textAlign = "center"
                ctx.textBaseline = "top"
                ctx.fillText(visibleMonths[i], x, chartPadding.top + chartHeight + 10)

                // Draw vertical line to separate actual from forecast
                if (i === 11) {
                    ctx.beginPath()
                    ctx.moveTo(x, chartPadding.top)
                    ctx.lineTo(x, chartPadding.top + chartHeight)
                    ctx.setLineDash([5, 5])
                    ctx.strokeStyle = "#9ca3af"
                    ctx.stroke()
                    ctx.setLineDash([])

                    // Draw "Forecast Begins" label
                    ctx.fillStyle = "#4b5563"
                    ctx.font = "10px sans-serif"
                    ctx.textAlign = "center"
                    ctx.fillText("Forecast Begins", x, chartPadding.top + chartHeight + 30)
                }
            }

            // Draw confidence interval
            ctx.beginPath()
            for (let i = 0; i < confidenceUpperBound.length; i++) {
                const x =
                    chartPadding.left + (chartWidth * (i + actualData.length)) / (actualData.length + forecastData.length - 1)
                const y = chartPadding.top + chartHeight - (chartHeight * confidenceUpperBound[i]) / maxValue

                if (i === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }
            }

            for (let i = confidenceLowerBound.length - 1; i >= 0; i--) {
                const x =
                    chartPadding.left + (chartWidth * (i + actualData.length)) / (actualData.length + forecastData.length - 1)
                const y = chartPadding.top + chartHeight - (chartHeight * confidenceLowerBound[i]) / maxValue

                ctx.lineTo(x, y)
            }

            ctx.fillStyle = "rgba(79, 70, 229, 0.1)"
            ctx.fill()

            // Draw actual data line
            ctx.beginPath()
            actualData.forEach((value, i) => {
                const x = chartPadding.left + (chartWidth * i) / (actualData.length + forecastData.length - 1)
                const y = chartPadding.top + chartHeight - (chartHeight * value) / maxValue

                if (i === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }
            })
            ctx.strokeStyle = "#047857"
            ctx.lineWidth = 2
            ctx.stroke()

            // Draw forecast data line
            ctx.beginPath()
            const lastActualX =
                chartPadding.left + (chartWidth * (actualData.length - 1)) / (actualData.length + forecastData.length - 1)
            const lastActualY = chartPadding.top + chartHeight - (chartHeight * actualData[actualData.length - 1]) / maxValue
            ctx.moveTo(lastActualX, lastActualY)

            forecastData.forEach((value, i) => {
                const x =
                    chartPadding.left + (chartWidth * (i + actualData.length)) / (actualData.length + forecastData.length - 1)
                const y = chartPadding.top + chartHeight - (chartHeight * value) / maxValue

                ctx.lineTo(x, y)
            })
            ctx.strokeStyle = "#4f46e5"
            ctx.setLineDash([5, 5])
            ctx.stroke()
            ctx.setLineDash([])

            // Draw data points for actual data
            actualData.forEach((value, i) => {
                const x = chartPadding.left + (chartWidth * i) / (actualData.length + forecastData.length - 1)
                const y = chartPadding.top + chartHeight - (chartHeight * value) / maxValue

                ctx.beginPath()
                ctx.arc(x, y, 3, 0, Math.PI * 2)
                ctx.fillStyle = "#047857"
                ctx.fill()
                ctx.strokeStyle = "#ffffff"
                ctx.lineWidth = 1
                ctx.stroke()
            })

            // Draw legend
            const legendX = chartPadding.left
            const legendY = chartPadding.top + 10
            const itemHeight = 20
            const colorBoxSize = 12

            // Actual data legend
            ctx.fillStyle = "#047857"
            ctx.fillRect(legendX, legendY, colorBoxSize, colorBoxSize)
            ctx.fillStyle = "#111827"
            ctx.font = "12px sans-serif"
            ctx.textAlign = "left"
            ctx.textBaseline = "middle"
            ctx.fillText("Actual Data", legendX + colorBoxSize + 5, legendY + colorBoxSize / 2)

            // Forecast data legend
            ctx.strokeStyle = "#4f46e5"
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.moveTo(legendX, legendY + itemHeight + colorBoxSize / 2)
            ctx.lineTo(legendX + colorBoxSize, legendY + itemHeight + colorBoxSize / 2)
            ctx.stroke()
            ctx.setLineDash([])
            ctx.fillStyle = "#111827"
            ctx.font = "12px sans-serif"
            ctx.textAlign = "left"
            ctx.textBaseline = "middle"
            ctx.fillText("Forecast", legendX + colorBoxSize + 5, legendY + itemHeight + colorBoxSize / 2)

            // Confidence interval legend
            ctx.fillStyle = "rgba(79, 70, 229, 0.1)"
            ctx.fillRect(legendX, legendY + itemHeight * 2, colorBoxSize, colorBoxSize)
            ctx.strokeStyle = "#4f46e5"
            ctx.lineWidth = 1
            ctx.strokeRect(legendX, legendY + itemHeight * 2, colorBoxSize, colorBoxSize)
            ctx.fillStyle = "#111827"
            ctx.font = "12px sans-serif"
            ctx.textAlign = "left"
            ctx.textBaseline = "middle"
            ctx.fillText("95% Confidence Interval", legendX + colorBoxSize + 5, legendY + itemHeight * 2 + colorBoxSize / 2)

            // Draw title
            ctx.fillStyle = "#111827"
            ctx.font = "14px sans-serif"
            ctx.textAlign = "center"
            ctx.textBaseline = "top"
            ctx.fillText("Baridi AI Demand Forecast - Premium Vodka 750ml", canvas.width / 2, 10)
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
            <canvas ref={canvasRef} className="w-full h-full" />

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
                            <p className="font-medium mb-1">About AI Demand Forecast</p>
                            <p className="text-sm">
                                Our model analyzes historical sales data, seasonal patterns, market trends, and external factors to
                                predict future demand with 94.2% accuracy.
                            </p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-md p-2 shadow-sm">
                <div className="text-xs font-medium">Forecast Insights:</div>
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                    <li>• Predicted 38% growth over next 12 months</li>
                    <li>• Seasonal peak expected in December</li>
                    <li>• Recommend increasing production by 25%</li>
                </ul>
            </div>
        </div>
    )
}