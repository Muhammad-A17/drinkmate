import React, { useState, useEffect } from 'react';
import ProductBadges, { createBadge } from './ProductBadges';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isLimited?: boolean;
  discount?: number;
  tags: string[];
}

interface PremiumShopPageProps {
  products: Product[];
}

const PremiumShopPage: React.FC<PremiumShopPageProps> = ({ products }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem('drinkmates-wishlist');
    const savedRecent = localStorage.getItem('drinkmates-recently-viewed');

    if (savedWishlist) {
      setWishlistItems(JSON.parse(savedWishlist));
    }
    if (savedRecent) {
      setRecentlyViewed(JSON.parse(savedRecent));
    }
  }, []);

  const handleAddToWishlist = (product: Product) => {
    if (!wishlistItems.find(item => item.id === product.id)) {
      const updated = [...wishlistItems, product];
      setWishlistItems(updated);
      localStorage.setItem('drinkmates-wishlist', JSON.stringify(updated));
    }
  };

  const handleProductView = (product: Product) => {
    const updated = [product, ...recentlyViewed.filter(p => p.id !== product.id)].slice(0, 10);
    setRecentlyViewed(updated);
    localStorage.setItem('drinkmates-recently-viewed', JSON.stringify(updated));
  };

  const getProductBadges = (product: Product) => {
    const badges = [];

    if (product.isBestseller) {
      badges.push(createBadge('bestseller'));
    }
    if (product.isNew) {
      badges.push(createBadge('new'));
    }
    if (product.isLimited) {
      badges.push(createBadge('limited'));
    }
    if (product.discount && product.discount > 20) {
      badges.push(createBadge('flash', `-${product.discount}%`));
    }
    if (product.rating >= 4.5) {
      badges.push(createBadge('premium'));
    }

    return badges;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Premium Drink Collection</h1>
              <p className="text-gray-600 mt-1">Discover our finest selection of premium beverages</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-xl">
                <span className="font-medium">Wishlist ({wishlistItems.length})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recently Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentlyViewed.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => handleProductView(product)}
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover"
                    />
                    <ProductBadges badges={getProductBadges(product)} size="sm" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                    <p className="text-lg font-bold text-gray-900 mt-1">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const badges = getProductBadges(product);
            const isInWishlist = wishlistItems.some(item => item.id === product.id);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <ProductBadges badges={badges} />

                  {/* Wishlist Button */}
                  <button
                    onClick={() => handleAddToWishlist(product)}
                    className={`absolute top-3 right-3 w-10 h-10 rounded-full shadow-lg transition-all duration-200 ${
                      isInWishlist
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/90 text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                    aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <svg className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2">{product.name}</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{product.category}</span>
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm text-gray-600 ml-1">({product.reviews})</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      product.inStock
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Add to Cart
                    </button>
                    <button
                      className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-200"
                      aria-label="Share product"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommendations Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.slice(0, 6).map((product) => (
              <div
                key={`rec-${product.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => handleProductView(product)}
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover"
                  />
                  <ProductBadges badges={getProductBadges(product)} size="sm" />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                  <p className="text-lg font-bold text-gray-900 mt-1">${product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumShopPage;