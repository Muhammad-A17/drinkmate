import { MetadataRoute } from 'next';

/**
 * Generate a Web App Manifest for PWA support
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DrinkMate - Premium Soda Makers & Flavors',
    short_name: 'DrinkMate',
    description: 'Create delicious carbonated beverages at home with DrinkMate.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#00a8e8',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    orientation: 'portrait',
    categories: ['shopping', 'home', 'food', 'drinks'],
    prefer_related_applications: false,
  };
}
