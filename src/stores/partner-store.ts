import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useCurrency } from "@/hooks/useCurrency";
import { APP_BASE_API_URL } from "@/config/urls";

/**
 * Interface for a business relationship between organizations
 */
export interface Relationship {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerLogo: string | null;
  partnerBusinessType: string;
  partnerLocation: string | null;
  status: string;
  type: string;
  direction: string;
  createdAt: string;
  updatedAt: string;
  lastInteractionAt: string | null;
  notes: string;
  permissions: Permission[];
}

/**
 * Interface for a permission within a business relationship
 */
export interface Permission {
  id: string;
  relationshipId: string;
  permissionType: string;
  isGranted: boolean;
  scope: string;
  scopeIds: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for the partner store state
 */
interface PartnerState {
  // Relationships data
  relationships: Relationship[];
  isLoading: boolean;
  error: string | null;

  // Selected partner
  selectedPartnerId: string | null;
  selectedPartner: Relationship | null;

  // Actions
  setRelationships: (relationships: Relationship[]) => void;
  fetchRelationships: (
    organizationId: string,
    authHeader: string,
    cookieHeader: string
  ) => Promise<void>;
  selectPartner: (partnerId: string) => void;
  clearSelectedPartner: () => void;
  hasPermission: (permissionType: string) => boolean;
}

/**
 * Zustand store for managing partner relationships
 */
export const usePartnerStore = create<PartnerState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        relationships: [],
        isLoading: false,
        error: null,
        selectedPartnerId: null,
        selectedPartner: null,

        // Actions
        setRelationships: (relationships) => set({ relationships }),

        /**
         * Fetches relationships from the API
         * @param organizationId - The ID of the organization
         * @param authHeader - The authorization header
         * @param cookieHeader - The cookie header
         */
        fetchRelationships: async (
          organizationId,
          authHeader,
          cookieHeader
        ) => {
          set({ isLoading: true, error: null });

          try {
            const response = await fetch(
              `${APP_BASE_API_URL}/relationships?organizationId=${organizationId}&status=PENDING`,
              {
                headers: {
                  Authorization: authHeader,
                  Cookie: cookieHeader,
                },
                cache: "no-store",
              }
            );

            if (!response.ok) {
              throw new Error(
                `Failed to fetch relationships: ${response.statusText}`
              );
            }

            const data = await response.json();
            set({ relationships: data, isLoading: false });
            return data;
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },

        /**
         * Selects a partner by ID
         * @param partnerId - The ID of the partner to select
         */
        selectPartner: (partnerId) => {
          const { relationships } = get();
          const selectedPartner =
            relationships.find((r) => r.partnerId === partnerId) || null;
          set({ selectedPartnerId: partnerId, selectedPartner });
        },

        /**
         * Clears the selected partner
         */
        clearSelectedPartner: () =>
          set({ selectedPartnerId: null, selectedPartner: null }),

        /**
         * Checks if the selected partner has a specific permission
         * @param permissionType - The type of permission to check
         * @returns boolean indicating if the permission is granted
         */
        hasPermission: (permissionType) => {
          const { selectedPartner } = get();
          if (!selectedPartner) return false;

          return selectedPartner.permissions.some(
            (p) => p.permissionType === permissionType && p.isGranted
          );
        },
      }),
      {
        name: "partner-store",
        partialize: (state) => ({
          selectedPartnerId: state.selectedPartnerId,
        }),
      }
    )
  )
);
