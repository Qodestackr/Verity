"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { VideoPlayer } from "./video-player"
import type { TourStepProps } from "./types"
import Image from "next/image"

export function TourStep({
    step, onNext, onPrevious, onClose, totalSteps }: TourStepProps) {
    const handleSwipe = (event: any, info: any) => {
        if (info.offset.x > 100 && step.index > 0) {
            onPrevious()
        } else if (info.offset.x < -100 && step.index < totalSteps - 1) {
            onNext()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/50 z-50 p-4 backdrop-blur-sm"
        >
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleSwipe}
                className="w-full touch-none"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
                <Card className="w-full max-w-lg mx-auto shadow-xl">
                    <CardHeader className="relative pb-0 space-y-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1 hover:bg-destructive/10 hover:text-destructive"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close tour</span>
                        </Button>
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-lg font-medium shrink-0">
                                {step.emoji || step.index + 1}
                            </div>
                            <CardTitle className="text-xl font-normal leading-tight">{step.title}</CardTitle>
                        </div>
                        <Progress value={((step.index + 1) / totalSteps) * 100} className="h-1.5" />
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                        {step.video && (
                            <VideoPlayer src={step.video} className="aspect-video shadow-md border" poster={step.image} />
                        )}
                        {!step.video && step.image && (
                            // TODO: ASPECT RATIO
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="relative w-full h-[140px] rounded-lg overflow-hidden shadow-md border"
                            >
                                <Image src={step.image || "/placeholder.svg"} alt={step.title} fill className="object-cover" />
                            </motion.div>
                        )}
                        {step.component && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="p-2 bg-muted/50 rounded-lg border"
                            >
                                {step.component}
                            </motion.div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-1 pt-2">
                        <Button
                            variant="outline"
                            onClick={onPrevious}
                            disabled={step.index === 0}
                            className="w-full h-8 text-xs sm:w-auto order-2 sm:order-1"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>
                        <Button
                            variant="default"
                            onClick={step.index === totalSteps - 1 ? onClose : onNext}
                            className="w-full h-8 text-xs sm:w-auto order-1 sm:order-2"
                        >
                            {step.index === totalSteps - 1 ? (
                                "Finish Tour"
                            ) : (
                                <>
                                    Next Step
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </motion.div>
    )
}