"use client";

/**
 * Utility function to fetch data with automatic retries
 * Useful for API calls on free tier hosting services that may have cold starts
 * 
 * @param url The URL to fetch
 * @param options Fetch options
 * @param maxRetries Maximum number of retry attempts
 * @returns Promise with the fetch response
 */
export async function fetchWithRetry(url: string, options = {}, maxRetries = parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3') || 3) {
  let retries = 0;
  let lastError;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      // Return the response even if not ok, so caller can handle specific status codes
      return response;
    } catch (error) {
      lastError = error;
      retries++;
      console.log(`Retry attempt ${retries}/${maxRetries} for ${url} after error:`, error);
      
      // Exponential backoff: 1s, 2s, 4s...
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries - 1)));
    }
  }
  
  throw lastError || new Error(`Failed to fetch ${url} after ${maxRetries} retries`);
}

/**
 * Checks if an image URL is accessible
 * Useful for verifying if image resources are available before displaying
 * 
 * @param imageUrl The image URL to check
 * @param timeout Optional timeout in milliseconds
 * @returns Promise<boolean> indicating if the image is accessible
 */
export async function isImageAccessible(imageUrl: string, timeout = 5000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error(`Error checking image accessibility for ${imageUrl}:`, error);
    return false;
  }
}

/**
 * Creates a cache-busting URL by appending or updating a timestamp parameter
 * Useful when forcing reload of images or other resources
 * 
 * @param url The original URL
 * @returns URL with cache-busting parameter
 */
export function getCacheBustingUrl(url: string): string {
  const timestamp = new Date().getTime();
  return url.includes('?') 
    ? `${url}&_cb=${timestamp}` 
    : `${url}?_cb=${timestamp}`;
}
