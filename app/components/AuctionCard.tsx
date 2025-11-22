'use client';

import Image from 'next/image';
import { CalendarDays, MapPin, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Chip } from '@heroui/react';

type AuctionMatchCardProps = {
    auction: any; // notifications_log에서 받은 auction:auction_id(*) 결과
};

export default function AuctionCard({ auction }: AuctionMatchCardProps) {
    const router = useRouter();

    if (!auction) return null;

    const formatPrice = (price: number | null | undefined): string => {
        if (!price) return '가격 정보 없음';

        const 억 = Math.floor(price / 100000000);
        const 만 = Math.floor((price % 100000000) / 10000);

        if (억 && 만) return `${억}억 ${만}만원`;
        if (억) return `${억}억`;
        if (만) return `${만}만원`;
        return `${price.toLocaleString()}원`;
    };

    const formatDate = (date: string | null | undefined) => {
        if (!date) return '날짜 정보 없음';
        return new Date(date).toLocaleDateString('ko-KR');
    };

    const daysUntil = (dateStr: string) => {
        if (!dateStr) return '';
        const today = new Date();
        const target = new Date(dateStr);
        const diff = target.getTime() - today.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days > 0) return `D-${days}`;
        if (days === 0) return 'D-Day';
        return `D+${Math.abs(days)}`;
    };

    const extractTitle = (address: string | null) => {
        if (!address) return '주소 정보 없음';

        // 괄호 안 빌딩명 우선
        const bracket = address.match(/\((.*?)\)/);
        if (bracket) return bracket[1];

        // "○○아파트", "○○빌라" 형태 추출
        const apt = address.match(/([가-힣A-Za-z0-9]+(?:아파트|빌라))/);
        if (apt) return apt[1];

        // 기본: 앞 2~3단어 추출
        const parts = address.split(' ');
        return parts.slice(0, 3).join(' ');
    };

    return (
        <div className="shadow-sm rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition">
            {/* Top Thumbnail Section */}
            <div className="relative w-full h-48">
                <Image
                    src={auction.thumbnail_src || '/placeholder.jpg'}
                    alt="thumbnail"
                    fill
                    className="object-cover"
                />

                {/* D-Day Badge */}
                <div className="absolute top-2 right-2">
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full font-semibold shadow">
                        {daysUntil(auction.auction_date)}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 space-y-2">
                {/* Title */}
                <h3 className="text-base font-semibold text-gray-900">
                    {auction.buld_nm ? auction.buld_nm : extractTitle(auction.address)}
                </h3>

                {/* Minimum Price */}
                <div className="text-lg font-bold text-blue-600">
                    <span className="text-sm mr-1">최저</span>
                    {formatPrice(auction.minimum_price)}
                </div>

                {/* Estimated Price */}
                <p className="text-xs text-gray-500">감정가 {formatPrice(auction.estimated_price)}</p>

                {/* Full Address */}
                <div className="text-xs text-gray-700 mt-1 line-clamp-2">{auction.address}</div>

                {/* Area */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Building size={16} className="text-gray-400" />
                    {auction.area
                        ? `${auction.area.toFixed(1)}㎡ (전용 ${(auction.area / 3.3).toFixed(0)}평)`
                        : '면적 정보 없음'}
                    · {auction.category || '유형 없음'}
                </div>

                {/* Auction Date */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CalendarDays size={16} className="text-gray-400" />
                    입찰일: {formatDate(auction.auction_date)}
                </div>

                {/* Status */}
                <div className="pt-1">
                    <Chip color="primary" variant="flat" size="sm">
                        {auction.status || '상태 미정'}
                    </Chip>

                    {auction.failed_auction_count > 0 && (
                        <Chip color="danger" size="sm" variant="flat" className="ml-2">
                            {auction.failed_auction_count}회 유찰
                        </Chip>
                    )}
                </div>
            </div>
        </div>
    );
}
