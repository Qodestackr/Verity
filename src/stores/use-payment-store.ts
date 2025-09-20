import { create } from "zustand";

type PaymentMethod = "M-Pesa" | "Cash" | "Card" | "Split Payment" | null;

interface PaymentState {
  paymentMethod: PaymentMethod;
  isProcessing: boolean;

  setPaymentMethod: (method: PaymentMethod) => void;
  startProcessing: () => void;
  stopProcessing: () => void;
  resetPayment: () => void;

  // This would integrate with Saleor or your payment gateway
  processPayment: (amount: number, customerPhone?: string) => Promise<boolean>;
}

export const usePaymentStore = create<PaymentState>()((set, get) => ({
  paymentMethod: null,
  isProcessing: false,

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  startProcessing: () => set({ isProcessing: true }),

  stopProcessing: () => set({ isProcessing: false }),

  resetPayment: () =>
    set({
      paymentMethod: null,
      isProcessing: false,
    }),

  processPayment: async (amount, customerPhone) => {
    const method = get().paymentMethod;

    set({ isProcessing: true });

    try {
      // Different payment processing logic based on method
      if (method === "M-Pesa") {
        if (!customerPhone) {
          set({ isProcessing: false });
          return false;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
        return true;
      } else if (method === "Card") {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return true;
      } else if (method === "Split Payment") {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        return true;
      } else {
        // Cash or other methods
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return true;
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      return false;
    } finally {
      set({ isProcessing: false });
    }
  },
}));
