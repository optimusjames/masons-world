/** @type {import('next').NextConfig} */
const nextConfig = {
  // Let Next.js run as a proper app on Vercel (not static export)
  trailingSlash: false,
  experimental: {
    viewTransition: true,
  },
}

export default nextConfig
