import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { CreateExpenseData } from "@/types/accounting"
import { toast } from "sonner"

export function useExpenses(params: {
    organizationId: string
    categoryId?: string
    vendorId?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
}) {
    return useQuery({
        queryKey: ["expenses", params],
        queryFn: () => apiClient.getExpenses(params),
        enabled: !!params.organizationId,
    })
}

export function useCreateExpense() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateExpenseData) => apiClient.createExpense(data),
        onSuccess: (newExpense) => {
            // Invalidate and refetch expenses
            queryClient.invalidateQueries({ queryKey: ["expenses"] })
            queryClient.invalidateQueries({ queryKey: ["expense-reports"] })
            queryClient.invalidateQueries({ queryKey: ["profit-loss-report"] })

            toast.success("Expense created successfully!")
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create expense")
        },
    })
}

export function useUpdateExpense() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateExpenseData> }) => apiClient.updateExpense(id, data),
        onSuccess: (updatedExpense) => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] })
            queryClient.invalidateQueries({ queryKey: ["expense-reports"] })
            queryClient.invalidateQueries({ queryKey: ["profit-loss-report"] })

            toast.success("Expense updated successfully!")
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update expense")
        },
    })
}

export function useDeleteExpense() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => apiClient.deleteExpense(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] })
            queryClient.invalidateQueries({ queryKey: ["expense-reports"] })
            queryClient.invalidateQueries({ queryKey: ["profit-loss-report"] })

            toast.success("Expense deleted successfully!")
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete expense")
        },
    })
}

export function useExpenseCategories(organizationId: string) {
    return useQuery({
        queryKey: ["expense-categories", organizationId],
        queryFn: () => apiClient.getExpenseCategories(organizationId),
        enabled: !!organizationId,
    })
}

export function useCreateExpenseCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: { organizationId: string; name: string; description?: string }) =>
            apiClient.createExpenseCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expense-categories"] })
            toast.success("Category created successfully!")
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create category")
        },
    })
}
