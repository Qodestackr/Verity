"use client"

import { useEffect, useState } from "react"

export const ScanLine = () => {
    const [position, setPosition] = useState<number>(0)
    const [direction, setDirection] = useState<number>(1)

    useEffect(() => {
        const animate = () => {
            setPosition((prevPosition) => {
                // Reverse direction when reaching top or bottom
                if (prevPosition >= 95) {
                    setDirection(-1)
                    return 95
                } else if (prevPosition <= 5) {
                    setDirection(1)
                    return 5
                }
                return prevPosition + (2 * direction)
            })
        }

        const interval = setInterval(animate, 50)
        return () => clearInterval(interval)
    }, [direction])

    return (
        <div
            className="absolute w-full h-1 bg-green-500/70 z-10 blur-[1px]"
            style={{ top: `${position}%` }}
        />
    )
}