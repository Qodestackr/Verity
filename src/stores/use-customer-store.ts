import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  lastVisit?: string;
  totalSpent?: number;
  favoriteProducts?: string[];
}

interface CustomerState {
  selectedCustomer: Customer | null;
  recentCustomers: Customer[];
  customerPhone: string;
  customerName: string;

  setCustomerPhone: (phone: string) => void;
  setCustomerName: (name: string) => void;
  selectCustomer: (customer: Customer) => void;
  clearCustomer: () => void;
  addRecentCustomer: (customer: Customer) => void;
  isValidPhoneForMpesa: () => boolean;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      selectedCustomer: null,
      recentCustomers: [],
      customerPhone: "",
      customerName: "",

      setCustomerPhone: (phone) => set({ customerPhone: phone }),

      setCustomerName: (name) => set({ customerName: name }),

      selectCustomer: (customer) =>
        set({
          selectedCustomer: customer,
          customerPhone: customer.phone,
          customerName: customer.name,
        }),

      clearCustomer: () =>
        set({
          selectedCustomer: null,
          customerPhone: "",
          customerName: "",
        }),

      addRecentCustomer: (customer) =>
        set((state) => {
          //No dups
          if (state.recentCustomers.some((c) => c.id === customer.id)) {
            return state;
          }

          // Keep only the 10 most recent customers, but allow search.
          return {
            recentCustomers: [customer, ...state.recentCustomers].slice(0, 10),
          };
        }),

      isValidPhoneForMpesa: () => {
        const phone = get().customerPhone;
        return /^(07|01)\d{8}$/.test(phone);
      },
    }),
    {
      name: "pos-customer-storage",
      partialize: (state) => ({
        recentCustomers: state.recentCustomers,
      }),
    }
  )
);
