import { create } from "zustand";
import { toast } from "sonner";
import {
  createDraftOrder,
  addItemsToDraftOrder,
  removeItemFromDraftOrder,
  updateDraftOrder,
  completeDraftOrder,
  getDraftOrders,
  deleteDraftOrder,
} from "@/services/draft-order-service";

import {
  DraftOrderInput,
  DraftOrderItem,
  DraftOrderResult,
} from "@/types/order/draft-order";

interface DraftOrderState {
  activeDraftId: string | null;
  draftOrders: any[];
  isLoading: boolean;
  error: string | null;

  setActiveDraftId: (id: string | null) => void;
  createNewDraft: (input: DraftOrderInput) => Promise<string | null>;
  addItemsToDraft: (items: DraftOrderItem[]) => Promise<boolean>;
  removeItemFromDraft: (lineId: string) => Promise<boolean>;
  updateDraft: (input: Partial<DraftOrderInput>) => Promise<boolean>;
  completeDraft: () => Promise<{ success: boolean; orderId?: string }>;
  loadDraftOrders: () => Promise<void>;
  deleteDraft: (id: string) => Promise<boolean>;
}

export const useDraftOrderStore = create<DraftOrderState>((set, get) => ({
  activeDraftId: null,
  draftOrders: [],
  isLoading: false,
  error: null,

  setActiveDraftId: (id) => set({ activeDraftId: id }),

  loadDraftOrders: async () => {
    set({ isLoading: true, error: null });

    try {
      const result = await getDraftOrders(50);

      if (result.success) {
        set({ draftOrders: result.draftOrders });

        // Set 1st draft as active if none is selected
        const { activeDraftId } = get();
        if (!activeDraftId && result.draftOrders.length > 0) {
          set({ activeDraftId: result.draftOrders[0].id });
        }
      } else {
        set({ error: "Failed to load draft orders" });
        toast.error("Failed to load draft orders");
      }
    } catch (err) {
      set({ error: "An error occurred while loading draft orders" });
      toast.error("An error occurred while loading draft orders");
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  createNewDraft: async (input) => {
    set({ isLoading: true, error: null });

    try {
      const result = await createDraftOrder(input);

      if (result.created) {
        toast.success("Draft order created");

        // Add the new draft to the list and set it as active
        await get().loadDraftOrders();
        set({ activeDraftId: result.id });

        return result.id;
      } else {
        set({ error: "Failed to create draft order" });
        toast.error("Failed to create draft order");
        return null;
      }
    } catch (err) {
      set({ error: "An error occurred while creating draft order" });
      toast.error("An error occurred while creating draft order");
      console.error(err);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  addItemsToDraft: async (items) => {
    const { activeDraftId } = get();

    if (!activeDraftId) {
      toast.error("No active draft order");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const result = await addItemsToDraftOrder(activeDraftId, items);

      if (result.success) {
        toast.success("Items added to draft");
        await get().loadDraftOrders(); // Refresh draft orders
        return true;
      } else {
        set({ error: "Failed to add items to draft" });
        toast.error("Failed to add items to draft");
        return false;
      }
    } catch (err) {
      set({ error: "An error occurred while adding items" });
      toast.error("An error occurred while adding items");
      console.error(err);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  removeItemFromDraft: async (lineId) => {
    const { activeDraftId } = get();

    if (!activeDraftId) {
      toast.error("No active draft order");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const result = await removeItemFromDraftOrder(activeDraftId, lineId);

      if (result.success) {
        toast.success("Item removed from draft");
        await get().loadDraftOrders(); // Refresh draft orders
        return true;
      } else {
        set({ error: "Failed to remove item from draft" });
        toast.error("Failed to remove item from draft");
        return false;
      }
    } catch (err) {
      set({ error: "An error occurred while removing item" });
      toast.error("An error occurred while removing item");
      console.error(err);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateDraft: async (input) => {
    const { activeDraftId } = get();

    if (!activeDraftId) {
      toast.error("No active draft order");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const result = await updateDraftOrder(activeDraftId, input);

      if (result.success) {
        toast.success("Draft order updated");
        await get().loadDraftOrders();
        return true;
      } else {
        set({ error: "Failed to update draft order" });
        toast.error("Failed to update draft order");
        return false;
      }
    } catch (err) {
      set({ error: "An error occurred while updating draft" });
      toast.error("An error occurred while updating draft");
      console.error(err);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  completeDraft: async () => {
    const { activeDraftId } = get();

    if (!activeDraftId) {
      toast.error("No active draft order");
      return { success: false };
    }

    set({ isLoading: true, error: null });

    try {
      const result = await completeDraftOrder(activeDraftId);

      if (result.success) {
        toast.success("Draft order completed");
        await get().loadDraftOrders(); // Refresh draft orders
        return { success: true, orderId: result.orderId };
      } else {
        set({ error: "Failed to complete draft order" });
        toast.error("Failed to complete draft order");
        return { success: false };
      }
    } catch (err) {
      set({ error: "An error occurred while completing draft" });
      toast.error("An error occurred while completing draft");
      console.error(err);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDraft: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const result = await deleteDraftOrder(id);

      if (result.success) {
        toast.success("Draft order deleted");

        // If the deleted draft was active, clear the active draft
        const { activeDraftId } = get();
        if (activeDraftId === id) {
          set({ activeDraftId: null });
        }

        await get().loadDraftOrders();
        return true;
      } else {
        set({ error: "Failed to delete draft order" });
        toast.error("Failed to delete draft order");
        return false;
      }
    } catch (err) {
      set({ error: "An error occurred while deleting draft" });
      toast.error("An error occurred while deleting draft");
      console.error(err);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
