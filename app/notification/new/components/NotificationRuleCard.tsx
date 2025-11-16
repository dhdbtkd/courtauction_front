'use client';

import { Card, CardHeader, CardBody, Button } from '@heroui/react';
import { Trash2 } from 'lucide-react';
import { NotificationRule, Sido, Sigu } from '../types/notification';

type RuleCardProps = {
    rule: NotificationRule;
    sidos: Sido[];
    siguList: Sigu[];
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
};

export default function NotificationRuleCard({ rule, sidos, siguList, onToggle, onDelete }: RuleCardProps) {
    const sidoName = sidos.find((s) => s.sido_code === rule.sido_code)?.sido_name || '';
    const siguName = siguList.find((s) => s.sigu_code === rule.sigu_code)?.sigu_name || '';
    const location = [sidoName, siguName].filter(Boolean).join(' ');

    const formatPrice = (price: number | null) => {
        if (price === null) return '';
        const eok = price / 100_000_000;
        return `${eok}억`;
    };

    const priceText =
        rule.price_min || rule.price_max
            ? `${formatPrice(rule.price_min) || '0억'} ~ ${formatPrice(rule.price_max) || '최대'}`
            : '가격 무관';

    return (
        <Card className="shadow-md rounded-2xl">
            <CardHeader className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{rule.name}</span>
                    <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {rule.enabled ? '활성' : '비활성'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onToggle(rule.id)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            rule.enabled ? 'bg-primary' : 'bg-gray-200'
                        }`}
                        role="switch"
                        aria-checked={rule.enabled}
                    >
                        <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                rule.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                    </button>
                    <Button
                        variant="ghost"
                        color="danger"
                        size="sm"
                        isIconOnly
                        onPress={() => onDelete(rule.id)}
                        aria-label="삭제"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardBody className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <span className="text-gray-500">지역: </span>
                    <span className="text-gray-800">{location || 'N/A'}</span>
                </div>
                <div>
                    <span className="text-gray-500">유형: </span>
                    <span className="text-gray-800">{rule.category || '전체'}</span>
                </div>
                <div>
                    <span className="text-gray-500">가격: </span>
                    <span className="text-gray-800">{priceText}</span>
                </div>
                <div>
                    <span className="text-gray-500">등록일: </span>
                    <span className="text-gray-800">{new Date(rule.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
                {rule.keyword && (
                    <div className="col-span-2 md:col-span-4">
                        <span className="text-gray-500">키워드: </span>
                        <span className="text-gray-800">{rule.keyword}</span>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
