/**
 * Script to clear the cart from localStorage
 * This will help users get fresh cart items with correct category names
 */

// Clear all cart-related localStorage entries
const cartKeys = [
  'drinkmate-cart',
  'drinkmate-cart-guest',
  'drinkmate-cart-undefined'
];

// Also clear any user-specific cart keys (we'll check for patterns)
const allKeys = Object.keys(localStorage);
const userCartKeys = allKeys.filter(key => key.startsWith('drinkmate-cart-'));

console.log('🧹 Clearing cart data...');

// Clear known cart keys
cartKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Cleared: ${key}`);
  }
});

// Clear user-specific cart keys
userCartKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`✅ Cleared: ${key}`);
});

console.log('🎉 Cart cleared! Refresh the page to see the changes.');
console.log('💡 Note: You may need to add products to cart again to see correct category names.');
