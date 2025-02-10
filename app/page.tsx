'use client';
import { useEffect, useState } from 'react';
import { Buttons } from './Button';
import { Auction } from './types/Auction';
import { AuctionRow } from './components/Auction';
import styled from '@emotion/styled';
import Header from './components/Header';

// const Header = styled.h1`
//     font-size: 1.5rem;
//     font-weight: 700;
//     margin-bottom: 1rem;
//     text-align: center;
// `;
interface Sido {
    id: number;
    sido_code: number;
    sido_name: string;
}
interface Sigu extends Pick<Sido, 'sido_code' | 'sido_name'> {
    id: number;
    sigu_code: number;
    sigu_name: string;
}

export interface Regions {
    sigu: Sigu[];
    sido: Sido[];
}

export default function Home() {
    const [auctions, setAuctions] = useState([]);
    const [regions, setRegions] = useState<Regions | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const fetchCategories = async (category: string) => {
            try {
                const response = await fetch(`/api/category/${category}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch auctions');
                }
                const data = await response.json();
                console.log('🚀 ~ fetchCategories ~ data:', data);
                return data;
            } catch (error) {
                setError(error.message);
            }
        };
        const fetchAuctions = async () => {
            try {
                const response = await fetch('/api/auctions');
                if (!response.ok) {
                    throw new Error('Failed to fetch auctions');
                }
                const data = await response.json();
                setAuctions(data);
            } catch (error) {
                setError(error.message);
            }
        };
        const fetchData = async () => {
            try {
                const [sidos, sigus] = await Promise.all([fetchCategories('sido'), fetchCategories('sigu')]);
                setRegions({
                    sido: sidos,
                    sigu: sigus,
                });
            } catch (error) {
                console.log('error', error);
            }
        };
        fetchData();
        fetchAuctions();
    }, []);
    useEffect(() => {
        console.log('Updated regions:', regions);
    }, [regions]); // regions가 변경될 때 실행

    if (error) {
        return <div>Error: {error}</div>;
    }
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            {/* <Header>법원 경매 매물</Header> */}
            <Header regions={regions}></Header>
            <ul>
                <li className="grid grid-cols-11 gap-2 text-xs py-0.5 border-b border-gray-300 my-0.5">
                    <div className="col-span-2">사진</div>
                    <div className="mx-2">담당</div>
                    <div className="mx-2">번호</div>
                    <div className="mx-2 col-span-2">주소</div>

                    <div className="mx-2">면적</div>
                    <div className="mx-2">감정가</div>
                    <div className="mx-2">최저 낙찰가</div>
                    <div className="mx-2 text-center">상태</div>

                    <div className="mx-2">등록일</div>
                </li>
                {auctions.map((auction: Auction) => (
                    <AuctionRow key={auction.id} auction={auction} />
                ))}
            </ul>
            <Buttons />
        </div>
    );
}
