"use client";

export interface CurrencyOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format a number as Kenyan Shilling currency (KES)
 * @param amount The number to format
 * @param options Optional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  options: CurrencyOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }
): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
  }).format(amount);
}

/**
 * Parse a currency string back to a number
 * @param value The currency string to parse
 * @returns Parsed number
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d.-]+/g, ""));
}

/**
 * Format a percentage value
 * @param value The percentage value (0-100)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
