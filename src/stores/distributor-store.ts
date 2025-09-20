import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useCurrency } from "@/hooks/useCurrency";
import { APP_BASE_API_URL } from "@/config/urls";

/**
 * Interface for distributor information
 */
export interface DistributorInfo {
  id: string;
  name: string;
  logo: string | null;
  location: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  businessType?: string;
  leadTime: string;
  minimumOrder: string;
  paymentTerms: string;
  categories: string[];
  popularBrands: string[];
}

/**
 * Interface for the distributor store state
 */
interface DistributorState {
  // Distributor data
  currentDistributor: DistributorInfo | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentDistributor: (distributor: DistributorInfo) => void;
  fetchDistributorInfo: (
    partnerId: string,
    authHeader: string,
    cookieHeader: string
  ) => Promise<void>;
  clearDistributor: () => void;
}

/**
 * Zustand store for managing distributor information
 */
export const useDistributorStore = create<DistributorState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentDistributor: null,
        isLoading: false,
        error: null,

        // Actions
        setCurrentDistributor: (distributor) =>
          set({ currentDistributor: distributor }),

        /**
         * Fetches distributor information from the API
         * @param partnerId - The ID of the partner/distributor
         * @param authHeader - The authorization header
         * @param cookieHeader - The cookie header
         */
        fetchDistributorInfo: async (partnerId, authHeader, cookieHeader) => {
          set({ isLoading: true, error: null });

          try {
            // Fetch organization data from the API
            const response = await fetch(
              `${APP_BASE_API_URL}/organizations/${partnerId}`,
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
                `Failed to fetch organization: ${response.statusText}`
              );
            }

            const organizationData = await response.json();

            console.log("Cliient distributr", organizationData);

            // Map the organization data to distributor info
            const distributorInfo: DistributorInfo = {
              id: organizationData.id,
              name: organizationData.name,
              logo: organizationData.logo,
              location: organizationData.location,
              contactPerson: organizationData.contactPerson,
              phone: organizationData.phone,
              email: organizationData.email,
              businessType: organizationData.businessType,
              // Default values for fields not directly from the API
              leadTime: getLeadTimeByBusinessType(
                organizationData.businessType || "DISTRIBUTOR"
              ),
              minimumOrder: "KES 10,000", // Default value
              paymentTerms: "10 days", // Default value
              categories: ["Beer", "Spirits", "Wine"], // Default categories
              popularBrands: [], // Empty by default
            };

            set({ currentDistributor: distributorInfo, isLoading: false });
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },

        /**
         * Clears the current distributor
         */
        clearDistributor: () => set({ currentDistributor: null }),
      }),
      {
        name: "distributor-store",
        partialize: (state) => ({
          currentDistributor: state.currentDistributor,
        }),
      }
    )
  )
);

/**
 * Helper function to get lead time based on business type
 * @param businessType - The type of business
 * @returns Estimated lead time
 */
function getLeadTimeByBusinessType(businessType: string): string {
  switch (businessType) {
    case "DISTRIBUTOR":
      return "1-6 hrs";
    case "WHOLESALER":
      return "6hrs-1 day";
    case "RETAILER":
      return "1-2 days";
    default:
      return "24-48 hours";
  }
}
