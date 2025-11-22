'use client';

import { Icon } from '@iconify/react';
import { Spinner, Button, Card, CardBody } from '@heroui/react';
import { useState } from 'react';
import ChannelLinkModal from './ChannelLinkModal';

const channels = [
    { key: 'telegram', name: '텔레그램', icon: 'ic:baseline-telegram', color: 'bg-blue-500 text-white', ready: true },
    { key: 'discord', name: '디스코드', icon: 'ic:baseline-discord', color: 'bg-zinc-50', ready: false },
    { key: 'slack', name: '슬랙', icon: 'mdi:slack', color: 'bg-zinc-50', ready: false },
];

export default function NotificationChannels({
    telegramConnected,
    telegramLoading,
    handleTelegramConnect,
    onRefresh,
}: {
    telegramConnected: boolean | null;
    telegramLoading: boolean;
    handleTelegramConnect: () => void;
    onRefresh: () => void;
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

    const handleOpenModal = (key: string) => {
        setSelectedChannel(key);
        setIsModalOpen(true);
    };

    return (
        <div className="mx-2 md:mx-0">
            <Card className="shadow-md rounded-2xl">
                <CardBody className="flex flex-col gap-2 md:gap-4 py-3 md:py-6">
                    <div className="text-center text-lg font-semibold text-gray-800">알림 채널 관리</div>
                    <p className="text-gray-600 text-center text-xs">
                        새 매물 알림을 실시간으로 받기 위해 SNS 채널을 연동하세요.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-2 md:gap-3 px-2 md:px-4 mt-2">
                        {channels.map((ch) => (
                            <div
                                key={ch.key}
                                className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 hover:shadow-sm transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${ch.color} bg-opacity-10`}>
                                        <Icon
                                            className={`w-4 h-4 ${ch.color.replace('bg-', 'text-')}`}
                                            icon={ch.icon}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-800">{ch.name}</span>
                                </div>

                                <div>
                                    {ch.key === 'telegram' ? (
                                        telegramLoading ? (
                                            <Spinner size="sm" color="primary" />
                                        ) : telegramConnected ? (
                                            <div className="rounded-md bg-blue-500 text-white text-xs px-3 py-1.5 shadow-sm">
                                                연결 완료
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                color="primary"
                                                variant="flat"
                                                onPress={() => {
                                                    handleTelegramConnect();
                                                    handleOpenModal(ch.key);
                                                }}
                                            >
                                                연결하기
                                            </Button>
                                        )
                                    ) : (
                                        <div className="text-xs text-gray-400 italic">준비 중</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

            {/* ✅ 연동 확인 모달 */}
            <ChannelLinkModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                channelKey={selectedChannel}
                onSuccess={onRefresh}
            />
        </div>
    );
}
