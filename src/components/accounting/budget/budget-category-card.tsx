import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react"

interface BudgetCategoryCardProps {
    category: {
        categoryId: string
        categoryName: string
        budgeted: number
        actual: number
        variance: number
        percentUsed: number
    }
}

export function BudgetCategoryCard({
    category }: BudgetCategoryCardProps) {
    const getStatusColor = () => {
        if (category.percentUsed > 100) return "red"
        if (category.percentUsed > 90) return "amber"
        if (category.percentUsed > 70) return "yellow"
        return "green"
    }

    const statusColor = getStatusColor()

    return (
        <Card
            className={`border-l-4 ${statusColor === "red"
                ? "border-l-red-500"
                : statusColor === "amber"
                    ? "border-l-amber-500"
                    : statusColor === "yellow"
                        ? "border-l-yellow-500"
                        : "border-l-green-500"
                }`}
        >
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                    <span>{category.categoryName}</span>
                    {category.percentUsed > 90 && (
                        <AlertTriangle className={`h-4 w-4 ${statusColor === "red" ? "text-red-500" : "text-amber-500"}`} />
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Budget</span>
                    <span className="font-medium">KES {category.budgeted.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Spent</span>
                    <span className="font-medium">KES {category.actual.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className={`font-medium ${category.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {category.variance >= 0 ? (
                            <TrendingDown className="inline h-4 w-4 mr-1" />
                        ) : (
                            <TrendingUp className="inline h-4 w-4 mr-1" />
                        )}
                        KES {Math.abs(category.variance).toLocaleString()}
                    </span>
                </div>

                <div className="pt-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Progress</span>
                        <span
                            className={`text-sm font-medium ${statusColor === "red"
                                ? "text-red-600"
                                : statusColor === "amber"
                                    ? "text-amber-600"
                                    : statusColor === "yellow"
                                        ? "text-yellow-600"
                                        : "text-green-600"
                                }`}
                        >
                            {category.percentUsed.toFixed(1)}%
                        </span>
                    </div>
                    <Progress
                        value={Math.min(category.percentUsed, 100)}
                        className={`h-2 ${statusColor === "red"
                            ? "bg-red-100"
                            : statusColor === "amber"
                                ? "bg-amber-100"
                                : statusColor === "yellow"
                                    ? "bg-yellow-100"
                                    : "bg-green-100"
                            }`}
                        indicatorClassName={
                            statusColor === "red"
                                ? "bg-red-500"
                                : statusColor === "amber"
                                    ? "bg-amber-500"
                                    : statusColor === "yellow"
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                        }
                    />
                </div>
            </CardContent>
        </Card>
    )
}
