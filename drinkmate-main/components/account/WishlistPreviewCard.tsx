'use client'

import { useTranslation } from '@/lib/translation-context'
import { WishlistItem } from '@/types/account'
import { Button } from '@/components/ui/button'
import { Heart, ArrowRight, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Price } from './Price'

interface WishlistPreviewCardProps {
  items: WishlistItem[]
}

export default function WishlistPreviewCard({ items }: WishlistPreviewCardProps) {
  const { language, isRTL } = useTranslation()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'AR' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6 lg:p-8 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Heart className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="font-semibold text-gray-900">
            {language === 'AR' ? 'قائمة الأمنيات' : 'Wishlist'}
          </h3>
        </div>
        <Link href="/account/wishlist">
          <Button variant="ghost" size="sm">
            {language === 'AR' ? 'عرض الكل' : 'View All'}
            <ArrowRight className={cn(
              "w-4 h-4 ml-1",
              isRTL ? "ml-0 mr-1 rotate-180" : ""
            )} />
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-3">
            {language === 'AR' ? 'احفظ المنتجات لعرضها هنا لاحقاً' : 'Save products to view them here later'}
          </p>
          <Link href="/shop">
            <Button variant="outline" size="sm">
              {language === 'AR' ? 'تسوق الآن' : 'Start Shopping'}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {language === 'AR' ? 'نفد' : 'OOS'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate">
                  {item.productName}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Price value={item.price} size="sm" />
                  <span className="text-xs text-gray-500">
                    {formatDate(item.addedAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!item.inStock}
                  className="h-8 w-8 p-0"
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
