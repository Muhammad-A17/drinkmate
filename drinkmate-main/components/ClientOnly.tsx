import { useHydrationSafe } from '@/hooks/use-hydration-safe';
import { ReactNode } from 'react';

/**
 * A component that only renders its children on the client side
 * This prevents hydration mismatches by not rendering anything during SSR
 * 
 * @param props.children - The content to render only on the client
 * @param props.fallback - Optional content to render during SSR (default: null)
 */
export function ClientOnly({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  const isClient = useHydrationSafe();
  
  if (!isClient) {
    return <>{fallback}</>;
  }
  
  return <div suppressHydrationWarning>{children}</div>;
}
