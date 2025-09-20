"use client"

import { useState, useEffect } from "react"

interface TypingEffectProps {
    text: string
    speed?: number
    className?: string
}

export function TypingEffect({
    text, speed = 20, className }: TypingEffectProps) {
    const [displayedText, setDisplayedText] = useState("")
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[currentIndex])
                setCurrentIndex((prev) => prev + 1)
            }, speed)

            return () => clearTimeout(timeout)
        } else {
            setIsComplete(true)
        }
    }, [currentIndex, text, speed])

    // Convert newlines to <br> tags
    const formattedText = displayedText.split("\n").map((line, i) => (
        <span key={i}>
            {line}
            {i < displayedText.split("\n").length - 1 && <br />}
        </span>
    ))

    return (
        <div className={`relative ${className}`}>
            <p className="whitespace-pre-line text-sm italic font-light">{formattedText}</p>
            {!isComplete && <span className="inline-block w-1.5 h-4 bg-emerald-600 ml-0.5 animate-pulse" />}
        </div>
    )
}
