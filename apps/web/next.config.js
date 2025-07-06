/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Transpile packages from the monorepo
  transpilePackages: ['@ror-trader/types', '@ror-trader/config'],
  // Custom webpack config if needed
  webpack: (config, { isServer }) => {
    // Fix for lucide-react icons
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    }
    return config
  },
}

module.exports = nextConfig
