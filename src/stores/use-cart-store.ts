import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  variantId: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  quantity: number;
  barcode?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "quantity">) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getVatAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  checkout: (email: string, isPickup: boolean) => Promise<any>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.id === product.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...product,
                quantity: 1,
              },
            ],
          };
        }),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== id),
            };
          }

          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getVatAmount: () => {
        return Math.round(get().getSubtotal() * 0 /*0.16*/);
      },

      getTotal: () => {
        return get().getSubtotal() + get().getVatAmount();
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      // Add the checkout function
      checkout: async (email, isPickup) => {
        const cartItems = get().items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        }));
      },
    }),

    {
      name: "pos-cart-storage",
      // Only persist the items array, not the methods
      partialize: (state) => ({ items: state.items }),
    }
  )
);
