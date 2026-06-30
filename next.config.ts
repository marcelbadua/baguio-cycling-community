import type { NextConfig } from 'next'

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddhgkuueqnavjmsgnxys.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Declaring this silences the Turbopack/webpack conflict warning.
  // next-pwa's webpack config only runs in production builds anyway
  // (disabled in dev via the `disable` flag above).
  turbopack: {},
}

module.exports = withPWA(nextConfig)