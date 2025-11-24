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
  },
  async headers() {
    return [
      {
        source: '/kml/:path*.kml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/vnd.google-earth.kml+xml',
          },
        ],
      },
    ]
  },
}

export default nextConfig
