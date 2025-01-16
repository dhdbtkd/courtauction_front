import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import RootStyleRegistry from './emotion';

import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: '법원 경매',
    description: '법원 경매',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <RootStyleRegistry>{children}</RootStyleRegistry>
            </body>
        </html>
    );
}
