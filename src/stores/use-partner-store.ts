import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface Partner {
    id: string
    name: string
    businessType: string
    city?: string
    description?: string
    logo?: string
    isConnected?: boolean
    relationshipId?: string
    permissions?: {
        VIEW_PRODUCTS?: boolean
        VIEW_PRICES?: boolean
        VIEW_INVENTORY?: boolean
        PLACE_ORDERS?: boolean
    }
}

interface PartnerStore {
    selectedPartners: string[]
    searchQuery: string
    filters: {
        businessType: string
        city: string
        status: string
    }
    viewMode: "table" | "map"

    // Actions
    setSelectedPartners: (partners: string[]) => void
    togglePartnerSelection: (partnerId: string) => void
    clearSelection: () => void
    setSearchQuery: (query: string) => void
    setFilters: (filters: Partial<PartnerStore["filters"]>) => void
    setViewMode: (mode: "table" | "map") => void
}

export const usePartnerStore = create<PartnerStore>()(
    devtools(
        (set, get) => ({
            selectedPartners: [],
            searchQuery: "",
            filters: {
                businessType: "all",
                city: "all",
                status: "all",
            },
            viewMode: "table",

            setSelectedPartners: (partners) => set({ selectedPartners: partners }),

            togglePartnerSelection: (partnerId) =>
                set((state) => ({
                    selectedPartners: state.selectedPartners.includes(partnerId)
                        ? state.selectedPartners.filter((id) => id !== partnerId)
                        : [...state.selectedPartners, partnerId],
                })),

            clearSelection: () => set({ selectedPartners: [] }),

            setSearchQuery: (query) => set({ searchQuery: query }),

            setFilters: (newFilters) =>
                set((state) => ({
                    filters: { ...state.filters, ...newFilters },
                })),

            setViewMode: (mode) => set({ viewMode: mode }),
        }),
        { name: "partner-store" },
    ),
)
