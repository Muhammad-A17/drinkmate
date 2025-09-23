/**
 * Utility functions for handling image URLs safely
 */

/**
 * Safely gets an image URL from various sources
 * @param image - The image value (could be string, object, or null)
 * @param fallback - Fallback image URL
 * @returns A valid image URL string
 */
export function getImageUrl(image: any, fallback: string = '/placeholder.svg'): string {
  // If image is a string and not empty
  if (typeof image === 'string' && image.trim() !== '') {
    return image
  }
  
  // If image is an object with url property
  if (image && typeof image === 'object' && image.url && typeof image.url === 'string' && image.url.trim() !== '') {
    return image.url
  }
  
  // If image is an object with src property
  if (image && typeof image === 'object' && image.src && typeof image.src === 'string' && image.src.trim() !== '') {
    return image.src
  }
  
  // If image is an array and has first element
  if (Array.isArray(image) && image.length > 0) {
    const firstImage = image[0]
    if (typeof firstImage === 'string' && firstImage.trim() !== '') {
      return firstImage
    }
    if (firstImage && typeof firstImage === 'object' && firstImage.url && typeof firstImage.url === 'string' && firstImage.url.trim() !== '') {
      return firstImage.url
    }
  }
  
  return fallback
}

/**
 * Gets the best available image from a product
 * @param product - Product object with image properties
 * @param fallback - Fallback image URL
 * @returns A valid image URL string
 */
export function getProductImageUrl(product: any, fallback: string = '/placeholder.svg'): string {
  // Try images array first (usually higher quality)
  if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
    const imageUrl = getImageUrl(product.images[0], '')
    if (imageUrl !== '/placeholder.svg') {
      return imageUrl
    }
  }
  
  // Try single image property
  if (product?.image) {
    const imageUrl = getImageUrl(product.image, '')
    if (imageUrl !== '/placeholder.svg') {
      return imageUrl
    }
  }
  
  return fallback
}
