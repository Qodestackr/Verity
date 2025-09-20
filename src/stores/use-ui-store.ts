import { create } from "zustand";

export type POSStep = "selection" | "checkout" | "payment";

interface UIState {
  currentStep: POSStep;
  searchQuery: string;
  searchResults: any[];
  recentSearches: string[];
  selectedCategory: string;
  showPaymentDialog: boolean;
  showCustomerSheet: boolean;
  showCartSummary: boolean;
  showReceiptDialog: boolean;
  isForPickup: boolean;

  setCurrentStep: (step: POSStep) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: any[]) => void;
  addRecentSearch: (search: string) => void;
  setSelectedCategory: (category: string) => void;
  togglePaymentDialog: (open?: boolean) => void;
  toggleCustomerSheet: (open?: boolean) => void;
  toggleCartSummary: (open?: boolean) => void;
  toggleReceiptDialog: (open?: boolean) => void;
  setIsForPickup: (isForPickup: boolean) => void;
  resetUI: () => void;
}

// **Merging `useUIStore` and `usePaymentStore`** - Since payment UI state is closely tied to the payment process, these could potentially be combined
export const useUIStore = create<UIState>()((set, get) => ({
  currentStep: "selection",
  searchQuery: "",
  searchResults: [],
  recentSearches: [],
  selectedCategory: "All",
  showPaymentDialog: false,
  showCustomerSheet: false,
  showCartSummary: false,
  showReceiptDialog: false,
  isForPickup: false,

  setCurrentStep: (step) => set({ currentStep: step }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSearchResults: (results) => set({ searchResults: results }),

  addRecentSearch: (search) =>
    set((state) => {
      if (!state.recentSearches.includes(search)) {
        return {
          recentSearches: [search, ...state.recentSearches].slice(0, 5),
        };
      }
      return state;
    }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  togglePaymentDialog: (open) =>
    set((state) => ({
      showPaymentDialog: open !== undefined ? open : !state.showPaymentDialog,
    })),

  toggleCustomerSheet: (open) =>
    set((state) => ({
      showCustomerSheet: open !== undefined ? open : !state.showCustomerSheet,
    })),

  toggleCartSummary: (open) =>
    set((state) => ({
      showCartSummary: open !== undefined ? open : !state.showCartSummary,
    })),

  toggleReceiptDialog: (open) =>
    set((state) => ({
      showReceiptDialog: open !== undefined ? open : !state.showReceiptDialog,
    })),

  setIsForPickup: (isForPickup) => set({ isForPickup }),

  resetUI: () =>
    set({
      currentStep: "selection",
      searchQuery: "",
      searchResults: [],
      showPaymentDialog: false,
      showReceiptDialog: false,
      isForPickup: false,
    }),
}));
