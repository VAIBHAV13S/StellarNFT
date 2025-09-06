import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Currency } from "@/types/marketplace"

// Price rates type
interface PriceRates {
  USD: number;
  EUR: number;
  INR: number;
  XLM: number;
  KALE: number;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbols = {
    USD: '$',
    EUR: '€',
    INR: '₹',
    XLM: '',
    KALE: ''
  };

  const suffixes = {
    XLM: ' XLM',
    KALE: ' KALE',
    USD: '',
    EUR: '',
    INR: ''
  };

  return `${symbols[currency]}${amount.toFixed(2)}${suffixes[currency]}`;
}

// Legacy functions - use usePrices hook instead
export function getCurrentFiatRates() {
  console.warn('getCurrentFiatRates called without price context. Use usePrices hook instead.');
  return {
    USD: 1,
    EUR: 0.92,
    INR: 87.5,
    XLM: 0.105,
    KALE: 1.05
  };
}

export function subscribeToPriceUpdates(callback: (prices: PriceRates) => void) {
  console.warn('subscribeToPriceUpdates called without price context. Use usePrices hook instead.');
  return () => {};
}