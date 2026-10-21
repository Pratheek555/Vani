import type { NextConfig } from 'next'

// Login, signup and the family setup page still live in the gateway, and so does the JSON API.
// Next only falls back to these rewrites when no page here matches, so a React page at /signup
// (or /app) takes over as soon as it exists.
const gateway = process.env.GATEWAY_URL ?? 'http://localhost:8787'

const nextConfig: NextConfig = {
  async rewrites() {
    return ['/login', '/signup', '/app', '/api/:path*'].map((source) => ({
      source,
      destination: `${gateway}${source}`,
    }))
  },
}

export default nextConfig
