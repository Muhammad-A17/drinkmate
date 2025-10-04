const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable bundle analysis
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Add bundle analyzer in production
      if (process.env.ANALYZE === 'true') {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: './bundle-analysis.html',
          })
        );
      }
    }
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
