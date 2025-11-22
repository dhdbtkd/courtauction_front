'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Select, SelectItem, Slider, Checkbox } from '@heroui/react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

export default function AlertCreator({
    sidos,
    siguList,
    onSubmit,
    loading,
}: {
    sidos: any[];
    siguList: any[];
    onSubmit: (body: any) => void;
    loading: boolean;
}) {
    const [open, setOpen] = useState(false);

    const [name, setName] = useState('');
    const [keyword, setKeyword] = useState('');
    const [selectedSido, setSelectedSido] = useState<string | null>(null);
    const [selectedSigu, setSelectedSigu] = useState<string | null>(null);
    const [category, setCategory] = useState('전체');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
    const [areaRange, setAreaRange] = useState<[number, number]>([0, 300]);
    const [noPriceLimit, setNoPriceLimit] = useState(true);
    const [noAreaLimit, setNoAreaLimit] = useState(true);

    const filteredSigus = siguList.filter((s) => s.sido_code === selectedSido);
    const sortedSigus = [...filteredSigus].sort((a, b) => a.sigu_name.localeCompare(b.sigu_name, 'ko-KR'));

    const formatPrice = (v: number) => {
        if (v >= 10000) return `${(v / 10000).toFixed(1).replace('.0', '')}억`;
        return `${v.toLocaleString()}만원`;
    };

    const handleSubmit = () => {
        if (!name || !selectedSido || !selectedSigu) return;
        onSubmit({
            name,
            category: category === '전체' ? null : category,
            sido_code: selectedSido,
            sigu_code: selectedSigu,
            keyword: keyword || null,
            price_min: noPriceLimit ? null : priceRange[0] * 10000,
            price_max: noPriceLimit ? null : priceRange[1] * 10000,
            area_min: noAreaLimit ? null : areaRange[0],
            area_max: noAreaLimit ? null : areaRange[1],
        });
        setOpen(false);
    };

    return (
        <div className="mx-2 md:mx-0">
            <Card className="rounded-2xl shadow-sm ">
                <CardHeader className="flex justify-between items-center ">
                    <h2 className="font-semibold text-base md:text-lg">알림 만들기</h2>
                    <Button
                        color="primary"
                        variant="solid"
                        onPress={() => setOpen((p) => !p)}
                        className="flex items-center gap-1"
                    >
                        <Plus size={16} />
                        알림 추가
                        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </Button>
                </CardHeader>
                <AnimatePresence initial={false}>
                    {open && (
                        <motion.div
                            key="alert-form"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                        >
                            <CardBody className="flex flex-col gap-3 md:gap-6 overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                                    <Input
                                        label="알림 이름"
                                        placeholder="e.g., 강남 아파트 알림"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        size="sm"
                                    />
                                    <Input
                                        label="아파트 이름"
                                        placeholder="예: 래미안, 아크로"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        size="sm"
                                    />
                                    <Select
                                        label="시/도"
                                        selectedKeys={selectedSido ? new Set([selectedSido]) : new Set()}
                                        onSelectionChange={(keys) => {
                                            const v = Array.from(keys)[0];
                                            setSelectedSido(v ? String(v) : null);
                                        }}
                                        items={sidos}
                                        size="sm"
                                    >
                                        {(item) => <SelectItem key={item.sido_code}>{item.sido_name}</SelectItem>}
                                    </Select>
                                    <Select
                                        label="구/군"
                                        selectedKeys={selectedSigu ? new Set([selectedSigu]) : new Set()}
                                        onSelectionChange={(keys) => {
                                            const v = Array.from(keys)[0];
                                            setSelectedSigu(v ? String(v) : null);
                                        }}
                                        items={sortedSigus}
                                        isDisabled={!selectedSido}
                                        size="sm"
                                    >
                                        {(item) => <SelectItem key={item.sigu_code}>{item.sigu_name}</SelectItem>}
                                    </Select>
                                </div>
                                {/* 가격 */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-700">가격 범위</label>
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
                                        maxValue={200000}
                                        value={priceRange}
                                        onChange={(v) => setPriceRange(v as [number, number])}
                                        isDisabled={noPriceLimit}
                                        size="sm"
                                    />
                                    {!noPriceLimit && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {formatPrice(priceRange[0])} ~ {formatPrice(priceRange[1])}
                                        </p>
                                    )}
                                </div>
                                {/* 면적 */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-700">면적 범위 (㎡)</label>
                                        <Checkbox
                                            isSelected={noAreaLimit}
                                            onChange={(e) => setNoAreaLimit(e.target.checked)}
                                            color="primary"
                                            size="sm"
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
                                        size="sm"
                                    />
                                    {!noAreaLimit && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {areaRange[0]}㎡ ~ {areaRange[1]}㎡
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button variant="light" onPress={() => setOpen(false)}>
                                        닫기
                                    </Button>
                                    <Button color="primary" onPress={handleSubmit} isDisabled={loading}>
                                        {loading ? '저장 중...' : '저장'}
                                    </Button>
                                </div>
                            </CardBody>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
}
