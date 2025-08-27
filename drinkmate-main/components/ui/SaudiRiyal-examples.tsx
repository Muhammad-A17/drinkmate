import React from 'react';
import SaudiRiyal from './SaudiRiyal';

/**
 * Examples of how to use the SaudiRiyal component across the website
 * This file demonstrates various usage patterns and can be used as a reference
 */

// Example 1: Product Card Price
export const ProductPriceExample: React.FC = () => (
  <div className="product-card">
    <h3>Product Name</h3>
    <div className="price-section">
      <span className="text-lg font-bold">
        <SaudiRiyal amount={599.00} size="lg" />
      </span>
      <span className="text-sm text-gray-500 line-through ml-2">
        <SaudiRiyal amount={799.00} size="sm" />
      </span>
    </div>
  </div>
);

// Example 2: Shopping Cart Total
export const CartTotalExample: React.FC = () => (
  <div className="cart-summary">
    <div className="flex justify-between items-center">
      <span>Subtotal:</span>
      <span><SaudiRiyal amount={1234.56} /></span>
    </div>
    <div className="flex justify-between items-center">
      <span>Shipping:</span>
      <span><SaudiRiyal amount={0} /></span>
    </div>
    <div className="flex justify-between items-center font-bold text-lg">
      <span>Total:</span>
      <span><SaudiRiyal amount={1234.56} size="lg" /></span>
    </div>
  </div>
);

// Example 3: Admin Dashboard Stats
export const AdminStatsExample: React.FC = () => (
  <div className="admin-stats grid grid-cols-3 gap-4">
    <div className="stat-card">
      <h4>Today's Sales</h4>
      <div className="text-2xl font-bold text-green-600">
        <SaudiRiyal amount={15420.75} size="xl" />
      </div>
    </div>
    <div className="stat-card">
      <h4>Monthly Revenue</h4>
      <div className="text-2xl font-bold text-blue-600">
        <SaudiRiyal amount={456789.12} size="xl" />
      </div>
    </div>
    <div className="stat-card">
      <h4>Average Order</h4>
      <div className="text-2xl font-bold text-purple-600">
        <SaudiRiyal amount={234.56} size="xl" />
      </div>
    </div>
  </div>
);

// Example 4: Order History
export const OrderHistoryExample: React.FC = () => (
  <div className="order-history">
    <div className="order-item flex justify-between items-center p-4 border-b">
      <div>
        <span className="font-medium">Order #12345</span>
        <span className="text-sm text-gray-500 ml-2">Delivered</span>
      </div>
      <span className="font-bold">
        <SaudiRiyal amount={299.99} />
      </span>
    </div>
    <div className="order-item flex justify-between items-center p-4 border-b">
      <div>
        <span className="font-medium">Order #12344</span>
        <span className="text-sm text-gray-500 ml-2">Processing</span>
      </div>
      <span className="font-bold">
        <SaudiRiyal amount={599.00} />
      </span>
    </div>
  </div>
);

// Example 5: Product Grid
export const ProductGridExample: React.FC = () => (
  <div className="product-grid grid grid-cols-1 md:grid-cols-3 gap-6">
    {[
      { name: 'Product 1', price: 99.99, originalPrice: 149.99 },
      { name: 'Product 2', price: 199.99, originalPrice: null },
      { name: 'Product 3', price: 299.99, originalPrice: 399.99 }
    ].map((product, index) => (
      <div key={index} className="product-card border rounded-lg p-4">
        <h3 className="font-medium mb-2">{product.name}</h3>
        <div className="price-section">
          <span className="text-lg font-bold text-green-600">
            <SaudiRiyal amount={product.price} size="lg" />
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through ml-2">
              <SaudiRiyal amount={product.originalPrice} size="sm" />
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
);

// Example 6: Checkout Form
export const CheckoutFormExample: React.FC = () => (
  <div className="checkout-form">
    <div className="form-group">
      <label>Card Number</label>
      <input type="text" placeholder="1234 5678 9012 3456" />
    </div>
    <div className="form-group">
      <label>Amount to Charge</label>
      <div className="text-xl font-bold text-center p-4 bg-gray-50 rounded">
        <SaudiRiyal amount={1234.56} size="xl" />
      </div>
    </div>
  </div>
);

// Example 7: Responsive Price Display
export const ResponsivePriceExample: React.FC = () => (
  <div className="responsive-price">
    {/* Mobile: Small size */}
    <div className="md:hidden">
      <SaudiRiyal amount={599.00} size="sm" className="text-green-600" />
    </div>
    
    {/* Desktop: Large size */}
    <div className="hidden md:block">
      <SaudiRiyal amount={599.00} size="xl" className="text-green-600" />
    </div>
  </div>
);

// Example 8: Price Range
export const PriceRangeExample: React.FC = () => (
  <div className="price-range">
    <span className="text-sm text-gray-600">Price Range:</span>
    <div className="flex items-center gap-2">
      <span className="font-medium">
        <SaudiRiyal amount={50.00} size="sm" />
      </span>
      <span className="text-gray-400">-</span>
      <span className="font-medium">
        <SaudiRiyal amount={500.00} size="sm" />
      </span>
    </div>
  </div>
);

// Example 9: Discount Display
export const DiscountExample: React.FC = () => (
  <div className="discount-display">
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Save:</span>
      <span className="text-lg font-bold text-green-600">
        <SaudiRiyal amount={100.00} size="lg" />
      </span>
    </div>
    <div className="text-xs text-gray-500">
      Original: <SaudiRiyal amount={699.00} size="sm" />
    </div>
  </div>
);

// Example 10: Currency Converter (if needed)
export const CurrencyConverterExample: React.FC = () => (
  <div className="currency-converter">
    <div className="input-group">
      <label>USD Amount</label>
      <input type="number" placeholder="100" />
    </div>
    <div className="conversion-result">
      <span className="text-lg font-bold">
        <SaudiRiyal amount={375.00} size="lg" />
      </span>
              <span className="text-sm text-gray-500 ml-2">(Approx. 1 USD = 3.75 ﷼)</span>
    </div>
  </div>
);

export default {
  ProductPriceExample,
  CartTotalExample,
  AdminStatsExample,
  OrderHistoryExample,
  ProductGridExample,
  CheckoutFormExample,
  ResponsivePriceExample,
  PriceRangeExample,
  DiscountExample,
  CurrencyConverterExample
};
