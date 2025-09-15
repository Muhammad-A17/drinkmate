import React from 'react';
import { toArabicNumerals } from '@/lib/utils';
import { cn } from '@/lib/utils';
import RiyalIcon from '@/components/icons/RiyalIcon';

interface SaudiRiyalProps {
  amount: number | undefined | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSymbol?: boolean;
  language?: 'EN' | 'AR';
}

/**
 * SaudiRiyal Component - Displays amounts with the Saudi Riyal SVG symbol
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

  // Get size classes for text and icon
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': 
        return {
          text: 'text-sm',
          icon: 'w-3 h-3'
        };
      case 'lg': 
        return {
          text: 'text-lg',
          icon: 'w-4 h-4'
        };
      case 'xl': 
        return {
          text: 'text-xl',
          icon: 'w-5 h-5'
        };
      default: 
        return {
          text: 'text-base',
          icon: 'w-3.5 h-3.5'
        };
    }
  };

  const formattedAmount = formatAmount(amount);
  const { text: textSize, icon: iconSize } = getSizeClasses();

  return (
    <div className={cn("flex items-baseline gap-1", className)}>
      <span className={cn("tabular-nums font-semibold", textSize)}>
        {formattedAmount}
      </span>
      {showSymbol && (
        <RiyalIcon className={iconSize} />
      )}
    </div>
  );
};

export default SaudiRiyal;
