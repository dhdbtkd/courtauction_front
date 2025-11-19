import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
    const token = await getToken({ req: request });
    const { pathname } = request.nextUrl;

    // ✅ 로그인한 상태에서 /signin 접근 시 홈으로 이동
    if (token && pathname === '/signin') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // ✅ 비로그인 상태에서 signin 외 페이지 접근 시 signin으로 이동
    if (!token && pathname !== '/signin') {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    return NextResponse.next();
}

// 여기서 signin을 제외하면 안됨!!! → 제외하면 middleware가 signin 페이지를 못봄.
export const config = {
    matcher: [
        '/((?!api/auth|_next/static|_next/image|favicon.ico|images|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)',
    ],
};
