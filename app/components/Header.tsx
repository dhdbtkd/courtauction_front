'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { User, Menu } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'motion/react';

const Header: React.FC = () => {
    const { data: session, status } = useSession();
    const isLoggedIn = status === 'authenticated';
    const isLoading = status === 'loading';

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* HEADER */}
            <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="w-full max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
                    {/* Left: Logo + Desktop Nav */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-2xl font-bold text-blue-600">
                            Bidly
                        </Link>

                        {/* Desktop Navigation */}
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

                    {/* Right: Desktop User Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {isLoading && <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse" />}

                        {!isLoading && (
                            <>
                                {isLoggedIn ? (
                                    <>
                                        <Link
                                            href="/mypage"
                                            className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1.5"
                                        >
                                            <User className="w-4 h-4" />
                                            {session.user?.name || '마이페이지'}
                                        </Link>
                                        <Button
                                            color="secondary"
                                            variant="light"
                                            size="sm"
                                            onPress={() => signOut({ callbackUrl: '/' })}
                                        >
                                            로그아웃
                                        </Button>
                                    </>
                                ) : (
                                    <Button color="primary" variant="light" size="sm" onPress={() => signIn()}>
                                        로그인 & 회원가입
                                    </Button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Mobile: Hamburger */}
                    <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setIsOpen(true)}>
                        <Menu className="w-6 h-6 text-gray-700" />
                    </button>
                </div>
            </header>

            {/* MOBILE SLIDE MENU */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Dimmed Background */}
                        <motion.div
                            className="fixed inset-0 bg-black/40 z-[60]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Slide Menu Panel */}
                        <motion.aside
                            className="fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-[70] flex flex-col p-6"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <h2 className="text-xl font-bold mb-6">메뉴</h2>

                            {/* Menu Links */}
                            <nav className="flex flex-col gap-4 text-lg font-medium text-gray-700">
                                <Link href="/" onClick={() => setIsOpen(false)}>
                                    매물 검색
                                </Link>
                                <Link href="/notification/new" onClick={() => setIsOpen(false)}>
                                    알림 설정
                                </Link>

                                {isLoggedIn && (
                                    <Link
                                        href="/mypage"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-2"
                                    >
                                        <User className="w-4 h-4" />
                                        {session.user?.name || '마이페이지'}
                                    </Link>
                                )}
                            </nav>

                            {/* Divider */}
                            <div className="border-t my-6" />

                            {/* Login / Logout */}
                            <div>
                                {isLoggedIn ? (
                                    <Button
                                        color="secondary"
                                        fullWidth
                                        onPress={() => {
                                            setIsOpen(false);
                                            signOut({ callbackUrl: '/' });
                                        }}
                                    >
                                        로그아웃
                                    </Button>
                                ) : (
                                    <Button
                                        color="primary"
                                        fullWidth
                                        onPress={() => {
                                            setIsOpen(false);
                                            signIn();
                                        }}
                                    >
                                        로그인 & 회원가입
                                    </Button>
                                )}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
