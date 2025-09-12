import React from 'react';
import { toArabicNumerals } from '@/lib/utils';

interface SaudiRiyalProps {
  amount: number | undefined | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSymbol?: boolean;
  language?: 'EN' | 'AR';
}

/**
 * SaudiRiyal Component - Displays amounts with the custom Saudi Riyal symbol
 * 
 * @param amount - The amount to display
 * @param size - Size variant: 'sm', 'md', 'lg', 'xl' (defaults to 'md')
 * @param className - Additional CSS classes
 * @param showSymbol - Whether to show the currency symbol (defaults to true)
 * 
 * @example
 * <SaudiRiyal amount={123.45} size="lg" />
 * <SaudiRiyal amount={599.00} className="text-green-600" />
 * <SaudiRiyal amount={99.99} showSymbol={false} />
 */
const SaudiRiyal: React.FC<SaudiRiyalProps> = ({
  amount,
  size = 'md',
  className = '',
  showSymbol = true,
  language = 'EN'
}) => {
  // Format the amount
  const formatAmount = (value: number | undefined | null): string => {
    if (value === undefined || value === null) {
      return language === 'AR' ? toArabicNumerals('0.00') : '0.00';
    }
    const formatted = Number(value).toFixed(2);
    return language === 'AR' ? toArabicNumerals(formatted) : formatted;
  };

  // Get size class
  const getSizeClass = (): string => {
    switch (size) {
      case 'sm': return 'riyal-symbol-sm';
      case 'lg': return 'riyal-symbol-lg';
      case 'xl': return 'riyal-symbol-xl';
      default: return 'riyal-symbol';
    }
  };

  const formattedAmount = formatAmount(amount);
  const sizeClass = getSizeClass();

  return (
    <span className={`${sizeClass} ${className}`}>
      {formattedAmount}
      {showSymbol && <span className="currency-riyal text-xs">SAR</span>}
    </span>
  );
};

export default SaudiRiyal;
