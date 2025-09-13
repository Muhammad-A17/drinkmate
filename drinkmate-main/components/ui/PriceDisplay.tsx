import { useHydrationSafe } from '@/hooks/use-hydration-safe';

/**
 * A component for displaying prices safely without hydration mismatches
 * 
 * @param props.price - The price to display
 * @param props.currency - The currency symbol (default: '$')
 * @param props.className - Additional CSS classes
 */
export function PriceDisplay({ 
  price, 
  currency = '$', 
  className = '' 
}: { 
  price: number; 
  currency?: string; 
  className?: string;
}) {
  const isClient = useHydrationSafe();

  // Format price with two decimal places
  const formattedPrice = isClient 
    ? price.toFixed(2)
    : typeof price === 'number' ? price.toFixed(2) : '0.00';

  return (
    <span className={className}>
      {currency}{formattedPrice}
    </span>
  );
}