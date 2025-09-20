import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date | number) => {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
};

export function getHrefForVariant({
  productSlug,
  variantId,
}: {
  productSlug: string;
  variantId?: string;
}): string {
  const pathname = `/products/${encodeURIComponent(productSlug)}`;

  if (!variantId) {
    return pathname;
  }

  const query = new URLSearchParams({ variant: variantId });
  return `${pathname}?${query.toString()}`;
}
