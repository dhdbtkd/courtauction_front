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
    pages: {
        signIn: '/signin',
        error: '/auth/error',
    },
    debug: process.env.NODE_ENV === 'development'
});
console.log('naver', process.env.NAVER_CLIENT_ID, process.env.NAVER_CLIENT_SECRET)

export { handler as GET, handler as POST };