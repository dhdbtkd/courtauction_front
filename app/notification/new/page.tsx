'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Slider, Checkbox } from '@heroui/react';
import { Select, SelectItem, Input, Button, Spinner } from '@heroui/react';
import { Bell, List, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import NotificationRuleCard from './components/NotificationRuleCard';
import { Sido, Sigu, NotificationRule, NotificationChannel } from './types/notification';

// 매물 유형 데이터
const propertyTypes = [
    { key: '전체', name: '전체' },
    { key: '아파트', name: '아파트' },
    { key: '오피스텔', name: '오피스텔' },
    { key: '빌라', name: '빌라' },
    { key: '주택', name: '주택' },
];

// 💰 숫자를 단위별로 표시하는 유틸 (만원→억 단위 변환)
const formatPrice = (value: number): string => {
    if (value >= 10000) return `${(value / 10000).toFixed(1)}억`; // 1억 = 10000만원
    return `${value.toLocaleString()}만원`;
};

export default function NotificationRulePage() {
    const [sidos, setSidos] = useState<Sido[]>([]);
    const [siguList, setSiguList] = useState<Sigu[]>([]);
    const [regionsLoading, setRegionsLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);

    const [telegramConnected, setTelegramConnected] = useState<boolean | null>(null);
    const [telegramLoading, setTelegramLoading] = useState(true);

    const [name, setName] = useState('');
    const [keyword, setKeyword] = useState('');
    const [selectedSido, setSelectedSido] = useState<string | null>(null);
    const [selectedSigu, setSelectedSigu] = useState<string | null>(null);
    const [category, setCategory] = useState('전체');

    const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]); // 0만원~20억
    const [areaRange, setAreaRange] = useState<[number, number]>([0, 300]); // 0~300m²
    const [noPriceLimit, setNoPriceLimit] = useState(false);
    const [noAreaLimit, setNoAreaLimit] = useState(false);

    const [rules, setRules] = useState<NotificationRule[]>([]);
    const [rulesLoading, setRulesLoading] = useState(true);

    // ✅ Telegram 상태 확인
    const fetchNotificationChannels = async () => {
        setTelegramLoading(true);
        try {
            const res = await fetch('/api/notification/channels');
            if (res.ok) {
                const data: NotificationChannel[] = await res.json();
                const telegramChannel = data.find((ch) => ch.type === 'telegram' && ch.enabled);
                setTelegramConnected(!!telegramChannel);
            } else if (res.status === 401) {
                setTelegramConnected(false);
                toast.error('로그인이 필요합니다.');
            } else {
                toast.error('알림 채널 정보를 불러오지 못했습니다.');
            }
        } catch {
            setTelegramConnected(false);
        } finally {
            setTelegramLoading(false);
        }
    };

    const handleTelegramConnect = async () => {
        try {
            const res = await fetch('/api/telegram/link', { method: 'POST' });
            const data = await res.json();
            if (data.telegram_link) {
                window.open(data.telegram_link, '_blank');
                toast.info('텔레그램 앱에서 봇을 시작해주세요.');
            } else toast.error('텔레그램 링크 생성 실패');
        } catch {
            toast.error('텔레그램 연동 중 오류가 발생했습니다.');
        }
    };

    // --- 데이터 로드 ---
    const fetchRegions = async () => {
        setRegionsLoading(true);
        try {
            const [sidosRes, sigusRes] = await Promise.all([fetch('/api/category/sido'), fetch('/api/category/sigu')]);
            const [sidosData, sigusData] = await Promise.all([sidosRes.json(), sigusRes.json()]);
            setSidos(sidosData);
            setSiguList(sigusData);
        } catch {
            toast.error('지역 정보를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setRegionsLoading(false);
        }
    };

    const fetchRules = async () => {
        setRulesLoading(true);
        try {
            const res = await fetch('/api/notification');
            if (res.status === 401) {
                toast.error('로그인이 필요합니다.');
                setRules([]);
                return;
            }
            if (!res.ok) {
                setRules([]); // ❗ map 에러 방지
                return;
            }

            const data = await res.json();

            if (Array.isArray(data)) {
                setRules(data);
            } else {
                console.warn('알림 목록 API가 배열이 아닌 값을 반환:', data);
                setRules([]); // ❗ 안전 처리
            }
        } catch (err) {
            console.error(err);
            setRules([]);
        } finally {
            setRulesLoading(false);
        }
    };

    useEffect(() => {
        fetchRegions();
        fetchRules();
        fetchNotificationChannels();
    }, []);

    const filteredSigus = siguList.filter((s) => s.sido_code === selectedSido);
    const sortedSigus = [...filteredSigus].sort((a, b) => a.sigu_name.localeCompare(b.sigu_name, 'ko-KR'));
    // --- 폼 제출 ---
    const handleSubmit = async () => {
        if (!name.trim()) return toast.error('알림 이름을 입력해주세요.');
        if (!selectedSido) return toast.error('시/도를 선택해주세요.');
        if (!selectedSigu) return toast.error('구/군을 선택해주세요.');

        const body = {
            name,
            category: category === '전체' ? null : category,
            sido_code: selectedSido,
            sigu_code: selectedSigu,
            keyword: keyword || null,
            price_min: noPriceLimit ? null : priceRange[0] * 10_000,
            price_max: noPriceLimit ? null : priceRange[1] * 10_000,
            area_min: noAreaLimit ? null : areaRange[0],
            area_max: noAreaLimit ? null : areaRange[1],
        };

        setFormLoading(true);
        try {
            const res = await fetch('/api/notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const newRule = await res.json();
            setRules((prev) => [newRule, ...prev]);
            toast.success('알림이 저장되었습니다!');
        } catch {
            toast.error('저장 중 오류가 발생했습니다.');
        } finally {
            setFormLoading(false);
        }
    };

    // --- 토글 / 삭제 핸들러 ---
    const handleToggleRule = async (id: string) => {
        const prev = [...rules];
        setRules((p) => p.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
        const rule = prev.find((r) => r.id === id);
        if (!rule) return;
        try {
            await fetch(`/api/notification/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !rule.enabled }),
            });
        } catch {
            setRules(prev);
            toast.error('상태 변경 실패');
        }
    };

    const handleDeleteRule = async (id: string) => {
        const prev = [...rules];
        setRules((p) => p.filter((r) => r.id !== id));
        try {
            await fetch(`/api/notification/${id}`, { method: 'DELETE' });
            toast.success('알림이 삭제되었습니다.');
        } catch {
            setRules(prev);
            toast.error('삭제 실패');
        }
    };

    return (
        <div className="max-w-2xl mx-auto my-10 space-y-8">
            {/* --- 1. 텔레그램 연동 --- */}
            <Card className="shadow-md rounded-2xl max-xl:m-3">
                <CardBody className="flex flex-col items-center gap-4 py-6">
                    <MessageCircle className="text-primary w-6 h-6" />
                    {telegramLoading ? (
                        <Spinner color="primary" />
                    ) : telegramConnected ? (
                        <p className="text-green-700 font-semibold">텔레그램 연동 완료!</p>
                    ) : (
                        <>
                            <p className="text-gray-600 text-center md:text-sm text-xs">
                                텔레그램을 연동하면 새 매물 알림을 실시간으로 받을 수 있습니다.
                            </p>
                            <Button color="primary" onPress={handleTelegramConnect}>
                                텔레그램 연동하기
                            </Button>
                        </>
                    )}
                </CardBody>
            </Card>

            {/* --- 2. 알림 조건 추가 --- */}
            <Card className="shadow-md rounded-2xl max-xl:m-3 ">
                <CardHeader className="flex items-center gap-2">
                    <Bell className="text-primary max-xl:w-4 max-xl:h-4" />
                    <h2 className="font-semibold text-sm xl:text-lg">새 알림 조건 추가</h2>
                </CardHeader>
                <CardBody className="flex flex-col gap-6 max-xl:text-xs overflow-hidden">
                    {regionsLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Spinner color="primary" />
                            <span className="ml-2 text-sm text-gray-600">지역 정보를 불러오는 중...</span>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="알림 이름"
                                    placeholder="예: 강남 아파트 알림"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    isRequired
                                    size="sm"
                                />
                                <Input
                                    label="키워드 (선택)"
                                    placeholder="예: 래미안, 아크로"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    size="sm"
                                />
                                <Select
                                    label="시/도"
                                    selectedKeys={selectedSido ? new Set([selectedSido]) : new Set()}
                                    onSelectionChange={(keys) => {
                                        const value = Array.from(keys)[0];
                                        setSelectedSido(value ? String(value) : null);
                                    }}
                                    items={sidos}
                                    size="sm"
                                >
                                    {(item) => <SelectItem key={item.sido_code}>{item.sido_name}</SelectItem>}
                                </Select>
                                <Select
                                    label="구/군"
                                    size="sm"
                                    selectedKeys={selectedSigu ? new Set([selectedSigu]) : new Set()}
                                    onSelectionChange={(keys) => {
                                        const value = Array.from(keys)[0];
                                        setSelectedSigu(value ? String(value) : null);
                                    }}
                                    isDisabled={!selectedSido}
                                    items={sortedSigus}
                                >
                                    {(item) => <SelectItem key={item.sigu_code}>{item.sigu_name}</SelectItem>}
                                </Select>

                                <Select
                                    label="매물 유형"
                                    selectedKeys={new Set([category])}
                                    onSelectionChange={(keys) => {
                                        const value = Array.from(keys)[0];
                                        if (value) setCategory(String(value));
                                    }}
                                    items={propertyTypes}
                                    size="sm"
                                >
                                    {(item) => <SelectItem key={item.key}>{item.name}</SelectItem>}
                                </Select>
                            </div>

                            {/* 💰 가격 범위 */}
                            <div className="max-lg:text-xs">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">가격 범위</label>
                                    <Checkbox
                                        isSelected={noPriceLimit}
                                        onChange={(e) => setNoPriceLimit(e.target.checked)}
                                        color="primary"
                                        size="sm"
                                    >
                                        제한 없음
                                    </Checkbox>
                                </div>
                                <Slider
                                    step={1000}
                                    maxValue={20000}
                                    value={priceRange}
                                    onChange={(v) => setPriceRange(v as [number, number])}
                                    isDisabled={noPriceLimit}
                                    aria-label="가격 범위"
                                    size="sm"
                                />
                                {!noPriceLimit && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formatPrice(priceRange[0])} ~ {formatPrice(priceRange[1])}
                                    </p>
                                )}
                            </div>

                            {/* 📐 면적 범위 */}
                            <div className="max-xl:textxs">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">면적 범위 (㎡)</label>
                                    <Checkbox
                                        size="sm"
                                        isSelected={noAreaLimit}
                                        onChange={(e) => setNoAreaLimit(e.target.checked)}
                                        color="primary"
                                    >
                                        제한 없음
                                    </Checkbox>
                                </div>
                                <Slider
                                    step={1}
                                    maxValue={300}
                                    value={areaRange}
                                    onChange={(v) => setAreaRange(v as [number, number])}
                                    isDisabled={noAreaLimit}
                                    aria-label="면적 범위"
                                    size="sm"
                                />
                                {!noAreaLimit && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {areaRange[0]}㎡ ~ {areaRange[1]}㎡
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </CardBody>
                <CardFooter>
                    <Button color="primary" fullWidth onPress={handleSubmit} isDisabled={regionsLoading || formLoading}>
                        {formLoading ? '저장 중...' : '알림 조건 저장'}
                    </Button>
                </CardFooter>
            </Card>

            {/* --- 3. 알림 목록 --- */}
            <div className="space-y-4 max-xl:m-3">
                <h2 className="flex items-center gap-2 text-xl font-semibold max-lg:text-sm">
                    <List className="text-gray-700" />
                    등록된 알림 조건
                </h2>

                {rulesLoading ? (
                    <Card>
                        <CardBody className="flex justify-center items-center py-8">
                            <Spinner color="primary" />
                            <span className="ml-2 text-sm text-gray-600">목록을 불러오는 중...</span>
                        </CardBody>
                    </Card>
                ) : rules.length === 0 ? (
                    <Card>
                        <CardBody>
                            <p className="text-center text-gray-500">등록된 알림 조건이 없습니다.</p>
                        </CardBody>
                    </Card>
                ) : (
                    rules.map((rule) => (
                        <NotificationRuleCard
                            key={rule.id}
                            rule={rule}
                            sidos={sidos}
                            siguList={siguList}
                            onToggle={handleToggleRule}
                            onDelete={handleDeleteRule}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
