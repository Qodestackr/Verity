"use client"

import { motion } from "framer-motion"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
        },
    },
}

export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col w-full">
                <div className="flex flex-col gap-2 mb-3">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-5 w-full max-w-md" />
                </div>

                <FeatureCardSkeletons />
            </div>
        </div>
    )
}

function FeatureCardSkeletons() {
    return (
        <motion.div
            className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {Array.from({ length: 9 }).map((_, index) => (
                <FeatureCardSkeleton key={index} delay={index * 0.05} />
            ))}
        </motion.div>
    )
}

function FeatureCardSkeleton({ delay = 0 }) {
    return (
        <motion.div variants={item} initial="hidden" animate="show" transition={{ delay }}>
            <Card className="overflow-hidden h-full border">
                <CardContent className="p-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1.5">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-12 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full mt-1.5" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}