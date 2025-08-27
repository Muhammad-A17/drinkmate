import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as Saudi Riyal currency
 * Returns the formatted amount as a string
 * Safely handles undefined or null values
 */
export function formatCurrency(amount: number | undefined | null): string {
  const formattedAmount = amount === undefined || amount === null 
    ? '0.00' 
    : Number(amount).toFixed(2);
  
  return `${formattedAmount}`;
}

/**
 * Re-export the SaudiRiyal component for convenience
 * This allows importing from both @/components/ui/SaudiRiyal and @/lib/utils
 */
export { default as SaudiRiyal } from '@/components/ui/SaudiRiyal';
