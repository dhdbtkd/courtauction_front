import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });

    // 이미 로그인된 상태에서 로그인 페이지 접근 시
    if (token && request.nextUrl.pathname === '/signin') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (!token && request.nextUrl.pathname !== '/signin') {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/signin', '/'],
};
