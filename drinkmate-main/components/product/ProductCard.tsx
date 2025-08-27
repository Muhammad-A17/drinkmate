"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug?: string;
    price: number;
    salePrice?: number;
    images?: string[];
    rating?: number;
    isNew?: boolean;
    isBestSeller?: boolean;
    stock?: number;
  };
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  
  const productUrl = `/shop/${product.slug || product._id}`;
  const productImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : "/images/placeholder.png";
    
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock && product.stock > 0) {
      addItem({
        id: product._id,
        name: product.name,
        price: product.salePrice || product.price,
        image: productImage,
        quantity: 1
      });
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error("This product is out of stock");
    }
  };

  return (
    <Card className="group overflow-hidden border-gray-200 hover:border-[#12d6fa] transition-colors h-full shadow-sm hover:shadow-md">
      <Link href={productUrl} className="block h-full">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <Image
            src={productImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={80}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjVmOSIvPjwvc3ZnPg=="
            className="object-contain group-hover:scale-105 transition-transform duration-300 p-2 sm:p-4"
          />
          
          {/* Product badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge className="bg-green-500 text-white">New</Badge>
            )}
            {product.isBestSeller && (
              <Badge className="bg-amber-500 text-white">Best Seller</Badge>
            )}
            {product.salePrice && product.salePrice < product.price && (
              <Badge className="bg-red-500 text-white">Sale</Badge>
            )}
          </div>
          
          {/* Quick add to cart button (non-compact view) */}
          {!compact && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                onClick={handleAddToCart}
                disabled={!product.stock || product.stock <= 0}
                className="mb-4 bg-white text-gray-800 hover:bg-[#12d6fa] hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>
        
        <CardContent className={`${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
          {/* Rating (non-compact view) */}
          {!compact && product.rating && (
            <div className="flex items-center mb-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i}
                    className={`w-3 h-3 ${i < (product.rating ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
            </div>
          )}
          
          <h3 className={`font-medium text-gray-800 mb-2 line-clamp-2 ${compact ? 'text-sm' : 'text-sm sm:text-base'} hover:text-[#12d6fa] transition-colors`}>
            {product.name}
          </h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-2 sm:mb-0">
              {product.salePrice && product.salePrice < product.price ? (
                <>
                  <span className={`font-bold text-gray-800 ${compact ? 'text-sm' : 'text-base'}`}>
                    ${product.salePrice.toFixed(2)}
                  </span>
                  <span className="ml-2 text-gray-500 line-through text-sm">
                    ${product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className={`font-bold text-gray-800 ${compact ? 'text-sm' : 'text-base'}`}>
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Quick add button for mobile */}
            <div className="sm:hidden">
              <Button 
                onClick={handleAddToCart}
                disabled={!product.stock || product.stock <= 0}
                className="w-full bg-[#12d6fa] hover:bg-[#0fb8d9] text-white text-xs py-1 px-3 rounded-full"
                size="sm"
              >
                {isInCart(product._id) ? "Added" : "Add to Cart"}
              </Button>
            </div>
          </div>
          
          {/* Stock status (non-compact view) */}
          {!compact && (
            <div className="mt-2 text-xs flex justify-between items-center">
              <span className={product.stock && product.stock > 0 ? "text-green-600" : "text-red-600"}>
                {product.stock && product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
              
              {product.stock && product.stock <= 5 && product.stock > 0 && (
                <span className="text-amber-600 text-xs">
                  Only {product.stock} left
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
