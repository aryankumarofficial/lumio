import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
    transpilePackages: ['@repo/ui'],
    output: 'standalone',
    async rewrites() {
        return [{
            source: "/api/:path*",
            destination: "https://lumio-api.aryanak9163.workers.dev/:path*",
        }]
    }
}

export default nextConfig