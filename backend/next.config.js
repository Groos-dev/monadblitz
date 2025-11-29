/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 启用 instrumentation hook
  experimental: {
    instrumentationHook: true,
  },
}

module.exports = nextConfig

