/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Ensure we don't have issues with trailing slashes in static export
  trailingSlash: true,
}

module.exports = nextConfig
