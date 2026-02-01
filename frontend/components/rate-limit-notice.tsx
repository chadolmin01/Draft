/**
 * Rate Limit 안내 컴포넌트
 * API 할당량 초과 시 표시
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface RateLimitNoticeProps {
  retryAfter?: number; // 초 단위
  onRetry?: () => void;
  message?: string;
}

export function RateLimitNotice({ retryAfter, onRetry, message }: RateLimitNoticeProps) {
  const [countdown, setCountdown] = useState(retryAfter || 0);
  const [canRetry, setCanRetry] = useState(!retryAfter || retryAfter === 0);

  useEffect(() => {
    if (!retryAfter || retryAfter === 0) {
      setCanRetry(true);
      return;
    }

    setCountdown(retryAfter);
    setCanRetry(false);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanRetry(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [retryAfter]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}초`;
    }
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs}초`;
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-3xl">⏳</div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1">
              API 호출 한도 초과
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {message || '무료 티어는 하루 20개 요청으로 제한됩니다.'}
            </p>
          </div>

          {!canRetry && countdown > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                <div className="flex-1">
                  <div className="text-xs font-medium mb-1">자동 재시도까지</div>
                  <div className="w-full h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 dark:bg-amber-600 transition-all duration-1000"
                      style={{
                        width: `${100 - (countdown / (retryAfter || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex-shrink-0 font-mono font-bold text-lg">
                  {formatTime(countdown)}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                💡 잠시 후 다시 시도하거나, 내일 다시 방문해주세요.
              </p>
              {onRetry && (
                <Button
                  onClick={onRetry}
                  disabled={!canRetry}
                  variant="outline"
                  size="sm"
                  className="border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                >
                  {canRetry ? '🔄 다시 시도' : `${formatTime(countdown)} 후 재시도`}
                </Button>
              )}
            </div>
          )}

          <div className="text-xs text-amber-600 dark:text-amber-400 border-t border-amber-200 dark:border-amber-800 pt-3 space-y-1">
            <div className="font-semibold">해결 방법:</div>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>잠시 후 다시 시도 (자동 재시도됨)</li>
              <li>내일 다시 방문 (24시간 후 초기화)</li>
              <li>유료 플랜 업그레이드 시 무제한 사용 가능</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
