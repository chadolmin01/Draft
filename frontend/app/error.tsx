'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 에러 추적 서비스로 전송)
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <div className="text-8xl mb-6">⚠️</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          문제가 발생했습니다
        </h2>
        <p className="text-gray-600 mb-2">
          {error.message || '예상치 못한 오류가 발생했습니다.'}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-500 mb-6">Error ID: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center mt-8">
          <Button onClick={reset} size="lg">
            다시 시도
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
            size="lg"
          >
            홈으로 가기
          </Button>
        </div>
      </div>
    </div>
  );
}
