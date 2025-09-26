import { useHydrationSafe } from '@/hooks/use-hydration-safe';

/**
 * A component for displaying prices safely without hydration mismatches
 * 
 * @param props.price - The price to display
 * @param props.originalPrice - The original price (for showing discounts)
 * @param props.discount - The discount percentage
 * @param props.currency - The currency symbol (default: '$')
 * @param props.className - Additional CSS classes
 */
export function PriceDisplay({ 
  price, 
  originalPrice,
  discount,
  currency = '$', 
  className = '' 
}: { 
  price: number; 
  originalPrice?: number;
  discount?: number;
  currency?: string; 
  className?: string;
}) {
  const isClient = useHydrationSafe();

  // Format price with two decimal places
  const formattedPrice = isClient 
    ? price.toFixed(2)
    : typeof price === 'number' ? price.toFixed(2) : '0.00';
    
  const formattedOriginalPrice = originalPrice && isClient
    ? originalPrice.toFixed(2)
    : originalPrice ? originalPrice.toFixed(2) : null;
    
  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span>
        {currency}{formattedPrice}
      </span>
      
      {hasDiscount && formattedOriginalPrice && (
        <span className="line-through text-muted-foreground text-sm">
          {currency}{formattedOriginalPrice}
        </span>
      )}
      
      {hasDiscount && (discount || originalPrice > price) && (
        <span className="bg-green-100 text-green-800 rounded-md px-1.5 py-0.5 text-xs">
          {discount ? 
            `-${discount}%` : 
            `-${Math.round((1 - price / originalPrice) * 100)}%`}
        </span>
      )}
    </div>
  );
}

export default PriceDisplay;
