'use client';
import React from 'react';
import { Auction } from '../types/Auction';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { MapPin, Building, Calendar, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

// 가격 포맷팅 함수
const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return '가격 정보 없음';

    const 억 = Math.floor(price / 100000000);
    const 만 = Math.floor((price % 100000000) / 10000);

    if (억 > 0 && 만 > 0) {
        return `${억}억 ${만.toLocaleString()}만원`;
    } else if (억 > 0) {
        return `${억}억`;
    } else if (만 > 0) {
        return `${만.toLocaleString()}만원`;
    }
    return `${price.toLocaleString()}원`;
};

// 날짜 포맷팅 함수
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '날짜 미정';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR');
    } catch (e) {
        return dateString;
    }
};

interface AuctionCardProps {
    auction: Auction;
}
function daysUntil(dateStr: string) {
    if (!dateStr) return '';
    const today = new Date();
    const target = new Date(dateStr);

    // 시간 차이(밀리초)
    const diff = target.getTime() - today.getTime();

    // 일수로 변환
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `D-${days}`;
    if (days === 0) return `오늘`;
    return `${Math.abs(days)}일 지남`;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
    const router = useRouter();

    const handleDetailClick = () => {
        router.push(`/auction/${auction.id}`);
    };

    const handleScrapClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('Scrap clicked for:', auction.id);
        alert('스크랩 기능은 준비 중입니다.');
    };

    const getStatusChipColor = (status: string | null) => {
        switch (status) {
            case '신건':
                return 'success';
            case '유찰':
                return 'warning';
            case '매각':
                return 'secondary';
            default:
                return 'default';
        }
    };

    // 주소 축약 (DB에 address_short가 없으므로 address에서 생성)
    const getShortAddress = (fullAddress: string | null): string => {
        if (!fullAddress) return '주소 정보 없음';
        const parts = fullAddress.split(' ');
        // 예: "서울 강남구 역삼동" (앞 3개 파트)
        return parts.slice(0, 3).join(' ');
    };

    return (
        // [수정됨] isPressable과 onClick 속성 제거
        <Card isHoverable className="w-full shadow-md border border-gray-100">
            <CardBody className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* 1. 이미지 (thumbnail_src로 변경) */}
                    <div className="md:col-span-2">
                        <img
                            src={auction.thumbnail_src || 'https://via.placeholder.com/300x200?text=No+Image'}
                            alt={auction.address || '경매 매물'}
                            className="rounded-lg object-cover w-full aspect-video"
                        />
                    </div>

                    {/* 2. 매물 정보 */}
                    <div className="md:col-span-7 flex flex-col justify-between h-full">
                        <div>
                            {/* address_short 대신 함수로 축약된 주소 표시 */}
                            <h3 className="text-base font-bold text-gray-800 mb-1">
                                {getShortAddress(auction.address)} {auction.category}
                            </h3>
                            <div className="flex items-baseline">
                                {/* minimum_price로 변경 */}
                                <p className="text-lg font-extrabold text-blue-600 mr-2">
                                    {formatPrice(auction.minimum_price)}
                                </p>
                                {/* estimated_price로 변경 */}
                                <p className="text-[0.7rem] text-gray-500 mt-1">
                                    감정가 {formatPrice(auction.estimated_price)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1.5 mt-3 text-xs">
                            <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{auction.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Building className="w-4 h-4 text-gray-400" />
                                {/* area로 변경 */}
                                <span>
                                    {auction.area ? `${auction.area}㎡ (${(auction.area / 3.3).toFixed(0)}평)` : ''} ·{' '}
                                    {auction.category}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>경매일: {formatDate(auction.auction_date)}</span>
                                {auction.auction_date && (
                                    <span className="text-xs text-gray-500">({daysUntil(auction.auction_date)})</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. 상태 및 버튼 */}
                    <div className="md:col-span-3 flex flex-col items-start md:items-end justify-between h-full">
                        <div className="flex items-center">
                            <div className="flex gap-2 mt-4 md:mt-0">
                                <Chip color={getStatusChipColor(auction.status)} variant="flat">
                                    {auction.status || '상태 미정'}
                                </Chip>
                                {/* failed_auction_count로 변경 */}
                                {(auction.failed_auction_count || 0) > 0 && (
                                    <Chip color="danger" variant="dot">
                                        {auction.failed_auction_count}회 유찰
                                    </Chip>
                                )}
                            </div>
                            {/* <button
                                onClick={handleScrapClick}
                                className="p-2 rounded-full hover:bg-red-50"
                                aria-label="스크랩"
                            >
                                <Heart className="w-6 h-6 text-gray-400 hover:text-red-500" />
                            </button> */}
                        </div>

                        {/* <Button color="primary" className="w-full md:w-auto mt-4" onClick={handleDetailClick}>
                            상세보기
                        </Button> */}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};
