import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ClientProviders from '@/ClientProviders';
import Header from './components/Header';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'ZoopZoop - 줍줍',
    description: 'ZoopZoop - 줍줍',
    openGraph: {
        title: 'ZoopZoop - 줍줍',
        description: '내 집을 ZoopZoop !',
        url: 'https://courtauction-front.vercel.app',
        images: [
            {
                url: 'https://courtauction-front.vercel.app/og_image.png',
                width: 1200,
                height: 630,
                alt: '대표 이미지',
            },
        ],
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ClientProviders>
                    <Header />
                    {children}
                </ClientProviders>
            </body>
        </html>
    );
}
