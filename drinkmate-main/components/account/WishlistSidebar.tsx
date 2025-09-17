'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/translation-context'
import { useWishlist } from '@/hooks/use-wishlist'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Eye, Trash2, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Price } from '@/components/account/Price'
import { useCart } from '@/lib/cart-context'

interface WishlistSidebarProps {
  className?: string
}

export default function WishlistSidebar({ className = "" }: WishlistSidebarProps) {
  const { language, isRTL } = useTranslation()
  const { items, loading, error, removeFromWishlist, refreshWishlist } = useWishlist()
  const { addItem } = useCart()
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())
  const [showAllPopup, setShowAllPopup] = useState(false)

  const handleRemoveItem = async (productId: string) => {
    setRemovingItems(prev => new Set(prev).add(productId))
    try {
      await removeFromWishlist(productId)
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: 1,
      image: item.product.images[0] || "/placeholder.svg",
      category: item.product.category?.name,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'AR' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-900">
            {language === 'AR' ? 'قائمة الأمنيات' : 'Wishlist'}
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-900">
            {language === 'AR' ? 'قائمة الأمنيات' : 'Wishlist'}
          </h3>
        </div>
        <div className="text-center py-4">
          <p className="text-red-500 text-sm mb-2">
            {language === 'AR' ? 'خطأ في تحميل قائمة الأمنيات' : 'Error loading wishlist'}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshWishlist}
            className="text-xs"
          >
            {language === 'AR' ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-900">
            {language === 'AR' ? 'قائمة الأمنيات' : 'Wishlist'}
          </h3>
        </div>
        <span className="text-sm text-gray-500">
          {items.length} {language === 'AR' ? 'عنصر' : 'items'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-3">
            {language === 'AR' ? 'احفظ المنتجات لعرضها هنا لاحقاً' : 'Save products to view them here later'}
          </p>
          <Link href="/shop">
            <Button variant="outline" size="sm" className="text-xs">
              {language === 'AR' ? 'تسوق الآن' : 'Start Shopping'}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items.slice(0, 3).map((item) => (
            <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
              {/* Product Image */}
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                {(() => {
                  const image = item.product.images?.[0];
                  const imageUrl = typeof image === 'string' ? image : (image as any)?.url || '';
                  return imageUrl && imageUrl.trim() !== '' ? (
                    <Image
                      src={imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : null;
                })() || (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
                {item.product.stock === 0 && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-600 text-xs font-medium">
                      {language === 'AR' ? 'نفد' : 'OOS'}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {language === 'AR' && item.product.nameAr ? item.product.nameAr : item.product.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Price 
                    value={item.product.price || 0} 
                    compareAt={item.product.originalPrice}
                    className="text-xs"
                  />
                  <span className="text-xs text-gray-500">
                    {formatDate(item.addedAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Link href={`/shop/${item.product.slug}`}>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Eye className="w-3 h-3" />
                  </Button>
                </Link>
                
                {item.product.stock > 0 && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="w-3 h-3" />
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveItem(item.product._id)}
                  disabled={removingItems.has(item.product._id)}
                >
                  {removingItems.has(item.product._id) ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}

          {items.length > 3 && (
            <div className="space-y-2 pt-2">
              {/* +X more indicator */}
              <div className="text-center">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  +{items.length - 3} {language === 'AR' ? 'أخرى' : 'more'}
                </span>
              </div>
              
              {/* Show All button */}
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setShowAllPopup(true)}
                >
                  {language === 'AR' ? `عرض الكل (${items.length})` : `Show All (${items.length})`}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Show All Popup Modal */}
      {showAllPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-semibold text-gray-900">
                  {language === 'AR' ? 'قائمة الأمنيات الكاملة' : 'Complete Wishlist'}
                </h3>
                <span className="text-sm text-gray-500">
                  ({items.length} {language === 'AR' ? 'عنصر' : 'items'})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllPopup(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg group">
                    {/* Product Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {(() => {
                        const image = item.product.images?.[0];
                        const imageUrl = typeof image === 'string' ? image : (image as any)?.url || '';
                        return imageUrl && imageUrl.trim() !== '' ? (
                          <Image
                            src={imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : null;
                      })() || (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      {item.product.stock === 0 && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                          <span className="text-red-600 text-xs font-medium">
                            {language === 'AR' ? 'نفد' : 'OOS'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {language === 'AR' && item.product.nameAr ? item.product.nameAr : item.product.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-2">
                        <Price 
                          value={item.product.price || 0} 
                          compareAt={item.product.originalPrice}
                          className="text-sm"
                        />
                        <span className="text-sm text-gray-500">
                          {formatDate(item.addedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/shop/${item.product.slug}`}>
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      {item.product.stock > 0 && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-9 w-9 p-0"
                          onClick={() => handleAddToCart(item)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-9 w-9 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRemoveItem(item.product._id)}
                        disabled={removingItems.has(item.product._id)}
                      >
                        {removingItems.has(item.product._id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {language === 'AR' ? `إجمالي ${items.length} منتج` : `Total ${items.length} products`}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowAllPopup(false)}
                  className="text-sm"
                >
                  {language === 'AR' ? 'إغلاق' : 'Close'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
