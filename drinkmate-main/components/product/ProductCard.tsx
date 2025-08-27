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
  const { addItem } = useCart();
  
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
    <Card className="group overflow-hidden border-gray-200 hover:border-[#12d6fa] transition-colors h-full">
      <Link href={productUrl} className="block h-full">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <Image
            src={productImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain group-hover:scale-105 transition-transform duration-300"
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
        
        <CardContent className={`${compact ? 'p-3' : 'p-4'}`}>
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
          
          <h3 className={`font-medium text-gray-800 mb-1 line-clamp-2 ${compact ? 'text-sm' : 'text-base'}`}>
            {product.name}
          </h3>
          
          <div className="flex items-center">
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
          
          {/* Stock status (non-compact view) */}
          {!compact && (
            <div className="mt-2 text-xs">
              {product.stock && product.stock > 0 ? (
                <span className="text-green-600">In Stock</span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
