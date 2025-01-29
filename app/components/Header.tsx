import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { IoMdLogOut, IoMdLogIn } from 'react-icons/io';

import styled from '@emotion/styled';

const Button = styled.button`
    background-color: #f1f1f1;
    border-radius: 0.5rem;
    color: #333;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    margin: 0.5rem;
    cursor: pointer;
    &:hover {
        background-color: #e1e1e1;
    }
    display: flex;
    align-items: center;
    justify-content: center;
`;

export default function Header() {
    const { user, status } = useAuth();
    const { data: session } = useSession();
    console.log('🚀 ~ Header ~ session:', session);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (!user) {
        return <p>Please sign in.</p>;
    }

    return (
        <div className="flex justify-between items-center w-full">
            <div className="flex flex-col">
                {user?.image && (
                    <div className="w-16 h-16 relative">
                        <Image className="rounded-full" src={user.image} alt="logo" fill />
                    </div>
                )}

                <div>안녕하세요 {user ? user?.name : '손님'}님</div>
            </div>
            <div>
                {user ? (
                    <Button onClick={() => signOut()}>
                        <IoMdLogOut />
                        로그아웃
                    </Button>
                ) : (
                    <Button onClick={() => signIn()}>
                        <IoMdLogIn />
                        로그인
                    </Button>
                )}
            </div>
        </div>
    );
}
