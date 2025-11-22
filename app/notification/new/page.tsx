'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Slider, Checkbox } from '@heroui/react';
import { Select, SelectItem, Input, Button, Spinner } from '@heroui/react';
import { Bell, List, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import NotificationRuleCard from './components/NotificationRuleCard';
import { Sido, Sigu, NotificationRule, NotificationChannel } from '../../types/notification';
import { Icon } from '@iconify/react';
import NotificationEditModal from './components/NotificationEditModal';
import NotificationChannels from './components/NotificationChannels';
import AlertCreator from './components/AlertCreator';
import DashboardStats from './components/DashboardStats';
import ViewMatchesModal from './components/ViewMatchesModal';

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
    if (value >= 10000) {
        const num = value / 10000;
        return Number.isInteger(num) ? `${num}억` : `${num.toFixed(1)}억`;
    }
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

    const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]); // 0만원~20억
    const [areaRange, setAreaRange] = useState<[number, number]>([0, 300]); // 0~300m²
    const [noPriceLimit, setNoPriceLimit] = useState(true);
    const [noAreaLimit, setNoAreaLimit] = useState(true);

    const [viewRuleId, setViewRuleId] = useState<string | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const [rules, setRules] = useState<NotificationRule[]>([]);
    const [rulesLoading, setRulesLoading] = useState(true);

    const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const handleEditOpen = (rule: NotificationRule) => {
        setEditingRule(rule);
        setIsEditOpen(true);
    };

    const handleViewMatches = (ruleId: string) => {
        setViewRuleId(ruleId);
        setIsViewOpen(true);
    };

    const handleRuleUpdated = (updated: NotificationRule) => {
        setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    };
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
            console.log('🚀 ~ fetchRules ~ data:', data);

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
        console.log('🚀 ~ handleSubmit ~ body:', body);
        // return;
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

    const handleEdit = async (rule: NotificationRule) => {
        const res = await fetch(`/api/notification/${rule.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: rule.name,
                category: rule.category,
                sido_code: rule.sido_code,
                sigu_code: rule.sigu_code,
                price_min: rule.price_min,
                max_price: rule.price_max,
                area_min: rule.area_min,
                area_max: rule.area_max,
                keyword: rule.keyword,
                enabled: rule.enabled,
            }),
        });

        if (!res.ok) {
            alert('업데이트 실패');
            return;
        }

        const updated = await res.json();
        console.log('업데이트 완료:', updated);
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
            <DashboardStats />
            <NotificationChannels
                telegramConnected={telegramConnected}
                telegramLoading={telegramLoading}
                handleTelegramConnect={handleTelegramConnect}
                onRefresh={fetchNotificationChannels} // ✅ 모달 내 성공 후 갱신
            />

            {/* --- 2. 알림 조건 추가 --- */}
            <AlertCreator sidos={sidos} siguList={siguList} onSubmit={handleSubmit} loading={formLoading} />

            {/* --- 3. 알림 목록 --- */}
            <div className="space-y-2 md:space-y-4 mx-2 md:mx-0">
                <h2 className="flex items-center gap-2 text-xl font-semibold max-lg:text-sm">나의 알림</h2>

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
                            onEdit={handleEditOpen}
                            onView={handleViewMatches}
                        />
                    ))
                )}
            </div>
            <ViewMatchesModal ruleId={viewRuleId} isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} />

            <NotificationEditModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                rule={editingRule}
                sidos={sidos}
                siguList={siguList}
                onUpdated={handleRuleUpdated}
            />
        </div>
    );
}
