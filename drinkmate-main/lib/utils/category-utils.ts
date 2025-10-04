/**
 * Utility functions for handling product categories
 */

/**
 * Extracts the category name from a product category field
 * Handles both string and object formats
 */
export function getCategoryName(category: string | { _id: string; name: string; slug: string } | undefined): string {
  if (!category) {
    return 'Product';
  }

  if (typeof category === 'string') {
    return category;
  }

  if (category.name) {
    return category.name;
  }

  // If category is an object with only _id, try to map it to a known category name
  if (category._id) {
    const categoryMap: Record<string, string> = {
      '68c0583c2fc1cff30bf5c10c': 'CO2 Cylinders',
      'sodamakers': 'Sodamakers',
      'accessories': 'Accessories',
      'flavors': 'Flavors',
      'co2-cylinders': 'CO2 Cylinders',
      'flavor-bundles': 'Flavor Bundles',
      'accessory-bundles': 'Accessory Bundles'
    };
    return categoryMap[category._id] || 'Product';
  }

  return 'Product';
}

/**
 * Gets the category slug from a product category field
 */
export function getCategorySlug(category: string | { _id: string; name: string; slug: string } | undefined): string {
  if (!category) {
    return 'product';
  }

  if (typeof category === 'string') {
    return category.toLowerCase().replace(/\s+/g, '-');
  }

  if (category.slug) {
    return category.slug;
  }

  if (category.name) {
    return category.name.toLowerCase().replace(/\s+/g, '-');
  }

  return 'product';
}
