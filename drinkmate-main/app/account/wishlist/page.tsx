'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/translation-context'
import { WishlistItem } from '@/types/account'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Price } from '@/components/account/Price'

export default function WishlistPage() {
  const { language, isRTL } = useTranslation()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API call
  const mockWishlist: WishlistItem[] = [
    {
      id: '1',
      productId: 'prod-1',
      productName: 'Premium Flavor Pack - Italian Strawberry',
      image: '/images/flavor-pack-italian-strawberry.jpg',
      price: 49.99,
      inStock: true,
      addedAt: '2024-01-12T00:00:00Z'
    },
    {
      id: '2',
      productId: 'prod-2',
      productName: 'Extra CO₂ Cylinder',
      image: '/images/co2-cylinder.jpg',
      price: 25.99,
      inStock: true,
      addedAt: '2024-01-08T00:00:00Z'
    },
    {
      id: '3',
      productId: 'prod-3',
      productName: 'Starter Kit - Arctic Blue',
      image: '/images/starter-kit-blue.jpg',
      price: 199.99,
      inStock: false,
      addedAt: '2024-01-05T00:00:00Z'
    },
    {
      id: '4',
      productId: 'prod-4',
      productName: 'Accessories Bundle',
      image: '/images/accessories-bundle.jpg',
      price: 89.99,
      inStock: true,
      addedAt: '2024-01-03T00:00:00Z'
    }
  ]

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setWishlist(mockWishlist)
      setLoading(false)
    }

    fetchWishlist()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'AR' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleRemoveFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id))
  }

  const handleAddToCart = (item: WishlistItem) => {
    // Add to cart logic
    console.log('Add to cart:', item)
  }

  const handleAddAllToCart = () => {
    const inStockItems = wishlist.filter(item => item.inStock)
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
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleAddAllToCart}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              {language === 'AR' ? 'إضافة الكل للسلة' : 'Add All to Cart'}
            </Button>
          </div>
        )}
      </div>

      {/* Wishlist Items */}
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {language === 'AR' ? 'قائمة الأمنيات فارغة' : 'Your wishlist is empty'}
          </h3>
          <p className="text-gray-600 mb-6">
            {language === 'AR' 
              ? 'احفظ المنتجات التي تعجبك لعرضها هنا لاحقاً'
              : 'Save products you like to view them here later'
            }
          </p>
          <Link href="/shop">
            <Button>
              {language === 'AR' ? 'تسوق الآن' : 'Start Shopping'}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 group">
              {/* Product Image */}
              <div className="relative mb-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                
                {/* Stock Status */}
                {!item.inStock && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                    {language === 'AR' ? 'نفد' : 'Out of Stock'}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Link href={`/shop/${item.productId}`}>
                    <Button size="sm" variant="secondary">
                      <Eye className="w-4 h-4 mr-1" />
                      {language === 'AR' ? 'عرض' : 'View'}
                    </Button>
                  </Link>
                  {item.inStock && (
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
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.productName}
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <Price value={item.price} size="lg" />
                  <span className="text-xs text-gray-500">
                    {formatDate(item.addedAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {item.inStock ? (
                  <Button 
                    className="flex-1"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {language === 'AR' ? 'إضافة للسلة' : 'Add to Cart'}
                  </Button>
                ) : (
                  <Button 
                    className="flex-1" 
                    disabled
                    variant="outline"
                  >
                    {language === 'AR' ? 'نفد من المخزون' : 'Out of Stock'}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {wishlist.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {language === 'AR' ? 'ملخص قائمة الأمنيات' : 'Wishlist Summary'}
              </h3>
              <p className="text-sm text-gray-600">
                {wishlist.length} {language === 'AR' ? 'منتج' : 'products'} • 
                {wishlist.filter(item => item.inStock).length} {language === 'AR' ? 'متوفر' : 'in stock'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                <Price 
                  value={wishlist.filter(item => item.inStock).reduce((sum, item) => sum + item.price, 0)} 
                  size="lg" 
                />
              </div>
              <p className="text-sm text-gray-600">
                {language === 'AR' ? 'إجمالي المنتجات المتوفرة' : 'Total for available items'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
