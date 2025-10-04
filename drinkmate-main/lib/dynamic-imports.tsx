import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import React from 'react';

// Lazy load heavy components
export const LazyChart = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Line })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
});

export const LazyRecharts = dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
});

// Lazy load admin components
export const LazyAdminTable = dynamic(() => import('@/components/admin/AdminTable'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />
});

export const LazyChartsSection = dynamic(() => import('@/components/admin/dashboard/ChartsSection'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />
});

// Lazy load heavy UI components
export const LazyTable = dynamic(() => import('@/components/ui/table').then(mod => ({ default: mod.Table })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
});

// Lazy load chat components
export const LazyFloatingChatWidget = dynamic(() => import('@/components/chat/FloatingChatWidget'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-16 w-16 rounded-full" />
});

// Utility function for creating lazy components with consistent loading
export function createLazyComponent<T = {}>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: () => React.ReactNode
) {
  return dynamic(importFunc, {
    ssr: false,
    loading: fallback || (() => <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />)
  });
}

// Preload critical components
export const preloadCriticalComponents = () => {
  if (typeof window !== 'undefined') {
    // Preload components that are likely to be needed
    import('@/lib/contexts/cart-context');
    import('@/components/layout/Header');
    import('@/components/layout/Footer');
  }
};
