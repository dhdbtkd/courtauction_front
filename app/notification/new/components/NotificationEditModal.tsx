'use client';

import { useEffect, useState } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Select,
    SelectItem,
    Slider,
    Checkbox,
    Spinner,
} from '@heroui/react';
import { toast } from 'react-toastify';
import { NotificationRule, Sido, Sigu } from '../../../types/notification';

const propertyTypes = [
    { key: '전체', name: '전체' },
    { key: '아파트', name: '아파트' },
    { key: '오피스텔', name: '오피스텔' },
    { key: '빌라', name: '빌라' },
    { key: '주택', name: '주택' },
];

const formatPrice = (value: number): string => {
    if (value >= 10000) {
        const num = value / 10000;
        return Number.isInteger(num) ? `${num}억` : `${num.toFixed(1)}억`;
    }
    return `${value.toLocaleString()}만원`;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    rule: NotificationRule | null;
    sidos: Sido[];
    siguList: Sigu[];
    onUpdated: (rule: NotificationRule) => void;
};

export default function NotificationEditModal({ isOpen, onClose, rule, sidos, siguList, onUpdated }: Props) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [keyword, setKeyword] = useState('');
    const [selectedSido, setSelectedSido] = useState<string | null>(null);
    const [selectedSigu, setSelectedSigu] = useState<string | null>(null);
    const [category, setCategory] = useState('전체');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
    const [areaRange, setAreaRange] = useState<[number, number]>([0, 300]);
    const [noPriceLimit, setNoPriceLimit] = useState(true);
    const [noAreaLimit, setNoAreaLimit] = useState(true);

    useEffect(() => {
        if (rule) {
            setName(rule.name);
            setKeyword(rule.keyword || '');
            setSelectedSido(rule.sido_code);
            setSelectedSigu(rule.sigu_code);
            setCategory(rule.category || '전체');
            setNoPriceLimit(!rule.price_min && !rule.price_max);
            setNoAreaLimit(!rule.area_min && !rule.area_max);

            setPriceRange([(rule.price_min ?? 0) / 10000, (rule.price_max ?? 200000) / 10000]);
            setAreaRange([rule.area_min ?? 0, rule.area_max ?? 300]);
        }
    }, [rule]);

    const filteredSigus = siguList.filter((s) => s.sido_code === selectedSido);

    const handleSave = async () => {
        if (!rule) return;
        if (!noPriceLimit && priceRange[0] === priceRange[1]) {
            toast.warning('가격 범위의 최소값과 최대값이 같을 수 없습니다.');
            setLoading(false);
            return;
        }
        if (!noAreaLimit && areaRange[0] === areaRange[1]) {
            toast.warning('면적 범위의 최소값과 최대값이 같을 수 없습니다.');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
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
                enabled: rule.enabled,
            };

            const res = await fetch(`/api/notification/${rule.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                toast.error('수정 실패');
                return;
            }

            const updated = await res.json();
            toast.success('알림이 수정되었습니다.');
            onUpdated(updated);
            onClose();
        } catch (e) {
            console.error(e);
            toast.error('수정 중 오류 발생');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="lg" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader>알림 수정</ModalHeader>
                <ModalBody className="space-y-4">
                    {!rule ? (
                        <div className="flex justify-center py-10">
                            <Spinner color="primary" />
                        </div>
                    ) : (
                        <>
                            <Input label="알림 이름" value={name} onChange={(e) => setName(e.target.value)} />
                            <Input label="키워드" value={keyword} onChange={(e) => setKeyword(e.target.value)} />

                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="시/도"
                                    selectedKeys={selectedSido ? new Set([selectedSido]) : new Set()}
                                    onSelectionChange={(keys) => setSelectedSido(String(Array.from(keys)[0] ?? null))}
                                    items={sidos}
                                >
                                    {(item) => <SelectItem key={item.sido_code}>{item.sido_name}</SelectItem>}
                                </Select>

                                <Select
                                    label="구/군"
                                    selectedKeys={selectedSigu ? new Set([selectedSigu]) : new Set()}
                                    onSelectionChange={(keys) => setSelectedSigu(String(Array.from(keys)[0] ?? null))}
                                    items={filteredSigus}
                                >
                                    {(item) => <SelectItem key={item.sigu_code}>{item.sigu_name}</SelectItem>}
                                </Select>

                                <Select
                                    label="매물 유형"
                                    selectedKeys={new Set([category])}
                                    onSelectionChange={(keys) => setCategory(String(Array.from(keys)[0] ?? '전체'))}
                                    items={propertyTypes}
                                >
                                    {(item) => <SelectItem key={item.key}>{item.name}</SelectItem>}
                                </Select>
                            </div>

                            {/* 가격 범위 */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-gray-700">가격 범위</label>
                                    <Checkbox
                                        isSelected={noPriceLimit}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setNoPriceLimit(checked);
                                            // ✅ 제한 없음 해제 시 기본값 세팅 (기존 값 없을 경우 1000만~2억)
                                            if (!checked && !priceRange[0] && !priceRange[1]) {
                                                setPriceRange([1000, 20000]);
                                            }
                                        }}
                                        color="primary"
                                    >
                                        제한 없음
                                    </Checkbox>
                                </div>

                                <Slider
                                    maxValue={200000}
                                    value={priceRange}
                                    onChange={(v) => setPriceRange(v as [number, number])}
                                    isDisabled={noPriceLimit}
                                    aria-label="가격 범위"
                                />

                                {/* 💬 값이 동일할 경우 안내문 */}
                                {!noPriceLimit && priceRange[0] === priceRange[1] ? (
                                    <p className="text-red-500 text-sm mt-1">⚠️ 원하는 가격을 조절해주세요.</p>
                                ) : (
                                    !noPriceLimit && (
                                        <p className="text-gray-500 text-sm mt-1">
                                            {formatPrice(priceRange[0])} ~ {formatPrice(priceRange[1])}
                                        </p>
                                    )
                                )}
                            </div>

                            {/* 면적 범위 */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-gray-700">면적 범위 (㎡)</label>
                                    <Checkbox
                                        isSelected={noAreaLimit}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setNoAreaLimit(checked);
                                            // 제한 없음 해제 시 기본값 설정
                                            if (!checked && !areaRange[0] && !areaRange[1]) {
                                                setAreaRange([10, 100]); // 10~100㎡
                                            }
                                        }}
                                        color="primary"
                                    >
                                        제한 없음
                                    </Checkbox>
                                </div>

                                <Slider
                                    maxValue={300}
                                    step={1}
                                    value={areaRange}
                                    onChange={(v) => setAreaRange(v as [number, number])}
                                    isDisabled={noAreaLimit}
                                    aria-label="면적 범위"
                                />

                                {/* 💬 동일값 경고 */}
                                {!noAreaLimit && areaRange[0] === areaRange[1] ? (
                                    <p className="text-red-500 text-sm mt-1">⚠️ 원하는 면적을 조절해주세요.</p>
                                ) : (
                                    !noAreaLimit && (
                                        <p className="text-gray-500 text-sm mt-1">
                                            {areaRange[0]}㎡ ~ {areaRange[1]}㎡
                                        </p>
                                    )
                                )}
                            </div>
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        취소
                    </Button>
                    <Button color="primary" onPress={handleSave} isDisabled={loading}>
                        {loading ? '저장 중...' : '저장'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
