"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, BarChart3, ArrowLeft, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ScenarioCreator } from "@/components/accounting/budget/scenario-creator"
import { ScenarioComparison } from "@/components/accounting/budget/scenario-comparison"

interface BudgetScenariosContentProps {
    organizationId: string
    budgetId: string
    isLoading: boolean
    scenarios: any[]
    budget: any
    onCreateScenario: (data: any) => Promise<void>
    onEditScenario: (data: any) => Promise<void>
    onDeleteScenario: () => Promise<void>
}

export function BudgetScenariosContent({

    organizationId,
    budgetId,
    isLoading,
    scenarios,
    budget,
    onCreateScenario,
    onEditScenario,
    onDeleteScenario,
}: BudgetScenariosContentProps) {
    const [activeTab, setActiveTab] = useState("scenarios")
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editingScenario, setEditingScenario] = useState<any>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [scenarioToDelete, setScenarioToDelete] = useState<any>(null)

    const baselineScenario = scenarios.find((s) => s.isBaseline)

    const handleEditClick = (scenario: any) => {
        setEditingScenario(scenario)
    }

    const handleDeleteClick = (scenario: any) => {
        setScenarioToDelete(scenario)
        setDeleteDialogOpen(true)
    }

    const handleScenarioSubmit = async (data: any) => {
        if (editingScenario) {
            await onEditScenario(data)
            setEditingScenario(null)
        } else {
            await onCreateScenario(data)
            setCreateDialogOpen(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-light">Budget Scenarios</h2>
                    <div className="animate-pulse h-8 w-32 bg-muted rounded"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="pb-2">
                                <div className="h-5 bg-muted rounded w-1/3 mb-1"></div>
                                <div className="h-4 bg-muted rounded w-1/2 opacity-70"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-muted rounded w-2/3 mb-4"></div>
                                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                                <div className="h-4 bg-muted rounded w-full opacity-70"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/budget?organizationId=${organizationId}`}>
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back to Budget
                            </a>
                        </Button>
                    </div>
                    <h1 className="text-2xl font-semibold mt-2">Budget Scenarios</h1>
                    {budget && (
                        <p className="text-muted-foreground flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {budget.name} ({format(new Date(budget.startDate), "MMM d, yyyy")} to{" "}
                            {format(new Date(budget.endDate), "MMM d, yyyy")})
                        </p>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={() => setCreateDialogOpen(true)}
                        className="bg-green-700 hover:bg-green-800 text-white"
                        disabled={!budget}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Scenario
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setActiveTab("compare")}
                        // disabled={scenarios.length < 2}
                        className={activeTab === "compare" ? "bg-muted" : ""}
                    >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Compare Scenarios
                    </Button>
                </div>
            </div>

            {!budget ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Budget Not Found</CardTitle>
                        <CardDescription>The requested budget could not be found or loaded.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Please check the budget ID and try again, or return to the budget dashboard.</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" asChild>
                            <a href={`/budget?organizationId=${organizationId}`}>
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Return to Budget Dashboard
                            </a>
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                        <TabsTrigger value="compare"
                        // disabled={scenarios.length < 2}
                        >
                            Compare
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="scenarios" className="space-y-4">
                        {scenarios.length === 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>No Scenarios Found</CardTitle>
                                    <CardDescription>You haven't created any budget scenarios for this budget yet.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center py-6">
                                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-center mb-6">
                                        Create scenarios to explore different budget allocations and financial outcomes.
                                    </p>
                                    <Button
                                        onClick={() => setCreateDialogOpen(true)}
                                        className="bg-green-700 hover:bg-green-800 text-white"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Your First Scenario
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {scenarios.map((scenario) => (
                                    <Card key={scenario.id} className={scenario.isBaseline ? "border-green-500" : ""}>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg">{scenario.name}</CardTitle>
                                                {scenario.isBaseline && (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        Baseline
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardDescription>{scenario.description || "No description provided"}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Total Budget</span>
                                                    <span className="font-medium">KES {scenario.totalAmount.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Allocations</span>
                                                    <span className="font-medium">{scenario.allocations?.length || 0} categories</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Assumptions</span>
                                                    <span className="font-medium">{scenario.assumptions?.length || 0}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between pt-0">
                                            <Button variant="outline" size="sm" onClick={() => handleEditClick(scenario)}>
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteClick(scenario)}
                                                disabled={scenario.isBaseline && scenarios.length > 1}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="compare">
                        <ScenarioComparison organizationId={organizationId} budgetId={budgetId} scenarios={scenarios} />
                    </TabsContent>
                </Tabs>
            )}

            <ScenarioCreator
                open={createDialogOpen || !!editingScenario}
                onOpenChange={(open) => {
                    setCreateDialogOpen(open)
                    if (!open) setEditingScenario(null)
                }}
                onSubmit={handleScenarioSubmit}
                organizationId={organizationId}
                budgetId={budgetId}
                baselineScenario={baselineScenario}
                editingScenario={editingScenario}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this scenario?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the scenario and all its data.
                            {scenarioToDelete?.isBaseline && scenarios.length > 1 && (
                                <p className="mt-2 text-red-500 font-medium">
                                    You cannot delete the baseline scenario while other scenarios exist. Make another scenario the
                                    baseline first.
                                </p>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onDeleteScenario}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={scenarioToDelete?.isBaseline && scenarios.length > 1}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
