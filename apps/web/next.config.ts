import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
    transpilePackages: ['@repo/ui'],
    output: 'standalone',
    async rewrites() {
        return [{
            source: "/api/:path*",
            destination: "https://lumio-api-ufj1.onrender.com/:path*",
        }]
    }
}

export default nextConfig