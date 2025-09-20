import { APP_BASE_API_URL } from "@/config/urls";
import { useMutation } from "@tanstack/react-query";

export function useCacheProduct() {
  return useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch(`${APP_BASE_API_URL}/product-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Failed to cache product");
      }

      return response.json();
    },
  });
}
