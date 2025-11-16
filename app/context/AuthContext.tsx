'use client';

import { useSession, signOut } from 'next-auth/react';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    name: string;
    email: string;
    image: string;
}

interface AuthContetType {
    user: User | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
}

const AuthContext = createContext<AuthContetType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    // 🔥 세션 만료 또는 비로그인 상태 자동 이동 처리
    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut({ redirect: false }); // NextAuth 세션 정리
            router.replace('/signin'); // 로그인 페이지로 이동
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user) {
            setUser({
                name: session.user.name || '',
                email: session.user.email || '',
                image: session.user.image || '',
            });
        } else {
            setUser(null);
        }
    }, [session]);

    return <AuthContext.Provider value={{ user, status }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
