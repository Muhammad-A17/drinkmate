"use client";

import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { shopAPI } from '@/lib/api';

// Define fetcher function that will be used by SWR
const fetcher = async (key: string, ...args: any[]) => {
  try {
    // Performance measurement
    const startTime = performance.now();
    
    // Parse the key to determine which API function to call
    const [resource, id, subResource] = key.split('/').filter(Boolean);
    
    let result;
    
    if (resource === 'products') {
      if (id) {
        if (subResource === 'reviews') {
          result = await shopAPI.getProductReviews(id);
        } else {
          result = await shopAPI.getProductFlexible(id);
        }
      } else {
        result = await shopAPI.getProducts(args[0] || {});
      }
    } else if (resource === 'bundles') {
      if (id) {
        if (subResource === 'reviews') {
          result = await shopAPI.getBundleReviews(id);
        } else {
          result = await shopAPI.getBundleFlexible(id);
        }
      } else {
        result = await shopAPI.getBundles(args[0] || {});
      }
    } else if (resource === 'categories') {
      result = await shopAPI.getCategories();
    } else {
      throw new Error(`Unsupported resource: ${resource}`);
    }
    
    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      const endTime = performance.now();
      console.log(`Fetch for ${key} took ${Math.round(endTime - startTime)}ms`);
    }
    
    return result;
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    throw error;
  }
}

// Custom hook for products
export function useProducts(params?: any, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    ['products', params],
    ([_, params]) => fetcher('products', params),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      ...config
    }
  );

  return {
    products: data?.products || [],
    totalProducts: data?.totalProducts || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 1,
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}

// Custom hook for a single product
export function useProduct(idOrSlug: string, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    idOrSlug ? `products/${idOrSlug}` : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      ...config
    }
  );

  return {
    product: data?.product,
    reviews: data?.reviews || [],
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}

// Custom hook for product by slug
export function useProductBySlug(slug: string, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    slug ? `products/slug/${slug}` : null,
    key => {
      const [_, __, slug] = key.split('/');
      return shopAPI.getProductBySlug(slug);
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      ...config
    }
  );

  return {
    product: data?.product,
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}

// Custom hook for bundles
export function useBundles(params?: any, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    ['bundles', params],
    ([_, params]) => fetcher('bundles', params),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      ...config
    }
  );

  return {
    bundles: data?.bundles || [],
    totalBundles: data?.totalBundles || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 1,
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}

// Custom hook for a single bundle
export function useBundle(idOrSlug: string, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    idOrSlug ? `bundles/${idOrSlug}` : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      ...config
    }
  );

  return {
    bundle: data?.bundle,
    reviews: data?.reviews || [],
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}

// Custom hook for categories
export function useCategories(config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    'categories',
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes - categories change less frequently
      ...config
    }
  );

  return {
    categories: data?.categories || [],
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}

// Custom hook for product reviews
export function useProductReviews(productId: string, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    productId ? `products/${productId}/reviews` : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      ...config
    }
  );

  return {
    reviews: data?.reviews || [],
    totalReviews: data?.totalReviews || 0,
    currentPage: data?.currentPage || 1,
    totalPages: data?.totalPages || 0,
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}

// Custom hook for bundle reviews
export function useBundleReviews(bundleId: string, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    bundleId ? `bundles/${bundleId}/reviews` : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      ...config
    }
  );

  return {
    reviews: data?.reviews || [],
    totalReviews: data?.totalReviews || 0,
    currentPage: data?.currentPage || 1,
    totalPages: data?.totalPages || 0,
    isLoading,
    isError: !!error,
    error,
    mutate
  };
}
