import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import NaverProvider from 'next-auth/providers/naver';

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID || '',
            clientSecret: process.env.NAVER_CLIENT_SECRET || '',
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log(`user : ${user} \n account : ${account} \n profile : ${profile}`);
            console.log(user)
            // 특정 조건에서 로그인 거부
            if (profile?.email?.includes('blockedomain.com')) {
                return false;
            }
            return true;
        }
    },
    pages: {
        signIn: '/signin',
        error: '/auth/error',
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    debug: process.env.NODE_ENV === 'development'
});
console.log('naver', process.env.NAVER_CLIENT_ID, process.env.NAVER_CLIENT_SECRET)

export { handler as GET, handler as POST };