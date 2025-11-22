'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from '@heroui/react';
import { toast } from 'react-toastify';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    channelKey: string | null;
    onSuccess: () => void;
};

export default function ChannelLinkModal({ isOpen, onClose, channelKey, onSuccess }: Props) {
    const [checking, setChecking] = useState(false);
    const [linked, setLinked] = useState<boolean | null>(null);

    // ✅ 서버에서 채널 상태 다시 조회
    const handleCheckStatus = async () => {
        if (!channelKey) return;
        setChecking(true);
        try {
            const res = await fetch('/api/notification/channels');
            const data = await res.json();
            const target = data.find((ch: any) => ch.type === channelKey && ch.enabled);
            if (target) {
                toast.success(`${target.type} 연동이 완료되었습니다!`);
                setLinked(true);
                onSuccess();
                setTimeout(() => onClose(), 1000);
            } else {
                toast.warning('아직 연동되지 않았습니다. 다시 시도해주세요.');
                setLinked(false);
            }
        } catch {
            toast.error('연동 상태를 확인하지 못했습니다.');
            setLinked(false);
        } finally {
            setChecking(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="md" backdrop="blur">
            <ModalContent>
                <ModalHeader>{channelKey?.toUpperCase()} 연동 확인</ModalHeader>
                <ModalBody className="space-y-3">
                    <p className="text-gray-700 text-sm">
                        {channelKey === 'telegram'
                            ? '텔레그램 앱에서 봇을 시작하신 후 아래 "연동 확인" 버튼을 눌러주세요.'
                            : '채널 연동을 완료하셨다면 연동 상태를 확인할 수 있습니다.'}
                    </p>

                    {checking ? (
                        <div className="flex items-center justify-center py-6">
                            <Spinner color="primary" />
                        </div>
                    ) : linked === true ? (
                        <p className="text-green-600 text-center font-semibold py-4">
                            {channelKey} 연동이 성공적으로 완료되었습니다.
                        </p>
                    ) : linked === false ? (
                        <p className="text-red-500 text-center font-medium py-4">
                            ⚠️ 아직 연동되지 않았습니다. 다시 시도해주세요.
                        </p>
                    ) : null}
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        닫기
                    </Button>
                    <Button color="primary" onPress={handleCheckStatus} isDisabled={checking}>
                        {checking ? '확인 중...' : '연동 확인'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
