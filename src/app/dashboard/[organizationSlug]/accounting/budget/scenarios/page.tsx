"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCurrency } from "@/hooks/useCurrency";
import { BudgetScenariosContent } from "@/components/accounting/budget/budget-scenarios-content"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { APP_BASE_API_URL } from "@/config/urls"

export default function BudgetScenariosPage() {
    const [organizationId, setOrganizationId] = useState<string | null>(null)
    const [budgetId, setBudgetId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [scenarios, setScenarios] = useState<any[]>([])
    const [budget, setBudget] = useState<any>(null)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editingScenario, setEditingScenario] = useState<any>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [scenarioToDelete, setScenarioToDelete] = useState<any>(null)

    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const orgId = "VKa3oiRNrQS1wKxKg6t67EllAFUTyr6Z" //searchParams.get("organizationId") || "org_default"
        const bId = "cma5b4bzm0009smggkitm8mi9"//searchParams.get("budgetId")

        setOrganizationId(orgId)
        setBudgetId(bId)

        if (orgId && bId) {
            fetchScenarios(orgId, bId)
        }
        else {
            setIsLoading(false)
        }
    }, [searchParams])

    const fetchScenarios = async (orgId: string, bId: string) => {
        setIsLoading(true)
        try {
            const response = await fetch(`${APP_BASE_API_URL}/accounting/budgets/scenarios?organizationId=${orgId}&budgetId=${bId}`)
            if (!response.ok) {
                throw new Error("Failed to fetch scenarios")
            }
            const data = await response.json()
            console.log("Remontada", data)
            setScenarios(data)

            // Fetch budget details
            const budgetResponse = await fetch(`${APP_BASE_API_URL}/accounting/budgets/${bId}?organizationId=${orgId}`)
            if (budgetResponse.ok) {
                const budgetData = await budgetResponse.json()
                setBudget(budgetData.budget)
            } else {
                setBudget(null) // Clear budget if not found
            }
        } catch (error) {
            console.error("Error fetching scenarios:", error)
            setScenarios([])
            setBudget(null)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateScenario = async (data: any) => {
        try {
            const response = await fetch(`${APP_BASE_API_URL}/accounting/budgets/scenarios`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    organizationId,
                    budgetId,
                }),
            })

            if (response.ok) {
                setCreateDialogOpen(false)
                // Refresh scenarios
                if (organizationId && budgetId) {
                    fetchScenarios(organizationId, budgetId)
                }
            } else {
                console.error("Failed to create scenario")
            }
        } catch (error) {
            console.error("Error creating scenario:", error)
        }
    }

    const handleEditScenario = async (data: any) => {
        if (!editingScenario) return

        try {
            const response = await fetch(`${APP_BASE_API_URL}/accounting/budgets/scenarios/${editingScenario.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                setEditingScenario(null)
                // Refresh scenarios
                if (organizationId && budgetId) {
                    fetchScenarios(organizationId, budgetId)
                }
            } else {
                console.error("Failed to update scenario")
            }
        } catch (error) {
            console.error("Error updating scenario:", error)
        }
    }

    const handleDeleteScenario = async () => {
        if (!scenarioToDelete) return

        try {
            const response = await fetch(`${APP_BASE_API_URL}/accounting/budgets/scenarios/${scenarioToDelete.id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                setScenarioToDelete(null)
                setDeleteDialogOpen(false)
                // Refresh scenarios
                if (organizationId && budgetId) {
                    fetchScenarios(organizationId, budgetId)
                }
            } else {
                console.error("Failed to delete scenario")
            }
        } catch (error) {
            console.error("Error deleting scenario:", error)
        }
    }

    if (!budgetId || !organizationId) {
        return (
            <div className="max-w-4xl mx-auto py-4">
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-4">Budget ID or OrgId Required</h2>
                        <p className="text-muted-foreground mb-6">
                            Please ensure you're accessing this page with a valid budget ID.
                        </p>
                        <Button variant="outline" asChild>
                            <a href={`/budget?organizationId=${organizationId}`}>
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Return to Budget Dashboard
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl py-4 mx-auto">
            <BudgetScenariosContent
                organizationId={organizationId}
                budgetId={budgetId}
                isLoading={isLoading}
                scenarios={scenarios}
                budget={budget}
                onCreateScenario={handleCreateScenario}
                onEditScenario={handleEditScenario}
                onDeleteScenario={handleDeleteScenario}
            />
        </div>
    )
}
