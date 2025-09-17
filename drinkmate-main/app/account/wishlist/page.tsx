'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/translation-context'
import { useWishlist } from '@/hooks/use-wishlist'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Trash2, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Price } from '@/components/account/Price'

export default function WishlistPage() {
  const { language, isRTL } = useTranslation()
  const { items: wishlist, loading, error, removeFromWishlist, refreshWishlist } = useWishlist()
  const { addItem } = useCart()
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'AR' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

  const handleRemoveFromWishlist = async (productId: string) => {
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

  const handleAddAllToCart = () => {
    const inStockItems = wishlist.filter(item => item.product.stock > 0)
    inStockItems.forEach(item => handleAddToCart(item))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {language === 'AR' ? 'خطأ في تحميل قائمة الأمنيات' : 'Error Loading Wishlist'}
        </h3>
        <p className="text-gray-500 mb-4">
          {language === 'AR' ? 'حدث خطأ أثناء تحميل قائمة الأمنيات' : 'An error occurred while loading your wishlist'}
        </p>
        <Button onClick={refreshWishlist} variant="outline">
          {language === 'AR' ? 'إعادة المحاولة' : 'Try Again'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'AR' ? 'قائمة الأمنيات' : 'Wishlist'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'AR' 
              ? 'المنتجات المحفوظة للشراء لاحقاً'
              : 'Products saved for later purchase'
            }
          </p>
        </div>
        {wishlist.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {wishlist.length} {language === 'AR' ? 'عنصر' : 'items'}
            </span>
            <Button 
              onClick={handleAddAllToCart}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {language === 'AR' ? 'إضافة الكل للسلة' : 'Add All to Cart'}
            </Button>
          </div>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {language === 'AR' ? 'قائمة الأمنيات فارغة' : 'Your Wishlist is Empty'}
          </h3>
          <p className="text-gray-500 mb-6">
            {language === 'AR' 
              ? 'احفظ المنتجات التي تعجبك لعرضها هنا لاحقاً'
              : 'Save products you like to view them here later'
            }
          </p>
          <Link href="/shop">
            <Button className="bg-blue-600 hover:bg-blue-700">
              {language === 'AR' ? 'تسوق الآن' : 'Start Shopping'}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 group">
              {/* Product Image */}
              <div className="relative mb-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={item.product.images?.[0] || "/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                
                {/* Stock Status */}
                {item.product.stock === 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                    {language === 'AR' ? 'نفد' : 'Out of Stock'}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Link href={`/shop/${item.product.slug}`}>
                    <Button size="sm" variant="secondary">
                      <Eye className="w-4 h-4 mr-1" />
                      {language === 'AR' ? 'عرض' : 'View'}
                    </Button>
                  </Link>
                  {item.product.stock > 0 && (
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {language === 'AR' ? 'إضافة' : 'Add'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {language === 'AR' && item.product.nameAr ? item.product.nameAr : item.product.name}
                </h3>
                <div className="mt-2">
                  <Price 
                    value={item.product.price} 
                    compareAt={item.product.originalPrice}
                  />
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <span>
                    {language === 'AR' ? 'أضيف في' : 'Added on'} {formatDate(item.addedAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {item.product.stock > 0 ? (
                  <Button 
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {language === 'AR' ? 'إضافة للسلة' : 'Add to Cart'}
                  </Button>
                ) : (
                  <Button 
                    disabled
                    className="flex-1 bg-gray-400 cursor-not-allowed"
                  >
                    {language === 'AR' ? 'نفد من المخزون' : 'Out of Stock'}
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFromWishlist(item.product._id)}
                  disabled={removingItems.has(item.product._id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
      )}
    </div>
  )
}