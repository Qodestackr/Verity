import { type MightNotExist } from "@/lib/globalTypes";

export type Money = {
  currency: string;
  amount: number;
} | null;

export const getFormattedMoney = <TMoney extends Money>(
  money: MightNotExist<TMoney>,
  negative = false
) => {
  if (!money) {
    return "";
  }

  const { amount, currency } = money;

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  }).format(negative ? -amount : amount);
};

export const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
  }).format(amount);

export const formatMoneyRange = (
  range: {
    start?: { amount: number; currency: string } | null;
    stop?: { amount: number; currency: string } | null;
  } | null
) => {
  const { start, stop } = range || {};
  const startMoney = start && formatMoney(start.amount, start.currency);
  const stopMoney = stop && formatMoney(stop.amount, stop.currency);

  if (startMoney === stopMoney) {
    return startMoney;
  }

  return `${startMoney} - ${stopMoney}`;
};
