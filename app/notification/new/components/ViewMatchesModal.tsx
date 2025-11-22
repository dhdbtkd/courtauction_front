'use client';

import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Spinner, ModalContent } from '@heroui/react';
import { useEffect, useState } from 'react';
import AuctionMatchCard from '@/components/AuctionCard';

type ViewMatchesModalProps = {
    ruleId: string | null;
    isOpen: boolean;
    onClose: () => void;
};

type MatchLog = {
    id: string;
    auction: any; // or Auction 타입으로 교체 가능
    message?: string;
    sent_at?: string;
};

export default function ViewMatchesModal({ ruleId, isOpen, onClose }: ViewMatchesModalProps) {
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState<MatchLog[]>([]);

    const fetchMatches = async () => {
        if (!ruleId) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/notification/${ruleId}/matches`);
            const data = await res.json();

            setMatches(data);
            console.log('🚀 ~ fetchMatches ~ data:', data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchMatches();
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader>매칭된 매물</ModalHeader>
                <ModalBody>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Spinner size="lg" />
                        </div>
                    ) : matches.length === 0 ? (
                        <p className="text-center text-gray-500 py-6">매칭된 매물이 없습니다.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {matches.map((log) => (
                                <AuctionMatchCard key={log.id} auction={log.auction} />
                            ))}
                        </div>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button color="primary" onPress={onClose}>
                        닫기
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
