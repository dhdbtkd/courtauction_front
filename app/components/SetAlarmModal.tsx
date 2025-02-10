import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CiTrash } from 'react-icons/ci';
import { Regions } from '../page';

interface ModalProps {
    regions: Regions | null;
    isOpen: boolean;
    closeModal: () => void;
}

const SetAlarmModal = ({ isOpen, closeModal, regions }: ModalProps) => {
    const [selectedSidoCode, setSelectedSidoCode] = useState<number | null>(null);

    const dialogRef = useRef<HTMLDialogElement>(null);

    //모달 열기
    if (isOpen && dialogRef.current) {
        dialogRef.current.showModal();
    } else if (!isOpen && dialogRef.current) {
        dialogRef.current?.close();
    }
    const handleSidoSelect = (e: any) => {
        setSelectedSidoCode(e.target.value);
        console.log('🚀 ~ handleSidoSelect ~ e.target.value:', e.target.value);
    };
    useEffect(() => {
        console.log('modal');
        console.log(regions);
    }, []);
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer z-10"
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
                        className="fixed inset-0 flex items-center justify-center rounded-xl z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <motion.div className="bg-white p-6 rounded-lg shadow-lg w-[400px] ">
                            <h2 className="text-xl mb-2 font-bold text-zinc-900">알림 설정</h2>
                            <div className="text-sm mb-6 text-zinc-800">관심 지역의 매물 알림을 받아보세요</div>
                            <div className="flex items-center gap-2 my-4 text-sm border-b border-zinc-200 pb-3">
                                <ul>
                                    <li className="grid grid-cols-3 items-center gap-2">
                                        <div>부산시</div>
                                        <div>해운대구</div>
                                        <button className="flex items-center gap-1">
                                            <CiTrash className="text-xl" />
                                            삭제
                                        </button>
                                    </li>
                                    <li className="grid grid-cols-3 items-center gap-2">
                                        <div>부산시</div>
                                        <div>동래구</div>
                                        <button className="flex items-center gap-1">
                                            <CiTrash className="text-xl" />
                                            삭제
                                        </button>
                                    </li>
                                    <li className="grid grid-cols-3 items-center gap-2">
                                        <div>경상남도</div>
                                        <div>양산시</div>
                                        <button className="flex items-center gap-1">
                                            <CiTrash className="text-xl" />
                                            삭제
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div className="text-sm mb-1">관심 지역 추가</div>
                            <form action="" className="flex gap-2 mb-4">
                                <select
                                    id="countries"
                                    defaultValue={'시도'}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                                    onChange={handleSidoSelect}
                                >
                                    <option>시도</option>
                                    {regions?.sido
                                        ? regions?.sido.map((sido) => {
                                              return (
                                                  <option key={sido.sido_code} value={sido.sido_code}>
                                                      {sido.sido_name}
                                                  </option>
                                              );
                                          })
                                        : ''}
                                </select>
                                <select
                                    id="countries"
                                    defaultValue={'군구'}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                                >
                                    <option>군구</option>
                                    {regions?.sigu
                                        ? regions?.sigu
                                              .filter((sigu) => sigu['sido_code'] == selectedSidoCode)
                                              .map((sigu) => {
                                                  return (
                                                      <option key={sigu.sigu_code} value={sigu.sigu_name}>
                                                          {sigu.sigu_name}
                                                      </option>
                                                  );
                                              })
                                        : ''}
                                </select>
                            </form>
                            <div className="flex justify-end items-center gap-2">
                                <button className="flex items-center justify-center px-4 py-1.5 rounded-lg bg-blue-600 text-white duration-300 hover:bg-blue-800">
                                    추가
                                </button>
                                <button
                                    className="flex items-center justify-center px-4 py-1.5 rounded-lg bg-zinc-600 text-white duration-300 hover:bg-zinc-800"
                                    onClick={() => {
                                        closeModal();
                                    }}
                                >
                                    닫기
                                </button>
                            </div>
                        </motion.div>
                    </motion.dialog>
                </>
            )}
        </AnimatePresence>
    );
};

export default SetAlarmModal;
