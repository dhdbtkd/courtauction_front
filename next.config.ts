import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.courtauction.go.kr',
            },
            {
                // 구글 로그인 시 프로필 이미지
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                // 네이버 로그인 시 프로필 이미지
                protocol: 'https',
                hostname: 'phinf.pstatic.net',
            },
            {
                // 매물
                protocol: 'http',
                hostname: 'oracle.artchive.in',
            },
        ],
    },
};

export default nextConfig;
