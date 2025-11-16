'use client';

import { HeroUIProvider } from '@heroui/react';
import { AuthProvider } from './context/AuthContext';
import SessionProviderWrapper from '@/SessionProviderWrapper';
import RootStyleRegistry from './emotion';
import { ToastContainer, toast } from 'react-toastify';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <HeroUIProvider>
            <SessionProviderWrapper>
                <AuthProvider>
                    <RootStyleRegistry>{children}</RootStyleRegistry>
                    <ToastContainer />
                </AuthProvider>
            </SessionProviderWrapper>
        </HeroUIProvider>
    );
}
