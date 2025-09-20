"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function SKUVelocityChart({
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
        const products = [
            { name: "Premium Vodka 750ml", data: [42, 45, 48, 52, 58, 65, 72, 78, 82, 85, 88, 92] },
            { name: "Craft Gin 500ml", data: [35, 38, 42, 45, 48, 52, 55, 58, 62, 65, 68, 72] },
            { name: "Blended Whisky 1L", data: [28, 30, 32, 35, 38, 40, 42, 45, 48, 50, 52, 55] },
            { name: "Light Beer 6-pack", data: [48, 50, 52, 54, 52, 50, 48, 46, 44, 42, 40, 38] },
        ]

        const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"]
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

            // Find max value for scaling
            const maxValue = Math.max(...products.flatMap((product) => product.data)) * 1.1

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
            months.forEach((month, i) => {
                const x = chartPadding.left + (chartWidth * i) / (months.length - 1)
                ctx.fillStyle = "#6b7280"
                ctx.font = "10px sans-serif"
                ctx.textAlign = "center"
                ctx.textBaseline = "top"
                ctx.fillText(month, x, chartPadding.top + chartHeight + 10)
            })

            // Draw data lines
            products.forEach((product, productIndex) => {
                ctx.beginPath()
                product.data.forEach((value, i) => {
                    const x = chartPadding.left + (chartWidth * i) / (product.data.length - 1)
                    const y = chartPadding.top + chartHeight - (chartHeight * value) / maxValue

                    if (i === 0) {
                        ctx.moveTo(x, y)
                    } else {
                        ctx.lineTo(x, y)
                    }
                })
                ctx.strokeStyle = colors[productIndex]
                ctx.lineWidth = 2
                ctx.stroke()

                // Draw data points
                product.data.forEach((value, i) => {
                    const x = chartPadding.left + (chartWidth * i) / (product.data.length - 1)
                    const y = chartPadding.top + chartHeight - (chartHeight * value) / maxValue

                    ctx.beginPath()
                    ctx.arc(x, y, 3, 0, Math.PI * 2)
                    ctx.fillStyle = colors[productIndex]
                    ctx.fill()
                    ctx.strokeStyle = "#ffffff"
                    ctx.lineWidth = 1
                    ctx.stroke()
                })
            })

            // Draw legend
            const legendX = chartPadding.left
            const legendY = chartPadding.top + 10
            const itemHeight = 20
            const colorBoxSize = 12

            products.forEach((product, index) => {
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
            ctx.fillText("SKU Velocity - Units Sold per Day", canvas.width / 2, 10)
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
                            <p className="font-medium mb-1">About SKU Velocity</p>
                            <p className="text-sm">
                                SKU Velocity measures how quickly products are selling. Higher velocity indicates stronger demand and
                                faster turnover.
                            </p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-md p-2 shadow-sm">
                <div className="text-xs font-medium">Key Insights:</div>
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                    <li>• Premium Vodka shows strongest growth trend (+24%)</li>
                    <li>• Light Beer declining in Nairobi region (-8%)</li>
                    <li>• Craft Gin velocity increasing in coastal areas</li>
                </ul>
            </div>
        </div>
    )
}