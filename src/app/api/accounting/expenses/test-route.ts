import { useCurrency } from "@/hooks/useCurrency";
import { createPaginatedResponse, withApiWrapper, withValidation } from "@/lib/api-wrapper"
import prisma from "@/lib/prisma"
import { dbTrace, logger } from "@/utils/telemetry"
import * as z from "zod"

// Validation schemas
const createExpenseSchema = z.object({
    organizationId: z.string(),
    categoryId: z.string(),
    vendorId: z.string().optional(),
    amount: z.number().positive(),
    description: z.string().min(1),
    paymentMethod: z.enum(["CASH", "CREDIT", "MPESA", "CARD", "BANK"]),
    expenseDate: z.string().datetime(),
    taxDeductible: z.boolean().default(false),
    taxAmount: z.number().optional(),
    notes: z.string().optional(),
})

const getExpensesSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
})

// GET /api/accounting/expenses - Fully instrumented
export const GET = withApiWrapper(
    withValidation(getExpensesSchema, async (data, { context, requestId }) => {
        const { page, limit, search, categoryId, startDate, endDate } = data
        const offset = (page - 1) * limit

        logger.info("Fetching expenses", {
            "query.page": page,
            "query.limit": limit,
            "query.search": search || "none",
            "query.category_id": categoryId || "none",
            "query.date_range": startDate && endDate ? `${startDate} to ${endDate}` : "none",
            "org.id": context.organizationId,
        })

        // Build where clause with logging
        const where: any = {
            organizationId: context.organizationId,
        }

        if (search) {
            where.OR = [
                { description: { contains: search, mode: "insensitive" } },
                { vendor: { name: { contains: search, mode: "insensitive" } } },
            ]
            logger.debug("Added search filter", { "filter.search": search })
        }

        if (categoryId) {
            where.categoryId = categoryId
            logger.debug("Added category filter", { "filter.category_id": categoryId })
        }

        if (startDate || endDate) {
            where.expenseDate = {}
            if (startDate) {
                where.expenseDate.gte = new Date(startDate)
                logger.debug("Added start date filter", { "filter.start_date": startDate })
            }
            if (endDate) {
                where.expenseDate.lte = new Date(endDate)
                logger.debug("Added end date filter", { "filter.end_date": endDate })
            }
        }

        // Get total count and expenses with tracing
        const [total, expenses] = await Promise.all([
            dbTrace.query("countExpenses", `COUNT expenses for org ${context.organizationId}`, () =>
                prisma.expense.count({ where }),
            ),
            dbTrace.query(
                "findExpenses",
                `SELECT expenses for org ${context.organizationId} (page ${page}, limit ${limit})`,
                () =>
                    prisma.expense.findMany({
                        where,
                        include: {
                            category: true,
                            vendor: true,
                        },
                        orderBy: { expenseDate: "desc" },
                        skip: offset,
                        take: limit,
                    }),
            ),
        ])

        logger.info("Expenses fetched successfully", {
            "result.total": total,
            "result.returned": expenses.length,
            "result.page": page,
            "result.has_more": page * limit < total,
        })

        return createPaginatedResponse(expenses, total, page, limit, requestId)
    }),
    {
        requireOrganization: true,
        requiredPermissions: ["view_expenses"],
        cacheResponse: true,
        cacheTTL: 300,
        rateLimit: {
            requests: 100,
            windowMs: 60000,
        },
    },
)

// POST /api/accounting/expenses - Fully instrumented
export const POST = withApiWrapper(
    withValidation(createExpenseSchema, async (data, { context, requestId }) => {
        logger.info("Creating new expense", {
            "expense.amount": data.amount,
            "expense.category_id": data.categoryId,
            "expense.vendor_id": data.vendorId || "none",
            "expense.payment_method": data.paymentMethod,
            "org.id": context.organizationId,
        })

        const expense = await dbTrace.query(
            "createExpense",
            `INSERT expense for org ${context.organizationId}`,
            async () => {
                return await prisma.expense.create({
                    data: {
                        ...data,
                        organizationId: context.organizationId,
                    },
                    include: {
                        category: true,
                        vendor: true,
                    },
                })
            },
        )

        logger.info("Expense created successfully", {
            "expense.id": expense.id,
            "expense.amount": expense.amount,
            "expense.description": expense.description,
            "org.id": context.organizationId,
        })

        return new Response(JSON.stringify(expense), {
            status: 201,
            headers: {
                "Content-Type": "application/json",
                "x-request-id": requestId,
            },
        })
    }),
    {
        requireOrganization: true,
        requiredPermissions: ["create_expenses"],
        rateLimit: {
            requests: 50,
            windowMs: 60000,
        },
    },
)
