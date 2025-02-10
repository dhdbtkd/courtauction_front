'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { IoMdLogOut, IoMdLogIn } from 'react-icons/io';
import { FaBell } from 'react-icons/fa';

import styled from '@emotion/styled';
import SetAlarmModal from './SetAlarmModal';
import { useState } from 'react';

import { Regions } from '../page';
interface HeaderProps {
    regions: Regions | null;
}

const Button = styled.button`
    background-color: #4d4d4d;
    border-radius: 0.5rem;
    color: #ffffff;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    margin: 0.5rem;
    cursor: pointer;
    &:hover {
        background-color: #141414;
    }
    display: flex;
    align-items: center;
    justify-content: center;
`;

export default function Header(props: HeaderProps) {
    const [isModalOpen, setModalOpen] = useState(false);

    const { user, status } = useAuth();
    const { data: session } = useSession();

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (!user) {
        return <p>Please sign in.</p>;
    }

    return (
        <>
            <SetAlarmModal
                regions={props.regions}
                isOpen={isModalOpen}
                closeModal={() => {
                    setModalOpen(false);
                }}
            ></SetAlarmModal>
            <div className="flex justify-between items-center w-full">
                <div className="flex flex-col">
                    {user?.image && (
                        <div className="w-16 h-16 relative">
                            <Image
                                className="rounded-full z-0 w-auto h-auto"
                                src={user.image}
                                alt="logo"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    )}

                    <div>안녕하세요 {user ? user?.name : '손님'}님</div>
                </div>
                <div>
                    {user ? (
                        <div className="flex item justify-center">
                            <Button
                                onClick={() => {
                                    setModalOpen(true);
                                }}
                            >
                                <FaBell className="mr-2" />
                                알림 설정
                            </Button>
                            <Button onClick={() => signOut()}>
                                <IoMdLogOut className="mr-2" />
                                로그아웃
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={() => signIn()}>
                            <IoMdLogIn className="mr-2" />
                            로그인
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
