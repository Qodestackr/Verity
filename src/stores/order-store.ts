import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/**
 * Interface for a product
 */
export interface Product {
  id: string;
  name: string;
  sku?: string;
  variantId: string;
  price: number;
  casePrice?: number;
  caseSize?: number;
  category?: string;
  supplier?: string;
  stock: number;
  minOrderQty?: number;
  leadTime?: string;
}

/**
 * Interface for an order row
 */
export interface OrderRow {
  id: string;
  product: Product | null;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
}

/**
 * Interface for order metadata
 */
export interface OrderMetadata {
  deliveryDate?: Date;
  specialInstructions?: string;
}

/**
 * Interface for the order store state
 */
interface OrderState {
  // Order data
  rows: OrderRow[];
  metadata: OrderMetadata;
  isSubmitting: boolean;
  error: string | null;

  // Search state
  searchQuery: string;
  searchResults: Product[];
  isSearching: boolean;
  searchError: string | null;

  // Actions
  setRows: (rows: OrderRow[]) => void;
  addRow: () => void;
  removeRow: (index: number) => void;
  updateProduct: (rowIndex: number, product: Product) => void;
  updateQuantity: (rowIndex: number, quantity: number) => void;
  updateMetadata: (metadata: Partial<OrderMetadata>) => void;
  clearOrder: () => void;

  // Search actions
  setSearchQuery: (query: string) => void;
  searchProducts: (
    query: string,
    channel: string,
    partnerId: string
  ) => Promise<void>;

  // Calculations
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;

  // Order submission
  submitOrder: (partnerId: string, channel: string) => Promise<any>;
}

/**
 * Zustand store for managing orders
 */
export const useOrderStore = create<OrderState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        rows: [],
        metadata: {},
        isSubmitting: false,
        error: null,
        searchQuery: "",
        searchResults: [],
        isSearching: false,
        searchError: null,

        // Actions
        setRows: (rows) => set({ rows }),

        /**
         * Adds a new empty row to the order
         */
        addRow: () => {
          const { rows } = get();
          set({
            rows: [
              ...rows,
              {
                id: `row-${Date.now()}`,
                product: null,
                quantity: 1,
                price: 0,
                total: 0,
              },
            ],
          });
        },

        /**
         * Removes a row from the order
         * @param index - The index of the row to remove
         */
        removeRow: (index) => {
          const { rows } = get();
          const newRows = [...rows];
          newRows.splice(index, 1);
          set({ rows: newRows });
        },

        /**
         * Updates the product in a row
         * @param rowIndex - The index of the row to update
         * @param product - The product to set
         */
        updateProduct: (rowIndex, product) => {
          const { rows } = get();
          const newRows = [...rows];
          newRows[rowIndex] = {
            ...newRows[rowIndex],
            product,
            price: product.price,
            total: product.price * newRows[rowIndex].quantity,
          };
          set({ rows: newRows });
        },

        /**
         * Updates the quantity in a row
         * @param rowIndex - The index of the row to update
         * @param quantity - The quantity to set
         */
        updateQuantity: (rowIndex, quantity) => {
          const { rows } = get();
          const newRows = [...rows];
          const row = newRows[rowIndex];

          if (row.product) {
            // Apply case pricing if applicable
            let price = row.product.price;
            if (
              row.product.caseSize &&
              row.product.casePrice &&
              quantity >= row.product.caseSize
            ) {
              // Calculate how many complete cases and remaining units
              const cases = Math.floor(quantity / row.product.caseSize);
              const remainingUnits = quantity % row.product.caseSize;

              // Calculate total price with case discount
              const caseTotal =
                (cases * row.product.caseSize * row.product.casePrice) /
                row.product.caseSize;
              const unitTotal = remainingUnits * row.product.price;

              // Calculate effective per-unit price
              price = (caseTotal + unitTotal) / quantity;
            }

            newRows[rowIndex] = {
              ...row,
              quantity,
              price,
              total: price * quantity,
            };
            set({ rows: newRows });
          }
        },

        /**
         * Updates the order metadata
         * @param metadata - The metadata to update
         */
        updateMetadata: (metadata) => {
          set({ metadata: { ...get().metadata, ...metadata } });
        },

        /**
         * Clears the current order
         */
        clearOrder: () => {
          set({
            rows: [
              {
                id: `row-${Date.now()}`,
                product: null,
                quantity: 1,
                price: 0,
                total: 0,
              },
            ],
            metadata: {},
          });
        },

        /**
         * Sets the search query
         * @param query - The search query
         */
        setSearchQuery: (query) => set({ searchQuery: query }),

        /**
         * Searches for products
         * @param query - The search query
         * @param channel - The channel to search in
         * @param partnerId - The partner ID to search for
         */
        searchProducts: async (query, channel, partnerId) => {
          set({ isSearching: true, searchError: null });

          try {
            // This would be replaced with an actual API call to search products
            // For now, we'll simulate a delay and return mock data
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Mock search results
            const mockProducts: Product[] = [
              {
                id: "1",
                name: "Tusker Lager",
                sku: "TSK-001",
                variantId: "var-001",
                price: 150,
                casePrice: 142.5,
                caseSize: 24,
                category: "Beer",
                supplier: "EABL",
                stock: 240,
                minOrderQty: 24,
                leadTime: "1-2 days",
              },
              {
                id: "2",
                name: "Guinness Stout",
                sku: "GNS-001",
                variantId: "var-002",
                price: 200,
                casePrice: 190,
                caseSize: 24,
                category: "Beer",
                supplier: "EABL",
                stock: 120,
                minOrderQty: 12,
                leadTime: "1-2 days",
              },
              {
                id: "3",
                name: "Johnnie Walker Black Label",
                sku: "JW-001",
                variantId: "var-003",
                price: 3500,
                casePrice: 3325,
                caseSize: 6,
                category: "Whisky",
                supplier: "EABL",
                stock: 36,
                minOrderQty: 1,
                leadTime: "1-2 days",
              },
            ].filter(
              (p) =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.sku?.toLowerCase().includes(query.toLowerCase()) ||
                p.category?.toLowerCase().includes(query.toLowerCase())
            );

            set({ searchResults: mockProducts, isSearching: false });
          } catch (error: any) {
            set({ searchError: error.message, isSearching: false });
          }
        },

        /**
         * Gets the total number of items in the order
         * @returns The total number of items
         */
        getTotalItems: () => {
          const { rows } = get();
          return rows
            .filter((row) => row.product)
            .reduce((sum, row) => sum + row.quantity, 0);
        },

        /**
         * Gets the subtotal of the order
         * @returns The subtotal
         */
        getSubtotal: () => {
          const { rows } = get();
          return rows
            .filter((row) => row.product)
            .reduce((sum, row) => sum + row.total, 0);
        },

        /**
         * Gets the tax amount for the order
         * @returns The tax amount
         */
        getTax: () => {
          return Math.round(get().getSubtotal() * 0.16); // 16% VAT
        },

        /**
         * Gets the total amount for the order
         * @returns The total amount
         */
        getTotal: () => {
          return get().getSubtotal() + get().getTax();
        },

        /**
         * Submits the order
         * @param partnerId - The partner ID to submit the order to
         * @param channel - The channel to submit the order in
         * @returns The result of the order submission
         */
        submitOrder: async (partnerId, channel) => {
          const { rows, metadata } = get();
          const filledRows = rows.filter((row) => row.product);

          if (filledRows.length === 0) {
            throw new Error("No items in order");
          }

          set({ isSubmitting: true, error: null });

          try {
            // Format order items for the service
            const orderItems = filledRows.map((row) => ({
              variantId: row.product!.variantId,
              quantity: row.quantity,
              name: row.product!.name,
              price: row.price,
            }));

            // This would be replaced with an actual API call to create the order
            // For now, we'll simulate a delay and return a mock result
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const result = {
              success: true,
              orderId: `PO-${Date.now().toString().slice(-6)}`,
            };

            set({ isSubmitting: false });
            return result;
          } catch (error: any) {
            set({ error: error.message, isSubmitting: false });
            throw error;
          }
        },
      }),
      {
        name: "order-store",
        partialize: (state) => ({
          // Only persist these fields
          rows: state.rows,
          metadata: state.metadata,
        }),
      }
    )
  )
);
