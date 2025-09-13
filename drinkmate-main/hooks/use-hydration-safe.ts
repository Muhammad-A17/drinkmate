import { useEffect, useState } from 'react';

/**
 * A hook to safely handle client-side only rendering
 * This helps prevent hydration mismatches between server and client
 * 
 * @returns boolean indicating if the component is being rendered on the client
 */
export function useHydrationSafe(): boolean {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // This effect runs only on the client after hydration
    setIsClient(true);
  }, []);
  
  return isClient;
}