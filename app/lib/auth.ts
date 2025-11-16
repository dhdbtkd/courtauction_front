import { AuthOptions } from 'next-auth'; // 타입 임포트
import GoogleProvider from 'next-auth/providers/google';
import NaverProvider from 'next-auth/providers/naver';
import { createClient } from '@/utils/supabase/server'; // Supabase 클라이언트 임포트

// ✅ authOptions 객체를 여기로 이동
export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID || '',
            clientSecret: process.env.NAVER_CLIENT_SECRET || '',
        }),
    ],
    callbacks: {
        // ✅ Supabase와 연동하는 'signIn' 콜백
        async signIn({ user, account }) {
            if (account && user.email) {
                // Supabase 클라이언트는 함수 내부에서 생성해야 할 수 있습니다.
                // (참고: createClient가 쿠키를 필요로 한다면 이 방식이 안 맞을 수 있으나,
                // server-side service_role 클라이언트라면 문제 없습니다.)
                const supabase = await createClient();

                const userData = {
                    email: user.email,
                    name: user.name,
                    provider_name: account.provider,
                    provider_id: account.providerAccountId,
                    updated_at: new Date().toISOString(),
                };

                const { error } = await supabase.from('users').upsert(userData, { onConflict: 'email' });

                if (error) {
                    console.error('Supabase upsert error during sign in:', error.message);
                    return false; // DB 에러 시 로그인 실패
                }
            }
            return true;
        },
    },
    pages: {
        signIn: '/signin',
        error: '/auth/error',
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    debug: process.env.NODE_ENV === 'development',
};
