import type React from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";
import { APP_BASE_API_URL } from "@/config/urls";

// Define types for form values
type BusinessType =
  | "brand_owner"
  | "distributor"
  | "wholesaler"
  | "retailer"
  | "other"
  | "";

type ImportMethod = "manual" | "csv" | "api";
type PaymentMethod = "mpesa" | "card" | "bank" | "";
type SubscriptionPlan = "basic" | "standard" | "premium" | "";

interface OnboardingState {
  // Step management
  currentStep: number;
  progress: number;
  showConfetti: boolean;
  isPending: boolean;

  // Form state
  businessType: BusinessType;
  businessName: string;
  businessDescription: string;
  logo: File | null;
  logoPreview: string | null;
  location: string;
  address: string;
  warehouseName: string;
  importMethod: ImportMethod;
  paymentMethod: PaymentMethod;
  subscriptionPlan: SubscriptionPlan;
  teamEmails: string;
  enableSMS: boolean;
  phoneNumber: string;

  // Actions
  setCurrentStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setBusinessType: (type: BusinessType) => void;
  setBusinessName: (name: string) => void;
  setBusinessDescription: (description: string) => void;
  setLogo: (file: File | null) => void;
  setLogoPreview: (preview: string | null) => void;
  setLocation: (location: string) => void;
  setAddress: (address: string) => void;
  setWarehouseName: (name: string) => void;
  setImportMethod: (method: ImportMethod) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;
  setTeamEmails: (emails: string) => void;
  setEnableSMS: (enable: boolean) => void;
  setPhoneNumber: (number: string) => void;
  setShowConfetti: (show: boolean) => void;
  setIsPending: (isPending: boolean) => void;
  resetState: () => void;

  // Form handlers
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  completeOnboarding: (userId: string) => Promise<void>;
  skipOnboarding: (userId: string) => Promise<void>;
}

// Initial state
const initialState = {
  currentStep: 0,
  progress: 0,
  showConfetti: false,
  isPending: false,

  businessType: "retailer" as BusinessType,
  businessName: "",
  businessDescription: "",
  logo: null,
  logoPreview: null,
  location: "",
  address: "",
  warehouseName: "Main Warehouse",
  importMethod: "api" as ImportMethod,
  paymentMethod: "" as PaymentMethod,
  subscriptionPlan: "" as SubscriptionPlan,
  teamEmails: "",
  enableSMS: true,
  phoneNumber: "",
};

// Create the store
const useOnboardingStore = create<OnboardingState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Step management
      setCurrentStep: (step) => {
        set({ currentStep: step, progress: (step / 7) * 100 });
        window.scrollTo(0, 0);
      },

      goToNextStep: () => {
        const { currentStep } = get();
        if (currentStep < 7) {
          set({
            currentStep: currentStep + 1,
            progress: ((currentStep + 1) / 7) * 100,
          });
          window.scrollTo(0, 0);
        }
      },

      goToPreviousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({
            currentStep: currentStep - 1,
            progress: ((currentStep - 1) / 7) * 100,
          });
          window.scrollTo(0, 0);
        }
      },

      // Form field setters
      setBusinessType: (type) => set({ businessType: type }),
      setBusinessName: (name) => set({ businessName: name }),
      setBusinessDescription: (description) =>
        set({ businessDescription: description }),
      setLogo: (file) => set({ logo: file }),
      setLogoPreview: (preview) => set({ logoPreview: preview }),
      setLocation: (location) => set({ location }),
      setAddress: (address) => set({ address }),
      setWarehouseName: (name) => set({ warehouseName: name }),
      setImportMethod: (method) => set({ importMethod: method }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setSubscriptionPlan: (plan) => set({ subscriptionPlan: plan }),
      setTeamEmails: (emails) => set({ teamEmails: emails }),
      setEnableSMS: (enable) => set({ enableSMS: enable }),
      setPhoneNumber: (number) => set({ phoneNumber: number }),
      setShowConfetti: (show) => set({ showConfetti: show }),
      setIsPending: (isPending) => set({ isPending }),
      resetState: () => set(initialState),

      // Form handlers
      handleLogoChange: (e) => {
        const file = e.target.files?.[0];
        if (file) {
          set({ logo: file });
          const reader = new FileReader();
          reader.onloadend = () => {
            set({ logoPreview: reader.result as string });
          };
          reader.readAsDataURL(file);
        }
      },

      completeOnboarding: async (userId) => {
        if (!userId) {
          console.error("User ID not found");
          return;
        }

        const {
          businessName,
          businessDescription,
          location,
          address,
          phoneNumber,
          enableSMS,
        } = get();

        if (!businessName) {
          toast.error("Business name is required");
          return;
        }

        set({ isPending: true });

        try {
          // Submit onboarding data to API
          const response = await fetch(`${APP_BASE_API_URL}/onboarding`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              businessName,
              businessDescription,
              location,
              address,
              phoneNumber,
              enableSMS,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to complete onboarding");
          }

          const data = await response.json();
          console.log("Onboarding completed:", data);

          // Show success message
          toast.success("Setup completed successfully!", {
            description: "Your business is now ready to use Alcora.",
          });

          // Show confetti
          set({ showConfetti: true, isPending: false });

          // Redirect will happen in the component after a delay
        } catch (error) {
          console.error("Error completing onboarding:", error);
          toast.error("Failed to complete setup", {
            description: "Please try again or contact support.",
          });
          set({ isPending: false });
        }
      },

      skipOnboarding: async (userId) => {
        if (!userId) {
          console.error("User ID not found");
          return;
        }

        try {
          // Call API to mark onboarding as skipped
          await fetch(`${APP_BASE_API_URL}/onboarding/skip`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          });

          console.log("Onboarding skipped for user:", userId);
        } catch (error) {
          console.error("Error skipping onboarding:", error);
        }
      },
    }),
    { name: "onboarding-store" }
  )
);

export default useOnboardingStore;
