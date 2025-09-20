import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Transaction {
  id: string;
  amount: number;
  paymentMethod: string;
  customerPhone?: string;
  isPickup?: boolean;
  timestamp: string;
  saleorOrderId: string | any;
}

interface TillState {
  isOpen: boolean;
  openingBalance: number;
  closingBalance: number;
  transactions: Transaction[];

  setOpeningBalance: (amount: number) => void;
  openTill: () => void;
  closeTill: () => void;
  addTransaction: (transaction: Transaction) => void;
  getTotalSales: () => number;
  getPickupOrders: () => Transaction[];
}

export const useTillStore = create<TillState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      openingBalance: 5000,
      closingBalance: 0,
      transactions: [],

      setOpeningBalance: (amount) => set({ openingBalance: amount }),

      openTill: () => set({ isOpen: true }),

      closeTill: () =>
        set((state) => ({
          isOpen: false,
          closingBalance:
            state.openingBalance +
            state.transactions.reduce((total, t) => total + t.amount, 0),
        })),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [...state.transactions, transaction],
        })),

      getTotalSales: () => {
        return get().transactions.reduce((total, t) => total + t.amount, 0);
      },

      getPickupOrders: () => {
        return get().transactions.filter((t) => t.isPickup);
      },
    }),
    {
      name: "pos-till-storage",
      partialize: (state) => ({
        openingBalance: state.openingBalance,
        transactions: state.transactions,
        closingBalance: state.closingBalance,
      }),
    }
  )
);
