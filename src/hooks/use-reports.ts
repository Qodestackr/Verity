
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { ProfitLossReport } from "@/types/accounting"

export function useProfitLossReport({
    organizationId,
    period = "monthly",
    year,
    month
}: {
    organizationId: string
    period?: "monthly" | "quarterly" | "yearly"
    year?: number
    month?: number
}) {
    const params = { organizationId, period, year, month };
    return useQuery({
        queryKey: ["profit-loss-report", params],
        queryFn: async (): Promise<ProfitLossReport> => {
            const result = await apiClient.getProfitLossReport(params);
            return result;
        },
        enabled: !!organizationId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

}

export function useExpenseReport(params: {
    organizationId: string
    period?: "daily" | "weekly" | "monthly" | "yearly"
    startDate?: string
    endDate?: string
}) {
    return useQuery({
        queryKey: ["expense-reports", params],
        queryFn: () => apiClient.getExpenseReport(params),
        enabled: !!params.organizationId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}
