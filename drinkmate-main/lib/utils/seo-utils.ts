/**
 * Utility functions for SEO optimization
 */

/**
 * Generate meta tags for a product page
 * @param product - Product data
 */
export function generateProductMeta(product: any) {
  const { name, description, price, images = [], category = '', brand = 'DrinkMate' } = product;
  
  // Generate a proper title with length limit
  const title = `${name} | ${brand} ${category}`.substring(0, 60);
  
  // Generate a proper description with length limit
  const shortDescription = description
    ? description.substring(0, 160)
    : `Buy ${name} from ${brand}. Premium quality ${category.toLowerCase()} for your home carbonation needs.`;
  
  // Keywords generation
  const keywords = [
    name,
    brand,
    category,
    'soda maker',
    'carbonated drinks',
    'CO2 cylinders',
    'home carbonation',
    'sparkling water',
  ].filter(Boolean);
  
  // Return structured data for the product
  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name,
    description: shortDescription,
    image: images,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: brand,
      },
    },
  };
  
  return {
    title,
    description: shortDescription,
    keywords,
    structuredData,
    ogImage: images[0] || '/images/default-product.jpg',
    ogType: 'product',
  };
}

/**
 * Generate meta tags for a blog post
 * @param post - Blog post data
 */
export function generateBlogMeta(post: any) {
  const { title, excerpt, content, image, author, date, tags = [] } = post;
  
  // Generate a proper title with length limit
  const formattedTitle = `${title} | DrinkMate Blog`.substring(0, 60);
  
  // Generate a proper description with length limit
  const shortDescription = excerpt
    ? excerpt.substring(0, 160)
    : content.substring(0, 160).replace(/(<([^>]+)>)/gi, '') + '...';
  
  // Keywords generation
  const keywords = [
    ...tags,
    'DrinkMate blog',
    'soda maker tips',
    'carbonation guide',
    'drink recipes',
  ].filter(Boolean);
  
  // Return structured data for the blog post
  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'BlogPosting',
    headline: title,
    description: shortDescription,
    image,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'DrinkMate',
      logo: {
        '@type': 'ImageObject',
        url: '/logo.png',
      },
    },
    datePublished: date,
    dateModified: date,
  };
  
  return {
    title: formattedTitle,
    description: shortDescription,
    keywords,
    structuredData,
    ogImage: image || '/images/default-blog.jpg',
    ogType: 'article',
  };
}

/**
 * Generate a slug from a string
 * @param text - Text to convert to a slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
    .trim();
}

/**
 * Format a URL for SEO
 * @param path - Path to format
 */
export function formatSeoUrl(path: string): string {
  // Remove trailing slashes
  const trimmedPath = path.endsWith('/') ? path.slice(0, -1) : path;
  
  // Ensure path starts with a slash
  return trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;
}

/**
 * Generate breadcrumb structured data
 * @param items - Breadcrumb items (name and URL)
 * @param baseUrl - Base URL of the site
 */
export function generateBreadcrumbs(items: Array<{ name: string; url: string }>, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Extract text content from HTML
 * @param html - HTML string
 */
export function extractTextFromHtml(html: string): string {
  return html.replace(/(<([^>]+)>)/gi, '').trim();
}

/**
 * Generate canonical URL
 * @param path - Current path
 * @param baseUrl - Base URL of the site
 */
export function generateCanonicalUrl(path: string, baseUrl: string): string {
  const cleanPath = path.split('?')[0]; // Remove query parameters
  return `${baseUrl}${formatSeoUrl(cleanPath)}`;
}

export default {
  generateProductMeta,
  generateBlogMeta,
  generateSlug,
  formatSeoUrl,
  generateBreadcrumbs,
  extractTextFromHtml,
  generateCanonicalUrl,
};
