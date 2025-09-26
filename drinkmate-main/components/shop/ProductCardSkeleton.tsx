"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface ProductCardSkeletonProps {
  className?: string
  variant?: 'grid' | 'list'
}

export default function ProductCardSkeleton({ 
  className = "", 
  variant = 'grid' 
}: ProductCardSkeletonProps) {
  if (variant === 'list') {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="flex gap-4 p-4 border border-gray-200 rounded-2xl">
          {/* Image */}
          <div className="w-32 h-32 bg-gray-200 rounded-xl flex-shrink-0"></div>
          
          {/* Content */}
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("animate-pulse group", className)}>
      <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm overflow-hidden">
        {/* Image Skeleton */}
        <div className="relative aspect-[4/5] bg-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
          {/* Badge skeletons */}
          <div className="absolute top-3 right-3 w-12 h-6 bg-gray-300 rounded-full"></div>
          <div className="absolute top-3 left-3 w-16 h-6 bg-gray-300 rounded-full"></div>
        </div>

        {/* Content Skeleton */}
        <div className="p-5 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-4/5"></div>
            <div className="h-4 bg-gray-200 rounded w-3/5"></div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>

          {/* Color Swatches */}
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-6 h-6 bg-gray-200 rounded-full"></div>
            ))}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced skeleton for the entire grid
export function ProductGridSkeleton({ 
  count = 8, 
  variant = 'grid',
  className = "" 
}: { 
  count?: number
  variant?: 'grid' | 'list'
  className?: string 
}) {
  return (
    <div className={cn(
      variant === 'grid' 
        ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" 
        : "space-y-4",
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  )
}

// Skeleton for filter sidebar
export function FilterSkeleton() {
  return (
    <div className="w-80 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>

      {/* Search */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-11 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Filter Sections */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="w-8 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Skeleton for toolbar
export function ToolbarSkeleton() {
  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex flex-1 items-center gap-4 w-full lg:w-auto">
            <div className="flex-1 max-w-lg h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="lg:hidden h-12 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:block h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-12 w-56 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-12 w-20 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
