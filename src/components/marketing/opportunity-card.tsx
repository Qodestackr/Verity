"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Info, Zap, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface OpportunityCardProps {
    opportunity: {
        id: string
        title: string
        description: string
        urgency: "high" | "medium" | "low"
        expectedRevenue: number
        estimatedTime: string
        confidence: number
        reasoning?: string
    }
    onExecute: (id: string) => void
    isExecuting: boolean
}

export function OpportunityCard({
    opportunity, onExecute, isExecuting }: OpportunityCardProps) {
    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case "high":
                return "text-red-600 bg-red-50 border-red-200"
            case "medium":
                return "text-amber-600 bg-amber-50 border-amber-200"
            case "low":
                return "text-emerald-600 bg-emerald-50 border-emerald-200"
            default:
                return "text-slate-600 bg-slate-50 border-slate-200"
        }
    }

    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{opportunity.title}</h3>
                    <Badge className={cn("text-xs", getUrgencyColor(opportunity.urgency))}>{opportunity.urgency}</Badge>
                    {opportunity.reasoning && (
                        <HoverCard>
                            <HoverCardTrigger>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">Why this suggestion?</h4>
                                    <p className="text-sm text-muted-foreground">{opportunity.reasoning}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Confidence:</span>
                                        <Progress value={opportunity.confidence} className="flex-1 h-2" />
                                        <span className="text-xs font-medium">{opportunity.confidence}%</span>
                                    </div>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    )}
                </div>

                <p className="text-sm text-muted-foreground mb-3">{opportunity.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>💰 +KES {opportunity.expectedRevenue.toLocaleString()}</span>
                    <span>⏱️ {opportunity.estimatedTime}</span>
                    <span>🎯 {opportunity.confidence}% confident</span>
                </div>
            </div>

            <Button
                onClick={() => onExecute(opportunity.id)}
                disabled={isExecuting}
                className="ml-4 bg-amber-600 hover:bg-amber-700"
            >
                {isExecuting ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Executing...
                    </>
                ) : (
                    <>
                        <Zap className="h-4 w-4 mr-2" />
                        Execute
                    </>
                )}
            </Button>
        </div>
    )
}
