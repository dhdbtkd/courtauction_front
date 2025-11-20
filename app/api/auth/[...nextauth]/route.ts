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
        async signIn({ user, account, profile }) {
            if (!account) return true;

            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const isNaver = account.provider === 'naver';
            const isGoogle = account.provider === 'google';

            // -----------------------------
            // 🔥 NAME
            // -----------------------------
            const name = isNaver ? (profile as any)?.response?.name : user.name || (profile as any)?.name;

            // -----------------------------
            // 🔥 NICKNAME
            // -----------------------------
            const nickname = isNaver ? (profile as any)?.response?.nickname : user.name || null;

            // -----------------------------
            // 🔥 EMAIL
            // -----------------------------
            const email =
                user.email ??
                (profile as any)?.email ??
                `${account.provider}-${account.providerAccountId}@noemail.oauth`;

            const userData = {
                email,
                name,
                nickname,
                provider_name: account.provider,
                provider_id: account.providerAccountId,
                updated_at: new Date().toISOString(),
            };

            console.log('🟡 userData:', userData);

            const { data, error } = await supabase
                .from('users')
                .upsert(userData, {
                    onConflict: 'provider_name,provider_id',
                })
                .select('id')
                .single();

            if (error) {
                console.error('Supabase upsert error:', error.message);
                return false;
            }

            if (data?.id) {
                (user as any).id = data.id;
            }

            return true;
        },

        // ------------------------
        // 🔥 3. JWT Callback 타입 오류 해결
        // ------------------------
        async jwt({ token, user, account, profile }) {
            if (user) {
                token.id = (user as any).id;

                const isNaver = account?.provider === 'naver';

                token.name = isNaver ? (profile as any)?.response?.name : user.name;

                token.nickname = isNaver ? (profile as any)?.response?.nickname : null;

                token.provider = account?.provider;
            }

            return token;
        },

        // ------------------------
        // 🔥 4. Session Callback 타입 오류 해결
        // ------------------------
        async session({ session, token }) {
            session.user.id = token.id as string;

            // name / nickname / provider 도 session.user 에 포함
            session.user.name = token.name as string;
            session.user.nickname = token.nickname as string;
            session.user.provider = token.provider as string;

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
