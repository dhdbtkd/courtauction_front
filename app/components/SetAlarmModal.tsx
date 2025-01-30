import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
}

const SetAlarmModal = ({ isOpen, closeModal }: ModalProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    //모달 열기
    if (isOpen && dialogRef.current) {
        dialogRef.current.showModal();
    } else if (!isOpen && dialogRef.current) {
        dialogRef.current?.close();
    }

    useEffect(() => {
        console.log('modal');
    }, []);
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={closeModal} // 모달 바깥 클릭 시 닫기
                    />
                    <motion.dialog
                        ref={dialogRef}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed inset-0 flex items-center justify-center rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <motion.div className="bg-white p-6 rounded-lg shadow-lg w-[400px] ">
                            <h2 className="text-xl mb-2 font-bold text-zinc-900">알림 설정</h2>
                            <div className="text-sm mb-6 text-zinc-800">원하는 지역의 새 매물 알림을 받아보세요</div>
                            <button
                                onClick={() => {
                                    closeModal();
                                }}
                            >
                                닫기
                            </button>
                        </motion.div>
                    </motion.dialog>
                </>
            )}
        </AnimatePresence>
    );
};

export default SetAlarmModal;
