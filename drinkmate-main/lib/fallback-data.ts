// Fallback data for when API requests fail
// This ensures the UI can still function when backend is unreachable

// Cylinder fallback data
export const fallbackCylinders = [
  {
    id: 'fallback-1',
    name: 'DrinkMate CO2 Cylinder (60L)',
    image: '/images/cylinders/drinkmate-60l.png',
    price: 29.99,
    originalPrice: 34.99,
    discount: 14,
    compatible: true,
    description: 'Official DrinkMate CO2 cylinder for all DrinkMate soda makers. Makes up to 60 liters of carbonated beverages.',
    brand: 'DrinkMate',
    type: 'Standard',
    capacity: '60L'
  },
  {
    id: 'fallback-2',
    name: 'DrinkMate CO2 Cylinder (130L)',
    image: '/images/cylinders/drinkmate-130l.png',
    price: 49.99,
    originalPrice: 59.99,
    discount: 17,
    compatible: true,
    description: 'Official DrinkMate large capacity CO2 cylinder. Makes up to 130 liters of carbonated beverages.',
    brand: 'DrinkMate',
    type: 'Large',
    capacity: '130L'
  },
  {
    id: 'fallback-3',
    name: 'Universal CO2 Cylinder (60L)',
    image: '/images/cylinders/universal-60l.png',
    price: 24.99,
    originalPrice: 29.99,
    discount: 17,
    compatible: true,
    description: 'Compatible CO2 cylinder for DrinkMate and other soda makers. Makes up to 60 liters of carbonated beverages.',
    brand: 'Universal',
    type: 'Standard',
    capacity: '60L'
  }
];

// Flavor fallback data
export const fallbackFlavors = [
  {
    id: 'flavor-fallback-1',
    name: 'Italian Strawberry',
    image: '/images/flavors/strawberry.png',
    price: 9.99,
    description: 'Natural Italian strawberry flavor for your carbonated drinks.',
    category: 'Fruit'
  },
  {
    id: 'flavor-fallback-2',
    name: 'Cola Classic',
    image: '/images/flavors/cola.png',
    price: 8.99,
    description: 'Classic cola flavor for an authentic soda experience.',
    category: 'Soda'
  },
  {
    id: 'flavor-fallback-3',
    name: 'Lemon Lime',
    image: '/images/flavors/lemon-lime.png',
    price: 7.99,
    description: 'Refreshing citrus flavor combining zesty lemon and lime.',
    category: 'Citrus'
  }
];

// Product fallback data
export const fallbackProducts = [
  {
    id: 'product-fallback-1',
    name: 'DrinkMate Carbonator',
    image: '/images/products/drinkmate-carbonator.png',
    price: 99.99,
    originalPrice: 129.99,
    discount: 23,
    category: 'Soda Makers',
    description: 'The original DrinkMate carbonator for all your sparkling beverage needs.'
  },
  {
    id: 'product-fallback-2',
    name: 'DrinkMate Glass Bottle (1L)',
    image: '/images/products/glass-bottle.png',
    price: 14.99,
    category: 'Accessories',
    description: 'Elegant glass bottle for your carbonated beverages.'
  }
];
