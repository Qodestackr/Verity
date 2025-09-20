import { APP_BASE_API_URL } from "@/config/urls";
import { LoyaltyCustomer, NewCustomerPayload } from "@/types/loyalty";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddLoyaltyCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customerData: NewCustomerPayload) => {
      const respose = await fetch(`${APP_BASE_API_URL}/loyalty/customer`, {
        method: "POST",
        body: JSON.stringify(customerData),
      });
      return respose;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltyCustomers"] });
    },
  });
}

export function useLoyaltyCustomer(phone?: string) {
  return useQuery<LoyaltyCustomer>({
    queryKey: ["loyalty", phone],
    queryFn: async () => {
      const res = await fetch(`${APP_BASE_API_URL}/loyalty/customer?phone=${phone}`);
      if (!res.ok) throw new Error("Customer not found");
      return res.json();
    },
    enabled: !!phone,
  });
}

export function useRedeemPoints() {
  return useMutation({
    mutationFn: async (data: {
      customerId: string;
      points: number;
      description: string;
    }) => {
      const res = await fetch(`${APP_BASE_API_URL}/loyalty/points`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.json();
    },
  });
}
