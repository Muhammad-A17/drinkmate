"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import PriceDisplay from "@/components/ui/PriceDisplay";
import { cn } from "@/lib/utils";

interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
}

interface EmptyCartStateProps {
  featuredProducts?: FeaturedProduct[];
}

/**
 * Component shown when the cart is empty
 */
const EmptyCartState: React.FC<EmptyCartStateProps> = ({ 
  featuredProducts = [] 
}) => {
  return (
    <div className="flex flex-col items-center py-12 px-4 text-center max-w-4xl mx-auto">
      <div className="bg-muted/30 p-8 rounded-full mb-6">
        <ShoppingCart className="w-12 h-12 text-muted-foreground" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Looks like you haven't added any products to your cart yet.
        Browse our products and find something you'll love!
      </p>
      
      <Button asChild size="lg" className="mb-16">
        <Link href="/shop">
          Start Shopping <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </Button>
      
      {featuredProducts.length > 0 && (
        <div className="w-full">
          <h3 className="text-xl font-semibold mb-6">Recommended Products</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map(product => (
              <Link 
                href={`/shop/${product.category}/${product.slug}`} 
                key={product.id}
                className="group hover:shadow-md transition-shadow duration-200 rounded-lg overflow-hidden border bg-card"
              >
                <div className="aspect-square relative">
                  <Image 
                    src={product.image} 
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <h4 className="font-medium group-hover:text-primary transition-colors mb-2 line-clamp-2">
                    {product.name}
                  </h4>
                  
                  <div className="flex justify-between items-center">
                    <PriceDisplay 
                      price={product.price}
                      originalPrice={product.originalPrice}
                      discount={product.discount}
                    />
                    
                    <div className="flex items-center text-amber-500">
                      <Star className="fill-current w-4 h-4" />
                      <span className="ml-1 text-sm">4.8</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmptyCartState;