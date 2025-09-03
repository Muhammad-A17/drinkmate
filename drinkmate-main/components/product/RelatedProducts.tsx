"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { shopAPI } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

interface RelatedProductsProps {
  currentProductId: string;
  category?: string;
  limit?: number;
}

export default function RelatedProducts({
  currentProductId,
  category,
  limit = 4
}: RelatedProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // If we have a category, get products from that category
        let data;
        if (category) {
          data = await shopAPI.getProductsByCategory(category);
        } else {
          // Otherwise get featured products
          data = await shopAPI.getProducts({ featured: true });
        }

        if (data && data.products) {
          // Filter out the current product and limit the results
          const filteredProducts = data.products
            .filter((p: any) => p._id !== currentProductId)
            .slice(0, limit);
          
          setProducts(filteredProducts);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, category, limit]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#12d6fa]" />
        <span className="ml-2 text-gray-600">Loading related products...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">No related products found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}