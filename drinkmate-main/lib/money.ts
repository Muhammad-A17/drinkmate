/**
 * Money formatting utilities for consistent currency display
 */

export const fmt = (amount: number, currency: 'SAR' | 'USD' = 'SAR', locale = 'en-SA'): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0.00'
  }
  
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency, 
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(amount)
}

export const fmtAmount = (amount: number): string => {
  return fmt(amount, 'SAR')
}

export const fmtPrice = (amount: number): string => {
  return fmt(amount, 'SAR')
}

// For display without currency symbol (just the number)
export const fmtNumber = (amount: number): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0.00'
  }
  
  return new Intl.NumberFormat('en-SA', { 
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(amount)
}
