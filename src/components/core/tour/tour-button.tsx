"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HelpCircle } from "lucide-react"
import type { TourButtonProps } from "./types"

export function TourButton({
    onClick, className, children }: TourButtonProps) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30",
                className,
            )}
        >
            <HelpCircle className="h-4 w-4 text-primary" />
            {children || "Take a Tour"}
        </Button>
    )
}