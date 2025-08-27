"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";
import { shopAPI } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  Heart, 
  Share2, 
  ChevronRight,
  Star,
  Check
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import ProductImageGallery from "../../../components/product/ProductImageGallery";
import RelatedProducts from "../../../components/product/RelatedProducts";
import ProductReviews from "../../../components/product/ProductReviews";
import ProductFeatures from "../../../components/product/ProductFeatures";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Dynamic export to prevent static optimization
export const dynamic = "force-dynamic";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const router = useRouter();
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await shopAPI.getProductBySlug(params.slug);
        if (data && data.product) {
          console.log("Product data:", data.product);
          setProduct(data.product);
        } else {
          router.push("/shop");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        router.push("/shop");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug, router]);

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product._id,
        name: product.name,
        price: product.salePrice || product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : "/images/placeholder.png",
        quantity,
      });
      toast.success("Product added to cart!");
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && (product?.stock ? newQuantity <= product.stock : true)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <PageLayout currentPage="shop">
        <div className="container mx-auto py-16 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#12d6fa]" />
          <span className="ml-2 text-gray-600">Loading product...</span>
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout currentPage="shop">
        <div className="container mx-auto py-16 text-center min-h-[50vh]">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/shop")} className="bg-[#12d6fa] hover:bg-[#0fb8d9] transition-colors">
            Return to Shop
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <Suspense fallback={
      <div className="container mx-auto py-16 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#12d6fa]" />
        <span className="ml-2 text-gray-600">Loading product...</span>
      </div>
    }>
      <PageLayout currentPage="shop">
        <div className="container mx-auto py-8 px-4">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 mb-8">
            <button onClick={() => router.push("/")} className="hover:text-[#12d6fa] transition-colors">
              Home
            </button>
            <ChevronRight className="w-4 h-4 mx-2" />
            <button onClick={() => router.push("/shop")} className="hover:text-[#12d6fa] transition-colors">
              Shop
            </button>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div>
              <ProductImageGallery 
                images={product.images && product.images.length > 0 
                  ? product.images 
                  : ["/images/placeholder.png"]}
                activeIndex={activeImageIndex}
                setActiveIndex={setActiveImageIndex}
              />
            </div>
            
            {/* Product Details */}
            <div className="space-y-6">
              {/* Product badges */}
              <div className="flex flex-wrap gap-2 mb-2">
                {product.isNew && (
                  <Badge className="bg-green-500 text-white hover:bg-green-600">New</Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="bg-amber-500 text-white hover:bg-amber-600">Best Seller</Badge>
                )}
                {product.salePrice && product.salePrice < product.price && (
                  <Badge className="bg-red-500 text-white hover:bg-red-600">Sale</Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
              
              {/* Pricing */}
              <div className="flex items-center">
                {product.salePrice && product.salePrice < product.price ? (
                  <>
                    <span className="text-2xl font-bold text-gray-800">${product.salePrice.toFixed(2)}</span>
                    <span className="ml-2 text-lg text-gray-500 line-through">${product.price.toFixed(2)}</span>
                    <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-md">
                      {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-gray-800">${product.price.toFixed(2)}</span>
                )}
              </div>
              
              {/* Rating */}
              <div className="flex items-center">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i}
                      className={`w-4 h-4 ${i < (product.rating || 0) 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {product.rating || 4.5} ({product.reviews?.length || 0} reviews)
                </span>
              </div>
              
              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 
                    "Experience the premium quality and exceptional performance of our product. " + 
                    "Designed for durability and ease of use, it's perfect for everyday needs."}
                </p>
              </div>
              
              {/* Availability */}
              <div className="flex items-center">
                {product.stock > 0 ? (
                  <>
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-green-700">
                      In Stock 
                      {product.stock < 10 && product.stock > 0 && ` (Only ${product.stock} left)`}
                    </span>
                  </>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </div>
              
              {/* Quantity and Add to Cart */}
              <div className="pt-6 space-y-4">
                <div className="flex items-center">
                  <span className="text-gray-700 mr-4">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button 
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-center w-12">{quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={product.stock && quantity >= product.stock}
                      className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={handleAddToCart}
                    disabled={!product.stock || product.stock <= 0}
                    className="flex-1 bg-[#12d6fa] hover:bg-[#0fb8d9] text-white transition-colors py-6"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button 
                    variant="outline" 
                    className="px-4 border-gray-300 hover:bg-gray-100 transition-colors"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="px-4 border-gray-300 hover:bg-gray-100 transition-colors"
                    aria-label="Share product"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Additional info */}
                <div className="space-y-2 pt-4">
                  <div className="flex text-sm">
                    <span className="text-gray-500 w-24">SKU:</span>
                    <span className="text-gray-800">{product.sku || `DM-${product._id.substring(0, 8)}`}</span>
                  </div>
                  <div className="flex text-sm">
                    <span className="text-gray-500 w-24">Category:</span>
                    <span className="text-gray-800">{product.category?.name || "Uncategorized"}</span>
                  </div>
                  <div className="flex text-sm">
                    <span className="text-gray-500 w-24">Tags:</span>
                    <span className="text-gray-800">
                      {product.tags?.length > 0 
                        ? product.tags.join(", ") 
                        : "No tags"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Tabs */}
          <div className="mb-16">
            <Tabs defaultValue="features" className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
                <TabsTrigger value="features">Features & Specs</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
              </TabsList>
              <TabsContent value="features" className="pt-6">
                <ProductFeatures product={product} />
              </TabsContent>
              <TabsContent value="reviews" className="pt-6">
                <ProductReviews productId={product._id} reviews={product.reviews || []} />
              </TabsContent>
              <TabsContent value="shipping" className="pt-6">
                <div className="space-y-6 text-gray-700">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Shipping Information</h3>
                    <p className="mb-4">
                      We ship all products within 1-2 business days after your order is placed. Delivery times may vary depending on your location:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Standard Shipping: 3-5 business days</li>
                      <li>Express Shipping: 1-2 business days</li>
                      <li>International Shipping: 7-14 business days</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Return Policy</h3>
                    <p className="mb-4">
                      We stand behind our products and want you to be completely satisfied with your purchase. If you're not satisfied, here's how you can return your items:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Returns accepted within 30 days of delivery</li>
                      <li>Item must be in original condition and packaging</li>
                      <li>Refunds will be processed within 5-7 business days after we receive your return</li>
                      <li>Shipping costs are non-refundable unless the item arrived damaged or defective</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Related Products */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-8">You May Also Like</h2>
            <RelatedProducts currentProductId={product._id} category={product.category?._id} />
          </div>
        </div>
      </PageLayout>
    </Suspense>
  );
}
