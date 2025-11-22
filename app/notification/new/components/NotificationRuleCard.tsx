'use client';

import { Card, CardHeader, CardBody, Button, Tooltip } from '@heroui/react';
import { Trash2, Pencil, Pause, Play, MapPin, Home, DollarSign, CalendarDays, Ruler, Hash } from 'lucide-react';
import { NotificationRule, Sido, Sigu } from '@/types/notification';

type Props = {
    rule: NotificationRule;
    sidos: Sido[];
    siguList: Sigu[];
    onToggle: (id: string, enabled: boolean) => void;
    onDelete: (id: string) => void;
    onEdit: (rule: NotificationRule) => void;
    onView?: (id: string) => void;
};

export default function NotificationRuleCard({ rule, sidos, siguList, onToggle, onDelete, onEdit, onView }: Props) {
    const sidoName = sidos.find((s) => s.sido_code === rule.sido_code)?.sido_name || '';
    const siguName = siguList.find((s) => s.sigu_code === rule.sigu_code)?.sigu_name || '';
    const location = [sidoName, siguName].filter(Boolean).join(' ');

    const formatPrice = (p: number | null) => {
        if (p === null || p === 0) return '0';
        // p는 만원 단위이므로 10,000으로 나누면 억 단위
        const eok = p / 100000000;
        if (eok >= 1) {
            return `${eok.toFixed(1).replace(/\.0$/, '')}억`;
        }
        // 1억 미만일 경우 그냥 만원 단위로 표시
        return `${p.toLocaleString()}만`;
    };

    const priceText =
        rule.price_min || rule.price_max
            ? `${formatPrice(rule.price_min) || '0'} ~ ${formatPrice(rule.price_max) || '무제한'}`
            : '무관';

    const areaText =
        rule.area_min || rule.area_max ? `${rule.area_min ?? 0}㎡ ~ ${rule.area_max ?? '무제한'}㎡` : '무관';

    return (
        <Card className="border border-gray-200 rounded-2xl p-2 hover:shadow-md transition-all duration-200 shadow-none">
            <CardHeader className="flex justify-between items-start px-1.5 md:px-3 pt-2 md:pt-3 pb-1 md:pb-2">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{rule.name}</span>
                        <span
                            className={`px-2 py-[2px] rounded-full text-xs font-medium ${
                                rule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                            }`}
                        >
                            {rule.enabled ? '활성' : '비활성'}
                        </span>
                    </div>
                </div>

                {/* 우측 아이콘들 */}
                <div className="flex items-center gap-1">
                    <Tooltip content="수정">
                        <Button isIconOnly variant="light" size="sm" onPress={() => onEdit(rule)}>
                            <Pencil className="w-4 h-4 text-gray-600" />
                        </Button>
                    </Tooltip>

                    <Tooltip content={rule.enabled ? '일시정지' : '재시작'}>
                        <Button isIconOnly variant="light" size="sm" onPress={() => onToggle(rule.id, !rule.enabled)}>
                            {rule.enabled ? (
                                <Pause className="w-4 h-4 text-gray-600" />
                            ) : (
                                <Play className="w-4 h-4 text-gray-600" />
                            )}
                        </Button>
                    </Tooltip>

                    <Tooltip content="삭제" color="danger">
                        <Button isIconOnly variant="light" onPress={() => onDelete(rule.id)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                    </Tooltip>
                </div>
            </CardHeader>

            <CardBody className="px-1.5 md:px-3 pb-1.5 md:pb-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-y-1 md:gap-y-2 gap-x-2 md:gap-x-4 text-xs">
                <Info icon={<MapPin size={14} />} label="지역" value={location || '전체'} />
                <Info icon={<Home size={14} />} label="유형" value={rule.category || '전체'} />
                <Info icon={<DollarSign size={14} />} label="가격" value={priceText} />
                <Info icon={<Ruler size={14} />} label="면적" value={areaText} />
                <Info
                    icon={<CalendarDays size={14} />}
                    label="등록일"
                    value={new Date(rule.created_at).toLocaleDateString('ko-KR')}
                />

                {rule.keyword && (
                    <div>
                        <Info icon={<Hash size={14} />} label="키워드" value={rule.keyword} />
                    </div>
                )}
            </CardBody>

            {onView && (
                <div className="flex justify-end px-3 pb-3">
                    <Button color="primary" size="sm" variant="flat" onPress={() => onView(rule.id)}>
                        매물 보기
                    </Button>
                </div>
            )}
        </Card>
    );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label?: string; value: string }) {
    return (
        <div className="flex items-center gap-2 text-xs text-gray-800">
            <span className="text-gray-500 flex items-center gap-1">
                {icon}
                {label && <span className="text-gray-600">{label}</span>}
            </span>
            <span className="truncate"> : {value}</span>
        </div>
    );
}
