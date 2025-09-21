
import { APP_BASE_API_URL } from "@/config/urls";

// 🔥 Trigger reindex IMMEDIATELY when webhook is received
export const triggerMeiliSync = async () => {
  try {
    await fetch(`${APP_BASE_API_URL}/product-sync/search`, {
      method: "GET",
    });
    console.log("🚀 Triggered MeiliSearch sync");
  } catch (err) {
    console.error("❌ Failed to trigger MeiliSearch sync", err);
  }
};
