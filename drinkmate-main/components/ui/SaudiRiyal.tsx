import React from 'react';

interface SaudiRiyalProps {
  amount: number | undefined | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSymbol?: boolean;
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
  showSymbol = true 
}) => {
  // Format the amount
  const formatAmount = (value: number | undefined | null): string => {
    if (value === undefined || value === null) {
      return '0.00';
    }
    return Number(value).toFixed(2);
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
      {showSymbol && <span className="currency-riyal" style={{ fontSize: '0.7em' }}>&#xea;</span>}
    </span>
  );
};

export default SaudiRiyal;
