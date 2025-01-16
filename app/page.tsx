'use client';
import { useEffect, useState } from 'react';
import { Buttons } from './Button';
import { Auction } from './types/Auction';
import { AuctionRow } from './components/Auction';
export default function Home() {
    const [auctions, setAuctions] = useState([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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

        fetchAuctions();
    }, []);
    if (error) {
        return <div>Error: {error}</div>;
    }
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            법원 경매 매물
            <ul>
                {auctions.map((auction: Auction) => (
                    <AuctionRow key={auction.id} auction={auction} />
                ))}
            </ul>
            <Buttons />
        </div>
    );
}
