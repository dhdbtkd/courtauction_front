'use client';

import styled from '@emotion/styled';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
import { SiNaver } from 'react-icons/si';

const Header = styled.h1`
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-align: center;
`;
const Button = styled.button`
    background-color: #f1f1f1;
    border: 1px solid #ccc;
    border-radius: 4px;
    color: #333;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    margin: 0.5rem;
    cursor: pointer;
    &:hover {
        background-color: #e1e1e1;
    }
`;
const LoginPage = () => {
    return (
        <div className="flex justify-center items-center flex-col p-20">
            <Header>법원 경매 모니터링</Header>
            <div className="text-sm my-5">서비스를 이용하기 위해 로그인해주세요</div>
            <div className="bg-zinc-100 p-10 rounded-xl shadow-lg">
                <div className="text-xs text-center">간편 로그인</div>
                <div className="flex flex-col">
                    <div
                        className="flex items-center justify-center mx-auto px-2 py-3 my-4 bg-white rounded-lg shadow hover:bg-gray-100 text-sm cursor-pointer w-80 overflow-hidden h-12"
                        onClick={() => signIn('google')}
                    >
                        <FcGoogle className="mr-3" />
                        구글 로그인
                    </div>
                    <div
                        className="flex items-center justify-center mx-auto px-2 py-3 my-4 bg-[#03c75A] text-white duration-300 rounded-lg shadow hover:bg-[rgb(39,156,92)] text-sm cursor-pointer w-80 overflow-hidden h-12"
                        onClick={() => signIn('naver')}
                    >
                        <SiNaver className="mr-3" />
                        네이버 로그인
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
