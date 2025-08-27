/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drinkmates.onrender.com',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
  // Disable static export for proper handling by @netlify/plugin-nextjs
  output: 'standalone',
}

export default nextConfig
