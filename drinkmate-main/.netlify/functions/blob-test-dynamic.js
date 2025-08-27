// Example Netlify function using @netlify/blobs with dynamic import (CommonJS compatible)
export async function handler(event, context) {
  try {
    // Dynamically import @netlify/blobs to avoid CommonJS/ES Module conflicts
    const { getStore } = await import('@netlify/blobs');

    // Initialize the blob store
    const store = getStore('my-store');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '@netlify/blobs v9.1.6 is working correctly with dynamic import!',
        timestamp: new Date().toISOString(),
        version: '9.1.6'
      })
    };
  } catch (error) {
    console.error('Error with @netlify/blobs:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to access blob store',
        details: error.message
      })
    };
  }
}
