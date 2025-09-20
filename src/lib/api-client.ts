const API_BASE = "/api/accounting"

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
    ) {
        super(message)
        this.name = "ApiError"
    }
}

import { Expense, CreateExpenseData, ExpenseCategory, ProfitLossReport, ExpenseReport } from "@/types/accounting"

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new ApiError(response.status, error.error || "Request failed")
    }

    return response.json()
}

export const apiClient = {
    // Expenses
    getExpenses: (params: {
        organizationId: string
        categoryId?: string
        vendorId?: string
        startDate?: string
        endDate?: string
        page?: number
        limit?: number
    }) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, value.toString())
            }
        })
        return apiRequest<{
            expenses: Expense[]
            pagination: {
                total: number
                pages: number
                page: number
                limit: number
            }
        }>(`/expenses?${searchParams}`)
    },

    createExpense: (data: CreateExpenseData) =>
        apiRequest<Expense>("/expenses", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    updateExpense: (id: string, data: Partial<CreateExpenseData>) =>
        apiRequest<Expense>(`/expenses/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    deleteExpense: (id: string) =>
        apiRequest<{ success: boolean }>(`/expenses/${id}`, {
            method: "DELETE",
        }),

    // Expense Categories
    getExpenseCategories: (organizationId: string) =>
        apiRequest<ExpenseCategory[]>(`/expense-categories?organizationId=${organizationId}`),

    createExpenseCategory: (data: { organizationId: string; name: string; description?: string }) =>
        apiRequest<ExpenseCategory>("/expense-categories", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // Reports
    getProfitLossReport: (params: {
        organizationId: string
        period?: "monthly" | "quarterly" | "yearly"
        year?: number
        month?: number
    }) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, value.toString())
            }
        })
        return apiRequest<ProfitLossReport>(`/reports/profit-loss?${searchParams}`)
    },

    getExpenseReport: (params: {
        organizationId: string
        period?: "daily" | "weekly" | "monthly" | "yearly"
        startDate?: string
        endDate?: string
    }) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, value.toString())
            }
        })
        return apiRequest<ExpenseReport>(`/reports/expenses?${searchParams}`)
    },
}
