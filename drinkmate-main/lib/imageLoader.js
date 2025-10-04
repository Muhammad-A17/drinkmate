/**
 * Custom image loader with timeout and retry logic
 * Handles Cloudinary image loading with proper error handling
 */

export default function imageLoader({ src, width, quality }) {
  // For Cloudinary images, use their transformation API for optimization
  if (src.includes('res.cloudinary.com')) {
    // Extract the base URL and transformation parameters
    const baseUrl = src.split('/upload/')[0] + '/upload/';
    const path = src.split('/upload/')[1];
    
    // Add Cloudinary transformations for optimization
    const transformations = [
      width ? `w_${width}` : 'w_auto',
      `q_${quality || 80}`,
      'f_auto', // Auto format selection
      'c_limit', // Limit dimensions
    ].join(',');
    
    return `${baseUrl}${transformations}/${path}`;
  }
  
  // For other images, return as-is
  return src;
}

/**
 * Image loader with retry logic and timeout handling
 * This function can be used for client-side image loading with fallbacks
 */
export async function loadImageWithRetry(src, maxRetries = parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS) || 3, timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(src, {
        signal: controller.signal,
        headers: {
          'Accept': 'image/*',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return response.url;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.warn(`Image load attempt ${attempt} failed for ${src}:`, error.message);
      
      if (attempt === maxRetries) {
        // Return fallback image on final failure
        return '/placeholder.svg';
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  return '/placeholder.svg';
}
