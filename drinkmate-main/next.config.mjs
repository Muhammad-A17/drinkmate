/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security: Enable strict mode
  reactStrictMode: true,
  
  // Performance: Font optimization is now handled automatically in Next.js 15
  
  // Fix lockfile warning by setting the correct root
  outputFileTracingRoot: new URL('.', import.meta.url).pathname,
  
  // Security: Disable X-Powered-By header
  poweredByHeader: false,
  
  // Security: Enable security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' 
              ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://localhost:3000 https://api.cloudinary.com https://www.youtube.com https://drinkmates.onrender.com ws://localhost:*; media-src 'self' https://www.youtube.com https://res.cloudinary.com; frame-src 'self' https://www.youtube.com; object-src 'self' data:; base-uri 'self'; form-action 'self';"
              : "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.youtube.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://localhost:3000 https://api.cloudinary.com https://www.youtube.com https://drinkmates.onrender.com ws://localhost:*; media-src 'self' https://www.youtube.com https://res.cloudinary.com; frame-src 'self' https://www.youtube.com; object-src 'self' data:; base-uri 'self'; form-action 'self';",
          },
        ],
      },
    ];
  },
  
  // Security: Content Security Policy
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/:path*`,
      },
      // SEO friendly URLs - convert dynamic pages to clean URLs
      {
        source: '/products/:slug',
        destination: '/shop/:slug',
      },
      {
        source: '/cylinder/:slug',
        destination: '/co2/:slug',
      },
      {
        source: '/article/:slug',
        destination: '/blog/:slug',
      },
    ];
  },
  
  // Development settings (disable in production)
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  
  // Image optimization with security
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    qualities: [75, 80, 85, 90, 95, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drinkmates.vercel.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drinkmates.onrender.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
    ],
  },
  
  // Security: Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Performance optimizations
  compress: true,
  
  // Security: Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // SEO: Redirects for common misspellings and old URLs
  async redirects() {
    return [
      {
        source: '/drink-mate',
        destination: '/',
        permanent: true,
      },
      {
        source: '/drinkmate',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sodamaker',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/soda-maker',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/flavors',
        destination: '/shop/flavors',
        permanent: true,
      },
      {
        source: '/cylinder',
        destination: '/co2',
        permanent: true,
      },
      {
        source: '/cylinders',
        destination: '/co2',
        permanent: true,
      },
      {
        source: '/refills',
        destination: '/refill-cylinder',
        permanent: true,
      },
      {
        source: '/about-us',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/testimonial',
        destination: '/testimonials',
        permanent: true,
      },
      {
        source: '/reviews',
        destination: '/testimonials',
        permanent: true,
      },
      {
        source: '/blogs',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/news',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/articles',
        destination: '/blog',
        permanent: true,
      },
    ];
  },
  
  // Security: Strict mode for webpack
  webpack: (config, { dev, isServer }) => {
    // Allow eval in development for hot reloading
    if (dev) {
      config.devtool = 'eval-cheap-module-source-map';
    }
    
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      };
    }
    return config;
  },
}

export default nextConfig
