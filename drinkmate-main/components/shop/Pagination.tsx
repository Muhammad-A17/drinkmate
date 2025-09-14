"use client"

import React, { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onLoadMore?: () => void
  loading?: boolean
  showLoadMore?: boolean
  isRTL?: boolean
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onLoadMore,
  loading = false,
  showLoadMore = false,
  isRTL = false
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }, [currentPage, totalPages, onPageChange])

  const handleLoadMore = useCallback(() => {
    if (onLoadMore && !loading) {
      onLoadMore()
    }
  }, [onLoadMore, loading])

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Results Info */}
      <div className="text-sm text-gray-600 text-center">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      {/* Load More Button (Alternative to pagination) */}
      {showLoadMore && currentPage < totalPages && (
        <Button
          onClick={handleLoadMore}
          disabled={loading}
          variant="outline"
          className="px-8 py-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            `Load More (${totalPages - currentPage} pages remaining)`
          )}
        </Button>
      )}

      {/* Classic Pagination */}
      {!showLoadMore && (
        <div className="flex items-center space-x-1">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {getVisiblePages().map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">
                    ...
                  </span>
                )
              }

              const pageNumber = page as number
              const isCurrentPage = pageNumber === currentPage

              return (
                <Button
                  key={pageNumber}
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  className={cn(
                    "min-w-[40px] h-10",
                    isCurrentPage && "bg-[#12d6fa] hover:bg-[#0fb8d9] text-white"
                  )}
                >
                  {pageNumber}
                </Button>
              )
            })}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Page Jump (for large page counts) */}
      {totalPages > 10 && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Go to page:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value)
              if (page >= 1 && page <= totalPages) {
                handlePageChange(page)
              }
            }}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
      )}
    </div>
  )
}
