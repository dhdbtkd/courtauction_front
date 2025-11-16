// app/api/auth/[...nextauth]/route.ts
import { createClient } from '@supabase/supabase-js';
import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import NaverProvider from 'next-auth/providers/naver';

// ------------------------
// 🔥 1. NextAuth Options 타입 지정
// ------------------------
export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        }),
        NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID ?? '',
            clientSecret: process.env.NAVER_CLIENT_SECRET ?? '',
        }),
    ],

    callbacks: {
        // ------------------------
        // 🔥 2. signIn 타입 오류 해결
        // ------------------------
        async signIn({ user, account }) {
            if (account && user.email) {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );

                const userData = {
                    email: user.email,
                    name: user.name,
                    provider_name: account.provider,
                    provider_id: account.providerAccountId,
                    updated_at: new Date().toISOString(),
                };

                const { data, error } = await supabase
                    .from('users')
                    .upsert(userData, { onConflict: 'email' })
                    .select('id')
                    .single();

                if (error) {
                    console.error('Supabase upsert error:', error.message);
                    return false;
                }

                // UUID 저장 — user.id 타입 보완 필요
                if (data?.id) {
                    (user as any).id = data.id;
                }
            }
            return true;
        },

        // ------------------------
        // 🔥 3. JWT Callback 타입 오류 해결
        // ------------------------
        async jwt({ token, user }) {
            if (user && (user as any).id) {
                token.id = (user as any).id;
            }
            return token;
        },

        // ------------------------
        // 🔥 4. Session Callback 타입 오류 해결
        // ------------------------
        async session({ session, token }) {
            if (session.user && token.id) {
                (session.user as any).id = token.id as string;
            }
            return session;
        },
    },

    pages: {
        signIn: '/signin',
        error: '/auth/error',
    },

    // ------------------------
    // 🔥 5. jwt.secret 타입 오류 해결
    // ------------------------
    session: {
        strategy: 'jwt',
    },

    jwt: {
        secret: process.env.JWT_SECRET ?? '',
    },

    debug: process.env.NODE_ENV === 'development',
};

// ------------------------
// 🔥 6. NextAuth Handler 타입 문제 해결
// ------------------------
const handler = NextAuth(authOptions);

// Next.js App Router 규칙에 맞게 export
export { handler as GET, handler as POST };
