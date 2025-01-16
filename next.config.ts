import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.courtauction.go.kr',
            },
        ],
    },
};

export default nextConfig;
