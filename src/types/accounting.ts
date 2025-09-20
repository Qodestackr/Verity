export interface Expense {
    id: string
    organizationId: string
    categoryId: string
    vendorId?: string
    amount: number
    description: string
    receiptUrl?: string
    paymentMethod: "CASH" | "CREDIT" | "MPESA" | "OTHER_MOBILE_MONEY" | "CARD" | "BANK"
    paymentStatus: "PENDING" | "PROCESSING" | "PAID" | "SUCCEEDED" | "FAILED" | "REFUNDED"
    expenseDate: string
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED"
    approvedById?: string
    approvedAt?: string
    reimbursable: boolean
    reimbursedTo?: string
    taxDeductible: boolean
    taxAmount?: number
    recurringExpense: boolean
    createdAt: string
    updatedAt: string
    category: ExpenseCategory
    vendor?: Vendor
}

export interface ExpenseCategory {
    id: string
    organizationId: string
    name: string
    description?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface Vendor {
    id: string
    organizationId: string
    name: string
    contactPerson?: string
    email?: string
    phone?: string
    address?: string
    taxId?: string
    isActive: boolean
    notes?: string
    createdAt: string
    updatedAt: string
}

export interface CreateExpenseData {
    organizationId: string
    categoryId: string
    vendorId?: string
    amount: number
    description: string
    receiptUrl?: string
    paymentMethod: "CASH" | "CREDIT" | "MPESA" | "OTHER_MOBILE_MONEY" | "CARD" | "BANK"
    paymentStatus?: "PENDING" | "PROCESSING" | "PAID" | "SUCCEEDED" | "FAILED" | "REFUNDED"
    expenseDate: string
    taxDeductible?: boolean
    taxAmount?: number
    notes?: string
}

export interface ProfitLossReport {
    summary: {
        totalRevenue: number
        totalExpenses: number
        totalProfit: number
        overallMargin: number
        period: string
        year: number
        month?: number
    }
    profitLossByPeriod: Array<{
        period: string
        revenue: number
        expenses: number
        profit: number
        margin: number
    }>
}

export interface ExpenseReport {
    summary: {
        totalExpenses: number
        totalCount: number
        period: string
        startDate: string
        endDate: string
    }
    expensesByPeriod: Array<{
        period: string
        amount: number
        count: number
    }>
    expensesByCategory: Array<{
        categoryId: string
        categoryName: string
        amount: number
    }>
}
