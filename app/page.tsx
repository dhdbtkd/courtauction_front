'use client';
import { useEffect, useState } from 'react';
import { Auction } from '@/types/Auction';
import { AuctionCard } from '@/components/AuctionCard';
import { Select, SelectItem, Card, CardBody, Pagination, Input, Button, Slider } from '@heroui/react';
import Header from '@/components/Header';
import { MapPin, List, Banknote, Search } from 'lucide-react';

// 지역 인터페이스 정의
interface Sido {
    id: number;
    sido_code: string;
    sido_name: string;
}

interface Sigu extends Pick<Sido, 'sido_code'> {
    id: number;
    sigu_code: string;
    sigu_name: string;
}

export interface Regions {
    sigu: Sigu[];
    sido: Sido[];
}

// 가격대 상수 (단위: 만 원)
const MIN_PRICE = 0;
const MAX_PRICE = 100000; // 10억

// [수정됨] "전체" 옵션을 포함한 정적 데이터
const categories = [
    { key: '아파트', name: '아파트' },
    { key: '상가', name: '상가' },
    { key: '토지', name: '토지' },
    { key: '빌라', name: '빌라' },
    { key: '오피스텔', name: '오피스텔' },
];
const categoriesWithAll = [{ key: '', name: '전체' }, ...categories];

const statuses = [
    { key: '신건', name: '신건' },
    { key: '유찰', name: '유찰' },
    { key: '매각', name: '매각' },
];
const statusesWithAll = [{ key: '', name: '전체' }, ...statuses];

export default function Home() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [regions, setRegions] = useState<Regions | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchTermInput, setSearchTermInput] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        status: '',
        sido_code: '',
        sigu_code: '',
        min_price: MIN_PRICE,
        max_price: MAX_PRICE,
        searchTerm: '',
    });

    const [page, setPage] = useState(1);
    const limit = 10; // 페이지 당 매물 수
    const [totalCount, setTotalCount] = useState(0);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    useEffect(() => {
        const handler = setTimeout(() => {
            setFilters((f) => ({ ...f, searchTerm: searchTermInput }));
        }, 500); // 0.5초 지연

        return () => clearTimeout(handler);
    }, [searchTermInput]);

    // ... (fetchAuctions, fetchRegions, useEffect 등은 변경 없음) ...
    // 매물 조회 API 호출
    const fetchAuctions = async () => {
        try {
            const params = new URLSearchParams();

            // 필터 파라미터 추가
            if (filters.category) params.append('category', filters.category);
            if (filters.status) params.append('status', filters.status);
            if (filters.sido_code) params.append('sido_code', filters.sido_code);
            if (filters.sigu_code) params.append('sigu_code', filters.sigu_code);
            if (filters.searchTerm) params.append('search', filters.searchTerm);

            if (filters.min_price > MIN_PRICE) {
                params.append('minPrice', filters.min_price.toString());
            }
            if (filters.max_price < MAX_PRICE) {
                params.append('maxPrice', filters.max_price.toString());
            }

            params.append('page', page.toString());
            params.append('limit', limit.toString());

            const response = await fetch(`/api/auctions?${params.toString()}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '매물 정보를 불러오는데 실패했습니다.');
            }

            const data = await response.json();
            setAuctions(data.items || []);
            setTotalCount(data.total || 0);
        } catch (err: any) {
            setError(err.message);
        }
    };

    // 지역 정보 조회 (시도, 시군구)
    const fetchRegions = async () => {
        try {
            const [sidosRes, sigusRes] = await Promise.all([fetch('/api/category/sido'), fetch('/api/category/sigu')]);

            const [sidos, sigus] = await Promise.all([sidosRes.json(), sigusRes.json()]);

            // sigu_code는 이미 text 포맷이므로 정규화 불필요
            setRegions({ sido: sidos, sigu: sigus });
        } catch (err) {
            setError('지역 정보를 불러오는 중 오류가 발생했습니다.');
        }
    };

    // 필터 변경 시 1페이지로 초기화
    useEffect(() => {
        setPage(1);
    }, [
        filters.category,
        filters.status,
        filters.sido_code,
        filters.sigu_code,
        filters.min_price,
        filters.max_price,
        filters.searchTerm,
    ]);

    // filters 또는 page 변경 시 매물 자동 조회
    useEffect(() => {
        fetchAuctions();
    }, [filters, page]);

    // 컴포넌트 마운트 시 지역 정보 조회
    useEffect(() => {
        fetchRegions();
    }, []);

    function formatManwon(value: number) {
        if (!value) return '0원';

        const eok = Math.floor(value / 10000);
        const man = value % 10000;

        if (eok > 0 && man > 0) return `${eok}억 ${man}만원`;
        if (eok > 0 && man === 0) return `${eok}억`;
        if (eok === 0 && man > 0) return `${man}만원`;

        return `${value}만원`;
    }

    if (error) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <p className="text-red-600 text-lg">{error}</p>
            </div>
        );
    }

    const totalPages = Math.ceil(totalCount / limit);

    // [수정됨] 렌더링 로직 내에서 "전체" 옵션 동적 추가
    const filteredSigu =
        !filters.sido_code || filters.sido_code === '-1'
            ? regions?.sigu || []
            : regions?.sigu?.filter((s) => s.sido_code === filters.sido_code) || [];

    // Sido, Sigu 인터페이스에 맞게 "전체" 옵션 추가 (고유한 id/key 필요)
    const sidosWithAll: Sido[] = [{ id: -1, sido_code: '-1', sido_name: '전체' }, ...(regions?.sido || [])];

    const sigusWithAll: Sigu[] = [{ id: -1, sigu_code: '-1', sigu_name: '전체', sido_code: '-1' }, ...filteredSigu];

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <main className="w-full max-w-6xl mx-auto px-4 mt-8">
                <Card className="shadow-lg border border-gray-100">
                    <CardBody className="p-6">
                        <div className="mb-5">
                            <Input
                                type="text"
                                placeholder="지역명, 아파트명으로 검색하세요"
                                className="w-full"
                                size="lg"
                                startContent={<Search className="text-gray-400 w-5 h-5" />}
                                onChange={(e) => setSearchTermInput(e.target.value)}
                                value={searchTermInput}
                                aria-label="지역명, 아파트명으로 검색"
                            />
                        </div>

                        {/* --- [수정됨] Select 컴포넌트 --- */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* 1. 카테고리 Select */}
                            <Select
                                placeholder="카테고리 (전체)"
                                selectedKeys={[filters.category]}
                                onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                                items={categoriesWithAll}
                                aria-label="카테고리 선택"
                            >
                                {(item) => <SelectItem key={item.key}>{item.name}</SelectItem>}
                            </Select>

                            {/* 2. 상태 Select */}
                            <Select
                                placeholder="상태 (전체)"
                                selectedKeys={[filters.status]}
                                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                                items={statusesWithAll}
                                aria-label="상태 선택"
                            >
                                {(item) => <SelectItem key={item.key}>{item.name}</SelectItem>}
                            </Select>

                            {/* 3. 시/도 Select */}
                            <Select
                                placeholder="시/도 (전체)"
                                selectedKeys={[filters.sido_code]}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFilters((f) => ({
                                        ...f,
                                        sido_code: value,
                                        sigu_code: '', // 시 변경 시 시군구 초기화
                                    }));
                                }}
                                items={sidosWithAll}
                                aria-label="시/도 선택"
                            >
                                {(s) => <SelectItem key={s.sido_code}>{s.sido_name}</SelectItem>}
                            </Select>

                            {/* 4. 시/군/구 Select */}
                            <Select
                                placeholder="시/군/구 (전체)"
                                isDisabled={!filters.sido_code} // 시 선택 전 비활성화
                                selectedKeys={[filters.sigu_code]}
                                onChange={(e) => setFilters((f) => ({ ...f, sigu_code: e.target.value }))}
                                items={sigusWithAll}
                                aria-label="시/군/구 선택"
                            >
                                {(s) => <SelectItem key={s.sigu_code}>{s.sigu_name}</SelectItem>}
                            </Select>
                        </div>

                        {/* 가격대 슬라이더 (변경 없음) */}
                        <div className="mt-6">
                            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <Banknote className="w-4 h-4 mr-2 text-gray-500" />
                                가격대 (만 원)
                            </label>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 w-32 text-right">
                                    {formatManwon(filters.min_price)}
                                </span>
                                <Slider
                                    aria-label="가격대 (만 원)"
                                    minValue={MIN_PRICE}
                                    maxValue={MAX_PRICE}
                                    step={1000}
                                    value={[filters.min_price, filters.max_price]}
                                    onChange={(val) => {
                                        if (Array.isArray(val)) {
                                            setFilters((f) => ({
                                                ...f,
                                                min_price: Number(val[0]),
                                                max_price: Number(val[1]),
                                            }));
                                        }
                                    }}
                                    className="w-full"
                                    size="sm"
                                    color="primary"
                                />
                                <span className="text-sm text-gray-600 w-32 text-left">
                                    {filters.max_price === MAX_PRICE ? '10억+' : formatManwon(filters.max_price)}
                                </span>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* 매물 목록 (변경 없음) */}
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            매물 목록 <span className="text-blue-600">({totalCount.toLocaleString()}건)</span>
                        </h2>
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'list' ? 'solid' : 'flat'}
                                color="primary"
                                startContent={<List className="w-5 h-5" />}
                                onClick={() => setViewMode('list')}
                                size="sm"
                            >
                                리스트 보기
                            </Button>
                            <Button
                                variant={viewMode === 'map' ? 'solid' : 'flat'}
                                color="primary"
                                startContent={<MapPin className="w-5 h-5" />}
                                onClick={() => setViewMode('map')}
                                size="sm"
                            >
                                지도 보기
                            </Button>
                        </div>
                    </div>

                    {viewMode === 'list' ? (
                        <div className="grid grid-cols-1 gap-5">
                            {auctions.length > 0 ? (
                                auctions.map((a) => <AuctionCard key={a.id} auction={a} />)
                            ) : (
                                <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-sm">
                                    검색 조건에 맞는 매물이 없습니다.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-sm">
                            지도 뷰가 여기에 표시됩니다.
                        </div>
                    )}
                </div>

                {/* 페이지네이션 (변경 없음) */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <Pagination
                            page={page}
                            total={totalPages}
                            onChange={(newPage) => setPage(newPage)}
                            variant="flat"
                            color="primary"
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
