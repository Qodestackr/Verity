"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { TourStep } from "./tour-step"
import type { TourOverlayProps } from "./types"

export function TourOverlay({
    steps, onClose, role }: TourOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0)

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    return (
        <AnimatePresence mode="wait">
            <TourStep
                key={currentStep}
                step={{ ...steps[currentStep], index: currentStep }}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onClose={onClose}
                totalSteps={steps.length}
            />
        </AnimatePresence>
    )
}
