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
 * Converts Western Arabic numerals to Eastern Arabic numerals
 * Used for proper Arabic localization
 * @param text - The text containing numbers to convert
 * @returns Text with Eastern Arabic numerals
 */
export function toArabicNumerals(text: string): string {
  const westernToEastern = {
    '0': '٠',
    '1': '١',
    '2': '٢',
    '3': '٣',
    '4': '٤',
    '5': '٥',
    '6': '٦',
    '7': '٧',
    '8': '٨',
    '9': '٩'
  };

  return text.replace(/[0-9]/g, (digit) => westernToEastern[digit as keyof typeof westernToEastern]);
}

/**
 * Re-export the SaudiRiyal component for convenience
 * This allows importing from both @/components/ui/SaudiRiyal and @/lib/utils
 */
export { default as SaudiRiyal } from '@/components/ui/SaudiRiyal';
