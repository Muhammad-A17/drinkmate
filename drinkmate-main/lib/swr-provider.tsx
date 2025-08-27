"use client";

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Global SWR configuration
        revalidateOnFocus: false, // Don't revalidate when window gets focus
        revalidateOnReconnect: true, // Revalidate when browser regains network connection
        dedupingInterval: 5000, // Dedupe requests within 5 seconds
        errorRetryCount: 3, // Retry failed requests 3 times
        errorRetryInterval: 5000, // Wait 5 seconds between retries
        suspense: false, // Don't use React Suspense
        refreshInterval: 0, // Don't refresh data automatically
        keepPreviousData: true, // Keep previous data while fetching new data
        focusThrottleInterval: 10000, // Throttle focus events to 10 seconds
        loadingTimeout: 5000, // Show loading state after 5 seconds
        provider: () => {
          // Create a persistent cache that lasts across page navigations
          const cache = new Map();
          return cache;
        },
        onError: (error, key) => {
          if (process.env.NODE_ENV !== 'production') {
            console.error(`SWR Error for ${key}:`, error);
          }
        }
      }}
    >
      {children}
    </SWRConfig>
  );
}
