'use client';

import { Session } from 'inspector/promises';
import { SessionProvider, useSession } from 'next-auth/react';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
    name: string;
    email: string;
    image: string;
}

interface AuthContetType {
    user: User | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
}

//Context API를 사용하여 인증 상태를 관리하는 AuthContext를 생성합니다.
const AuthContext = createContext<AuthContetType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);

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

// interface AuthProps {
//     children: React.ReactNode;
// }

// export const AuthContext = ({ children }: AuthProps) => {
//     return <SessionProvider>{children}</SessionProvider>;
// };
