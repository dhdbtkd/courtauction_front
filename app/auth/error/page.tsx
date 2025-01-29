'use client';

import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const errorMessages = {
        Configuration: '인증 설정에 문제가 있습니다.',
        AccessDenied: '접근이 거부되었습니다.',
        Verification: '인증 과정에 문제가 발생했습니다.',
        // 다른 에러 메시지들 추가 가능
    };

    const errorMessage = errorMessages[error as keyof typeof errorMessages] || '알 수 없는 오류가 발생했습니다.';

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500">로그인 실패</h1>
                <p className="mt-4">{errorMessage}</p>
                <button
                    onClick={() => (window.location.href = '/signin')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    다시 로그인하기
                </button>
            </div>
        </div>
    );
}
