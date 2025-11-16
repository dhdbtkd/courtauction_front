'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { User } from 'lucide-react';
// ✅ 1. next-auth/react에서 훅과 함수 임포트
import { useSession, signIn, signOut } from 'next-auth/react';

// ❌ 2. isLoggedIn prop 제거
// interface HeaderProps {
//     isLoggedIn?: boolean;
// }

// const Header: React.FC<HeaderProps> = ({ isLoggedIn = true }) => {
const Header: React.FC = () => {
    // ✅ 3. useSession 훅으로 세션 상태 가져오기
    const { data: session, status } = useSession();
    const isLoggedIn = status === 'authenticated';
    const isLoading = status === 'loading';

    return (
        <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="w-full max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
                {/* 로고 및 메인 네비게이션 */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-2xl font-bold text-blue-600">
                        Auction
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-base font-semibold text-gray-700 hover:text-blue-600">
                            매물 검색
                        </Link>
                        <Link
                            href="/notification/new"
                            className="text-base font-semibold text-gray-700 hover:text-blue-600"
                        >
                            알림 설정
                        </Link>
                    </nav>
                </div>

                {/* 사용자 메뉴 */}
                <div className="flex items-center gap-4">
                    {/* ✅ 4. 로딩 중일 때 UI (선택 사항) */}
                    {isLoading && <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse" />}

                    {/* ✅ 5. 로딩이 끝난 후 상태에 따라 UI 렌더링 */}
                    {!isLoading && (
                        <>
                            {isLoggedIn ? (
                                <>
                                    <Link
                                        href="/mypage"
                                        className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1.5"
                                    >
                                        <User className="w-4 h-4" />
                                        {/* 세션에서 사용자 이름 표시 (선택 사항) */}
                                        {session.user?.name || '마이페이지'}
                                    </Link>
                                    <Button
                                        color="secondary"
                                        variant="light"
                                        size="sm"
                                        // ✅ 6. 로그아웃 함수 연결 (클릭 시 홈으로 이동)
                                        onPress={() => signOut({ callbackUrl: '/' })}
                                    >
                                        로그아웃
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        color="primary"
                                        variant="light"
                                        size="sm"
                                        // ✅ 7. 로그인 함수 연결 (NextAuth 페이지로 이동)
                                        onPress={() => signIn()}
                                    >
                                        로그인 & 회원가입
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
