import { cn } from "@/lib/utils"

interface ProductCardSkeletonProps {
  className?: string
}

export const ProductCardSkeleton = ({ className }: ProductCardSkeletonProps) => (
  <div className={cn(
    "rounded-2xl border border-black/5 bg-white/70 p-4 flex flex-col h-full",
    className
  )}>
    {/* Image skeleton */}
    <div className="aspect-[4/5] w-full rounded-xl bg-neutral-200 animate-pulse mb-4" />
    
    {/* Title skeleton */}
    <div className="h-4 w-3/4 rounded bg-neutral-200 animate-pulse mb-2" />
    
    {/* Rating skeleton */}
    <div className="flex items-center gap-1 mb-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="w-4 h-4 rounded bg-neutral-200 animate-pulse" />
      ))}
      <div className="w-8 h-3 rounded bg-neutral-200 animate-pulse ml-1" />
    </div>
    
    {/* Price skeleton */}
    <div className="h-5 w-1/2 rounded bg-neutral-200 animate-pulse mb-3" />
    
    {/* Variant swatches skeleton */}
    <div className="flex gap-2 mb-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse" />
      ))}
    </div>
    
    {/* Stock status skeleton */}
    <div className="h-3 w-16 rounded bg-neutral-200 animate-pulse mb-4" />
    
    {/* CTA skeleton */}
    <div className="mt-auto h-10 w-full rounded-xl bg-neutral-200 animate-pulse" />
  </div>
)

export default ProductCardSkeleton

