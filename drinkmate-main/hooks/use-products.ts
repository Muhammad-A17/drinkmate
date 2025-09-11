import { useState, useEffect, useCallback } from 'react'
import { shopAPI } from '@/lib/api'
import { Product, Bundle, CO2Cylinder, ProductFilters, PaginatedResponse } from '@/lib/types'
import { PAGINATION } from '@/lib/constants'

interface UseProductsOptions {
  category?: string
  filters?: ProductFilters
  autoFetch?: boolean
}

interface UseProductsReturn {
  products: Product[]
  bundles: Bundle[]
  cylinders: CO2Cylinder[]
  loading: boolean
  error: string | null
  hasMore: boolean
  page: number
  total: number
  refetch: () => Promise<void>
  loadMore: () => Promise<void>
  setFilters: (filters: ProductFilters) => void
  clearError: () => void
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { category, filters = {}, autoFetch = true } = options
  
  const [products, setProducts] = useState<Product[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [cylinders, setCylinders] = useState<CO2Cylinder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE)
  const [total, setTotal] = useState(0)
  const [currentFilters, setCurrentFilters] = useState<ProductFilters>(filters)

  const fetchProducts = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setLoading(true)
      setError(null)

      const queryFilters = {
        ...currentFilters,
        page: pageNum,
        limit: PAGINATION.DEFAULT_LIMIT,
        ...(category && { category }),
      }

      const [productsResponse, bundlesResponse, cylindersResponse] = await Promise.all([
        shopAPI.getProducts(queryFilters),
        shopAPI.getBundles(queryFilters),
        shopAPI.getCO2Cylinders(queryFilters),
      ])

      if (reset) {
        setProducts(productsResponse?.products || [])
        setBundles(bundlesResponse?.bundles || [])
        setCylinders(cylindersResponse?.cylinders || [])
        setPage(1)
      } else {
        setProducts(prev => [...prev, ...(productsResponse?.products || [])])
        setBundles(prev => [...prev, ...(bundlesResponse?.bundles || [])])
        setCylinders(prev => [...prev, ...(cylindersResponse?.cylinders || [])])
      }

      setTotal(productsResponse?.total || 0)
      setHasMore((productsResponse?.products?.length || 0) === PAGINATION.DEFAULT_LIMIT)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [category, currentFilters])

  const refetch = useCallback(async () => {
    await fetchProducts(1, true)
  }, [fetchProducts])

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      await fetchProducts(nextPage, false)
    }
  }, [loading, hasMore, page, fetchProducts])

  const setFilters = useCallback((newFilters: ProductFilters) => {
    setCurrentFilters(newFilters)
    setPage(1)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    if (autoFetch) {
      refetch()
    }
  }, [autoFetch, refetch])

  return {
    products,
    bundles,
    cylinders,
    loading,
    error,
    hasMore,
    page,
    total,
    refetch,
    loadMore,
    setFilters,
    clearError,
  }
}

// Hook for single product
export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await shopAPI.getProduct(productId)
      setProduct(response?.product || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId, fetchProduct])

  return { product, loading, error, refetch: fetchProduct }
}

// Hook for product search
export function useProductSearch() {
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string, filters?: ProductFilters) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await shopAPI.searchProducts(query, filters)
      setSearchResults(response?.products || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setSearchResults([])
    setError(null)
  }, [])

  return { searchResults, loading, error, search, clearResults }
}
